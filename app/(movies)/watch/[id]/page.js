import EpisodeSelector from "@/content/watch/EpisodeSelector/EpisodeSelector"
import MainVideo from "@/content/watch/MainVideo/MainVideo"
import './watch.css'
import MovieInfos from "@/content/watch/MovieInfo/MovieInfo"
import { WatchAreaContextProvider } from "@/context/Watch"
import { WatchSettingContextProvider } from "@/context/WatchSetting"
import { Fragment } from "react"
import MovieComments from "@/components/Comments/MovieComments"
import Recommendation from "@/content/watch/Recommendation/Recommendation"
import MovieNotFound from "@/components/errors/MovieNotFound"
import { getHentaiSeries, getHentaiEpisode } from "@/lib/HentaiFunctions"
import { buildMetadata, clampText, absoluteUrl, SITE_NAME } from "@/lib/seo"

// ─── SEO: dynamic metadata for every watchable series/episode ───
// Resolves the title/description/poster for this slug and builds full
// OpenGraph + Twitter + canonical metadata. Next.js dedupes the fetch,
// so this does not double-request the data API.
export async function generateMetadata({ params }) {
  const { id: MovieId } = await params;

  let info = null;
  let episodeInfo = null;
  try {
    info = await getHentaiSeries(MovieId);
    if (!info) {
      const ep = await getHentaiEpisode(MovieId);
      if (ep?.episode?.id) {
        episodeInfo = ep?.episode || null;
        info = await getHentaiSeries(ep.episode.id);
      }
    }
  } catch (e) {
    console.error("[watch metadata]", e.message);
  }

  if (!info) {
    return buildMetadata({
      title: "Watch Hentai Online",
      description: `Watch hentai episodes online free in HD on ${SITE_NAME}.`,
      path: `/watch/${MovieId}`,
      noindex: true,
    });
  }

  const epSuffix = episodeInfo?.number
    ? ` Episode ${episodeInfo.number}`
    : "";
  const title = `${info.title || "Hentai Series"}${epSuffix} — Watch Online Free`;

  const genreKeywords = (info.genres || []).map((g) =>
    typeof g === "string" ? `${String(g).toLowerCase()} hentai` : `${g?.name || ""} hentai`.trim()
  );

  const description =
    (info.description && clampText(info.description, 300)) ||
    `Watch ${info.title || "this hentai series"} online free in HD on ${SITE_NAME}. ${
      (info.genres || []).length
        ? `${(info.genres || [])
            .map((g) => (typeof g === "string" ? g : g?.name))
            .filter(Boolean)
            .slice(0, 4)
            .join(", ")} hentai. `
        : ""
    }Streaming all episodes${info.episodes?.length ? ` (${info.episodes.length} episodes)` : ""}${
      info.censored === false ? ", uncensored" : info.censored === true ? ", censored" : ""
    }.`;

  const ogImage = info.banner || info.poster || undefined;

  return buildMetadata({
    title,
    description,
    path: `/watch/${MovieId}`,
    image: ogImage,
    type: "video.other",
    keywords: [
      ...(info.title ? [String(info.title).toLowerCase()] : []),
      ...(episodeInfo?.number ? [`${String(info.title).toLowerCase()} episode ${episodeInfo.number}`] : []),
      ...genreKeywords,
    ],
    publishedTime: info.released || (info.year ? `${info.year}-01-01` : undefined),
  });
}

