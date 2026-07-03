import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <Logo showText={false} className="mx-auto mb-6" />
        <p className="font-display text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">
          This loop went nowhere
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to the good loops.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/feed">Back to feed</Button>
          <Button href="/" variant="outline">
            Home
          </Button>
        </div>
        <p className="mt-8 text-sm text-slate-600">
          Or{" "}
          <Link href="/trending" className="text-zine-green hover:underline">
            explore Hot Loops
          </Link>
        </p>
      </div>
    </div>
  );
}
