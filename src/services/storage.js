// App Data Storage & Cloud Sync Engine for ACKERMAN PROGRESS
import { cloudStorage } from './telegram';

const STORAGE_KEYS = {
  TASKS: 'ackerman_tasks_v2',
  PROGRAMS: 'ackerman_programs_v2',
  HISTORY: 'ackerman_history_v2',
  ACTIVE_WORKOUT: 'ackerman_active_workout_v2',
  RECORDS: 'ackerman_records_v2'
};

// Initial default workout programs (Gymshark / Hevy style)
// Note: Each exercise directly tracks muscle group and last recorded performance (weight & reps)
export const DEFAULT_PROGRAMS = [
  {
    id: 'prog-split',
    name: 'Спліт: Сила & Маса',
    description: 'Основна програма для прогресивної гіпертрофії',
    days: [
      {
        id: 'day-1',
        name: 'День 1: Груди та Тріцепс',
        exercises: [
          { id: 'ex-1', name: 'Жим штанги лежачи', muscle: 'Груди', lastWeight: 80, lastReps: 8 },
          { id: 'ex-2', name: 'Жим гантелей на похилій', muscle: 'Верх грудей', lastWeight: 26, lastReps: 10 },
          { id: 'ex-3', name: 'Відтискання на брусах', muscle: 'Груди / Тріцепс', lastWeight: 15, lastReps: 10 },
          { id: 'ex-4', name: 'Французький жим', muscle: 'Тріцепс', lastWeight: 35, lastReps: 12 },
          { id: 'ex-5', name: 'Розгинання на блоці', muscle: 'Тріцепс', lastWeight: 30, lastReps: 12 }
        ]
      },
      {
        id: 'day-2',
        name: 'День 2: Спина та Біцепс',
        exercises: [
          { id: 'ex-6', name: 'Підтягування з вагою', muscle: 'Широчайші', lastWeight: 10, lastReps: 8 },
          { id: 'ex-7', name: 'Тяга штанги в нахилі', muscle: 'Спина', lastWeight: 75, lastReps: 8 },
          { id: 'ex-8', name: 'Тяга блоку до пояса', muscle: 'Середина спини', lastWeight: 65, lastReps: 10 },
          { id: 'ex-9', name: 'Підйом штанги на біцепс', muscle: 'Біцепс', lastWeight: 35, lastReps: 10 },
          { id: 'ex-10', name: 'Молотки з гантелями', muscle: 'Брахіаліс', lastWeight: 16, lastReps: 12 }
        ]
      },
      {
        id: 'day-3',
        name: 'День 3: Ноги та Плечі',
        exercises: [
          { id: 'ex-11', name: 'Присідання зі штангою', muscle: 'Ноги', lastWeight: 100, lastReps: 8 },
          { id: 'ex-12', name: 'Жим ногами в тренажері', muscle: 'Квадрицепси', lastWeight: 180, lastReps: 10 },
          { id: 'ex-13', name: 'Мертва тяга', muscle: 'Біцепс стегна', lastWeight: 80, lastReps: 10 },
          { id: 'ex-14', name: 'Армійський жим стоячи', muscle: 'Плечі', lastWeight: 50, lastReps: 8 },
          { id: 'ex-15', name: 'Махи гантелями в сторони', muscle: 'Середня дельта', lastWeight: 12, lastReps: 14 }
        ]
      }
    ]
  },
  {
    id: 'prog-fullbody',
    name: 'Full Body (Базове тренування)',
    description: 'Ефективне пропрацювання всього тіла',
    days: [
      {
        id: 'fb-1',
        name: 'День А: Базовий комплекс',
        exercises: [
          { id: 'fb-1', name: 'Присідання зі штангою', muscle: 'Ноги', lastWeight: 90, lastReps: 8 },
          { id: 'fb-2', name: 'Жим штанги лежачи', muscle: 'Груди', lastWeight: 80, lastReps: 8 },
          { id: 'fb-3', name: 'Тяга штанги в нахилі', muscle: 'Спина', lastWeight: 70, lastReps: 8 },
          { id: 'fb-4', name: 'Армійський жим', muscle: 'Плечі', lastWeight: 45, lastReps: 10 }
        ]
      }
    ]
  }
];

export const DEFAULT_TASKS = [
  {
    id: 't-1',
    text: 'Силове тренування (Груди + Тріцепс)',
    date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'high',
    category: 'gym',
    reminderTime: '17:30',
    hasReminder: true
  },
  {
    id: 't-2',
    text: 'Випити норму води (2.5л) та прийняти вітаміни',
    date: new Date().toISOString().split('T')[0],
    completed: true,
    priority: 'normal',
    category: 'goal',
    reminderTime: '12:00',
    hasReminder: false
  },
  {
    id: 't-3',
    text: 'Підготувати форму та шейкер на вечір',
    date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'normal',
    category: 'work',
    reminderTime: '16:00',
    hasReminder: true
  }
];

