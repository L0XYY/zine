"use client";

import { useEffect, useState } from "react";
import { Hash } from "lucide-react";
import { fetchVideosByTag } from "@/lib/data";
import { formatCount } from "@/lib/utils";
import { VideoGrid } from "@/components/feed/VideoGrid";
import { VideoCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Video } from "@/lib/types";

export function TagView({ tag }: { tag: string }) {
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    let alive = true;
    setVideos(null);
    fetchVideosByTag(tag).then((v) => {
      if (alive) setVideos(v);
    });
    return () => {
      alive = false;
    };
  }, [tag]);

  const loops = videos?.reduce((a, v) => a + v.loops, 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow">
          <Hash className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            #{tag}
          </h1>
          <p className="text-sm text-slate-400">
            {videos === null
              ? "Loading…"
              : `${formatCount(videos.length)} Zine${
                  videos.length === 1 ? "" : "s"
                } · ${formatCount(loops)} loops`}
          </p>
        </div>
      </header>

      {videos === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={<Hash className="h-7 w-7" />}
          title={`No Zines tagged #${tag} yet`}
          description="Be the first to use this hashtag in a caption."
          action={{ label: "Upload a Zine", href: "/upload" }}
        />
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
