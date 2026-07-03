"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { VideoCard } from "./VideoCard";
import { VideoModal } from "./VideoModal";
import type { Video } from "@/lib/types";

export function VideoGrid({
  videos,
  ranked = false,
  className,
}: {
  videos: Video[];
  ranked?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState<Video | null>(null);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          className,
        )}
      >
        {videos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            onOpen={setActive}
            rank={ranked ? i + 1 : undefined}
          />
        ))}
      </div>

      <VideoModal
        video={active}
        open={active !== null}
        onClose={() => setActive(null)}
      />
    </>
  );
}
