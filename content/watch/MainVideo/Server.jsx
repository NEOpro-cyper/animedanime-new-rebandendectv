"use client";

import React, { useEffect, useState } from "react";
import { useWatchContext } from "@/context/Watch";

const Server = () => {
  const { setWatchInfo, watchInfo, MovieInfo, episode, episodes } = useWatchContext();
  const [servers, setServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);

  // The site provides a single nhplayer server per episode
  useEffect(() => {
    if (!MovieInfo) return;
    setServers([{ serverName: "NH Player" }]);
    setLoadingServers(false);
  }, [MovieInfo]);

  const fetchStream = async () => {
    setWatchInfo((prev) => ({ ...prev, loading: true, url: null }));

    // Resolve the current episode's nhplayer embed URL
    const target = (episodes || []).find(
      (e) => Number(e.episode_number) === Number(episode)
    );
    setWatchInfo({
      url: target?.embedUrl || null,
      loading: false,
      serverName: "NH Player",
      tracks: [],
      iframe: true,
    });
  };

  // Load the stream once the server list is ready
  useEffect(() => {
    if (!servers.length) return;
    fetchStream();
  }, [servers]);

  // Re-fetch stream when the episode changes
  useEffect(() => {
    if (!servers.length || !MovieInfo) return;
    fetchStream();
  }, [episode, episodes]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 max-[880px]:py-3 max-[880px]:w-full max-[880px]:justify-center flex-wrap">
      <span className="text-sm text-slate-300 shrink-0">Server:</span>
      <div className="flex gap-2 flex-wrap">
        {loadingServers ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : (
          servers.map((server) => (
            <div
              key={server.serverName}
              onClick={() => fetchStream()}
              style={{
                background: watchInfo?.serverName === server.serverName ? "#4a446c" : undefined,
              }}
              className="px-3 py-1 text-[13px] bg-[#413d57] hover:bg-[#4a446c] border border-[#5b5682] rounded-md cursor-pointer transition-colors"
            >
              {server.serverName}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Server;
