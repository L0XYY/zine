import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Sparks, comments, follows and messages from other Ziners.",
};

export default function NotificationsPage() {
  return (
    <AppShell rightPanel={false}>
      <NotificationsView />
    </AppShell>
  );
}
