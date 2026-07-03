import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { REPORT_REASONS } from "@/lib/constants";

const VALID_REASONS = new Set(REPORT_REASONS.map((r) => r.key));

/**
 * POST /api/reports — submit a moderation report.
 *
 * Demonstrates server-side validation + rate limiting. When Supabase is wired
 * up, insert into the `reports` table here (RLS-protected) instead of just
 * acknowledging. Note: the service role key is NEVER referenced client-side.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "reports"), 5, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many reports. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { videoId, reason, detail } = (body ?? {}) as {
    videoId?: string;
    reason?: string;
    detail?: string;
  };

  if (!videoId || typeof videoId !== "string") {
    return NextResponse.json({ error: "Missing videoId." }, { status: 400 });
  }
  if (!reason || !VALID_REASONS.has(reason)) {
    return NextResponse.json({ error: "Invalid report reason." }, { status: 400 });
  }
  if (detail && detail.length > 500) {
    return NextResponse.json(
      { error: "Detail is too long (max 500 characters)." },
      { status: 400 },
    );
  }

  // TODO(supabase): await supabase.from("reports").insert({ ... })
  return NextResponse.json({ ok: true, status: "PENDING" }, { status: 201 });
}
