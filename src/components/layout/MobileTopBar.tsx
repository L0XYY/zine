"use client";

import Link from "next/link";
import { Bell, MessageSquare, Search } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUnreadCounts } from "@/lib/use-unread";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

function IconLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="ring-focus relative grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10"
      aria-label={label}
    >
      {children}
      {!!count && count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-zine-gradient px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export function MobileTopBar({ transparent = false }: { transparent?: boolean }) {
  const { user } = useAuth();
  const unread = useUnreadCounts();

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden ${
        transparent
          ? "bg-gradient-to-b from-black/60 to-transparent"
          : "glass-strong border-b border-white/10"
      }`}
    >
      <Logo />
      <div className="flex items-center gap-1.5">
        <IconLink href="/search" label="Search Ziners">
          <Search className="h-5 w-5" />
        </IconLink>
        {user && (
          <>
            <IconLink
              href="/notifications"
              label="Notifications"
              count={unread.notifications}
            >
              <Bell className="h-5 w-5" />
            </IconLink>
            <IconLink href="/messages" label="Messages" count={unread.messages}>
              <MessageSquare className="h-5 w-5" />
            </IconLink>
          </>
        )}
        {user ? (
          <Link href={`/u/${user.username}`} aria-label="Your profile">
            <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="ring-focus rounded-xl bg-white/10 px-3 py-1.5 text-sm font-medium text-white"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
