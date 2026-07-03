import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

// Server-side route protection (defence in depth alongside the client guards).
//
// In demo mode (no Supabase env) the client-side RequireAuth guards handle
// access and this middleware is a no-op. Once Supabase is configured it
// enforces auth on protected routes and role checks on /admin using the
// session cookie + `profiles` table.

const AUTH_ROUTES = ["/upload", "/settings"];
const ADMIN_ROUTES = ["/admin"];
const ADMIN_ROLES = ["OWNER", "ADMIN", "MODERATOR"];

export async function middleware(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const needsAuth = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_ROUTES.some((p) => pathname.startsWith(p));
  if (!needsAuth && !needsAdmin) return NextResponse.next();

  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !ADMIN_ROLES.includes(profile.role)) {
        const url = req.nextUrl.clone();
        url.pathname = "/feed";
        return NextResponse.redirect(url);
      }
    } catch {
      // Fail closed for the admin area.
      const url = req.nextUrl.clone();
      url.pathname = "/feed";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/upload/:path*", "/settings/:path*", "/admin/:path*"],
};
