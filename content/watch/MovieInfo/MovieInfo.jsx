"use client"
import Image from "next/image"
import Link from "next/link"

const MovieInfo = ({ info }) => {
  // info from the data layer (normalized):
  // { id, type, title, poster, banner, description, quality, duration,
  //   genres, released, production/brand, language, views, related, ... }

  const type = info?.type || "movie";
  const poster = info?.poster;

  const formatViews = (n) => {
    if (!n) return "";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  };

  return (
    <div className="text-white flex gap-6">
      {poster && (
        <Image
          src={poster}
          alt={info?.title || "Poster"}
          width={215}
          height={300}
          className="rounded-2xl object-cover h-80 w-[16rem] max-[840px]:h-[14rem] max-[380px]:h-[9rem]"
        />
      )}

      <div className="mt-2">
        <h1 className="text-2xl font-['poppins'] font-medium max-[840px]:text-[22px] max-[380px]:text-[19px]">
          {info?.title || ""}
        </h1>

        {info?.tagline && (
          <p className="text-sm italic text-slate-400 mt-1">{info.tagline}</p>
        )}

        <div className="flex gap-2 mt-1 mb-2">
          {info?.quality && (
            <span className="bg-[#727587] text-[13px] px-1 rounded-[4px] text-slate-900 font-medium">
              {type === "hentai" ? info.quality : `★ ${info.quality}`}
            </span>
          )}
          {info?.released && (
            <span className="bg-[#727587] text-[13px] px-1 rounded-[4px] text-slate-900 font-medium">
              {info.released.split("-")[0]}
            </span>
          )}
          {type === "hentai" && info?.censored !== undefined && (
            <span className="bg-[#e26bbd] text-[13px] px-1 rounded-[4px] text-white font-medium">
              {info.censored ? "Censored" : "Uncensored"}
            </span>
          )}
        </div>

        <p className="text-[15px] font-['poppins'] text-[#fff4f4b1] overflow-hidden text-ellipsis line-clamp-4 mb-2">
          {info?.description}
        </p>

        <div className="flex gap-32 justify-between max-[960px]:flex-col max-[960px]:gap-0">
          <div>
            <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
              Type: <span className="text-[#e26bbcd9]">
                {type === "anime" ? "Anime" : type === "tv" ? "TV Show" : type === "hentai" ? "Hentai" : "Movie"}
              </span>
            </div>

            {info?.country?.length > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Country: <span className="text-[#e26bbcd9]">
                  {info.country.join(", ")}
                </span>
              </div>
            )}

            {info?.released && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Released: <span className="text-[#e26bbcd9]">
                  {info.released}
                </span>
              </div>
            )}

            {info?.duration && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Duration: <span className="text-[#e26bbcd9]">
                  {info.duration}
                </span>
              </div>
            )}

            {type === "tv" && info?.number_of_seasons && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Seasons: <span className="text-[#e26bbcd9]">
                  {info.number_of_seasons}
                </span>
              </div>
            )}

            {(type === "tv" || type === "anime" || type === "hentai") && (info?.number_of_episodes || info?.episodeCount) && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Episodes: <span className="text-[#e26bbcd9]">
                  {info.number_of_episodes || info.episodeCount}
                </span>
              </div>
            )}

            {type === "anime" && info?.format && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Format: <span className="text-[#e26bbcd9]">
                  {info.format}
                </span>
              </div>
            )}

            {type === "anime" && info?.season && info?.seasonYear && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Season: <span className="text-[#e26bbcd9]">
                  {info.season} {info.seasonYear}
                </span>
              </div>
            )}

            {type === "anime" && info?.studios?.length > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Studios: <span className="text-[#e26bbcd9]">
                  {info.studios.join(", ")}
                </span>
              </div>
            )}

            {type === "anime" && info?.status && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Status: <span className="text-[#e26bbcd9]">
                  {info.status?.replace(/_/g, " ")}
                </span>
              </div>
            )}

            {type === "hentai" && info?.language && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Language: <span className="text-[#e26bbcd9]">
                  {info.language}
                </span>
              </div>
            )}

            {type === "hentai" && info?.views > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Views: <span className="text-[#e26bbcd9]">
                  {formatViews(info.views)}
                </span>
              </div>
            )}
          </div>

          <div>
            {info?.genres?.length > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                {type === "hentai" ? "Tags:" : "Genres:"} <span className="text-[#e26bbcd9]">
                  {info.genres.slice(0, 12).join(", ")}
                </span>
              </div>
            )}

            {info?.vote_average ? (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Rating: <span className="text-[#e26bbcd9]">
                  {Number(info.vote_average).toFixed(1)}/10
                </span>
              </div>
            ) : null}

            {(type === "hentai" ? info?.production : info?.production)?.length > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                {type === "hentai" ? "Brand:" : "Production:"} <span className="text-[#e26bbcd9]">
                  {info.production.join(", ")}
                </span>
              </div>
            )}

            {info?.cast?.length > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Cast: <span className="text-[#e26bbcd9]">
                  {info.cast.slice(0, 5).map((c, i) => (
                    <span key={i}>
                      {c.name}{i < Math.min(info.cast.length, 5) - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {type === "hentai" && info?.aliases?.length > 0 && (
              <div className="text-sm text-[#dadada] font-['poppins'] mt-[2px]">
                Also known as: <span className="text-[#e26bbcd9]">
                  {info.aliases.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
