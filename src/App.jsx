import React, { useState, useEffect } from 'react';
import { 
  initTelegramApp, haptic, playTimerChime, triggerBrowserNotification 
} from './services/telegram';
import { 
  loadData, saveTasks, savePrograms, saveSquad, saveProfile, 
  saveRecords, saveHistory, saveActiveWorkout,
  DEFAULT_PROGRAMS, DEFAULT_TASKS, DEFAULT_SQUAD, DEFAULT_PROFILE, 
  DEFAULT_RECORDS, DEFAULT_HISTORY 
} from './services/storage';

import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { PlannerTab } from './components/PlannerTab';
import { WorkoutsTab } from './components/WorkoutsTab';
import { TrainingTab } from './components/TrainingTab';
import { SquadTab } from './components/SquadTab';
import { SettingsModal } from './components/SettingsModal';
import { Bell, X } from 'lucide-react';
import { 
  syncMyProfileToCloud, fetchCloudSquad, checkTelegramStartParam 
} from './services/cloudSquad';

export default function App() {
  const [currentTab, setTab] = useState('home');
  const [isReady, setIsReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core App State
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);
  const [squad, setSquad] = useState(DEFAULT_SQUAD);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [activeWorkout, setActiveWorkout] = useState(null);

  // In-app reminder toast notification
  const [activeNotification, setActiveNotification] = useState(null);

  // User's current streak
  const userSquadEntry = squad.find((s) => s.isMe) || squad[0];
  const userStreak = userSquadEntry?.streak || 14;

  // Initialize Telegram & Load Saved Data
  useEffect(() => {
    initTelegramApp();

    loadData().then(async (data) => {
      if (data.tasks) setTasks(data.tasks);
      if (data.programs) setPrograms(data.programs);
      if (data.profile) setProfile(data.profile);
      if (data.records) setRecords(data.records);
      if (data.history) setHistory(data.history);
      if (data.activeWorkout) setActiveWorkout(data.activeWorkout);

      let squadList = data.squad || DEFAULT_SQUAD;

      // Check if user launched app via a friend's Telegram invite link
      const invitedFriend = checkTelegramStartParam();
      if (invitedFriend) {
        const exists = squadList.some(
          (f) => f.name.toLowerCase() === invitedFriend.name.toLowerCase()
        );
        if (!exists) {
          squadList = [...squadList, invitedFriend];
          haptic.success();
        }
      }

      setSquad(squadList);
      setIsReady(true);

      // Background cloud sync & fetch live leaderboard
      try {
        const myUser = squadList.find((s) => s.isMe) || squadList[0];
        await syncMyProfileToCloud(myUser);
        const cloudSquad = await fetchCloudSquad();
        if (cloudSquad && cloudSquad.length > 0) {
          setSquad(cloudSquad);
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
      }
    });
  }, []);

  // Dual Persistence: LocalStorage + Telegram CloudStorage
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
    saveSquad(squad);
  }, [squad, isReady]);

  useEffect(() => {
    if (!isReady) return;
    saveProfile(profile);
  }, [profile, isReady]);

  useEffect(() => {
    if (!isReady) return;
    saveRecords(records);
  }, [records, isReady]);

  useEffect(() => {
    if (!isReady) return;
    saveHistory(history);
  }, [history, isReady]);

  useEffect(() => {
    if (!isReady) return;
    saveActiveWorkout(activeWorkout);
  }, [activeWorkout, isReady]);

  // Live Real-Time Cloud Squad Polling (every 15s)
  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(async () => {
      try {
        const cloudSquad = await fetchCloudSquad();
        if (cloudSquad && cloudSquad.length > 0) {
          setSquad(cloudSquad);
        }
      } catch (e) {}
    }, 15000);
    return () => clearInterval(interval);
  }, [isReady]);

  // Periodic Reminder Checker (checks every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHH}:${currentMM}`;
      const todayStr = now.toISOString().split('T')[0];

      tasks.forEach((t) => {
        if (t.date === todayStr && t.hasReminder && !t.completed && t.reminderTime === timeStr) {
          // Trigger Notification
          triggerBrowserNotification('ACKERMAN PROGRESS // НАГАДУВАННЯ', t.text);
          if (profile.soundEnabled) {
            playTimerChime();
          }
          haptic.warning();
          setActiveNotification(t.text);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [tasks, profile.soundEnabled]);

  // Handle saving new Personal Record (automatically updates Bench in Squad & syncs to cloud)
  const handleSaveRecord = (newRecord) => {
    setRecords([newRecord, ...records]);
    // If Bench Press, update Squad
    const lowerName = newRecord.exercise.toLowerCase();
    if (lowerName.includes('жим') && (lowerName.includes('штанги') || lowerName.includes('лежачи'))) {
      const updatedSquad = squad.map((member) =>
        member.isMe ? { ...member, bench: newRecord.weight } : member
      );
      setSquad(updatedSquad);
      const myUser = updatedSquad.find((m) => m.isMe);
      if (myUser) syncMyProfileToCloud(myUser);
    }
  };

  const handleDeleteRecord = (id) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  // Start workout from Home or Workouts tab
  const handleStartWorkout = (program, day) => {
    setActiveWorkout({
      program,
      day,
      startedAt: new Date().toISOString()
    });
    setTab('training');
  };

  // Complete workout from Training tab
  const handleCompleteWorkout = (finishedWorkout, exerciseLogs, elapsedSeconds) => {
    // 1. Update last weights in programs
    const updatedPrograms = programs.map((prog) => {
      if (prog.id === finishedWorkout.program.id) {
        return {
          ...prog,
          days: prog.days.map((day) => {
            if (day.id === finishedWorkout.day.id) {
              return {
                ...day,
                exercises: day.exercises.map((ex) => {
                  const log = exerciseLogs[ex.id];
                  if (log) {
                    return {
                      ...ex,
                      lastWeight: log.todayWeight,
                      lastReps: log.todayReps
                    };
                  }
                  return ex;
                })
              };
            }
            return day;
          })
        };
      }
      return prog;
    });
    setPrograms(updatedPrograms);

    // 2. Add to history
    const histItem = {
      id: 'hist_' + Date.now(),
      programName: finishedWorkout.program.name,
      dayName: finishedWorkout.day.name,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exercises: Object.keys(exerciseLogs).map((k) => ({
        name: exerciseLogs[k].name,
        weight: exerciseLogs[k].todayWeight,
        reps: exerciseLogs[k].todayReps
      }))
    };
    setHistory([histItem, ...history]);

    // 3. Increment User's Streak and Workouts in Squad & sync to cloud
    const updatedSquad = squad.map((m) =>
      m.isMe ? { ...m, streak: (m.streak || 0) + 1, workouts: (m.workouts || 0) + 1 } : m
    );
    setSquad(updatedSquad);
    const myUser = updatedSquad.find((m) => m.isMe);
    if (myUser) syncMyProfileToCloud(myUser);
  };

  // Update profile from settings modal
  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
    const updatedSquad = squad.map((m) =>
      m.isMe ? { ...m, name: newProfile.nickname, avatarId: newProfile.avatarId } : m
    );
    setSquad(updatedSquad);
  };

  // Reset to starter defaults
  const handleResetDefaults = () => {
    if (confirm('Скинути всі дані додатку до початкових пресетів?')) {
      haptic.impact('heavy');
      setTasks(DEFAULT_TASKS);
      setPrograms(DEFAULT_PROGRAMS);
      setSquad(DEFAULT_SQUAD);
      setProfile(DEFAULT_PROFILE);
      setRecords(DEFAULT_RECORDS);
      setHistory(DEFAULT_HISTORY);
      setActiveWorkout(null);
      setIsSettingsOpen(false);
      haptic.success();
    }
  };

  // Export & Import JSON
  const handleExportJSON = () => {
    haptic.impact('heavy');
    const data = {
      version: 3,
      app: 'ACKERMAN_PROGRESS',
      exportedAt: new Date().toISOString(),
      tasks,
      programs,
      squad,
      profile,
      records,
      history
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ackerman_progress_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    haptic.success();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.programs) setPrograms(parsed.programs);
        if (parsed.squad) setSquad(parsed.squad);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.records) setRecords(parsed.records);
        if (parsed.history) setHistory(parsed.history);
        haptic.success();
        alert('Дані успішно відновлено з резервної копії!');
        setIsSettingsOpen(false);
      } catch (err) {
        alert('Помилка: невірний формат файлу резервної копії.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#08090C] text-[#F3F4F6] select-none antialiased">
      {/* App Header (Custom SVG Logo + Name + Streak + Settings Trigger) */}
      <Header
        streak={userStreak}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* In-App Reminder Notification Toast */}
      {activeNotification && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top duration-200">
          <div className="bg-[#12151D] border-2 border-[#CCFF00] rounded-2xl p-3 shadow-2xl flex items-center justify-between glow-volt-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center">
                <Bell size={16} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-[#8E95A5] font-stat block">
                  НАГАДУВАННЯ ПО ПЛАНУ
                </span>
                <span className="text-xs font-bold text-white block">
                  {activeNotification}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="p-1 text-[#8E95A5] hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Routing */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'home' && (
          <HomeTab
            tasks={tasks}
            programs={programs}
            squad={squad}
            records={records}
            onSaveRecord={handleSaveRecord}
            onDeleteRecord={handleDeleteRecord}
            setTab={setTab}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentTab === 'planner' && (
          <PlannerTab
            tasks={tasks}
            setTasks={setTasks}
            soundEnabled={profile.soundEnabled}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutsTab
            programs={programs}
            setPrograms={setPrograms}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentTab === 'training' && (
          <TrainingTab
            programs={programs}
            activeWorkout={activeWorkout}
            setActiveWorkout={setActiveWorkout}
            onCompleteWorkout={handleCompleteWorkout}
            userProfile={profile}
            streak={userStreak}
            soundEnabled={profile.soundEnabled}
          />
        )}

        {currentTab === 'squad' && (
          <SquadTab
            squad={squad}
            setSquad={setSquad}
            userProfile={profile}
            userRecords={records}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (5 tabs with custom SVGs, NO emojis) */}
      <Navbar currentTab={currentTab} setTab={setTab} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetDefaults={handleResetDefaults}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />
    </div>
  );
}
