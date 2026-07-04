// ---------------------------------------------------------------------------
// Client-only media persistence (IndexedDB).
//
// Uploaded video files are stored as blobs here so posted Zines survive page
// reloads without a backend — object URLs alone die on refresh. A stored video
// keeps a "idb:<id>" marker as its videoUrl; resolveMediaUrl() turns that back
// into a playable object URL on demand (cached).
//
// When Supabase Storage is connected, uploads become real https URLs and these
// markers simply stop being produced — resolveMediaUrl passes them through.
// ---------------------------------------------------------------------------

const DB_NAME = "zine-media";
const STORE = "media";
export const MEDIA_PREFIX = "idb:";

const urlCache = new Map<string, string>();

function idbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Persist an uploaded file blob under the given id. */
export async function putMedia(id: string, blob: Blob): Promise<void> {
  if (!idbAvailable()) return;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function getMedia(id: string): Promise<Blob | null> {
  if (!idbAvailable()) return null;
  const db = await openDb();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

/** Turn a stored videoUrl into something a <video> can play. Non-idb URLs
 *  (samples, https, Supabase Storage) pass straight through. Returns "" when a
 *  local blob is missing so the player can show its error state. */
export async function resolveMediaUrl(videoUrl: string): Promise<string> {
  if (!videoUrl.startsWith(MEDIA_PREFIX)) return videoUrl;
  const id = videoUrl.slice(MEDIA_PREFIX.length);
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getMedia(id);
  if (!blob) return "";
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}
