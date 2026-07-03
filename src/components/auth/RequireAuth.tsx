"use client";

import { Lock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminRole } from "@/lib/constants";
import { FullSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Client-side gate for protected pages. `admin` also requires an
 * OWNER / ADMIN / MODERATOR role. A matching server check lives in
 * `middleware.ts` for defence in depth once Supabase auth is wired up.
 */
export function RequireAuth({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) return <FullSpinner label="Checking your session…" />;

  if (!user) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <EmptyState
          icon={<Lock className="h-7 w-7" />}
          title="Log in to continue"
          description="You need a Zine account to view this page. It only takes a second."
          action={{ label: "Log in", href: "/login" }}
          className="max-w-md"
        />
      </div>
    );
  }

  if (admin && !isAdminRole(user.role)) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <EmptyState
          icon={<ShieldAlert className="h-7 w-7 text-rose-300" />}
          title="Staff only"
          description="This area is restricted to Zine moderators, admins, and owners. If you think this is a mistake, contact the team."
          action={{ label: "Back to feed", href: "/feed" }}
          className="max-w-md"
        />
      </div>
    );
  }

  return <>{children}</>;
}
