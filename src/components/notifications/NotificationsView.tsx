"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  clearNotifications,
  markAllRead,
  notificationsFor,
  subscribeNotifications,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications";
import { timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullSpinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { InlineBadges } from "@/components/ui/CreatorBadge";

const KIND_META: Record<
  NotificationKind,
  { icon: React.ReactNode; verb: string; tone: string }
> = {
  spark: {
    icon: <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />,
    verb: "Sparked your Zine",
    tone: "text-rose-300",
  },
  comment: {
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    verb: "commented on your Zine",
    tone: "text-sky-300",
  },
  follow: {
    icon: <UserPlus className="h-3.5 w-3.5" />,
    verb: "started following you",
    tone: "text-emerald-300",
  },
  rezine: {
    icon: <Repeat2 className="h-3.5 w-3.5" />,
    verb: "Rezined your loop",
    tone: "text-teal-300",
  },
  message: {
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    verb: "sent you a message",
    tone: "text-zine-mint",
  },
};

function hrefFor(n: AppNotification): string {
  if (n.kind === "message") return `/messages/${n.actor.username}`;
  if (n.kind === "follow") return `/u/${n.actor.username}`;
  if (n.videoId) return `/z/${n.videoId}`;
  return `/u/${n.actor.username}`;
}

export function NotificationsView() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<AppNotification[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setItems([]);
      return;
    }
    const load = () => setItems(notificationsFor(user.id));
    load();
    const unsub = subscribeNotifications(load);
    // Mark everything read a beat after opening the page.
    const t = setTimeout(() => markAllRead(user.id), 800);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [user, loading]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        icon={<Bell className="h-5 w-5" />}
        title="Notifications"
        subtitle="Sparks, comments, follows and more."
        action={
          user && items && items.length > 0 ? (
            <button
              onClick={() => {
                clearNotifications(user.id);
              }}
              className="ring-focus rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Clear all
            </button>
          ) : undefined
        }
      />

      {!user && !loading ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="Log in to see notifications"
          description="When Ziners spark, comment, or follow you, it shows up here."
          action={{ label: "Log in", href: "/login" }}
        />
      ) : items === null ? (
        <FullSpinner label="Loading…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="You're all caught up"
          description="Sparks, comments, follows and messages from other Ziners will land here."
          action={{ label: "Explore the feed", href: "/feed" }}
        />
      ) : (
        <ul className="space-y-1.5">
          {items.map((n) => {
            const meta = KIND_META[n.kind];
            return (
              <li key={n.id}>
                <Link
                  href={hrefFor(n)}
                  className={
                    "glass glass-hover flex items-center gap-3 rounded-2xl p-3 " +
                    (n.read ? "" : "border-zine-green/30 bg-zine-green/[0.06]")
                  }
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={n.actor.avatarUrl}
                      name={n.actor.displayName}
                      size="md"
                    />
                    <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink-950 bg-ink-800">
                      {meta.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200">
                      <span className="inline-flex items-center gap-1 font-semibold text-white">
                        {n.actor.displayName}
                        <InlineBadges
                          badges={n.actor.badges}
                          verified={n.actor.verified}
                        />
                      </span>{" "}
                      <span className={meta.tone}>{meta.verb}</span>
                    </p>
                    {n.preview && (
                      <p className="mt-0.5 truncate text-sm text-slate-400">
                        “{n.preview}”
                      </p>
                    )}
                    {n.videoTitle && !n.preview && (
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {n.videoTitle}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {timeAgo(n.createdAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
