import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileView } from "@/components/profile/ProfileView";

export function generateMetadata({
  params,
}: {
  params: { username: string };
}): Metadata {
  const handle = params.username === "me" ? "Your profile" : `@${params.username}`;
  return {
    title: handle,
    description: `${handle} on Zine — short videos that loop different.`,
  };
}

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <AppShell rightPanel={false}>
      <ProfileView username={params.username} />
    </AppShell>
  );
}
