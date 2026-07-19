"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserX } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { Spinner } from "@/components/ui/Spinner";
import { searchUsers } from "@/lib/data";
import { useAuth } from "@/components/providers/AuthProvider";
import type { User } from "@/lib/types";

export function NewMessageModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setResults(null);
    const t = setTimeout(() => {
      searchUsers(query).then((r) => {
        if (alive) setResults(r.filter((u) => u.id !== user?.id));
      });
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, open, user?.id]);

  const pick = (u: User) => {
    onClose();
    router.push(`/messages/${u.username}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="New message">
      <div className="p-4">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Ziners…"
            aria-label="Search Ziners to message"
            className="ring-focus h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500"
          />
        </div>

        {results === null ? (
          <div className="grid place-items-center py-8">
            <Spinner className="h-6 w-6 text-zine-teal" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-slate-400">
            <UserX className="h-6 w-6" />
            {query ? "No Ziners match that." : "No other Ziners yet."}
          </div>
        ) : (
          <ul className="space-y-1">
            {results.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => pick(u)}
                  className="ring-focus flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5"
                >
                  <Avatar src={u.avatarUrl} name={u.displayName} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-white">
                        {u.displayName}
                      </span>
                      {u.verified && <VerifiedCheck className="h-4 w-4" />}
                    </span>
                    <span className="block truncate text-sm text-slate-400">
                      @{u.username}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
