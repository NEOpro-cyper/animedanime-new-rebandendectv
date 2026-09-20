/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import Card from "@/components/Cards/Card/Card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Pagination from "./Pagination";
import Options from "./Options";
import { searchHentai, browseHentai } from "@/lib/HentaiFunctions";

// Maps the catalog "type" filter to AnimeIDHentai browse sorts
const TYPE_TO_SORT = {
  latest: "Most Recent",
  viewed: "Most Viewed",
  rated: "Top Rated",
};

const Movies = () => {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const genre = searchParams.get("genre") || "";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (search) {
          // Site search (episode-level results)
          const data = await searchHentai(search, 40);
          setMovies(data.results || []);
          setTotalPages(1);
        } else {
          // Browse catalog with optional type sort + genre filter
          const opts = {
            page,
            sort: TYPE_TO_SORT[type] || "Most Recent",
          };
          if (genre) opts.genres = [genre];
          if (type === "censored" || type === "uncensored") {
            opts.genres = [
              ...(genre ? [genre] : []),
              type === "censored" ? "Censored" : "",
            ].filter(Boolean);
            // uncensored filtering is applied post-fetch (boolean flag)
          }
          const data = await browseHentai(opts);
          let results = data.results || [];
          if (type === "uncensored") results = results.filter((v) => !v.censored);
          setMovies(results);
          setTotalPages(data.total_pages || 1);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, type, genre, page]);

  const loadingCards = useMemo(
    () => Array.from({ length: 28 }).map((_, index) => <Card key={index} index={index} loading />),
    []
  );

  return (
    <div className="w-full">
      <Options basePath="/catalog" />
      <div className="w-full h-full grid grid-auto-fit gap-3">
        {loading ? loadingCards : movies?.map((item, index) => <Card data={item} key={`${item.id}-${item.ep}-${index}`} />)}
        {(!loading && movies?.length < 6) && Array.from({ length: 8 - movies?.length }).map((_, index) => (<Card key={index} index={index} hidden />))}
      </div>
      <div className="mt-8"></div>
      {totalPages > 1 && (<Pagination pageInfo={{ currentPage: page, lastPage: totalPages }} />)}
    </div>
  );
};

export default Movies;
