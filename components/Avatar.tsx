import type { Member } from "@/lib/config";

export function Avatar({ member, size = 48, className = "" }: { member: Member; size?: number | string; className?: string }) {
  return (
    <div
      className={`font-display flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: member.color,
        color: member.ink,
        fontSize: typeof size === "number" ? size * 0.48 : "1.2em",
        boxShadow: `0 0 0 3px rgba(255,255,255,0.14), 0 8px 24px -8px ${member.color}`,
      }}
      aria-hidden
    >
      {member.initials}
    </div>
  );
}
