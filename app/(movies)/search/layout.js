import { buildMetadata } from "@/lib/seo";

// ─── SEO: search results (noindex — internal search pages) ───
export const metadata = buildMetadata({
  title: "Search Hentai Series & Episodes",
  description:
    "Search thousands of hentai series and episodes on YourHentaiTV. Find censored and uncensored titles by name and stream them free in HD.",
  path: "/search",
  noindex: true,
});

export default function SearchLayout({ children }) {
  return children;
}
