"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCheck, FaTrash, FaBell, FaArrowLeft } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";

const NotificationsPage = () => {
  const { isUserLoggedIn, loading, userInfo } = useUserInfoContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isUserLoggedIn) {
      router.push('/');
    }
  }, [loading, isUserLoggedIn, router]);

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userInfo?.id]);

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

  const handleDelete = async (notificationId) => {
    await fetch(`/api/notifications?notificationId=${notificationId}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      await fetch('/api/notifications?clearAll=true', { method: 'DELETE' });
      setNotifications([]);
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifs) => {
    const groups = { today: [], yesterday: [], thisWeek: [], older: [] };
    const now = new Date();
    
    notifs.forEach(n => {
      const date = new Date(n.createdAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) groups.today.push(n);
      else if (diffDays === 1) groups.yesterday.push(n);
      else if (diffDays < 7) groups.thisWeek.push(n);
      else groups.older.push(n);
    });
    
    return groups;
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

  const groupedNotifications = groupNotificationsByDate(notifications);

  if (loading || !isUserLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8">
      {/* Background decorations */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[50%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-full"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/"
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaBell className="text-blue-400" />
              Notifications
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          <div className="flex gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-[#242735] rounded-xl border border-[#39374b]"
          >
            <span className="text-5xl mb-4">🔔</span>
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-slate-400">You&apos;re all caught up!</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([group, notifs]) => {
              if (notifs.length === 0) return null;
              
              const groupLabels = {
                today: 'Today',
                yesterday: 'Yesterday',
                thisWeek: 'This Week',
                older: 'Older'
              };

              return (
                <div key={group}>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 px-1">
                    {groupLabels[group]}
                  </h3>
                  <div className="bg-[#242735] rounded-xl border border-[#39374b] overflow-hidden divide-y divide-[#39374b]/50">
                    {notifs.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-start gap-4 p-4 hover:bg-white/5 transition-colors
                          ${!notification.read ? 'bg-blue-500/5' : ''}`}
                      >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl shrink-0">
                          {notification.icon || '🔔'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-medium ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${notification.read ? 'text-slate-500' : 'text-slate-400'}`}>
                            {notification.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
