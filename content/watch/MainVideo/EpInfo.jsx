const EpInfo = ({ episode, mediaType, season, isReleased, isCurrentEpAired }) => {
  // Show not released message for entirely unreleased content
  if (!isReleased) {
    return (
      <div className="flex items-center justify-center flex-col px-6 text-center text-sm max-[880px]:p-4 max-[880px]:w-full">
        <p>You are watching <span className="text-yellow-400">Coming Soon</span></p>
        <p>This content has not been released yet</p>
      </div>
    );
  }

  // Show not aired for specific episode
  if (!isCurrentEpAired) {
    return (
      <div className="flex items-center justify-center flex-col px-6 text-center text-sm max-[880px]:p-4 max-[880px]:w-full">
        <p>Season {season} · Episode {episode} — <span className="text-amber-400">Not Yet Aired</span></p>
        <p>Select an aired episode from the list</p>
      </div>
    );
  }

  if (mediaType === "movie") {
    return (
      <div className="flex items-center justify-center flex-col px-6 text-center text-sm max-[880px]:p-4 max-[880px]:w-full">
        <p>You are watching <span className="text-[#e26bbd]">Movie</span></p>
        <p>If this server won&apos;t work, switch to another</p>
      </div>
    );
  }

  if (mediaType === "hentai") {
    return (
      <div className="flex items-center justify-center flex-col px-6 text-center text-sm max-[880px]:p-4 max-[880px]:w-full">
        <p>You are watching <span className="text-[#e26bbd]">Episode {episode}</span></p>
        <p>Streamed from AnimeIDHentai player</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-col px-6 text-center text-sm max-[880px]:p-4 max-[880px]:w-full">
      <p>You are watching <span className="text-[#e26bbd]">Season {season} - Episode {episode}</span></p>
      <p>If this server won&apos;t work, switch to another</p>
    </div>
  );
};

export default EpInfo;
