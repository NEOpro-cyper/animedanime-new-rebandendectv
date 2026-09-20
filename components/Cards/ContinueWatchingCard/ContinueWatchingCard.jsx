"use client";
import Image from "next/image";
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";

const ContinueWatchingCard = ({ data, hidden }) => {
  if (hidden) {
    return <div className=""></div>;
  }

  const poster =
    data?.moviePoster || data?.poster || data?.thumbnail || "/images/logo.png";
  const progress =
    data?.progress && data?.duration
      ? Math.round((data.progress / data.duration) * 100)
      : 0;
  const title = data?.movieTitle || data?.title || "Untitled";
  const type = data?.movieType || data?.media_type || data?.type || "movie";
  // DB entries carry both a record `id` and the content `movieId`;
  // localStorage entries only have `id`. Prefer the content identifier.
  const contentId = data?.movieId || data?.id;

  // Only show season/episode for episodic content (TV / anime / hentai).
  // Movies always have season=1 & episode=1 saved by ProgressHandler,
  // which is meaningless to display.
  const isEpisodic = type === "tv" || type === "anime" || type === "hentai";
  const episodeLabel = isEpisodic && data?.episode ? `Episode ${data.episode}` : "";
  const seasonLabel = isEpisodic && data?.season ? `Season ${data.season}` : "";
  const typeLabel = type === "tv" ? "TV Series" : type === "anime" ? "Anime" : type === "hentai" ? "Hentai" : "Movie";
  const metaLabel = [seasonLabel, episodeLabel].filter(Boolean).join(" • ") || typeLabel;

  return (
    <Link
      className="w-full cursor-pointer rounded-xl relative overflow-hidden border border-[#2c2b3d] bg-[#1c1b27] hover:bg-[#22212e] hover:border-[#3a3850] transition-all duration-200 group flex"
      href={`/watch/${contentId}?media_type=${
        data?.movieType || data?.media_type || "movie"
      }&se=${data?.season || 1}&ep=${data?.episode || 1}`}
    >
      {/* Poster — keeps 2:3 ratio like other cards, NOT cropped to rectangle */}
      <div className="relative w-[110px] sm:w-[120px] flex-shrink-0 aspect-[2/3] overflow-hidden bg-[#22212c]">
        <Image
          src={poster}
          alt={title}
          fill
          sizes="120px"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "/images/logo.png";
          }}
        />
        {/* Play button overlay on poster */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
          <div className="p-3 rounded-full bg-[#4a446c] text-white shadow-lg">
            <FaPlay className="text-sm ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info panel — right side */}
      <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-medium text-sm sm:text-base font-['poppins'] line-clamp-2 text-ellipsis overflow-hidden break-words">
            {title}
          </h3>
          {metaLabel ? (
            <p className="text-[#ffffff8a] text-xs font-['poppins'] mt-1 line-clamp-1">
              {metaLabel}
            </p>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#ffffff60] text-[10px] font-['poppins']">
              {progress > 0 ? `${progress}% watched` : "Not started"}
            </span>
          </div>
          <div className="w-full bg-[#404141] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#dd8dae] to-[#e26bbd] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContinueWatchingCard;
