import {
  Compass,
  Flame,
  Home,
  Settings,
  Shield,
  Swords,
  Upload,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Uses the live username when available. */
  dynamicProfile?: boolean;
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Feed", href: "/feed", icon: Home },
  { label: "Hot Loops", href: "/trending", icon: Flame },
  { label: "Challenges", href: "/challenges", icon: Swords },
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
