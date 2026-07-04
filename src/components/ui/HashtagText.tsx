import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Renders text with #hashtags turned into links to /tag/[tag] — a classic
 * Vine touch. stopPropagation keeps taps from triggering a parent (e.g. a card).
 */
export function HashtagText({
  text,
  className,
  linkClassName,
}: {
  text: string;
  className?: string;
  linkClassName?: string;
}) {
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("#") && part.length > 1) {
          const tag = part.slice(1).toLowerCase();
          return (
            <Link
              key={i}
              href={`/tag/${tag}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "font-medium text-zine-teal hover:underline",
                linkClassName,
              )}
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
}
