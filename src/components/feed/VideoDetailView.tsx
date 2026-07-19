"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clapperboard, Eye, Repeat2 } from "lucide-react";
import { fetchVideoById, markViewed } from "@/lib/data";
import { formatCount, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { HashtagText } from "@/components/ui/HashtagText";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullSpinner } from "@/components/ui/Spinner";
import { VideoPlayer } from "./VideoPlayer";
import { ActionRail } from "./ActionRail";
import { FollowButton } from "./FollowButton";
import type { Video } from "@/lib/types";

export function VideoDetailView({ id }: { id: string }) {
  const [video, setVideo] = useState<Video | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetchVideoById(id).then((v) => {
      if (!alive) return;
      setVideo(v);
      if (v) void markViewed(v.id);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (video === undefined) return <FullSpinner label="Loading Zine…" />;

  if (video === null) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center">
        <EmptyState
          icon={<Clapperboard className="h-7 w-7" />}
          title="Zine not found"
          description="This loop may have been removed or never existed."
          action={{ label: "Back to feed", href: "/feed" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/feed"
        className="ring-focus mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <div className="relative aspect-[9/16] w-full">
        <VideoPlayer video={video} active />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 rounded-b-3xl bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 pr-16">
          <div className="flex items-center gap-2">
            <Link href={`/u/${video.author.username}`}>
              <Avatar
                src={video.author.avatarUrl}
                name={video.author.displayName}
                size="sm"
                ring
              />
            </Link>
            <Link
              href={`/u/${video.author.username}`}
              className="flex items-center gap-1 font-semibold text-white drop-shadow hover:underline"
            >
              @{video.author.username}
              {video.author.verified && <VerifiedCheck className="h-4 w-4" />}
            </Link>
            <FollowButton
              targetUserId={video.author.id}
              targetUsername={video.author.username}
            />
          </div>
          <p className="text-sm text-slate-100 drop-shadow">
            <HashtagText text={video.caption ?? video.title} />
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <CategoryPill category={video.category} />
            <span className="inline-flex items-center gap-1">
              <Repeat2 className="h-3.5 w-3.5" />
              {formatCount(video.loops)} loops
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(video.views)}
            </span>
            <span className="text-slate-500">· {timeAgo(video.createdAt)}</span>
          </div>
        </div>

        <ActionRail video={video} className="absolute bottom-4 right-3" />
      </div>
    </div>
  );
}
