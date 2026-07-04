// ---------------------------------------------------------------------------
// Shared front-end types. These mirror the Prisma models but are decoupled so
// the UI can run on mock data without a database connection.
// ---------------------------------------------------------------------------

export type Role =
  | "OWNER"
  | "ADMIN"
  | "MODERATOR"
  | "PARTNER"
  | "VERIFIED"
  | "USER";

export type Category =
  | "GAMING"
  | "ROBLOX"
  | "MINECRAFT"
  | "MEMES"
  | "EDITS"
  | "IRL"
  | "CHALLENGES";

export type BadgeKind = "VERIFIED" | "PARTNER" | "FOUNDER" | "STAFF" | "EARLY";

export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "NUDITY"
  | "VIOLENCE"
  | "HATE"
  | "ILLEGAL"
  | "OTHER";

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  role: Role;
  verified: boolean;
  partnered: boolean;
  banned: boolean;
  badges: BadgeKind[];
  followers: number;
  following: number;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  author: Pick<
    User,
    "id" | "username" | "displayName" | "avatarUrl" | "verified" | "partnered" | "role" | "badges"
  >;
  title: string;
  caption: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  category: Category;
  views: number;
  loops: number;
  likesCount: number;
  commentsCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isDeleted: boolean;
  challengeSlug?: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "verified" | "badges">;
  body: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterUsername: string;
  videoId: string | null;
  videoTitle: string | null;
  commentId: string | null;
  commentBody: string | null;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  bannerUrl: string | null;
  isActive: boolean;
  entries: number;
  endsAt: string | null;
  accent: "purple" | "blue" | "pink";
}

// --- Direct messages -------------------------------------------------------

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  other: Pick<
    User,
    "id" | "username" | "displayName" | "avatarUrl" | "verified" | "badges"
  >;
  lastMessage: string | null;
  lastMessageAt: string;
}
