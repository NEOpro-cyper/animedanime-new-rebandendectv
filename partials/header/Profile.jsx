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
      {/* FIX 1 (deformed picture): `shrink-0` = flex-shrink:0.
          The header .right row overflows (Search is w-full + bell + avatar + gaps),
          so flexbox was squeezing this div. The <img> inside keeps h-10 (40px)
          height but its width was capped by Tailwind preflight max-width:100%
          of the squeezed parent -> narrow vertical sliver.
          shrink-0 locks the wrapper at 40px. */}
      {/* FIX 2 (login form flash): don't open the modal while the session
          is still being fetched — otherwise isUserLoggedIn is still false
          for the first second and you see the login form even when logged in. */}
      <div
        className="w-10 h-10 shrink-0"
        onClick={() => { if (!loading) setIsModalOpen(true) }}
      >
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
