"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Loops", href: "#loops" },
  { label: "Badges", href: "#badges" },
  { label: "Challenges", href: "#challenges" },
];

export function LandingNav() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-ink-950/70 backdrop-blur-xl" : "",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button href="/feed" size="sm">
              Open Zine
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log in
              </Button>
              <Button href="/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
