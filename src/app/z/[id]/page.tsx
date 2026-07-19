import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { VideoDetailView } from "@/components/feed/VideoDetailView";

export const metadata: Metadata = {
  title: "Zine",
  description: "Watch this 6-second loop on Zine.",
};

export default function VideoPage({ params }: { params: { id: string } }) {
  return (
    <AppShell rightPanel={false}>
      <VideoDetailView id={params.id} />
    </AppShell>
  );
}
