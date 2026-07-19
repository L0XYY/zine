import { cn } from "@/lib/utils";

/**
 * Consistent page header used across the app's sub-pages: a gradient icon tile,
 * a display title, and an optional subtitle, with room for trailing actions.
 */
export function PageHeader({
  icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-5 flex items-center gap-3", className)}>
      {icon && (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zine-gradient text-white shadow-glow">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
