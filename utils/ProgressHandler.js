// Save watch progress to localStorage and/or database
export const saveWatchProgress = (movieInfo, episodes, currentEpisode, currentSeason, userId) => {
  if (typeof window === 'undefined') return;

  try {
    const progressKey = 'yourhentaitv_watch_progress';
    const existingData = JSON.parse(localStorage.getItem(progressKey) || '[]');

    const progressEntry = {
      id: movieInfo?.id,
      movieTitle: movieInfo?.title,
      moviePoster: movieInfo?.poster,
      movieType: movieInfo?.type,
      season: currentSeason,
      episode: currentEpisode,
      progress: 0,
      duration: 0,
      updatedAt: new Date().toISOString(),
    };

    // Remove existing entry for this movie
    const filteredData = existingData.filter(item => item.id !== movieInfo?.id);

    // Add new entry at the beginning
    const newData = [progressEntry, ...filteredData].slice(0, 50);

    localStorage.setItem(progressKey, JSON.stringify(newData));

    // If user is logged in, also save to database
    if (userId) {
      saveWatchProgressToDB(progressEntry, userId);
    }
  } catch (error) {
    console.error('Error saving watch progress:', error);
  }
};

// Save to database via API
const saveWatchProgressToDB = async (progressEntry, userId) => {
  try {
    // The API expects `movieId` while the localStorage entry uses `id`
    await fetch('/api/watch-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...progressEntry,
        movieId: progressEntry.id,
      }),
    });
  } catch (error) {
    console.error('Error saving to database:', error);
  }
};

// Get watch progress from localStorage
export const getWatchProgress = (latestFirst = true, page = 1, limit = 20) => {
  if (typeof window === 'undefined') return [];

  try {
    const progressKey = 'yourhentaitv_watch_progress';
    const data = JSON.parse(localStorage.getItem(progressKey) || '[]');

    const startIndex = (page - 1) * limit;
    const paginatedData = data.slice(startIndex, startIndex + limit);

    return latestFirst ? paginatedData : paginatedData.reverse();
  } catch (error) {
    console.error('Error getting watch progress:', error);
    return [];
  }
};

// Get watch progress from database
export const getWatchProgressFromDB = async (userId, limit = 20) => {
  try {
    const res = await fetch(`/api/watch-progress?userId=${userId}&limit=${limit}`);
    const data = await res.json();
    return data.progress || [];
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
};

// Delete watch progress
export const deleteWatchProgress = async (movieId, userId) => {
  if (typeof window !== 'undefined') {
    const progressKey = 'yourhentaitv_watch_progress';
    const data = JSON.parse(localStorage.getItem(progressKey) || '[]');
    const filteredData = data.filter(item => item.id !== movieId);
    localStorage.setItem(progressKey, JSON.stringify(filteredData));
  }

  if (userId) {
    try {
      await fetch(`/api/watch-progress?movieId=${movieId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting from database:', error);
    }
  }
};

// Clear all watch progress
export const clearAllWatchProgress = async (userId) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('yourhentaitv_watch_progress');
  }

  if (userId) {
    try {
      await fetch('/api/watch-progress?clearAll=true', { method: 'DELETE' });
    } catch (error) {
      console.error('Error clearing from database:', error);
    }
  }
};
