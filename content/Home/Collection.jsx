import FeaturedCard from "@/components/Cards/featuredCard/FeaturedCard";
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";

const FALLBACK_IMG = "/images/banner.jpg";

const Collection = ({ data }) => {
  // Collections built from AnimeIDHentai's most popular genres.
  // Each links to the discover page filtered by that genre.
  const genres = (data?.genres || [])
    .slice()
    .sort((a, b) => (b.count || 0) - (a.count || 0));

  const trendingCovers = (data?.trending?.all || []).map((v) => v.poster).filter(Boolean);
  const pickCovers = (offset = 0) => {
    const imgs = [
      trendingCovers[offset % Math.max(trendingCovers.length, 1)],
      trendingCovers[(offset + 1) % Math.max(trendingCovers.length, 1)],
      trendingCovers[(offset + 2) % Math.max(trendingCovers.length, 1)],
    ].map((src) => src || FALLBACK_IMG);
    return imgs;
  };

  const top = genres.slice(0, 3);
  const data3 = top.length
    ? top.map((g, i) => ({
        text: `The best of ${g.name}`,
        sub: `${g.count.toLocaleString()}+ episodes`,
        href: `/discover?genre=${encodeURIComponent(g.name)}`,
        image: pickCovers(i * 3),
      }))
    : [
        {
          text: "Latest Episodes",
          sub: "Fresh releases",
          href: "/catalog?type=latest",
          image: pickCovers(0),
        },
        {
          text: "Most Viewed",
          sub: "All-time favorites",
          href: "/catalog?type=viewed",
          image: pickCovers(3),
        },
        {
          text: "Top Rated",
          sub: "Community picks",
          href: "/catalog?type=rated",
          image: pickCovers(6),
        },
      ];

  return (
    <div className="w-full max-w-[96rem] relative mx-5">
      <div className="flex justify-between items-center">
        <h1 className="text-[#f6f4f4ea] font-medium text-2xl font-['poppins'] max-[450px]:text-[1.2rem]">
          | Featured Collections
        </h1>

        <Link
          href="/discover"
          className="text-[#ffffffbd] flex items-center gap-1 cursor-pointer hover:text-slate-500 transition"
        >
          See All <FaArrowRight />
        </Link>
      </div>

      <div className="mt-8 mb-52 grid grid-cols-[repeat(auto-fit,minmax(345px,1fr))] gap-3">
        {data3.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="block cursor-pointer"
          >
            <FeaturedCard data={item} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Collection;
