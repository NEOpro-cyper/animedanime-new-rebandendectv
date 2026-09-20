"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaComments, FaSpinner, FaSearch } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";
import Link from "next/link";

// Categories
const THREAD_CATEGORIES = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'movies', name: 'Movies', icon: '🎬' },
  { id: 'tv-shows', name: 'TV Shows', icon: '📺' },
  { id: 'anime', name: 'Anime', icon: '🎌' },
  { id: 'recommendations', name: 'Recommendations', icon: '⭐' },
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'off-topic', name: 'Off Topic', icon: '🎲' },
];

// Sort options
const THREAD_SORT_OPTIONS = [
  { id: 'newest', name: 'Newest', value: 'createdAt', order: 'desc' },
  { id: 'popular', name: 'Most Liked', value: 'likes', order: 'desc' },
  { id: 'comments', name: 'Most Discussed', value: 'replyCount', order: 'desc' },
  { id: 'views', name: 'Most Viewed', value: 'views', order: 'desc' },
];

// Format time
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

// Thread Card Component
const ThreadCard = ({ thread, currentUserId }) => {
  const [liked, setLiked] = useState(thread.likesUsers?.includes(currentUserId));

  const handleLike = async () => {
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
            <span className="text-xs px-2 py-1 bg-[#39374b] rounded text-slate-300">
              {THREAD_CATEGORIES.find(c => c.id === thread.category)?.name || 'General'}
            </span>
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
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{thread.likes + (liked ? 1 : 0)}</span>
        </button>

        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span>💬</span>
          <span>{thread.replyCount} replies</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-400 ml-auto">
          <span>👁️</span>
          <span>{thread.views}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Community = () => {
  const { isUserLoggedIn, userInfo, loading: userLoading } = useUserInfoContext();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch threads
  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);
      try {
        const url = selectedCategory
          ? `/api/threads?category=${selectedCategory}`
          : '/api/threads';
        const res = await fetch(url);
        const data = await res.json();
        setThreads(data.threads || []);
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [selectedCategory]);

  // Filter threads by search
  const filteredThreads = threads.filter(thread => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      thread.title?.toLowerCase().includes(query) ||
      thread.content?.toLowerCase().includes(query) ||
      thread.authorName?.toLowerCase().includes(query)
    );
  });

  // Sort threads
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    if (sortBy === 'replyCount') return (b.replyCount || 0) - (a.replyCount || 0);
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleCreateThread = async (threadData) => {
    if (!isUserLoggedIn || !userInfo) return;

    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadData),
      });
      const data = await res.json();

      if (data.success) {
        setThreads(prev => [data.thread, ...prev]);
        toast.success('Thread created!');
        setShowCreateModal(false);
      } else {
        toast.error(data.error || 'Failed to create thread');
      }
    } catch (error) {
      toast.error('Failed to create thread');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
        <p className="text-slate-400">Discuss your favorite movies and shows with other fans</p>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#231f2c] border border-[#39374b] rounded-xl text-white 
                     placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Create Thread Button */}
        {isUserLoggedIn && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                     text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <FaPlus />
            <span>New Thread</span>
          </motion.button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? "bg-blue-500 text-white"
              : "bg-[#231f2c] text-slate-300 hover:bg-[#2d283a]"
          }`}
        >
          All
        </button>
        {THREAD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-blue-500 text-white"
                : "bg-[#231f2c] text-slate-300 hover:bg-[#2d283a]"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-6">
        {THREAD_SORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSortBy(option.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              sortBy === option.value
                ? "bg-[#39374b] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* Login Prompt */}
      {!isUserLoggedIn && !userLoading && (
        <div className="bg-[#231f2c] rounded-xl p-6 mb-6 text-center">
          <p className="text-slate-300 mb-4">Join the community to create threads and reply!</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Threads List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : sortedThreads.length === 0 ? (
        <div className="text-center py-20">
          <FaComments className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No discussions yet</h3>
          <p className="text-slate-400">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sortedThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                currentUserId={userInfo?.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateThread}
        categories={THREAD_CATEGORIES}
      />

      {/* Background Effects */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

// Create Thread Modal Component
const CreateThreadModal = ({ isOpen, onClose, onSubmit, categories }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    await onSubmit({ title, content, category });
    setLoading(false);
    setTitle("");
    setContent("");
    setCategory("general");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#17151e] rounded-2xl w-full max-w-lg p-6 border border-[#39374b]"
      >
        <h2 className="text-xl font-bold text-white mb-4">Create New Thread</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your discussion about?"
              className="w-full px-4 py-3 bg-[#231f2c] border border-[#39374b] rounded-xl text-white 
                       placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    category === cat.id
                      ? "bg-blue-500 text-white"
                      : "bg-[#231f2c] text-slate-300 hover:bg-[#2d283a]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={5}
              className="w-full px-4 py-3 bg-[#231f2c] border border-[#39374b] rounded-xl text-white 
                       placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#231f2c] text-slate-300 rounded-xl hover:bg-[#2d283a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Thread"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Community;
