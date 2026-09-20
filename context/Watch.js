'use client';

import { saveWatchProgress } from '@/utils/ProgressHandler';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useUserInfoContext } from './UserInfoContext';
import { getHentaiEpisodes } from '@/lib/HentaiFunctions';

// Helper: check if content has any aired content at all
function hasAnyAiredContent(MovieInfo) {
  if (!MovieInfo) return true;

  // "Upcoming" entries have no watchable episodes yet
  if (MovieInfo.status === "Upcoming") return false;

  const releaseDate = MovieInfo.released || MovieInfo.year && `${MovieInfo.year}-01-01`;
  if (releaseDate) {
    const release = new Date(releaseDate);
    release.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (release > today) return false;
  }

  return true;
}

export const WatchAreaContext = createContext(null);

export function WatchAreaContextProvider({ children, MovieInfo, MovieId }) {
  const searchparam = useSearchParams();
  const { userInfo, isUserLoggedIn } = useUserInfoContext();

  const [episode, setEpisode] = useState(() => parseInt(searchparam.get('ep')) || 1);
  // Default to season 1 — never allow season 0 (Specials)
  const [season, setSeason] = useState(() => {
    const se = parseInt(searchparam.get('se')) || 1;
    return se < 1 ? 1 : se;
  });
  const [episodes, setEpisodes] = useState([]);
  const [episodeLoading, setEpisodeLoading] = useState(true);
  const [watchInfo, setWatchInfo] = useState({ loading: true });
  const [allSeasons, setAllSeasons] = useState([]);

  // Check if ANY content is available (not the same as per-episode airing)
  const isReleased = hasAnyAiredContent(MovieInfo);
  // Sync with URL params
  useEffect(() => {
    const ep = parseInt(searchparam.get('ep')) || 1;
    const se = parseInt(searchparam.get('se')) || 1;
    // Never allow season 0 (Specials)
    setEpisode(ep);
    setSeason(se < 1 ? 1 : se);
  }, [searchparam]);

  // Helper: load the nhplayer embed for the given episode
  const loadStream = async (id, serverName, seasonNum, episodeNum, episodesList) => {
    // Don't try to load stream if content hasn't released yet
    if (!isReleased) {
      setWatchInfo({ loading: false, url: null });
      return;
    }

    const target = (episodesList || []).find(
      (e) => Number(e.episode_number) === Number(episodeNum)
    );
    if (target?.embedUrl) {
      setWatchInfo({
        url: target.embedUrl,
        loading: false,
        serverName: 'NH Player',
        tracks: [],
        iframe: true,
      });
    } else {
      setWatchInfo({ loading: false, url: null });
    }
  };

  // Fetch episodes
  useEffect(() => {
    if (!MovieInfo) return;
    setEpisodeLoading(true);

    // Don't load anything for content that hasn't released yet
    if (!isReleased) {
      setEpisodes([]);
      setWatchInfo({ loading: false, url: null });
      setEpisodeLoading(false);
      return;
    }

    // Fetch episodes from AnimeIDHentai via internal proxy
    const fetchHentaiEpisodes = async () => {
      try {
        const data = await getHentaiEpisodes(MovieId);
        setEpisodes(data.episodes || []);
        setAllSeasons(data.seasons || []);

        // Auto-load the nhplayer embed for the current episode
        await loadStream(MovieId, null, 1, episode, data.episodes);
      } catch (err) {
        console.error(err);
        toast('Failed to fetch episodes');
        setEpisodes([]);
        setWatchInfo({ loading: false, url: null });
      } finally {
        setEpisodeLoading(false);
      }
    };

    fetchHentaiEpisodes();
  }, [MovieInfo, MovieId, season, isReleased]);

  // Reload stream when episode changes
  useEffect(() => {
    if (!MovieInfo || !isReleased) return;

    loadStream(MovieId, watchInfo.serverName, season, episode, episodes);
  }, [episode, episodes]);

  // Save progress
  useEffect(() => {
    if (episodes.length && MovieInfo && isReleased) {
      const uid = isUserLoggedIn ? userInfo?.id : null;
      saveWatchProgress(MovieInfo, episodes, episode, season, uid);
    }
  }, [episode, season, episodes, MovieInfo, isUserLoggedIn, userInfo?.id, isReleased]);

  const contextValue = useMemo(() => ({
    episode,
    setEpisode,
    season,
    setSeason,
    episodes,
    allSeasons,
    watchInfo,
    setWatchInfo,
    episodeLoading,
    MovieInfo,
    MovieId,
    isReleased,
  }), [
    episode,
    season,
    episodes,
    allSeasons,
    watchInfo,
    episodeLoading,
    MovieInfo,
    MovieId,
    isReleased,
  ]);

  return (
    <WatchAreaContext.Provider value={contextValue}>
      {children}
    </WatchAreaContext.Provider>
  );
}

export function useWatchContext() {
  const ctx = useContext(WatchAreaContext);
  if (!ctx) throw new Error('useWatchContext must be used inside WatchAreaContextProvider');
  return ctx;
}
