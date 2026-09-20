"use client";
import HentaiCatalog from "@/components/HentaiCatalog";

const AnimePage = () => (
  <HentaiCatalog
    title="Top Rated"
    subtitle="The highest-rated hentai series and episodes"
    defaultTab="rated"
    tabs={[
      { id: "rated", label: "Top Rated" },
      { id: "trending", label: "Trending" },
      { id: "viewed", label: "Most Viewed" },
      { id: "latest", label: "Latest" },
      { id: "upcoming", label: "Upcoming" },
      { id: "censored", label: "Censored" },
      { id: "uncensored", label: "Uncensored" },
    ]}
  />
);

export default AnimePage;
