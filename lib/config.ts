// Family and schedule settings for the Daily Check-In.
// Everything the family might want to tweak lives here.

export type Member = {
  id: string;
  name: string;
  /** Accent color used for this person's tiles and avatar. */
  color: string;
  /** Darker shade of the accent for text on light backgrounds. */
  ink: string;
  initials: string;
};

export const FAMILY: Member[] = [
  { id: "oliver", name: "Oliver", color: "#3B9DFF", ink: "#0B3F80", initials: "O" },
  { id: "noah", name: "Noah", color: "#FF7A1A", ink: "#7A3300", initials: "N" },
  { id: "grant", name: "Grant", color: "#F03A2E", ink: "#7A0E08", initials: "G" },
  { id: "dad", name: "Dad", color: "#E5A100", ink: "#6B4A00", initials: "D" },
  { id: "mom", name: "Mom", color: "#FFE45C", ink: "#6B5A00", initials: "M" },
];

export const APP_NAME = "Daily Check-In";

/** IANA time zone the family lives in. */
export const TIME_ZONE = "America/New_York";

/** A new check-in day begins at this hour (local). Late-night check-ins still count for "today". */
export const DAY_START_HOUR = 4;

/** Local hour (24h) when the riddle of the day appears on the board. */
export const RIDDLE_UNLOCK_HOUR = 20;

/** Local hour (24h) when the quote and scripture of the day are revealed. */
export const REVEAL_HOUR = 21;

/** Daily reminder push notification, local time. */
export const REMINDER_HOUR = 17;
export const REMINDER_MINUTE = 30;

/** Board dims itself between these local hours to be easy on the eyes and the TV. */
export const NIGHT_DIM_START_HOUR = 22;
export const NIGHT_DIM_END_HOUR = 6;

/** The date the content calendar starts counting from (day 0 = first quote/verse/riddle). */
export const CONTENT_EPOCH = "2026-01-01";

export function memberById(id: string): Member | undefined {
  return FAMILY.find((m) => m.id === id);
}
