import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Check, Flame, Clock, Plus, Minus, RotateCcw, 
  Share2, X, ArrowUpRight, CheckCircle2, ChevronRight, Dumbbell, Timer 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AckermanLogo, StreakFlameIcon } from './CustomIcons';
import { haptic, playTimerChime } from '../services/telegram';

export const TrainingTab = ({
  programs,
  activeWorkout,
  setActiveWorkout,
  onCompleteWorkout,
  userProfile,
  streak,
  soundEnabled = true
}) => {
  // If activeWorkout is set, we are in Stage B or C. Otherwise Stage A (Preview).
  const [selectedProgId, setSelectedProgId] = useState(programs[0]?.id || null);
  const [selectedDayId, setSelectedDayId] = useState(programs[0]?.days?.[0]?.id || null);

  const selectedProgram = programs.find((p) => p.id === selectedProgId) || programs[0];
  const selectedDay = selectedProgram?.days?.find((d) => d.id === selectedDayId) || selectedProgram?.days?.[0];

  // Stage B: Stopwatch timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stopwatchRef = useRef(null);

  // Stage B: Rest timer floating
  const [restSeconds, setRestSeconds] = useState(null); // null when closed
  const restTimerRef = useRef(null);

  // Stage C: Summary poster modal
  const [summaryData, setSummaryData] = useState(null);

  // Active workout exercises state
  const [exerciseLogs, setExerciseLogs] = useState({});

  useEffect(() => {
    if (activeWorkout) {
      // Initialize logs from active workout
      const initialLogs = {};
      activeWorkout.day.exercises.forEach((ex) => {
        initialLogs[ex.id] = {
          name: ex.name,
          muscle: ex.muscle,
          lastWeight: ex.lastWeight || 0,
          lastReps: ex.lastReps || 0,
          todayWeight: ex.lastWeight || 60,
          todayReps: ex.lastReps || 8,
          completed: false
        };
      });
      setExerciseLogs(initialLogs);
      setElapsedSeconds(0);
    }
  }, [activeWorkout]);

  // Stopwatch effect
  useEffect(() => {
    if (activeWorkout && !summaryData) {
      stopwatchRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(stopwatchRef.current);
    }
    return () => clearInterval(stopwatchRef.current);
  }, [activeWorkout, summaryData]);

  // Rest timer effect
  useEffect(() => {
    if (restSeconds !== null && restSeconds > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            if (soundEnabled) playTimerChime();
            haptic.success();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restSeconds === 0) {
      clearInterval(restTimerRef.current);
    }
    return () => clearInterval(restTimerRef.current);
  }, [restSeconds, soundEnabled]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Start Workout (Move from Stage A to Stage B)
  const handleStart = (prog, day) => {
    haptic.impact('heavy');
    setActiveWorkout({
      program: prog,
      day: day,
      startedAt: new Date().toISOString()
    });
  };

  // Adjust today weight/reps
  const adjustWeight = (exId, delta) => {
    haptic.impact('light');
    setExerciseLogs((prev) => {
      const current = prev[exId];
      if (!current) return prev;
      const nextW = Math.max(0, Math.round((current.todayWeight + delta) * 10) / 10);
      return {
        ...prev,
        [exId]: { ...current, todayWeight: nextW }
      };
    });
  };

  const adjustReps = (exId, delta) => {
    haptic.impact('light');
    setExerciseLogs((prev) => {
      const current = prev[exId];
      if (!current) return prev;
      const nextR = Math.max(1, current.todayReps + delta);
      return {
        ...prev,
        [exId]: { ...current, todayReps: nextR }
      };
    });
  };

  const fillAsLastTime = (exId) => {
    haptic.selection();
    setExerciseLogs((prev) => {
      const current = prev[exId];
      if (!current) return prev;
      return {
        ...prev,
        [exId]: {
          ...current,
          todayWeight: current.lastWeight,
          todayReps: current.lastReps,
          completed: true
        }
      };
    });
  };

  const toggleExerciseDone = (exId) => {
    haptic.impact('medium');
    setExerciseLogs((prev) => {
      const current = prev[exId];
      if (!current) return prev;
      const nextState = !current.completed;
      if (nextState) {
        haptic.success();
        // Trigger default 90s rest timer
        setRestSeconds(90);
      }
      return {
        ...prev,
        [exId]: { ...current, completed: nextState }
      };
    });
  };

  // Finish Workout (Move from Stage B to Stage C)
  const handleFinish = () => {
    haptic.impact('heavy');
    const performed = Object.keys(exerciseLogs).map((exId) => ({
      exId,
      name: exerciseLogs[exId].name,
      muscle: exerciseLogs[exId].muscle,
      lastWeight: exerciseLogs[exId].lastWeight,
      todayWeight: exerciseLogs[exId].todayWeight,
      todayReps: exerciseLogs[exId].todayReps,
      diff: exerciseLogs[exId].todayWeight - exerciseLogs[exId].lastWeight
    }));

    const summary = {
      dayName: activeWorkout.day.name,
      programName: activeWorkout.program.name,
      duration: elapsedSeconds,
      date: new Date().toLocaleDateString('uk-UA'),
      exercises: performed,
      streak: streak + 1
    };

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setSummaryData(summary);
  };

  // Close summary and save into programs & history
  const handleSaveAndCloseSummary = () => {
    haptic.success();
    onCompleteWorkout(activeWorkout, exerciseLogs, elapsedSeconds);
    setActiveWorkout(null);
    setSummaryData(null);
  };

  const handleShare = () => {
    haptic.selection();
    const text = `Тренування "${summaryData.dayName}" у ACKERMAN PROGRESS завершено! Час: ${formatTime(summaryData.duration)}. Стрік: ${summaryData.streak} днів поспіль! ⚡`;
    if (navigator.share) {
      navigator.share({ title: 'ACKERMAN PROGRESS', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Звіт скопійовано у буфер обміну!');
    }
  };

  // ==========================================
  // STAGE C: FINAL SUMMARY POSTER (SCREENSHOT CARD)
  // ==========================================
  if (summaryData) {
    return (
      <div className="fixed inset-0 z-50 bg-[#08090C] overflow-y-auto p-4 flex flex-col justify-between animate-in zoom-in-95 duration-200">
        {/* Screenshot-ready Poster Card */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#CCFF00] p-6 shadow-2xl bg-gradient-to-b from-[#141824] via-[#0E1118] to-[#08090C] drop-shadow-[0_0_25px_rgba(204,255,0,0.3)]">
          {/* Background Gym Image with Heavy Dark Gradient Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#0E1118]/90 to-[#08090C]/80" />

          <div className="relative z-10 space-y-4">
            {/* Header: Logo + Brand */}
            <div className="flex items-center justify-between border-b border-[#232734] pb-3">
              <div className="flex items-center gap-2.5">
                <AckermanLogo size={34} />
                <div>
                  <h2 className="text-base font-black text-white italic tracking-tight font-['Space_Grotesk',sans-serif]">
                    ACKERMAN <span className="text-[#CCFF00]">PROGRESS</span>
                  </h2>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#8E95A5] font-stat">
                    WORKOUT SUMMARY POSTER
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00] text-[#CCFF00]">
                <StreakFlameIcon size={16} />
                <span className="font-stat font-black text-xs">{summaryData.streak} ДНІВ</span>
              </div>
            </div>

            {/* Athlete & Workout Info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat block">
                  АТЛЕТ
                </span>
                <span className="text-lg font-black text-white uppercase italic">
                  {userProfile?.nickname || 'Артем'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat block">
                  ДАТА & ЧАС
                </span>
                <span className="text-sm font-black text-[#CCFF00] font-stat">
                  {summaryData.date} • {formatTime(summaryData.duration)}
                </span>
              </div>
            </div>

            {/* Workout Title */}
            <div className="bg-[#08090C]/80 border border-[#232734] rounded-2xl p-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat block">
                СПЛІТ ТРЕНУВАННЯ
              </span>
              <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                {summaryData.dayName}
              </h3>
            </div>

            {/* Exercise Results with Vector Arrows */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5] font-stat block">
                РЕЗУЛЬТАТИ ВПРАВ СЬОГОДНІ
              </span>
              {summaryData.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="bg-[#12151D]/90 border border-[#1E2330] rounded-xl p-2.5 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">
                    {ex.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-stat text-[#CCFF00]">
                      {ex.todayWeight} кг × {ex.todayReps}
                    </span>
                    {ex.diff > 0 ? (
                      <span className="text-[10px] font-black font-stat px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight size={11} /> +{ex.diff}кг
                      </span>
                    ) : (
                      <span className="text-[10px] font-black font-stat px-1.5 py-0.5 rounded bg-[#CCFF00]/10 text-[#CCFF00]">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4 max-w-md mx-auto w-full">
          <button
            onClick={handleShare}
            style={{ minHeight: '48px' }}
            className="bg-[#141824] active-press border border-[#262E40] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-stat"
          >
            <Share2 size={16} className="text-[#CCFF00]" />
            <span>ПОДІЛИТИСЯ</span>
          </button>

          <button
            onClick={handleSaveAndCloseSummary}
            style={{ minHeight: '48px' }}
            className="bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 glow-volt-sm font-stat"
          >
            <Check size={16} strokeWidth={3} />
            <span>ЗБЕРЕГТИ & ВИЙТИ</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE B: LIVE GYM WORKOUT MODE
  // ==========================================
  if (activeWorkout) {
    return (
      <div className="flex-1 pb-36 pt-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-150">
        {/* Top Active Bar: Live Stopwatch + Finish Button */}
        <div className="sticky top-14 z-20 bg-[#08090C]/95 backdrop-blur-xl border border-[#232734] rounded-3xl p-3.5 mb-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 flex items-center justify-center animate-pulse">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-[#8E95A5] tracking-widest font-stat block">
                ЖИВИЙ СЕКУНДОМІР
              </span>
              <span className="text-xl font-black font-stat text-[#CCFF00] leading-none">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            style={{ minHeight: '42px' }}
            className="px-4 py-2 bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-wider glow-volt-sm flex items-center gap-1.5"
          >
            <Check size={15} strokeWidth={3} />
            <span>ЗАВЕРШИТИ</span>
          </button>
        </div>

        {/* Workout Title */}
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-widest font-stat block">
            АКТИВНИЙ СПЛІТ
          </span>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
            {activeWorkout.day.name}
          </h2>
        </div>

        {/* Exercise Cards */}
        <div className="space-y-4">
          {activeWorkout.day.exercises.map((ex, idx) => {
            const currentLog = exerciseLogs[ex.id] || {
              todayWeight: ex.lastWeight || 60,
              todayReps: ex.lastReps || 8,
              lastWeight: ex.lastWeight || 60,
              lastReps: ex.lastReps || 8,
              completed: false
            };

            return (
              <div
                key={ex.id || idx}
                className={`bg-[#11141D] border rounded-3xl p-4 shadow-xl transition-all ${
                  currentLog.completed
                    ? 'border-[#CCFF00]/40 bg-[#0C120A]'
                    : 'border-[#222838]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                      {ex.name}
                    </h3>
                    <span className="text-xs font-bold text-[#8E95A5] font-stat">
                      Минулого разу: {ex.lastWeight || 0} кг × {ex.lastReps || 0} разів
                    </span>
                  </div>

                  <button
                    onClick={() => fillAsLastTime(ex.id)}
                    style={{ minHeight: '34px' }}
                    className="px-2.5 py-1 rounded-xl bg-[#171B26] border border-[#2B3142] text-[10px] font-black uppercase text-[#CCFF00] active-press"
                  >
                    Як минулого разу
                  </button>
                </div>

                {/* Weight and Reps Stepper Controls */}
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  {/* Weight Stepper */}
                  <div className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] font-black uppercase text-[#8E95A5] font-stat block mb-1">
                      ВАГА СЬОГОДНІ (КГ)
                    </span>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => adjustWeight(ex.id, -2.5)}
                        style={{ minHeight: '38px', minWidth: '38px' }}
                        className="rounded-xl bg-[#171B26] text-white flex items-center justify-center font-black active-press border border-[#232734]"
                      >
                        <Minus size={14} />
                      </button>

                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        value={currentLog.todayWeight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setExerciseLogs((prev) => ({
                            ...prev,
                            [ex.id]: { ...prev[ex.id], todayWeight: val }
                          }));
                        }}
                        className="w-16 bg-transparent text-center font-stat font-black text-xl text-[#CCFF00] outline-none"
                      />

                      <button
                        onClick={() => adjustWeight(ex.id, 2.5)}
                        style={{ minHeight: '38px', minWidth: '38px' }}
                        className="rounded-xl bg-[#171B26] text-white flex items-center justify-center font-black active-press border border-[#232734]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Reps Stepper */}
                  <div className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] font-black uppercase text-[#8E95A5] font-stat block mb-1">
                      СКІЛЬКИ РАЗІВ
                    </span>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => adjustReps(ex.id, -1)}
                        style={{ minHeight: '38px', minWidth: '38px' }}
                        className="rounded-xl bg-[#171B26] text-white flex items-center justify-center font-black active-press border border-[#232734]"
                      >
                        <Minus size={14} />
                      </button>

                      <input
                        type="number"
                        inputMode="numeric"
                        value={currentLog.todayReps}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setExerciseLogs((prev) => ({
                            ...prev,
                            [ex.id]: { ...prev[ex.id], todayReps: val }
                          }));
                        }}
                        className="w-16 bg-transparent text-center font-stat font-black text-xl text-white outline-none"
                      />

                      <button
                        onClick={() => adjustReps(ex.id, 1)}
                        style={{ minHeight: '38px', minWidth: '38px' }}
                        className="rounded-xl bg-[#171B26] text-white flex items-center justify-center font-black active-press border border-[#232734]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mark Exercise Done Button */}
                <button
                  onClick={() => toggleExerciseDone(ex.id)}
                  style={{ minHeight: '44px' }}
                  className={`w-full rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active-press transition-all ${
                    currentLog.completed
                      ? 'bg-[#CCFF00] text-black glow-volt-sm'
                      : 'bg-[#141824] text-[#A6B0C3] border border-[#262E40]'
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                  <span>{currentLog.completed ? 'ВИКОНАНО ✓' : 'ЗАФІКСУВАТИ ПІДХІД'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Rest Timer with quick presets (60s, 90s, 120s) */}
        {restSeconds !== null && (
          <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-[#0E1118]/95 backdrop-blur-2xl border-2 border-[#CCFF00] rounded-3xl p-4 shadow-2xl flex items-center justify-between glow-volt-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 flex items-center justify-center font-stat">
                  <Timer size={22} className={restSeconds > 0 ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#8E95A5] font-stat block">
                    {restSeconds === 0 ? 'ВІДПОЧИНОК ЗАВЕРШЕНО!' : 'ТАЙМЕР ВІДПОЧИНКУ'}
                  </span>
                  <span className="text-xl font-black font-stat text-white">
                    {formatTime(restSeconds)}
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { haptic.selection(); setRestSeconds(60); }}
                  className="px-2 py-1 rounded-xl bg-[#171B26] text-[10px] font-stat font-black text-[#CCFF00] border border-[#232734] active-press"
                >
                  60с
                </button>
                <button
                  onClick={() => { haptic.selection(); setRestSeconds(90); }}
                  className="px-2 py-1 rounded-xl bg-[#171B26] text-[10px] font-stat font-black text-[#CCFF00] border border-[#232734] active-press"
                >
                  90с
                </button>
                <button
                  onClick={() => { haptic.selection(); setRestSeconds(120); }}
                  className="px-2 py-1 rounded-xl bg-[#171B26] text-[10px] font-stat font-black text-[#CCFF00] border border-[#232734] active-press"
                >
                  120с
                </button>
                <button
                  onClick={() => { haptic.impact('light'); setRestSeconds(null); }}
                  className="p-1.5 text-[#8E95A5] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // STAGE A: PREVIEW BEFORE START
  // ==========================================
  return (
    <div className="flex-1 pb-28 pt-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-150">
      {/* Hero Banner with Dark Gym Photo from Unsplash */}
      <div className="relative overflow-hidden rounded-3xl border border-[#262D3E] shadow-2xl mb-4 group">
        <div
          className="h-56 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#0E1118]/80 to-[#08090C]/40" />

        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl bg-[#CCFF00] text-black font-black text-[10px] uppercase tracking-wider font-stat drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]">
              ACKERMAN WORKOUT
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#08090C]/80 border border-[#232734] text-xs font-bold text-[#A6B0C3] font-stat">
              <Clock size={12} className="text-[#CCFF00]" />
              <span>~45 хв</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-[#CCFF00] tracking-wider font-stat block">
              {selectedProgram?.name || 'Спліт: Сила & Маса'}
            </span>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
              {selectedDay?.name || 'День 1'}
            </h2>
            <span className="text-xs font-bold text-[#8E95A5] uppercase font-stat mt-0.5 block">
              {selectedDay?.exercises?.length || 0} ВПРАВ У ПРОГРАМІ
            </span>
          </div>
        </div>
      </div>

      {/* Select Split Day if program has multiple */}
      {selectedProgram?.days?.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {selectedProgram.days.map((day) => (
            <button
              key={day.id}
              onClick={() => {
                haptic.selection();
                setSelectedDayId(day.id);
              }}
              style={{ minHeight: '40px' }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase font-stat whitespace-nowrap active-press transition-all ${
                selectedDayId === day.id
                  ? 'bg-[#CCFF00] text-black drop-shadow-[0_0_6px_rgba(204,255,0,0.3)]'
                  : 'bg-[#11141D] text-[#8E95A5] border border-[#222838]'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      )}

      {/* Exercise Preview List */}
      <div className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 mb-4 shadow-xl">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat block mb-3">
          ВПРАВИ ТА МИНУЛІ ВАГИ
        </span>

        <div className="space-y-2.5">
          {selectedDay?.exercises?.map((ex, i) => (
            <div
              key={ex.id || i}
              className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#171B26] text-[#CCFF00] font-stat font-black text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm leading-tight">
                    {ex.name}
                  </h4>
                  <span className="text-[10px] font-bold text-[#8E95A5] uppercase font-stat">
                    {ex.muscle || 'Груди'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-[#8E95A5] block">
                  Минулий раз:
                </span>
                <span className="font-stat font-black text-xs text-[#CCFF00]">
                  {ex.lastWeight ? `${ex.lastWeight} кг × ${ex.lastReps}` : 'Ще не виконував'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Massive Start Button */}
      <button
        onClick={() => handleStart(selectedProgram, selectedDay)}
        style={{ minHeight: '52px' }}
        className="w-full bg-[#CCFF00] active-press text-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 glow-volt"
      >
        <Play size={18} fill="currentColor" />
        <span>ПОЧАТИ ТРЕНУВАННЯ ⚡</span>
      </button>
    </div>
  );
};
