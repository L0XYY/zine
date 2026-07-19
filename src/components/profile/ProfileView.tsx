"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bookmark,
  CalendarDays,
  Clapperboard,
  Heart,
  MessageSquare,
  Repeat2,
  Settings as SettingsIcon,
  UserX,
} from "lucide-react";
import { fetchUserByUsername, fetchVideos, fetchVideosByUser } from "@/lib/data";
import { isLiked } from "@/lib/interactions";
import { savedVideoIds } from "@/lib/bookmarks";
import { rezinedVideoIds } from "@/lib/rezines";
import { cn, formatCount } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { InlineBadges, BadgeRow } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoGrid } from "@/components/feed/VideoGrid";
import { FollowButton } from "@/components/feed/FollowButton";
import { FullSpinner } from "@/components/ui/Spinner";
import type { User, Video } from "@/lib/types";

type Tab = "zines" | "rezined" | "sparked" | "saved";

export function ProfileView({ username }: { username: string }) {
  const { user: me, loading } = useAuth();
  const [resolved, setResolved] = useState<User | null | undefined>(undefined);
  const [zines, setZines] = useState<Video[]>([]);
  const [sparked, setSparked] = useState<Video[]>([]);
  const [saved, setSaved] = useState<Video[]>([]);
  const [rezined, setRezined] = useState<Video[]>([]);
  const [tab, setTab] = useState<Tab>("zines");

  const isMeRoute = username === "me";
  const isOwn = !!me && !!resolved && me.id === resolved.id;

  useEffect(() => {
    if (loading) return;
    let alive = true;
    (async () => {
      const target = isMeRoute
        ? me
          ? await fetchUserByUsername(me.username)
          : null
        : await fetchUserByUsername(username);
      if (!alive) return;
      setResolved(target);
      if (target) {
        const z = await fetchVideosByUser(target.id);
        if (!alive) return;
        setZines(z);
        // Own-profile collections (sparked / saved / rezined) are client-side.
        const ownProfile = !!me && me.id === target.id;
        if (ownProfile) {
          const all = await fetchVideos();
          if (!alive) return;
          setSparked(all.filter((v) => isLiked(v.id)));
          const savedSet = new Set(savedVideoIds());
          const rezinedSet = new Set(rezinedVideoIds());
          setSaved(all.filter((v) => savedSet.has(v.id)));
          setRezined(all.filter((v) => rezinedSet.has(v.id)));
        }
      }
    })();
    return () => {
      alive = false;
    };
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

  const shown =
    tab === "zines"
      ? zines
      : tab === "rezined"
        ? rezined
        : tab === "saved"
          ? saved
          : sparked;

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
      <div className="px-2 sm:px-6">
        {/* Only the avatar overlaps the banner; the action button aligns to it */}
        <div className="flex items-end justify-between">
          <Avatar
            src={resolved.avatarUrl}
            name={resolved.displayName}
            size="xl"
            ring
            className="-mt-12 shadow-glass sm:-mt-14"
          />
          <div className="flex items-center gap-2 pb-1">
            {isOwn ? (
              <Button href="/settings" variant="glass" size="sm">
                <SettingsIcon className="h-4 w-4" /> Edit profile
              </Button>
            ) : (
              <>
                {me && (
                  <Button
                    href={`/messages/${resolved.username}`}
                    variant="glass"
                    size="sm"
                    aria-label={`Message ${resolved.displayName}`}
                  >
                    <MessageSquare className="h-4 w-4" /> Message
                  </Button>
                )}
                <FollowButton
                  targetUserId={resolved.id}
                  targetUsername={resolved.username}
                  size="md"
                />
              </>
            )}
          </div>
        </div>

        {/* Name + handle sit clearly below the banner */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              {resolved.displayName}
            </h1>
            <InlineBadges
              badges={resolved.badges}
              verified={resolved.verified}
              className="gap-1 [&_svg]:h-5 [&_svg]:w-5"
            />
          </div>
          <p className="text-sm text-slate-400">@{resolved.username}</p>
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
              {formatCount(zines.reduce((a, v) => a + v.loops, 0))}
            </span>{" "}
            <span className="text-slate-400">loops</span>
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
      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 no-scrollbar">
        <TabButton
          active={tab === "zines"}
          onClick={() => setTab("zines")}
          icon={<Clapperboard className="h-4 w-4" />}
          label="Zines"
          count={zines.length}
        />
        {isOwn && (
          <>
            <TabButton
              active={tab === "rezined"}
              onClick={() => setTab("rezined")}
              icon={<Repeat2 className="h-4 w-4" />}
              label="Rezined"
              count={rezined.length}
            />
            <TabButton
              active={tab === "sparked"}
              onClick={() => setTab("sparked")}
              icon={<Heart className="h-4 w-4" />}
              label="Sparked"
              count={sparked.length}
            />
            <TabButton
              active={tab === "saved"}
              onClick={() => setTab("saved")}
              icon={<Bookmark className="h-4 w-4" />}
              label="Saved"
              count={saved.length}
            />
          </>
        )}
      </div>

      <div className="mt-6">
        {shown.length ? (
          <VideoGrid videos={shown} />
        ) : (
          <EmptyState
            icon={EMPTY_META[tab].icon}
            title={
              tab === "zines"
                ? isOwn
                  ? "You haven't posted a Zine yet"
                  : `@${resolved.username} hasn't posted yet`
                : EMPTY_META[tab].title
            }
            description={
              tab === "zines"
                ? isOwn
                  ? "Your loops will show up here. Drop your first 6-second Zine."
                  : "When they post their first loop, it'll show up here."
                : EMPTY_META[tab].description
            }
            action={
              tab === "zines" && isOwn
                ? { label: "Upload a Zine", href: "/upload" }
                : tab !== "zines"
                  ? { label: "Explore the feed", href: "/feed" }
                  : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

const EMPTY_META: Record<
  Tab,
  { icon: React.ReactNode; title: string; description: string }
> = {
  zines: {
    icon: <Clapperboard className="h-7 w-7" />,
    title: "No Zines yet",
    description: "Loops will show up here.",
  },
  rezined: {
    icon: <Repeat2 className="h-7 w-7" />,
    title: "No Rezines yet",
    description: "Loops you Rezine will reshare onto your profile.",
  },
  sparked: {
    icon: <Heart className="h-7 w-7" />,
    title: "No Sparks yet",
    description: "Videos you Spark will collect here for easy rewatching.",
  },
  saved: {
    icon: <Bookmark className="h-7 w-7" />,
    title: "Nothing saved yet",
    description: "Bookmark any Zine and it'll show up here.",
  },
};

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
        active ? "text-white" : "text-slate-400 hover:text-white",
      )}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
          {count}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-zine-gradient" />
      )}
    </button>
  );
}
