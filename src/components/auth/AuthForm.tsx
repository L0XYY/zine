"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, KeyRound, Mail, Sparkles, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/ErrorState";
import { slugify } from "@/lib/utils";

function Field({
  icon,
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        <input
          {...props}
          className="ring-focus h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500"
        />
      </div>
    </label>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const toast = useToast();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result =
      mode === "login"
        ? await login(email, password)
        : await signup({ email, password, username, displayName });
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    toast(mode === "login" ? "Welcome back 👋" : "Welcome to Zine ✨", "success");
    router.push("/feed");
  };

  return (
    <div className="w-full">
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <>
            <Field
              icon={<UserIcon className="h-4 w-4" />}
              type="text"
              placeholder="Display name"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Field
              icon={<AtSign className="h-4 w-4" />}
              type="text"
              placeholder="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(slugify(e.target.value))}
              required
            />
          </>
        )}
        <Field
          icon={<Mail className="h-4 w-4" />}
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          icon={<KeyRound className="h-4 w-4" />}
          type="password"
          placeholder="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <FormError message={error} />

        <Button type="submit" loading={busy} className="w-full" size="lg">
          <Sparkles className="h-4 w-4" />
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {mode === "login" ? (
          <>
            New to Zine?{" "}
            <Link href="/signup" className="font-medium text-zine-green hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already looping?{" "}
            <Link href="/login" className="font-medium text-zine-green hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
