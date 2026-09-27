"use client";

import { Avatar } from "@/components/Avatar";
import { DailyCards } from "@/components/DailyCards";
import { categoryForDay, levelFor, LevelIcon } from "@/lib/categories";
import { streakFor } from "@/lib/checkins";
import { APP_NAME, FAMILY } from "@/lib/config";
import { useCheckins, useNow } from "@/lib/hooks";
import { clockLabel, isNightDim, prettyDay } from "@/lib/time";

/** The TV board: today only, big and readable from the couch. */
export function Board() {
  const now = useNow(10_000);
  const { byMember, today, error } = useCheckins(45_000);
  const category = categoryForDay(today);
  const connected = !error;

  const checkedIn = FAMILY.map((m) => {
    const rows = byMember.get(m.id) ?? [];
    const row = rows.find((r) => r.day === today);
    return { member: m, row, level: row ? levelFor(row.category_id, row.level_id) : undefined, streak: streakFor(rows, today) };
  });
  const done = checkedIn.filter((c) => c.row && c.level);
  const waiting = checkedIn.filter((c) => !c.row);

  return (
    <div className={`tv-root ${isNightDim(now) ? "night-dim" : ""}`}>
      <div className="drift h-full w-full p-[2vw] grid grid-rows-[auto_1fr_auto] gap-[1.4vw]">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-[3.6vw] leading-none shimmer">{APP_NAME}</h1>
            <p className="text-muted text-[1.5vw] mt-[0.4vw]">{prettyDay(today)}</p>
          </div>
          <div className="text-right">
            <div className="text-[1.2vw] uppercase tracking-[0.2em] text-muted">Today&rsquo;s category</div>
            <div className="font-display text-[2.6vw] text-gold leading-none">{category.name}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-[3vw] leading-none">{clockLabel(now)}</div>
            <div className="text-[1.1vw] text-muted mt-[0.3vw]">
              {connected ? "Live" : "Reconnecting…"} · {done.length}/{FAMILY.length} checked in
            </div>
          </div>
        </header>

        <main className="min-h-0 flex flex-col gap-[1.2vw]">
          {done.length === 0 ? (
            <div className="card flex-1 flex flex-col items-center justify-center gap-[1vw] text-center">
              <div className="float">
                <LevelIcon categoryId={category.id} levelId={category.levels[0].id} size="14vw" />
              </div>
              <div className="font-display text-[3vw]">Nobody has checked in yet</div>
              <div className="text-[1.6vw] text-muted">{category.prompt}</div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex gap-[1.2vw] items-stretch">
              {done.map(({ member, row, level, streak }) => (
                <div
                  key={member.id}
                  className="card pop flex-1 min-w-0 flex flex-col items-center justify-center gap-[0.8vw] p-[1.5vw] text-center"
                  style={{ borderColor: `${member.color}80`, boxShadow: `inset 0 0 0 0.25vw ${member.color}33` }}
                >
                  <LevelIcon categoryId={row!.category_id} levelId={level!.id} size={done.length >= 4 ? "13vw" : "16vw"} />
                  <div className="flex items-center gap-[0.8vw] mt-[0.4vw]">
                    <Avatar member={member} size="3.4vw" />
                    <div className="font-display text-[3vw] leading-none">{member.name}</div>
                  </div>
                  <div className="font-bold text-[1.7vw] leading-tight" style={{ color: level!.color }}>
                    {level!.tagline}
                  </div>
                  {streak > 1 && <div className="text-[1.1vw] text-gold">{streak} day streak</div>}
                </div>
              ))}
            </div>
          )}

          {waiting.length > 0 && done.length > 0 && (
            <div className="flex items-center gap-[1vw] text-[1.4vw] text-muted">
              <span>Still waiting on</span>
              {waiting.map(({ member }) => (
                <span key={member.id} className="flex items-center gap-[0.5vw] rounded-full bg-white/5 px-[1vw] py-[0.3vw]">
                  <Avatar member={member} size="2vw" />
                  <span className="text-cream font-bold">{member.name}</span>
                </span>
              ))}
            </div>
          )}
        </main>

        <footer className="min-h-0 max-h-[38%]">
          <DailyCards day={today} now={now} variant="tv" />
        </footer>
      </div>
    </div>
  );
}