const Watch = async ({ params, searchParams }) => {
  const { id: MovieId } = await params;

  // All watchable content comes from AnimeIDHentai —
  // MovieId is the series slug (or an episode slug)
  let MovieInfo = null;

  try {
    MovieInfo = await getHentaiSeries(MovieId);
    if (!MovieInfo) {
      // Maybe an episode slug was passed — resolve its series
      const ep = await getHentaiEpisode(MovieId);
      if (ep?.episode?.id) {
        MovieInfo = await getHentaiSeries(ep.episode.id);
      }
    }
  } catch (e) {
    console.error(e);
  }

  if (!MovieInfo) {
    return <MovieNotFound />;
  }

  // Structured data for search engines (Google video rich results)
  const videoJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: MovieInfo.title || "Hentai",
    description: clampText(
      MovieInfo.description || `Watch ${MovieInfo.title} online free on ${SITE_NAME}.`,
      300
    ),
    thumbnailUrl: [absoluteUrl(MovieInfo.banner || MovieInfo.poster || "/images/banner.jpg")],
    uploadDate: MovieInfo.released || (MovieInfo.year ? `${MovieInfo.year}-01-01` : undefined),
    genre: (MovieInfo.genres || [])
      .map((g) => (typeof g === "string" ? g : g?.name))
      .filter(Boolean)
      .slice(0, 8),
    url: absoluteUrl(`/watch/${MovieId}`),
    ...(MovieInfo.views ? { interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: MovieInfo.views,
    } } : {}),
  });

  // Related recommendations: scrape the first episode page
  // (the site renders a related-videos rail there)
  let recommendations = MovieInfo.recommendations || MovieInfo.related || [];
  if (!recommendations.length && MovieInfo.episodes?.length) {
    try {
      const epData = await getHentaiEpisode(MovieInfo.episodes[0].slug);
      recommendations = epData?.related || [];
    } catch (e) {
      console.error(e);
    }
  }

  // Check if content is released (hentai data uses "Released" / "Upcoming" statuses)
  const isReleased = (() => {
    if (!MovieInfo) return true;
    if (MovieInfo.status === "Upcoming") return false;
    if (MovieInfo.status === "Released") return true;
    if (MovieInfo.released || MovieInfo.year) {
      const dateStr = MovieInfo.released || `${MovieInfo.year}-01-01`;
      const releaseDate = new Date(dateStr);
      if (!isNaN(releaseDate.getTime())) return releaseDate <= new Date();
    }
    return true;
  })();

  if (!isReleased) {
    return (
      <Fragment>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: videoJsonLd }}
        />
        <div className="w-full flex flex-col items-center z-10 relative main-responsive top-[106px]">
          <div className="w-full max-w-[96rem]">
            <div className="aspect-video bg-[#1a1a24] rounded-md flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-3xl font-bold text-white mb-3">{MovieInfo.title}</h1>
              <p className="text-[#e26bbd] text-lg mb-2">Coming Soon</p>
              <p className="text-slate-400 text-sm max-w-md">
                This {MovieInfo.type === "tv" ? "series" : "release"} has not been released yet.
                {MovieInfo.released || MovieInfo.year ? ` Expected: ${MovieInfo.released || MovieInfo.year}` : ""}
              </p>
            </div>
            <div className="mt-20 flex gap-44">
              <MovieInfos info={MovieInfo} />
            </div>
            <div className="flex mb-5 gap-5 max-[1125px]:flex-col mt-24">
              <Recommendation MovieId={MovieId} type={MovieInfo?.type} items={recommendations} />
            </div>
          </div>
        </div>
        <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]"></div>
        <div className="absolute max-[737px]:fixed w-[500px] h-[370.13px] right-[50%] bottom-[-25%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-b-[30%]"></div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: videoJsonLd }}
      />
      <div className="w-full flex flex-col items-center z-10 relative main-responsive top-[106px]">
        <div className="w-full max-w-[96rem]">
         <WatchSettingContextProvider>
            <WatchAreaContextProvider MovieInfo={MovieInfo} MovieId={MovieId}>
              <EpisodeSelector />
              <MainVideo />
            </WatchAreaContextProvider>
          </WatchSettingContextProvider>
          <div className="mt-20 flex gap-44">
            <MovieInfos info={MovieInfo} />
          </div>
          <div className="flex mb-5 gap-5 max-[1125px]:flex-col mt-24">
            <div className="flex-1 flex flex-col gap-5">
              <MovieComments movieId={MovieId} movieTitle={MovieInfo?.title} />
            </div>
            <Recommendation MovieId={MovieId} type={MovieInfo?.type} items={recommendations} />
          </div>
        </div>
      </div>
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]"></div>
      <div className="absolute max-[737px]:fixed w-[500px] h-[370.13px] right-[50%] bottom-[-25%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-b-[30%]"></div>
    </Fragment>
  );
};

export default Watch;
