import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BRAND } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Feed", href: "/feed" },
      { label: "Hot Loops", href: "/trending" },
      { label: "Challenges", href: "/challenges" },
      { label: "Upload", href: "/upload" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign up", href: "/signup" },
      { label: "Log in", href: "/login" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#loops" },
      { label: "Badges", href: "#badges" },
      { label: "Features", href: "#features" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            {BRAND.tagline} Built for {BRAND.users} who make every second count.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.slogan}
        </p>
        <p>Made for the loop.</p>
      </div>
    </footer>
  );
}
