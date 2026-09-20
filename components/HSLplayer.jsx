"use client"
import { useEffect, useRef } from "react";

const PROXY_BASE = "https://anitarofetchurl.falex43350.workers.dev/m3u8?url=";
const JW_SCRIPT = "https://cdn.jwplayer.com/libraries/IDzF9Zmk.js";

const JWPlayer = ({ src, tracks = [], title }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const containerId = "jw-player-container";

  const proxyUrl = src
    ? `${PROXY_BASE}${encodeURIComponent(src)}`
    : null;

  useEffect(() => {
    if (!proxyUrl || !containerRef.current) return;

    const loadAndInit = async () => {
      // Load JW Player script if not loaded
      if (!window.jwplayer) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = JW_SCRIPT;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (!window.jwplayer || !containerRef.current) return;

      // Destroy old instance
      try {
        if (playerRef.current) playerRef.current.remove();
      } catch (e) {}

      // Build subtitle tracks for JW Player
      const jwTracks = tracks.map((track) => ({
        file: track.file,
        label: track.label || "English",
        kind: "captions",
        default: track.default || false,
      }));

      playerRef.current = window.jwplayer(containerRef.current).setup({
        file: proxyUrl,
        type: "hls",
        title: title || "",
        width: "100%",
        aspectratio: "16:9",
        autostart: true,
        mute: false,
        tracks: jwTracks,
        captions: {
          color: "#ffffff",
          fontSize: 14,
          backgroundOpacity: 50,
        },
        logo: { hide: true },
      });
    };

    loadAndInit().catch(console.error);

    return () => {
      try {
        if (playerRef.current) playerRef.current.remove();
        playerRef.current = null;
      } catch (e) {}
    };
  }, [proxyUrl]);

  return (
    <div className="aspect-video w-full bg-black">
      <div ref={containerRef} id={containerId} className="w-full h-full" />
    </div>
  );
};

export default JWPlayer;
