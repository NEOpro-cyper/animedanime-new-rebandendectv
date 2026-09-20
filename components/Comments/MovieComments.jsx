"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComment, FaHeart, FaReply, FaSpinner, FaTrash } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";

const MovieComments = ({ movieId, movieTitle }) => {
  const { isUserLoggedIn, userInfo } = useUserInfoContext();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Fetch comments
  useEffect(() => {
    if (!movieId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?movieId=${movieId}`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [movieId]);

  // Submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          content: newComment.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setNewComment("");
        toast.success("Comment posted!");
      } else {
        toast.error(data.error || "Failed to post comment");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (commentId) => {
    if (!isUserLoggedIn) {
      toast.error("Please sign in to reply");
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          parentId: commentId,
          content: replyContent.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, replies: [...(c.replies || []), data.reply] }
            : c
        ));
        setReplyContent("");
        setReplyTo(null);
        toast.success("Reply posted!");
      } else {
        toast.error(data.error || "Failed to post reply");
      }
    } catch (error) {
      toast.error("Failed to post reply");
    }
  };

  // Like/unlike comment
  const handleLike = async (commentId, replyId = null) => {
    if (!isUserLoggedIn) {
      toast.error("Please sign in to like");
      return;
    }

    try {
      const target = replyId || commentId;
      const type = replyId ? 'reply' : 'comment';
      
      // Check if already liked
      const item = replyId
        ? comments.find(c => c.replies?.some(r => r.id === replyId))?.replies?.find(r => r.id === replyId)
        : comments.find(c => c.id === commentId);
      
      const isLiked = item?.likesUsers?.includes(userInfo.id);
      const action = isLiked ? 'unlike' : 'like';

      await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: replyId ? null : commentId,
          replyId,
          action,
        }),
      });

      // Update local state
      setComments(prev => prev.map(c => {
        if (replyId && c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === replyId) {
                const likesUsers = r.likesUsers ? r.likesUsers.split(',').filter(Boolean) : [];
                const userIndex = likesUsers.indexOf(userInfo.id);
                if (action === 'like' && userIndex === -1) {
                  likesUsers.push(userInfo.id);
                } else if (action === 'unlike' && userIndex > -1) {
                  likesUsers.splice(userIndex, 1);
                }
                return { ...r, likes: action === 'like' ? r.likes + 1 : r.likes - 1, likesUsers: likesUsers.join(',') };
              }
              return r;
            }),
          };
        }
        if (c.id === commentId) {
          const likesUsers = c.likesUsers ? c.likesUsers.split(',').filter(Boolean) : [];
          const userIndex = likesUsers.indexOf(userInfo.id);
          if (action === 'like' && userIndex === -1) {
            likesUsers.push(userInfo.id);
          } else if (action === 'unlike' && userIndex > -1) {
            likesUsers.splice(userIndex, 1);
          }
          return { ...c, likes: action === 'like' ? c.likes + 1 : c.likes - 1, likesUsers: likesUsers.join(',') };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

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

  return (
    <div className="bg-[#1a1824] rounded-xl border border-[#39374b] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#39374b]">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FaComment className="text-blue-400" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment form */}
      {isUserLoggedIn && (
        <form onSubmit={handleSubmitComment} className="p-4 border-b border-[#39374b]">
          <div className="flex gap-3">
            <img
              src={userInfo?.photo || "/images/logo.png"}
              alt={userInfo?.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
                className="w-full px-3 py-2 bg-[#231f2c] border border-[#39374b] rounded-lg text-white 
                         placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium 
                         hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="divide-y divide-[#39374b]/50">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center">
            <FaComment className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4"
              >
                <div className="flex gap-3">
                  <img
                    src={comment.authorPhoto || "/images/logo.png"}
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{comment.authorName}</span>
                      <span className="text-xs text-slate-500">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.likesUsers?.includes(userInfo?.id)
                            ? 'text-red-400'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <FaHeart />
                        <span>{comment.likes || 0}</span>
                      </button>
                      {isUserLoggedIn && (
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400"
                        >
                          <FaReply />
                          <span>Reply</span>
                        </button>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyTo === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 bg-[#231f2c] border border-[#39374b] rounded-lg text-white 
                                     text-sm focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 
                                     transition-colors disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <div className="mt-3 space-y-2 pl-4 border-l border-[#39374b]">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <img
                              src={reply.authorPhoto || "/images/logo.png"}
                              alt={reply.authorName}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white text-xs">{reply.authorName}</span>
                                <span className="text-xs text-slate-500">{formatTime(reply.createdAt)}</span>
                              </div>
                              <p className="text-slate-300 text-xs mt-0.5">{reply.content}</p>
                              <button
                                onClick={() => handleLike(comment.id, reply.id)}
                                className={`flex items-center gap-1 text-xs mt-1 transition-colors ${
                                  reply.likesUsers?.includes(userInfo?.id)
                                    ? 'text-red-400'
                                    : 'text-slate-500 hover:text-red-400'
                                }`}
                              >
                                <FaHeart size={10} />
                                <span>{reply.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Login prompt */}
      {!isUserLoggedIn && (
        <div className="p-4 text-center border-t border-[#39374b]">
          <p className="text-slate-400 text-sm">Sign in to leave a comment</p>
        </div>
      )}
    </div>
  );
};

export default MovieComments;
