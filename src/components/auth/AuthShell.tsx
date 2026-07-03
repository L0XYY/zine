import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-zine-gradient opacity-20" />
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-zine-green/40 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-zine-mint/30 blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />

          <div className="max-w-md">
            <Quote className="h-10 w-10 text-zine-green" />
            <p className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-balance">
              Six seconds. One perfect loop. That&apos;s all it takes to say
              something.
            </p>
            <p className="mt-6 text-slate-300">
              Turn quick ideas into 6-second loops the whole world rewatches.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3">
              <span className="h-2 w-2 rounded-full bg-zine-green" />
              6-second loops · 6 categories
            </span>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between lg:hidden">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-sm py-10">
            <Link
              href="/"
              className="mb-8 hidden items-center gap-1 text-sm text-slate-400 hover:text-white lg:flex"
            >
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-2 text-slate-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
