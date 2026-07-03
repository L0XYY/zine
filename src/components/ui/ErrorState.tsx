import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function ErrorState({
  title = "Something looped out of bounds",
  description = "We hit an unexpected error. It's not you — try again in a moment.",
  onRetry,
  retryHref,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryHref?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "glass flex flex-col items-center justify-center rounded-3xl border-rose-500/20 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/10 text-rose-300">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-400">{description}</p>
      {(onRetry || retryHref) &&
        (retryHref ? (
          <Button href={retryHref} variant="outline" className="mt-6" size="sm">
            Try again
          </Button>
        ) : (
          <Button onClick={onRetry} variant="outline" className="mt-6" size="sm">
            Try again
          </Button>
        ))}
    </div>
  );
}

/** Inline error message for forms. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
