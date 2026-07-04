// ---------------------------------------------------------------------------
// Sparks (likes) and follows.
//
// A small in-memory cache backs synchronous reads (isLiked / isFollowing) so
// UI components stay simple. The cache is hydrated from Supabase (per user) when
// configured, or from localStorage in mock mode. Writes persist to whichever
// backend is active. Components subscribe to stay in sync after async hydration.
// ---------------------------------------------------------------------------

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadFollowingIds, loadLikedVideoIds, setFollow, setLike } from "@/lib/data";
import type { User } from "@/lib/types";

const LIKES_KEY = "zine.likes";
const FOLLOWS_KEY = "zine.follows";

let likedIds = new Set<string>();
let followingIds = new Set<string>();
let currentUserId: string | null = null;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function subscribeInteractions(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/** Load the current user's likes/follows into the cache. Called on auth change. */
export async function hydrateInteractions(user: User | null): Promise<void> {
  currentUserId = user?.id ?? null;
  if (isSupabaseConfigured()) {
    if (user) {
      const [likes, follows] = await Promise.all([
        loadLikedVideoIds(user.id),
        loadFollowingIds(user.id),
      ]);
      likedIds = new Set(likes);
      followingIds = new Set(follows);
    } else {
      likedIds = new Set();
      followingIds = new Set();
    }
  } else {
    // mock mode: likes/follows are global to the browser
    likedIds = readSet(LIKES_KEY);
    followingIds = readSet(FOLLOWS_KEY);
  }
  emit();
}

export function clearInteractions(): void {
  likedIds = new Set();
  followingIds = new Set();
  currentUserId = null;
  emit();
}

export function isLiked(videoId: string): boolean {
  return likedIds.has(videoId);
}

export function isFollowing(userId: string): boolean {
  return followingIds.has(userId);
}

/** Optimistically toggle a Spark; persists in the background. Returns new state. */
export function toggleLike(videoId: string): boolean {
  const nowLiked = !likedIds.has(videoId);
  if (nowLiked) likedIds.add(videoId);
  else likedIds.delete(videoId);
  if (isSupabaseConfigured()) {
    if (currentUserId) void setLike(videoId, nowLiked, currentUserId);
  } else {
    writeSet(LIKES_KEY, likedIds);
  }
  emit();
  return nowLiked;
}

export function toggleFollow(userId: string): boolean {
  const nowFollowing = !followingIds.has(userId);
  if (nowFollowing) followingIds.add(userId);
  else followingIds.delete(userId);
  if (isSupabaseConfigured()) {
    if (currentUserId) void setFollow(userId, nowFollowing, currentUserId);
  } else {
    writeSet(FOLLOWS_KEY, followingIds);
  }
  emit();
  return nowFollowing;
}
