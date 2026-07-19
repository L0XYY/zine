// Share-link helpers. A Zine has its own permalink (/z/[id]) so shares open the
// specific loop rather than the generic feed.

export function videoShareUrl(videoId: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://zine.video";
  return `${base}/z/${videoId}`;
}
