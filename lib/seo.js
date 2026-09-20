// ─── lib/seo.js ───
// Central SEO configuration for YourHentaiTV.
//
// Set NEXT_PUBLIC_SITE_URL in your .env file to your production domain, e.g.:
//   NEXT_PUBLIC_SITE_URL="https://yourhentaitv.com"
// When it is not set, a sensible default is used so metadata never breaks.

export const SITE_NAME = "YourHentaiTV";
export const SITE_SHORT_NAME = "YourHentaiTV";
export const SITE_TAGLINE = "Watch Hentai Online Free in HD";

export const SITE_DESCRIPTION =
  "YourHentaiTV — Watch the latest hentai episodes online free in HD. Stream uncensored and censored hentai series, new releases, trending titles and full episodes with English subs, no signup required.";

export const SITE_KEYWORDS = [
  "yourhentaitv",
  "your hentai tv",
  "watch hentai online",
  "hentai stream",
  "free hentai",
  "hentai online",
  "uncensored hentai",
  "censored hentai",
  "hentai episodes",
  "new hentai",
  "hentai series",
  "hd hentai",
  "anime hentai",
  "hentai videos",
  "latest hentai releases",
];

// Canonical production URL (trailing slash safe).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://yourhentaitv.com"
)
  .replace(/\/+$/, "")
  .replace(/\/$/, "");

// Fallback social sharing images + branding assets.
export const DEFAULT_OG_IMAGE = "/images/banner.jpg";
export const SITE_LOGO = "/images/logo.png";
export const THEME_COLOR = "#12111a";

/**
 * Turn a root-relative path ("/watch/mako") into an absolute URL
 * ("https://yourhentaitv.com/watch/mako").
 */
export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Clamp a string to N characters on a word boundary (meta description helper). */
export const clampText = (text, max = 300) => {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max - 1)}…`;
};

/**
 * Build a complete Next.js Metadata object for any page.
 * The root layout provides the `%s | YourHentaiTV` title template.
 *
 * @param {object} opts
 * @param {string}  opts.title        Page title (template applied automatically)
 * @param {string}  opts.description  Meta description
 * @param {string}  opts.path         Canonical path, e.g. "/catalog"
 * @param {string}  [opts.image]      Root-relative or absolute OG image
 * @param {string}  [opts.type]       OpenGraph type ("website" | "video.other" | ...)
 * @param {string[]} [opts.keywords]  Extra keywords for this page
 * @param {boolean} [opts.noindex]    true → exclude page from search indexes
 * @param {string}  [opts.publishedTime] ISO date for OG article/video
 * @returns {object} Next.js metadata object
 */
export const buildMetadata = ({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  keywords = [],
  noindex = false,
  publishedTime,
  videos = [],
} = {}) => {
  const url = absoluteUrl(path);
  const ogImage = image?.startsWith("http") ? image : absoluteUrl(image || DEFAULT_OG_IMAGE);

  // Avoid "... | YourHentaiTV | YourHentaiTV" duplication when the page
  // title already contains the brand (e.g. the homepage).
  const socialTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} — ${SITE_TAGLINE}`;

  const metadata = {
    title,
    description: description ? clampText(description, 300) : undefined,
    keywords: keywords?.length ? [...new Set([...keywords, ...SITE_KEYWORDS])] : SITE_KEYWORDS,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description: description ? clampText(description, 300) : SITE_DESCRIPTION,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
      ...(publishedTime ? { releaseDate: publishedTime } : {}),
      ...(videos?.length ? { videos: videos.slice(0, 1).map((v) => ({ url: v })) } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: description ? clampText(description, 200) : undefined,
      images: [ogImage],
    },
  };

  if (noindex) {
    metadata.robots = {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    };
  } else {
    metadata.robots = {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    };
  }

  return metadata;
};

/** JSON-LD: WebSite + SearchAction (rendered once in the root layout). */
export const websiteJsonLd = () =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
