"use client";

import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/types";

export type CategoryFilter = Category | "ALL";

export function CategoryTabs({
  value,
  onChange,
  className,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  className?: string;
}) {
  const tabs: { key: CategoryFilter; label: string; emoji?: string }[] = [
    { key: "ALL", label: "All" },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label, emoji: c.emoji })),
  ];

  return (
    <div
      className={cn(
        "no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "ring-focus shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              active
                ? "border-transparent bg-zine-gradient text-white shadow-glow"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            {tab.emoji && <span className="mr-1">{tab.emoji}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
