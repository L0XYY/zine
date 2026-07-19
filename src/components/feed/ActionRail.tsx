"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Flag,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
} from "lucide-react";
import { cn, formatCount } from "@/lib/utils";
import { isLiked, toggleLike, subscribeInteractions } from "@/lib/interactions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSaved, toggleSave, subscribeSaves } from "@/lib/bookmarks";
import { isRezined, toggleRezine } from "@/lib/rezines";
import { notify, toActor } from "@/lib/notifications";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { CommentsSheet } from "./CommentsSheet";
import { ReportModal } from "./ReportModal";
import { videoShareUrl } from "@/lib/share";
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
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(video.commentsCount);
  const [saved, setSaved] = useState(false);
  const [rezined, setRezined] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  // Base like count *excluding* the current user, captured once. In Supabase
  // mode video.likesCount is a COUNT that already includes the user's like when
  // present, so subtract it; in local/demo mode the base never counts the user.
  // The displayed count then stays correct however the like is toggled (rail
  // button, or double-tap on the video).
  const baseLikes = useRef(
    Math.max(
      0,
      video.likesCount -
        (isSupabaseConfigured() && isLiked(video.id) ? 1 : 0),
    ),
  );

  useEffect(() => {
    const sync = () => {
      setLiked(isLiked(video.id));
      setRezined(isRezined(video.id));
    };
    sync();
    return subscribeInteractions(sync);
  }, [video.id]);

  const likeCount = baseLikes.current + (liked ? 1 : 0);

  useEffect(() => {
    const sync = () => setSaved(isSaved(video.id));
    sync();
    return subscribeSaves(sync);
  }, [video.id]);

  const onSpark = () => {
    if (!user) {
      toast("Log in to Spark loops", "info");
      return;
    }
    const nowLiked = toggleLike(video.id);
    setLiked(nowLiked);
    if (nowLiked) {
      toast("Sparked ⚡", "success");
      notify({
        recipientId: video.author.id,
        actor: toActor(user),
        kind: "spark",
        videoId: video.id,
        videoTitle: video.title,
      });
    }
  };

  const onSave = () => {
    if (!user) {
      toast("Log in to save Zines", "info");
      return;
    }
    const nowSaved = toggleSave(video.id);
    setSaved(nowSaved);
    toast(nowSaved ? "Saved to your collection 🔖" : "Removed from Saved", "success");
  };

  const onRezine = () => {
    if (!user) {
      toast("Log in to Rezine", "info");
      return;
    }
    const nowRezined = toggleRezine(video.id);
    setRezined(nowRezined);
    toast(
      nowRezined ? "Rezined — shared to your loop" : "Removed Rezine",
      "success",
    );
    if (nowRezined) {
      notify({
        recipientId: video.author.id,
        actor: toActor(user),
        kind: "rezine",
        videoId: video.id,
        videoTitle: video.title,
      });
    }
  };

  const onShare = async () => {
    const url = videoShareUrl(video.id);
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
          count={commentCount}
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

        <motion.div whileTap={{ scale: 0.85 }}>
          <RailButton
            icon={
              <Bookmark
                className={cn("h-6 w-6", saved && "fill-zine-mint text-zine-mint")}
              />
            }
            label="Save"
            onClick={onSave}
            active={saved}
            activeClass="bg-zine-mint/20"
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
        onCountChange={(d) => setCommentCount((c) => Math.max(0, c + d))}
      />
      <ReportModal
        video={video}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
