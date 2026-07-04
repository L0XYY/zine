// ---------------------------------------------------------------------------
// Unified data-access layer.
//
// When Supabase is configured, every function talks to the live database /
// storage. Otherwise it transparently falls back to the local (mock +
// localStorage + IndexedDB) layer, so the app still runs with no backend.
// Components only import from here.
// ---------------------------------------------------------------------------

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, VIDEO_BUCKET } from "@/lib/supabase/config";
import { rowToComment, rowToUser, rowToVideo } from "@/lib/supabase/mappers";
import * as local from "@/lib/local-store";
import { putMedia, MEDIA_PREFIX } from "@/lib/media-store";
import { getCommentsForVideo as localComments } from "@/lib/mock-data";
import type {
  Category,
  Comment,
  Report,
  ReportReason,
  ReportStatus,
  User,
  Video,
} from "@/lib/types";

const VIDEO_SELECT = "*, author:profiles(*), likes(count), comments(count)";

function sb() {
  return isSupabaseConfigured() ? getSupabaseBrowserClient() : null;
}

function withCounts(row: any): Video {
  const v = rowToVideo(row);
  const likes = Array.isArray(row.likes) ? row.likes[0]?.count : undefined;
  const comments = Array.isArray(row.comments) ? row.comments[0]?.count : undefined;
  return {
    ...v,
    likesCount: likes ?? v.likesCount,
    commentsCount: comments ?? v.commentsCount,
  };
}

// --- Videos (reads) --------------------------------------------------------

export async function fetchVideos(): Promise<Video[]> {
  const client = sb();
  if (!client) return local.allVideos();
  const { data, error } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("fetchVideos", error.message);
    return [];
  }
  return (data ?? []).map(withCounts);
}

export async function fetchTrending(): Promise<Video[]> {
  const list = await fetchVideos();
  return [...list].sort(
    (a, b) => b.loops + b.likesCount - (a.loops + a.likesCount),
  );
}

export async function fetchVideosByUser(userId: string): Promise<Video[]> {
  const client = sb();
  if (!client) return local.videosByUser(userId);
  const { data, error } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchVideosByUser", error.message);
    return [];
  }
  return (data ?? []).map(withCounts);
}

export async function fetchVideosByChallenge(slug: string): Promise<Video[]> {
  const client = sb();
  if (!client) return local.allVideos().filter((v) => v.challengeSlug === slug);
  const { data, error } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("challenge_slug", slug)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(withCounts);
}

// --- Users (reads) ---------------------------------------------------------

export async function fetchUserByUsername(
  username: string,
): Promise<User | null> {
  const client = sb();
  if (!client) return local.findUserByUsername(username) ?? null;
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  if (error || !data) return null;
  const user = rowToUser(data);
  const [{ count: followers }, { count: following }] = await Promise.all([
    client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id),
    client
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id),
  ]);
  return { ...user, followers: followers ?? 0, following: following ?? 0 };
}

export async function searchUsers(query: string): Promise<User[]> {
  const client = sb();
  if (!client) {
    const q = query.trim().toLowerCase();
    return local
      .allUsers()
      .filter(
        (u) =>
          !q ||
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q),
      );
  }
  let req = client.from("profiles").select("*").limit(50);
  const q = query.trim();
  if (q) req = req.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
  const { data, error } = await req.order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToUser);
}

// --- Comments --------------------------------------------------------------

export async function fetchComments(videoId: string): Promise<Comment[]> {
  const client = sb();
  if (!client) return localComments(videoId);
  const { data, error } = await client
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("video_id", videoId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToComment);
}

export async function addComment(
  videoId: string,
  body: string,
  author: User,
): Promise<Comment | null> {
  const client = sb();
  const trimmed = body.trim().slice(0, 500);
  if (!client) {
    return {
      id: `local_${Date.now()}`,
      videoId,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        verified: author.verified,
        badges: author.badges,
      },
      body: trimmed,
      createdAt: new Date().toISOString(),
    };
  }
  const { data, error } = await client
    .from("comments")
    .insert({ video_id: videoId, user_id: author.id, body: trimmed })
    .select("*, author:profiles(*)")
    .single();
  if (error || !data) {
    console.error("addComment", error?.message);
    return null;
  }
  return rowToComment(data);
}

// --- Interactions: likes & follows -----------------------------------------

export async function loadLikedVideoIds(userId: string): Promise<string[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("likes")
    .select("video_id")
    .eq("user_id", userId);
  return (data ?? []).map((r: any) => r.video_id as string);
}

export async function loadFollowingIds(userId: string): Promise<string[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  return (data ?? []).map((r: any) => r.following_id as string);
}

export async function setLike(videoId: string, liked: boolean, userId: string) {
  const client = sb();
  if (!client) return;
  if (liked) {
    await client.from("likes").upsert(
      { user_id: userId, video_id: videoId },
      { onConflict: "user_id,video_id", ignoreDuplicates: true },
    );
  } else {
    await client
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("video_id", videoId);
  }
}

export async function setFollow(
  followingId: string,
  following: boolean,
  followerId: string,
) {
  const client = sb();
  if (!client) return;
  if (following) {
    await client.from("follows").upsert(
      { follower_id: followerId, following_id: followingId },
      { onConflict: "follower_id,following_id", ignoreDuplicates: true },
    );
  } else {
    await client
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
  }
}

// --- Reports ---------------------------------------------------------------

