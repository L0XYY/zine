"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

// Decorative hero previews — abstract category cards, no fabricated creators
// or engagement numbers.
const CARDS = [
  {
    seed: "hero-a",
    label: "Gaming",
    title: "clutch play",
    accent: "from-zine-green/40",
    rotate: -8,
    delay: 0,
  },
  {
    seed: "hero-b",
    label: "Edits",
    title: "velocity edit",
    accent: "from-zine-mint/40",
    rotate: 0,
    delay: 0.4,
  },
  {
    seed: "hero-c",
    label: "Roblox",
    title: "obby run",
    accent: "from-zine-teal/40",
    rotate: 8,
    delay: 0.8,
  },
];

export function AnimatedCards() {
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[440px]">
      {/* Ambient glow */}
      <div className="absolute h-64 w-64 rounded-full bg-zine-green/30 blur-[100px]" />

      {CARDS.map((card, i) => (
        <motion.div
          key={card.seed}
          initial={{ opacity: 0, y: 40, rotate: card.rotate }}
          animate={{
            opacity: 1,
            y: [0, -12, 0],
            rotate: card.rotate,
          }}
          transition={{
            opacity: { duration: 0.6, delay: card.delay },
            y: {
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: card.delay,
            },
          }}
          style={{ zIndex: i === 1 ? 30 : 20 - i }}
          className="absolute"
        >
          <div
            className="glass-strong relative w-36 overflow-hidden rounded-3xl shadow-glass sm:w-44"
            style={{
              transform: `translateX(${(i - 1) * 96}px) scale(${
                i === 1 ? 1.08 : 0.94
              })`,
            }}
          >
            <div className="relative aspect-[9/16] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/${card.seed}/300/540`}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${card.accent} to-transparent mix-blend-overlay`}
              />
              <div className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur">
                <Play className="h-3.5 w-3.5 translate-x-0.5 text-white" />
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  {card.label}
                </span>
                <p className="truncate text-[11px] text-slate-200">
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
