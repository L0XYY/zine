"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clapperboard } from "lucide-react";
import { fetchVideos } from "@/lib/data";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedItemSkeleton } from "@/components/ui/Skeleton";
import { FeedItem } from "./FeedItem";
import { toggleSharedMute } from "./VideoPlayer";
import type { Category, Video } from "@/lib/types";

export function Feed({
  category,
  challengeSlug,
}: {
  category?: Category;
  challengeSlug?: string;
}) {
  const [all, setAll] = useState<Video[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    fetchVideos().then((v) => {
      if (alive) setAll(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const videos = useMemo(() => {
    if (!all) return [];
    let list = all;
    if (category) list = list.filter((v) => v.category === category);
    if (challengeSlug) list = list.filter((v) => v.challengeSlug === challengeSlug);
    return list;
  }, [all, category, challengeSlug]);

  useEffect(() => {
    if (!videos.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.index ?? "0",
            );
            setActiveIndex(idx);
          }
        }
      },
      { root: containerRef.current, threshold: [0.6] },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [videos.length]);

  const scrollToIndex = useCallback((idx: number) => {
    const el = itemRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Keyboard shortcuts: J/↓ next · K/↑ prev · M mute. Ignored while typing.
  useEffect(() => {
    if (!videos.length) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (t?.isContentEditable) return;
      const last = videos.length - 1;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        scrollToIndex(Math.min(last, activeIndex + 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      } else if (e.key === "m" || e.key === "M") {
        toggleSharedMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videos.length, activeIndex, scrollToIndex]);

  if (all === null) {
    return (
      <div className="grid h-[100dvh] place-items-center">
        <FeedItemSkeleton />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="grid h-[100dvh] place-items-center px-4">
        <EmptyState
          icon={<Clapperboard className="h-7 w-7" />}
          title="No Zines here yet"
          description="Nothing's looping in this view. Be the first to drop a 6-second Zine."
          action={{ label: "Upload a Zine", href: "/upload" }}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="no-scrollbar h-[100dvh] snap-y snap-mandatory overflow-y-scroll overscroll-contain"
    >
      {videos.map((video, i) => (
        <div
          key={video.id}
          data-index={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="h-full w-full"
        >
          <FeedItem video={video} active={i === activeIndex} />
        </div>
      ))}
    </div>
  );
}
