"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFollowing, toggleFollow } from "@/lib/interactions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

export function FollowButton({
  targetUserId,
  targetUsername,
  size = "sm",
  className,
}: {
  targetUserId: string;
  targetUsername: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [following, setFollowing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFollowing(isFollowing(targetUserId));
  }, [targetUserId]);

  // Don't render a follow button for your own account.
  if (user && user.id === targetUserId) return null;

  const onClick = () => {
    const now = toggleFollow(targetUserId);
    setFollowing(now);
    toast(now ? `Following @${targetUsername}` : `Unfollowed @${targetUsername}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "ring-focus inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-200 active:scale-95",
        size === "sm" ? "h-8 px-3.5 text-xs" : "h-10 px-5 text-sm",
        following
          ? "border border-white/20 bg-white/5 text-white hover:border-rose-400/40 hover:text-rose-300"
          : "btn-gradient",
        className,
      )}
    >
      {mounted && following ? (
        <>
          <Check className="h-3.5 w-3.5" /> Following
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" /> Follow
        </>
      )}
    </button>
  );
}
