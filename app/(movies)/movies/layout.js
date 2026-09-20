import { buildMetadata } from "@/lib/seo";

// ─── SEO: new releases ───
export const metadata = buildMetadata({
  title: "New Hentai Releases — Latest Episodes Updated Daily",
  description:
    "Watch the newest hentai episodes on YourHentaiTV. Fresh releases updated daily, plus trending, most viewed and top rated series — stream free in HD with no signup.",
  path: "/movies",
  keywords: [
    "new hentai",
    "latest hentai episodes",
    "hentai releases",
    "new hentai series 2025",
  ],
});

export default function MoviesLayout({ children }) {
  return children;
}
