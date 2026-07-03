"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Clapperboard,
  Heart,
  Settings as SettingsIcon,
  UserX,
} from "lucide-react";
import { findUserByUsername, videosByUser, allVideos } from "@/lib/local-store";
import { isLiked } from "@/lib/interactions";
import { cn, formatCount } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { VerifiedCheck, BadgeRow } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoGrid } from "@/components/feed/VideoGrid";
import { FollowButton } from "@/components/feed/FollowButton";
import { FullSpinner } from "@/components/ui/Spinner";
import type { User, Video } from "@/lib/types";

type Tab = "zines" | "sparked";

export function ProfileView({ username }: { username: string }) {
  const { user: me, loading } = useAuth();
  const [resolved, setResolved] = useState<User | null | undefined>(undefined);
  const [zines, setZines] = useState<Video[]>([]);
  const [sparked, setSparked] = useState<Video[]>([]);
  const [tab, setTab] = useState<Tab>("zines");

  const isMeRoute = username === "me";
  const isOwn = !!me && !!resolved && me.id === resolved.id;

  useEffect(() => {
    if (loading) return;
    const target = isMeRoute ? me ?? null : findUserByUsername(username) ?? null;
    setResolved(target);
    if (target) {
      setZines(videosByUser(target.id));
      setSparked(allVideos().filter((v) => isLiked(v.id)));
    }
  }, [username, isMeRoute, me, loading]);

  const joined = useMemo(() => {
    if (!resolved) return "";
    return new Date(resolved.createdAt).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [resolved]);

  if (loading || resolved === undefined) {
    return <FullSpinner label="Loading profile…" />;
  }

  if (resolved === null) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center">
        <EmptyState
          icon={<UserX className="h-7 w-7" />}
          title={isMeRoute ? "Log in to see your profile" : "Ziner not found"}
          description={
            isMeRoute
              ? "You need to be logged in to view your own profile."
              : `We couldn't find @${username}. They may have changed their username or left Zine.`
          }
          action={
            isMeRoute
              ? { label: "Log in", href: "/login" }
              : { label: "Back to feed", href: "/feed" }
          }
        />
      </div>
    );
  }

  const shown = tab === "zines" ? zines : sparked;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden rounded-3xl sm:h-56">
        {resolved.bannerUrl ? (
          <Image
            src={resolved.bannerUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-zine-gradient opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
      </div>

      {/* Header */}
      <div className="-mt-12 px-2 sm:-mt-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar
              src={resolved.avatarUrl}
              name={resolved.displayName}
              size="xl"
              ring
              className="shadow-glass"
            />
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                  {resolved.displayName}
                </h1>
                {resolved.verified && <VerifiedCheck className="h-5 w-5" />}
              </div>
              <p className="text-sm text-slate-400">@{resolved.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwn ? (
              <Button href="/settings" variant="glass" size="sm">
                <SettingsIcon className="h-4 w-4" /> Edit profile
              </Button>
            ) : (
              <FollowButton
                targetUserId={resolved.id}
                targetUsername={resolved.username}
                size="md"
              />
            )}
          </div>
        </div>

        {/* Badges */}
        {resolved.badges.length > 0 && (
          <div className="mt-4">
            <BadgeRow badges={resolved.badges} max={5} />
          </div>
        )}

        {/* Bio */}
        {resolved.bio && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
            {resolved.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span>
            <span className="font-bold text-white">{formatCount(zines.length)}</span>{" "}
            <span className="text-slate-400">Zines</span>
          </span>
          <span>
            <span className="font-bold text-white">
              {formatCount(resolved.followers)}
            </span>{" "}
            <span className="text-slate-400">followers</span>
          </span>
          <span>
            <span className="font-bold text-white">
              {formatCount(resolved.following)}
            </span>{" "}
            <span className="text-slate-400">following</span>
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" /> Joined {joined}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
            {ROLE_LABEL[resolved.role]}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-white/10">
        <TabButton
          active={tab === "zines"}
          onClick={() => setTab("zines")}
          icon={<Clapperboard className="h-4 w-4" />}
          label="Zines"
        />
        {isOwn && (
          <TabButton
            active={tab === "sparked"}
            onClick={() => setTab("sparked")}
            icon={<Heart className="h-4 w-4" />}
            label="Sparked"
          />
        )}
      </div>

      <div className="mt-6">
        {shown.length ? (
          <VideoGrid videos={shown} />
        ) : (
          <EmptyState
            icon={
              tab === "zines" ? (
                <Clapperboard className="h-7 w-7" />
              ) : (
                <Heart className="h-7 w-7" />
              )
            }
            title={
              tab === "zines"
                ? isOwn
                  ? "You haven't posted a Zine yet"
                  : `@${resolved.username} hasn't posted yet`
                : "No Sparks yet"
            }
            description={
              tab === "zines"
                ? isOwn
                  ? "Your loops will show up here. Drop your first 6-second Zine."
                  : "When they post their first loop, it'll show up here."
                : "Videos you Spark will collect here for easy rewatching."
            }
            action={
              tab === "zines" && isOwn
                ? { label: "Upload a Zine", href: "/upload" }
                : tab === "sparked"
                  ? { label: "Explore the feed", href: "/feed" }
                  : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
        active ? "text-white" : "text-slate-400 hover:text-white",
      )}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-zine-gradient" />
      )}
    </button>
  );
}
