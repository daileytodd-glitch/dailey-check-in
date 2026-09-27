"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { DailyCards } from "@/components/DailyCards";
import { Reminders } from "@/components/Reminders";
import { categoryForDay, levelFor, LevelIcon, moodColor, type Level } from "@/lib/categories";
import { saveCheckin, streakFor, type Checkin } from "@/lib/checkins";
import { APP_NAME, FAMILY, memberById, type Member } from "@/lib/config";
import { useCheckins, useRememberedMember } from "@/lib/hooks";
import { prettyDay, shiftDayKey, shortWeekday } from "@/lib/time";

export function CheckIn() {
  const { byMember, today, loading, error, refresh } = useCheckins();
  const [memberId, remember] = useRememberedMember();
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<{ member: string; day: string; levelId: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const category = categoryForDay(today);
  const member = memberId ? memberById(memberId) : undefined;
  const mine = member ? byMember.get(member.id) ?? [] : [];
  const todayRow = mine.find((r) => r.day === today);
  const currentLevelId =
    optimistic && member && optimistic.member === member.id && optimistic.day === today ? optimistic.levelId : todayRow?.level_id;
  const currentLevel = currentLevelId ? category.levels.find((l) => l.id === currentLevelId) : undefined;

  async function pick(level: Level) {
    if (!member) return;
    setSaving(level.id);
    setSaveError(null);
    setOptimistic({ member: member.id, day: today, levelId: level.id });
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

  /** Back to the dashboard, ready for the next person. */
  function finish() {
    const name = member?.name;
    remember(null);
    setOptimistic(null);
    if (name) setToast(`Thanks, ${name}!`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const levelCols =
    category.levels.length === 3 ? "grid-cols-3" : category.levels.length === 5 ? "grid-cols-3 md:grid-cols-5" : "grid-cols-3 md:grid-cols-6";

  return (
    <main
      className="mx-auto w-full max-w-6xl px-4 pb-6 flex flex-col gap-4 md:gap-3"
      style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl leading-none shimmer">{APP_NAME}</h1>
          <p className="text-muted text-sm mt-1">{prettyDay(today)}</p>
        </div>
        <PersonSwitcher byMember={byMember} today={today} selected={member?.id ?? null} onSelect={(id) => { remember(id); setOptimistic(null); }} />
      </header>

      {error && (
        <div className="card p-3 text-sm text-red border-red/40">Can&rsquo;t reach the family board right now. {error}</div>
      )}

      {member ? (
        <section className="card p-4 md:p-5 flex flex-col gap-4" style={{ borderColor: `${member.color}66` }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar member={member} size={48} />
              <div className="min-w-0">
                <div className="font-display text-2xl leading-tight">Hey {member.name}!</div>
                <div className="text-sm text-muted">{currentLevel ? "You're checked in. Tap another to change it." : category.prompt}</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs uppercase tracking-widest text-muted">Today&rsquo;s category</span>
              <span className="font-display text-xl text-gold">{category.name}</span>
            </div>
          </div>

          <div className={`grid gap-2 md:gap-3 ${levelCols}`}>
            {category.levels.map((level) => {
              const selected = currentLevelId === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => pick(level)}
                  disabled={saving !== null}
                  className={`tap rounded-2xl p-2 md:p-3 flex flex-col items-center gap-2 border-2 ${
                    selected ? "bg-white/12" : "bg-white/4 border-white/10"
                  } ${saving && saving !== level.id ? "opacity-60" : ""}`}
                  style={selected ? { borderColor: level.color, boxShadow: `0 0 0 4px ${level.color}33` } : undefined}
                  aria-pressed={selected}
                >
                  <div className={selected ? "pop" : ""}>
                    <LevelIcon categoryId={category.id} levelId={level.id} size="clamp(56px, 8vw, 112px)" />
                  </div>
                  <div className="font-display text-sm md:text-base text-center leading-tight">{level.label}</div>
                </button>
              );
            })}
          </div>

          {/* Reads as a scale from great to rough when the levels sit in one row. */}
          <div className="hidden md:flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
            <span>Great day</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #34D399, #A3E635, #FACC15, #FB923C, #F87171, #C026D3)" }} />
            <span>Rough day</span>
          </div>

          {currentLevel ? (
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div
                className="pop flex-1 rounded-xl px-3 py-3 text-center font-bold flex items-center justify-center"
                style={{ background: `${currentLevel.color}22`, color: currentLevel.color }}
              >
                {member.name}: {currentLevel.tagline}
              </div>
              <button
                onClick={finish}
                disabled={saving !== null}
                className="tap rounded-xl bg-gold text-navy-900 font-display text-xl px-8 py-3 disabled:opacity-60"
              >
                Done
              </button>
            </div>
          ) : (
            <button onClick={finish} className="tap self-end text-sm text-muted underline underline-offset-4">
              Back to the dashboard
            </button>
          )}
          {saveError && <div className="text-sm text-red">{saveError}</div>}
        </section>
      ) : (
        <section className="card p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-2xl leading-tight">Tap your name to check in</div>
            <div className="text-sm text-muted">
              Today&rsquo;s category is <span className="text-gold font-bold">{category.name}</span>. {category.prompt}
            </div>
          </div>
          <div className="flex items-center gap-1" aria-hidden>
            {category.levels.map((level) => (
              <LevelIcon key={level.id} categoryId={category.id} levelId={level.id} size={40} />
            ))}
          </div>
        </section>
      )}

      <DailyCards day={today} variant="phone" />

      <FamilyToday byMember={byMember} today={today} loading={loading} />

      {member && (
        <div className="grid gap-4 md:grid-cols-2">
          <WeekStrip rows={mine} today={today} member={member} />
          <Reminders member={member} />
        </div>
      )}

      <footer className="text-center text-xs text-muted">
        <a href="/tv" className="underline underline-offset-4">Open the TV board</a>
      </footer>

      <div aria-live="polite" className="sr-only">{toast ?? ""}</div>
      {toast && (
        <div className="pop fixed left-1/2 -translate-x-1/2 bottom-8 rounded-full bg-gold text-navy-900 font-display px-5 py-2 text-lg shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

/** Always-visible row of family members. Tap to switch who is checking in. */
function PersonSwitcher({
  byMember,
  today,
  selected,
  onSelect,
}: {
  byMember: Map<string, Checkin[]>;
  today: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 md:gap-2" role="radiogroup" aria-label="Who is checking in">
      {FAMILY.map((m) => {
        const rows = byMember.get(m.id) ?? [];
        const row = rows.find((r) => r.day === today);
        const streak = streakFor(rows, today);
        const isSelected = selected === m.id;
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(m.id)}
            className={`tap rounded-2xl px-2 py-2 flex flex-col items-center gap-1 min-w-[62px] md:min-w-[76px] border-2 ${
              isSelected ? "bg-white/12" : "border-transparent"
            }`}
            style={isSelected ? { borderColor: m.color } : undefined}
            title={row ? "Checked in today" : "Not checked in yet"}
          >
            <div
              className="rounded-full p-[3px]"
              style={{ boxShadow: row ? `0 0 0 3px ${moodColor(row.score)}` : "0 0 0 3px rgba(255,255,255,0.08)" }}
            >
              <Avatar member={m} size={44} />
            </div>
            <div className="font-display text-sm md:text-base leading-none">{m.name}</div>
            <div className="text-[10px] leading-none" style={{ color: row ? moodColor(row.score) : "var(--muted)" }}>
              {row ? "done" : streak > 0 ? `${streak}-day streak` : "not yet"}
            </div>
          </button>
        );
      })}
    </div>
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
                  background: row ? `${moodColor(row.score)}33` : "rgba(255,255,255,0.04)",
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
    <section className="card p-4 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg">Family today</h2>
        <span className="text-xs text-muted">{category.name}</span>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3">
        {FAMILY.map((m) => {
          const row = byMember.get(m.id)?.find((r) => r.day === today);
          const lvl = row ? levelFor(row.category_id, row.level_id) : undefined;
          return (
            <li
              key={m.id}
              className="rounded-2xl bg-white/5 px-3 py-2 flex md:flex-col items-center md:text-center gap-3 md:gap-0.5"
              style={{ boxShadow: lvl ? `inset 0 0 0 2px ${lvl.color}55` : undefined }}
            >
              <Avatar member={m} size={36} />
              <div className="flex-1 md:flex-none min-w-0 md:order-3">
                <div className="font-bold leading-tight">{m.name}</div>
                <div className="text-sm truncate" style={{ color: lvl ? lvl.color : "var(--muted)" }}>
                  {lvl ? lvl.tagline : loading ? "…" : "Not yet"}
                </div>
              </div>
              <div className="md:order-2 h-12 flex items-center justify-center">
                {row ? (
                  <LevelIcon categoryId={row.category_id} levelId={row.level_id} size={48} />
                ) : (
                  <span className="text-muted text-2xl" aria-hidden>·</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
