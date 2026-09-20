"use client";

import { useEffect, useState } from "react";
import ContinueWatchingCard from "@/components/Cards/ContinueWatchingCard/ContinueWatchingCard";
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import { getWatchProgress, getWatchProgressFromDB } from "@/utils/ProgressHandler";
import { useUserInfoContext } from "@/context/UserInfoContext";
import Link from "next/link";

const WatchHistory = () => {
  const { userInfo, isUserLoggedIn, loading } = useUserInfoContext();
  const [mappedData, setMappedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (isUserLoggedIn && userInfo?.id) {
        try {
          const dbData = await getWatchProgressFromDB(userInfo.id, 10);
          if (dbData.length > 0) {
            setMappedData(dbData);
          } else {
            const localData = getWatchProgress(true, 1, 10);
            setMappedData(localData);
          }
        } catch (error) {
          console.error('Error fetching watch progress:', error);
          const localData = getWatchProgress(true, 1, 10);
          setMappedData(localData);
        }
      } else {
        const localData = getWatchProgress(true, 1, 10);
        setMappedData(localData);
      }

      setIsLoading(false);
    };

    if (!loading) {
      fetchData();
    }
  }, [isUserLoggedIn, userInfo?.id, loading]);

  if (mappedData.length < 1 && !isLoading) return null;

  return (
    <div className="w-full max-w-[96rem] relative bottom-28 mx-5 mt-12 max-[1270px]:bottom-0 max-[1270px]:mt-12">
      <div className="flex justify-between">
        <h1 className="text-[#f6f4f4ea] font-medium text-2xl font-['poppins'] max-[450px]:text-[1.2rem]">| Continue Watching</h1>

        <Link href={`/continue-watching`} className="text-[#ffffffbd] flex items-center gap-1 cursor-pointer hover:text-slate-500 transition">See All <FaArrowRight /></Link>
      </div>

      <div className="mt-8 mb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading ? (
          // Loading skeletons — match new horizontal card shape
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] rounded-xl bg-[#22212c] animate-pulse flex overflow-hidden"
            >
              <div className="w-[120px] aspect-[2/3] bg-[#2a2935] flex-shrink-0" />
              <div className="flex-1 p-4 flex flex-col justify-end gap-2">
                <div className="h-3 w-3/4 bg-[#2a2935] rounded" />
                <div className="h-2 w-1/2 bg-[#2a2935] rounded" />
                <div className="h-1.5 w-full bg-[#2a2935] rounded-full mt-2" />
              </div>
            </div>
          ))
        ) : (
          <>
            {mappedData.slice(0, 10).map(data => (
              <ContinueWatchingCard key={data.id} data={data} />
            ))}

            {(mappedData?.length < 4) ? Array.from({ length: 4 - mappedData?.length }).map((i, _) => <ContinueWatchingCard key={_} hidden />) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;
