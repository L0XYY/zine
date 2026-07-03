import { cn } from "@/lib/utils";
import { categoryMeta } from "@/lib/constants";
import type { Category } from "@/lib/types";

const accentMap = {
  purple: "border-zine-green/30 bg-zine-green/10 text-emerald-200",
  blue: "border-zine-teal/30 bg-zine-teal/10 text-teal-200",
  pink: "border-zine-mint/30 bg-zine-mint/10 text-green-200",
} as const;

export function CategoryPill({
  category,
  className,
  size = "sm",
}: {
  category: Category;
  className?: string;
  size?: "sm" | "md";
}) {
  const meta = categoryMeta(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        accentMap[meta.accent],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
