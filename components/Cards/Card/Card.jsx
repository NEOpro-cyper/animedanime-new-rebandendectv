"use client"
import Image from "next/image"
import styles from "./Card.module.css"
import Link from "next/link"
import { motion } from "framer-motion"

// Check if content is released (hentai data uses "Released" / "Upcoming" statuses)
const isReleased = (data) => {
  if (!data) return true;
  if (data.status === "Upcoming") return false;
  if (data.status === "Released") return true;
  if (data.released || data.year) {
    const dateStr = data.released || `${data.year}-01-01`;
    const releaseDate = new Date(dateStr);
    if (!isNaN(releaseDate.getTime())) return releaseDate <= new Date();
  }
  return true;
};

const Card = ({ data, index, loading, hidden }) => {
  if (hidden) return <div className="aspect-[9/14] mb-2 bg-[#1c1b2000]"></div>;

  const listItem = { hidden: { scale: 0 }, show: { scale: 1 } };

  if (loading) {
    return <div className={`${styles.bounce} aspect-[9/14] rounded-2xl cursor-pointer mb-2 bg-[#22212c]`}
      style={{ animationDelay: `${index * 0.02 + 0.1}s` }}></div>;
  }

  const poster = data?.poster || "/images/logo.png";
  const title = data?.title || "";
  const year = data?.year || "";
  const quality = data?.quality || "";
  const duration = data?.duration || "";
  const released = isReleased(data);
  const typeLabel = "Hentai";
  // Hentai items are episode-level: link straight to the right episode
  const watchHref = `/watch/${data?.id}?media_type=hentai&ep=${data?.ep || 1}`;

  const cardContent = (
    <>
      <Image src={poster} alt={title} width={200} height={280}
        className="object-cover w-full h-full rounded-2xl cursor-pointer aspect-[4/6] pointer-events-none" />
      {!released && (
        <div className="absolute top-2 right-2 bg-[#e26bbd]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
          Coming Soon
        </div>
      )}
      <div className={`${styles.info} bottom-2 left-0 right-0 absolute text-xs font-medium flex flex-wrap items-center justify-center gap-[.3rem] z-[7] opacity-0`}>
        <span className="uppercase text-slate-200">{typeLabel}</span>
        <span className="text-[10px]">•</span>
        <span className="font-medium text-green-400">{quality}</span>
        <span className="text-[10px]">•</span>
        <span className="text-slate-200">{year}</span>
        {duration && <><span className="text-[10px]">•</span><span className="text-slate-200">{duration}</span></>}
      </div>
    </>
  );

  return (
    <motion.div className="aspect-[9/14] rounded-2xl cursor-pointer mb-2 relative" variants={listItem}>
      {released ? (
        <Link href={watchHref} className={`${styles.wrapper}`}>{cardContent}</Link>
      ) : (
        <div className={`${styles.wrapper}`}>{cardContent}</div>
      )}
      <div className="text-[#efebebf2] font-['Poppins'] font-medium text-[14px] mt-2 text-center line-clamp-2 text-ellipsis overflow-hidden mx-3">
        {title}
      </div>
    </motion.div>
  );
}

export default Card
