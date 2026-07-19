"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Heart, Repeat2 } from "lucide-react";
import { incrementLoops, markViewed } from "@/lib/data";
import { isLiked, toggleLike } from "@/lib/interactions";
import { notify, toActor } from "@/lib/notifications";
import { formatCount } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { HashtagText } from "@/components/ui/HashtagText";
import { Avatar } from "@/components/ui/Avatar";
import { VideoPlayer } from "./VideoPlayer";
import { ActionRail } from "./ActionRail";
import { FollowButton } from "./FollowButton";
import type { Video } from "@/lib/types";

export function FeedItem({
  video,
  active,
}: {
  video: Video;
  active: boolean;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [loops, setLoops] = useState(video.loops);
  const [views, setViews] = useState(video.views);
  const [burstKey, setBurstKey] = useState(0);
  const lastLoopWrite = useRef(0);
  const viewedRef = useRef(false);

  // Count a view the first time this Zine becomes the active one.
  useEffect(() => {
    if (active && !viewedRef.current) {
      viewedRef.current = true;
      void markViewed(video.id);
      setViews((v) => v + 1);
    }
  }, [active, video.id]);

  const handleLoop = () => {
    setLoops((l) => l + 1);
    const now = Date.now();
    if (now - lastLoopWrite.current > 4000) {
      lastLoopWrite.current = now;
      void incrementLoops(video.id);
    }
  };

  // Double-tap / double-click to Spark (always likes, never unlikes), with a
  // heart burst — the familiar short-video gesture. Ignored when the tap lands
  // on a control (rail button, author link) so those keep their own behavior.
  const handleDoubleTap = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    if (!user) {
      toast("Log in to Spark loops", "info");
      return;
    }
    setBurstKey((k) => k + 1);
    if (!isLiked(video.id)) {
      toggleLike(video.id);
      notify({
        recipientId: video.author.id,
        actor: toActor(user),
        kind: "spark",
        videoId: video.id,
        videoTitle: video.title,
      });
    }
  };

  return (
    <section className="relative flex h-full w-full snap-start items-center justify-center py-3">
      <div className="relative mx-auto flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-[440px] items-stretch">
        {/* Video card */}
        <div
          className="relative w-full"
          onDoubleClick={handleDoubleTap}
        >
          <VideoPlayer video={video} active={active} onLoop={handleLoop} />

          {/* Heart burst on double-tap */}
          <AnimatePresence>
            {burstKey > 0 && (
              <motion.div
                key={burstKey}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
              >
                <Heart className="h-24 w-24 fill-rose-500 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient scrim for legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 rounded-b-3xl bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Bottom-left meta overlay */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 pb-24 pr-16 lg:pb-4">
            <div className="min-w-0 space-y-2">
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

              <p className="line-clamp-2 text-sm text-slate-100 drop-shadow">
                <HashtagText text={video.caption ?? video.title} />
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <CategoryPill category={video.category} />
                <span className="inline-flex items-center gap-1">
                  <Repeat2 className="h-3.5 w-3.5" />
                  {formatCount(loops)} loops
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCount(views)}
                </span>
              </div>
            </div>
          </div>

          {/* Right action rail */}
          <ActionRail
            video={video}
            className="absolute bottom-24 right-3 lg:bottom-4"
          />
        </div>
      </div>
    </section>
  );
}
