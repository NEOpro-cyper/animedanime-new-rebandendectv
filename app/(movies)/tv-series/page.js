"use client";
import HentaiCatalog from "@/components/HentaiCatalog";

const TVSeriesPage = () => (
  <HentaiCatalog
    title="Most Viewed"
    subtitle="The most-watched hentai episodes of all time"
    defaultTab="viewed"
    tabs={[
      { id: "viewed", label: "Most Viewed" },
      { id: "latest", label: "Latest" },
      { id: "trending", label: "Trending" },
      { id: "rated", label: "Top Rated" },
      { id: "censored", label: "Censored" },
      { id: "uncensored", label: "Uncensored" },
    ]}
  />
);

export default TVSeriesPage;
