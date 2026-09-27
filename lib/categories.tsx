import type { ReactNode } from "react";
import { contentIndex } from "./time";

export type Level = {
  id: string;
  /** Short label shown under the icon, e.g. "Sunny". */
  label: string;
  /** Playful one-liner shown on the board, e.g. "Sunny kind of day". */
  tagline: string;
  /** 0 (worst) to 100 (best). Used for colors, history dots and streak coloring. */
  score: number;
  /** Mood color for this level. */
  color: string;
};

export type Category = {
  id: string;
  name: string;
  /** Question shown on the check-in screen. */
  prompt: string;
  levels: Level[];
};

/* ---------- Mood colors (best to worst) ---------- */
const GREAT = "#34D399";
const GOOD = "#A3E635";
const OKAY = "#FACC15";
const MEH = "#FB923C";
const BAD = "#F87171";
const WORST = "#C026D3";

export function moodColor(score: number): string {
  if (score >= 90) return GREAT;
  if (score >= 70) return GOOD;
  if (score >= 50) return OKAY;
  if (score >= 30) return MEH;
  if (score >= 10) return BAD;
  return WORST;
}

/* ---------- Category definitions ---------- */

export const CATEGORIES: Category[] = [
  {
    id: "weather",
    name: "Weather Report",
    prompt: "What was the weather like in your world today?",
    levels: [
      { id: "sunny", label: "Sunny", tagline: "Sunny kind of day", score: 100, color: GREAT },
      { id: "partly", label: "Partly Cloudy", tagline: "Partly cloudy kind of day", score: 80, color: GOOD },
      { id: "cloudy", label: "Cloudy", tagline: "Cloudy kind of day", score: 60, color: OKAY },
      { id: "rainy", label: "Rainy", tagline: "Rainy kind of day", score: 40, color: MEH },
      { id: "storm", label: "Thunderstorm", tagline: "Thunderstorm kind of day", score: 20, color: BAD },
      { id: "disaster", label: "Natural Disaster", tagline: "Natural disaster kind of day", score: 0, color: WORST },
    ],
  },
  {
    id: "battery",
    name: "Battery Check",
    prompt: "How much battery do you have left tonight?",
    levels: [
      { id: "b100", label: "100%", tagline: "Fully charged", score: 100, color: GREAT },
      { id: "b80", label: "80%", tagline: "Plenty in the tank", score: 80, color: GOOD },
      { id: "b60", label: "60%", tagline: "Doing alright", score: 60, color: OKAY },
      { id: "b40", label: "40%", tagline: "Running a little low", score: 40, color: MEH },
      { id: "b20", label: "20%", tagline: "Low power mode", score: 20, color: BAD },
      { id: "b0", label: "Dead", tagline: "Totally drained", score: 0, color: WORST },
    ],
  },
  {
    id: "traffic",
    name: "Traffic Light",
    prompt: "What color is your light today?",
    levels: [
      { id: "green", label: "Green", tagline: "Green light, all good", score: 100, color: GREAT },
      { id: "yellow", label: "Yellow", tagline: "Yellow light, go easy", score: 50, color: OKAY },
      { id: "red", label: "Red", tagline: "Red light, needs a hug", score: 0, color: BAD },
    ],
  },
  {
    id: "golf",
    name: "Golf Score",
    prompt: "How did you score today?",
    levels: [
      { id: "eagle", label: "Eagle", tagline: "Eagle kind of day", score: 100, color: GREAT },
      { id: "birdie", label: "Birdie", tagline: "Birdie kind of day", score: 80, color: GOOD },
      { id: "par", label: "Par", tagline: "Par kind of day", score: 60, color: OKAY },
      { id: "bogey", label: "Bogey", tagline: "Bogey kind of day", score: 40, color: MEH },
      { id: "double", label: "Double Bogey", tagline: "Double bogey kind of day", score: 20, color: BAD },
      { id: "lost", label: "Lost in the Woods", tagline: "Lost the ball in the woods", score: 0, color: WORST },
    ],
  },
  {
    id: "grade",
    name: "Report Card",
    prompt: "What grade does today get?",
    levels: [
      { id: "a", label: "A", tagline: "A+ kind of day", score: 100, color: GREAT },
      { id: "b", label: "B", tagline: "Solid B day", score: 75, color: GOOD },
      { id: "c", label: "C", tagline: "Average C day", score: 50, color: OKAY },
      { id: "d", label: "D", tagline: "Rough D day", score: 25, color: MEH },
      { id: "f", label: "F", tagline: "Failed the day, try again tomorrow", score: 0, color: WORST },
    ],
  },
  {
    id: "scoreboard",
    name: "Final Score",
    prompt: "How did today's game end?",
    levels: [
      { id: "blowout-w", label: "Blowout Win", tagline: "Won in a blowout", score: 100, color: GREAT },
      { id: "buzzer-w", label: "Buzzer Beater", tagline: "Won at the buzzer", score: 80, color: GOOD },
      { id: "overtime", label: "Overtime", tagline: "Went to overtime", score: 60, color: OKAY },
      { id: "close-l", label: "Close Loss", tagline: "Lost a close one", score: 40, color: MEH },
      { id: "blowout-l", label: "Blown Out", tagline: "Got blown out", score: 20, color: BAD },
      { id: "injured", label: "Injured Reserve", tagline: "Out with an injury", score: 0, color: WORST },
    ],
  },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function levelFor(categoryId: string, levelId: string): Level | undefined {
  return categoryById(categoryId)?.levels.find((l) => l.id === levelId);
}

/** The category everyone answers on a given day. Rotates automatically. */
export function categoryForDay(day: string): Category {
  return CATEGORIES[contentIndex(day) % CATEGORIES.length];
}

/* ---------- Icons ---------- */

type IconProps = { size?: number | string; className?: string };

function Svg({ children, size = 64, className, title }: IconProps & { children: ReactNode; title: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
      style={{ display: "block", flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

const SUN = "#FFD23F";
const SUN_RAY = "#FFB000";
const CLOUD = "#F4F7FB";
const CLOUD_DARK = "#8A97AD";
const RAIN = "#5AB6FF";
const BOLT = "#FFE45C";
const TORNADO = "#B8C2D3";

function Sun({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = cx + Math.cos(a) * (r + 6);
    const y1 = cy + Math.sin(a) * (r + 6);
    const x2 = cx + Math.cos(a) * (r + 16);
    const y2 = cy + Math.sin(a) * (r + 16);
    rays.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={SUN_RAY} strokeWidth={6} strokeLinecap="round" />,
    );
  }
  return (
    <g>
      {rays}
      <circle cx={cx} cy={cy} r={r} fill={SUN} stroke={SUN_RAY} strokeWidth={4} />
    </g>
  );
}

function Cloud({ x, y, s, fill = CLOUD }: { x: number; y: number; s: number; fill?: string }) {
  // A puffy cloud drawn with circles and a base, scaled by s.
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={22} cy={30} r={16} fill={fill} />
      <circle cx={40} cy={20} r={20} fill={fill} />
      <circle cx={60} cy={28} r={16} fill={fill} />
      <rect x={8} y={30} width={66} height={18} rx={9} fill={fill} />
    </g>
  );
}

function WeatherIcon({ level, ...p }: IconProps & { level: string }) {
  switch (level) {
    case "sunny":
      return (
        <Svg {...p} title="Sunny">
          <Sun cx={50} cy={50} r={22} />
        </Svg>
      );
    case "partly":
      return (
        <Svg {...p} title="Partly cloudy">
          <Sun cx={40} cy={38} r={18} />
          <Cloud x={22} y={38} s={0.85} />
        </Svg>
      );
    case "cloudy":
      return (
        <Svg {...p} title="Cloudy">
          <Cloud x={30} y={18} s={0.7} fill={CLOUD_DARK} />
          <Cloud x={10} y={36} s={1} />
        </Svg>
      );
    case "rainy":
      return (
        <Svg {...p} title="Rainy">
          <Cloud x={12} y={14} s={0.95} fill={CLOUD_DARK} />
          {[30, 45, 60, 75].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={64}
              x2={x - 6}
              y2={i % 2 ? 86 : 80}
              stroke={RAIN}
              strokeWidth={6}
              strokeLinecap="round"
            />
          ))}
        </Svg>
      );
    case "storm":
      return (
        <Svg {...p} title="Thunderstorm">
          <Cloud x={12} y={10} s={0.95} fill="#5B6780" />
          <polygon points="54,50 38,74 50,74 44,94 66,64 54,64 62,50" fill={BOLT} stroke="#E0A800" strokeWidth={2} />
        </Svg>
      );
    default:
      return (
        <Svg {...p} title="Natural disaster">
          <Cloud x={8} y={4} s={1.05} fill="#4B5568" />
          <ellipse cx={50} cy={46} rx={30} ry={7} fill={TORNADO} />
          <ellipse cx={48} cy={58} rx={22} ry={6} fill={TORNADO} />
          <ellipse cx={52} cy={69} rx={15} ry={5} fill={TORNADO} />
          <ellipse cx={49} cy={79} rx={9} ry={4} fill={TORNADO} />
          <ellipse cx={53} cy={88} rx={5} ry={3} fill={TORNADO} />
          <circle cx={20} cy={72} r={4} fill="#C026D3" />
          <circle cx={82} cy={64} r={3} fill="#C026D3" />
          <circle cx={78} cy={84} r={4} fill="#C026D3" />
        </Svg>
      );
  }
}

function BatteryIcon({ level, ...p }: IconProps & { level: string }) {
  const bars = { b100: 5, b80: 4, b60: 3, b40: 2, b20: 1, b0: 0 }[level] ?? 0;
  const fill = bars >= 4 ? GREAT : bars === 3 ? OKAY : bars === 2 ? MEH : BAD;
  return (
    <Svg {...p} title={`Battery ${bars * 20}%`}>
      <rect x={8} y={28} width={76} height={44} rx={8} fill="none" stroke="#E6ECF5" strokeWidth={6} />
      <rect x={86} y={41} width={8} height={18} rx={3} fill="#E6ECF5" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect
          key={i}
          x={15 + i * 13}
          y={35}
          width={10}
          height={30}
          rx={2}
          fill={i < bars ? fill : "rgba(230,236,245,0.15)"}
        />
      ))}
      {bars === 0 && (
        <g stroke="#F87171" strokeWidth={6} strokeLinecap="round">
          <line x1={34} y1={36} x2={58} y2={64} />
          <line x1={58} y1={36} x2={34} y2={64} />
        </g>
      )}
    </Svg>
  );
}

