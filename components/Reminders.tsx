"use client";

import { useEffect, useState } from "react";
import { REMINDER_HOUR, REMINDER_MINUTE, type Member } from "@/lib/config";
import { disableReminders, enableReminders, getPushState, sendTestReminder, type PushState } from "@/lib/push";
import { formatHour } from "@/lib/time";

export function Reminders({ member }: { member: Member }) {
  const [state, setState] = useState<PushState | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getPushState()
      .then((s) => alive && setState(s))
      .catch(() => alive && setState("unsupported"));
    return () => {
      alive = false;
    };
  }, []);

  async function run(fn: () => Promise<PushState | void>, okNote?: string) {
    setBusy(true);
    setNote(null);
    try {
      const next = await fn();
      if (next) setState(next);
      if (okNote) setNote(okNote);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const when = formatHour(REMINDER_HOUR, REMINDER_MINUTE);

  return (
    <section className="card p-4 flex flex-col gap-2">
      <h2 className="font-display text-lg">Daily reminder</h2>
      {state === "loading" && <p className="text-sm text-muted">Checking this device…</p>}
      {state === "needs-install" && (
        <p className="text-sm text-muted">
          To get a {when} reminder on this iPhone or iPad, first add the app to your Home Screen: tap the Share button in
          Safari, then <strong className="text-cream">Add to Home Screen</strong>, and open it from there.
        </p>
      )}
      {state === "unsupported" && <p className="text-sm text-muted">This browser can&rsquo;t receive reminders.</p>}
      {state === "denied" && (
        <p className="text-sm text-muted">
          Notifications are blocked for this app. Turn them on in Settings &rarr; Notifications &rarr; Check-In.
        </p>
      )}
      {state === "off" && (
        <>
          <p className="text-sm text-muted">
            Get a nudge at {when} if {member.name} hasn&rsquo;t checked in yet.
          </p>
          <button
            className="tap rounded-xl bg-gold text-navy-900 font-display text-lg py-3 disabled:opacity-60"
            disabled={busy}
            onClick={() => run(() => enableReminders(member.id), `Reminders on for ${member.name}.`)}
          >
            Remind me at {when}
          </button>
        </>
      )}
      {state === "on" && (
        <>
          <p className="text-sm text-muted">This device gets a {when} reminder when {member.name} hasn&rsquo;t checked in.</p>
          <div className="flex gap-2">
            <button
              className="tap flex-1 rounded-xl bg-white/10 font-bold py-2 disabled:opacity-60"
              disabled={busy}
              onClick={() => run(() => sendTestReminder(member.id), "Test sent. It may take a few seconds.")}
            >
              Send a test
            </button>
            <button
              className="tap flex-1 rounded-xl bg-white/10 font-bold py-2 disabled:opacity-60"
              disabled={busy}
              onClick={() => run(() => disableReminders(), "Reminders turned off on this device.")}
            >
              Turn off
            </button>
          </div>
        </>
      )}
      {note && <p className="text-sm text-yellow">{note}</p>}
    </section>
  );
}
