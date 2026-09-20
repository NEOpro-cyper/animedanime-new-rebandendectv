"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers, FaBook, FaComments, FaCog, FaShieldAlt, FaSpinner,
  FaBan, FaCheck, FaEye, FaEyeSlash, FaThumbtack, FaReply,
  FaSearch, FaChartBar, FaExclamationTriangle, FaTrash, FaLock
} from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";

// ─── Format helpers ───
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
};

const formatTimeAgo = (date) => {
  if (!date) return "N/A";
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
};

// ─── Sidebar tabs ───
const SIDEBAR_TABS = [
  { id: "dashboard", label: "Dashboard", icon: FaChartBar },
  { id: "users", label: "Users", icon: FaUsers },
  { id: "watchlist", label: "Watchlists", icon: FaBook },
  { id: "threads", label: "Threads", icon: FaComments },
  { id: "comments", label: "Comments", icon: FaComments },
  { id: "settings", label: "Settings", icon: FaCog },
];

// ─── Main Admin Page ───
const AdminPage = () => {
  const { userInfo, loading: userLoading } = useUserInfoContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [comments, setComments] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search / filter states
  const [userSearch, setUserSearch] = useState("");
  const [threadSearch, setThreadSearch] = useState("");
  const [commentSearch, setCommentSearch] = useState("");

  // Reply modal state
  const [replyModal, setReplyModal] = useState({ open: false, targetId: null, targetType: null });
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // Ban modal state
  const [banModal, setBanModal] = useState({ open: false, userId: null, userName: "" });
  const [banReason, setBanReason] = useState("");

  // Settings state
  const [siteName, setSiteName] = useState("YourHentaiTV");
  const [siteDescription, setSiteDescription] = useState("Your ultimate movie and anime destination");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // ─── Fetch helpers ───
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=stats");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (err) {
      toast.error("Failed to load stats");
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=users");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    }
    setLoading(false);
  }, []);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=threads");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setThreads(data.threads || []);
    } catch (err) {
      toast.error("Failed to load threads");
    }
    setLoading(false);
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?action=comments");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setComments(data.comments || []);
    } catch (err) {
      toast.error("Failed to load comments");
    }
    setLoading(false);
  }, []);

  const fetchWatchlist = useCallback(async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?action=watchlist&userId=${userId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWatchlistData(data.watchlist || []);
    } catch (err) {
      toast.error("Failed to load watchlist");
    }
    setLoading(false);
  }, []);

  // ─── Load data when tab changes ───
  useEffect(() => {
    if (!userInfo?.isAdmin) return;
    switch (activeTab) {
      case "dashboard": fetchStats(); break;
      case "users": fetchUsers(); break;
      case "threads": fetchThreads(); break;
      case "comments": fetchComments(); break;
      default: break;
    }
  }, [activeTab, userInfo?.isAdmin, fetchStats, fetchUsers, fetchThreads, fetchComments]);

  // ─── Admin actions ───
  const handleBanUser = async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ban", userId: banModal.userId, reason: banReason }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("User banned successfully");
      setBanModal({ open: false, userId: null, userName: "" });
      setBanReason("");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban", userId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("User unbanned");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to unban user");
    }
  };

  const handleHideThread = async (threadId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hideThread", threadId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Thread hidden");
      fetchThreads();
    } catch (err) {
      toast.error(err.message || "Failed to hide thread");
    }
  };

  const handleUnhideThread = async (threadId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unhideThread", threadId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Thread unhidden");
      fetchThreads();
    } catch (err) {
      toast.error(err.message || "Failed to unhide thread");
    }
  };

  const handlePinThread = async (threadId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pinThread", threadId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Thread pinned");
      fetchThreads();
    } catch (err) {
      toast.error(err.message || "Failed to pin thread");
    }
  };

  const handleHideComment = async (commentId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hideComment", commentId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Comment hidden");
      fetchComments();
    } catch (err) {
      toast.error(err.message || "Failed to hide comment");
    }
  };

  const handleUnhideComment = async (commentId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unhideComment", commentId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Comment unhidden");
      fetchComments();
    } catch (err) {
      toast.error(err.message || "Failed to unhide comment");
    }
  };

  const handleAdminReply = async () => {
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          targetId: replyModal.targetId,
          targetType: replyModal.targetType,
          content: replyContent,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Reply posted");
      setReplyModal({ open: false, targetId: null, targetType: null });
      setReplyContent("");
      if (replyModal.targetType === "thread") fetchThreads();
      else fetchComments();
    } catch (err) {
      toast.error(err.message || "Failed to post reply");
    }
    setReplyLoading(false);
  };

  const handleViewWatchlist = (userId) => {
    setSelectedUserId(userId);
    setActiveTab("watchlist");
    fetchWatchlist(userId);
  };

  // ─── Loading / Not Admin ───
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0d17]">
        <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!userInfo?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0d17] px-4">
        <FaLock className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-slate-400 text-center max-w-md">
          You do not have admin privileges to access this page. If you believe this is an error, contact the site administrator.
        </p>
      </div>
    );
  }

  // ─── Filtered data ───
  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const filteredThreads = threads.filter(t => {
    if (!threadSearch) return true;
    const q = threadSearch.toLowerCase();
    return t.title?.toLowerCase().includes(q) || t.authorName?.toLowerCase().includes(q);
  });

  const filteredComments = comments.filter(c => {
    if (!commentSearch) return true;
    const q = commentSearch.toLowerCase();
    return c.content?.toLowerCase().includes(q) || c.authorName?.toLowerCase().includes(q);
  });

  // ─── Render content ───
  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
      {loading ? (
        <div className="flex justify-center py-10"><FaSpinner className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaUsers className="text-blue-400 text-xl" />
              <span className="text-slate-400 text-sm">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.userCount || 0}</p>
          </div>
          <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaComments className="text-green-400 text-xl" />
              <span className="text-slate-400 text-sm">Total Threads</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.threadCount || 0}</p>
          </div>
          <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaReply className="text-purple-400 text-xl" />
              <span className="text-slate-400 text-sm">Total Comments</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.commentCount || 0}</p>
          </div>
          <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaBook className="text-yellow-400 text-xl" />
              <span className="text-slate-400 text-sm">Watchlist Items</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.watchlistCount || 0}</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-400">No stats available</p>
      )}
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 bg-[#231f2c] border border-[#39374b] rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><FaSpinner className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10">
          <FaUsers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredUsers.map(user => (
            <motion.div key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#231f2c] rounded-xl border border-[#39374b] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={user.photo || "/images/logo.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    {user.isAdmin && <FaShieldAlt className="text-yellow-400 text-xs flex-shrink-0" title="Admin" />}
                    {user.isBanned && <FaBan className="text-red-400 text-xs flex-shrink-0" title="Banned" />}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                <span>{formatDate(user.createdAt)}</span>
                <span>•</span>
                <span>{user._count?.watchlist || 0} lists</span>
                <span>•</span>
                <span>{user._count?.threads || 0} threads</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleViewWatchlist(user.id)}
                  className="px-3 py-1.5 bg-[#39374b] hover:bg-[#484460] text-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1">
                  <FaBook className="text-xs" /> Watchlist
                </button>
                {user.isBanned ? (
                  <button onClick={() => handleUnbanUser(user.id)}
                    className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-xs transition-colors flex items-center gap-1">
                    <FaCheck className="text-xs" /> Unban
                  </button>
                ) : (
                  !user.isAdmin && (
                    <button onClick={() => setBanModal({ open: true, userId: user.id, userName: user.name })}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs transition-colors flex items-center gap-1">
                      <FaBan className="text-xs" /> Ban
                    </button>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWatchlist = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setActiveTab("users"); setSelectedUserId(null); }}
          className="px-3 py-1.5 bg-[#39374b] hover:bg-[#484460] text-slate-200 rounded-lg text-sm transition-colors">
          ← Back to Users
        </button>
        <h2 className="text-2xl font-bold text-white">User Watchlist</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><FaSpinner className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : watchlistData.length === 0 ? (
        <div className="text-center py-10">
          <FaBook className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">This user has no items in their watchlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlistData.map(item => (
            <div key={item.id} className="bg-[#231f2c] rounded-xl border border-[#39374b] overflow-hidden">
              <img
                src={item.moviePoster || "/images/logo.png"}
                alt={item.movieTitle}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="p-3">
                <p className="text-white text-sm font-medium line-clamp-2">{item.movieTitle}</p>
                <p className="text-xs text-slate-400 mt-1">{item.movieType?.toUpperCase() || "MOVIE"}</p>
                <p className="text-xs text-slate-500 mt-1">Added {formatTimeAgo(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderThreads = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Thread Management</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text" value={threadSearch} onChange={e => setThreadSearch(e.target.value)}
            placeholder="Search threads..."
            className="pl-9 pr-4 py-2 bg-[#231f2c] border border-[#39374b] rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><FaSpinner className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : filteredThreads.length === 0 ? (
        <div className="text-center py-10">
          <FaComments className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No threads found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredThreads.map(thread => (
            <motion.div key={thread.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`bg-[#231f2c] rounded-xl border p-4 ${thread.isHidden ? "border-red-500/30" : "border-[#39374b]"}`}>
              <div className="flex items-start gap-3">
                <img
                  src={thread.author?.photo || thread.authorPhoto || "/images/logo.png"}
                  alt={thread.authorName}
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium">{thread.authorName}</p>
                    <span className="text-xs text-slate-500">{formatTimeAgo(thread.createdAt)}</span>
                    {thread.isHidden && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Hidden</span>}
                    {thread.pinned && <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Pinned</span>}
                    <span className="text-xs px-2 py-0.5 bg-[#39374b] text-slate-300 rounded">{thread.category}</span>
                  </div>
                  <h3 className="text-white font-semibold mt-1 line-clamp-1">{thread.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{thread.content}</p>

                  {/* Admin replies */}
                  {thread.adminReplies?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {thread.adminReplies.map(reply => (
                        <div key={reply.id} className="bg-[#1a1725] rounded-lg p-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <FaShieldAlt className="text-yellow-400 text-xs" />
                            <span className="text-yellow-400 text-xs font-medium">{reply.adminName}</span>
                            <span className="text-slate-500 text-xs">{formatTimeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-slate-300 text-xs mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>❤️ {thread.likes}</span>
                    <span>💬 {thread.replyCount} replies</span>
                    <span>👁️ {thread.views} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => setReplyModal({ open: true, targetId: thread.id, targetType: "thread" })}
                    className="p-2 bg-[#39374b] hover:bg-[#484460] text-blue-400 rounded-lg text-xs transition-colors" title="Admin Reply">
                    <FaReply />
                  </button>
                  {thread.isHidden ? (
                    <button onClick={() => handleUnhideThread(thread.id)}
                      className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-xs transition-colors" title="Unhide">
                      <FaEye />
                    </button>
                  ) : (
                    <button onClick={() => handleHideThread(thread.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs transition-colors" title="Hide">
                      <FaEyeSlash />
                    </button>
                  )}
                  <button onClick={() => handlePinThread(thread.id)}
                    className={`p-2 rounded-lg text-xs transition-colors ${thread.pinned ? "bg-yellow-600/20 text-yellow-400" : "bg-[#39374b] hover:bg-[#484460] text-slate-400"}`} title="Pin">
                    <FaThumbtack />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderComments = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Comment Management</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text" value={commentSearch} onChange={e => setCommentSearch(e.target.value)}
            placeholder="Search comments..."
            className="pl-9 pr-4 py-2 bg-[#231f2c] border border-[#39374b] rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><FaSpinner className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-10">
          <FaComments className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No comments found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredComments.map(comment => (
            <motion.div key={comment.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`bg-[#231f2c] rounded-xl border p-4 ${comment.isHidden ? "border-red-500/30" : "border-[#39374b]"}`}>
              <div className="flex items-start gap-3">
                <img
                  src={comment.author?.photo || comment.authorPhoto || "/images/logo.png"}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium text-sm">{comment.authorName}</p>
                    <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                    {comment.isHidden && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Hidden</span>}
                    <span className="text-xs px-2 py-0.5 bg-[#39374b] text-slate-300 rounded truncate max-w-[150px]">{comment.movieId}</span>
                  </div>
                  <p className="text-slate-300 text-sm mt-2">{comment.content}</p>

                  {/* Admin replies */}
                  {comment.adminReplies?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {comment.adminReplies.map(reply => (
                        <div key={reply.id} className="bg-[#1a1725] rounded-lg p-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <FaShieldAlt className="text-yellow-400 text-xs" />
                            <span className="text-yellow-400 text-xs font-medium">{reply.adminName}</span>
                            <span className="text-slate-500 text-xs">{formatTimeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-slate-300 text-xs mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>❤️ {comment.likes}</span>
                    <span>💬 {comment.replyCount} replies</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => setReplyModal({ open: true, targetId: comment.id, targetType: "comment" })}
                    className="p-2 bg-[#39374b] hover:bg-[#484460] text-blue-400 rounded-lg text-xs transition-colors" title="Admin Reply">
                    <FaReply />
                  </button>
                  {comment.isHidden ? (
                    <button onClick={() => handleUnhideComment(comment.id)}
                      className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-xs transition-colors" title="Unhide">
                      <FaEye />
                    </button>
                  ) : (
                    <button onClick={() => handleHideComment(comment.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs transition-colors" title="Hide">
                      <FaEyeSlash />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Site Settings</h2>
      <div className="space-y-6 max-w-2xl">
        <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Site Name</label>
              <input
                type="text" value={siteName} onChange={e => setSiteName(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1725] border border-[#39374b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Site Description</label>
              <textarea
                value={siteDescription} onChange={e => setSiteDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#1a1725] border border-[#39374b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Maintenance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Maintenance Mode</p>
              <p className="text-sm text-slate-400">When enabled, only admins can access the site</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative w-14 h-7 rounded-full transition-colors ${maintenanceMode ? "bg-blue-500" : "bg-[#39374b]"}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${maintenanceMode ? "translate-x-7" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div>
                <p className="text-white font-medium">Purge All Comments</p>
                <p className="text-sm text-slate-400">Delete all comments from the database</p>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                <FaTrash className="inline mr-1" /> Purge
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => toast.success("Settings saved!")}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "users": return renderUsers();
      case "watchlist": return renderWatchlist();
      case "threads": return renderThreads();
      case "comments": return renderComments();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0d17] pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed md:relative z-40 h-[calc(100vh-64px)] bg-[#14121d] border-r border-[#39374b] transition-all duration-300 ${sidebarOpen ? "w-56" : "w-0 md:w-16"} overflow-hidden`}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6 px-2">
              <FaShieldAlt className="text-yellow-400 text-xl flex-shrink-0" />
              {sidebarOpen && <span className="text-white font-bold text-lg">Admin Panel</span>}
            </div>
            <nav className="space-y-1">
              {SIDEBAR_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-500/20 text-blue-400 font-medium"
                      : "text-slate-400 hover:bg-[#231f2c] hover:text-white"
                  }`}>
                  <tab.icon className="text-base flex-shrink-0" />
                  {sidebarOpen && <span>{tab.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed md:hidden top-20 left-4 z-50 p-2 bg-[#231f2c] border border-[#39374b] rounded-lg text-slate-300">
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-64px)]">
          {renderContent()}
        </main>
      </div>

      {/* Ban Modal */}
      <AnimatePresence>
        {banModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setBanModal({ open: false, userId: null, userName: "" })} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative bg-[#17151e] rounded-2xl w-full max-w-md p-6 border border-[#39374b]">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-red-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Ban User</h2>
              </div>
              <p className="text-slate-400 mb-4">
                You are about to ban <span className="text-white font-medium">{banModal.userName}</span>. This will prevent them from accessing the site.
              </p>
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-1">Ban Reason (optional)</label>
                <input
                  type="text" value={banReason} onChange={e => setBanReason(e.target.value)}
                  placeholder="Reason for ban..."
                  className="w-full px-4 py-3 bg-[#231f2c] border border-[#39374b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setBanModal({ open: false, userId: null, userName: "" })}
                  className="flex-1 py-3 bg-[#231f2c] text-slate-300 rounded-xl hover:bg-[#2d283a] transition-colors">
                  Cancel
                </button>
                <button onClick={handleBanUser}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                  Ban User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setReplyModal({ open: false, targetId: null, targetType: null })} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative bg-[#17151e] rounded-2xl w-full max-w-md p-6 border border-[#39374b]">
              <div className="flex items-center gap-3 mb-4">
                <FaShieldAlt className="text-yellow-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Admin Reply</h2>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Reply as admin to this {replyModal.targetType}
              </p>
              <div className="mb-4">
                <textarea
                  value={replyContent} onChange={e => setReplyContent(e.target.value)}
                  placeholder="Write your admin reply..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#231f2c] border border-[#39374b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setReplyModal({ open: false, targetId: null, targetType: null }); setReplyContent(""); }}
                  className="flex-1 py-3 bg-[#231f2c] text-slate-300 rounded-xl hover:bg-[#2d283a] transition-colors">
                  Cancel
                </button>
                <button onClick={handleAdminReply} disabled={replyLoading || !replyContent.trim()}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {replyLoading ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background effects */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

export default AdminPage;