function TrafficIcon({ level, ...p }: IconProps & { level: string }) {
  const lamps = [
    { id: "red", cy: 24, on: "#FF4D3D" },
    { id: "yellow", cy: 50, on: "#FFD23F" },
    { id: "green", cy: 76, on: "#3DDC84" },
  ];
  return (
    <Svg {...p} title={`${level} light`}>
      <rect x={28} y={4} width={44} height={92} rx={12} fill="#1F2937" stroke="#374151" strokeWidth={3} />
      {lamps.map((l) => (
        <g key={l.id}>
          {l.id === level && <circle cx={50} cy={l.cy} r={14} fill={l.on} opacity={0.35} />}
          <circle cx={50} cy={l.cy} r={10} fill={l.id === level ? l.on : "#111827"} stroke="#0B0F19" strokeWidth={2} />
        </g>
      ))}
    </Svg>
  );
}

function GolfIcon({ level, ...p }: IconProps & { level: string }) {
  const text: Record<string, string> = { eagle: "-2", birdie: "-1", par: "E", bogey: "+1", double: "+2" };
  const ink = "#F8FAFC";
  if (level === "lost") {
    return (
      <Svg {...p} title="Lost in the woods">
        <polygon points="26,20 8,58 44,58" fill="#1E7F4F" />
        <polygon points="26,36 4,80 48,80" fill="#25A25A" />
        <rect x={22} y={80} width={8} height={14} fill="#7A4A1E" />
        <polygon points="70,14 52,52 88,52" fill="#1E7F4F" />
        <polygon points="70,30 48,74 92,74" fill="#25A25A" />
        <rect x={66} y={74} width={8} height={18} fill="#7A4A1E" />
        <circle cx={50} cy={86} r={7} fill="#F8FAFC" />
        <text x={50} y={90} textAnchor="middle" fontSize={11} fontWeight={800} fill="#C026D3">?</text>
      </Svg>
    );
  }
  const stroke = "#F8FAFC";
  return (
    <Svg {...p} title={`Golf ${level}`}>
      {level === "eagle" && <circle cx={50} cy={50} r={44} fill="none" stroke={stroke} strokeWidth={4} />}
      {(level === "eagle" || level === "birdie") && (
        <circle cx={50} cy={50} r={34} fill="none" stroke={stroke} strokeWidth={4} />
      )}
      {level === "double" && <rect x={6} y={6} width={88} height={88} rx={4} fill="none" stroke={stroke} strokeWidth={4} />}
      {(level === "bogey" || level === "double") && (
        <rect x={16} y={16} width={68} height={68} rx={3} fill="none" stroke={stroke} strokeWidth={4} />
      )}
      <text x={50} y={64} textAnchor="middle" fontSize={40} fontWeight={800} fill={ink} fontFamily="inherit">
        {text[level]}
      </text>
    </Svg>
  );
}

