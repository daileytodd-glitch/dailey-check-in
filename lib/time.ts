import {
  CONTENT_EPOCH,
  DAY_START_HOUR,
  NIGHT_DIM_END_HOUR,
  NIGHT_DIM_START_HOUR,
  REVEAL_HOUR,
  RIDDLE_UNLOCK_HOUR,
  TIME_ZONE,
} from "./config";

export type LocalParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
  weekday: string; // "Monday"
};

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  weekday: "long",
});

/** Break a Date into wall-clock parts in the family's time zone. */
export function localParts(date: Date = new Date()): LocalParts {
  const out: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: out.weekday,
  };
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

/** Days since the Unix epoch for a calendar date, ignoring time zones. */
function calendarDayNumber(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function dayKeyFromNumber(n: number): string {
  const d = new Date(n * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * The check-in day a moment belongs to, as "YYYY-MM-DD".
 * Anything before DAY_START_HOUR counts as the previous day.
 */
export function dayKey(date: Date = new Date()): string {
  const p = localParts(date);
  let n = calendarDayNumber(p.year, p.month, p.day);
  if (p.hour < DAY_START_HOUR) n -= 1;
  return dayKeyFromNumber(n);
}

/** Shift a "YYYY-MM-DD" key by a number of days. */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKeyFromNumber(calendarDayNumber(y, m, d) + days);
}

/** Zero-based index of a day key in the content calendar. Always non-negative. */
export function contentIndex(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  const [ey, em, ed] = CONTENT_EPOCH.split("-").map(Number);
  const diff = calendarDayNumber(y, m, d) - calendarDayNumber(ey, em, ed);
  return ((diff % 100000) + 100000) % 100000;
}

/** "Saturday, September 26" style label for a day key. */
export function prettyDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Short "Sat" weekday for a day key. */
export function shortWeekday(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Minutes since the start of the check-in day (DAY_START_HOUR). */
function minutesIntoDay(date: Date): number {
  const p = localParts(date);
  const mins = p.hour * 60 + p.minute;
  return mins >= DAY_START_HOUR * 60 ? mins - DAY_START_HOUR * 60 : mins + (24 - DAY_START_HOUR) * 60;
}

export function isRiddleUnlocked(date: Date = new Date()): boolean {
  return minutesIntoDay(date) >= (RIDDLE_UNLOCK_HOUR - DAY_START_HOUR) * 60;
}

export function isRevealUnlocked(date: Date = new Date()): boolean {
  return minutesIntoDay(date) >= (REVEAL_HOUR - DAY_START_HOUR) * 60;
}

export function isNightDim(date: Date = new Date()): boolean {
  const h = localParts(date).hour;
  return h >= NIGHT_DIM_START_HOUR || h < NIGHT_DIM_END_HOUR;
}

/** "8:00 PM" for an hour number. */
export function formatHour(hour: number, minute = 0): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return minute ? `${h12}:${pad(minute)} ${suffix}` : `${h12}:00 ${suffix}`;
}

/** Wall clock like "7:42 PM". */
export function clockLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
