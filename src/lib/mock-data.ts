// ---------------------------------------------------------------------------
// Mock data layer.
//
// Everything the UI needs to feel "real" without a backend. The exported
// query helpers mirror what a Supabase/Prisma data layer would expose, so
// swapping them for real queries later is a drop-in change.
// ---------------------------------------------------------------------------

import type {
  Challenge,
  Comment,
  Report,
  User,
  Video,
} from "./types";

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
];

function avatar(seed: string) {
  return `https://i.pravatar.cc/200?u=${seed}`;
}
function banner(seed: string) {
  return `https://picsum.photos/seed/${seed}-banner/1200/400`;
}
function thumb(seed: string) {
  return `https://picsum.photos/seed/${seed}-thumb/600/900`;
}
function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

// --- Users -----------------------------------------------------------------

export const users: User[] = [
  {
    id: "u_zinehq",
    email: "team@zine.app",
    username: "zinehq",
    displayName: "Zine",
    avatarUrl: avatar("zinehq"),
    bannerUrl: banner("zinehq"),
    bio: "The official account. Short videos that loop different. ✨",
    role: "OWNER",
    verified: true,
    partnered: true,
    banned: false,
    badges: ["FOUNDER", "STAFF", "VERIFIED"],
    followers: 1_284_000,
    following: 12,
    createdAt: daysAgo(400),
  },
  {
    id: "u_pixel",
    email: "pixel@zine.app",
    username: "pixelpanda",
    displayName: "Pixel Panda",
    avatarUrl: avatar("pixelpanda"),
    bannerUrl: banner("pixelpanda"),
    bio: "Gaming clips daily 🎮 clutch or kick. Partnered creator.",
    role: "PARTNER",
    verified: true,
    partnered: true,
    banned: false,
    badges: ["PARTNER", "VERIFIED", "EARLY"],
    followers: 342_000,
    following: 88,
    createdAt: daysAgo(320),
  },
  {
    id: "u_bolt",
    email: "bolt@zine.app",
    username: "blockbolt",
    displayName: "BlockBolt",
    avatarUrl: avatar("blockbolt"),
    bannerUrl: banner("blockbolt"),
    bio: "Minecraft redstone wizard ⛏️ builds that shouldn't work but do.",
    role: "VERIFIED",
    verified: true,
    partnered: false,
    banned: false,
    badges: ["VERIFIED"],
    followers: 121_000,
    following: 203,
    createdAt: daysAgo(210),
  },
  {
    id: "u_rae",
    email: "rae@zine.app",
    username: "robloxrae",
    displayName: "Roblox Rae",
    avatarUrl: avatar("robloxrae"),
    bannerUrl: banner("robloxrae"),
    bio: "obby speedruns + brainrot 🧱 don't ask about the tower",
    role: "PARTNER",
    verified: true,
    partnered: true,
    banned: false,
    badges: ["PARTNER", "VERIFIED"],
    followers: 208_500,
    following: 140,
    createdAt: daysAgo(180),
  },
  {
    id: "u_nova",
    email: "nova@zine.app",
    username: "nova_edits",
    displayName: "NOVA",
    avatarUrl: avatar("nova_edits"),
    bannerUrl: banner("nova_edits"),
    bio: "velocity edits ✨ 6 seconds is all I need",
    role: "VERIFIED",
    verified: true,
    partnered: true,
    banned: false,
    badges: ["VERIFIED", "PARTNER"],
    followers: 96_400,
    following: 51,
    createdAt: daysAgo(150),
  },
  {
    id: "u_meme",
    email: "meme@zine.app",
    username: "memelord",
    displayName: "meme lord",
    avatarUrl: avatar("memelord"),
    bannerUrl: banner("memelord"),
    bio: "professional loop enjoyer. no thoughts, just memes.",
    role: "USER",
    verified: false,
    partnered: false,
    banned: false,
    badges: ["EARLY"],
    followers: 44_100,
    following: 512,
    createdAt: daysAgo(90),
  },
  {
    id: "u_dan",
    email: "dan@zine.app",
    username: "irldan",
    displayName: "Dan IRL",
    avatarUrl: avatar("irldan"),
    bannerUrl: banner("irldan"),
    bio: "real life, real quick 🌍 skate + street",
    role: "USER",
    verified: false,
    partnered: false,
    banned: false,
    badges: [],
    followers: 12_800,
    following: 341,
    createdAt: daysAgo(45),
  },
  {
    id: "u_mod",
    email: "mod@zine.app",
    username: "zinemod",
    displayName: "Zine Mod",
    avatarUrl: avatar("zinemod"),
    bannerUrl: banner("zinemod"),
    bio: "keeping the loops clean. staff account.",
    role: "MODERATOR",
    verified: true,
    partnered: false,
    banned: false,
    badges: ["STAFF", "VERIFIED"],
    followers: 3_200,
    following: 20,
    createdAt: daysAgo(300),
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

// --- Videos ----------------------------------------------------------------

interface Seed {
  id: string;
  user: string;
  title: string;
  caption: string;
  category: Video["category"];
  views: number;
  loops: number;
  likes: number;
  comments: number;
  featured?: boolean;
  trending?: boolean;
  challenge?: string;
  age: number; // hours ago
}

const seeds: Seed[] = [
  { id: "v1", user: "u_pixel", title: "1v5 clutch on Ascent", caption: "no scope, no problem 🎯 #gaming", category: "GAMING", views: 2_410_000, loops: 8_900_000, likes: 412_000, comments: 5_120, featured: true, trending: true, age: 5 },
  { id: "v2", user: "u_rae", title: "Tower of Hell in 6s", caption: "speedrun szn 🧱 rate the run", category: "ROBLOX", views: 1_820_000, loops: 6_100_000, likes: 301_000, comments: 4_010, trending: true, challenge: "6s-speedrun", age: 9 },
  { id: "v3", user: "u_bolt", title: "Redstone door that fooled me", caption: "took 3 hours. worth it ⛏️", category: "MINECRAFT", views: 980_000, loops: 3_400_000, likes: 158_000, comments: 2_240, trending: true, age: 14 },
  { id: "v4", user: "u_nova", title: "velocity edit // midnight", caption: "6 seconds is all I need ✨ #edits", category: "EDITS", views: 1_240_000, loops: 5_600_000, likes: 244_000, comments: 3_330, featured: true, trending: true, challenge: "loop-it", age: 20 },
  { id: "v5", user: "u_meme", title: "when the code finally runs", caption: "we've all been here 😂", category: "MEMES", views: 3_010_000, loops: 12_400_000, likes: 690_000, comments: 8_800, trending: true, age: 26 },
  { id: "v6", user: "u_dan", title: "kickflip down the 7", caption: "landed it on the 20th try 🛹", category: "IRL", views: 220_000, loops: 640_000, likes: 41_000, comments: 610, age: 33 },
  { id: "v7", user: "u_pixel", title: "insane flick reaction", caption: "how did that hit 😳", category: "GAMING", views: 760_000, loops: 2_100_000, likes: 120_000, comments: 1_540, age: 40 },
  { id: "v8", user: "u_rae", title: "brainrot obby part 4", caption: "the lore is getting deep 🧱", category: "ROBLOX", views: 540_000, loops: 1_700_000, likes: 88_000, comments: 990, challenge: "loop-it", age: 48 },
  { id: "v9", user: "u_bolt", title: "floating base build", caption: "survival, no mods, all pain ⛏️", category: "MINECRAFT", views: 410_000, loops: 1_200_000, likes: 63_000, comments: 720, age: 60 },
  { id: "v10", user: "u_nova", title: "color grade before/after", caption: "the LUT changes everything ✨", category: "EDITS", views: 690_000, loops: 2_800_000, likes: 132_000, comments: 1_810, age: 72 },
  { id: "v11", user: "u_meme", title: "monday morning starterpack", caption: "who did this 💀", category: "MEMES", views: 1_500_000, loops: 5_900_000, likes: 320_000, comments: 4_400, trending: true, age: 80 },
  { id: "v12", user: "u_zinehq", title: "welcome to Zine", caption: "6-second loops are back. show us what you got. #6sspeedrun", category: "MEMES", views: 4_200_000, loops: 18_000_000, likes: 880_000, comments: 12_000, featured: true, trending: true, challenge: "6s-speedrun", age: 96 },
  { id: "v13", user: "u_dan", title: "sunset timelapse loop", caption: "real life, real quick 🌍", category: "IRL", views: 180_000, loops: 520_000, likes: 33_000, comments: 410, age: 110 },
  { id: "v14", user: "u_pixel", title: "trickshot montage", caption: "6s of pure heat 🔥 #gaming", category: "GAMING", views: 1_010_000, loops: 4_100_000, likes: 210_000, comments: 2_900, challenge: "loop-it", age: 130 },
];

export const videos: Video[] = seeds.map((s, i) => {
  const author = users.find((u) => u.id === s.user)!;
  return {
    id: s.id,
    userId: author.id,
    author: userToAuthor(author),
    title: s.title,
    caption: s.caption,
    videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
    thumbnailUrl: thumb(s.id),
    duration: 6 + (i % 5), // 6–10s
    category: s.category,
    views: s.views,
    loops: s.loops,
    likesCount: s.likes,
    commentsCount: s.comments,
    isFeatured: !!s.featured,
    isTrending: !!s.trending,
    isDeleted: false,
    challengeSlug: s.challenge ?? null,
    createdAt: hoursAgo(s.age),
  };
});

// --- Comments --------------------------------------------------------------

const commentBodies = [
  "this is actually insane 🔥",
  "the loop hits different fr",
  "how many tries did this take??",
  "6 seconds well spent",
  "instant spark ⚡",
  "okay this is my new favorite",
  "the timing is perfect",
  "rewatched this like 40 times",
  "teach me the ways",
  "brb reposting this everywhere",
];

export const comments: Comment[] = videos.flatMap((v, vi) => {
  const count = 3 + (vi % 4);
  return Array.from({ length: count }, (_, ci) => {
    const author = users[(vi + ci + 1) % users.length];
    return {
      id: `${v.id}_c${ci}`,
      videoId: v.id,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        verified: author.verified,
        badges: author.badges,
      },
      body: commentBodies[(vi * 3 + ci) % commentBodies.length],
      createdAt: hoursAgo(vi + ci + 1),
    };
  });
});

// --- Challenges ------------------------------------------------------------

export const challenges: Challenge[] = [
  {
    id: "ch1",
    slug: "6s-speedrun",
    title: "6s Speedrun",
    description: "Beat any level, obby, or task in a single 6-second loop. Fastest clean run wins featured placement.",
    category: "CHALLENGES",
    bannerUrl: banner("speedrun"),
    isActive: true,
    entries: 12_400,
    endsAt: daysAgo(-6),
    accent: "purple",
  },
  {
    id: "ch2",
    slug: "loop-it",
    title: "Loop It",
    description: "Make an edit where the last frame flows perfectly into the first. Seamless loops only.",
    category: "EDITS",
    bannerUrl: banner("loopit"),
    isActive: true,
    entries: 8_900,
    endsAt: daysAgo(-3),
    accent: "pink",
  },
  {
    id: "ch3",
    slug: "one-block",
    title: "One Block Build",
    description: "Build something wild starting from a single block. Minecraft + Roblox both count.",
    category: "MINECRAFT",
    bannerUrl: banner("oneblock"),
    isActive: true,
    entries: 5_200,
    endsAt: daysAgo(-10),
    accent: "blue",
  },
  {
    id: "ch4",
    slug: "meme-relay",
    title: "Meme Relay",
    description: "Rezine the clip above you and add one twist. The loop that starts the biggest chain wins.",
    category: "MEMES",
    bannerUrl: banner("memerelay"),
    isActive: false,
    entries: 21_300,
    endsAt: daysAgo(4),
    accent: "pink",
  },
];

// --- Reports (admin queue) -------------------------------------------------

export const reports: Report[] = [
  { id: "r1", reporterUsername: "irldan", videoId: "v6", videoTitle: "kickflip down the 7", reason: "SPAM", detail: "reposted from another account", status: "PENDING", createdAt: hoursAgo(2) },
  { id: "r2", reporterUsername: "memelord", videoId: "v11", videoTitle: "monday morning starterpack", reason: "HARASSMENT", detail: "targeting a user in comments", status: "PENDING", createdAt: hoursAgo(6) },
  { id: "r3", reporterUsername: "blockbolt", videoId: "v9", videoTitle: "floating base build", reason: "OTHER", detail: "wrong category", status: "REVIEWING", createdAt: hoursAgo(20) },
  { id: "r4", reporterUsername: "pixelpanda", videoId: "v7", videoTitle: "insane flick reaction", reason: "ILLEGAL", detail: "stolen clip", status: "RESOLVED", createdAt: hoursAgo(52) },
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
