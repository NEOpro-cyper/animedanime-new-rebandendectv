import { absoluteUrl } from "@/lib/seo";

// ─── robots.txt (served at /robots.txt) ───
// Public catalog/watch pages are crawlable. Private account pages,
// the admin panel and internal APIs are disallowed.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/settings",
          "/profile",
          "/notifications",
          "/continue-watching",
          "/search",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
