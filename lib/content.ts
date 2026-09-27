import quotes from "@/content/quotes.json";
import riddles from "@/content/riddles.json";
import verses from "@/content/verses.json";
import { contentIndex, shiftDayKey } from "./time";

export type Quote = { id: number; text: string; author: string };
export type Riddle = { id: number; question: string; answer: string };
export type Verse = { id: number; reference: string; text: string; verseCount: number };

const QUOTES = quotes as Quote[];
const RIDDLES = riddles as Riddle[];
const VERSES = verses as Verse[];

export function quoteFor(day: string): Quote {
  return QUOTES[contentIndex(day) % QUOTES.length];
}

export function riddleFor(day: string): Riddle {
  return RIDDLES[contentIndex(day) % RIDDLES.length];
}

export function verseFor(day: string): Verse {
  return VERSES[contentIndex(day) % VERSES.length];
}

/** Yesterday's riddle, whose answer is revealed today. */
export function previousRiddleFor(day: string): Riddle {
  return riddleFor(shiftDayKey(day, -1));
}
