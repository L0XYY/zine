"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

export function MobileTopBar({ transparent = false }: { transparent?: boolean }) {
  const { user } = useAuth();

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden ${
        transparent
          ? "bg-gradient-to-b from-black/60 to-transparent"
          : "glass-strong border-b border-white/10"
      }`}
    >
      <Logo />
      <div className="flex items-center gap-2">
        <Link
          href="/search"
          className="ring-focus grid h-9 w-9 place-items-center rounded-xl text-slate-300 hover:bg-white/10"
          aria-label="Search Ziners"
        >
          <Search className="h-5 w-5" />
        </Link>
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
