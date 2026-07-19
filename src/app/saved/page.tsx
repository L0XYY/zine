import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SavedView } from "@/components/saved/SavedView";

export const metadata: Metadata = {
  title: "Saved",
  description: "Zines you've bookmarked to loop back to.",
};

export default function SavedPage() {
  return (
    <AppShell rightPanel={false}>
      <SavedView />
    </AppShell>
  );
}
