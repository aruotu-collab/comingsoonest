/**
 * Optional curated YouTube URLs keyed by launch slug.
 * Use when the catalogue row has no Video URL yet.
 * Example: "jordan-air-jordan-1-low-og-laser": "https://www.youtube.com/watch?v=..."
 */
const launchVideos: Record<string, string> = {
  // Add curated embeds here as you find official / review clips.
};

export function videoUrlForSlug(slug: string): string | undefined {
  return launchVideos[slug];
}
