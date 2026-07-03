"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Play, Repeat2 } from "lucide-react";
import { formatCount, formatDuration } from "@/lib/utils";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { CategoryPill } from "@/components/ui/CategoryPill";
import type { Video } from "@/lib/types";

export function VideoCard({
  video,
  onOpen,
  rank,
}: {
  video: Video;
  onOpen: (video: Video) => void;
  rank?: number;
}) {
  return (
    <motion.button
      layout
      onClick={() => onOpen(video)}
      whileHover={{ y: -4 }}
      className="ring-focus group relative block w-full overflow-hidden rounded-2xl text-left"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-ink-800">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-zine-gradient opacity-30" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

        {/* Rank badge for trending */}
        {rank !== undefined && (
          <span className="absolute left-2 top-2 grid h-7 min-w-7 place-items-center rounded-lg bg-black/50 px-1.5 font-display text-sm font-bold text-white backdrop-blur">
            {rank}
          </span>
        )}

        <span className="absolute right-2 top-2">
          <CategoryPill category={video.category} />
        </span>

        {/* Hover play affordance */}
        <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur">
            <Play className="h-6 w-6 translate-x-0.5 text-white" />
          </span>
        </div>

        <span className="absolute bottom-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {formatDuration(video.duration)}
        </span>

        {/* Bottom meta */}
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-3">
          <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
            {video.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="flex items-center gap-1 truncate">
              @{video.author.username}
              {video.author.verified && <VerifiedCheck className="h-3 w-3" />}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {formatCount(video.likesCount)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-3 w-3" /> {formatCount(video.loops)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
