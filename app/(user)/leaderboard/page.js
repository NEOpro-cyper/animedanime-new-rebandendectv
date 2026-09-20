"use client";

import { useState, useEffect } from "react";
import { FaTrophy, FaMedal, FaStar, FaFilm, FaComment, FaSpinner } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { getLevelTitle, getLevelBadgeColor } from "@/lib/XPSystem";

const Leaderboard = () => {
  const { userInfo, isUserLoggedIn } = useUserInfoContext();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-400" />;
    if (rank === 2) return <FaMedal className="text-gray-300" />;
    if (rank === 3) return <FaMedal className="text-amber-600" />;
    return <span className="text-slate-400 font-bold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaTrophy className="text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-slate-400">Top YourHentaiTV users by XP</p>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user) => {
            const isCurrentUser = user.id === userInfo?.id;
            const levelTitle = getLevelTitle(user.level);
            const levelBadgeColor = getLevelBadgeColor(user.level);

            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  isCurrentUser
                    ? 'bg-blue-500/10 border border-blue-500/30'
                    : 'bg-[#231f2c] border border-[#39374b] hover:border-[#484460]'
                }`}
              >
                {/* Rank */}
                <div className="w-10 flex justify-center text-xl">
                  {getRankIcon(user.rank)}
                </div>

                {/* User info */}
                <img
                  src={user.photo || "/images/logo.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{user.name}</span>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${levelBadgeColor} text-white`}>
                      Lv. {user.level}
                    </span>
                    <span className="text-xs text-slate-400">{levelTitle}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-white font-bold">{user.moviesWatched || 0}</div>
                    <div className="text-xs text-slate-400">Movies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{user.episodesWatched || 0}</div>
                    <div className="text-xs text-slate-400">Episodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{user.commentsCount || 0}</div>
                    <div className="text-xs text-slate-400">Comments</div>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{user.xp || 0}</div>
                  <div className="text-xs text-slate-400">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Background */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

export default Leaderboard;
