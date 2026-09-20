import { buildMetadata } from "@/lib/seo";

// ─── SEO: most viewed series ───
export const metadata = buildMetadata({
  title: "Most Viewed Hentai — Trending Series & Episodes",
  description:
    "The most-watched hentai series and episodes of all time on YourHentaiTV. See what everyone is streaming, from trending hits to all-time favorites — free in HD.",
  path: "/tv-series",
  keywords: [
    "most viewed hentai",
    "watched hentai",
    "hentai trending",
    "popular hentai series",
  ],
});

export default function TVSeriesLayout({ children }) {
  return children;
}
