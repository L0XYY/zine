"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  MonitorSmartphone,
  Repeat2,
  ShieldCheck,
  Swords,
} from "lucide-react";

const FEATURES = [
  {
    icon: Repeat2,
    title: "Auto-looping player",
    body: "Every Zine loops seamlessly the moment it hits the screen. No taps, no waiting.",
    glow: "shadow-glow",
  },
  {
    icon: MonitorSmartphone,
    title: "Vertical feed, everywhere",
    body: "Full-screen swipe on mobile, a focused card feed on desktop. One clean experience.",
    glow: "shadow-glow-teal",
  },
  {
    icon: Heart,
    title: "Sparks & comments",
    body: "Spark the loops you love, drop a comment, and follow the Ziners who never miss.",
    glow: "shadow-glow-mint",
  },
  {
    icon: Swords,
    title: "Challenges",
    body: "Jump into weekly challenges — speedruns, seamless loops, meme relays — and get featured.",
    glow: "shadow-glow",
  },
  {
    icon: Flame,
    title: "Hot Loops",
    body: "A living trending page that ranks the loops catching fire right now across every category.",
    glow: "shadow-glow-mint",
  },
  {
    icon: ShieldCheck,
    title: "Real moderation",
    body: "Reports, roles, and moderator tools built in from day one. A cleaner place to loop.",
    glow: "shadow-glow-teal",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a loop needs to{" "}
            <span className="text-gradient">go off.</span>
          </h2>
          <p className="mt-4 text-slate-300">
            Zine is built like a real platform, not a demo — fast, social, and
            fair, with the tools creators and moderators actually use.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="glass glass-hover group rounded-3xl p-6"
            >
              <div
                className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-zine-gradient text-white transition-transform duration-300 group-hover:scale-110 ${f.glow}`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
