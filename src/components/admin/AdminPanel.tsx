"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  BadgeCheck,
  Film,
  Flag,
  LayoutDashboard,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import {
  adminDeleteComment,
  adminFetchComments,
  adminFetchReports,
  adminFetchUsers,
  adminFetchVideos,
  adminSetReportStatus,
  adminUpdateUser,
  adminUpdateVideo,
} from "@/lib/data";
import { BADGES, ROLE_LABEL } from "@/lib/constants";
import { cn, formatCount, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { VerifiedCheck } from "@/components/ui/CreatorBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/providers/ToastProvider";
import type {
  BadgeKind,
  Comment,
  Report,
  ReportStatus,
  User,
  Video,
} from "@/lib/types";

type Tab = "overview" | "users" | "videos" | "reports" | "comments";

const TABS: { key: Tab; label: string; icon: typeof UsersIcon }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: UsersIcon },
  { key: "videos", label: "Videos", icon: Film },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "comments", label: "Comments", icon: MessageSquare },
];

export function AdminPanel() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      adminFetchUsers(),
      adminFetchVideos(),
      adminFetchReports(),
      adminFetchComments(),
    ]).then(([u, v, r, c]) => {
      if (!alive) return;
      setUsers(u);
      setVideos(v);
      setReports(r);
      setComments(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  const pendingReports = reports.filter(
    (r) => r.status === "PENDING" || r.status === "REVIEWING",
  ).length;

  // --- user actions ---
  const patchUser = (id: string, patch: Partial<User>) =>
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const toggleVerify = (u: User) => {
    const verified = !u.verified;
    const badges = verified
      ? Array.from(new Set([...u.badges, "VERIFIED" as BadgeKind]))
      : u.badges.filter((b) => b !== "VERIFIED");
    patchUser(u.id, { verified, badges });
    void adminUpdateUser(u.id, { verified, badges });
    toast(verified ? `Verified @${u.username}` : `Removed verification`, "success");
  };

  const toggleBan = (u: User) => {
    const banned = !u.banned;
    patchUser(u.id, { banned });
    void adminUpdateUser(u.id, { banned });
    toast(banned ? `Banned @${u.username}` : `Unbanned @${u.username}`, banned ? "error" : "success");
  };

  const grantBadge = (u: User, kind: BadgeKind) => {
    if (!kind) return;
    if (u.badges.includes(kind)) {
      toast(`@${u.username} already has ${BADGES[kind].label}`, "info");
      return;
    }
    const badges = [...u.badges, kind];
    const extra =
      kind === "PARTNER"
        ? { partnered: true }
        : kind === "VERIFIED"
          ? { verified: true }
          : {};
    patchUser(u.id, { badges, ...extra });
    void adminUpdateUser(u.id, { badges, ...extra });
    toast(`Gave @${u.username} the ${BADGES[kind].label} badge`, "success");
  };

  // --- video actions ---
  const patchVideo = (id: string, patch: Partial<Video>) =>
    setVideos((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const deleteVideo = (v: Video) => {
    patchVideo(v.id, { isDeleted: true });
    void adminUpdateVideo(v.id, { is_deleted: true });
    toast(`Deleted "${v.title}"`, "error");
  };
  const toggleFeature = (v: Video) => {
    const featured = !v.isFeatured;
    patchVideo(v.id, { isFeatured: featured });
    void adminUpdateVideo(v.id, { is_featured: featured });
    toast(featured ? `Featured "${v.title}"` : "Unfeatured", "success");
  };
  const toggleTrending = (v: Video) => {
    const trending = !v.isTrending;
    patchVideo(v.id, { isTrending: trending });
    void adminUpdateVideo(v.id, { is_trending: trending });
    toast(trending ? "Marked as trending" : "Removed from Hot Loops", "success");
  };

  // --- report actions ---
  const setReportStatus = (id: string, status: ReportStatus) => {
    setReports((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
    void adminSetReportStatus(id, status);
    toast(`Report ${status.toLowerCase()}`, status === "DISMISSED" ? "info" : "success");
  };

  // --- comment actions ---
  const removeComment = (id: string) => {
    setComments((list) => list.filter((c) => c.id !== id));
    void adminDeleteComment(id);
    toast("Comment removed", "error");
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.displayName.toLowerCase().includes(query.toLowerCase()),
      ),
    [users, query],
  );
  const filteredVideos = useMemo(
    () =>
      videos.filter(
        (v) =>
          !v.isDeleted &&
          (v.title.toLowerCase().includes(query.toLowerCase()) ||
            v.author.username.toLowerCase().includes(query.toLowerCase())),
      ),
    [videos, query],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Admin & Moderation
          </h1>
          <p className="text-sm text-slate-400">
            Manage Ziners, Zines, and keep the loops clean.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "ring-focus flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "glass-strong text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.key === "reports" && pendingReports > 0 && (
                <span className="rounded-full bg-rose-500/20 px-1.5 text-xs text-rose-300">
                  {pendingReports}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search (users/videos) */}
      {(tab === "users" || tab === "videos") && (
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab}…`}
            className="ring-focus h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500"
          />
        </div>
      )}

      {tab === "overview" && (
        <Overview
          users={users}
          videos={videos}
          pendingReports={pendingReports}
        />
      )}

      {tab === "users" && (
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              onVerify={() => toggleVerify(u)}
              onBan={() => toggleBan(u)}
              onGrant={(k) => grantBadge(u, k)}
            />
          ))}
        </div>
      )}

      {tab === "videos" && (
        <div className="space-y-2">
          {filteredVideos.length ? (
            filteredVideos.map((v) => (
              <VideoRow
                key={v.id}
                video={v}
                onDelete={() => deleteVideo(v)}
                onFeature={() => toggleFeature(v)}
                onTrending={() => toggleTrending(v)}
              />
            ))
          ) : (
            <EmptyState
              icon={<Film className="h-6 w-6" />}
              title="No videos match"
              description="Try a different search."
            />
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-2">
          {reports.length ? (
            reports.map((r) => (
              <ReportRow
                key={r.id}
                report={r}
                onResolve={() => setReportStatus(r.id, "RESOLVED")}
                onDismiss={() => setReportStatus(r.id, "DISMISSED")}
                onReview={() => setReportStatus(r.id, "REVIEWING")}
              />
            ))
          ) : (
            <EmptyState
              icon={<Flag className="h-6 w-6" />}
              title="Queue is clear"
              description="No pending reports. Nice and clean."
            />
          )}
        </div>
      )}

      {tab === "comments" && (
        <div className="space-y-2">
          {comments.length ? (
            comments
              .slice(0, 20)
              .map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  onRemove={() => removeComment(c.id)}
                />
              ))
          ) : (
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="No comments"
              description="Removed comments won't show here."
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Overview -------------------------------- */

function Overview({
  users,
  videos,
  pendingReports,
}: {
  users: User[];
  videos: Video[];
  pendingReports: number;
}) {
  const liveVideos = videos.filter((v) => !v.isDeleted);
  const stats = [
    {
      label: "Ziners",
      value: formatCount(users.length),
      icon: UsersIcon,
      accent: "text-sky-300",
    },
    {
      label: "Zines",
      value: formatCount(liveVideos.length),
      icon: Film,
      accent: "text-teal-300",
    },
    {
      label: "Pending reports",
      value: formatCount(pendingReports),
      icon: Flag,
      accent: "text-rose-300",
    },
    {
      label: "Total loops",
      value: formatCount(liveVideos.reduce((a, v) => a + v.loops, 0)),
      icon: TrendingUp,
      accent: "text-emerald-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassPanel key={s.label} className="p-5">
            <s.icon className={cn("h-5 w-5", s.accent)} />
            <p className="mt-3 font-display text-2xl font-bold text-white">
              {s.value}
            </p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-5">
        <h3 className="mb-3 font-display font-semibold text-white">
          Moderation checklist
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {[
            "Review the reports queue daily",
            "Verify creators who hit 10K followers",
            "Feature one standout Zine per category",
            "Keep banned accounts out of the feed",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-300" />
              {item}
            </li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
}

/* ------------------------------- User row -------------------------------- */

function UserRow({
  user,
  onVerify,
  onBan,
  onGrant,
}: {
  user: User;
  onVerify: () => void;
  onBan: () => void;
  onGrant: (kind: BadgeKind) => void;
}) {
  return (
    <GlassPanel className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium text-white">
              {user.displayName}
            </span>
            {user.verified && <VerifiedCheck className="h-3.5 w-3.5" />}
            {user.banned && (
              <span className="rounded bg-rose-500/20 px-1.5 text-[10px] font-semibold text-rose-300">
                BANNED
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-400">
            @{user.username} · {ROLE_LABEL[user.role]}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          onChange={(e) => {
            onGrant(e.target.value as BadgeKind);
            e.currentTarget.selectedIndex = 0;
          }}
          className="ring-focus h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-300"
          defaultValue=""
        >
          <option value="" disabled>
            Give badge…
          </option>
          {Object.values(BADGES).map((b) => (
            <option key={b.kind} value={b.kind} className="bg-ink-800">
              {b.label}
            </option>
          ))}
        </select>
        <AdminAction
          onClick={onVerify}
          active={user.verified}
          icon={<BadgeCheck className="h-4 w-4" />}
          label={user.verified ? "Unverify" : "Verify"}
        />
        <AdminAction
          onClick={onBan}
          danger
          active={user.banned}
          icon={<Ban className="h-4 w-4" />}
          label={user.banned ? "Unban" : "Ban"}
        />
      </div>
    </GlassPanel>
  );
}

/* ------------------------------ Video row -------------------------------- */

function VideoRow({
  video,
  onDelete,
  onFeature,
  onTrending,
}: {
  video: Video;
  onDelete: () => void;
  onFeature: () => void;
  onTrending: () => void;
}) {
  return (
    <GlassPanel className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-800">
          {video.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {video.title}
          </p>
          <p className="truncate text-xs text-slate-400">
            @{video.author.username} · {formatCount(video.loops)} loops
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <CategoryPill category={video.category} />
            {video.isFeatured && (
              <span className="rounded bg-amber-500/20 px-1.5 text-[10px] font-semibold text-amber-300">
                FEATURED
              </span>
            )}
            {video.isTrending && (
              <span className="rounded bg-teal-500/20 px-1.5 text-[10px] font-semibold text-teal-300">
                TRENDING
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AdminAction
          onClick={onFeature}
          active={video.isFeatured}
          icon={<Star className="h-4 w-4" />}
          label={video.isFeatured ? "Unfeature" : "Feature"}
        />
        <AdminAction
          onClick={onTrending}
          active={video.isTrending}
          icon={<TrendingUp className="h-4 w-4" />}
          label="Trending"
        />
        <AdminAction
          onClick={onDelete}
          danger
          icon={<Trash2 className="h-4 w-4" />}
          label="Delete"
        />
      </div>
    </GlassPanel>
  );
}

/* ----------------------------- Report row -------------------------------- */

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  REVIEWING: "bg-sky-500/20 text-sky-300",
  RESOLVED: "bg-emerald-500/20 text-emerald-300",
  DISMISSED: "bg-white/10 text-slate-400",
};

function ReportRow({
  report,
  onResolve,
  onDismiss,
  onReview,
}: {
  report: Report;
  onResolve: () => void;
  onDismiss: () => void;
  onReview: () => void;
}) {
  const closed = report.status === "RESOLVED" || report.status === "DISMISSED";
  return (
    <GlassPanel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              STATUS_STYLES[report.status],
            )}
          >
            {report.status}
          </span>
          <span className="text-xs font-medium text-rose-300">
            {report.reason}
          </span>
          <span className="text-xs text-slate-500">
            {timeAgo(report.createdAt)} ago
          </span>
        </div>
        <p className="mt-1.5 text-sm text-white">
          {report.videoTitle ?? "Content"}{" "}
          <span className="text-slate-400">
            — reported by @{report.reporterUsername}
          </span>
        </p>
        {report.detail && (
          <p className="mt-0.5 text-xs text-slate-400">“{report.detail}”</p>
        )}
      </div>

      {!closed && (
        <div className="flex flex-wrap items-center gap-2">
          {report.status === "PENDING" && (
            <AdminAction
              onClick={onReview}
              icon={<Search className="h-4 w-4" />}
              label="Review"
            />
          )}
          <AdminAction
            onClick={onResolve}
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Resolve"
          />
          <AdminAction
            onClick={onDismiss}
            danger
            icon={<Trash2 className="h-4 w-4" />}
            label="Dismiss"
          />
        </div>
      )}
    </GlassPanel>
  );
}

/* ---------------------------- Comment row -------------------------------- */

function CommentRow({
  comment,
  onRemove,
}: {
  comment: Comment;
  onRemove: () => void;
}) {
  return (
    <GlassPanel className="flex items-center gap-3 p-3.5">
      <Avatar
        src={comment.author.avatarUrl}
        name={comment.author.displayName}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">
          @{comment.author.username} · {timeAgo(comment.createdAt)} ago
        </p>
        <p className="truncate text-sm text-slate-200">{comment.body}</p>
      </div>
      <AdminAction
        onClick={onRemove}
        danger
        icon={<Trash2 className="h-4 w-4" />}
        label="Remove"
      />
    </GlassPanel>
  );
}

/* ---------------------------- Shared button ------------------------------ */

function AdminAction({
  onClick,
  icon,
  label,
  active,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "ring-focus inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        danger
          ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/15"
          : active
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
