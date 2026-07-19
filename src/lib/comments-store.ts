// ---------------------------------------------------------------------------
// Client-only comment persistence (localStorage) for demo / no-backend mode.
//
// In Supabase mode comments live in the `comments` table. Without a backend they
// were previously ephemeral (a posted comment vanished on reload). This store
// keeps them in the browser so the demo behaves like the real thing.
// ---------------------------------------------------------------------------

import type { Comment, User } from "./types";
import { getCommentsForVideo } from "./mock-data";

const KEY = "zine.comments";

function readAll(): Record<string, Comment[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Comment[]>) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, Comment[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Seed comments (none by default) plus locally-posted ones, newest first. */
export function localCommentsForVideo(videoId: string): Comment[] {
  const stored = readAll()[videoId] ?? [];
  const seed = getCommentsForVideo(videoId);
  return [...stored, ...seed].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export function localAddComment(
  videoId: string,
  body: string,
  author: User,
): Comment {
  const comment: Comment = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `local_${Date.now()}`,
    videoId,
    userId: author.id,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl,
      verified: author.verified,
      badges: author.badges,
    },
    body: body.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all[videoId] = [comment, ...(all[videoId] ?? [])];
  writeAll(all);
  return comment;
}

export function localDeleteComment(commentId: string) {
  const all = readAll();
  let changed = false;
  for (const vid of Object.keys(all)) {
    const next = all[vid].filter((c) => c.id !== commentId);
    if (next.length !== all[vid].length) {
      all[vid] = next;
      changed = true;
    }
  }
  if (changed) writeAll(all);
}

/** Count of locally-stored + seed comments, for optimistic count updates. */
export function localCommentCount(videoId: string): number {
  return localCommentsForVideo(videoId).length;
}
