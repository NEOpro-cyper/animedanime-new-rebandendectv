import Image from "next/image"
import Link from "next/link";
import { IoLayers } from "react-icons/io5";

const HorizontalCard = ({ data }) => {
  const type = data?.type || "hentai";
  const poster = data?.poster || "/images/logo.png";
  const typeLabel = "Hentai";
  const watchHref = `/watch/${data?.id}?media_type=hentai&ep=${data?.ep || 1}`;

  return (
    <div className="bg-[#242735] border-[1px] border-[#39374b] flex w-full h-full overflow-hidden rounded-md relative items-center">

      <Link href={watchHref}>
        <Image
          src={poster}
          alt={data?.title || "Recommendation"}
          height={130}
          width={100}
          className="object-cover h-[106px] w-[80px] cursor-pointer max-[420px]:w-[112px]"
        />
      </Link>

      <div className="w-full h-full flex flex-col mx-2 my-2 max-w-[17rem] justify-center">
        <div className="flex flex-col gap-3">
          <Link
            href={watchHref}
            className="text-[#c4c7cc] text-[15px] font-medium overflow-hidden text-ellipsis line-clamp-2 hover:text-[#e4e5e8] transition-all cursor-pointer"
          >
            {data?.title || ""}
          </Link>

          <div className="flex gap-[6px] text-[14px] text-[#c4c7ccce] items-center">
            <div className="flex items-center gap-1 font-medium">
              {typeLabel}
            </div>
            {data?.year && (
              <>
                <div className="h-1 w-1 bg-[#ffffff94] rounded-full"></div>
                <div className="flex items-center gap-1 font-medium">
                  {data.year}
                </div>
              </>
            )}
            {data?.duration && (
              <>
                <div className="h-1 w-1 bg-[#ffffff94] rounded-full"></div>
                <div className="flex items-center gap-1 font-medium">
                  <IoLayers /> {data.duration}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalCard;
