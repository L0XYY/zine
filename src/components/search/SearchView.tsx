"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserX } from "lucide-react";
import { allUsers } from "@/lib/local-store";
import { formatCount } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck, BadgeRow } from "@/components/ui/CreatorBadge";
import { FollowButton } from "@/components/feed/FollowButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { User } from "@/lib/types";

export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    setUsers(allUsers());
  }, []);

  const results = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    const list = q
      ? users.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q),
        )
      : users;
    return list.slice(0, 50);
  }, [users, query]);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Find Ziners
        </h1>
        <p className="text-sm text-slate-400">
          Search creators by name or @username.
        </p>
      </header>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Ziners…"
          aria-label="Search Ziners"
          className="ring-focus h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-base text-white placeholder:text-slate-500"
        />
      </div>

      {users === null ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="glass flex items-center gap-3 rounded-2xl p-3"
            >
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </li>
          ))}
        </ul>
      ) : results.length === 0 ? (
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
        <>
          {!query && (
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              Ziners to discover
            </p>
          )}
          <ul className="space-y-2">
            {results.map((u) => (
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
                  <FollowButton
                    targetUserId={u.id}
                    targetUsername={u.username}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
