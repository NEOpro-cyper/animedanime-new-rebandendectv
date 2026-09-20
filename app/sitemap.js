import { absoluteUrl } from "@/lib/seo";
import { getTrendingHentai, getLatestHentai } from "@/lib/HentaiFunctions";

// Re-generate at most hourly, so watch-page URLs refresh once the
// data API is reachable in production.
export const revalidate = 3600;

// ─── sitemap.xml (served at /sitemap.xml) ───
// Static browse routes + the hottest watch pages from the data API.
// API failures degrade gracefully to the static routes only.
export default async function sitemap() {
  const lastModified = new Date();

  // Static browse routes
  const staticEntries = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/catalog", priority: 0.9, changeFrequency: "daily" },
    { path: "/movies", priority: 0.9, changeFrequency: "daily" },
    { path: "/anime", priority: 0.8, changeFrequency: "daily" },
    { path: "/tv-series", priority: 0.8, changeFrequency: "daily" },
    { path: "/discover", priority: 0.8, changeFrequency: "weekly" },
    { path: "/community", priority: 0.6, changeFrequency: "hourly" },
    { path: "/leaderboard", priority: 0.4, changeFrequency: "daily" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));

  // Dynamic watch-page URLs (trending + latest, best effort)
  const watchEntries = [];
  try {
    const [trending, latest] = await Promise.all([
      getTrendingHentai(1),
      getLatestHentai(1),
    ]);

    const seen = new Set();
    for (const source of [trending, latest]) {
      for (const item of source?.results || []) {
        const slug = item?.slug || item?.id;
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        watchEntries.push({
          url: absoluteUrl(`/watch/${slug}`),
          lastModified: item?.released ? new Date(item.released) : lastModified,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (e) {
    console.error("[sitemap] dynamic watch entries skipped:", e.message);
  }

  return [...staticEntries, ...watchEntries.slice(0, 60)];
}
