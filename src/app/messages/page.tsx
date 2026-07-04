import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MessagesInbox } from "@/components/messages/MessagesInbox";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your Zine direct messages.",
};

export default function MessagesPage() {
  return (
    <AppShell rightPanel={false}>
      <RequireAuth>
        <MessagesInbox />
      </RequireAuth>
    </AppShell>
  );
}
