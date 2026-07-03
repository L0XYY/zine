"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { MOBILE_NAV, type NavItem } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const hrefFor = (item: NavItem) =>
    item.dynamicProfile ? (user ? `/u/${user.username}` : "/login") : item.href;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="glass-strong mx-auto flex max-w-md items-center justify-around gap-1 border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {MOBILE_NAV.map((item) => {
          const href = hrefFor(item);
          const active = item.dynamicProfile
            ? pathname.startsWith("/u/")
            : pathname === item.href;
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.label}
                href={href}
                className="ring-focus -mt-4 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow"
                aria-label={item.label}
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "ring-focus flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-white" : "text-slate-500",
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "text-zine-green")}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
