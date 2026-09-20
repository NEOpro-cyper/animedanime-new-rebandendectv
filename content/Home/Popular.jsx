"use client"
import Card from "@/components/Cards/Card/Card"
import { useState, useEffect } from "react"
import {
  getMostViewedHentai,
  getTopRatedHentai,
  getLatestHentai,
} from "@/lib/HentaiFunctions"

const TABS = [
  { key: "viewed", label: "Most Viewed" },
  { key: "rated", label: "Top Rated" },
  { key: "latest", label: "Most Recent" },
]

const Popular = () => {
  const [activeTab, setActiveTab] = useState("viewed")
  const [page, setPage] = useState(1)
  const [popularData, setPopularData] = useState([])
  const [loading, setLoading] = useState(true)

  // Reset page and data when tab changes
  useEffect(() => {
    setPage(1)
    setPopularData([])
  }, [activeTab])

  useEffect(() => {
    const getPopular = async () => {
      setLoading(true)
      try {
        let data
        if (activeTab === "rated") {
          data = await getTopRatedHentai(page)
        } else if (activeTab === "latest") {
          data = await getLatestHentai(page)
        } else {
          data = await getMostViewedHentai(page)
        }
        const newData = data?.results || []
        setPopularData(prev => page === 1 ? newData : [...prev, ...newData])
      } catch (err) {
        console.error("Failed to fetch popular:", err)
      }
      setLoading(false)
    }
    getPopular()
  }, [page, activeTab])

  return (
    <div className="w-full max-w-[96rem] relative bottom-28 mx-5 mt-16 max-[1270px]:-mt-2">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-[#ffffffbd] font-medium text-2xl font-['poppins']">| Most Popular</h1>

        {/* Filter Tabs */}
        <div className="flex bg-[#22212c] rounded-lg p-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[#4a446c] text-white"
                  : "text-[#ffffffbd] hover:bg-[#2d2c3e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-auto-fit gap-3">
        {popularData?.map((item, index) => <Card data={item} key={`${item.id}-${item.ep}-${index}`} />)}
        {loading ? Array(20).fill(0).map((_, index) => <Card key={index} loading />) : null}
      </div>

      <div className="mt-8 w-full flex justify-center">
        <div
          className="bg-[#22212c] hover:bg-[#2d2c3e] cursor-pointer w-full max-w-96 text-center py-2 rounded-lg text-slate-200"
          onClick={() => setPage(page + 1)}
        >
          Load More
        </div>
      </div>
    </div>
  )
}

export default Popular
