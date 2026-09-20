import { buildMetadata } from "@/lib/seo";

// ─── SEO: admin panel (never indexed) ───
export const metadata = buildMetadata({
  title: "Admin Panel",
  description: "YourHentaiTV administration panel.",
  path: "/admin",
  noindex: true,
});

export default function AdminLayout({ children }) {
  return children;
}
