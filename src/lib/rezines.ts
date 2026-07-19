// ---------------------------------------------------------------------------
// Rezines (reposts).
//
// A Rezine reshares another Ziner's loop onto your own profile. Same client-side
// pattern as bookmarks: an in-memory set backing synchronous isRezined() reads,
// hydrated from and persisted to localStorage, with subscribers.
// ---------------------------------------------------------------------------

const KEY = "zine.rezines";

let rezinedIds: string[] = [];
let hydrated = false;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
export function subscribeRezines(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function write(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}
function ensure() {
  if (!hydrated) {
    rezinedIds = read();
    hydrated = true;
  }
}

export function rezinedVideoIds(): string[] {
  ensure();
  return rezinedIds;
}

export function isRezined(videoId: string): boolean {
  ensure();
  return rezinedIds.includes(videoId);
}

export function toggleRezine(videoId: string): boolean {
  ensure();
  const now = !rezinedIds.includes(videoId);
  rezinedIds = now
    ? [videoId, ...rezinedIds]
    : rezinedIds.filter((id) => id !== videoId);
  write(rezinedIds);
  emit();
  return now;
}
