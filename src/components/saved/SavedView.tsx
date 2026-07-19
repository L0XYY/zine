"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchVideosByIds } from "@/lib/data";
import { savedVideoIds, subscribeSaves } from "@/lib/bookmarks";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullSpinner } from "@/components/ui/Spinner";
import { VideoGrid } from "@/components/feed/VideoGrid";
import type { Video } from "@/lib/types";

export function SavedView() {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    if (loading) return;
    let alive = true;
    const load = () => {
      const ids = savedVideoIds();
      if (ids.length === 0) {
        if (alive) setVideos([]);
        return;
      }
      fetchVideosByIds(ids).then((v) => {
        if (alive) setVideos(v);
      });
    };
    load();
    const unsub = subscribeSaves(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [loading]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<Bookmark className="h-5 w-5" />}
        title="Saved"
        subtitle="Zines you've bookmarked to loop back to."
      />

      {!user && !loading ? (
        <EmptyState
          icon={<Bookmark className="h-7 w-7" />}
          title="Log in to save Zines"
          description="Tap the bookmark on any loop to keep it here."
          action={{ label: "Log in", href: "/login" }}
        />
      ) : videos === null ? (
        <FullSpinner label="Loading saved Zines…" />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-7 w-7" />}
          title="Nothing saved yet"
          description="Tap the bookmark on any Zine and it'll show up here for easy rewatching."
          action={{ label: "Explore the feed", href: "/feed" }}
        />
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
