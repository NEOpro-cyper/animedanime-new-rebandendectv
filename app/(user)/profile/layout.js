import { buildMetadata } from "@/lib/seo";

// ─── SEO: profile (private page) ───
export const metadata = buildMetadata({
  title: "My Profile",
  description: "Manage your YourHentaiTV profile, stats and watch history.",
  path: "/profile",
  noindex: true,
});

export default function ProfileLayout({ children }) {
  return children;
}
