"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { HiOutlineBars3 } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import Select from "@/components/ui/Select";
import EpisodeCard from "./EpisodeCard";
import { useWatchContext } from "@/context/Watch";
import { useWatchSettingContext } from "@/context/WatchSetting";
import clsx from "clsx";

const EpisodeSelector = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedEP, setWatchedEP] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { watchSetting } = useWatchSettingContext();

  const {
    episode,
    episodes,
    MovieId,
    MovieInfo,
    setSeason,
    season,
    episodeLoading,
    allSeasons,
  } = useWatchContext();

  const storageKey = MovieId && season ? `playing.${MovieId}.season.${season}` : null;

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
      setWatchedEP(stored);
    } catch {
      setWatchedEP([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !episode || typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!stored.includes(episode)) {
      const updated = [...stored, episode];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setWatchedEP(updated);
    } else {
      setWatchedEP(stored);
    }
  }, [storageKey, episode]);

  const handleSearchQueryChange = useCallback((e) => {
    setSearchQuery(e.target.value.toLowerCase());
  }, []);

  // Season dropdown from allSeasons
  const seasonData = useMemo(() => {
    if (!allSeasons?.length) return [];
    return allSeasons.map((s) => s.seasonName || `Season ${s.seasonId}`);
  }, [allSeasons]);

  const selectedSeasonIndex = season - 1;

  const filteredEpisodes = useMemo(() => {
    if (!episodes) return [];
    if (!searchQuery) return episodes;
    return episodes.filter((item) => {
      const epNum = String(item.episode_number);
      const name = item?.name?.toLowerCase() || "";
      return (
        epNum.includes(searchQuery) ||
        name.includes(searchQuery) ||
        `episode ${epNum}`.includes(searchQuery)
      );
    });
  }, [episodes, searchQuery]);

  const mediaType = MovieInfo?.type;
  const isMovie = mediaType === "movie";

  // Count aired vs unaired episodes
  const airedCount = useMemo(() => {
    return episodes?.filter(ep => ep.isAired !== false).length || 0;
  }, [episodes]);
  const totalCount = episodes?.length || 0;

  return (
    <div className={clsx("bg-[#201f28] w-full max-w-[22rem] min-w-[18rem] rounded-md flex flex-col max-[768px]:max-w-full max-[768px]:min-w-0", {
      "max-w-full": watchSetting.isExpanded
    })}>
      {/* TV and Anime — show episode list (including unaired with overlay) */}
      {(mediaType === "tv" || mediaType === "anime" || mediaType === "hentai") && (
        <>
          {/* Mobile toggle for episode list */}
          <div
            className="hidden max-[768px]:flex justify-between items-center px-3 py-2 border-b border-[#514f61a1] cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className="text-slate-200 text-sm font-medium">
              Episodes ({airedCount}/{totalCount} aired)
            </span>
            <span className="text-slate-400 text-lg">
              {isCollapsed ? "▲" : "▼"}
            </span>
          </div>

          <div className={clsx("max-[768px]:overflow-hidden max-[768px]:transition-all max-[768px]:duration-300", {
            "max-[768px]:max-h-0 max-[768px]:opacity-0": isCollapsed,
            "max-[768px]:max-h-[2000px] max-[768px]:opacity-100": !isCollapsed,
          })}>
            <div>
              <div className="flex justify-between px-2 py-3 border-b-2 border-[#514f61a1]">
                <input
                  type="text"
                  placeholder="Search episode..."
                  className="bg-[#2e2b3d] outline-none h-10 w-full px-2 text-slate-200 max-w-[13rem] rounded-md"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                />
                <div className="bg-[#2e2b3d] text-white w-10 rounded-lg flex items-center justify-center text-2xl">
                  <HiOutlineBars3 />
                </div>
              </div>

              <div className="flex justify-between px-2 py-3 gap-4">
                {mediaType === "tv" && seasonData.length > 0 && (
                  <Select
                    data={seasonData}
                    selectedIndex={selectedSeasonIndex}
                    setSelected={(val) => {
                      const newSeason = val.id + 1;
                      if (newSeason !== season) setSeason(newSeason);
                    }}
                  />
                )}
                {mediaType === "anime" && allSeasons?.length > 0 && (
                  <Select
                    data={allSeasons.map((s) => s.seasonName || `Season ${s.seasonId}`)}
                    selectedIndex={0}
                    setSelected={() => {}}
                  />
                )}
              </div>
            </div>

            <div className="px-2 overflow-y-scroll h-full max-h-[44rem] max-[768px]:max-h-[20rem]">
              <AnimatePresence>
                {!episodeLoading ? (
                  <motion.div
                    key={`${season}-${searchQuery}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {filteredEpisodes.map((item) => (
                      <EpisodeCard
                        key={item.episodeId || item.episode_number}
                        info={item}
                        currentEp={episode}
                        currentSn={season}
                        watchedEP={watchedEP}
                        isMovie={isMovie}
                        mediaType={mediaType}
                      />
                    ))}
                  </motion.div>
                ) : (
                  Array.from({ length: 7 }).map((_, index) => (
                    <EpisodeCard key={index} loading />
                  ))
                )}
              </AnimatePresence>

              {!episodeLoading && filteredEpisodes.length === 0 && (
                <p className="text-[#d5d5d7] text-center my-5">No episodes found</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* For movies, show a thumbnail card instead of a plain text panel */}
      {isMovie && (
        <div className="p-3 text-slate-300 text-sm">
          <div className="flex gap-3 py-2 px-2 border-2 border-[#21232e] rounded-md bg-[#333345]">
            <div className="w-full max-w-[150px] relative shrink-0">
              <img
                alt={MovieInfo?.title || "Movie"}
                width={150}
                height={100}
                className="object-cover w-full h-[82px] rounded-md"
                src={MovieInfo?.banner || MovieInfo?.poster || ""}
              />
            </div>
            <div className="w-full pr-1 flex flex-col justify-center">
              <div className="text-slate-200 line-clamp-2 text-sm">
                {MovieInfo?.title}
              </div>
              <div className="text-[#ffffffa3] text-[14px]">Movie</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodeSelector;
