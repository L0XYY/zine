import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { TagView } from "@/components/tag/TagView";

export function generateMetadata({
  params,
}: {
  params: { tag: string };
}): Metadata {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `#${tag}`,
    description: `Zines tagged #${tag} — short videos that loop different.`,
  };
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  return (
    <AppShell rightPanel={false}>
      <TagView tag={tag} />
    </AppShell>
  );
}
