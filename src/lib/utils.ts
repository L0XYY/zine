import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 12_400 -> "12.4K", 2_100_000 -> "2.1M" */
export function formatCount(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${trimZero(n / 1000)}K`;
  if (n < 1_000_000_000) return `${trimZero(n / 1_000_000)}M`;
  return `${trimZero(n / 1_000_000_000)}B`;
}

function trimZero(n: number): string {
  return n
    .toFixed(1)
    .replace(/\.0$/, "");
}

/** Human "time ago" from an ISO string. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.34524, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let value = secs;
  let unit = "s";
  for (const [step, label] of units) {
    if (value < step) {
      unit = label;
      break;
    }
    value = value / step;
    unit = label;
  }
  return `${Math.floor(value)}${unit}`;
}

/** Seconds -> "0:06" */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

/** A stable pseudo-random-but-deterministic pick, used for demo variety. */
export function seededPick<T>(seed: string, arr: T[]): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/** Basic username validity used by signup + settings. */
export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
