import SkeletonPage from "@/components/loadings/skeleton/SkeletonPage";

// Shown between the header and footer while server components
// (homepage / catalog / discover, etc.) fetch data.
const Loading = () => <SkeletonPage />;

export default Loading;
