"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { fetchComments, addComment } from "@/lib/data";
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
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setComments(null);
    fetchComments(video.id).then((c) => {
      if (alive) setComments(c);
    });
    return () => {
      alive = false;
    };
  }, [open, video.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !draft.trim() || sending) return;
    const body = draft.trim();
    setDraft("");
    setSending(true);
    const c = await addComment(video.id, body, user);
    setSending(false);
    if (c) setComments((prev) => [c, ...(prev ?? [])]);
  };

  const count = comments?.length ?? 0;

  return (
    <Modal open={open} onClose={onClose} title={`Comments · ${count}`}>
      <div className="flex max-h-[70vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {comments === null ? (
            <div className="grid place-items-center py-10">
              <Spinner className="h-6 w-6 text-zine-teal" />
            </div>
          ) : comments.length === 0 ? (
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
                disabled={!draft.trim() || sending}
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
