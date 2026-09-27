"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { DailyCards } from "@/components/DailyCards";
import { Reminders } from "@/components/Reminders";
import { categoryForDay, levelFor, LevelIcon, moodColor, type Level } from "@/lib/categories";
import { saveCheckin, streakFor, type Checkin } from "@/lib/checkins";
import { APP_NAME, FAMILY, memberById, type Member } from "@/lib/config";
import { useCheckins, useNow, useRememberedMember } from "@/lib/hooks";
import { prettyDay, shiftDayKey, shortWeekday } from "@/lib/time";

export function CheckIn() {
  const now = useNow(15_000);
  const { byMember, today, loading, error, refresh } = useCheckins();
  const [memberId, remember] = useRememberedMember();
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<{ day: string; levelId: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const category = categoryForDay(today);
  const member = memberId ? memberById(memberId) : undefined;
  const mine = member ? byMember.get(member.id) ?? [] : [];
  const todayRow = mine.find((r) => r.day === today);
  const currentLevelId = optimistic?.day === today ? optimistic.levelId : todayRow?.level_id;
  const currentLevel = currentLevelId ? category.levels.find((l) => l.id === currentLevelId) : undefined;

  function choose(m: Member) {
    remember(m.id);
    setOptimistic(null);
  }

  async function pick(level: Level) {
    if (!member) return;
    setSaving(level.id);
    setSaveError(null);
    setOptimistic({ day: today, levelId: level.id });
    try {
      await saveCheckin(member.id, category.id, level.id, level.score);
      setToast(todayRow ? "Updated!" : "Locked in!");
      await refresh();
    } catch (e) {
      setOptimistic(null);
      setSaveError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-6 safe-bottom flex flex-col gap-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl leading-none shimmer">{APP_NAME}</h1>
          <p className="text-muted text-sm mt-1">{prettyDay(today)}</p>
        </div>
        {member && (
          <button
            className="tap text-sm text-muted underline underline-offset-4"
            onClick={() => remember(null)}
          >
            Not {member.name}?
          </button>
        )}
      </header>

      {error && (
        <div className="card p-3 text-sm text-red border-red/40">
          Can&rsquo;t reach the family board right now. {error}
        </div>
      )}

      {!member ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">Who&rsquo;s checking in?</h2>
          <div className="grid grid-cols-2 gap-3">
            {FAMILY.map((m, i) => {
              const rows = byMember.get(m.id) ?? [];
              const lastOdd = i === FAMILY.length - 1 && FAMILY.length % 2 === 1;
              const row = rows.find((r) => r.day === today);
              const streak = streakFor(rows, today);
              return (
                <button
                  key={m.id}
                  onClick={() => choose(m)}
                  className={`tap card p-4 flex flex-col items-center gap-2 text-center ${lastOdd ? "col-span-2" : ""}`}
                  style={{ borderColor: `${m.color}55` }}
                >
                  <div className="relative">
                    <Avatar member={m} size={64} />
                    {row && (
                      <div className="absolute -right-2 -bottom-2 rounded-full bg-navy-900 p-0.5">
                        <LevelIcon categoryId={row.category_id} levelId={row.level_id} size={30} />
                      </div>
                    )}
                  </div>
                  <div className="font-display text-xl">{m.name}</div>
                  <div className="text-xs text-muted">
                    {row ? "Checked in" : "Not yet today"}
                    {streak > 1 && <span className="ml-1 text-gold font-bold">· {streak} day streak</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <>
          <section className="card p-4 flex flex-col gap-4" style={{ borderColor: `${member.color}66` }}>
            <div className="flex items-center gap-3">
              <Avatar member={member} size={52} />
              <div className="min-w-0">
                <div className="font-display text-2xl leading-tight">Hey {member.name}!</div>
                <div className="text-sm text-muted">
                  {currentLevel ? "You're checked in. Tap another to change it." : category.prompt}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted">Today&rsquo;s category</span>
              <span className="font-display text-lg text-gold">{category.name}</span>
            </div>

            <div className={`grid gap-3 ${category.levels.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {category.levels.map((level, i) => {
                const selected = currentLevelId === level.id;
                const lastOdd = category.levels.length !== 3 && i === category.levels.length - 1 && category.levels.length % 2 === 1;
                return (
                  <button
                    key={level.id}
                    onClick={() => pick(level)}
                    disabled={saving !== null}
                    className={`tap rounded-2xl p-3 flex flex-col items-center gap-2 border-2 ${
                      selected ? "bg-white/12" : "bg-white/4 border-white/10"
                    } ${saving && saving !== level.id ? "opacity-60" : ""} ${lastOdd ? "col-span-2" : ""}`}
                    style={selected ? { borderColor: level.color, boxShadow: `0 0 0 4px ${level.color}33` } : undefined}
                    aria-pressed={selected}
                  >
                    <div className={selected ? "pop" : ""}>
                      <LevelIcon categoryId={category.id} levelId={level.id} size={72} />
                    </div>
                    <div className="font-display text-base text-center leading-tight">{level.label}</div>
                  </button>
                );
              })}
            </div>

            {currentLevel && (
              <div
                className="pop rounded-xl px-3 py-2 text-center font-bold"
                style={{ background: `${currentLevel.color}22`, color: currentLevel.color }}
              >
                {member.name}: {currentLevel.tagline}
              </div>
            )}
            {saveError && <div className="text-sm text-red">{saveError}</div>}
          </section>

          <WeekStrip rows={mine} today={today} member={member} />
        </>
      )}

      <FamilyToday byMember={byMember} today={today} loading={loading} />

      <DailyCards day={today} now={now} variant="phone" />

      {member && <Reminders member={member} />}

      <footer className="text-center text-xs text-muted pb-4">
        <a href="/tv" className="underline underline-offset-4">
          Open the TV board
        </a>
      </footer>

      {toast && (
        <div className="pop fixed left-1/2 -translate-x-1/2 bottom-8 rounded-full bg-gold text-navy-900 font-display px-5 py-2 text-lg shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

function WeekStrip({ rows, today, member }: { rows: Checkin[]; today: string; member: Member }) {
  const streak = streakFor(rows, today);
  const days = Array.from({ length: 7 }, (_, i) => shiftDayKey(today, i - 6));
  return (
    <section className="card p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg">Your week</h2>
        <span className="text-sm">
          {streak > 0 ? (
            <>
              <span className="text-gold font-extrabold">{streak}</span>
              <span className="text-muted"> day streak</span>
            </>
          ) : (
            <span className="text-muted">Start a streak today</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const row = rows.find((r) => r.day === d);
          const lvl = row ? levelFor(row.category_id, row.level_id) : undefined;
          return (
            <div key={d} className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-full rounded-lg flex items-center justify-center"
                style={{
                  background: row ? `${moodColor(row.score)}22` : "rgba(255,255,255,0.04)",
                  outline: d === today ? `2px solid ${member.color}` : undefined,
                }}
                title={lvl ? `${prettyDay(d)}: ${lvl.tagline}` : `${prettyDay(d)}: no check-in`}
              >
                {row ? <LevelIcon categoryId={row.category_id} levelId={row.level_id} size={34} /> : <span className="text-muted">·</span>}
              </div>
              <div className="text-[10px] uppercase text-muted">{shortWeekday(d)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FamilyToday({ byMember, today, loading }: { byMember: Map<string, Checkin[]>; today: string; loading: boolean }) {
  const category = categoryForDay(today);
  return (
    <section className="card p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg">Family today</h2>
        <span className="text-xs text-muted">{category.name}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {FAMILY.map((m) => {
          const row = byMember.get(m.id)?.find((r) => r.day === today);
          const lvl = row ? levelFor(row.category_id, row.level_id) : undefined;
          return (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar member={m} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-bold">{m.name}</div>
                <div className="text-sm truncate" style={{ color: lvl ? lvl.color : "var(--muted)" }}>
                  {lvl ? lvl.tagline : loading ? "…" : "Hasn't checked in yet"}
                </div>
              </div>
              {row && <LevelIcon categoryId={row.category_id} levelId={row.level_id} size={44} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
