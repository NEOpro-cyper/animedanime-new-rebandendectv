import { useCallback, useEffect, useMemo, useState } from "react";
import { useWatchContext } from "@/context/Watch";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLock } from "react-icons/fa";

const EpisodeCard = ({ info, currentEp, loading, watchedEP, currentSn, isMovie, mediaType }) => {
  const { season } = useWatchContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const episodeNumber = info?.episode_number;
  const seasonNumber = info?.season_number;
  const isAired = info?.isAired !== false; // Default to true if not specified
  const airDate = info?.air_date || "";

  const updateParamsInUrl = useCallback(
    (seasonNumber, episodeNumber) => {
      const updatedParams = new URLSearchParams(searchParams.toString());
      if (seasonNumber) updatedParams.set("se", seasonNumber);
      else updatedParams.delete("se");
      if (episodeNumber) updatedParams.set("ep", episodeNumber);
      else updatedParams.delete("ep");
      router.push(
        `${window.location.pathname}?${updatedParams.toString()}`,
        { scroll: false }
      );
    },
    [router, searchParams]
  );

  const handleClick = useCallback(() => {
    if (isMovie) return; // Movies don't navigate episodes
    if (!isAired) return; // Unaired episodes are not clickable
    if (!episodeNumber || !seasonNumber) return;
    updateParamsInUrl(seasonNumber, episodeNumber);
  }, [episodeNumber, seasonNumber, updateParamsInUrl, isMovie, isAired]);

  const isCurrentEpisode = useMemo(
    () => currentEp === episodeNumber && currentSn === seasonNumber,
    [currentEp, episodeNumber, currentSn, seasonNumber]
  );

  const isWatched = useMemo(
    () => watchedEP?.includes(episodeNumber),
    [watchedEP, episodeNumber]
  );

  if (loading) {
    return (
      <div className="flex py-2 h-[96px] my-[3px] border-2 border-[#21232e] rounded-md bg-[#242430] cursor-pointer group relative">
        <div className="absolute bottom-1/2 translate-y-1/2 flex gap-3 w-full">
          <div className="h-[80px] min-w-[150px] bg-[#48455f] rounded-md"></div>
          <div className="w-full flex flex-col gap-3">
            <div className="h-4 w-full bg-[#48465e] rounded-sm"></div>
            <div className="h-6 w-full bg-[#48465e] rounded-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  // For movies: show "Full Movie" label
  const subtitle = isMovie
    ? "Full Movie"
    : mediaType === "hentai"
    ? `Episode ${episodeNumber}${info?.duration ? " · " + info.duration : ""}`
    : `Season ${seasonNumber} · Episode ${episodeNumber}`;

  // Format air date for display
  const formattedAirDate = airDate && !isAired
    ? new Date(airDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  // Unaired episode — show with overlay
  if (!isAired && !isMovie) {
    return (
      <div
        className="flex gap-3 py-2 px-2 border-2 border-[#21232e] rounded-md my-[3px] bg-[#1a1a24] relative overflow-hidden cursor-not-allowed opacity-70"
      >
        {/* Diagonal stripe overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 16px)",
          }}
        />

        {/* Lock icon badge */}
        <div className="flex items-center justify-center min-w-[36px] h-[36px] rounded-md bg-[#2a2a3a] text-slate-500 shrink-0 relative z-10">
          <FaLock className="text-xs" />
        </div>

        <div className="w-full relative z-10">
          <div className="text-slate-500 line-clamp-2 text-sm">
            Ep {episodeNumber}: {info?.name || info?.title || "TBA"}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] px-1.5 py-[1px] rounded bg-[#3a2a1a] text-[#f0a030] font-medium">
              Not Aired
            </span>
            {formattedAirDate && (
              <span className="text-[#ffffff50] text-[12px]">
                {formattedAirDate}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Aired episode — normal clickable card
  return (
    <div
      className={clsx(
        "flex gap-3 py-2 px-2 border-2 border-[#21232e] rounded-md cursor-pointer my-[3px]",
        {
          "bg-[#333345]": isCurrentEpisode,
          "bg-[#1f1f28]": !isCurrentEpisode && !isWatched,
          "bg-[#2a2a38] hover:bg-[#1c1c26]": isWatched && !isCurrentEpisode,
          "hover:bg-[#242430]": !isCurrentEpisode && !isMovie,
          "cursor-pointer": !isMovie,
          "cursor-default": isMovie,
        }
      )}
      onClick={handleClick}
    >
      <div className="w-full">
        <div className="text-slate-200 line-clamp-2 text-sm">
          {info?.name || info?.title || "No title available"}
        </div>
        <div className="text-[#ffffffa3] text-[14px]">
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;
