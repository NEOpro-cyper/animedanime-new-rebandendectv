"use client"
import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { searchHentai } from "@/lib/HentaiFunctions";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const handlerRef = useRef();

  useEffect(() => {
    handlerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handlerRef.current);
  }, [value, delay]);

  return debouncedValue;
};

const ResultItems = ({ data, setIsSearchBoxOpen, setSearchValue }) => {
  const poster = data?.poster || "/images/logo.png";
  const type = data?.type || "hentai";

  const listItemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={listItemVariants} initial="hidden" animate="show">
      <Link
        className="flex gap-[6px] w-full cursor-pointer hover:bg-[#242734]"
        href={`/watch/${data?.id}?media_type=${type}&ep=${data?.ep || 1}`}
        onClick={() => {
          if (setIsSearchBoxOpen) setIsSearchBoxOpen(false);
          if (setSearchValue) setSearchValue("");
        }}
      >
        <div className="px-2 py-[4px] flex gap-[6px] w-full">
          <Image
            src={poster}
            alt={data?.title || "Result"}
            height={40}
            width={60}
            className="w-[54px] aspect-[9/13] object-cover cursor-pointer rounded-md"
          />
          <div className="flex flex-col gap-[10px]">
            <div className="text-[#efebebf2] font-['Poppins'] font-medium text-[15px] overflow-hidden text-ellipsis line-clamp-1">
              {data?.title || ""}
            </div>
            <div className="flex gap-[10px]">
              <div className="border border-[#ffffff86] text-[#ffffffab] rounded-md px-1 text-[12px] flex items-center justify-center">
                {data?.ep ? `EP ${data.ep}` : "Hentai"}
              </div>
              {data?.year && (
                <div className="text-[#ffffffab] text-[14px]">
                  {data.year}
                </div>
              )}
              {data?.duration && (
                <div className="text-[#ffffffab] text-[14px]">
                  {data.duration}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const SearchResults = ({ searchValue, setIsSearchBoxOpen, setSearchValue }) => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [noResult, setNoResult] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const fetchSearch = useCallback(async () => {
    if (!debouncedSearchValue) {
      setResults([]);
      setNoResult(false);
      return;
    }
    try {
      setError(null);
      // Searches AnimeIDHentai through our internal proxy
      const data = await searchHentai(debouncedSearchValue, 8);
      const items = data?.results || [];

      if (items.length === 0) {
        setNoResult(true);
        setResults([]);
      } else {
        setNoResult(false);
        setResults(items);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [debouncedSearchValue]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  return (
    <motion.div
      className="bg-[#231f2c] rounded-b-md w-full absolute flex flex-col gap-2 z-30 pb-1 border-x border-b border-[#ffffff24]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {error && (
        <div className="text-red-400 text-sm text-center px-2 py-1">
          Error: {error}
        </div>
      )}

      {results.slice(0, 5).map((result) => (
        <Fragment key={`${result.id}-${result.ep}`}>
          <ResultItems
            data={result}
            setIsSearchBoxOpen={setIsSearchBoxOpen}
            setSearchValue={setSearchValue}
          />
        </Fragment>
      ))}

      {noResult && (
        <div className="text-slate-200 text-sm text-center py-2">
          No results found
        </div>
      )}
    </motion.div>
  );
};

export default SearchResults;
