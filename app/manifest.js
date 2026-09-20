import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

// ─── PWA web app manifest (served at /manifest.webmanifest) ───
export default function manifest() {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#12111a",
    theme_color: "#12111a",
    orientation: "any",
    categories: ["entertainment", "video"],
    icons: [
      {
        src: "/images/logo.png",
        sizes: "400x400",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo-2.png",
        sizes: "400x400",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
