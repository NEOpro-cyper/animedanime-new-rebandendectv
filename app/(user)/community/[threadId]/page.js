"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaHeart, FaSpinner, FaReply, FaLock, FaThumbtack, FaShieldAlt } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";
import Link from "next/link";

const formatTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
};

const ThreadDetail = () => {
  const { threadId } = useParams();
  const router = useRouter();
  const { isUserLoggedIn, userInfo, loading: userLoading } = useUserInfoContext();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch thread
  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/threads?threadId=${threadId}`);
      const data = await res.json();
      if (data.thread) {
        setThread(data.thread);
      } else {
        toast.error("Thread not found");
        router.push("/community");
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
      toast.error("Failed to load thread");
    } finally {
      setLoading(false);
    }
  }, [threadId, router]);

  useEffect(() => {
    if (threadId) fetchThread();
  }, [threadId, fetchThread]);

  // Like thread
  const handleLikeThread = async () => {
    if (!isUserLoggedIn) {
      toast.error("Please sign in to like");
      return;
    }
    try {
      const liked = thread.likesUsers?.includes(userInfo?.id);
      const action = liked ? "unlike" : "like";
      await fetch("/api/threads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, action }),
      });
      setThread((prev) => ({
        ...prev,
        likes: liked ? prev.likes - 1 : prev.likes + 1,
        likesUsers: liked
          ? prev.likesUsers.replace(userInfo?.id, "")
          : (prev.likesUsers || "") + "," + userInfo?.id,
      }));
    } catch (error) {
      console.error("Error liking thread:", error);
    }
  };

  // Like reply
  const handleLikeReply = async (replyId, currentLikes, likesUsers) => {
    if (!isUserLoggedIn) {
      toast.error("Please sign in to like");
      return;
    }
    try {
      const liked = likesUsers?.includes(userInfo?.id);
      const action = liked ? "unlike" : "like";
      await fetch("/api/threads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId, action }),
      });
      setThread((prev) => ({
        ...prev,
        replies: prev.replies.map((r) =>
          r.id === replyId
            ? {
                ...r,
                likes: liked ? r.likes - 1 : r.likes + 1,
                likesUsers: liked
                  ? r.likesUsers.replace(userInfo?.id, "")
                  : (r.likesUsers || "") + "," + userInfo?.id,
              }
            : r
        ),
      }));
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  // Submit reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !isUserLoggedIn) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/threads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, content: replyContent }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyContent("");
        fetchThread(); // Refresh to get the new reply
        toast.success("Reply posted!");
      } else {
        toast.error(data.error || "Failed to post reply");
      }
    } catch (error) {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen pt-20 pb-10 text-center">
        <h2 className="text-2xl text-white">Thread not found</h2>
        <Link href="/community" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          Back to Community
        </Link>
      </div>
    );
  }

  const liked = thread.likesUsers?.includes(userInfo?.id);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/community")}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Community
      </button>

      {/* Thread header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#231f2c] rounded-xl border border-[#39374b] p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <img
            src={thread.authorPhoto || "/images/logo.png"}
            alt={thread.authorName}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-medium">{thread.authorName}</p>
              <span className="text-xs text-slate-400">{formatTime(thread.createdAt)}</span>
              {thread.pinned && <FaThumbtack className="text-yellow-400 text-xs" title="Pinned" />}
              {thread.locked && <FaLock className="text-red-400 text-xs" title="Locked" />}
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">{thread.title}</h1>
          </div>
        </div>

        <div className="mt-4 text-slate-300 whitespace-pre-wrap leading-relaxed">
          {thread.content}
        </div>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#39374b]/50">
          <button
            onClick={handleLikeThread}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? "text-red-400" : "text-slate-400 hover:text-red-400"
            }`}
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{thread.likes + (liked ? 1 : 0)}</span>
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>💬</span>
            <span>{thread.replyCount} replies</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400 ml-auto">
            <span>👁️</span>
            <span>{thread.views} views</span>
          </div>
        </div>
      </motion.div>

      {/* Replies */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-white">
          Replies ({thread.replies?.length || 0})
        </h2>

        <AnimatePresence mode="popLayout">
          {(thread.replies || []).map((reply) => {
            const replyLiked = reply.likesUsers?.includes(userInfo?.id);
            return (
              <motion.div
                key={reply.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#231f2c] rounded-xl border border-[#39374b] p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={reply.authorPhoto || "/images/logo.png"}
                    alt={reply.authorName}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{reply.authorName}</p>
                      <span className="text-xs text-slate-400">{formatTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-2 whitespace-pre-wrap">{reply.content}</p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleLikeReply(reply.id, reply.likes, reply.likesUsers)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          replyLiked ? "text-red-400" : "text-slate-400 hover:text-red-400"
                        }`}
                      >
                        <span>{replyLiked ? "❤️" : "🤍"}</span>
                        <span>{reply.likes + (replyLiked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {(!thread.replies || thread.replies.length === 0) && (
          <div className="text-center py-10 text-slate-400">
            <p>No replies yet. Be the first to respond!</p>
          </div>
        )}
      </div>

      {/* Reply form */}
      {isUserLoggedIn && !thread.locked ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#231f2c] rounded-xl border border-[#39374b] p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <FaReply className="text-blue-400" />
            <h3 className="text-white font-medium">Post a Reply</h3>
          </div>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-4 py-3 bg-[#17151e] border border-[#39374b] rounded-xl text-white
                       placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              required
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        </motion.div>
      ) : thread.locked ? (
        <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-4 text-center">
          <FaLock className="text-red-400 text-2xl mx-auto mb-2" />
          <p className="text-slate-400">This thread is locked. No new replies can be posted.</p>
        </div>
      ) : (
        <div className="bg-[#231f2c] rounded-xl border border-[#39374b] p-4 text-center">
          <p className="text-slate-300 mb-3">Sign in to reply to this thread</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Background Effects */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

export default ThreadDetail;
