"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="px-4 pb-24 pt-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-zine-gradient px-6 py-16 text-center sm:px-14"
      >
        <div className="pointer-events-none absolute inset-0 bg-ink-950/40" />
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-black/30 blur-3xl" />

        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Your first loop is waiting.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join the Ziners making every second count. Sign up free, grab your
            username, and drop your first Zine today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/signup"
              size="lg"
              variant="glass"
              className="w-full border-white/30 bg-white/15 text-white sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Create your account
            </Button>
            <Button
              href="/feed"
              size="lg"
              className="w-full bg-ink-950/80 text-white shadow-none hover:bg-ink-950 sm:w-auto"
            >
              <Play className="h-4 w-4" />
              Watch Zines first
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