export const DEFAULT_HISTORY = [
  {
    id: 'hist-1',
    programName: 'Спліт: Сила & Маса',
    dayName: 'День 1: Груди та Тріцепс',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 3120,
    stats: { totalSets: 12, totalReps: 104, totalTonnage: 3680 },
    exercises: [
      {
        name: 'Жим штанги лежачи',
        sets: [
          { setNum: 1, weight: 60, reps: 10, completed: true },
          { setNum: 2, weight: 75, reps: 8, completed: true },
          { setNum: 3, weight: 80, reps: 8, completed: true }
        ]
      },
      {
        name: 'Жим гантелей на похилій',
        sets: [
          { setNum: 1, weight: 24, reps: 10, completed: true },
          { setNum: 2, weight: 26, reps: 8, completed: true }
        ]
      }
    ]
  }
];

// Personal Records / Best Lifts (Календар жимів та рекордів)
export const DEFAULT_RECORDS = [
  { id: 'rec-1', exercise: 'Жим штанги лежачи', weight: 95, reps: 1, date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0] },
  { id: 'rec-2', exercise: 'Присідання зі штангою', weight: 120, reps: 1, date: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString().split('T')[0] },
  { id: 'rec-3', exercise: 'Станова тяга', weight: 140, reps: 1, date: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString().split('T')[0] },
  { id: 'rec-4', exercise: 'Армійський жим', weight: 60, reps: 1, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0] }
];

export const loadData = async () => {
  try {
    const rawTasks = await cloudStorage.get(STORAGE_KEYS.TASKS);
    const rawPrograms = await cloudStorage.get(STORAGE_KEYS.PROGRAMS);
    const rawHistory = await cloudStorage.get(STORAGE_KEYS.HISTORY);
    const rawActive = await cloudStorage.get(STORAGE_KEYS.ACTIVE_WORKOUT);
    const rawRecords = await cloudStorage.get(STORAGE_KEYS.RECORDS);

    return {
      tasks: rawTasks ? JSON.parse(rawTasks) : DEFAULT_TASKS,
      programs: rawPrograms ? JSON.parse(rawPrograms) : DEFAULT_PROGRAMS,
      history: rawHistory ? JSON.parse(rawHistory) : DEFAULT_HISTORY,
      activeWorkout: rawActive ? JSON.parse(rawActive) : null,
      records: rawRecords ? JSON.parse(rawRecords) : DEFAULT_RECORDS
    };
  } catch (e) {
    console.error('Error loading data:', e);
    return {
      tasks: DEFAULT_TASKS,
      programs: DEFAULT_PROGRAMS,
      history: DEFAULT_HISTORY,
      activeWorkout: null,
      records: DEFAULT_RECORDS
    };
  }
};

export const saveTasks = async (tasks) => {
  await cloudStorage.set(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const savePrograms = async (programs) => {
  await cloudStorage.set(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
};

export const saveHistory = async (history) => {
  await cloudStorage.set(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

export const saveActiveWorkout = async (activeWorkout) => {
  await cloudStorage.set(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
};

export const saveRecords = async (records) => {
  await cloudStorage.set(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

// Helper: Find last performance for an exercise
export const getLastExercisePerformance = (exerciseName, history = [], programs = []) => {
  // First check history
  if (history && history.length) {
    for (let i = history.length - 1; i >= 0; i--) {
      const workout = history[i];
      const foundEx = workout.exercises?.find(
        (e) => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
      );
      if (foundEx && foundEx.sets && foundEx.sets.length > 0) {
        const completed = foundEx.sets.filter((s) => s.completed);
        if (completed.length) {
          return {
            date: workout.date,
            sets: completed,
            lastWeight: completed[completed.length - 1].weight,
            lastReps: completed[completed.length - 1].reps
          };
        }
      }
    }
  }

  // Fallback: check stored default in programs
  for (const prog of programs) {
    for (const d of prog.days || []) {
      const ex = d.exercises?.find(
        (e) => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
      );
      if (ex && ex.lastWeight) {
        return {
          date: null,
          sets: [{ weight: ex.lastWeight, reps: ex.lastReps || 10 }],
          lastWeight: ex.lastWeight,
          lastReps: ex.lastReps || 10
        };
      }
    }
  }

  return null;
};
