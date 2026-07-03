"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { challenges } from "@/lib/mock-data";
import { formatCount } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function ChallengesSection() {
  const featured = challenges.slice(0, 2);

  return (
    <section id="challenges" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Pick a lane. <span className="text-gradient">Start looping.</span>
            </h2>
            <p className="mt-4 text-slate-300">
              Six categories, endless challenges. Whatever you make, there&apos;s
              a corner of Zine already hyped for it.
            </p>
          </div>
          <Button href="/challenges" variant="outline" size="sm">
            All challenges <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Category chips */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <motion.a
              key={c.key}
              href="/feed"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="glass glass-hover flex flex-col items-center gap-2 rounded-2xl px-3 py-5 text-center"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-sm font-semibold text-white">{c.label}</span>
              <span className="text-[11px] text-slate-400">{c.blurb}</span>
            </motion.a>
          ))}
        </div>

        {/* Featured challenges */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {featured.map((c) => (
            <motion.a
              key={c.id}
              href={`/challenges?c=${c.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="group relative overflow-hidden rounded-3xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.bannerUrl ?? ""}
                alt=""
                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {formatCount(c.entries)} entries
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold text-white">
                  {c.title}
                </h3>
                <p className="mt-1 line-clamp-1 max-w-md text-sm text-slate-300">
                  {c.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
