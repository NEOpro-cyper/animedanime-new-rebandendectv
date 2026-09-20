import { buildMetadata } from "@/lib/seo";

// ─── SEO: XP leaderboard ───
export const metadata = buildMetadata({
  title: "Leaderboard — Top YourHentaiTV Users by XP",
  description:
    "See the top YourHentaiTV community members ranked by XP. Watch episodes, post comments and create threads to climb the leaderboard.",
  path: "/leaderboard",
  keywords: ["yourhentaitv leaderboard", "top users", "xp ranking"],
});

export default function LeaderboardLayout({ children }) {
  return children;
}
