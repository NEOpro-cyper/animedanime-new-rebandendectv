// XP and Level System

// Calculate level from XP (100 XP per level)
export const calculateLevel = (xp) => {
  return Math.floor((xp || 0) / 100) + 1;
};

// Get progress to next level (0-100%)
export const getLevelProgress = (xp) => {
  return (xp || 0) % 100;
};

// Get level title
export const getLevelTitle = (level) => {
  if (level >= 50) return 'Legendary';
  if (level >= 40) return 'Elite';
  if (level >= 30) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 10) return 'Advanced';
  if (level >= 5) return 'Intermediate';
  return 'Beginner';
};

// Get level badge color (gradient)
export const getLevelBadgeColor = (level) => {
  if (level >= 50) return 'from-purple-500 to-pink-500';
  if (level >= 40) return 'from-red-500 to-orange-500';
  if (level >= 30) return 'from-orange-500 to-yellow-500';
  if (level >= 20) return 'from-blue-500 to-purple-500';
  if (level >= 10) return 'from-green-500 to-blue-500';
  if (level >= 5) return 'from-cyan-500 to-green-500';
  return 'from-gray-500 to-gray-400';
};

// XP rewards for actions
export const XP_REWARDS = {
  WATCH_MOVIE: 10,
  WATCH_EPISODE: 5,
  COMMENT: 10,
  COMMENT_REPLY: 5,
  CREATE_THREAD: 20,
  THREAD_REPLY: 5,
  LIKE_CONTENT: 1,
  SHARE: 15,
  SEARCH: 1,
  DAILY_LOGIN: 5,
};

// Achievements
export const ACHIEVEMENTS = [
  { id: 'first_comment', name: 'First Words', description: 'Posted your first comment', icon: '💬', xpBonus: 50, requirement: { type: 'comments', count: 1 } },
  { id: 'movie_buff', name: 'Movie Buff', description: 'Watched 10 movies', icon: '🎬', xpBonus: 100, requirement: { type: 'movies_watched', count: 10 } },
  { id: 'binge_watcher', name: 'Binge Watcher', description: 'Watched 50 episodes', icon: '📺', xpBonus: 150, requirement: { type: 'episodes_watched', count: 50 } },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Created 5 threads', icon: '🦋', xpBonus: 100, requirement: { type: 'threads_created', count: 5 } },
  { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐', xpBonus: 50, requirement: { type: 'level', count: 5 } },
  { id: 'level_10', name: 'Veteran', description: 'Reached level 10', icon: '🏆', xpBonus: 100, requirement: { type: 'level', count: 10 } },
  { id: 'level_25', name: 'Champion', description: 'Reached level 25', icon: '👑', xpBonus: 250, requirement: { type: 'level', count: 25 } },
  { id: 'level_50', name: 'Legend', description: 'Reached level 50', icon: '💎', xpBonus: 500, requirement: { type: 'level', count: 50 } },
];
