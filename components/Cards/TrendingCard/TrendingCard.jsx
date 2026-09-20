"use client"
import Image from "next/image"
import styles from "./TrendingCard.module.css"
import { FaStar } from "react-icons/fa";
import Link from "next/link";

const isReleased = (info) => {
  if (!info) return true;
  if (info.status) {
    const unreleasedStatuses = ["Post Production", "In Production", "Planned", "Rumored", "Canceled"];
    if (unreleasedStatuses.some(s => info.status?.includes(s))) return false;
    const releasedStatuses = ["Released", "Ended", "Returning Series"];
    if (releasedStatuses.some(s => info.status?.includes(s))) return true;
  }
  if (info.released || info.year) {
    const dateStr = info.released || `${info.year}-01-01`;
    const releaseDate = new Date(dateStr);
    if (!isNaN(releaseDate.getTime())) return releaseDate <= new Date();
  }
  return true;
};

const TrendingCard = ({ info }) => {
  const poster = info?.poster || "/images/logo.png";
  const title = info?.title || "";
  const type = info?.type || "movie";
  const year = info?.year || "";
  const duration = info?.duration || "";
  const typeLabel = type === "anime" ? "Anime" : type === "tv" ? "TV Show" : type === "hentai" ? "Hentai" : "Movie";
  const released = isReleased(info);
  const watchHref =
    type === "hentai"
      ? `/watch/${info?.id}?media_type=hentai&ep=${info?.ep || 1}`
      : `/watch/${info?.id}?media_type=${type}`;

  const cardContent = (
    <>
      <Image src={poster} alt={title} width={200} height={280} quality={100}
        className="object-cover w-full h-full rounded-2xl hover:cursor-pointer" />
      {!released && (
        <div className="absolute top-2 right-2 bg-[#e26bbd]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
          Coming Soon
        </div>
      )}
      <div className={`${styles.rating} absolute top-0 left-0 bg-[#21212c] w-[60%] rounded-br-lg rounded-tl-md flex items-center justify-center gap-2 text-white h-10`}>
        <FaStar /><span>{year}</span>
      </div>
      <div className="absolute bottom-0 left-0 pl-[8px] pb-2 z-10 opacity-100 group-hover:opacity-0 transition">
        <h1 className="text-[#ffffffd1] font-medium text-md font-['poppins'] w-[186px] line-clamp-1 text-ellipsis overflow-hidden cursor-pointer">{title}</h1>
        <span className="text-[#ffffffb0] text-sm">{typeLabel}{duration ? `, ${duration}` : ""}</span>
      </div>
    </>
  );

  if (released) {
    return (
      <Link href={watchHref}
        className={`${styles?.cardImage} w-full aspect-[9/14] rounded-2xl relative overflow-hidden cursor-pointer group`}>
        {cardContent}
      </Link>
    );
  }
  return (
    <div className={`${styles?.cardImage} w-full aspect-[9/14] rounded-2xl relative overflow-hidden group`}>
      {cardContent}
    </div>
  );
};

export default TrendingCard
