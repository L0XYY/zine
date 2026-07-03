"use client";

import { motion } from "framer-motion";
import { BadgePill } from "@/components/ui/CreatorBadge";
import { BADGES } from "@/lib/constants";
import type { BadgeKind } from "@/lib/types";

const ORDER: BadgeKind[] = ["VERIFIED", "PARTNER", "FOUNDER", "STAFF", "EARLY"];

export function BadgesSection() {
  return (
    <section id="badges" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Badges that actually{" "}
            <span className="text-gradient">mean something.</span>
          </h2>
          <p className="mt-4 text-slate-300">
            From your first loop to your first million, Zine recognises the
            Ziners building the platform.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDER.map((kind, i) => {
            const meta = BADGES[kind];
            return (
              <motion.div
                key={kind}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="glass glass-hover flex items-center gap-4 rounded-3xl p-5"
              >
                <BadgePill kind={kind} showLabel={false} className="h-11 w-11 justify-center rounded-2xl [&>svg]:h-5 [&>svg]:w-5" />
                <div>
                  <p className="font-display font-semibold text-white">
                    {meta.label}
                  </p>
                  <p className="text-sm text-slate-400">{meta.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
