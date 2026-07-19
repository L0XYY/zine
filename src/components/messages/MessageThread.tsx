"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, UserX } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchMessages,
  fetchUserByUsername,
  getOrCreateConversation,
  sendMessage,
} from "@/lib/data";
import { markConversationRead } from "@/lib/messages-store";
import { notify, toActor } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { InlineBadges } from "@/components/ui/CreatorBadge";
import { FullSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DirectMessage, User } from "@/lib/types";

/** Merge polled messages into the current list without dropping optimistic ones
 *  or duplicating by id, keeping chronological order. */
function mergeMessages(
  current: DirectMessage[],
  incoming: DirectMessage[],
): DirectMessage[] {
  const byId = new Map<string, DirectMessage>();
  for (const m of current) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageThread({ username }: { username: string }) {
  const { user: me, loading } = useAuth();
  const [other, setOther] = useState<User | null | undefined>(undefined);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resolve the other user + the conversation, then load the history.
  useEffect(() => {
    if (loading || !me) return;
    let alive = true;
    (async () => {
      const u = await fetchUserByUsername(username);
      if (!alive) return;
      setOther(u);
      if (u && u.id !== me.id) {
        const id = await getOrCreateConversation(u, me);
        if (!alive) return;
        setConvoId(id);
        if (id) {
          const initial = await fetchMessages(id);
          if (!alive) return;
          setMessages(initial);
          markConversationRead(id);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [username, me, loading]);

  // Poll for new messages while the thread is open (real-time in Supabase mode,
  // cross-tab sync in local mode).
  useEffect(() => {
    if (!convoId) return;
    const t = setInterval(async () => {
      const fresh = await fetchMessages(convoId);
      setMessages((prev) => mergeMessages(prev, fresh));
      markConversationRead(convoId);
    }, 3000);
    return () => clearInterval(t);
  }, [convoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const grouped = useMemo(() => {
    const out: { day: string; items: DirectMessage[] }[] = [];
    for (const m of messages) {
      const day = dayLabel(m.createdAt);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    }
    return out;
  }, [messages]);

  const submit = useCallback(async () => {
    if (!me || !convoId || !draft.trim() || sending) return;
    const body = draft.trim();
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);
    const m = await sendMessage(convoId, me.id, body);
    setSending(false);
    if (m) {
      setMessages((prev) => mergeMessages(prev, [m]));
      markConversationRead(convoId, m.createdAt);
      if (other) {
        notify({
          recipientId: other.id,
          actor: toActor(me),
          kind: "message",
          preview: body,
        });
      }
    }
  }, [me, convoId, draft, sending, other]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setDraft(el.value);
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
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
          className="flex min-w-0 items-center gap-2.5"
        >
          <Avatar src={other.avatarUrl} name={other.displayName} size="sm" ring />
          <span className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-1">
              <span className="truncate font-semibold text-white">
                {other.displayName}
              </span>
              <InlineBadges badges={other.badges} verified={other.verified} />
            </span>
            <span className="truncate text-xs text-slate-400">
              @{other.username}
            </span>
          </span>
        </Link>
      </div>

      {/* Messages */}
      <div className="themed-scroll flex-1 space-y-1.5 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <Avatar src={other.avatarUrl} name={other.displayName} size="lg" ring />
            <div>
              <p className="font-semibold text-white">{other.displayName}</p>
              <p className="text-sm text-slate-500">
                Say hi to @{other.username} 👋
              </p>
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.day} className="space-y-1.5">
              <div className="my-3 flex items-center justify-center">
                <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-500">
                  {group.day}
                </span>
              </div>
              {group.items.map((m, i) => {
                const mine = m.senderId === me.id;
                const prev = group.items[i - 1];
                const stacked = !!prev && prev.senderId === m.senderId;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "group flex items-end gap-2",
                      mine ? "justify-end" : "justify-start",
                      stacked ? "mt-0.5" : "mt-2",
                    )}
                  >
                    {!mine && (
                      <span className="w-7 shrink-0">
                        {!stacked && (
                          <Avatar
                            src={other.avatarUrl}
                            name={other.displayName}
                            size="xs"
                          />
                        )}
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                        mine
                          ? "bg-zine-gradient text-white"
                          : "glass text-slate-100",
                        stacked && (mine ? "rounded-tr-md" : "rounded-tl-md"),
                      )}
                      title={clockTime(m.createdAt)}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex items-end gap-2 border-t border-white/10 pt-3"
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={`Message @${other.username}…`}
          maxLength={2000}
          className="ring-focus max-h-[140px] min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="ring-focus grid h-11 w-11 shrink-0 place-items-center rounded-full bg-zine-gradient text-white transition disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
