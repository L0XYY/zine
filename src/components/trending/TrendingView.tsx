"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";
import { allVideos } from "@/lib/local-store";
import { CategoryTabs, type CategoryFilter } from "@/components/feed/CategoryTabs";
import { VideoGrid } from "@/components/feed/VideoGrid";
import { VideoCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Video } from "@/lib/types";

export function TrendingView() {
  const [all, setAll] = useState<Video[] | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>("ALL");

  useEffect(() => {
    const t = setTimeout(() => setAll(allVideos()), 300);
    return () => clearTimeout(t);
  }, []);

  const ranked = useMemo(() => {
    if (!all) return [];
    return [...all]
      .filter((v) => (filter === "ALL" ? true : v.category === filter))
      .sort((a, b) => b.loops + b.likesCount - (a.loops + a.likesCount));
  }, [all, filter]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow-mint">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Hot Loops
            </h1>
            <p className="text-sm text-slate-400">
              The Zines catching fire right now.
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-10 -mx-4 mb-5 bg-ink-950/70 px-4 py-2 backdrop-blur-lg sm:mx-0 sm:rounded-2xl sm:px-2">
        <CategoryTabs value={filter} onChange={setFilter} />
      </div>

      {all === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-7 w-7" />}
          title="Nothing trending here yet"
          description="No Zines in this category have caught fire. Be the one to start the loop."
          action={{ label: "Upload a Zine", href: "/upload" }}
        />
      ) : (
        <VideoGrid videos={ranked} ranked />
      )}
    </div>
  );
}
