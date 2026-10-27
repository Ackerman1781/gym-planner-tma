// Storage, Cloud Sync & Squad Ranking Engine for ACKERMAN PROGRESS
import { cloudStorage, getTelegramUser } from './telegram';

const STORAGE_KEYS = {
  TASKS: 'ackerman_tasks_v3',
  PROGRAMS: 'ackerman_programs_v3',
  SQUAD: 'ackerman_squad_v3',
  PROFILE: 'ackerman_profile_v3',
  RECORDS: 'ackerman_records_v3',
  HISTORY: 'ackerman_history_v3',
  ACTIVE_WORKOUT: 'ackerman_active_v3'
};

// 1. Initial starter split with 3 exercises (Clean: 0 stats for brand new users)
export const DEFAULT_PROGRAMS = [
  {
    id: 'prog-demo',
    name: 'Спліт: Сила & Маса',
    description: 'Атлетичний комплекс для гіпертрофії та прогресивної ваги',
    days: [
      {
        id: 'day-1',
        name: 'День 1: Груди та Руки',
        exercises: [
          { id: 'ex-1', name: 'Жим штанги лежачи', muscle: 'Груди', lastWeight: 0, lastReps: 0 },
          { id: 'ex-2', name: 'Жим гантелей на похилій', muscle: 'Верх грудей', lastWeight: 0, lastReps: 0 },
          { id: 'ex-3', name: 'Підйом штанги на біцепс', muscle: 'Руки', lastWeight: 0, lastReps: 0 }
        ]
      },
      {
        id: 'day-2',
        name: 'День 2: Спина та Плечі',
        exercises: [
          { id: 'ex-4', name: 'Тяга штанги в нахилі', muscle: 'Спина', lastWeight: 0, lastReps: 0 },
          { id: 'ex-5', name: 'Армійський жим стоячи', muscle: 'Плечі', lastWeight: 0, lastReps: 0 },
          { id: 'ex-6', name: 'Тяга блоку до грудей', muscle: 'Широчайші', lastWeight: 0, lastReps: 0 }
        ]
      },
      {
        id: 'day-3',
        name: 'День 3: Ноги та Кор',
        exercises: [
          { id: 'ex-7', name: 'Присідання зі штангою', muscle: 'Ноги', lastWeight: 0, lastReps: 0 },
          { id: 'ex-8', name: 'Румунська тяга', muscle: 'Біцепс стегна', lastWeight: 0, lastReps: 0 },
          { id: 'ex-9', name: 'Скручування з вагою', muscle: 'Прес', lastWeight: 0, lastReps: 0 }
        ]
      }
    ]
  }
];

// 2. Initial starter tasks (Clean tasks)
export const DEFAULT_TASKS = [
  {
    id: 't-1',
    text: 'Силове тренування (Груди + Руки)',
    date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'high',
    category: 'gym',
    reminderTime: '17:30',
    hasReminder: true
  },
  {
    id: 't-2',
    text: 'Випити норму води (2.5л) та вітаміни',
    date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'normal',
    category: 'work',
    reminderTime: '12:00',
    hasReminder: false
  }
];

// 3. Initial Squad Leaderboard (Clean: Only User with 0 stats at start)
export const DEFAULT_SQUAD = [
  {
    id: 'user_me',
    name: 'Атлет',
    isMe: true,
    streak: 0,
    bench: 0,
    squat: 0,
    bicep: 0,
    workouts: 0,
    avatarId: 'titan'
  }
];

export const DEFAULT_PROFILE = {
  nickname: '',
  avatarId: 'titan',
  soundEnabled: true
};

// 4. Initial Personal Records (Empty by default: user adds their own)
export const DEFAULT_RECORDS = [];

// 5. Initial History (Empty by default: records when workouts are finished)
export const DEFAULT_HISTORY = [];

// Helper to compute Rank according to requirements
export const getPlayerRank = (streak, isLeader = false) => {
  if (isLeader) return 'ACKERMAN BOSS';
  if (streak >= 21) return 'TITAN';
  if (streak >= 7) return 'PRO';
  return 'ROOKIE';
};

