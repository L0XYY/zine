import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-3xl text-zine-green">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {action &&
        (action.href ? (
          <Button href={action.href} className="mt-6" size="sm">
            {action.label}
          </Button>
        ) : (
          <Button onClick={action.onClick} className="mt-6" size="sm">
            {action.label}
          </Button>
        ))}
    </div>
  );
}
