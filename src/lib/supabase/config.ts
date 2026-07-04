// Supabase connection config.
//
// The URL + publishable ("anon") key are baked in as fallbacks so the deployed
// site connects to Supabase even without Vercel env vars set. This is safe by
// design: the publishable key is meant to be exposed to the browser, and all
// data access is guarded by Row Level Security. Env vars still override these
// (e.g. to point a staging build at a different project). The SECRET key is
// never included here.

const DEFAULT_SUPABASE_URL = "https://ojupfiubsgonaxkjpeff.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_1BRtwjwZNePricjkjiDJhw_HawI1QkX";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("http") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_URL.includes("YOUR-PROJECT")
  );
}

export const VIDEO_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET || "zines";
