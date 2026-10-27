// Real-Time Firebase Cloud Squad & User Sync Engine for ACKERMAN PROGRESS
// Directly powered by https://ackerman-gym-default-rtdb.firebaseio.com

import { getTelegramUser } from './telegram';
import { generateProfileCode, parseProfileCode } from './storage';

export const FIREBASE_RTDB_URL = 'https://ackerman-gym-default-rtdb.firebaseio.com';

/**
 * Sync current user's public leaderboard stats to Firebase Realtime Database
 */
export const syncMyProfileToCloud = async (myStats) => {
  try {
    const tgUser = getTelegramUser();
    // Unique user ID per Telegram account
    const userId = tgUser?.id ? String(tgUser.id) : (myStats.id || 'user_me');

    const payload = {
      id: userId,
      name: myStats.name || tgUser?.first_name || 'Атлет',
      username: tgUser?.username || '',
      streak: Number(myStats.streak) || 0,
      bench: Number(myStats.bench) || 0,
      squat: Number(myStats.squat) || 0,
      bicep: Number(myStats.bicep) || 0,
      workouts: Number(myStats.workouts) || 0,
      avatarId: myStats.avatarId || 'titan',
      lastActive: Date.now()
    };

    const targetEndpoint = `${FIREBASE_RTDB_URL}/squad/${userId}.json`;
    const res = await fetch(targetEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return { success: true, user: payload };
    }
  } catch (err) {
    console.warn('Firebase squad sync warning (offline):', err);
  }
  return { success: false };
};

/**
 * Fetch the real-time live squad leaderboard from Firebase
 */
export const fetchCloudSquad = async () => {
  try {
    const targetEndpoint = `${FIREBASE_RTDB_URL}/squad.json`;
    const res = await fetch(targetEndpoint, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const tgUser = getTelegramUser();
        const currentId = tgUser?.id ? String(tgUser.id) : 'user_me';

        // Convert object into array of members
        const list = Object.values(data).map((item) => ({
          ...item,
          isMe: String(item.id) === currentId
        }));
        return list;
      }
    }
  } catch (err) {
    console.warn('Firebase squad fetch warning:', err);
  }
  return null;
};

/**
 * Save full personal progress backup in Firebase per user
 */
export const saveUserCloudData = async (userId, fullData) => {
  try {
    const targetEndpoint = `${FIREBASE_RTDB_URL}/users/${userId}.json`;
    await fetch(targetEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData)
    });
  } catch (e) {
    console.warn('Firebase user backup warning:', e);
  }
};

/**
 * Load full personal progress from Firebase per user
 */
export const loadUserCloudData = async (userId) => {
  try {
    const targetEndpoint = `${FIREBASE_RTDB_URL}/users/${userId}.json`;
    const res = await fetch(targetEndpoint, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Firebase user restore warning:', e);
  }
  return null;
};

/**
 * Generate viral Telegram Share Link with start parameter
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
