import type { Metadata } from "next";
import { categoryById, GradeIcon, type GradeStyle } from "@/lib/categories";

export const metadata: Metadata = { title: "Report Card icon options" };

const OPTIONS: { style: GradeStyle; name: string; blurb: string }[] = [
  { style: "star", name: "Option 1: Gold Star Sticker", blurb: "The sticker a teacher puts on a great test. Green for an A, fading to red for an F, like every other category." },
  { style: "stamp", name: "Option 2: Teacher's Stamp", blurb: "A rubber stamp pressed a little crooked, in grading-pen colors." },
  { style: "varsity", name: "Option 3: Varsity Letter", blurb: "A chenille letter patch, like a letterman jacket." },
  { style: "paper", name: "Current: Paper Report Card", blurb: "What it looks like today, for comparison." },
];

export default function GradeOptionsPage() {
  const levels = categoryById("grade")!.levels;
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 flex flex-col gap-6">
      <h1 className="font-display text-3xl shimmer">Report Card icon options</h1>
      {OPTIONS.map((o) => (
        <section key={o.style} className="card p-5">
          <h2 className="font-display text-2xl text-gold">{o.name}</h2>
          <p className="text-sm text-muted mb-4">{o.blurb}</p>
          <div className="grid grid-cols-5 gap-3">
            {levels.map((l) => (
              <div key={l.id} className="rounded-2xl bg-white/5 p-3 flex flex-col items-center gap-2">
                <GradeIcon level={l.id} style={o.style} size={88} />
                <div className="font-display text-lg">{l.label}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
