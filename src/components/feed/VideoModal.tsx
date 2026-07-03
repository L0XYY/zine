"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Eye, Repeat2 } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { formatCount } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { VideoPlayer } from "./VideoPlayer";
import { ActionRail } from "./ActionRail";
import type { Video } from "@/lib/types";

export function VideoModal({
  video,
  open,
  onClose,
}: {
  video: Video | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && video && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 aspect-[9/16] max-h-[86vh] w-full max-w-[420px]"
          >
            <VideoPlayer video={video} active={open} />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 rounded-b-3xl bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 pr-16">
              <Link
                href={`/u/${video.author.username}`}
                className="flex items-center gap-2"
                onClick={onClose}
              >
                <Avatar
                  src={video.author.avatarUrl}
                  name={video.author.displayName}
                  size="sm"
                  ring
                />
                <span className="flex items-center gap-1 font-semibold text-white drop-shadow">
                  @{video.author.username}
                  {video.author.verified && <VerifiedCheck className="h-4 w-4" />}
                </span>
              </Link>
              <p className="line-clamp-2 text-sm text-slate-100 drop-shadow">
                {video.caption ?? video.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CategoryPill category={video.category} />
                <span className="inline-flex items-center gap-1">
                  <Repeat2 className="h-3.5 w-3.5" />
                  {formatCount(video.loops)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCount(video.views)}
                </span>
              </div>
            </div>

            <ActionRail video={video} className="absolute bottom-4 right-3" />

            <button
              onClick={onClose}
              className="ring-focus absolute -right-2 -top-2 z-20 grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-white shadow-glass sm:-right-12 sm:top-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
