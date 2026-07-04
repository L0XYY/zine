import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MessageThread } from "@/components/messages/MessageThread";

export function generateMetadata({
  params,
}: {
  params: { username: string };
}): Metadata {
  return { title: `Chat with @${params.username}` };
}

export default function ThreadPage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <AppShell rightPanel={false} mobileTopBar={false}>
      <RequireAuth>
        <MessageThread username={params.username} />
      </RequireAuth>
    </AppShell>
  );
}