export async function createReport(
  videoId: string,
  reason: ReportReason,
  detail: string,
  reporterId: string,
): Promise<boolean> {
  const client = sb();
  if (!client) return true;
  const { error } = await client.from("reports").insert({
    video_id: videoId,
    reporter_id: reporterId,
    reason,
    detail: detail.slice(0, 500) || null,
  });
  if (error) console.error("createReport", error.message);
  return !error;
}

// --- Uploads ---------------------------------------------------------------

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export interface CreateVideoInput {
  user: User;
  title: string;
  caption: string | null;
  category: Category;
  challengeSlug: string | null;
  duration: number;
  file?: File | null;
  sampleUrl?: string | null;
  thumbnailDataUrl?: string | null;
}

export async function createVideo(input: CreateVideoInput): Promise<Video> {
  const client = sb();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `v_${Date.now()}`;

  const authorEmbed = {
    id: input.user.id,
    username: input.user.username,
    displayName: input.user.displayName,
    avatarUrl: input.user.avatarUrl,
    verified: input.user.verified,
    partnered: input.user.partnered,
    role: input.user.role,
    badges: input.user.badges,
  };

  // --- Local fallback: IndexedDB blob + localStorage row ---
  if (!client) {
    let videoUrl = input.sampleUrl ?? "";
    if (input.file) {
      try {
        await putMedia(id, input.file);
        videoUrl = `${MEDIA_PREFIX}${id}`;
      } catch {
        videoUrl = URL.createObjectURL(input.file);
      }
    }
    const video: Video = {
      id,
      userId: input.user.id,
      author: authorEmbed,
      title: input.title,
      caption: input.caption,
      videoUrl,
      thumbnailUrl: input.thumbnailDataUrl || null,
      duration: input.duration,
      category: input.category,
      views: 0,
      loops: 0,
      likesCount: 0,
      commentsCount: 0,
      isFeatured: false,
      isTrending: false,
      isDeleted: false,
      challengeSlug: input.challengeSlug,
      createdAt: new Date().toISOString(),
    };
    local.saveLocalVideo(video);
    return video;
  }

  // --- Supabase: upload to Storage, then insert the row ---
  let videoUrl = input.sampleUrl ?? "";
  if (input.file) {
    const path = `${input.user.id}/${id}.mp4`;
    const { error: upErr } = await client.storage
      .from(VIDEO_BUCKET)
      .upload(path, input.file, {
        contentType: input.file.type || "video/mp4",
        upsert: true,
      });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    videoUrl = client.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  let thumbnailUrl: string | null = null;
  if (input.thumbnailDataUrl?.startsWith("data:")) {
    try {
      const blob = dataUrlToBlob(input.thumbnailDataUrl);
      const path = `${input.user.id}/${id}-thumb.jpg`;
      await client.storage
        .from(VIDEO_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      thumbnailUrl = client.storage.from(VIDEO_BUCKET).getPublicUrl(path).data
        .publicUrl;
    } catch {
      thumbnailUrl = null;
    }
  } else if (input.thumbnailDataUrl) {
    // Already a hosted URL (e.g. the sample clip's poster).
    thumbnailUrl = input.thumbnailDataUrl;
  }

  const { data, error } = await client
    .from("videos")
    .insert({
      id,
      user_id: input.user.id,
      title: input.title,
      caption: input.caption,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration: input.duration,
      category: input.category,
      challenge_slug: input.challengeSlug,
    })
    .select(VIDEO_SELECT)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not save the Zine.");
  return withCounts(data);
}

export async function uploadProfileImage(
  userId: string,
  kind: "avatar" | "banner",
  file: File,
): Promise<string | null> {
  const client = sb();
  if (!client) {
    // mock mode: return a data URL
    return await new Promise<string | null>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    });
  }
  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await client.storage
    .from(VIDEO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) {
    console.error("uploadProfileImage", error.message);
    return null;
  }
  return client.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
}

// --- Admin -----------------------------------------------------------------

export async function adminFetchUsers(): Promise<User[]> {
  const client = sb();
  if (!client) return local.allUsers();
  const { data } = await client
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToUser);
}

export async function adminFetchVideos(): Promise<Video[]> {
  const client = sb();
  if (!client) return local.allVideos();
  const { data } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map(withCounts);
}

export async function adminFetchReports(): Promise<Report[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("reports")
    .select("*, reporter:profiles(username), video:videos(id,title)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id,
    reporterUsername: r.reporter?.username ?? "unknown",
    videoId: r.video?.id ?? null,
    videoTitle: r.video?.title ?? null,
    reason: r.reason as ReportReason,
    detail: r.detail ?? null,
    status: r.status as ReportStatus,
    createdAt: r.created_at,
  }));
}

export async function adminFetchComments(): Promise<Comment[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(rowToComment);
}

export async function adminUpdateUser(id: string, patch: Record<string, unknown>) {
  const client = sb();
  if (!client) return;
  await client.from("profiles").update(patch).eq("id", id);
}

export async function adminUpdateVideo(id: string, patch: Record<string, unknown>) {
  const client = sb();
  if (!client) return;
  await client.from("videos").update(patch).eq("id", id);
}

export async function adminDeleteComment(id: string) {
  const client = sb();
  if (!client) return;
  await client.from("comments").update({ is_deleted: true }).eq("id", id);
}

export async function adminSetReportStatus(id: string, status: ReportStatus) {
  const client = sb();
  if (!client) return;
  await client.from("reports").update({ status }).eq("id", id);
}
