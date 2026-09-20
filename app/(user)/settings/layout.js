import { buildMetadata } from "@/lib/seo";

// ─── SEO: settings (private page) ───
export const metadata = buildMetadata({
  title: "Settings",
  description: "Manage your YourHentaiTV account settings, notifications and theme.",
  path: "/settings",
  noindex: true,
});

export default function SettingsLayout({ children }) {
  return children;
}
