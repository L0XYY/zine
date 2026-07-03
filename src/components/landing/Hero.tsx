"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedCards } from "./AnimatedCards";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-zine-green" />
            The 6-second loop is back
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            Short videos that{" "}
            <span className="text-gradient">loop different.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-lg text-balance text-lg text-slate-300 lg:mx-0"
          >
            Zine is a clean, fast home for 6-second loops — memes, gaming, Roblox,
            Minecraft, edits, and IRL. Made for Ziners who make every second count.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button href="/signup" size="lg" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Sign up free
            </Button>
            <Button
              href="/feed"
              variant="glass"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Play className="h-4 w-4" />
              Watch Zines
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 lg:justify-start"
          >
            <div>
              <span className="font-display text-xl font-bold text-white">6s</span>{" "}
              max loops
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="font-display text-xl font-bold text-white">6</span>{" "}
              categories
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="font-display text-xl font-bold text-white">∞</span>{" "}
              loops
            </div>
          </motion.div>
        </div>

        <AnimatedCards />
      </div>
    </section>
  );
}
