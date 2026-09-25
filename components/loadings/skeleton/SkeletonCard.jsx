import Skeleton from "./Skeleton";

/**
 * Poster card skeleton — mirrors <Card /> / <TrendingCard />:
 * 9/14 rounded-2xl poster with a centered title + subtitle bar below.
 */
const SkeletonCard = ({ wide = false }) => (
  <div className="flex flex-col">
    <Skeleton
      className={`w-full rounded-2xl ${
        wide ? "aspect-[4/5]" : "aspect-[9/14]"
      }`}
    />
    <div className="mx-3 mt-2 flex flex-col items-center gap-1.5">
      <Skeleton className="h-3.5 w-4/5 rounded" />
      <Skeleton className="h-3 w-2/5 rounded" />
    </div>
  </div>
);

export default SkeletonCard;
