import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { Feed } from "@/components/feed/Feed";

export const metadata: Metadata = {
  title: "Feed",
  description: "The vertical loop feed. Swipe through 6-second Zines.",
};

export default function FeedPage() {
  return (
    <AppShell bleed mobileTopBar={false} rightPanel>
      <Feed />
    </AppShell>
  );
}
