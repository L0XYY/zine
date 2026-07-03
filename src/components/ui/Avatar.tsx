import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  ring = false,
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof sizeMap;
  ring?: boolean;
  className?: string;
}) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "Z";
  const px =
    size === "xs" ? 28 : size === "sm" ? 36 : size === "md" ? 44 : size === "lg" ? 64 : 96;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zine-gradient font-semibold text-white",
        sizeMap[size],
        ring && "ring-2 ring-white/20 ring-offset-2 ring-offset-ink-950",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}
