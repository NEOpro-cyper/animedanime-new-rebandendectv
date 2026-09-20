// ─── HentaiFunctions.js ───
// Data layer for AnimeIDHentai content, backed by the REMOTE YourHentaiTV Data API.
//
// All heavy work (scraping animeidhentai.com + flight decoding + caching) runs
// on a separate API VPS. The site only needs its URL:
//
//   NEXT_PUBLIC_API_URL="https://api.yourhentaitv.com"   (.env)
//
// Browser components call the API directly (that's what distributes the load),
// server components use the same URL with Next.js revalidation caching.

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  ""
).replace(/\/+$/, "");

// Abort data-API calls after this many ms so an unreachable/slow API can
// never hang server rendering, the sitemap, or a static build.
const API_TIMEOUT_MS = 10000;

const apiGet = async (params, revalidate = 300) => {
  // Guard: without an API base the fetch URL would be relative, which hangs
  // or throws inside Next.js static generation. Fail fast instead.
  if (!API_BASE) return { results: [], total_pages: 1 };
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/hentai?${qs}`, {
      // `next.revalidate` caches on the server side; plain browser fetch ignores it
      next: { revalidate },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return { results: [], total_pages: 1 };
    const data = await res.json();
    if (data && data.error) return { results: [], total_pages: 1 };
    return data;
  } catch (err) {
    console.error("[HentaiFunctions]", err.message);
    return { results: [], total_pages: 1 };
  }
};

// ─── Home (single composite call) ───

export const getHomeData = async () => apiGet({ action: "home" }, 900);

// ─── Catalog lists ───

export const getTrendingHentai = async (page = 1) =>
  apiGet({ action: "trending", page }, 900);

export const getLatestHentai = async (page = 1) =>
  apiGet({ action: "latest", page }, 900);

export const getMostViewedHentai = async (page = 1) =>
  apiGet({ action: "viewed", page }, 900);

export const getTopRatedHentai = async (page = 1) =>
  apiGet({ action: "rated", page }, 900);

export const getUpcomingHentai = async () =>
  apiGet({ action: "upcoming" }, 900);

export const getHentaiByGenre = async (genre, page = 1) =>
  apiGet({ action: "genre", genre, page }, 900);

export const getHentaiGenres = async () =>
  apiGet({ action: "genres" }, 86400);

/**
 * Generic browse with filters.
 * @param {object} opts { page, sort: "Most Recent"|"Most Viewed"|"Top Rated", genres: [] }
 */
export const browseHentai = async (opts = {}) => {
  if (!API_BASE) return { results: [], total_pages: 1 };
  const genres = opts.genres || [];
  const qs = new URLSearchParams({ action: "browse", page: String(opts.page || 1), sort: opts.sort || "Most Recent" });
  for (const g of genres) qs.append("genre", g);
  try {
    const res = await fetch(`${API_BASE}/api/hentai?${qs.toString()}`, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return { results: [], total_pages: 1 };
    return await res.json();
  } catch (err) {
    console.error("[HentaiFunctions] browse", err.message);
    return { results: [], total_pages: 1 };
  }
};

// ─── Search ───

export const searchHentai = async (q, limit = 40) => {
  if (!q || !q.trim()) return { results: [] };
  return apiGet({ action: "search", q, limit }, 300);
};

// ─── Series / episodes (used by the watch page + watch context) ───

export const getHentaiSeries = async (slug) => {
  const data = await apiGet({ action: "series", slug }, 300);
  return data && data.id ? data : null;
};

export const getHentaiEpisode = async (slug) => {
  const data = await apiGet({ action: "episode", slug }, 300);
  return data && data.episode ? data : null;
};

/**
 * Episodes for the Watch context.
 */
export const getHentaiEpisodes = async (seriesSlug) => {
  const series = await getHentaiSeries(seriesSlug);
  if (!series) return { episodes: [], seasons: [] };
  return {
    episodes: series.episodes || [],
    seasons: series.seasons || [{ seasonId: 1, seasonName: "Episodes", episodeCount: series.episodeCount }],
  };
};

/**
 * Stream resolver.
 * For hentai content the stream is the nhplayer embed iframe URL of the
 * requested episode.
 */
export const getHentaiStream = async (seriesSlug, episodeNumber = 1) => {
  const series = await getHentaiSeries(seriesSlug);
  if (!series) return null;
  const ep = (series.episodes || []).find((e) => Number(e.episode_number) === Number(episodeNumber));
  if (!ep || !ep.embedUrl) return null;
  return {
    streamingLink: {
      link: { file: ep.embedUrl },
      tracks: [],
    },
    isIframe: true,
  };
};

/**
 * Servers list — a single nhplayer server per episode.
 */
export const getHentaiServers = async () => {
  return [{ serverName: "NH Player", dataId: "hentai", type: "hentai" }];
};
