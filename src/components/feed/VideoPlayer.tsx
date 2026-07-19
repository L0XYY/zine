"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-store";
import { Spinner } from "@/components/ui/Spinner";
import type { Video } from "@/lib/types";

// Shared mute preference so a mute/unmute choice sticks across the whole feed.
// Default is SOUND ON — Zines don't open muted. (Browsers still block unmuted
// autoplay until the first interaction; the player falls back to a muted play
// and un-mutes on the first gesture — see below — so audio starts as soon as
// it's allowed instead of the app forcing everything muted.)
let sharedMuted = false;
const muteListeners = new Set<(m: boolean) => void>();
function setSharedMuted(m: boolean) {
  sharedMuted = m;
  muteListeners.forEach((l) => l(m));
}

/** Flip the feed-wide mute preference (used by the keyboard shortcut). */
export function toggleSharedMute() {
  setSharedMuted(!sharedMuted);
}

// --- Autoplay audio unlock --------------------------------------------------
// Browsers reject unmuted autoplay until the user has interacted with the page.
// When that happens we keep the Zine looping muted, then un-mute every waiting
// player on the very first pointer/keyboard/touch gesture — so sound turns on
// the instant it's permitted, without the app ever choosing to mute.
const pendingUnmute = new Set<() => void>();
let gestureBound = false;

function runPendingUnmutes() {
  pendingUnmute.forEach((fn) => fn());
  pendingUnmute.clear();
}

function bindFirstGesture() {
  if (gestureBound || typeof window === "undefined") return;
  gestureBound = true;
  const onGesture = () => {
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
    window.removeEventListener("touchstart", onGesture);
    gestureBound = false;
    runPendingUnmutes();
  };
  window.addEventListener("pointerdown", onGesture, { passive: true });
  window.addEventListener("keydown", onGesture);
  window.addEventListener("touchstart", onGesture, { passive: true });
}

/** Queue a player to be un-muted on the next user gesture (if sound is wanted). */
function unmuteOnFirstGesture(fn: () => void) {
  pendingUnmute.add(fn);
  bindFirstGesture();
}

export function VideoPlayer({
  video,
  active,
  onLoop,
  className,
  rounded = true,
}: {
  video: Video;
  active: boolean;
  onLoop?: () => void;
  className?: string;
  rounded?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(sharedMuted);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState<string | null>(null);

  // Resolve the playable source — rehydrates IndexedDB blobs for uploaded Zines
  // so they survive reloads. Remote / sample / https URLs pass straight through.
  useEffect(() => {
    let alive = true;
    setSrc(null);
    setStatus("loading");
    resolveMediaUrl(video.videoUrl).then((u) => {
      if (!alive) return;
      if (u) setSrc(u);
      else setStatus("error");
    });
    return () => {
      alive = false;
    };
  }, [video.videoUrl]);

  // keep local mute in sync with the shared preference
  useEffect(() => {
    const listener = (m: boolean) => setMuted(m);
    muteListeners.add(listener);
    return () => {
      muteListeners.delete(listener);
    };
  }, []);

  // Play / pause based on whether this item is the active one in the feed.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    if (active && status !== "error") {
      el.play()
        .then(() => setPaused(false))
        .catch(() => {
          // Unmuted autoplay was blocked. Rather than sit paused, keep the loop
          // going muted and un-mute the moment the user interacts — so the app
          // never chooses to stay muted.
          if (!el.muted) {
            el.muted = true;
            el.play()
              .then(() => setPaused(false))
              .catch(() => setPaused(true));
            unmuteOnFirstGesture(() => {
              const v = ref.current;
              if (v && !sharedMuted) v.muted = false;
            });
          } else {
            setPaused(true);
          }
        });
    } else {
      el.pause();
      el.currentTime = 0;
      setProgress(0);
    }
  }, [active, status, muted]);

  const handleEnded = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Manual loop so we can count each pass.
    el.currentTime = 0;
    void el.play().catch(() => {});
    onLoop?.();
  }, [onLoop]);

  const handleTimeUpdate = useCallback(() => {
    const el = ref.current;
    if (!el || !el.duration) return;
    setProgress((el.currentTime / el.duration) * 100);
  }, []);

  const togglePlay = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSharedMuted(!sharedMuted);
  }, []);

  return (
    <div
      className={cn(
        "group relative h-full w-full overflow-hidden bg-ink-900",
        rounded && "rounded-3xl",
        className,
      )}
    >
      {/* Poster while loading */}
      {video.thumbnailUrl && status === "loading" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60 blur-sm"
        />
      )}

      {status !== "error" ? (
        <video
          ref={ref}
          src={src ?? undefined}
          poster={video.thumbnailUrl ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted={muted}
          preload="metadata"
          onClick={togglePlay}
          onCanPlay={() => setStatus("ready")}
          onError={() => setStatus("error")}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-900 text-center text-slate-400">
          {video.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}
          <VolumeX className="relative h-8 w-8" />
          <p className="relative max-w-[16rem] px-6 text-sm">
            This Zine couldn&apos;t be loaded. It may have been removed.
          </p>
        </div>
      )}

      {/* Buffering spinner */}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Spinner className="h-8 w-8 text-white/80" />
        </div>
      )}

      {/* Paused overlay */}
      {status === "ready" && paused && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-black/20"
          aria-label="Play"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-black/50 backdrop-blur">
            <Play className="h-7 w-7 translate-x-0.5 text-white" />
          </span>
        </button>
      )}

      {/* Controls */}
      {status === "ready" && (
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={toggleMute}
            className="ring-focus grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={togglePlay}
            className="ring-focus grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition hover:bg-black/60 group-hover:opacity-100"
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
        <div
          className="h-full bg-zine-gradient transition-[width] duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
