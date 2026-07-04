"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Swords, Trophy, Users } from "lucide-react";
import { challenges } from "@/lib/mock-data";
import { fetchVideosByChallenge } from "@/lib/data";
import { CATEGORIES } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { VideoGrid } from "@/components/feed/VideoGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Video } from "@/lib/types";

const accentGlow = {
  purple: "shadow-glow",
  blue: "shadow-glow-teal",
  pink: "shadow-glow-mint",
} as const;

export function ChallengesView() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedSlug = params.get("c");
  const selected = challenges.find((c) => c.slug === selectedSlug) ?? null;
  const [entries, setEntries] = useState<Video[]>([]);

  useEffect(() => {
    if (!selectedSlug) {
      setEntries([]);
      return;
    }
    let alive = true;
    fetchVideosByChallenge(selectedSlug).then((v) => {
      if (alive) setEntries(v);
    });
    return () => {
      alive = false;
    };
  }, [selectedSlug]);

  if (selected) {
    return (
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/challenges")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All challenges
        </button>

        <div className="relative overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.bannerUrl ?? ""}
            alt=""
            className="h-52 w-full object-cover sm:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryPill category={selected.category} size="md" />
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  selected.isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                <Clock className="h-3 w-3" />
                {selected.isActive ? "Active now" : "Ended"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {selected.title}
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-slate-300">{selected.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="glass flex items-center gap-2 rounded-xl px-4 py-2.5">
                <Users className="h-4 w-4 text-zine-green" />
                <span className="text-sm font-semibold text-white">
                  {formatCount(selected.entries)}
                </span>
                <span className="text-sm text-slate-400">entries</span>
              </div>
              <div className="glass flex items-center gap-2 rounded-xl px-4 py-2.5">
                <Trophy className="h-4 w-4 text-amber-300" />
                <span className="text-sm text-slate-400">Featured placement</span>
              </div>
            </div>
          </div>
          <div className="glass flex flex-col justify-center gap-3 rounded-2xl p-5">
            <p className="text-sm text-slate-300">
              Think you&apos;ve got the loop? Drop your entry with the challenge
              tag.
            </p>
            {selected.isActive ? (
              <Button href="/upload" className="w-full">
                Enter challenge
              </Button>
            ) : (
              <Button disabled className="w-full">
                Challenge ended
              </Button>
            )}
          </div>
        </div>

        <h2 className="mb-4 mt-10 font-display text-xl font-bold text-white">
          Top entries
        </h2>
        {entries.length ? (
          <VideoGrid videos={entries} />
        ) : (
          <EmptyState
            icon={<Swords className="h-7 w-7" />}
            title="No entries yet"
            description="Be the first to enter this challenge and set the bar."
            action={{ label: "Enter challenge", href: "/upload" }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow">
          <Swords className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Challenges
          </h1>
          <p className="text-sm text-slate-400">
            Pick a lane, drop a loop, get featured.
          </p>
        </div>
      </header>

      {/* Categories */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            className="glass flex flex-col items-center gap-1.5 rounded-2xl px-3 py-5 text-center"
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-sm font-semibold text-white">{c.label}</span>
            <span className="text-[11px] text-slate-500">{c.blurb}</span>
          </div>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {challenges.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/challenges?c=${c.slug}`)}
            className={`ring-focus group relative overflow-hidden rounded-3xl text-left ${accentGlow[c.accent]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.bannerUrl ?? ""}
              alt=""
              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-center gap-2">
                <CategoryPill category={c.category} />
                {!c.isActive && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                    Ended
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-white">
                {c.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-300">
                {c.description}
              </p>
              <p className="mt-2 text-xs font-medium text-zine-green">
                {formatCount(c.entries)} entries
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
