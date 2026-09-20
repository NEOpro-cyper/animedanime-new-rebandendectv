"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaSpinner, FaFire, FaStar, FaClock, FaEye, FaLock, FaLockOpen } from "react-icons/fa";
import Card from "@/components/Cards/Card/Card";
import {
  getLatestHentai,
  getMostViewedHentai,
  getTopRatedHentai,
  getTrendingHentai,
  getUpcomingHentai,
  browseHentai,
  searchHentai,
} from "@/lib/HentaiFunctions";

const FETCHERS = {
  latest: (page) => getLatestHentai(page),
  viewed: (page) => getMostViewedHentai(page),
  rated: (page) => getTopRatedHentai(page),
  trending: () => getTrendingHentai(),
  upcoming: () => getUpcomingHentai(),
  censored: (page) => browseHentai({ page, sort: "Most Recent", genres: ["Censored"] }),
  uncensored: (page) => browseHentai({ page, sort: "Most Recent", genres: [] }),
};

const TAB_ICONS = {
  latest: FaClock,
  viewed: FaEye,
  rated: FaStar,
  trending: FaFire,
  upcoming: FaClock,
  censored: FaLock,
  uncensored: FaLockOpen,
};

/**
 * Shared hentai catalog browser used by /movies, /tv-series and /anime.
 *
 * @param {string} title     page heading
 * @param {string} subtitle  page sub heading
 * @param {Array}  tabs      [{ id, label }] — ids must exist in FETCHERS
 * @param {string} defaultTab
 */
const HentaiCatalog = ({ title, subtitle, tabs, defaultTab }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); setItems([]); }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (searchQuery) {
          data = await searchHentai(searchQuery, 40);
        } else {
          const fetcher = FETCHERS[activeTab] || FETCHERS.latest;
          data = await fetcher(page);
        }
        let results = data?.results || [];
        if (activeTab === "uncensored") results = results.filter((v) => !v.censored);
        setItems(prev => (page === 1 || activeTab === "trending" || activeTab === "upcoming" ? results : [...prev, ...results]));
      } catch (err) {
        console.error(err);
        setItems([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeTab, page, searchQuery]);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400">{subtitle}</p>
      </div>
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search episodes, series, tags..."
          className="w-full pl-12 pr-4 py-4 bg-[#231f2c] border border-[#39374b] rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-[#e26bbd]" />
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = TAB_ICONS[tab.id] || FaStar;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(""); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id && !searchQuery ? "bg-[#e26bbd] text-white" : "bg-[#231f2c] text-slate-300 hover:bg-[#2d283a]"}`}>
              <Icon className="text-sm" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <motion.div key={`${item.id}-${item.ep}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.5) }}>
            <Card data={item} />
          </motion.div>
        ))}
      </div>
      {loading && <div className="flex justify-center py-10"><FaSpinner className="w-8 h-8 text-[#e26bbd] animate-spin" /></div>}
      {!loading && items.length > 0 && activeTab !== "trending" && activeTab !== "upcoming" && (
        <div className="mt-8 w-full flex justify-center">
          <div className="bg-[#22212c] hover:bg-[#2d2c3e] cursor-pointer w-full max-w-96 text-center py-2 rounded-lg text-slate-200" onClick={() => setPage(p => p + 1)}>Load More</div>
        </div>
      )}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

export default HentaiCatalog;
