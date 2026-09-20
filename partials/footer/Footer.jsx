import { FaHeart } from "react-icons/fa6";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-20 bg-[#242735b3] border-t-[1px] border-[#39374b] text-[.9rem] text-[#bac1cd] w-full">
      <div className="max-w-[96rem] mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Quick links — internal linking for SEO + navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
          <Link href="/movies" className="hover:text-white transition-colors">New Releases</Link>
          <Link href="/tv-series" className="hover:text-white transition-colors">Most Viewed</Link>
          <Link href="/anime" className="hover:text-white transition-colors">Top Rated</Link>
          <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
          <Link href="/community" className="hover:text-white transition-colors">Community</Link>
        </nav>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t-[1px] border-[#39374b] pt-4">
          <div className="text-center md:text-left">
            YourHentaiTV does not store any files on our server — all data and streams are fetched from AnimeIDHentai and embedded third-party players.
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            © {new Date().getFullYear()} YourHentaiTV — Made with <FaHeart className="text-[#e26bbd]" /> for Hentai Lovers
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
