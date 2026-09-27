import webpush from "web-push";
import { categoryForDay } from "@/lib/categories";
import { memberById } from "@/lib/config";
import { dayKey } from "@/lib/time";

type Sub = { member_id: string; endpoint: string; p256dh: string; auth: string };

/**
 * Sends the daily reminder pushes.
 * Called by the Supabase cron job (with the shared secret) with the list of
 * subscribed family members who have not checked in yet, or by a phone asking
 * for a test notification to itself.
 */
export async function POST(req: Request) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:todd@insmgt.com";
  if (!publicKey || !privateKey) {
    return Response.json({ error: "VAPID keys are not configured" }, { status: 500 });
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  let body: { test?: boolean; day?: string; subscriptions?: Sub[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }

  const isTest = body.test === true;
  const secret = process.env.REMINDER_SECRET;
  if (!isTest) {
    if (!secret || req.headers.get("x-reminder-secret") !== secret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (!Array.isArray(body.subscriptions) || body.subscriptions.length !== 1) {
    return Response.json({ error: "A test sends to exactly one device" }, { status: 400 });
  }

  const subs = (body.subscriptions ?? []).filter((s) => s && s.endpoint && s.p256dh && s.auth);
  const day = body.day ?? dayKey();
  const category = categoryForDay(day);

  let sent = 0;
  let failed = 0;
  const stale: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      const name = memberById(s.member_id)?.name ?? "there";
      const payload = JSON.stringify({
        title: isTest ? `Test: hey ${name}!` : `Hey ${name}, time to check in!`,
        body: `Today's category is ${category.name}. One tap and you're done.`,
        url: "/",
      });
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 * 60 * 3, urgency: "normal" },
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) stale.push(s.endpoint);
      }
    }),
  );

  return Response.json({ day, category: category.id, sent, failed, stale });
}
