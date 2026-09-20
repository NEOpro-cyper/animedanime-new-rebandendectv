import { buildMetadata } from "@/lib/seo";

// ─── SEO: anime (top rated) ───
export const metadata = buildMetadata({
  title: "Top Rated Hentai — Best Hentai Series & Episodes",
  description:
    "Watch the highest-rated hentai series and episodes on YourHentaiTV. Browse community-favorite titles, trending picks, most viewed and the latest releases — all free in HD.",
  path: "/anime",
  keywords: [
    "top rated hentai",
    "best hentai series",
    "hentai rankings",
    "popular hentai",
  ],
});

export default function AnimeLayout({ children }) {
  return children;
}