/** Which look the Report Card category uses: "star", "stamp", or "varsity". */
export const GRADE_ICON_STYLE: GradeStyle = "star";
export type GradeStyle = "star" | "stamp" | "varsity" | "paper";

const GRADE_COLORS: Record<string, string> = { a: GREAT, b: GOOD, c: OKAY, d: MEH, f: BAD };

function starPath(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function GradeIcon({ level, style = GRADE_ICON_STYLE, ...p }: IconProps & { level: string; style?: GradeStyle }) {
  const letter = level.toUpperCase();
  const color = GRADE_COLORS[level] ?? OKAY;
  if (style === "star") {
    // A gold-star sticker, the kind that goes on a great test.
    return (
      <Svg {...p} title={`Grade ${letter}`}>
        <polygon points={starPath(50, 52, 47, 22)} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={2} strokeLinejoin="round" />
        <polygon points={starPath(50, 52, 34, 16)} fill="rgba(255,255,255,0.18)" />
        <text x={50} y={64} textAnchor="middle" fontSize={32} fontWeight={900} fill="#0B1E3F" fontFamily="inherit">
          {letter}
        </text>
      </Svg>
    );
  }
  if (style === "stamp") {
    // A teacher's rubber stamp, slightly crooked like it was pressed by hand.
    return (
      <Svg {...p} title={`Grade ${letter}`}>
        <g transform="rotate(-12 50 50)">
          <circle cx={50} cy={50} r={42} fill="none" stroke={color} strokeWidth={5} strokeDasharray="9 3" />
          <circle cx={50} cy={50} r={34} fill={`${color}22`} stroke={color} strokeWidth={2.5} />
          <text x={50} y={66} textAnchor="middle" fontSize={44} fontWeight={900} fill={color} fontFamily="inherit">
            {letter}
          </text>
        </g>
      </Svg>
    );
  }
  if (style === "varsity") {
    // A chenille varsity letter patch.
    return (
      <Svg {...p} title={`Grade ${letter}`}>
        <rect x={12} y={12} width={76} height={76} rx={14} fill={color} />
        <rect x={12} y={12} width={76} height={76} rx={14} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={3} strokeDasharray="4 3" />
        <text x={50} y={70} textAnchor="middle" fontSize={54} fontWeight={900} fill="#FFFDF5" stroke="#0B1E3F" strokeWidth={3} paintOrder="stroke" fontFamily="Georgia, 'Times New Roman', serif">
          {letter}
        </text>
      </Svg>
    );
  }
  // The original paper report card.
  return (
    <Svg {...p} title={`Grade ${letter}`}>
      <rect x={16} y={6} width={68} height={88} rx={6} fill="#FFFDF5" stroke="#E4DCC0" strokeWidth={3} />
      {[26, 36, 46].map((y) => (
        <line key={y} x1={26} y1={y} x2={74} y2={y} stroke="#E4DCC0" strokeWidth={3} strokeLinecap="round" />
      ))}
      <circle cx={50} cy={68} r={20} fill={color} opacity={0.9} />
      <text x={50} y={79} textAnchor="middle" fontSize={30} fontWeight={900} fill="#0B1E3F" fontFamily="inherit">
        {letter}
      </text>
    </Svg>
  );
}

function ScoreboardIcon({ level, ...p }: IconProps & { level: string }) {
  const scores: Record<string, [string, string, string]> = {
    "blowout-w": ["42", "3", "FINAL"],
    "buzzer-w": ["21", "20", "0:00"],
    overtime: ["24", "24", "OT"],
    "close-l": ["20", "21", "FINAL"],
    "blowout-l": ["3", "42", "FINAL"],
  };
  if (level === "injured") {
    return (
      <Svg {...p} title="Injured reserve">
        <rect x={8} y={14} width={84} height={72} rx={8} fill="#111827" stroke="#374151" strokeWidth={3} />
        <rect x={38} y={30} width={24} height={44} rx={4} fill="#F87171" />
        <rect x={28} y={40} width={44} height={24} rx={4} fill="#F87171" />
      </Svg>
    );
  }
  const [us, them, status] = scores[level] ?? ["0", "0", ""];
  const win = Number(us) > Number(them);
  const tie = us === them;
  return (
    <Svg {...p} title={`Scoreboard ${us} to ${them}`}>
      <rect x={4} y={14} width={92} height={72} rx={8} fill="#111827" stroke="#374151" strokeWidth={3} />
      <text x={28} y={30} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94A3B8" fontFamily="inherit">US</text>
      <text x={72} y={30} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94A3B8" fontFamily="inherit">THEM</text>
      <text x={28} y={64} textAnchor="middle" fontSize={32} fontWeight={900} fill={tie ? OKAY : win ? GREAT : BAD} fontFamily="inherit">
        {us}
      </text>
      <text x={72} y={64} textAnchor="middle" fontSize={32} fontWeight={900} fill={tie ? OKAY : win ? "#94A3B8" : GREAT} fontFamily="inherit">
        {them}
      </text>
      <text x={50} y={80} textAnchor="middle" fontSize={10} fontWeight={800} fill="#FFD23F" fontFamily="inherit">{status}</text>
    </Svg>
  );
}

export function LevelIcon({ categoryId, levelId, ...p }: IconProps & { categoryId: string; levelId: string }) {
  switch (categoryId) {
    case "weather":
      return <WeatherIcon level={levelId} {...p} />;
    case "battery":
      return <BatteryIcon level={levelId} {...p} />;
    case "traffic":
      return <TrafficIcon level={levelId} {...p} />;
    case "golf":
      return <GolfIcon level={levelId} {...p} />;
    case "grade":
      return <GradeIcon level={levelId} {...p} />;
    case "scoreboard":
      return <ScoreboardIcon level={levelId} {...p} />;
    default:
      return null;
  }
}

/** A small icon that represents the category itself (used in headers). */
export function CategoryIcon({ categoryId, ...p }: IconProps & { categoryId: string }) {
  const first = categoryById(categoryId)?.levels[0]?.id ?? "";
  const rep: Record<string, string> = { traffic: "green", grade: "a", battery: "b100" };
  return <LevelIcon categoryId={categoryId} levelId={rep[categoryId] ?? first} {...p} />;
}
