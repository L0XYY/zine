// ---------------------------------------------------------------------------
// Activity notifications (client-side).
//
// Notifications are addressed to a recipient user id and created when another
// account sparks / comments / follows / messages them. In the demo (multiple
// accounts in one browser) this works end-to-end: sign in as someone else and
// your actions show up in their bell. It's a clean seam for a `notifications`
// table later. Kept in localStorage so it survives reloads; a pub/sub keeps the
// bell badge live.
// ---------------------------------------------------------------------------

import type { BadgeKind } from "./types";

export type NotificationKind =
  | "spark"
  | "comment"
  | "follow"
  | "message"
  | "rezine";

export interface AppNotification {
  id: string;
  recipientId: string;
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    verified: boolean;
    badges: BadgeKind[];
  };
  kind: NotificationKind;
  videoId?: string | null;
  videoTitle?: string | null;
  preview?: string | null;
  createdAt: string;
  read: boolean;
}

export type Actor = AppNotification["actor"];

/** Build the compact actor snapshot stored on a notification from a full user. */
export function toActor(u: {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
  badges: BadgeKind[];
}): Actor {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    verified: u.verified,
    badges: u.badges,
  };
}

const KEY = "zine.notifications";
const MAX = 200;

const listeners = new Set<() => void>();
export function subscribeNotifications(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function emit() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) emit();
  });
}

function readAll(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface NotifyInput {
  recipientId: string;
  actor: Actor;
  kind: NotificationKind;
  videoId?: string | null;
  videoTitle?: string | null;
  preview?: string | null;
}

/** Record a notification for `recipientId`. No-ops when the actor is the
 *  recipient (you don't get notified about your own actions). */
export function notify(input: NotifyInput): void {
  if (!input.recipientId || input.recipientId === input.actor.id) return;
  const all = readAll();

  // De-dupe rapid duplicates (e.g. spark → unspark → spark) within a short
  // window for the same actor+kind+video.
  const recent = all.find(
    (n) =>
      n.recipientId === input.recipientId &&
      n.actor.id === input.actor.id &&
      n.kind === input.kind &&
      (n.videoId ?? null) === (input.videoId ?? null) &&
      Date.now() - +new Date(n.createdAt) < 60_000,
  );
  if (recent) return;

  const notification: AppNotification = {
    id: newId(),
    recipientId: input.recipientId,
    actor: input.actor,
    kind: input.kind,
    videoId: input.videoId ?? null,
    videoTitle: input.videoTitle ?? null,
    preview: input.preview ?? null,
    createdAt: new Date().toISOString(),
    read: false,
  };
  writeAll([notification, ...all]);
  emit();
}

export function notificationsFor(userId: string): AppNotification[] {
  return readAll()
    .filter((n) => n.recipientId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function unreadCountFor(userId: string): number {
  return readAll().filter((n) => n.recipientId === userId && !n.read).length;
}

export function markAllRead(userId: string): void {
  const all = readAll();
  let changed = false;
  for (const n of all) {
    if (n.recipientId === userId && !n.read) {
      n.read = true;
      changed = true;
    }
  }
  if (changed) {
    writeAll(all);
    emit();
  }
}

export function clearNotifications(userId: string): void {
  writeAll(readAll().filter((n) => n.recipientId !== userId));
  emit();
}
