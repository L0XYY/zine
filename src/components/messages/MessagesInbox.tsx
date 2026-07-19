"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, PenSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchConversations } from "@/lib/data";
import {
  localConversationUnread,
  subscribeMessages,
} from "@/lib/messages-store";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { InlineBadges } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullSpinner } from "@/components/ui/Spinner";
import { NewMessageModal } from "./NewMessageModal";
import type { Conversation } from "@/lib/types";

export function MessagesInbox() {
  const { user, loading } = useAuth();
  const [convos, setConvos] = useState<Conversation[] | null>(null);
  const [composing, setComposing] = useState(false);

  const load = useCallback(() => {
    if (!user) {
      setConvos([]);
      return;
    }
    fetchConversations(user.id).then(setConvos);
  }, [user]);

  useEffect(() => {
    if (loading) return;
    load();
    // Live-refresh the inbox when a message is sent/read anywhere.
    return subscribeMessages(load);
  }, [loading, load]);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Messages
          </h1>
          <p className="text-sm text-slate-400">Your DMs with other Ziners.</p>
        </div>
        {user && (
          <button
            onClick={() => setComposing(true)}
            className="ring-focus inline-flex items-center gap-2 rounded-xl bg-zine-gradient px-3.5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-[0.98]"
          >
            <PenSquare className="h-4 w-4" />
            <span className="hidden sm:inline">New message</span>
          </button>
        )}
      </header>

      {convos === null ? (
        <FullSpinner label="Loading messages…" />
      ) : !user ? (
        <EmptyState
          icon={<MessageSquare className="h-7 w-7" />}
          title="Log in to see your messages"
          description="Your DMs with other Ziners live here."
          action={{ label: "Log in", href: "/login" }}
        />
      ) : convos.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-7 w-7" />}
          title="No messages yet"
          description="Start a conversation with another Ziner — search for someone or open their profile and hit Message."
          action={{ label: "New message", onClick: () => setComposing(true) }}
        />
      ) : (
        <ul className="space-y-2">
          {convos.map((c) => {
            const unread = user ? localConversationUnread(c.id, user.id) : false;
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.other.username}`}
                  className="glass glass-hover flex items-center gap-3 rounded-2xl p-3"
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={c.other.avatarUrl}
                      name={c.other.displayName}
                      size="md"
                    />
                    {unread && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-zine-green" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-white">
                        {c.other.displayName}
                      </span>
                      <InlineBadges
                        badges={c.other.badges}
                        verified={c.other.verified}
                      />
                    </div>
                    <p
                      className={
                        unread
                          ? "truncate text-sm font-medium text-slate-200"
                          : "truncate text-sm text-slate-400"
                      }
                    >
                      {c.lastMessage ?? "Say hi 👋"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {timeAgo(c.lastMessageAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <NewMessageModal open={composing} onClose={() => setComposing(false)} />
    </div>
  );
}
