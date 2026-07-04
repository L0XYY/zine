import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SearchView } from "@/components/search/SearchView";

export const metadata: Metadata = {
  title: "Search",
  description: "Find Ziners on Zine.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <AppShell rightPanel={false}>
      <SearchView initialQuery={searchParams.q ?? ""} />
    </AppShell>
  );
}
