// ---------------------------------------------------------------------------
// Client-only local persistence.
//
// Bridges the mock data layer with browser localStorage so demo actions (sign
// up, upload, edit profile) persist across reloads and show up everywhere.
// When wired to Supabase, these functions become the place you swap in real
// queries — every caller already treats them as an async-ish data seam.
// ---------------------------------------------------------------------------

import { users as mockUsers, videos as mockVideos } from "./mock-data";
import type { User, Video } from "./types";

const USERS_KEY = "zine.users";
const VIDEOS_KEY = "zine.videos";
export const SESSION_KEY = "zine.session";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / disabled — non-fatal for a demo
  }
}

// --- Users -----------------------------------------------------------------

export function loadLocalUsers(): User[] {
  return read<User[]>(USERS_KEY, []);
}

export function saveLocalUser(user: User) {
  const locals = loadLocalUsers();
  const idx = locals.findIndex((u) => u.id === user.id);
  if (idx >= 0) locals[idx] = user;
  else locals.push(user);
  write(USERS_KEY, locals);
}

/** All users: locally created ones first, then the seed data. */
export function allUsers(): User[] {
  const locals = loadLocalUsers();
  const localIds = new Set(locals.map((u) => u.id));
  return [...locals, ...mockUsers.filter((u) => !localIds.has(u.id))];
}

export function findUserByUsername(username: string): User | undefined {
  const target = username.toLowerCase();
  return allUsers().find((u) => u.username.toLowerCase() === target);
}

export function findUserByEmail(email: string): User | undefined {
  const target = email.toLowerCase();
  return allUsers().find((u) => u.email.toLowerCase() === target);
}

export function usernameTaken(username: string): boolean {
  return !!findUserByUsername(username);
}

// --- Videos ----------------------------------------------------------------

export function loadLocalVideos(): Video[] {
  return read<Video[]>(VIDEOS_KEY, []);
}

export function saveLocalVideo(video: Video) {
  const locals = loadLocalVideos();
  locals.unshift(video);
  write(VIDEOS_KEY, locals);
}

/** All non-deleted videos: freshly uploaded first, then seed data. */
export function allVideos(): Video[] {
  return [...loadLocalVideos(), ...mockVideos].filter((v) => !v.isDeleted);
}

export function videosByUser(userId: string): Video[] {
  return allVideos().filter((v) => v.userId === userId);
}
