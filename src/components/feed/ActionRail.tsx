"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { cn, formatCount } from "@/lib/utils";
import { isLiked, toggleLike } from "@/lib/interactions";
import { useToast } from "@/components/providers/ToastProvider";
import { CommentsSheet } from "./CommentsSheet";
import { ReportModal } from "./ReportModal";
import type { Video } from "@/lib/types";

function RailButton({
  icon,
  label,
  count,
  onClick,
  active,
  activeClass,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="ring-focus group flex flex-col items-center gap-1"
      aria-label={label}
    >
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-all duration-200 group-hover:scale-110 group-hover:bg-black/60",
          active && activeClass,
        )}
      >
        {icon}
      </span>
      {count !== undefined && (
        <span className="text-xs font-semibold text-white drop-shadow">
          {formatCount(count)}
        </span>
      )}
    </button>
  );
}

export function ActionRail({
  video,
  className,
}: {
  video: Video;
  className?: string;
}) {
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likesCount);
  const [rezined, setRezined] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    setLiked(isLiked(video.id));
  }, [video.id]);

  const onSpark = () => {
    const nowLiked = toggleLike(video.id);
    setLiked(nowLiked);
    setLikeCount((c) => c + (nowLiked ? 1 : -1));
    if (nowLiked) toast("Sparked ⚡", "success");
  };

  const onRezine = () => {
    setRezined((r) => !r);
    toast(rezined ? "Removed Rezine" : "Rezined — shared to your loop", "success");
  };

  const onShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/feed`
        : "https://zine.app/feed";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `${video.title} · Zine`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Couldn't share right now", "error");
    }
  };

  return (
    <>
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <motion.div whileTap={{ scale: 0.85 }}>
          <RailButton
            icon={
              <Heart
                className={cn("h-6 w-6", liked && "fill-rose-500 text-rose-500")}
              />
            }
            label="Spark"
            count={likeCount}
            onClick={onSpark}
            active={liked}
            activeClass="bg-rose-500/20"
          />
        </motion.div>

        <RailButton
          icon={<MessageCircle className="h-6 w-6" />}
          label="Comments"
          count={video.commentsCount}
          onClick={() => setCommentsOpen(true)}
        />

        <motion.div whileTap={{ scale: 0.85 }}>
          <RailButton
            icon={<Repeat2 className="h-6 w-6" />}
            label="Rezine"
            onClick={onRezine}
            active={rezined}
            activeClass="bg-emerald-500/20 text-emerald-300"
          />
        </motion.div>

        <RailButton
          icon={<Share2 className="h-6 w-6" />}
          label="Share"
          onClick={onShare}
        />

        <RailButton
          icon={<Flag className="h-5 w-5" />}
          label="Report"
          onClick={() => setReportOpen(true)}
        />
      </div>

      <CommentsSheet
        video={video}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
      <ReportModal
        video={video}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
