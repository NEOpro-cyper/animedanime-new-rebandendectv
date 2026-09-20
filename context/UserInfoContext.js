"use client";

import { createContext, useEffect, useState, useMemo, useContext, useCallback } from "react";

// Create the context
export const UserContext = createContext({
  userInfo: null,
  loading: true,
  isUserLoggedIn: false,
  userLevel: 1,
  userXP: 0,
  levelProgress: 0,
  levelTitle: 'Beginner',
  userStats: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
  updateProfile: async () => {},
});

// Calculate level from XP
const calculateLevel = (xp) => Math.floor((xp || 0) / 100) + 1;
const getLevelProgress = (xp) => (xp || 0) % 100;
const getLevelTitle = (level) => {
  if (level >= 50) return 'Legendary';
  if (level >= 40) return 'Elite';
  if (level >= 30) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 10) return 'Advanced';
  if (level >= 5) return 'Intermediate';
  return 'Beginner';
};

// Provider component
export const UserInfoProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const isUserLoggedIn = !!userInfo;
  const userXP = userInfo?.xp || 0;
  const userLevel = useMemo(() => calculateLevel(userXP), [userXP]);
  const levelProgress = useMemo(() => getLevelProgress(userXP), [userXP]);
  const levelTitle = useMemo(() => getLevelTitle(userLevel), [userLevel]);

  const userStats = useMemo(() => ({
    moviesWatched: userInfo?.moviesWatched || 0,
    episodesWatched: userInfo?.episodesWatched || 0,
    commentsCount: userInfo?.commentsCount || 0,
    threadsCreated: userInfo?.threadsCreated || 0,
    adsEnabled: userInfo?.adsEnabled ?? true,
    isAdmin: userInfo?.isAdmin || false,
  }), [userInfo]);

  // Fetch current user
  const refreshUserData = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setUserInfo(data.user || null);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setUserInfo(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Register
  const register = useCallback(async (email, password, name) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, name }),
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setUserInfo(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setUserInfo(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setUserInfo(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      userInfo,
      loading,
      isUserLoggedIn,
      userLevel,
      userXP,
      levelProgress,
      levelTitle,
      userStats,
      login,
      register,
      logout,
      refreshUserData,
      updateProfile,
    }),
    [userInfo, loading, isUserLoggedIn, userLevel, userXP, levelProgress, levelTitle, userStats, login, register, logout, refreshUserData, updateProfile]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUserInfoContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserInfoContext must be used within a UserInfoProvider');
  }
  return context;
};
