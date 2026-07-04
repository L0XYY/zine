"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchConversations } from "@/lib/data";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { InlineBadges } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullSpinner } from "@/components/ui/Spinner";
import type { Conversation } from "@/lib/types";

export function MessagesInbox() {
  const { user, loading } = useAuth();
  const [convos, setConvos] = useState<Conversation[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setConvos([]);
      return;
    }
    let alive = true;
    fetchConversations(user.id).then((c) => {
      if (alive) setConvos(c);
    });
    return () => {
      alive = false;
    };
  }, [user, loading]);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Messages
          </h1>
          <p className="text-sm text-slate-400">Your DMs with other Ziners.</p>
        </div>
      </header>

      {convos === null ? (
        <FullSpinner label="Loading messages…" />
      ) : convos.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-7 w-7" />}
          title="No messages yet"
          description="Open a Ziner's profile and hit Message to start a conversation."
          action={{ label: "Find Ziners", href: "/search" }}
        />
      ) : (
        <ul className="space-y-2">
          {convos.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.other.username}`}
                className="glass glass-hover flex items-center gap-3 rounded-2xl p-3"
              >
                <Avatar
                  src={c.other.avatarUrl}
                  name={c.other.displayName}
                  size="md"
                />
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
                  <p className="truncate text-sm text-slate-400">
                    {c.lastMessage ?? "Say hi 👋"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">
                  {timeAgo(c.lastMessageAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
