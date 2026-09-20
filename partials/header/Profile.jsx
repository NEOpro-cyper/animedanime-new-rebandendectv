"use client"
import Image from "next/image"
import { useState } from "react";
import clsx from "clsx";
import LoginModal from "./LoginModal";
import { useUserInfoContext } from "@/context/UserInfoContext";


const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { loading, userInfo, isUserLoggedIn: isLoggedIn } = useUserInfoContext()


  return (
    <>
      <div className="w-10 h-10" onClick={() => setIsModalOpen(true)}>
        <Image
          src={
            isLoggedIn
              ? userInfo?.photo || "/images/logo.png"
              : "/images/logo.png"
          }
          alt="profile"
          width={50}
          height={50}
          className={
            clsx("cursor-pointer",
              { "h-10 w-10 rounded-lg object-cover cursor-pointer hover:rounded-2xl duration-100": isLoggedIn }
            )
          }
        />
      </div>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default Profile
