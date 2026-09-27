import type { Metadata } from "next";
import { CATEGORIES, LevelIcon } from "@/lib/categories";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: `${APP_NAME} · Icons` };

/** Every category and level at a glance. Handy for reviewing the icon set. */
export default function IconsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 flex flex-col gap-8">
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="App icon" width={72} height={72} className="rounded-2xl" />
        <div>
          <h1 className="font-display text-3xl shimmer">{APP_NAME}</h1>
          <p className="text-muted text-sm">The icon set. One category per day, best to worst, left to right.</p>
        </div>
      </header>
      {CATEGORIES.map((c) => (
        <section key={c.id} className="card p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-gold">{c.name}</h2>
            <span className="text-sm text-muted">{c.prompt}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {c.levels.map((l) => (
              <div key={l.id} className="rounded-2xl bg-white/5 p-3 flex flex-col items-center gap-2 text-center">
                <LevelIcon categoryId={c.id} levelId={l.id} size={84} />
                <div className="font-display text-base leading-tight">{l.label}</div>
                <div className="text-xs leading-tight" style={{ color: l.color }}>{l.tagline}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
