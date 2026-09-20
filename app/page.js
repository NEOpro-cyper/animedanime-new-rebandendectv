import Herosection from "@/content/Home/HeroSection/Herosection"
import Popular from "@/content/Home/Popular";
import Trending from "@/content/Home/Trending";
import WatchHistory from "@/content/Home/WatchHistory";
import Collection from "@/content/Home/Collection";
import Season from "@/content/Home/Season";
import { getHomeData } from "@/lib/HentaiFunctions";
import { buildMetadata } from "@/lib/seo";

// ─── SEO: homepage ───
export const metadata = buildMetadata({
  title: "YourHentaiTV — Watch Hentai Online Free in HD",
  description:
    "Stream the newest hentai episodes online for free in HD on YourHentaiTV. Browse trending, most viewed and top rated hentai series, uncensored and censored releases, upcoming titles and full episode lists — updated daily.",
  path: "/",
  keywords: [
    "watch hentai online free",
    "hentai streaming site",
    "new hentai episodes",
    "trending hentai",
    "uncensored hentai stream",
  ],
});

const Home = async () => {
  // All catalog/streaming data comes from AnimeIDHentai
  const homeData = await getHomeData();

  return (
    <>
      <Herosection data={homeData} />

      <div className="w-full flex flex-col items-center z-10 relative main-responsive">
        <Trending data={homeData} />
        <WatchHistory />
        <Collection data={homeData} />
        <Season data={homeData.upcoming} />
        <Popular />
      </div>

      {/* background */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-full"></div>
    </>
  )
}

export default Home;
