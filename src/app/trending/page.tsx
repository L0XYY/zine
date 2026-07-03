import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { TrendingView } from "@/components/trending/TrendingView";

export const metadata: Metadata = {
  title: "Hot Loops",
  description: "Trending 6-second Zines ranked by loops and Sparks.",
};

export default function TrendingPage() {
  return (
    <AppShell rightPanel={false}>
      <TrendingView />
    </AppShell>
  );
}
