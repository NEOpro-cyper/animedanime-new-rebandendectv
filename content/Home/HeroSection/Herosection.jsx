"use client"
import styles from "./HeroSection.module.css"
import { FaCirclePlay } from "react-icons/fa6";
import { FaClock } from "react-icons/fa6";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Check if content is released (not upcoming)
const isReleased = (item) => {
  if (!item) return false;
  // Check status field ("Released" / "Upcoming")
  if (item.status) {
    const releasedStatuses = ["Released", "Ended", "Returning Series", "Canceled"];
    return releasedStatuses.some(s => item.status?.includes(s));
  }
  // Fallback: check release date
  if (item.released || item.year) {
    const dateStr = item.released || `${item.year}-01-01`;
    const releaseDate = new Date(dateStr);
    return releaseDate <= new Date();
  }
  // If no date info, assume released (to avoid hiding legitimate content)
  return true;
};

const Herosection = ({ data }) => {
  const spotlights = data?.spotlights || [];
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (spotlights.length > 0) {
      const randomIndex = Math.floor(Math.random() * spotlights.length);
      setCurrent(spotlights[randomIndex]);
    }
  }, [spotlights]);

  return (
    <div className={`relative w-full ${styles.smoothImageBlending}`}>
      <div>
        {current?.banner ?
          <Image src={current.banner} alt="banner" loading="eager" priority={true} fill
            className={`${styles.smoothTransform} relative aspect-[16/9] object-cover max-h-[800px] min-h-[460px]`} />
          :
          <div className={`${styles.smoothTransform} relative aspect-[16/9] object-cover max-h-[800px] min-h-[460px] w-full`}></div>
        }
      </div>

      {current ?
        <div className="absolute top-[35%] left-32 z-10 max-[1320px]:left-[2%]">
          <h3 className="text-[1.3rem] my-2 text-[#ed2672] font-medium max-[500px]:text-[18px]">
            #{spotlights.indexOf(current) + 1} Trending
          </h3>
          <h1 className="text-6xl text-white font-medium w-full max-w-[60rem] tracking-normal overflow-hidden text-ellipsis line-clamp-1 font-['Outfit'] max-[794px]:text-4xl">
            {current.title}
          </h1>

          <div className="flex items-center gap-4 max-[500px]:text-[14px]">
            <span className="flex items-center text-white my-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1 max-[500px]:w-4" viewBox="0 0 48 48">
                <defs><mask id="ipSPlay0"><g fill="none" strokeLinejoin="round" strokeWidth="4"><path fill="#fff" stroke="#fff" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" /><path fill="#000" stroke="#000" d="M20 24v-6.928l6 3.464L32 24l-6 3.464l-6 3.464z" /></g></mask></defs>
                <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSPlay0)" />
              </svg>
              {current.type === "tv" ? "TV" : current.type === "hentai" ? "Hentai" : "Movie"}
            </span>
            <span className="text-[#2fc867]">★ {current.quality}</span>
            <span className="flex items-center text-white">
              <svg viewBox="0 0 32 32" className="w-5 h-5 mr-1 max-[500px]:w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.6661 6.66699C4.29791 6.66699 3.99943 6.96547 3.99943 7.33366V24.667C3.99943 25.0352 4.29791 25.3337 4.6661 25.3337H27.3328C27.701 25.3337 27.9994 25.0352 27.9994 24.667V7.33366C27.9994 6.96547 27.701 6.66699 27.3328 6.66699H4.6661ZM8.66667 21.3333C8.29848 21.3333 8 21.0349 8 20.6667V11.3333C8 10.9651 8.29848 10.6667 8.66667 10.6667H14C14.3682 10.6667 14.6667 10.9651 14.6667 11.3333V12.6667C14.6667 13.0349 14.3682 13.3333 14 13.3333H10.8C10.7264 13.3333 10.7264 13.393 10.6667 13.4667V18.5333C10.6667 18.607 10.7264 18.6667 10.8 18.6667H14C14.3682 18.6667 14.6667 18.9651 14.6667 19.3333V20.6667C14.6667 21.0349 14.3682 21.3333 14 21.3333H8.66667ZM18 21.3333C17.6318 21.3333 17.3333 21.0349 17.3333 20.6667V11.3333C17.3333 10.9651 17.6318 10.6667 18 10.6667H23.3333C23.7015 10.6667 24 10.9651 24 11.3333V12.6667C24 13.0349 23.7015 13.3333 23.3333 13.3333H20.1333C20.0597 13.3333 20 13.393 20 13.4667V18.5333C20.6667 18.607 20.0597 18.6667 20.1333 18.6667H23.3333C23.7015 18.6667 24 18.9651 24 19.3333V20.6667C24 21.0349 23.7015 21.3333 23.3333 21.3333H18Z" fill="currentColor" />
              </svg>
              {current.year || "N/A"}
            </span>
          </div>

          <h2 className="text-sm text-white w-full max-w-[60rem] tracking-normal overflow-hidden text-ellipsis line-clamp-2 font-['poppins'] mt-3 mb-4 max-[794px]:text-[13px]">
            {current.description}
          </h2>

          {/* Show Watch Now only for released content; Coming Soon for unreleased */}
          {isReleased(current) ? (
            <Link href={`/watch/${current.id}?media_type=${current.type}`}
              className="flex w-max gap-2 items-center text-white bg-[#0f152524] backdrop-blur-md px-4 py-1 rounded-md border-[2px] border-[#ffffff5b] mt-2">
              <FaCirclePlay /> Watch now
            </Link>
          ) : (
            <div className="flex w-max gap-2 items-center text-slate-300 bg-[#0f152524] backdrop-blur-md px-4 py-1 rounded-md border-[2px] border-[#ffffff2a] mt-2 cursor-default">
              <FaClock /> Coming Soon
            </div>
          )}
        </div>
        : null
      }
    </div>
  )
}

export default Herosection
