"use client";

import { useState, useEffect } from "react";
import { FaBell, FaSpinner } from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
  const { isUserLoggedIn, userInfo } = useUserInfoContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!isUserLoggedIn || !userInfo?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isUserLoggedIn, userInfo?.id]);

  if (!isUserLoggedIn) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown onClose={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
