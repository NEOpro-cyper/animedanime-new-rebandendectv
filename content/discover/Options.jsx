"use client"
import CatalogSelect from "@/components/ui/CatalogSelect";
import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getHentaiGenres } from "@/lib/HentaiFunctions";

// Discover filters: genre + sort, applied to the AnimeIDHentai browse catalog
const Options = ({ basePath = "/discover" }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortData = [
    { key: "all", value: "Most Recent" },
    { key: "viewed", value: "Most Viewed" },
    { key: "rated", value: "Top Rated" },
  ];

  const [genres, setGenres] = useState([{ key: "all", value: "All Genres" }]);
  const [genre, setGenre] = useState({ key: "all", value: "All Genres" });
  const [sort, setSort] = useState(
    sortData.find(item => item?.key === (searchParams.get("type") || "all")) || sortData[0]
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const loadGenres = async () => {
      const data = await getHentaiGenres();
      const list = (data?.results || [])
        .slice()
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .map((g) => ({ key: g.name, value: `${g.name} (${g.count})` }));
      setGenres([{ key: "all", value: "All Genres" }, ...list]);
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const current = searchParams.get("genre") || "all";
    setGenre(genres.find((g) => g.key === current) || { key: "all", value: "All Genres" });
  }, [searchParams, genres]);

  const applyFilters = useCallback(() => {
    const queryParams = new URLSearchParams({
      ...(search && { q: search }),
      ...(sort && sort.key !== "all" && { type: sort.key }),
      ...(genre && genre.key !== "all" && { genre: genre.key }),
    });
    router.push(`${basePath}${queryParams.toString() ? `?${queryParams}` : ""}`);
  }, [search, sort, genre, basePath, router]);

  return (
    <div className="w-full flex max-[880px]:flex-col gap-4 mb-8">
      <div className="bg-[#242735] border-[#39374b] text-[15px] text-slate-200 w-full px-[24px] font-['poppins'] rounded-md py-1 border flex items-center justify-center gap-2">
        <input
          type="text"
          placeholder="Search episodes, series, tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyUp={e => e.key === "Enter" && applyFilters()}
          className="w-full bg-transparent border-none outline-none max-[880px]:text-center"
        />
      </div>

      <CatalogSelect data={genres} active={genre} setActive={setGenre} />

      <CatalogSelect data={sortData} active={sort} setActive={setSort} />

      <div
        className="bg-[#242735] border-[#39374b] cursor-pointer text-[15px] text-white w-full px-[24px] font-['poppins'] rounded-md py-1 border flex items-center justify-center gap-2"
        onClick={applyFilters}
      >
        Filter
      </div>
    </div>
  );
};

export default Options;
