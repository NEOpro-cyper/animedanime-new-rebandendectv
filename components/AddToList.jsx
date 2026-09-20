"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaCheck, FaSpinner } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";

const AddToList = ({ movieId, movieTitle, moviePoster, movieType }) => {
  const { isUserLoggedIn, userInfo } = useUserInfoContext();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if movie is in watchlist
  useEffect(() => {
    if (!isUserLoggedIn || !movieId) return;
    
    const checkWatchlist = async () => {
      try {
        const res = await fetch('/api/watchlist');
        const data = await res.json();
        const isInList = data.watchlist?.some(item => item.movieId === movieId);
        setInWatchlist(isInList);
      } catch (error) {
        console.error('Error checking watchlist:', error);
      }
    };
    
    checkWatchlist();
  }, [isUserLoggedIn, movieId]);

  const handleToggle = async () => {
    if (!isUserLoggedIn) {
      toast.error("Please sign in to add to watchlist");
      return;
    }

    setLoading(true);
    try {
      if (inWatchlist) {
        await fetch(`/api/watchlist?movieId=${movieId}`, { method: 'DELETE' });
        setInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId, movieTitle, moviePoster, movieType }),
        });
        setInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        inWatchlist
          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
      } disabled:opacity-50`}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : inWatchlist ? (
        <FaCheck />
      ) : (
        <FaPlus />
      )}
      <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
    </button>
  );
};

export default AddToList;
