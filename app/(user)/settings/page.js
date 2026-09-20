"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaUser, FaBell, FaLock, FaPlay, FaPalette, FaTrash, FaSave, 
  FaSpinner, FaCheck, FaEyeSlash
} from "react-icons/fa";
import { useUserInfoContext } from "@/context/UserInfoContext";
import { toast } from "react-toastify";

const Settings = () => {
  const { userInfo, isUserLoggedIn, loading: userLoading, updateProfile, logout } = useUserInfoContext();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Profile Settings
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  // Notification Settings
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Theme
  const [theme, setTheme] = useState("dark");

  // Ad Settings
  const [adsEnabled, setAdsEnabled] = useState(true);

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Load user settings
  useEffect(() => {
    if (userInfo) {
      setDisplayName(userInfo.name || "");
      setDescription(userInfo.description || "");
      setNotifEnabled(userInfo.notifyEnabled ?? true);
      setTheme(userInfo.theme || "dark");
      setAdsEnabled(userInfo.adsEnabled ?? true);
    }
  }, [userInfo]);

  const handleSaveProfile = async () => {
    if (!userInfo?.id) return;
    
    setSaving(true);
    const result = await updateProfile({
      name: displayName,
      description,
    });
    
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    if (!userInfo?.id) return;
    
    setSaving(true);
    const result = await updateProfile({ notifyEnabled: notifEnabled });
    
    if (result.success) {
      toast.success("Notification preferences saved!");
    } else {
      toast.error("Failed to save preferences");
    }
    setSaving(false);
  };

  const handleSaveAds = async () => {
    if (!userInfo?.id) return;
    
    setSaving(true);
    const result = await updateProfile({ adsEnabled });
    
    if (result.success) {
      toast.success("Ad preferences saved!");
    } else {
      toast.error("Failed to save ad preferences");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    // In a real app, you'd call an API to delete the account
    toast.error("Account deletion is disabled for safety. Contact support.");
    setShowDeleteModal(false);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isUserLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Please sign in to access settings</p>
      </div>
    );
  }

  const tabs = [
    { id: "profile", icon: FaUser, label: "Profile" },
    { id: "notifications", icon: FaBell, label: "Notifications" },
    { id: "ads", icon: FaEyeSlash, label: "Ads" },
    { id: "appearance", icon: FaPalette, label: "Appearance" },
    { id: "account", icon: FaTrash, label: "Account" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-[#231f2c] rounded-xl p-2 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-[#2d283a]"
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="bg-[#231f2c] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#17151e] border border-[#39374b] rounded-xl text-white 
                             focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={userInfo?.email || ""}
                    disabled
                    className="w-full px-4 py-3 bg-[#17151e] border border-[#39374b] rounded-xl text-slate-400 
                             cursor-not-allowed"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Bio</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#17151e] border border-[#39374b] rounded-xl text-white 
                             placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl 
                           hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="bg-[#231f2c] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#39374b]/50">
                  <div>
                    <p className="text-white">Enable Notifications</p>
                    <p className="text-sm text-slate-400">Receive notifications for replies and mentions</p>
                  </div>
                  <ToggleSwitch
                    enabled={notifEnabled}
                    onChange={() => setNotifEnabled(!notifEnabled)}
                  />
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl 
                           hover:bg-blue-600 transition-colors disabled:opacity-50 mt-4"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* Ad Settings */}
          {activeTab === "ads" && (
            <div className="bg-[#231f2c] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Ad Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#39374b]/50">
                  <div>
                    <p className="text-white">Show Ads</p>
                    <p className="text-sm text-slate-400">Toggle to show or hide advertisements on the site</p>
                  </div>
                  <ToggleSwitch
                    enabled={adsEnabled}
                    onChange={() => setAdsEnabled(!adsEnabled)}
                  />
                </div>

                <div className="bg-[#17151e] rounded-xl p-4 mt-4">
                  <p className="text-slate-300 text-sm">
                    Disabling ads helps provide a cleaner viewing experience. However, ads help keep YourHentaiTV free for everyone. Consider keeping them enabled!
                  </p>
                </div>

                <button
                  onClick={handleSaveAds}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl 
                           hover:bg-blue-600 transition-colors disabled:opacity-50 mt-4"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>Save Ad Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <div className="bg-[#231f2c] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>
              
              <div className="space-y-4">
                <p className="text-slate-400 mb-4">Theme selection coming soon!</p>
                
                <div className="grid grid-cols-3 gap-4">
                  {["dark", "light", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        theme === t
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-[#39374b] bg-[#17151e]"
                      }`}
                    >
                      <p className="text-white capitalize text-center">{t}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Log Out */}
              <div className="bg-[#231f2c] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Log Out</h2>
                <button
                  onClick={() => logout()}
                  className="px-6 py-3 bg-[#39374b] text-white rounded-xl hover:bg-[#484460] transition-colors"
                >
                  Log Out
                </button>
              </div>

              {/* Delete Account */}
              <div className="bg-[#231f2c] rounded-xl p-6 border border-red-500/30">
                <h2 className="text-xl font-semibold text-white mb-2">Delete Account</h2>
                <p className="text-slate-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Delete Account">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-slate-300">This action cannot be undone!</p>
            </div>
            <p className="text-slate-400">
              Type <span className="text-white font-bold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 bg-[#17151e] border border-[#39374b] rounded-xl text-white 
                       focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-[#39374b] text-white rounded-xl hover:bg-[#484460] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 
                         transition-colors disabled:opacity-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Background Effects */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[20%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] pointer-events-none"></div>
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      enabled ? "bg-blue-500" : "bg-[#39374b]"
    }`}
  >
    <motion.div
      className="absolute top-1 w-4 h-4 rounded-full bg-white"
      animate={{ left: enabled ? 28 : 4 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

// Modal Component
const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60" onClick={onClose} />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative bg-[#17151e] rounded-2xl w-full max-w-md p-6 border border-[#39374b]"
    >
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  </div>
);

export default Settings;
