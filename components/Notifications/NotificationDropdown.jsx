"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaTrash, FaBell, FaTimes } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";

const NotificationDropdown = ({ onClose }) => {
  const { userInfo } = useUserInfoContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-12 w-80 bg-[#17151e] border border-[#39374b] rounded-xl shadow-xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#39374b]">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FaBell className="text-blue-400" />
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            <FaBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-[#39374b]/50 hover:bg-[#1f1d2a] transition-colors ${
                !notification.read ? 'bg-blue-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  {notification.icon || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{formatTime(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 text-slate-400 hover:text-green-400"
                  >
                    <FaCheck size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <Link
        href="/notifications"
        className="block p-3 text-center text-sm text-blue-400 hover:text-blue-300 border-t border-[#39374b]"
        onClick={onClose}
      >
        View all notifications
      </Link>
    </motion.div>
  );
};

export default NotificationDropdown;
