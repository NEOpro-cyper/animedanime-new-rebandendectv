import SkeletonWatch from "@/components/loadings/skeleton/SkeletonWatch";

// Watch pages fetch series + episode data server-side, which can take
// a moment — show a player-shaped skeleton instead of plain text.
const Loading = () => <SkeletonWatch />;

export default Loading;
