// ---------------------------------------------------------------------------
// Seed data.
//
// The platform ships EMPTY and real: no fake creators, no fake Zines, no fake
// engagement. The only seeded account is the founder (@loxy) as OWNER. Everyone
// else is a real sign-up. Challenge prompts are kept as launch content.
//
// The exported query helpers mirror what a Supabase/Prisma data layer would
// expose, so swapping them for real queries later is a drop-in change.
// ---------------------------------------------------------------------------

import { OWNER_USERNAME } from "./constants";
import type { Challenge, Comment, Report, User, Video } from "./types";

function banner(seed: string) {
  return `https://picsum.photos/seed/${seed}-banner/1200/400`;
}
function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

// --- Users -----------------------------------------------------------------
// Exactly one seeded account: the founder. The reserved username is elevated to
// OWNER everywhere via elevateFounder() in constants.ts.

export const users: User[] = [
  {
    id: "u_loxy",
    email: "loxy@zine.video",
    username: OWNER_USERNAME,
    displayName: "Loxy",
    avatarUrl: null,
    bannerUrl: null,
    bio: "Founder of Zine. short videos that loop different.",
    role: "OWNER",
    verified: true,
    partnered: false,
    banned: false,
    badges: ["FOUNDER", "STAFF", "VERIFIED", "EARLY"],
    followers: 0,
    following: 0,
    createdAt: daysAgo(1),
  },
];

export function userToAuthor(u: User): Video["author"] {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    verified: u.verified,
    partnered: u.partnered,
    role: u.role,
    badges: u.badges,
  };
}

// --- Videos / Comments / Reports -------------------------------------------
// Empty by design — real Ziners create the content.

export const videos: Video[] = [];
export const comments: Comment[] = [];
export const reports: Report[] = [];

// --- Challenges ------------------------------------------------------------
// Launch prompts. No fabricated entry counts — they start at zero.

export const challenges: Challenge[] = [
  {
    id: "ch1",
    slug: "6s-speedrun",
    title: "6s Speedrun",
    description:
      "Beat any level, obby, or task in a single 6-second loop. Fastest clean run wins featured placement.",
    category: "CHALLENGES",
    bannerUrl: banner("speedrun"),
    isActive: true,
    entries: 0,
    endsAt: daysAgo(-14),
    accent: "purple",
  },
  {
    id: "ch2",
    slug: "loop-it",
    title: "Loop It",
    description:
      "Make an edit where the last frame flows perfectly into the first. Seamless loops only.",
    category: "EDITS",
    bannerUrl: banner("loopit"),
    isActive: true,
    entries: 0,
    endsAt: daysAgo(-10),
    accent: "pink",
  },
  {
    id: "ch3",
    slug: "one-block",
    title: "One Block Build",
    description:
      "Build something wild starting from a single block. Minecraft + Roblox both count.",
    category: "MINECRAFT",
    bannerUrl: banner("oneblock"),
    isActive: true,
    entries: 0,
    endsAt: daysAgo(-21),
    accent: "blue",
  },
];

// --- Query helpers (data-access seam) --------------------------------------

export function getFeed(): Video[] {
  return videos.filter((v) => !v.isDeleted);
}

export function getTrending(): Video[] {
  return [...videos]
    .filter((v) => !v.isDeleted)
    .sort((a, b) => b.loops + b.likesCount - (a.loops + a.likesCount));
}

export function getFeatured(): Video[] {
  return videos.filter((v) => v.isFeatured && !v.isDeleted);
}

export function getVideoById(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}

export function getVideosByUser(userId: string): Video[] {
  return videos.filter((v) => v.userId === userId && !v.isDeleted);
}

export function getVideosByCategory(category: Video["category"]): Video[] {
  return videos.filter((v) => v.category === category && !v.isDeleted);
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function getCommentsForVideo(videoId: string): Comment[] {
  return comments
    .filter((c) => c.videoId === videoId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getChallengeBySlug(slug: string): Challenge | undefined {
  return challenges.find((c) => c.slug === slug);
}

export function getVideosForChallenge(slug: string): Video[] {
  return videos.filter((v) => v.challengeSlug === slug && !v.isDeleted);
}
