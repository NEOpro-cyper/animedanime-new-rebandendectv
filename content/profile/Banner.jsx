import Image from "next/image"

const Banner = ({ info, totalMovies, loading }) => {
  return (
    <div className="relative after:bg-[linear-gradient(360deg,#000000a6,transparent);] after:content-[''] after:w-full after:h-56 after:bottom-0 after:absolute ">
      <div className="relative w-full h-[21rem] border-b border-[#181821]">
        <Image
          src={info?.banner || "/images/banner.jpg"}
          alt="banner"
          loading='eager'
          priority={true}
          quality={100}
          fill
          className="object-cover"
        />
      </div>

      <div className="absolute bottom-0 right-1/2 translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-4">
          {loading ? <div>loading</div> :
            <Image src={info?.photo || ""} alt="profile" width={150} height={150} className="object-cover w-28 h-28 border-8 border-[#868a8e] rounded-full" />
          }
          <div className="font-['poppins'] text-[#ffffff] text-2xl font-semibold">{info?.name || "YourHentaiTV"}</div>
        </div>

        <div className="text-slate-100 flex gap-12 mt-2 mb-[26px]">

          <div className="flex flex-col items-center">
            <div className="font-semibold">{loading ? 0 : (totalMovies?.breakdown?.find(data => data?.status === "COMPLETED")?.count || 0)}</div>
            <div className="font-['Rubik'] text-[15px] font-medium text-[#c86e8e] text-center">Movies/TV Watched</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold">{loading ? 0 : info?.episodesWatched}</div>
            <div className="font-['Rubik'] text-[15px] font-medium text-[#c86e8e] text-center">Episodes Watched</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold">{totalMovies?.total || 0}</div>
            <div className="font-['Rubik'] text-[15px] font-medium text-[#c86e8e] text-center">Total Movies/TV</div>
          </div>


        </div>
      </div>

    </div>
  )
}

export default Banner