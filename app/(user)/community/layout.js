import { buildMetadata } from "@/lib/seo";

// ─── SEO: community forum ───
export const metadata = buildMetadata({
  title: "Community — Hentai Discussions, Recommendations & Threads",
  description:
    "Join the YourHentaiTV community. Discuss hentai series and episodes, share recommendations, read news and talk with other fans in category threads.",
  path: "/community",
  keywords: [
    "hentai community",
    "hentai discussion",
    "hentai forum",
    "hentai recommendations",
  ],
});

export default function CommunityLayout({ children }) {
  return children;
}
