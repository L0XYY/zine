import { FullSpinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <FullSpinner label="Loading Zine…" />
    </div>
  );
}
