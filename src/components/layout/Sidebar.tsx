"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { Button } from "@/components/ui/Button";
import { NAV_ITEMS, type NavItem } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdminRole(user?.role),
  );

  const hrefFor = (item: NavItem) =>
    item.dynamicProfile && user ? `/u/${user.username}` : item.href;

  const isActive = (href: string) =>
    pathname === href || (href !== "/feed" && pathname.startsWith(href));

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col gap-6 border-r border-white/5 px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const href = hrefFor(item);
          const active = item.dynamicProfile
            ? pathname.startsWith("/u/")
            : isActive(item.href);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Button key={item.label} href={href} className="my-1.5 w-full">
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          }

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "ring-focus group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-zine-gradient" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-zine-green" : "group-hover:text-white",
                )}
              />
              {item.label}
              {item.adminOnly && (
                <span className="ml-auto rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                  STAFF
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        {user ? (
          <div className="glass flex items-center gap-3 rounded-2xl p-2.5">
            <Link href={`/u/${user.username}`} className="flex min-w-0 items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1 truncate text-sm font-semibold text-white">
                  <span className="truncate">{user.displayName}</span>
                  {user.verified && <VerifiedCheck className="h-3.5 w-3.5" />}
                </div>
                <div className="truncate text-xs text-slate-400">
                  @{user.username}
                </div>
              </div>
            </Link>
            <button
              onClick={logout}
              className="ring-focus ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button href="/login" variant="glass" className="w-full">
            <LogIn className="h-4 w-4" />
            Log in
          </Button>
        )}
      </div>
    </aside>
  );
}
