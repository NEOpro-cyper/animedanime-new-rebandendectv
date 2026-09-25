import Skeleton from "./Skeleton";

/**
 * Watch-page loading skeleton — mirrors app/(movies)/watch/[id]/page.js:
 * video player (aspect-video) → info rows → episode chips → recommendations.
 */
const SkeletonWatch = () => (
  <div
    className="w-full flex flex-col items-center z-10 relative main-responsive pt-[106px]"
    role="status"
    aria-label="Loading video"
  >
    <div className="w-full max-w-[96rem]">
      {/* Player area */}
      <div className="relative">
        <Skeleton className="w-full aspect-video rounded-md" />
        {/* Play affordance */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Skeleton className="w-16 h-16 rounded-full opacity-70" />
        </div>
      </div>

      {/* Title + meta under the player */}
      <div className="mt-6 flex flex-col gap-3 max-w-2xl">
        <Skeleton className="h-6 w-3/4 rounded" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-5/6 rounded" />
      </div>

      {/* Episode selector chips */}
      <div className="mt-10 flex flex-col gap-4">
        <Skeleton className="h-6 w-40 rounded" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-16 rounded-md" />
          ))}
        </div>
      </div>

      {/* Recommendations grid */}
      <div className="mt-14 mb-20 flex flex-col gap-6">
        <Skeleton className="h-6 w-48 rounded" />
        <div className="grid grid-cols-2 min-[560px]:grid-cols-3 min-[760px]:grid-cols-4 min-[1024px]:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="w-full aspect-[9/14] rounded-2xl" />
              <Skeleton className="mx-3 mt-2 h-3.5 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Ambient background blobs (match real page) */}
    <div className="fixed pointer-events-none w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]" />
    <div className="absolute max-[737px]:fixed pointer-events-none w-[500px] h-[370.13px] right-[50%] bottom-[-25%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-b-[30%]" />
  </div>
);

export default SkeletonWatch;
