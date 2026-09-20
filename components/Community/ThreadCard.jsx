"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHeart, FaComment, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";

const ThreadCard = ({ thread, currentUserId }) => {
  const [liked, setLiked] = useState(thread.likesUsers?.includes(currentUserId));

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const action = liked ? 'unlike' : 'like';
      await fetch('/api/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: thread.id, action }),
      });
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#231f2c] rounded-xl border border-[#39374b] hover:border-[#484460] transition-colors"
    >
      <Link href={`/community/${thread.id}`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={thread.authorPhoto || "/images/logo.png"}
              alt={thread.authorName}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{thread.authorName}</p>
              <p className="text-xs text-slate-400">{formatTime(thread.createdAt)}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mt-3 line-clamp-2">{thread.title}</h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{thread.content}</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 px-4 py-3 border-t border-[#39374b]/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
          }`}
        >
          <FaHeart />
          <span>{thread.likes + (liked ? 1 : 0)}</span>
        </button>

        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <FaComment />
          <span>{thread.replyCount} replies</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-400 ml-auto">
          <FaEye />
          <span>{thread.views}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreadCard;
