"use client";

import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Repeat2, Timer } from "lucide-react";

export function LoopsSection() {
  return (
    <section id="loops" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="glass-strong relative overflow-hidden rounded-4xl px-6 py-14 sm:px-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-zine-mint/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-zine-teal/20 blur-[100px]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
              >
                6-second loops are{" "}
                <span className="text-gradient">back.</span>
              </motion.h2>
              <p className="mt-4 max-w-md text-slate-300">
                No 40-minute rabbit holes. No skipping ads to get to the point.
                Just a perfect little loop that hits, resets, and hits again.
                Constraint is the creativity — six seconds forces the best idea to
                the front.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { icon: Timer, label: "6s max", sub: "every Zine" },
                  { icon: Repeat2, label: "Auto-loop", sub: "seamless" },
                  { icon: InfinityIcon, label: "Endless", sub: "rewatchable" },
                ].map((s) => (
                  <div key={s.label} className="text-center sm:text-left">
                    <s.icon className="mx-auto h-6 w-6 text-zine-green sm:mx-0" />
                    <p className="mt-2 font-display text-sm font-bold text-white">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-400">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[220px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass overflow-hidden rounded-3xl"
              >
                <div className="relative aspect-[9/16]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://picsum.photos/seed/loop-hero/300/540"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {/* Looping progress bar */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                    <motion.div
                      className="h-full bg-zine-gradient"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
