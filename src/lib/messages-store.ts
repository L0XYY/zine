// ---------------------------------------------------------------------------
// Client-only direct-message persistence (localStorage).
//
// The hosted Supabase project ships without the `conversations` / `messages`
// tables, and the app is demo-first, so DMs live in the browser here. This makes
// messaging work with zero backend setup. The data layer (lib/data.ts) uses
// Supabase when those tables exist and transparently falls back to this store
// otherwise, so callers never change.
//
// A tiny pub/sub lets the inbox and any open thread re-render the moment a
// message is sent or read, without waiting on the poll interval.
// ---------------------------------------------------------------------------

import type { Conversation, DirectMessage, User } from "./types";
import { findUserByUsername } from "./local-store";

const CONVOS_KEY = "zine.dm.conversations";
const MESSAGES_KEY = "zine.dm.messages";
const READ_KEY = "zine.dm.read"; // { [conversationId]: ISO timestamp last read }

/** The "other" participant snapshot we cache on a conversation for the inbox. */
type Participant = Conversation["other"];

interface StoredConversation {
  id: string;
  /** The two participant ids, sorted, so a pair maps to one conversation. */
  a: string;
  b: string;
  /** Cached profile snapshots keyed by user id, for rendering without lookups. */
  people: Record<string, Participant>;
  lastMessage: string | null;
  lastMessageAt: string;
  createdAt: string;
}

// --- storage helpers -------------------------------------------------------

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
    /* storage full / disabled — non-fatal for a demo */
  }
}

// --- pub/sub ---------------------------------------------------------------

const listeners = new Set<() => void>();
export function subscribeMessages(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function emit() {
  listeners.forEach((l) => l());
  // Cross-tab: a storage event fires in *other* tabs automatically; this covers
  // same-tab subscribers.
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CONVOS_KEY || e.key === MESSAGES_KEY || e.key === READ_KEY) {
      emit();
    }
  });
}

// --- internal read/write ---------------------------------------------------

function loadConvos(): StoredConversation[] {
  return read<StoredConversation[]>(CONVOS_KEY, []);
}
function saveConvos(list: StoredConversation[]) {
  write(CONVOS_KEY, list);
}
function loadAllMessages(): Record<string, DirectMessage[]> {
  return read<Record<string, DirectMessage[]>>(MESSAGES_KEY, {});
}
function saveAllMessages(map: Record<string, DirectMessage[]>) {
  write(MESSAGES_KEY, map);
}
function loadRead(): Record<string, string> {
  return read<Record<string, string>>(READ_KEY, {});
}
function saveRead(map: Record<string, string>) {
  write(READ_KEY, map);
}

function participantOf(u: Partial<User> & { id: string }): Participant {
  return {
    id: u.id,
    username: u.username ?? "",
    displayName: u.displayName ?? u.username ?? "Ziner",
    avatarUrl: u.avatarUrl ?? null,
    verified: !!u.verified,
    badges: u.badges ?? [],
  };
}

function newId(prefix: string): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- public API ------------------------------------------------------------

/** Find or create the single conversation between two users. Caches a profile
 *  snapshot of the *other* user so the inbox renders without extra lookups. */
export function localGetOrCreateConversation(
  otherUser: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "verified" | "badges">,
  me: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "verified" | "badges">,
): string {
  if (otherUser.id === me.id) return "";
  const [a, b] = [me.id, otherUser.id].sort();
  const convos = loadConvos();
  const existing = convos.find((c) => c.a === a && c.b === b);
  if (existing) {
    // Refresh cached snapshots in case a display name / avatar changed.
    existing.people[me.id] = participantOf(me);
    existing.people[otherUser.id] = participantOf(otherUser);
    saveConvos(convos);
    return existing.id;
  }
  const id = newId("c");
  convos.push({
    id,
    a,
    b,
    people: {
      [me.id]: participantOf(me),
      [otherUser.id]: participantOf(otherUser),
    },
    lastMessage: null,
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  saveConvos(convos);
  emit();
  return id;
}

export function localFetchConversations(meId: string): Conversation[] {
  const convos = loadConvos().filter((c) => c.a === meId || c.b === meId);
  return convos
    .map((c) => {
      const otherId = c.a === meId ? c.b : c.a;
      const other =
        c.people[otherId] ??
        ({
          id: otherId,
          username: "",
          displayName: "Ziner",
          avatarUrl: null,
          verified: false,
          badges: [],
        } as Participant);
      return {
        id: c.id,
        other,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      } satisfies Conversation;
    })
    .sort((x, y) => +new Date(y.lastMessageAt) - +new Date(x.lastMessageAt));
}

export function localFetchMessages(conversationId: string): DirectMessage[] {
  return loadAllMessages()[conversationId] ?? [];
}

export function localSendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): DirectMessage {
  const clean = body.trim().slice(0, 2000);
  const msg: DirectMessage = {
    id: newId("m"),
    conversationId,
    senderId,
    body: clean,
    createdAt: new Date().toISOString(),
  };
  const all = loadAllMessages();
  all[conversationId] = [...(all[conversationId] ?? []), msg];
  saveAllMessages(all);

  const convos = loadConvos();
  const convo = convos.find((c) => c.id === conversationId);
  if (convo) {
    convo.lastMessage = clean;
    convo.lastMessageAt = msg.createdAt;
    saveConvos(convos);
  }
  // Sender has implicitly read up to their own message.
  markConversationRead(conversationId, msg.createdAt);
  emit();
  return msg;
}

/** Resolve the other participant of a conversation for a given user, so a
 *  thread opened by conversation id can render its header. */
export function localOtherParticipant(
  conversationId: string,
  meId: string,
): Participant | null {
  const convo = loadConvos().find((c) => c.id === conversationId);
  if (!convo) return null;
  const otherId = convo.a === meId ? convo.b : convo.a;
  return convo.people[otherId] ?? null;
}

// --- unread tracking -------------------------------------------------------

export function markConversationRead(conversationId: string, at?: string) {
  const map = loadRead();
  map[conversationId] = at ?? new Date().toISOString();
  saveRead(map);
  emit();
}

/** How many conversations have a newer last message than the user has read. */
export function localUnreadCount(meId: string): number {
  const readMap = loadRead();
  return localFetchConversations(meId).reduce((n, c) => {
    if (!c.lastMessage) return n;
    const lastRead = readMap[c.id];
    if (!lastRead || +new Date(c.lastMessageAt) > +new Date(lastRead)) {
      // Don't count a conversation whose latest message the user sent.
      const msgs = localFetchMessages(c.id);
      const last = msgs[msgs.length - 1];
      if (last && last.senderId !== meId) return n + 1;
    }
    return n;
  }, 0);
}

export function localConversationUnread(conversationId: string, meId: string): boolean {
  const readMap = loadRead();
  const lastRead = readMap[conversationId];
  const msgs = localFetchMessages(conversationId);
  const last = msgs[msgs.length - 1];
  if (!last || last.senderId === meId) return false;
  return !lastRead || +new Date(last.createdAt) > +new Date(lastRead);
}

/** Best-effort resolve a username to a messageable participant snapshot using
 *  the local user directory (seed + locally-created accounts). */
export function localParticipantByUsername(username: string): Participant | null {
  const u = findUserByUsername(username);
  return u ? participantOf(u) : null;
}
