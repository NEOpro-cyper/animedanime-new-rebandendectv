"use client";

import { useWatchContext } from "@/context/Watch";
import EpInfo from "./EpInfo";
import Option from "./Option"
import Server from "./Server";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { useWatchSettingContext } from "@/context/WatchSetting";
import { AnimatePresence, motion } from "framer-motion"
import JWPlayer from "@/components/HSLplayer";
import { useEffect, useState, useMemo } from "react";
import { FaLock } from "react-icons/fa6";

const MainVideo = () => {
  const { MovieInfo, watchInfo, episode, season, episodes, isReleased } = useWatchContext();
  const { watchSetting, setWatchSetting } = useWatchSettingContext();
  const { userInfo, isUserLoggedIn } = useUserInfoContext();
  const [isMovieExists, setIsMovieExists] = useState(false);
  const mediaType = MovieInfo?.type;

  // Check if current episode is aired
  const isCurrentEpAired = useMemo(() => {
    if (!isReleased) return false;
    if (mediaType === "movie") return true;
    if (!episodes?.length) return true;
    const currentEp = episodes.find(e => e.episode_number === episode && e.season_number === season);
    if (!currentEp) return true;
    return currentEp.isAired !== false;
  }, [episodes, episode, season, isReleased, mediaType]);

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!isUserLoggedIn || !MovieInfo?.id) return;

      try {
        const res = await fetch('/api/watchlist');
        const data = await res.json();
        const isInList = data.watchlist?.some(item => item.movieId === MovieInfo.id);
        setIsMovieExists(isInList);
      } catch (error) {
        console.error('Error checking watchlist:', error);
      }
    };

    checkWatchlist();
  }, [isUserLoggedIn, MovieInfo?.id]);

  return (
    <div className="w-full bg-[#22212c] rounded-md p-2 !pb-0 flex flex-col min-w-0">

      {!isReleased ? (
        // Entire show/movie not yet released
        <div className="aspect-video w-full bg-[#1a1a24] rounded-md flex flex-col items-center justify-center text-slate-300 gap-3">
          <FaLock className="text-4xl text-slate-500" />
          <p className="text-lg font-medium">Not Yet Released</p>
          <p className="text-sm text-slate-400 text-center px-4">This content has not been released yet. Check back later!</p>
        </div>
      ) : !isCurrentEpAired ? (
        // Show exists but this specific episode hasn't aired yet
        <div className="aspect-video w-full bg-[#1a1a24] rounded-md flex flex-col items-center justify-center text-slate-300 gap-3">
          <FaLock className="text-4xl text-amber-500" />
          <p className="text-lg font-medium">Episode Not Yet Aired</p>
          <p className="text-sm text-slate-400 text-center px-4">
            Season {season} · Episode {episode} has not aired yet. Check the episode list for aired episodes!
          </p>
        </div>
      ) : watchInfo?.loading ? (
        <div className="aspect-video bg-[#1a1a24] flex items-center justify-center text-slate-400 text-sm">
          Loading stream...
        </div>
      ) : watchInfo?.iframe && watchInfo?.url ? (
        <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
          <iframe
            src={watchInfo.url}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            title={MovieInfo?.title || "Video Player"}
          />
        </div>
      ) : watchInfo?.url && !watchInfo?.iframe ? (
        <JWPlayer
          src={watchInfo.url}
          tracks={watchInfo.tracks || []}
          title={MovieInfo?.title || ""}
        />
      ) : (
        <div className="aspect-video bg-[#1a1a24] flex items-center justify-center text-slate-400 text-sm">
          No stream available. Try another server.
        </div>
      )}

      <Option isMovieExists={isMovieExists} isReleased={isReleased} />

      {/* Compact server bar with EpInfo + Server side by side */}
      <div className="bg-[#323044] text-slate-100 flex items-center rounded-md overflow-hidden mt-2 min-h-[44px] max-[880px]:flex-col max-[880px]:min-h-auto">
        <EpInfo episode={episode} mediaType={mediaType} season={season} isReleased={isReleased} isCurrentEpAired={isCurrentEpAired} />
        <div className="h-full w-px bg-[#5b5682] max-[880px]:hidden"></div>
        {isReleased && isCurrentEpAired && <Server />}
      </div>

      <AnimatePresence>
        {watchSetting?.light ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full z-20 bg-[#000000e5]"
            onClick={() => setWatchSetting(prev => ({ ...prev, light: false }))}
          ></motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default MainVideo;
