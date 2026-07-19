// ---------------------------------------------------------------------------
// Saved Zines (bookmarks).
//
// Mirrors the interactions.ts pattern: a small in-memory set backs synchronous
// reads (isSaved) for simple UI, hydrated from localStorage and persisted on
// every change. Subscribers re-render on change. This is a client-side feature
// (per browser) — a natural fit for the demo, and a clean seam to back with a
// `saves` table later.
// ---------------------------------------------------------------------------

const SAVES_KEY = "zine.saves";

let savedIds: string[] = [];
let hydrated = false;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function subscribeSaves(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVES_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function ensure() {
  if (!hydrated) {
    savedIds = read();
    hydrated = true;
  }
}

/** Ordered list of saved video ids, most-recently saved first. */
export function savedVideoIds(): string[] {
  ensure();
  return savedIds;
}

export function isSaved(videoId: string): boolean {
  ensure();
  return savedIds.includes(videoId);
}

export function savedCount(): number {
  ensure();
  return savedIds.length;
}

/** Toggle a save. Returns the new saved state. */
export function toggleSave(videoId: string): boolean {
  ensure();
  const nowSaved = !savedIds.includes(videoId);
  savedIds = nowSaved
    ? [videoId, ...savedIds]
    : savedIds.filter((id) => id !== videoId);
  write(savedIds);
  emit();
  return nowSaved;
}
