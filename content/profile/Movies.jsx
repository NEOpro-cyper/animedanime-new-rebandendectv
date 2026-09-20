"use client"
import Card from "@/components/Cards/Card/Card";
import { motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

const Movies = ({ active, totalMovies }) => {
  const [page, setPage] = useState(0);

  const SplitedMovies = useMemo(() => {
    const movies = totalMovies?.breakdown?.find(data => data?.status === active)?.movies || [];
    if (!movies.length) return [];
    const chunkSize = 18;
    return movies.reduce((chunks, _, i) => {
      if (i % chunkSize === 0) {
        chunks.push(movies.slice(i, i + chunkSize));
      }
      return chunks;
    }, []);
  }, [totalMovies, active]);

  useEffect(() => {
    // Reset page to 0 when data changes
    setPage(0);
  }, [totalMovies, active]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.4, delayChildren: 0.3, } }
  };


  const handlePreviousPage = () => setPage(prev => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage(prev => Math.min(prev + 1, SplitedMovies.length - 1));

  return (
    <Fragment>

      {SplitedMovies &&
        <motion.div
          key={page}
          className="h-full mt-6 mx-24 grid grid-auto-fit gap-[8px_20px] max-[1080px]:mx-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {SplitedMovies[page]?.map((movie, index) => (
            <Fragment key={index}>
              <Card data={movie} type={movie?.type} />
            </Fragment>
          ))}


          {SplitedMovies[page]?.length < 9 &&
            Array.from({ length: 9 - SplitedMovies[page]?.length })?.map((_, i) => (
              <div key={i}></div>
            ))}

          {totalMovies === "loading" &&
            Array.from({ length: 18 })?.map((_, i) => (
              <Fragment key={i}>
                <Card loading />
              </Fragment>
            ))}
        </motion.div>}

      {SplitedMovies.length > 1 && (
        <div className="text-white flex gap-1 text-[16px] justify-center mt-8 mb-5">
          <div
            className="flex items-center justify-center h-10 w-10 cursor-pointer rounded-full bg-[#22212c] transition hover:bg-[#48465e]"
            onClick={handlePreviousPage}
          >
            <FaArrowLeft />
          </div>

          <div
            className="flex items-center justify-center h-10 w-10 cursor-pointer rounded-full bg-[#22212c] transition hover:bg-[#48465e]"
            onClick={handleNextPage}
          >
            <FaArrowRight />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Movies;
