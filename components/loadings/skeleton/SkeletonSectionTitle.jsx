import Skeleton from "./Skeleton";

/**
 * Section heading skeleton — mirrors the "| Section Title" headings
 * used by Trending / Upcoming / Popular sections.
 */
const SkeletonSectionTitle = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="w-1.5 h-7 rounded-sm" />
    <Skeleton className="h-6 w-44 rounded" />
    <Skeleton className="h-6 w-16 rounded hidden max-[640px]:hidden" />
  </div>
);

export default SkeletonSectionTitle;
