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

/** Inline verified tick placed next to a display name. */
export function VerifiedCheck({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("h-4 w-4 text-sky-400", className)}
      aria-label="Verified"
    />
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
