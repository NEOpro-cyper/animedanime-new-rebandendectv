"use client";

import Banner from "@/content/profile/Banner"
import CategoryMain from "@/content/profile/CategoryMain"
import { useUserInfoContext } from "@/context/UserInfoContext"
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useState } from "react"

const Page = () => {
  const { userInfo, isUserLoggedIn, loading } = useUserInfoContext();
  const router = useRouter()
  const [totalMovies, setTotalMovies] = useState(0)

  useEffect(() => {
    if (!loading && !isUserLoggedIn) {
      router.push('/');
    }
  }, [loading, isUserLoggedIn, router]);

  // Calculate total movies from userInfo
  useEffect(() => {
    if (userInfo) {
      setTotalMovies(userInfo.moviesWatched || 0)
    }
  }, [userInfo])

  return isUserLoggedIn && (
    <Fragment>
      <Banner info={userInfo} totalMovies={totalMovies} loading={loading} />
      <CategoryMain info={userInfo} loading={loading} totalMovies={totalMovies} />

      {/* background */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[50%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-full"></div>
    </Fragment>
  )
}

export default Page
