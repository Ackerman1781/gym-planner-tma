// App Data Storage & Cloud Sync Engine
import { cloudStorage } from './telegram';

const STORAGE_KEYS = {
  TASKS: 'ironplan_tasks_v1',
  PROGRAMS: 'ironplan_programs_v1',
  HISTORY: 'ironplan_history_v1',
  ACTIVE_WORKOUT: 'ironplan_active_workout_v1',
  SETTINGS: 'ironplan_settings_v1'
};

// Initial default workout programs
export const DEFAULT_PROGRAMS = [
  {
    id: 'split-3',
    name: 'Трьохденний Спліт',
    description: 'Класичний силовий спліт для нарощування м’язової маси',
    days: [
      {
        id: 'day-1',
        name: 'День 1: Груди + Тріцепс',
        exercises: [
          { id: 'ex-1', name: 'Жим штанги лежачи', targetSets: 4, targetReps: '8-10', muscle: 'Груди' },
          { id: 'ex-2', name: 'Жим гантелей на похилій лаві', targetSets: 3, targetReps: '10-12', muscle: 'Верх грудей' },
          { id: 'ex-3', name: 'Відтискання на брусах', targetSets: 3, targetReps: '10-12', muscle: 'Груди / Тріцепс' },
          { id: 'ex-4', name: 'Французький жим лежачи', targetSets: 3, targetReps: '12', muscle: 'Тріцепс' },
          { id: 'ex-5', name: 'Розгинання рук на блоці', targetSets: 3, targetReps: '12-15', muscle: 'Тріцепс' }
        ]
      },
      {
        id: 'day-2',
        name: 'День 2: Спина + Біцепс',
        exercises: [
          { id: 'ex-6', name: 'Підтягування широким хватом', targetSets: 4, targetReps: '8-10', muscle: 'Широчайші' },
          { id: 'ex-7', name: 'Тяга штанги в нахилі', targetSets: 4, targetReps: '8-10', muscle: 'Спина' },
          { id: 'ex-8', name: 'Тяга горизонтального блоку', targetSets: 3, targetReps: '10-12', muscle: 'Середина спини' },
          { id: 'ex-9', name: 'Підйом штанги на біцепс стоячи', targetSets: 3, targetReps: '10-12', muscle: 'Біцепс' },
          { id: 'ex-10', name: 'Молотки з гантелями', targetSets: 3, targetReps: '12', muscle: 'Брахіаліс / Біцепс' }
        ]
      },
      {
        id: 'day-3',
        name: 'День 3: Ноги + Плечі',
        exercises: [
          { id: 'ex-11', name: 'Присідання зі штангою', targetSets: 4, targetReps: '8-10', muscle: 'Квадрицепси / Сідниці' },
          { id: 'ex-12', name: 'Жим ногами в тренажері', targetSets: 3, targetReps: '10-12', muscle: 'Ноги' },
          { id: 'ex-13', name: 'Мертва тяга з гантелями', targetSets: 3, targetReps: '10-12', muscle: 'Біцепс стегна' },
          { id: 'ex-14', name: 'Армійський жим стоячи', targetSets: 4, targetReps: '8-10', muscle: 'Плечі' },
          { id: 'ex-15', name: 'Махи гантелями в сторони', targetSets: 4, targetReps: '12-15', muscle: 'Середня дельта' }
        ]
      }
    ]
  },
  {
    id: 'full-body',
    name: 'Full Body (Все тіло)',
    description: 'Ідеально для тренувань 2-3 рази на тиждень',
    days: [
      {
        id: 'fb-1',
        name: 'День А: Базовий',
        exercises: [
          { id: 'fb-ex-1', name: 'Присідання зі штангою', targetSets: 4, targetReps: '8-10', muscle: 'Ноги' },
          { id: 'fb-ex-2', name: 'Жим штанги лежачи', targetSets: 4, targetReps: '8-10', muscle: 'Груди' },
          { id: 'fb-ex-3', name: 'Тяга штанги в нахилі', targetSets: 4, targetReps: '8-10', muscle: 'Спина' },
          { id: 'fb-ex-4', name: 'Армійський жим', targetSets: 3, targetReps: '10', muscle: 'Плечі' },
          { id: 'fb-ex-5', name: 'Підйом на біцепс', targetSets: 3, targetReps: '12', muscle: 'Біцепс' }
        ]
      }
    ]
  }
];

export const DEFAULT_TASKS = [
  {
    id: 't-1',
    text: 'Тренування в залі (День 1)',
    date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'high',
    category: 'gym'
  },
  {
    id: 't-2',
    text: 'Випити 2.5 л води за день',
    date: new Date().toISOString().split('T')[0],
    completed: true,
    priority: 'normal',
    category: 'goal'
  },
  {
    id: 't-3',
    text: 'Скласти розклад на завтра',
    date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'normal',
    category: 'work'
  }
];

// Seed history so user immediately has previous stats and "Як минулого разу" button works!
export const DEFAULT_HISTORY = [
  {
    id: 'hist-1',
    programName: 'Трьохденний Спліт',
    dayName: 'День 1: Груди + Тріцепс',
    date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: 3200,
    exercises: [
      {
        name: 'Жим штанги лежачи',
        sets: [
          { setNum: 1, weight: 60, reps: 10, completed: true },
          { setNum: 2, weight: 70, reps: 10, completed: true },
          { setNum: 3, weight: 80, reps: 8, completed: true },
          { setNum: 4, weight: 85, reps: 6, completed: true }
        ]
      },
      {
        name: 'Жим гантелей на похилій лаві',
        sets: [
          { setNum: 1, weight: 22, reps: 12, completed: true },
          { setNum: 2, weight: 24, reps: 10, completed: true },
          { setNum: 3, weight: 26, reps: 8, completed: true }
        ]
      }
    ]
  }
];

export const loadData = async () => {
  try {
    const rawTasks = await cloudStorage.get(STORAGE_KEYS.TASKS);
    const rawPrograms = await cloudStorage.get(STORAGE_KEYS.PROGRAMS);
    const rawHistory = await cloudStorage.get(STORAGE_KEYS.HISTORY);
    const rawActive = await cloudStorage.get(STORAGE_KEYS.ACTIVE_WORKOUT);

    return {
      tasks: rawTasks ? JSON.parse(rawTasks) : DEFAULT_TASKS,
      programs: rawPrograms ? JSON.parse(rawPrograms) : DEFAULT_PROGRAMS,
      history: rawHistory ? JSON.parse(rawHistory) : DEFAULT_HISTORY,
      activeWorkout: rawActive ? JSON.parse(rawActive) : null
    };
  } catch (e) {
    console.error('Error loading data:', e);
    return {
      tasks: DEFAULT_TASKS,
      programs: DEFAULT_PROGRAMS,
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

export const saveHistory = async (history) => {
  await cloudStorage.set(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

export const saveActiveWorkout = async (activeWorkout) => {
  await cloudStorage.set(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
};

// Find last performance for an exercise
export const getLastExercisePerformance = (exerciseName, history = []) => {
  if (!history || !history.length) return null;
  
  // Search history backwards from newest to oldest
  for (let i = history.length - 1; i >= 0; i--) {
    const workout = history[i];
    const foundEx = workout.exercises?.find(
      (e) => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
    );
    if (foundEx && foundEx.sets && foundEx.sets.length > 0) {
      return {
        date: workout.date,
        sets: foundEx.sets.filter((s) => s.completed)
      };
    }
  }
  return null;
};
