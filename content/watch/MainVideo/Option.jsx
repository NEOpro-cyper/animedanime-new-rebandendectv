import { LuExpand } from "react-icons/lu";
import { FaForward, FaLightbulb } from "react-icons/fa6";
import { FaBackward } from "react-icons/fa";
import { useWatchSettingContext } from "@/context/WatchSetting";
import { useWatchContext } from "@/context/Watch";
import { BiCollapse } from "react-icons/bi";
import AddToList from "@/components/AddToList";
import { useUserInfoContext } from "@/context/UserInfoContext";

const Option = ({ isMovieExists, isReleased }) => {
  const { setEpisode, MovieInfo, episode, episodes } = useWatchContext()
  const { setWatchSetting, watchSetting } = useWatchSettingContext()
  const { isUserLoggedIn } = useUserInfoContext()
  const mediaType = MovieInfo?.type

  // Find the next aired episode number
  const getNextAiredEp = () => {
    if (!episodes?.length) return episode + 1;
    const currentIdx = episodes.findIndex(e => e.episode_number === episode);
    for (let i = currentIdx + 1; i < episodes.length; i++) {
      if (episodes[i].isAired !== false) return episodes[i].episode_number;
    }
    return episode; // No more aired episodes
  };

  // Find the previous aired episode number
  const getPrevAiredEp = () => {
    if (!episodes?.length) return Math.max(1, episode - 1);
    const currentIdx = episodes.findIndex(e => e.episode_number === episode);
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (episodes[i].isAired !== false) return episodes[i].episode_number;
    }
    return episode; // No previous aired episodes
  };

  return (
    <div className="flex justify-between bg-[#22212c] px-2 py-2 text-slate-200 text-sm max-[640px]:flex-col max-[640px]:gap-4">
      <div className="flex gap-4 flex-wrap max-[640px]:justify-center">

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setWatchSetting(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
        ><span>{watchSetting.isExpanded ? <BiCollapse /> : <LuExpand />}</span> <span className="max-[640px]:text-xs">{watchSetting.isExpanded ? "Collapse" : "Expand"}</span></div>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setWatchSetting(prev => ({ ...prev, light: !prev.light }))}
        >
          <span><FaLightbulb /></span>
          <span className="max-[640px]:text-xs">Light</span>
          <span className="text-[#e26bbd] max-[640px]:text-xs">{watchSetting.light ? "On" : "Off"}</span>
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setWatchSetting(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
        ><span className="max-[640px]:text-xs">Auto Play</span> <span className="text-[#e26bbd] max-[640px]:text-xs">{watchSetting.autoPlay ? "On" : "Off"}</span></div>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setWatchSetting(prev => ({ ...prev, autoNext: !prev.autoNext }))}
        ><span className="max-[640px]:text-xs">Auto Next</span> <span className="text-[#e26bbd] max-[640px]:text-xs">{watchSetting.autoNext ? "On" : "Off"}</span></div>

      </div>

      <div className="flex gap-3 items-center">
        {/* Only show Prev/Next for TV shows — skip to aired episodes only */}
        {isReleased && mediaType === "tv" && (
          <>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const prevEp = getPrevAiredEp();
                if (prevEp !== episode) setEpisode(prevEp);
              }}
            ><span><FaBackward /></span> <span className="max-[640px]:text-xs">Prev</span></div>

            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const nextEp = getNextAiredEp();
                if (nextEp !== episode) setEpisode(nextEp);
              }}
            ><span className="max-[640px]:text-xs">Next</span> <span><FaForward /></span></div>
          </>
        )}

        {isUserLoggedIn && <AddToList movieId={MovieInfo?.id} movieTitle={MovieInfo?.title} moviePoster={MovieInfo?.poster} movieType={MovieInfo?.type} />}
      </div>
    </div>
  )
}

export default Option
