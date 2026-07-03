"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Film,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { UPLOAD, CATEGORIES } from "@/lib/constants";
import { challenges } from "@/lib/mock-data";
import { saveLocalVideo } from "@/lib/local-store";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/ErrorState";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { Category, Video } from "@/lib/types";

const SAMPLE_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";

interface Loaded {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  isSample: boolean;
  fileName?: string;
}

/** Capture a poster frame + duration from a local file via canvas. */
function captureFromFile(url: string): Promise<{ thumb: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;

    video.onloadedmetadata = () => {
      const seekTo = Math.min(1, (video.duration || 2) / 2);
      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 360;
          canvas.height = 640;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const scale = Math.max(360 / video.videoWidth, 640 / video.videoHeight);
            const w = video.videoWidth * scale;
            const h = video.videoHeight * scale;
            ctx.drawImage(video, (360 - w) / 2, (640 - h) / 2, w, h);
            resolve({ thumb: canvas.toDataURL("image/jpeg", 0.7), duration: video.duration });
          } else {
            resolve({ thumb: "", duration: video.duration });
          }
        } catch {
          resolve({ thumb: "", duration: video.duration });
        }
      };
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = seekTo;
    };
    video.onerror = () => reject(new Error("We couldn't read that video file."));
  });
}

export function UploadForm() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<Category>("MEMES");
  const [challengeSlug, setChallengeSlug] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileError(null);
    setLoaded(null);

    if (!(UPLOAD.acceptedTypes as readonly string[]).includes(file.type)) {
      setFileError("Unsupported format. Upload an MP4, WebM, or MOV video.");
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > UPLOAD.maxSizeMb) {
      setFileError(
        `That file is ${sizeMb.toFixed(0)}MB. Max upload size is ${UPLOAD.maxSizeMb}MB.`,
      );
      return;
    }

    setAnalyzing(true);
    const url = URL.createObjectURL(file);
    try {
      const { thumb, duration } = await captureFromFile(url);
      if (duration > UPLOAD.maxDuration + 0.5) {
        URL.revokeObjectURL(url);
        setAnalyzing(false);
        setFileError(
          `Zines are ${UPLOAD.minDuration}–${UPLOAD.maxDuration}s. This clip is ${formatDuration(
            duration,
          )} — trim it and try again.`,
        );
        return;
      }
      if (duration < UPLOAD.minDuration - 0.5) {
        URL.revokeObjectURL(url);
        setAnalyzing(false);
        setFileError(
          `That clip is only ${duration.toFixed(1)}s. Zines need to be at least ${UPLOAD.minDuration}s.`,
        );
        return;
      }
      setLoaded({
        videoUrl: url,
        thumbnailUrl: thumb,
        duration,
        isSample: false,
        fileName: file.name,
      });
    } catch (e) {
      URL.revokeObjectURL(url);
      setFileError(
        e instanceof Error ? e.message : "Something went wrong reading that file.",
      );
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const useSample = () => {
    setFileError(null);
    setLoaded({
      videoUrl: SAMPLE_URL,
      thumbnailUrl: "https://picsum.photos/seed/zine-upload/360/640",
      duration: 8,
      isSample: true,
    });
  };

  const reset = () => {
    if (loaded && !loaded.isSample) URL.revokeObjectURL(loaded.videoUrl);
    setLoaded(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!loaded) {
      setFormError("Add a video clip first.");
      return;
    }
    if (!title.trim()) {
      setFormError("Give your Zine a title.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const now = new Date().toISOString();
    const video: Video = {
      id: `v_local_${Date.now()}`,
      userId: user.id,
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        verified: user.verified,
        partnered: user.partnered,
        role: user.role,
        badges: user.badges,
      },
      title: title.trim().slice(0, 120),
      caption: caption.trim().slice(0, 280) || null,
      videoUrl: loaded.videoUrl,
      thumbnailUrl: loaded.thumbnailUrl || null,
      duration: loaded.duration,
      category,
      views: 0,
      loops: 0,
      likesCount: 0,
      commentsCount: 0,
      isFeatured: false,
      isTrending: false,
      isDeleted: false,
      challengeSlug: challengeSlug || null,
      createdAt: now,
    };
    saveLocalVideo(video);
    setSubmitting(false);
    toast("Your Zine is live 🎬", "success");
    router.push(`/u/${user.username}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Upload a Zine
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {UPLOAD.minDuration}–{UPLOAD.maxDuration} second loops only. Max{" "}
          {UPLOAD.maxSizeMb}MB. Make every second count.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        {/* Drop zone / preview */}
        {!loaded ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={cn(
              "glass flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors",
              dragging ? "border-zine-green bg-zine-green/10" : "border-white/15",
            )}
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow">
              {analyzing ? (
                <Clock className="h-7 w-7 animate-pulse" />
              ) : (
                <UploadCloud className="h-7 w-7" />
              )}
            </div>
            <p className="mt-4 font-medium text-white">
              {analyzing ? "Analyzing your clip…" : "Drag & drop your clip here"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              MP4, WebM or MOV · {UPLOAD.minDuration}–{UPLOAD.maxDuration}s
            </p>
            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={analyzing}
              >
                <Film className="h-4 w-4" /> Choose file
              </Button>
              <span className="text-xs text-slate-500">or</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={useSample}
                disabled={analyzing}
              >
                <Sparkles className="h-4 w-4" /> Try a sample clip
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <FormError message={fileError} />
          </div>
        ) : (
          <div className="glass flex gap-4 rounded-3xl p-4">
            <div className="relative aspect-[9/16] w-28 shrink-0 overflow-hidden rounded-xl bg-ink-800">
              <video
                src={loaded.videoUrl}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Clip ready</span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-300">
                {loaded.isSample ? "Sample loop" : loaded.fileName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" /> {formatDuration(loaded.duration)} · loops seamlessly
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-3 inline-flex w-fit items-center gap-1 text-xs text-slate-400 hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="Give your loop a name"
              className="ring-focus h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Caption <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 280))}
              placeholder="Add a caption, hashtags, whatever fits the loop…"
              rows={3}
              className="ring-focus w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {caption.length}/280
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    category === c.key
                      ? "border-transparent bg-zine-gradient text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                  )}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Challenge <span className="text-slate-500">(optional)</span>
            </label>
            <select
              value={challengeSlug}
              onChange={(e) => setChallengeSlug(e.target.value)}
              className="ring-focus h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="">No challenge</option>
              {challenges
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-ink-800">
                    {c.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {challengeSlug && (
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm text-slate-300">
            Entering{" "}
            <CategoryPill
              category={
                challenges.find((c) => c.slug === challengeSlug)?.category ??
                "CHALLENGES"
              }
            />
            <span className="font-medium text-white">
              {challenges.find((c) => c.slug === challengeSlug)?.title}
            </span>
          </div>
        )}

        <FormError message={formError} />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" href="/feed">
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={!loaded}>
            <Sparkles className="h-4 w-4" /> Post Zine
          </Button>
        </div>
      </form>
    </div>
  );
}
