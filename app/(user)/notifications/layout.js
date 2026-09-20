import { buildMetadata } from "@/lib/seo";

// ─── SEO: notifications (private page) ───
export const metadata = buildMetadata({
  title: "Notifications",
  description: "Your personal notifications on YourHentaiTV.",
  path: "/notifications",
  noindex: true,
});

export default function NotificationsLayout({ children }) {
  return children;
}
