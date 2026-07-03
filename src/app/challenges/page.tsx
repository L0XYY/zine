import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChallengesView } from "@/components/challenges/ChallengesView";
import { FullSpinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Weekly Zine challenges — speedruns, seamless loops, and more.",
};

export default function ChallengesPage() {
  return (
    <AppShell rightPanel={false}>
      <Suspense fallback={<FullSpinner label="Loading challenges…" />}>
        <ChallengesView />
      </Suspense>
    </AppShell>
  );
}
