// Small helper so the whole app can detect whether Supabase is wired up.
// When it isn't, the UI transparently falls back to the mock data layer.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("http") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_URL.includes("YOUR-PROJECT")
  );
}

export const VIDEO_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET ?? "zines";
