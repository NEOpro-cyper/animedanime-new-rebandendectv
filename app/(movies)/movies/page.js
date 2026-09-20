"use client";
import HentaiCatalog from "@/components/HentaiCatalog";

const MoviesPage = () => (
  <HentaiCatalog
    title="New Releases"
    subtitle="The freshest hentai episodes, updated daily"
    defaultTab="latest"
    tabs={[
      { id: "latest", label: "Latest" },
      { id: "trending", label: "Trending" },
      { id: "viewed", label: "Most Viewed" },
      { id: "rated", label: "Top Rated" },
      { id: "censored", label: "Censored" },
      { id: "uncensored", label: "Uncensored" },
    ]}
  />
);

export default MoviesPage;
