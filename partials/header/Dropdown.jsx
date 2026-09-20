"use client";

import { useState } from "react";
import { FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaArrowLeft, FaTrophy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";

const Dropdown = ({ data, isLoggedIn }) => {
  const [view, setView] = useState('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { userLevel, levelProgress, levelTitle, login, register, logout } = useUserInfoContext();

  // Get level badge color
  const getLevelBadgeColor = (level) => {
    if (level >= 50) return 'from-purple-500 to-pink-500';
    if (level >= 40) return 'from-red-500 to-orange-500';
    if (level >= 30) return 'from-orange-500 to-yellow-500';
    if (level >= 20) return 'from-blue-500 to-purple-500';
    if (level >= 10) return 'from-green-500 to-blue-500';
    if (level >= 5) return 'from-cyan-500 to-green-500';
    return 'from-gray-500 to-gray-400';
  };

  const levelBadgeColor = getLevelBadgeColor(userLevel);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(email, password, displayName);
    setLoading(false);
    
    if (result.success) {
      toast.success('Account created successfully!');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const handleSignOut = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out successfully');
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 }
  };

  // Auth forms
  const renderSignInForm = () => (
    <motion.div
      key="signin"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4"
    >
      <button
        onClick={() => setView('main')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm"
      >
        <FaArrowLeft /> Back
      </button>

      <form onSubmit={handleEmailSignIn} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1824] border border-[#39374b] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1824] border border-[#39374b] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={() => setView('signup')}
          className="w-full text-center text-sm text-blue-400 hover:text-blue-300"
        >
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </motion.div>
  );

  const renderSignUpForm = () => (
    <motion.div
      key="signup"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4"
    >
      <button
        onClick={() => setView('main')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm"
      >
        <FaArrowLeft /> Back
      </button>

      <form onSubmit={handleSignUp} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1824] border border-[#39374b] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1824] border border-[#39374b] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1824] border border-[#39374b] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={() => setView('signin')}
          className="w-full text-center text-sm text-blue-400 hover:text-blue-300"
        >
          Already have an account? Sign in
        </button>
      </div>
    </motion.div>
  );

  // Main menu
  const renderMainMenu = () => (
    <motion.div
      key="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isLoggedIn ? (
        <>
          {/* User info with level */}
          <div className="px-4 py-3 border-b border-[#484460]/50">
            <div className="flex items-center gap-3">
              <img
                src={data?.photo || "/images/logo.png"}
                alt={data?.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{data?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${levelBadgeColor} text-white`}>
                    Lv. {userLevel}
                  </span>
                  <span className="text-xs text-slate-400">{levelTitle}</span>
                </div>
              </div>
            </div>
            
            {/* XP Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>XP Progress</span>
                <span>{data?.xp || 0} XP</span>
              </div>
              <div className="h-1.5 bg-[#1a1824] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${levelBadgeColor} transition-all duration-300`}
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#262232] text-slate-200 hover:text-white transition-colors"
            >
              <FaUser className="text-blue-400" />
              <span>Profile</span>
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#262232] text-slate-200 hover:text-white transition-colors"
            >
              <FaTrophy className="text-yellow-400" />
              <span>Leaderboard</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#262232] text-slate-200 hover:text-white transition-colors"
            >
              <FaCog className="text-gray-400" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-slate-200 hover:text-red-400 transition-colors"
            >
              <FaSignOutAlt className="text-red-400" />
              <span>Log Out</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Sign in options */}
          <div className="p-4 space-y-3">
            <button
              onClick={() => setView('signin')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <FaEnvelope />
              <span>Sign in with Email</span>
            </button>

            <button
              onClick={() => setView('signup')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <FaUser />
              <span>Create Account</span>
            </button>

            <Link
              href="/settings"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <FaCog />
              <span>Settings</span>
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <motion.div
      className="bg-[#17151e]/95 backdrop-blur-xl border border-[#484460]/50 absolute top-14 right-0 rounded-xl min-w-64 overflow-hidden shadow-xl"
      style={{ transformOrigin: 'top right' }}
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.15 }}
    >
      <AnimatePresence mode="wait">
        {view === 'main' && renderMainMenu()}
        {view === 'signin' && renderSignInForm()}
        {view === 'signup' && renderSignUpForm()}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dropdown;
