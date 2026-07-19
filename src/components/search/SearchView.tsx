"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clapperboard, Search, UserX, Users } from "lucide-react";
import { searchUsers, searchVideos } from "@/lib/data";
import { cn, formatCount } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck, BadgeRow } from "@/components/ui/CreatorBadge";
import { FollowButton } from "@/components/feed/FollowButton";
import { VideoGrid } from "@/components/feed/VideoGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { User, Video } from "@/lib/types";

type Tab = "ziners" | "zines";

export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<Tab>("ziners");
  const [users, setUsers] = useState<User[] | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    let alive = true;
    setUsers(null);
    setVideos(null);
    const t = setTimeout(() => {
      searchUsers(query).then((r) => alive && setUsers(r));
      searchVideos(query).then((r) => alive && setVideos(r));
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Search
        </h1>
        <p className="text-sm text-slate-400">
          Find Ziners and Zines by name, @username, or hashtag.
        </p>
      </header>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Ziners, Zines, #hashtags…"
          aria-label="Search"
          className="ring-focus h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-base text-white placeholder:text-slate-500"
        />
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-white/10">
        <TabButton
          active={tab === "ziners"}
          onClick={() => setTab("ziners")}
          icon={<Users className="h-4 w-4" />}
          label="Ziners"
          count={users?.length}
        />
        <TabButton
          active={tab === "zines"}
          onClick={() => setTab("zines")}
          icon={<Clapperboard className="h-4 w-4" />}
          label="Zines"
          count={videos?.length}
        />
      </div>

      {tab === "ziners" ? (
        users === null ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="glass flex items-center gap-3 rounded-2xl p-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </li>
            ))}
          </ul>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<UserX className="h-7 w-7" />}
            title={query ? `No Ziners match “${query.trim()}”` : "No Ziners yet"}
            description={
              query
                ? "Try a different name or @username."
                : "As Ziners join, they'll show up here."
            }
          />
        ) : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id}>
                <div className="glass glass-hover flex items-center gap-3 rounded-2xl p-3">
                  <Link href={`/u/${u.username}`} className="shrink-0">
                    <Avatar src={u.avatarUrl} name={u.displayName} size="md" />
                  </Link>
                  <Link href={`/u/${u.username}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-white">
                        {u.displayName}
                      </span>
                      {u.verified && <VerifiedCheck className="h-4 w-4" />}
                    </div>
                    <div className="truncate text-sm text-slate-400">
                      @{u.username} · {formatCount(u.followers)} followers
                    </div>
                    {u.badges.length > 0 && (
                      <div className="mt-1.5">
                        <BadgeRow badges={u.badges} max={3} />
                      </div>
                    )}
                  </Link>
                  <FollowButton targetUserId={u.id} targetUsername={u.username} />
                </div>
              </li>
            ))}
          </ul>
        )
      ) : videos === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] rounded-2xl" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="h-7 w-7" />}
          title={query ? `No Zines match “${query.trim()}”` : "No Zines yet"}
          description={
            query
              ? "Try different keywords or a hashtag."
              : "As Ziners post loops, they'll show up here."
          }
        />
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active ? "text-white" : "text-slate-400 hover:text-white",
      )}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
          {count}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-zine-gradient" />
      )}
    </button>
  );
}
