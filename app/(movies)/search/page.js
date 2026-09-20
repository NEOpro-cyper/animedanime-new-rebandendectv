"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaSearch, FaSpinner, FaFire, FaStar, FaClock } from "react-icons/fa";
import Card from "@/components/Cards/Card/Card";
import ReactPaginate from "react-paginate";
import { searchHentai } from "@/lib/HentaiFunctions";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchValue, setSearchValue] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      // Search AnimeIDHentai via the internal proxy (returns up to 40 episodes)
      const data = await searchHentai(query, 40);
      let items = data?.results || [];
      if (filter === "censored") items = items.filter((v) => v.censored);
      if (filter === "uncensored") items = items.filter((v) => !v.censored);
      setResults(items);
      setTotalPages(1);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { if (initialQuery) performSearch(initialQuery); }, [initialQuery, performSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue)}`);
      performSearch(searchValue);
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
    performSearch(searchValue);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (searchValue.trim()) performSearch(searchValue);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
        <p className="text-slate-400">Find your favorite hentai episodes and series</p>
      </div>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search episodes, series, tags..."
            className="w-full pl-12 pr-4 py-4 bg-[#231f2c] border border-[#39374b] rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-[#e26bbd]" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#e26bbd] text-white rounded-lg hover:bg-[#d55aa9] transition-colors">Search</button>
        </div>
      </form>
      <div className="flex gap-2 mb-6">
        {[
          { id: "all", label: "All", icon: null },
          { id: "censored", label: "Censored", icon: FaFire },
          { id: "uncensored", label: "Uncensored", icon: FaStar },
        ].map((tab) => (
          <button key={tab.id} onClick={() => handleFilterChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filter === tab.id ? "bg-[#e26bbd] text-white" : "bg-[#231f2c] text-slate-300 hover:bg-[#2d283a]"}`}>
            {tab.icon && <tab.icon className="text-sm" />}<span>{tab.label}</span>
          </button>
        ))}
      </div>
      {loading ? (<div className="flex items-center justify-center py-20"><FaSpinner className="w-8 h-8 text-[#e26bbd] animate-spin" /></div>)
       : results.length === 0 && searchValue ? (<div className="text-center py-20"><FaSearch className="w-16 h-16 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-medium text-white mb-2">No results found</h3><p className="text-slate-400">Try a different search term</p></div>)
       : results.length === 0 ? (<div className="text-center py-20"><FaClock className="w-16 h-16 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-medium text-white mb-2">Search for content</h3><p className="text-slate-400">Enter a series or episode name to get started</p></div>)
       : (<>
          <p className="text-slate-400 mb-4">Found {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{searchParams.get("q")}&quot;</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item, index) => (<motion.div key={`${item.id}-${item.ep}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.4) }}><Card data={item} /></motion.div>))}
          </div>
          {totalPages > 1 && (<div className="mt-8 flex justify-center"><ReactPaginate previousLabel={"←"} nextLabel={"→"} breakLabel={"..."} pageCount={totalPages} marginPagesDisplayed={2} pageRangeDisplayed={3} onPageChange={handlePageChange}
            containerClassName={"flex gap-1"} pageClassName={"px-3 py-2 rounded-lg bg-[#231f2c] text-white hover:bg-[#2d283a] cursor-pointer"} activeClassName={"bg-[#e26bbd] hover:bg-[#d55aa9]"}
            previousClassName={"px-3 py-2 rounded-lg bg-[#231f2c] text-white hover:bg-[#2d283a] cursor-pointer"} nextClassName={"px-3 py-2 rounded-lg bg-[#231f2c] text-white hover:bg-[#2d283a] cursor-pointer"} disabledClassName={"opacity-50 cursor-not-allowed"} /></div>)}
        </>)}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

export default SearchPage;
