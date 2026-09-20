"use client";

import { useState } from "react";
import { FaEnvelope, FaUser, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";

const LoginModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("main"); // main, signin, signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const { userLevel, levelProgress, levelTitle, login, register, logout, userInfo, isUserLoggedIn } = useUserInfoContext();

  // Reset view when modal opens
  const handleOpen = (newView) => {
    setView(newView);
  };

  const getLevelBadgeColor = (level) => {
    if (level >= 50) return "from-purple-500 to-pink-500";
    if (level >= 40) return "from-red-500 to-orange-500";
    if (level >= 30) return "from-orange-500 to-yellow-500";
    if (level >= 20) return "from-blue-500 to-purple-500";
    if (level >= 10) return "from-green-500 to-blue-500";
    if (level >= 5) return "from-cyan-500 to-green-500";
    return "from-gray-500 to-gray-400";
  };

  const levelBadgeColor = getLevelBadgeColor(userLevel);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success("Welcome back!");
      onClose();
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(email, password, displayName);
    setLoading(false);

    if (result.success) {
      toast.success("Account created successfully!");
      onClose();
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const handleSignOut = async () => {
    const result = await logout();
    if (result.success) {
      toast.success("Logged out successfully");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <motion.div
          className="relative bg-[#17151e] border border-[#484460]/50 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {/* Logged in menu */}
            {view === "main" && isUserLoggedIn && (
              <motion.div
                key="logged-in"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 0 }}
                className="p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={userInfo?.photo || "/images/logo.png"}
                    alt={userInfo?.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-lg truncate">{userInfo?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r ${levelBadgeColor} text-white`}>
                        Lv. {userLevel}
                      </span>
                      <span className="text-xs text-slate-400">{levelTitle}</span>
                    </div>
                  </div>
                </div>

                {/* XP Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>XP Progress</span>
                    <span>{userInfo?.xp || 0} XP</span>
                  </div>
                  <div className="h-2 bg-[#1a1824] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${levelBadgeColor} transition-all duration-300`}
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262232] text-slate-200 hover:text-white transition-colors"
                  >
                    <FaUser className="text-blue-400" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262232] text-slate-200 hover:text-white transition-colors"
                  >
                    <span className="text-yellow-400">🏆</span>
                    <span>Leaderboard</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#262232] text-slate-200 hover:text-white transition-colors"
                  >
                    <span className="text-gray-400">⚙</span>
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-200 hover:text-red-400 transition-colors"
                  >
                    <span className="text-red-400">🚪</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Not logged in - main view */}
            {view === "main" && !isUserLoggedIn && (
              <motion.div
                key="auth-main"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 0 }}
                className="p-6 text-center"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Welcome to YourHentaiTV</h2>
                  <p className="text-slate-400 mt-2">Sign in to track your watchlist and progress</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setView("signin")}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    <FaEnvelope />
                    <span>Sign in with Email</span>
                  </button>

                  <button
                    onClick={() => setView("signup")}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    <FaUser />
                    <span>Create Account</span>
                  </button>
                </div>

                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mt-4"
                >
                  Settings
                </Link>
              </motion.div>
            )}

            {/* Sign in form */}
            {view === "signin" && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <button
                  onClick={() => setView("main")}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm"
                >
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1824] border border-[#39374b] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1824] border border-[#39374b] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setView("signup")}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Don&apos;t have an account? Sign up
                  </button>
                </div>
              </motion.div>
            )}

            {/* Sign up form */}
            {view === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <button
                  onClick={() => setView("main")}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm"
                >
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1824] border border-[#39374b] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1824] border border-[#39374b] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1824] border border-[#39374b] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setView("signin")}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
