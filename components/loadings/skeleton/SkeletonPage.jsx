import Skeleton from "./Skeleton";
import SkeletonCard from "./SkeletonCard";
import SkeletonSectionTitle from "./SkeletonSectionTitle";

/**
 * Full-page loading skeleton shown between the header and footer
 * while server components fetch data.
 * Layout mirrors the homepage: hero banner → card sections.
 * Dark theme: #12111a background, #1f1e29 placeholder blocks.
 */
const SkeletonPage = () => (
  <div
    className="w-full flex flex-col items-center relative z-10 main-responsive"
    role="status"
    aria-label="Loading content"
  >
    {/* Hero banner placeholder (Herosection: 16/9, min-h-[460px]) */}
    <Skeleton className="w-full aspect-[16/9] min-h-[460px] max-h-[800px]" />

    <div className="w-full max-w-[96rem] flex flex-col">
      {/* Section 1 — trending rail */}
      <div className="mt-12 flex flex-col gap-8">
        <SkeletonSectionTitle />
        <div className="grid grid-cols-2 min-[560px]:grid-cols-3 min-[760px]:grid-cols-4 min-[1024px]:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      {/* Section 2 — featured collection trio (wide cards) */}
      <div className="mt-16 flex flex-col gap-8">
        <SkeletonSectionTitle />
        <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — catalog grid */}
      <div className="mt-16 mb-24 flex flex-col gap-8">
        <SkeletonSectionTitle />
        <div className="grid grid-cols-2 min-[560px]:grid-cols-3 min-[760px]:grid-cols-4 min-[1024px]:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>

    {/* Match the site's ambient background blobs so the skeleton
        doesn't flash a flat background under the fixed gradient blobs */}
    <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none" />
    <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-full pointer-events-none" />
  </div>
);

export default SkeletonPage;
