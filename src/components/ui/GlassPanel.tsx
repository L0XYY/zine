import { cn } from "@/lib/utils";

export function GlassPanel({
  children,
  className,
  strong = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Tag
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-2xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