// Encode user stats to share code
export const generateProfileCode = (user) => {
  try {
    const payload = {
      v: 1,
      n: user.name || user.nickname || 'Athlete',
      s: user.streak || 1,
      b: user.bench || 80,
      sq: user.squat || 100,
      bi: user.bicep || 35,
      w: user.workouts || 10,
      a: user.avatarId || 'titan'
    };
    return 'AP#' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch (e) {
    return '';
  }
};

// Decode user stats from shared code
export const parseProfileCode = (codeStr) => {
  try {
    if (!codeStr || !codeStr.startsWith('AP#')) return null;
    const base64 = codeStr.substring(3).trim();
    const json = decodeURIComponent(escape(atob(base64)));
    const p = JSON.parse(json);
    if (!p.n) return null;
    return {
      id: 'friend_' + Date.now(),
      name: p.n,
      isMe: false,
      streak: Number(p.s) || 1,
      bench: Number(p.b) || 0,
      squat: Number(p.sq) || 0,
      bicep: Number(p.bi) || 0,
      workouts: Number(p.w) || 1,
      avatarId: p.a || 'titan'
    };
  } catch (e) {
    return null;
  }
};

// Load full state
export const loadData = async () => {
  try {
    const rawTasks = await cloudStorage.get(STORAGE_KEYS.TASKS);
    const rawPrograms = await cloudStorage.get(STORAGE_KEYS.PROGRAMS);
    const rawSquad = await cloudStorage.get(STORAGE_KEYS.SQUAD);
    const rawProfile = await cloudStorage.get(STORAGE_KEYS.PROFILE);
    const rawRecords = await cloudStorage.get(STORAGE_KEYS.RECORDS);
    const rawHistory = await cloudStorage.get(STORAGE_KEYS.HISTORY);
    const rawActive = await cloudStorage.get(STORAGE_KEYS.ACTIVE_WORKOUT);

    const tgUser = getTelegramUser();
    let initialProfile = rawProfile ? JSON.parse(rawProfile) : DEFAULT_PROFILE;
    if (tgUser?.first_name && !rawProfile) {
      initialProfile.nickname = tgUser.first_name;
    }

    let initialSquad = rawSquad ? JSON.parse(rawSquad) : DEFAULT_SQUAD;
    // Strip out legacy mock demo friends (Макс, Данило, Олег) and reset old mock numbers
    initialSquad = initialSquad
      .filter((m) => m.id !== 'friend_1' && m.id !== 'friend_2' && m.id !== 'friend_3')
      .map((m) => {
        if (m.isMe && (m.streak === 14 || m.workouts === 32)) {
          return {
            ...m,
            name: initialProfile.nickname || m.name,
            avatarId: initialProfile.avatarId,
            streak: 0,
            workouts: 0,
            bench: 0,
            squat: 0,
            bicep: 0
          };
        }
        return m.isMe ? { ...m, name: initialProfile.nickname || m.name, avatarId: initialProfile.avatarId } : m;
      });

    if (initialSquad.length === 0) {
      initialSquad = DEFAULT_SQUAD;
    }

    // Clear legacy mock records
    let parsedRecords = rawRecords ? JSON.parse(rawRecords) : DEFAULT_RECORDS;
    if (parsedRecords && parsedRecords.length && parsedRecords[0]?.id === 'rec-1') {
      parsedRecords = [];
    }

    // Clear legacy mock history
    let parsedHistory = rawHistory ? JSON.parse(rawHistory) : DEFAULT_HISTORY;
    if (parsedHistory && parsedHistory.length && parsedHistory[0]?.id === 'hist-1') {
      parsedHistory = [];
    }

    return {
      tasks: rawTasks ? JSON.parse(rawTasks) : DEFAULT_TASKS,
      programs: rawPrograms ? JSON.parse(rawPrograms) : DEFAULT_PROGRAMS,
      squad: initialSquad,
      profile: initialProfile,
      records: parsedRecords,
      history: parsedHistory,
      activeWorkout: rawActive ? JSON.parse(rawActive) : null
    };
  } catch (e) {
    console.error('Error loading data:', e);
    return {
      tasks: DEFAULT_TASKS,
      programs: DEFAULT_PROGRAMS,
      squad: DEFAULT_SQUAD,
      profile: DEFAULT_PROFILE,
      records: DEFAULT_RECORDS,
      history: DEFAULT_HISTORY,
      activeWorkout: null
    };
  }
};

export const saveTasks = async (tasks) => {
  await cloudStorage.set(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const savePrograms = async (programs) => {
  await cloudStorage.set(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
};

export const saveSquad = async (squad) => {
  await cloudStorage.set(STORAGE_KEYS.SQUAD, JSON.stringify(squad));
};

export const saveProfile = async (profile) => {
  await cloudStorage.set(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const saveRecords = async (records) => {
  await cloudStorage.set(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

export const saveHistory = async (history) => {
  await cloudStorage.set(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

export const saveActiveWorkout = async (activeWorkout) => {
  await cloudStorage.set(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
};
