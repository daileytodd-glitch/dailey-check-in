import { previousRiddleFor, quoteFor, riddleFor, verseFor } from "@/lib/content";

type Variant = "phone" | "tv";
type Props = { day: string; variant: Variant };

function Card({ title, accent, children, variant }: { title: string; accent: string; children: React.ReactNode; variant: Variant }) {
  return (
    <section
      className={`card flex flex-col ${variant === "tv" ? "p-[1.2vw] gap-[0.5vw] min-h-0 overflow-hidden" : "p-4 gap-2"}`}
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <h3 className={`font-display uppercase tracking-wide ${variant === "tv" ? "text-[1.15vw]" : "text-sm"}`} style={{ color: accent }}>
        {title}
      </h3>
      <div className="min-h-0">{children}</div>
    </section>
  );
}

/** Riddle, quote and scripture for the day. Everything is visible all day and rolls over at 4 AM. */
export function DailyCards({ day, variant }: Props) {
  const riddle = riddleFor(day);
  const yesterday = previousRiddleFor(day);
  const quote = quoteFor(day);
  const verse = verseFor(day);
  const tv = variant === "tv";

  // Long passages get a slightly smaller size on the TV so the board never has to scroll.
  const body = (len: number) => (tv ? (len > 230 ? "text-[1.05vw] leading-snug" : "text-[1.3vw] leading-snug") : "text-base leading-relaxed");
  const small = tv ? "text-[1.05vw]" : "text-sm";

  return (
    <div className={tv ? "grid grid-cols-3 gap-[1.2vw] min-h-0" : "grid gap-3 md:grid-cols-3"}>
      <Card title="Riddle of the Day" accent="var(--orange)" variant={variant}>
        <p className={`font-bold ${body(riddle.question.length)}`}>{riddle.question}</p>
        <div className={`mt-2 pt-2 border-t border-white/10 ${small}`}>
          <span className="text-muted">Yesterday&rsquo;s answer: </span>
          <span className="font-extrabold text-yellow">{yesterday.answer}</span>
          <span className="text-muted"> ({yesterday.question})</span>
        </div>
      </Card>

      <Card title="Quote of the Day" accent="var(--gold)" variant={variant}>
        <figure>
          <blockquote className={`font-bold ${body(quote.text.length)}`}>&ldquo;{quote.text}&rdquo;</blockquote>
          <figcaption className={`text-muted mt-1 ${small}`}>&mdash; {quote.author}</figcaption>
        </figure>
      </Card>

      <Card title="Scripture of the Day" accent="var(--blue)" variant={variant}>
        <figure>
          <blockquote className={`font-bold ${body(verse.text.length)}`}>{verse.text}</blockquote>
          <figcaption className={`text-muted mt-1 ${small}`}>{verse.reference} (RSV-CE)</figcaption>
        </figure>
      </Card>
    </div>
  );
}
