// Cloud Squad Synchronization Engine for ACKERMAN PROGRESS
// Real-time online multiplayer leaderboard for Telegram Mini Apps

import { getTelegramUser } from './telegram';
import { generateProfileCode, parseProfileCode } from './storage';

// Default Firebase / Cloud Endpoint for ACKERMAN PROGRESS SQUAD
// Can be customized via localStorage or Settings
const DEFAULT_FIREBASE_URL = 'https://ackerman-progress-default-rtdb.firebaseio.com';
const STORAGE_CLOUD_URL_KEY = 'ackerman_cloud_db_url';

export const getCloudDbUrl = () => {
  return localStorage.getItem(STORAGE_CLOUD_URL_KEY) || DEFAULT_FIREBASE_URL;
};

export const setCloudDbUrl = (url) => {
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_CLOUD_URL_KEY, url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem(STORAGE_CLOUD_URL_KEY);
  }
};

/**
 * Sync current user's stats to the shared cloud database
 */
export const syncMyProfileToCloud = async (myStats) => {
  try {
    const tgUser = getTelegramUser();
    const userId = tgUser?.id ? String(tgUser.id) : (myStats.id || 'user_me');
    const cloudUrl = getCloudDbUrl();

    const payload = {
      id: userId,
      name: myStats.name || tgUser?.first_name || 'Атлет',
      username: tgUser?.username || '',
      streak: Number(myStats.streak) || 1,
      bench: Number(myStats.bench) || 0,
      squat: Number(myStats.squat) || 0,
      bicep: Number(myStats.bicep) || 0,
      workouts: Number(myStats.workouts) || 1,
      avatarId: myStats.avatarId || 'titan',
      lastActive: Date.now()
    };

    const targetEndpoint = `${cloudUrl}/squad/${userId}.json`;
    const res = await fetch(targetEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return { success: true, user: payload };
    }
  } catch (err) {
    console.warn('Cloud sync error (will continue offline):', err);
  }
  return { success: false };
};

/**
 * Fetch live squad leaderboard from cloud
 */
export const fetchCloudSquad = async () => {
  try {
    const cloudUrl = getCloudDbUrl();
    const targetEndpoint = `${cloudUrl}/squad.json`;
    const res = await fetch(targetEndpoint, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const tgUser = getTelegramUser();
        const currentId = tgUser?.id ? String(tgUser.id) : 'user_me';

        // Convert object to array
        const list = Object.values(data).map((item) => ({
          ...item,
          isMe: String(item.id) === currentId
        }));
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud squad:', err);
  }
  return null;
};

/**
 * Generate viral Telegram Share Link with start parameter
 * When a friend clicks this link inside Telegram, they automatically join the Squad!
 */
export const generateTelegramInviteLink = (myStats) => {
  const code = generateProfileCode(myStats).replace('AP#', '');
  return `https://t.me/ackerman_gym_bot?startapp=join_${code}`;
};

/**
 * Check if the app was opened via an invite link (start_param)
 */
export const checkTelegramStartParam = () => {
  try {
    const tg = window.Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;
    if (startParam && startParam.startsWith('join_')) {
      const base64 = startParam.substring(5);
      const friendData = parseProfileCode('AP#' + base64);
      return friendData;
    }
  } catch (e) {
    console.warn('Error reading start_param:', e);
  }
  return null;
};
