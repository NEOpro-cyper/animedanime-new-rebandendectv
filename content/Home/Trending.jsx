"use client"
import TrendingCard from "@/components/Cards/TrendingCard/TrendingCard"
import { Fragment, useState, useEffect } from "react"
import { getLatestHentai } from "@/lib/HentaiFunctions"

const TABS = [
  { key: "all", label: "All" },
  { key: "censored", label: "Censored" },
  { key: "uncensored", label: "Uncensored" },
  { key: "latest", label: "New Releases" },
]

const Trending = ({ data }) => {
  const [activeTab, setActiveTab] = useState("all")
  const [tabData, setTabData] = useState([])
  const [loading, setLoading] = useState(false)

  // Default data from props (server-fetched from AnimeIDHentai trending board)
  const all = data?.trending?.all || []
  const censored = data?.trending?.censored || []
  const uncensored = data?.trending?.uncensored || []

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === "all") {
        setTabData(all.slice(0, 8))
        return
      }
      if (activeTab === "censored") {
        setTabData(censored.slice(0, 8))
        return
      }
      if (activeTab === "uncensored") {
        setTabData(uncensored.slice(0, 8))
        return
      }
      if (activeTab === "latest") {
        setLoading(true)
        try {
          const latest = await getLatestHentai(1)
          setTabData((latest.results || []).slice(0, 8))
        } catch (err) {
          console.error(err)
          setTabData([])
        }
        setLoading(false)
        return
      }
    }
    fetchTabData()
  }, [activeTab])

  const displayData = activeTab === "all" ? all.slice(0, 8) :
                      activeTab === "censored" ? censored.slice(0, 8) :
                      activeTab === "uncensored" ? uncensored.slice(0, 8) :
                      tabData

  return (
    <div className="w-full max-w-[96rem] relative bottom-28 mx-5 max-[1270px]:bottom-0 max-[1270px]:mt-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-[#ffffffbd] font-medium text-3xl font-['poppins'] max-[1270px]:text-2xl max-[1270px]:text-[#f6f4f4ea]">
          | Currently Trending
        </h1>

        {/* Filter Tabs */}
        <div className="flex bg-[#22212c] rounded-lg p-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
        {(loading ? Array(8).fill(null) : displayData).map((item, index) =>
          item ? (
            <TrendingCard key={item.id + "-" + item.ep || index} info={item} />
          ) : (
            <div key={index} className="aspect-[9/14] rounded-2xl bg-[#22212c] animate-pulse"></div>
          )
        )}
      </div>
    </div>
  )
}

export default Trending
