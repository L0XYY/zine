import { BadgeCheck, Crown, Gem, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGES } from "@/lib/constants";
import type { BadgeKind } from "@/lib/types";

const ICONS: Record<BadgeKind, typeof BadgeCheck> = {
  VERIFIED: BadgeCheck,
  PARTNER: Gem,
  FOUNDER: Crown,
  STAFF: Shield,
  EARLY: Sparkles,
};

const BADGE_COLOR: Record<BadgeKind, string> = {
  VERIFIED: "text-sky-400",
  FOUNDER: "text-amber-300",
  STAFF: "text-emerald-300",
  PARTNER: "text-teal-300",
  EARLY: "text-cyan-300",
};

const BADGE_ORDER: BadgeKind[] = [
  "VERIFIED",
  "FOUNDER",
  "STAFF",
  "PARTNER",
  "EARLY",
];

/** Inline verified tick placed next to a display name. */
export function VerifiedCheck({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("h-4 w-4 text-sky-400", className)}
      aria-label="Verified"
    />
  );
}

/** Small badge icons rendered inline next to a display name (like the tick). */
export function InlineBadges({
  badges,
  verified,
  className,
}: {
  badges: BadgeKind[];
  verified?: boolean;
  className?: string;
}) {
  const set = new Set(badges);
  if (verified) set.add("VERIFIED");
  const shown = BADGE_ORDER.filter((b) => set.has(b));
  if (shown.length === 0) return null;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5", className)}>
      {shown.map((b) => {
        const Icon = ICONS[b];
        return (
          <span key={b} title={BADGES[b].label} className="inline-flex">
            <Icon
              className={cn("h-4 w-4", BADGE_COLOR[b])}
              aria-label={BADGES[b].label}
            />
          </span>
        );
      })}
    </span>
  );
}

/** A single labelled badge pill. */
export function BadgePill({
  kind,
  className,
  showLabel = true,
}: {
  kind: BadgeKind;
  className?: string;
  showLabel?: boolean;
}) {
  const meta = BADGES[kind];
  const Icon = ICONS[kind];
  return (
    <span
      title={meta.description}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && meta.label}
    </span>
  );
}

/** A row of badges, priority-ordered. */
export function BadgeRow({
  badges,
  className,
  max = 4,
}: {
  badges: BadgeKind[];
  className?: string;
  max?: number;
}) {
  const order: BadgeKind[] = ["FOUNDER", "STAFF", "PARTNER", "VERIFIED", "EARLY"];
  const sorted = [...badges].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b),
  );
  if (sorted.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {sorted.slice(0, max).map((b) => (
        <BadgePill key={b} kind={b} />
      ))}
    </div>
  );
}
