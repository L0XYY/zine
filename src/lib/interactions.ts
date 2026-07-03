// Client-only persistence for user interactions: Sparks (likes) and follows.
// Kept separate from the content store so it's easy to point at Supabase
// `likes` / `follows` tables later.

const LIKES_KEY = "zine.likes";
const FOLLOWS_KEY = "zine.follows";

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

// --- Sparks (likes) --------------------------------------------------------

export function isLiked(videoId: string): boolean {
  return readSet(LIKES_KEY).has(videoId);
}

/** Returns the new liked state. */
export function toggleLike(videoId: string): boolean {
  const set = readSet(LIKES_KEY);
  const nowLiked = !set.has(videoId);
  if (nowLiked) set.add(videoId);
  else set.delete(videoId);
  writeSet(LIKES_KEY, set);
  return nowLiked;
}

// --- Follows ---------------------------------------------------------------

export function isFollowing(userId: string): boolean {
  return readSet(FOLLOWS_KEY).has(userId);
}

export function toggleFollow(userId: string): boolean {
  const set = readSet(FOLLOWS_KEY);
  const nowFollowing = !set.has(userId);
  if (nowFollowing) set.add(userId);
  else set.delete(userId);
  writeSet(FOLLOWS_KEY, set);
  return nowFollowing;
}
