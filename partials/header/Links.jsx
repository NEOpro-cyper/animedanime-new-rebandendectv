"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./header.module.css"

const Links = ({ isMobile }) => {
  const pathname = usePathname()

  const links = [
    { name: "Home", href: "/" },
    { name: "Catalog", href: "/catalog" },
    { name: "New Releases", href: "/movies" },
    { name: "Most Viewed", href: "/tv-series" },
    { name: "Top Rated", href: "/anime" },
    { name: "Discover", href: "/discover" },
    { name: "Trending", href: "/catalog?type=viewed" },
    { name: "Community", href: "/community" },
  ]

  const isActive = (link) =>
    pathname === link.href ||
    (link.name !== "Home" &&
      (link.matchPrefix
        ? pathname.startsWith(link.matchPrefix)
        : pathname.includes(link.href.split("?")[0])))

  if (isMobile) {
    return (
      <div className="flex flex-col h-full justify-between items-center text-[#c4c2c7] p-2 gap-1 overflow-hidden">
        {links.map((link, index) => (
          <Link
            href={link.href}
            key={link.name}
            className={`${isActive(link) ? "text-white bg-[#242233] border-2 border-[#313e5038]" : ""} w-full h-full text-center py-[6px] rounded-md hover:bg-[#242233] border-2 border-transparent hover:border-[#313e5038] relative ${styles.animate_ltr}`}
            style={{ animationDelay: `${index * 0.13}s` }}
          >
            {link.name}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="flex mt-[8px] text-[#c4c2c7] max-[990px]:hidden">
      {links.map((link, index) => (
        <Link
          href={link.href}
          key={link.name}
          className={`${index === 0 ? "ml-6" : "ml-4"} ${
            isActive(link) ? "text-white" : ""
          }`}
        >
          {link.name}
        </Link>
      ))}
    </div>
  )
}

export default Links;
