import { REVEAL_HOUR, RIDDLE_UNLOCK_HOUR } from "@/lib/config";
import { previousRiddleFor, quoteFor, riddleFor, verseFor } from "@/lib/content";
import { formatHour, isRevealUnlocked, isRiddleUnlocked } from "@/lib/time";

type Props = { day: string; now: Date; variant: "phone" | "tv" };

function Card({
  title,
  accent,
  children,
  variant,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
  variant: "phone" | "tv";
}) {
  return (
    <section
      className={`card flex flex-col ${variant === "tv" ? "p-[1.2vw] gap-[0.5vw] min-h-0 overflow-hidden" : "p-4 gap-2"}`}
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <h3
        className={`font-display uppercase tracking-wide ${variant === "tv" ? "text-[1.15vw]" : "text-sm"}`}
        style={{ color: accent }}
      >
        {title}
      </h3>
      <div className={`${variant === "tv" ? "text-[1.3vw] leading-snug" : "text-base leading-relaxed"} min-h-0`}>
        {children}
      </div>
    </section>
  );
}

function Locked({ at, what, variant }: { at: string; what: string; variant: "phone" | "tv" }) {
  return (
    <p className={`text-muted ${variant === "tv" ? "text-[1.2vw]" : "text-sm"}`}>
      <span aria-hidden>🔒</span> {what} unlocks at <strong className="text-cream">{at}</strong>
    </p>
  );
}

export function DailyCards({ day, now, variant }: Props) {
  const riddleOpen = isRiddleUnlocked(now);
  const revealOpen = isRevealUnlocked(now);
  const riddle = riddleFor(day);
  const yesterday = previousRiddleFor(day);
  const quote = quoteFor(day);
  const verse = verseFor(day);
  const tv = variant === "tv";

  return (
    <div className={tv ? "grid grid-cols-3 gap-[1.2vw] min-h-0" : "grid gap-3"}>
      <Card title="Riddle of the Day" accent="var(--orange)" variant={variant}>
        {riddleOpen ? (
          <p className="font-bold">{riddle.question}</p>
        ) : (
          <Locked at={formatHour(RIDDLE_UNLOCK_HOUR)} what="Tonight's riddle" variant={variant} />
        )}
        <div className={`mt-2 pt-2 border-t border-white/10 ${tv ? "text-[1.05vw]" : "text-sm"}`}>
          <span className="text-muted">Yesterday&rsquo;s answer: </span>
          <span className="font-extrabold text-yellow">{yesterday.answer}</span>
          <span className="text-muted"> ({yesterday.question})</span>
        </div>
      </Card>

      <Card title="Quote of the Day" accent="var(--gold)" variant={variant}>
        {revealOpen ? (
          <figure>
            <blockquote className="font-bold">&ldquo;{quote.text}&rdquo;</blockquote>
            <figcaption className={`text-muted mt-1 ${tv ? "text-[1.05vw]" : "text-sm"}`}>&mdash; {quote.author}</figcaption>
          </figure>
        ) : (
          <Locked at={formatHour(REVEAL_HOUR)} what="Today's quote" variant={variant} />
        )}
      </Card>

      <Card title="Scripture of the Day" accent="var(--blue)" variant={variant}>
        {revealOpen ? (
          <figure>
            <blockquote className="font-bold">{verse.text}</blockquote>
            <figcaption className={`text-muted mt-1 ${tv ? "text-[1.05vw]" : "text-sm"}`}>{verse.reference} (RSV-CE)</figcaption>
          </figure>
        ) : (
          <Locked at={formatHour(REVEAL_HOUR)} what="Today's scripture" variant={variant} />
        )}
      </Card>
    </div>
  );
}
