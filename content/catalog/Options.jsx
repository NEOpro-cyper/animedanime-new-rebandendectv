"use client"
import CatalogSelect from "@/components/ui/CatalogSelect";
import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Catalog filters mapped to AnimeIDHentai browse modes
const Options = ({ basePath = "/catalog" }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeData = [
    { key: "all", value: "Latest" },
    { key: "viewed", value: "Most Viewed" },
    { key: "rated", value: "Top Rated" },
    { key: "censored", value: "Censored" },
    { key: "uncensored", value: "Uncensored" },
  ];

  const [type, setType] = useState(
    typeData.find(item => item?.key === (searchParams.get("type") || "all"))
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const applyFilters = useCallback(() => {
    const queryParams = new URLSearchParams({
      ...(search && { q: search }),
      ...(type && type.key !== "all" && { type: type.key }),
    });
    router.push(`${basePath}${queryParams.toString() ? `?${queryParams}` : ""}`);
  }, [search, type, basePath, router]);

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

      <CatalogSelect
        data={typeData}
        active={type}
        setActive={setType}
      />

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
