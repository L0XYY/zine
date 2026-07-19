import {
  Bell,
  Bookmark,
  Compass,
  Flame,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Swords,
  Upload,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

export type UnreadKey = "messages" | "notifications";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Uses the live username when available. */
  dynamicProfile?: boolean;
  primary?: boolean;
  /** Requires a signed-in user to be shown. */
  authOnly?: boolean;
  /** Which unread counter (if any) badges this item. */
  unread?: UnreadKey;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Feed", href: "/feed", icon: Home },
  { label: "Hot Loops", href: "/trending", icon: Flame },
  { label: "Challenges", href: "/challenges", icon: Swords },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    authOnly: true,
    unread: "notifications",
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    authOnly: true,
    unread: "messages",
  },
  { label: "Saved", href: "/saved", icon: Bookmark, authOnly: true },
  { label: "Upload", href: "/upload", icon: Upload, primary: true },
  { label: "Profile", href: "/u/me", icon: UserIcon, dynamicProfile: true },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

// Compact set for the mobile bottom bar.
export const MOBILE_NAV: NavItem[] = [
  { label: "Feed", href: "/feed", icon: Home },
  { label: "Hot Loops", href: "/trending", icon: Flame },
  { label: "Upload", href: "/upload", icon: Upload, primary: true },
  { label: "Challenges", href: "/challenges", icon: Compass },
  { label: "Profile", href: "/u/me", icon: UserIcon, dynamicProfile: true },
];
