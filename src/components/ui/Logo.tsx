import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="zine-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="55%" stopColor="#22c07a" />
          <stop offset="100%" stopColor="#34c759" />
        </linearGradient>
      </defs>

      {/* Rounded app-icon square */}
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#zine-mark)" />

      {/* Z + play mark */}
      <g fill="#ffffff">
        <rect x="9" y="8.4" width="14" height="3.2" rx="1.6" />
        <rect x="9" y="20.4" width="14" height="3.2" rx="1.6" />
        <path
          d="M12.4 12.3 L20.8 16 L12.4 19.7 Z"
          strokeLinejoin="round"
          strokeWidth="1.4"
          stroke="#ffffff"
        />
      </g>
    </svg>
  );
}

export function Logo({
  href = "/",
  showText = true,
  className,
}: {
  href?: string;
  showText?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "ring-focus group inline-flex items-center gap-2 rounded-xl",
        className,
      )}
      aria-label={`${BRAND.name} home`}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      {showText && (
        <span className="font-display text-2xl font-bold lowercase tracking-tight">
          <span className="text-gradient">zine</span>
        </span>
      )}
    </Link>
  );
}
