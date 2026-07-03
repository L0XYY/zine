"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCommentsForVideo } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Comment, Video } from "@/lib/types";

export function CommentsSheet({
  video,
  open,
  onClose,
}: {
  video: Video;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const seed = useMemo(() => getCommentsForVideo(video.id), [video.id]);
  const [added, setAdded] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  const comments = [...added, ...seed];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !draft.trim()) return;
    const comment: Comment = {
      id: `local_${Date.now()}`,
      videoId: video.id,
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        verified: user.verified,
        badges: user.badges,
      },
      body: draft.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    setAdded((a) => [comment, ...a]);
    setDraft("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Comments · ${comments.length}`}
    >
      <div className="flex max-h-[70vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {comments.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="h-6 w-6" />}
              title="No comments yet"
              description="Be the first to spark a conversation on this Zine."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Link href={`/u/${c.author.username}`}>
                  <Avatar
                    src={c.author.avatarUrl}
                    name={c.author.displayName}
                    size="sm"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Link
                      href={`/u/${c.author.username}`}
                      className="font-semibold text-white hover:underline"
                    >
                      {c.author.displayName}
                    </Link>
                    {c.author.verified && <VerifiedCheck className="h-3.5 w-3.5" />}
                    <span className="text-xs text-slate-500">
                      · {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 break-words text-sm text-slate-200">
                    {c.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          {user ? (
            <form onSubmit={submit} className="flex items-center gap-2">
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment…"
                maxLength={500}
                className="ring-focus h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="ring-focus grid h-11 w-11 shrink-0 place-items-center rounded-full bg-zine-gradient text-white disabled:opacity-40"
                aria-label="Post comment"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-slate-400">
              <Link href="/login" className="font-medium text-zine-green hover:underline">
                Log in
              </Link>{" "}
              to join the conversation.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
