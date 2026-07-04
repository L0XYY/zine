"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, UserX } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchMessages,
  fetchUserByUsername,
  getOrCreateConversation,
  sendMessage,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { InlineBadges } from "@/components/ui/CreatorBadge";
import { FullSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DirectMessage, User } from "@/lib/types";

export function MessageThread({ username }: { username: string }) {
  const { user: me, loading } = useAuth();
  const [other, setOther] = useState<User | null | undefined>(undefined);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resolve the other user + the conversation, then load the history.
  useEffect(() => {
    if (loading || !me) return;
    let alive = true;
    (async () => {
      const u = await fetchUserByUsername(username);
      if (!alive) return;
      setOther(u);
      if (u && u.id !== me.id) {
        const id = await getOrCreateConversation(u.id, me.id);
        if (!alive) return;
        setConvoId(id);
        if (id) setMessages(await fetchMessages(id));
      }
    })();
    return () => {
      alive = false;
    };
  }, [username, me, loading]);

  // Poll for new messages while the thread is open.
  useEffect(() => {
    if (!convoId) return;
    const t = setInterval(async () => {
      setMessages(await fetchMessages(convoId));
    }, 3500);
    return () => clearInterval(t);
  }, [convoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me || !convoId || !draft.trim() || sending) return;
    const body = draft.trim();
    setDraft("");
    setSending(true);
    const m = await sendMessage(convoId, me.id, body);
    setSending(false);
    if (m) setMessages((prev) => [...prev, m]);
  };

  if (loading || other === undefined) return <FullSpinner label="Loading…" />;
  if (!me) return null;
  if (other === null || other.id === me.id) {
    return (
      <div className="mx-auto grid min-h-[50vh] max-w-md place-items-center">
        <EmptyState
          icon={<UserX className="h-7 w-7" />}
          title={other === null ? "Ziner not found" : "That's you"}
          description={
            other === null
              ? `We couldn't find @${username}.`
              : "You can't message yourself."
          }
          action={{ label: "Back to messages", href: "/messages" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-11rem)] max-w-2xl flex-col lg:h-[calc(100dvh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <Link
          href="/messages"
          className="ring-focus grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link
          href={`/u/${other.username}`}
          className="flex min-w-0 items-center gap-2"
        >
          <Avatar src={other.avatarUrl} name={other.displayName} size="sm" />
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate font-semibold text-white">
              {other.displayName}
            </span>
            <InlineBadges badges={other.badges} verified={other.verified} />
          </span>
        </Link>
      </div>

      {/* Messages */}
      <div className="themed-scroll flex-1 space-y-2 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            Start the conversation with @{other.username}.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.senderId === me.id ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm",
                  m.senderId === me.id
                    ? "bg-zine-gradient text-white"
                    : "glass text-slate-100",
                )}
              >
                {m.body}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-white/10 pt-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message @${other.username}…`}
          maxLength={2000}
          className="ring-focus h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="ring-focus grid h-11 w-11 shrink-0 place-items-center rounded-full bg-zine-gradient text-white disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
