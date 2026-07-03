import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** GET /api/health — liveness + whether a real backend is connected. */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "zine",
    mode: isSupabaseConfigured() ? "supabase" : "demo",
    time: new Date().toISOString(),
  });
}
