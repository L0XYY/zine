"use client";

import Link from "next/link";
import { Flame, Swords, TrendingUp } from "lucide-react";
import { formatCount } from "@/lib/utils";
import { getTrending, challenges } from "@/lib/mock-data";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";

export function RightPanel() {
  const trending = getTrending().slice(0, 5);
  const activeChallenges = challenges.filter((c) => c.isActive).slice(0, 3);

  return (
    <aside className="sticky top-0 hidden h-screen w-[340px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-white/5 px-4 py-6 xl:flex themed-scroll">
      <GlassPanel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-zine-mint" />
          <h2 className="font-display text-sm font-semibold text-white">
            Hot Loops
          </h2>
          <Link
            href="/trending"
            className="ml-auto text-xs text-slate-400 hover:text-white"
          >
            See all
          </Link>
        </div>
        <ol className="space-y-1">
          {trending.map((v, i) => (
            <li key={v.id}>
              <Link
                href="/trending"
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
              >
                <span className="w-4 text-center font-display text-sm font-bold text-slate-500 group-hover:text-zine-green">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {v.title}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                    @{v.author.username}
                    {v.author.verified && <VerifiedCheck className="h-3 w-3" />}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <TrendingUp className="h-3 w-3" />
                  {formatCount(v.loops)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </GlassPanel>

      <GlassPanel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Swords className="h-4 w-4 text-zine-green" />
          <h2 className="font-display text-sm font-semibold text-white">
            Live Challenges
          </h2>
          <Link
            href="/challenges"
            className="ml-auto text-xs text-slate-400 hover:text-white"
          >
            See all
          </Link>
        </div>
        <div className="space-y-2">
          {activeChallenges.map((c) => (
            <Link
              key={c.id}
              href={`/challenges?c=${c.slug}`}
              className="glass-hover block rounded-xl border border-white/5 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <CategoryPill category={c.category} />
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {c.description}
              </p>
              <p className="mt-2 text-xs font-medium text-zine-green">
                {formatCount(c.entries)} entries
              </p>
            </Link>
          ))}
        </div>
      </GlassPanel>

      <p className="px-2 text-xs leading-relaxed text-slate-600">
        Zine — short videos that loop different. Built for creators. © {new Date().getFullYear()}
      </p>
    </aside>
  );
}
