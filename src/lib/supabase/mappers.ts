// Map Supabase rows (snake_case) to the app's front-end types (camelCase).

import type {
  BadgeKind,
  Category,
  Comment,
  Role,
  User,
  Video,
} from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email ?? "",
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? null,
    bannerUrl: row.banner_url ?? null,
    bio: row.bio ?? null,
    role: (row.role ?? "USER") as Role,
    verified: !!row.verified,
    partnered: !!row.partnered,
    banned: !!row.banned,
    badges: (row.badges ?? []) as BadgeKind[],
    followers: row.followers ?? 0,
    following: row.following ?? 0,
    createdAt: row.created_at,
  };
}

export function rowToVideo(row: any): Video {
  const a = row.author ?? row.profiles ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    author: {
      id: a.id ?? row.user_id,
      username: a.username ?? "",
      displayName: a.display_name ?? "",
      avatarUrl: a.avatar_url ?? null,
      verified: !!a.verified,
      partnered: !!a.partnered,
      role: (a.role ?? "USER") as Role,
      badges: (a.badges ?? []) as BadgeKind[],
    },
    title: row.title,
    caption: row.caption ?? null,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url ?? null,
    duration: row.duration,
    category: (row.category ?? "MEMES") as Category,
    views: row.views ?? 0,
    loops: row.loops ?? 0,
    likesCount: row.likes_count ?? 0,
    commentsCount: row.comments_count ?? 0,
    isFeatured: !!row.is_featured,
    isTrending: !!row.is_trending,
    isDeleted: !!row.is_deleted,
    challengeSlug: row.challenge_slug ?? null,
    createdAt: row.created_at,
  };
}

export function rowToComment(row: any): Comment {
  const a = row.author ?? row.profiles ?? {};
  return {
    id: row.id,
    videoId: row.video_id,
    author: {
      id: a.id ?? row.user_id,
      username: a.username ?? "",
      displayName: a.display_name ?? "",
      avatarUrl: a.avatar_url ?? null,
      verified: !!a.verified,
      badges: (a.badges ?? []) as BadgeKind[],
    },
    body: row.body,
    createdAt: row.created_at,
  };
}
