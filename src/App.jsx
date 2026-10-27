import React, { useState, useEffect } from 'react';
import { 
  initTelegramApp, haptic 
} from './services/telegram';
import { 
  loadData, saveTasks, savePrograms, saveHistory, saveActiveWorkout,
  DEFAULT_PROGRAMS, DEFAULT_TASKS, DEFAULT_HISTORY 
} from './services/storage';

import { HeaderLogo } from './components/HeaderLogo';
import { Navbar } from './components/Navbar';
import { PlannerTab } from './components/PlannerTab';
import { WorkoutsTab } from './components/WorkoutsTab';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { ProgressTab } from './components/ProgressTab';
import { SettingsTab } from './components/SettingsTab';
import { RestTimer } from './components/RestTimer';

export default function App() {
  const [currentTab, setTab] = useState('planner');
  const [isReady, setIsReady] = useState(false);

  // Core App Data
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [activeWorkout, setActiveWorkout] = useState(null);

  // Floating Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(null);

  // Initialize Telegram & Load Saved Data
  useEffect(() => {
    initTelegramApp();

    loadData().then((data) => {
      if (data.tasks) setTasks(data.tasks);
      if (data.programs) setPrograms(data.programs);
      if (data.history) setHistory(data.history);
      if (data.activeWorkout) setActiveWorkout(data.activeWorkout);
      setIsReady(true);
    });
  }, []);

  // Save changes automatically (dual persistence: LocalStorage + Telegram CloudStorage)
  useEffect(() => {
    if (!isReady) return;
    saveTasks(tasks);
  }, [tasks, isReady]);

  useEffect(() => {
    if (!isReady) return;
    savePrograms(programs);
  }, [programs, isReady]);

  useEffect(() => {
    if (!isReady) return;
    saveHistory(history);
  }, [history, isReady]);

  useEffect(() => {
    if (!isReady) return;
    saveActiveWorkout(activeWorkout);
  }, [activeWorkout, isReady]);

  // Start Workout Handler
  const handleStartWorkout = (program, day) => {
    haptic.impact('heavy');
    const newSession = {
      id: 'session_' + Date.now(),
      programId: program.id,
      programName: program.name,
      dayId: day.id,
      dayName: day.name,
      startedAt: new Date().toISOString(),
      exercises: day.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        sets: Array.from({ length: ex.targetSets || 3 }).map((_, idx) => ({
          setNum: idx + 1,
          weight: 20,
          reps: 10,
          completed: false
        }))
      }))
    };

    setActiveWorkout(newSession);
    setTab('active');
  };

  // Finish Workout Handler
  const handleFinishWorkout = (finishedWorkout) => {
    haptic.success();
    const updatedHistory = [finishedWorkout, ...history];
    setHistory(updatedHistory);
    setActiveWorkout(null);
    setRestTimerSeconds(null);
    setTab('progress');
  };

  const handleTriggerRestTimer = (secs = 90) => {
    setRestTimerSeconds(secs);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-[#F3F4F6] antialiased">
      {/* Dynamic Athletic Header with SVG Logo */}
      <HeaderLogo />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'planner' && (
          <PlannerTab tasks={tasks} setTasks={setTasks} />
        )}

        {currentTab === 'workouts' && (
          <WorkoutsTab
            programs={programs}
            setPrograms={setPrograms}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentTab === 'active' && (
          <ActiveWorkoutModal
            activeWorkout={activeWorkout}
            setActiveWorkout={setActiveWorkout}
            history={history}
            onFinishWorkout={handleFinishWorkout}
            onTriggerRestTimer={handleTriggerRestTimer}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressTab history={history} programs={programs} />
        )}

        {currentTab === 'settings' && (
          <SettingsTab
            tasks={tasks}
            setTasks={setTasks}
            programs={programs}
            setPrograms={setPrograms}
            history={history}
            setHistory={setHistory}
          />
        )}
      </main>

      {/* Floating Rest Timer */}
      {restTimerSeconds !== null && (
        <RestTimer
          initialSeconds={restTimerSeconds}
          onFinish={() => setRestTimerSeconds(null)}
          onClose={() => setRestTimerSeconds(null)}
        />
      )}

      {/* Telegram-style Athletic Bottom Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        hasActiveWorkout={!!activeWorkout}
      />
    </div>
  );
}
