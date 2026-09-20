# YourHentaiTV — Light Frontend (Next.js 16)

YourHentaiTV is a light, SEO-ready streaming frontend for hentai content.
All catalog/streaming data is fetched live from **AnimeIDHentai** through
a separate **YourHentaiTV Data API** (see the `api` project) that you host
yourself — this app stores nothing but user accounts, comments and watch
progress.

```
┌────────────────────┐        ┌──────────────────────────┐        ┌──────────────────┐
│  Next.js UI        │  ────► │  YourHentaiTV Data API   │  ────► │  animeidhentai   │
│  (this project)    │        │  (separate deployment)   │        │  (scraped)       │
└────────────────────┘        └──────────────────────────┘        └──────────────────┘
```

## Features

- **Full SEO metadata everywhere** — unique `<title>`/meta description per page,
  OpenGraph + Twitter cards, canonical URLs, dynamic watch-page metadata
  (`generateMetadata`) with poster/banner images and episode numbers.
- **Structured data (JSON-LD)** — `WebSite` + `SearchAction` sitewide and
  `VideoObject` on every watch page (Google video rich results).
- **robots.txt + sitemap.xml + web manifest** generated at `/robots.txt`,
  `/sitemap.xml`, `/manifest.webmanifest`.
- Private pages (profile, settings, notifications, admin) are `noindex`.
- Trending / latest / most-viewed / top-rated rails, catalog, discover,
  search, community forum, XP leaderboard, comments and notifications.

## Environment variables

Create a `.env` (see `.env.example`):

```env
# Required — the YourHentaiTV Data API base URL (no trailing slash)
NEXT_PUBLIC_API_URL="https://api.yourhentaitv.com"

# Required for production SEO — your public site URL (no trailing slash).
# Used for canonical URLs, OpenGraph/Twitter cards, sitemap and robots.txt.
NEXT_PUBLIC_SITE_URL="https://yourhentaitv.com"

# Database (SQLite by default)
DATABASE_URL="file:./db/custom.db"

# Auth — CHANGE THESE IN PRODUCTION
JWT_SECRET="change-me"
ADMIN_EMAIL="admin@yourhentaitv.com"
ADMIN_PASSWORD="change-me"
```

> **Important:** `NEXT_PUBLIC_SITE_URL` must point to the real domain you
> deploy to. Every canonical/OG/sitemap URL is built from it; leaving the
> default `https://yourhentaitv.com` on another domain gives search engines
> mismatched signals.

## Getting started

```bash
npm install
npm run db:push        # create the SQLite database
npm run dev            # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

## Deploy order

1. **Deploy the Data API first** — see the `api` project README.
2. Deploy this frontend (Vercel or any Node host) with the env vars above.
3. Point your domain at the frontend and make sure
   `NEXT_PUBLIC_SITE_URL` matches it exactly.
4. Submit `https://yourhentaitv.com/sitemap.xml` in Google Search Console.

## SEO checklist (already wired in)

| Item | Where |
| --- | --- |
| Title template `%s \| YourHentaiTV` | `app/layout.js` |
| Dynamic watch metadata | `app/(movies)/watch/[id]/page.js` |
| Static page metadata | each page / `layout.js` wrapper |
| JSON-LD WebSite + SearchAction | `app/layout.js` |
| JSON-LD VideoObject | watch page |
| Canonical URLs | `lib/seo.js` (`buildMetadata`) |
| robots.txt | `app/robots.js` |
| sitemap.xml (static + dynamic watch URLs) | `app/sitemap.js` |
| PWA manifest + icons | `app/manifest.js`, `app/icon.png` |
| Central config | `lib/seo.js` |

## Disclaimer

YourHentaiTV does not host or store any video files. All content is embedded
from third-party sources (AnimeIDHentai). This project is intended for adults
(18+) in jurisdictions where such content is legal.
