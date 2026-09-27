"use client";

import { supabase } from "./supabase";

export type PushState = "unsupported" | "needs-install" | "denied" | "off" | "on";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
}

/** Where this device stands with reminders. */
export async function getPushState(): Promise<PushState> {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return isIOS() && !isStandalone() ? "needs-install" : "unsupported";
  }
  if (isIOS() && !isStandalone()) return "needs-install";
  if (Notification.permission === "denied") return "denied";
  const reg = await registration();
  const sub = await reg.pushManager.getSubscription();
  return sub ? "on" : "off";
}

/** Ask permission and register this device for a member's daily reminder. */
export async function enableReminders(memberId: string): Promise<PushState> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) throw new Error("Reminders are not configured yet (missing VAPID key).");
  const reg = await registration();
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToUint8Array(key) }));
  const json = sub.toJSON();
  const { error } = await supabase()
    .from("push_subscriptions")
    .upsert(
      {
        member_id: memberId,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
        user_agent: navigator.userAgent.slice(0, 200),
      },
      { onConflict: "endpoint" },
    );
  if (error) throw error;
  return "on";
}

/** Stop reminders on this device. */
export async function disableReminders(): Promise<PushState> {
  const reg = await registration();
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await supabase().from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
  return "off";
}

/** Send a test notification to this device only. */
export async function sendTestReminder(memberId: string): Promise<void> {
  const reg = await registration();
  const sub = await reg.pushManager.getSubscription();
  if (!sub) throw new Error("Turn reminders on first.");
  const json = sub.toJSON();
  const res = await fetch("/api/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      test: true,
      subscriptions: [{ member_id: memberId, endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }],
    }),
  });
  if (!res.ok) throw new Error(`Test failed (${res.status})`);
}
