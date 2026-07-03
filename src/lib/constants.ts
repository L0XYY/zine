import type { BadgeKind, Category, Role, User } from "./types";

// --- Brand -----------------------------------------------------------------

export const BRAND = {
  name: "Zine",
  slogan: "short videos that loop different.",
  tagline: "Zine — short videos that loop different.",
  // In-world vocabulary
  users: "Ziners",
  user: "Ziner",
  video: "Zine",
  videos: "Zines",
  repost: "Rezine",
  like: "Spark",
  likes: "Sparks",
  trending: "Hot Loops",
} as const;

// --- Upload rules ----------------------------------------------------------

export const UPLOAD = {
  minDuration: Number(process.env.NEXT_PUBLIC_MIN_DURATION_SEC ?? 6),
  maxDuration: Number(process.env.NEXT_PUBLIC_MAX_DURATION_SEC ?? 10),
  maxSizeMb: Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 50),
  acceptedTypes: ["video/mp4", "video/webm", "video/quicktime"],
} as const;

// --- Categories ------------------------------------------------------------

export interface CategoryMeta {
  key: Category;
  label: string;
  emoji: string;
  blurb: string;
  accent: "purple" | "blue" | "pink";
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "GAMING", label: "Gaming", emoji: "🎮", blurb: "Clutch plays & fails", accent: "blue" },
  { key: "ROBLOX", label: "Roblox", emoji: "🧱", blurb: "Obbys, sim wins, brainrot", accent: "pink" },
  { key: "MINECRAFT", label: "Minecraft", emoji: "⛏️", blurb: "Builds, redstone, speedruns", accent: "purple" },
  { key: "MEMES", label: "Memes", emoji: "😂", blurb: "The daily loop of chaos", accent: "pink" },
  { key: "EDITS", label: "Edits", emoji: "✨", blurb: "Velocity edits & AMVs", accent: "purple" },
  { key: "IRL", label: "IRL", emoji: "🌍", blurb: "Real life, real quick", accent: "blue" },
];

export function categoryMeta(key: Category): CategoryMeta {
  return (
    CATEGORIES.find((c) => c.key === key) ?? {
      key,
      label: key.charAt(0) + key.slice(1).toLowerCase(),
      emoji: "🎬",
      blurb: "",
      accent: "purple",
    }
  );
}

// --- Badges ----------------------------------------------------------------

export interface BadgeMeta {
  kind: BadgeKind;
  label: string;
  description: string;
  className: string; // tailwind classes for the pill
}

export const BADGES: Record<BadgeKind, BadgeMeta> = {
  VERIFIED: {
    kind: "VERIFIED",
    label: "Verified",
    description: "Confirmed, authentic Ziner.",
    className: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  },
  PARTNER: {
    kind: "PARTNER",
    label: "Partner",
    description: "Partnered creator earning with Zine.",
    className: "text-teal-300 border-teal-400/30 bg-teal-400/10",
  },
  FOUNDER: {
    kind: "FOUNDER",
    label: "Founder",
    description: "Helped start it all.",
    className: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  },
  STAFF: {
    kind: "STAFF",
    label: "Staff",
    description: "Works on Zine.",
    className: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  },
  EARLY: {
    kind: "EARLY",
    label: "Early",
    description: "One of the first Ziners.",
    className: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10",
  },
};

// --- Roles -----------------------------------------------------------------

export const ADMIN_ROLES: Role[] = ["OWNER", "ADMIN", "MODERATOR"];

export function isAdminRole(role: Role | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

// --- Founder / Owner --------------------------------------------------------
// The single account that owns the platform. Whoever holds this username is
// always resolved as OWNER with the founder badges — so the role can never be
// lost or accidentally claimed by another sign-up (the username is reserved).
export const OWNER_USERNAME = "loxy";

const FOUNDER_BADGES: BadgeKind[] = ["FOUNDER", "STAFF", "VERIFIED", "EARLY"];

/** Force owner role + founder badges on the reserved founder account. */
export function elevateFounder(user: User): User {
  if (user.username.toLowerCase() !== OWNER_USERNAME) return user;
  return {
    ...user,
    role: "OWNER",
    verified: true,
    badges: Array.from(new Set([...user.badges, ...FOUNDER_BADGES])),
  };
}

export function isOwnerUsername(username: string): boolean {
  return username.toLowerCase() === OWNER_USERNAME;
}

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  PARTNER: "Partner",
  VERIFIED: "Verified",
  USER: "Ziner",
};

// --- Report reasons --------------------------------------------------------

export const REPORT_REASONS: { key: string; label: string }[] = [
  { key: "SPAM", label: "Spam or scam" },
  { key: "HARASSMENT", label: "Harassment or bullying" },
  { key: "NUDITY", label: "Nudity or sexual content" },
  { key: "VIOLENCE", label: "Violence or dangerous acts" },
  { key: "HATE", label: "Hate speech" },
  { key: "ILLEGAL", label: "Illegal or stolen content" },
  { key: "OTHER", label: "Something else" },
];
