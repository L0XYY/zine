"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Wire this to your error reporting service in production.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <ErrorState
        title="This loop broke"
        description="An unexpected error interrupted the loop. You can try again — if it keeps happening, it's on us."
        onRetry={reset}
        className="max-w-md"
      />
    </div>
  );
}
