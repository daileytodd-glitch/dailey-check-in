import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { dayKey, shiftDayKey } from "./time";

export type Checkin = {
  member_id: string;
  day: string; // YYYY-MM-DD check-in day
  category_id: string;
  level_id: string;
  score: number;
  created_at: string;
  updated_at: string;
};

/** Load every check-in from the last `days` days (including today). */
export async function loadRecentCheckins(days = 60): Promise<Checkin[]> {
  const today = dayKey();
  const from = shiftDayKey(today, -(days - 1));
  const { data, error } = await supabase()
    .from("checkins")
    .select("member_id, day, category_id, level_id, score, created_at, updated_at")
    .gte("day", from)
    .lte("day", today)
    .order("day", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Checkin[];
}

/** Save or replace a member's check-in for today. */
export async function saveCheckin(memberId: string, categoryId: string, levelId: string, score: number) {
  const day = dayKey();
  const { error } = await supabase()
    .from("checkins")
    .upsert(
      { member_id: memberId, day, category_id: categoryId, level_id: levelId, score, updated_at: new Date().toISOString() },
      { onConflict: "member_id,day" },
    );
  if (error) throw error;
}

/** Subscribe to live changes. Returns an unsubscribe function. */
export function subscribeToCheckins(onChange: () => void): () => void {
  const channel: RealtimeChannel = supabase()
    .channel("checkins-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => onChange())
    .subscribe();
  return () => {
    supabase().removeChannel(channel);
  };
}

/** Group check-ins by member id, newest day first. */
export function byMember(rows: Checkin[]): Map<string, Checkin[]> {
  const map = new Map<string, Checkin[]>();
  for (const r of rows) {
    const list = map.get(r.member_id) ?? [];
    list.push(r);
    map.set(r.member_id, list);
  }
  return map;
}

/** Consecutive days checked in, counting back from today (or yesterday if today isn't done yet). */
export function streakFor(rows: Checkin[], today: string): number {
  const days = new Set(rows.map((r) => r.day));
  let cursor = days.has(today) ? today : shiftDayKey(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}
