import { buildMetadata } from "@/lib/seo";

// ─── SEO: continue watching (private page) ───
export const metadata = buildMetadata({
  title: "Continue Watching — Pick Up Where You Left Off",
  description:
    "Resume the hentai episodes you started watching on YourHentaiTV. Your watch progress is saved automatically.",
  path: "/continue-watching",
  noindex: true,
});

export default function ContinueWatchingLayout({ children }) {
  return children;
}
