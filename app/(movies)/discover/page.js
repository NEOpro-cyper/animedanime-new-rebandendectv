import DiscoverMovies from "@/content/discover/Movies"
import { Fragment } from "react"
import { buildMetadata } from "@/lib/seo"

// ─── SEO: discover ───
export const metadata = buildMetadata({
  title: "Discover Hentai — Find New Series by Genre, Year & Popularity",
  description:
    "Discover new hentai series on YourHentaiTV. Filter by genres, release year, most recent, most viewed and top rated. Build your watchlist and stream every episode free in HD.",
  path: "/discover",
  keywords: [
    "discover hentai",
    "new hentai series",
    "hentai recommendations",
    "best hentai",
    "hentai filters",
  ],
});

const Page = () => {
  
  return (
    <Fragment>
      <div className="w-full flex flex-col items-center z-10 relative main-responsive top-[86px]">
        <div className="w-full max-w-[96rem] relative">

          {/* small line separation */}
          <div className="w-[-webkit-fill-available] h-[1px] absolute bg-[#212029] top-[1px]"></div>

          <div className="mt-[15px] flex justify-between items-center">
            <h1 className="text-[#ffffffea] font-medium text-[23px] font-['poppins']">Discover</h1>

          </div>

          <div className="flex gap-4 mt-4 mb-32 max-[780px]:flex-col">
            <DiscoverMovies />
          </div>


        </div>
      </div>

      {/* background */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-b-[30%]"></div>
      <div>

      </div>
    </Fragment>
  )
}

export default Page