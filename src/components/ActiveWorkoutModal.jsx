import React, { useState, useEffect } from 'react';
import { 
  Check, Plus, Trash2, Clock, Dumbbell, 
  RotateCcw, Trophy, X, ChevronRight, Sparkles, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../services/telegram';
import { formatDuration, calculateWorkoutStats } from '../services/fitnessMath';
import { getLastExercisePerformance } from '../services/storage';

export const ActiveWorkoutModal = ({ 
  activeWorkout, 
  setActiveWorkout, 
  history, 
  onFinishWorkout, 
  onTriggerRestTimer 
}) => {
  const [elapsed, setElapsed] = useState(0);

  // Total workout timer
  useEffect(() => {
    if (!activeWorkout) return;
    const startTime = new Date(activeWorkout.startedAt).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.startedAt]);

  if (!activeWorkout) {
    return (
      <div className="flex-1 pb-24 pt-12 px-4 max-w-md mx-auto w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <Dumbbell size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Немає активного тренування</h2>
        <p className="text-xs text-[#8b949e] max-w-xs mx-auto mb-6">
          Перейди у вкладку «Зал», обери потрібний день та натисни «Почати», щоб записувати свої підходи!
        </p>
      </div>
    );
  }

  const handleUpdateSet = (exIdx, setIdx, field, val) => {
    const updatedEx = [...activeWorkout.exercises];
    updatedEx[exIdx].sets[setIdx][field] = val;
    setActiveWorkout({ ...activeWorkout, exercises: updatedEx });
  };

  const handleQuickAdjust = (exIdx, setIdx, field, delta) => {
    haptic.selection();
    const current = parseFloat(activeWorkout.exercises[exIdx].sets[setIdx][field]) || 0;
    const nextVal = Math.max(0, current + delta);
    handleUpdateSet(exIdx, setIdx, field, nextVal);
  };

  const handleToggleSet = (exIdx, setIdx) => {
    const isNowCompleted = !activeWorkout.exercises[exIdx].sets[setIdx].completed;
    handleUpdateSet(exIdx, setIdx, 'completed', isNowCompleted);

    if (isNowCompleted) {
      haptic.success();
      // Start rest timer (e.g. 90 seconds)
      onTriggerRestTimer(90);
    } else {
      haptic.impact('light');
    }
  };

  const handleAddSet = (exIdx) => {
    haptic.impact('light');
    const updatedEx = [...activeWorkout.exercises];
    const prevSets = updatedEx[exIdx].sets;
    const lastSet = prevSets[prevSets.length - 1];

    const newSet = {
      setNum: prevSets.length + 1,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: false
    };

    updatedEx[exIdx].sets.push(newSet);
    setActiveWorkout({ ...activeWorkout, exercises: updatedEx });
  };

  const handleDeleteSet = (exIdx, setIdx) => {
    haptic.impact('medium');
    const updatedEx = [...activeWorkout.exercises];
    updatedEx[exIdx].sets.splice(setIdx, 1);
    // Renumber
    updatedEx[exIdx].sets.forEach((s, idx) => { s.setNum = idx + 1; });
    setActiveWorkout({ ...activeWorkout, exercises: updatedEx });
  };

  // Quick fill using last performance
  const handleCopyLastWeights = (exIdx, exerciseName) => {
    const last = getLastExercisePerformance(exerciseName, history);
    if (!last || !last.sets?.length) return;

    haptic.impact('medium');
    const updatedEx = [...activeWorkout.exercises];
    updatedEx[exIdx].sets = last.sets.map((s, idx) => ({
      setNum: idx + 1,
      weight: s.weight,
      reps: s.reps,
      completed: false
    }));
    setActiveWorkout({ ...activeWorkout, exercises: updatedEx });
    haptic.success();
  };

  const handleCompleteWorkout = () => {
    haptic.impact('heavy');
    const stats = calculateWorkoutStats(activeWorkout.exercises);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onFinishWorkout({
      ...activeWorkout,
      durationSeconds: elapsed,
      stats
    });
  };

  const handleCancelWorkout = () => {
    haptic.impact('heavy');
    if (confirm('Ви впевнені, що хочете скасувати це тренування? Дані не збережуться.')) {
      setActiveWorkout(null);
    }
  };

  const liveStats = calculateWorkoutStats(activeWorkout.exercises);

  return (
    <div className="flex-1 pb-28 pt-3 px-4 max-w-md mx-auto w-full">
      {/* Top Bar with Live Timer & Finish Button */}
      <div className="bg-[#161b22] border border-emerald-500/40 rounded-2xl p-3.5 mb-4 shadow-lg sticky top-2 z-30 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Активне тренування
            </span>
            <h2 className="text-base font-bold text-white leading-tight">
              {activeWorkout.dayName}
            </h2>
          </div>

          <div className="flex items-center gap-1 font-mono text-sm font-bold text-white bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded-xl">
            <Clock size={14} className="text-emerald-400" />
            <span>{formatDuration(elapsed)}</span>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#21262d] text-xs">
          <div>
            <span className="text-[10px] text-[#8b949e] block">Підходів</span>
            <span className="font-bold text-white">{liveStats.totalSets}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8b949e] block">Повторень</span>
            <span className="font-bold text-white">{liveStats.totalReps}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8b949e] block">Тоннаж</span>
            <span className="font-bold text-emerald-400">{liveStats.totalTonnage} кг</span>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4 mb-6">
        {activeWorkout.exercises.map((ex, exIdx) => {
          const lastPerf = getLastExercisePerformance(ex.name, history);

          return (
            <div
              key={ex.id || exIdx}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-3.5 shadow-sm"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {ex.name}
                  </h3>
                  <span className="text-[11px] text-[#8b949e]">
                    {ex.muscle || 'Загальне'} • Ціль: {ex.targetSets} × {ex.targetReps}
                  </span>
                </div>

                {/* Quick Fill "Як минулого разу" */}
                {lastPerf && (
                  <button
                    onClick={() => handleCopyLastWeights(exIdx, ex.name)}
                    className="px-2 py-1 bg-emerald-500/10 active:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <RotateCcw size={11} />
                    <span>Як минулого разу</span>
                  </button>
                )}
              </div>

              {/* Last Performance Hint */}
              {lastPerf && lastPerf.sets?.length > 0 && (
                <div className="text-[11px] bg-[#0d1117] text-[#8b949e] px-2.5 py-1 rounded-xl mb-3 border border-[#21262d] flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-emerald-400 font-semibold shrink-0">Минулий раз:</span>
                  <div className="flex items-center gap-2 truncate">
                    {lastPerf.sets.map((s, idx) => (
                      <span key={idx} className="font-mono">
                        {s.weight}кг×{s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sets Table */}
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-[#8b949e] px-1 text-center">
                  <span className="col-span-2">Сет</span>
                  <span className="col-span-5">Вага (кг)</span>
                  <span className="col-span-3">Повтори</span>
                  <span className="col-span-2">Готово</span>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-12 items-center gap-1.5 p-1.5 rounded-xl border transition-all ${
                      set.completed
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-[#0d1117] border-[#21262d]'
                    }`}
                  >
                    {/* Set Number */}
                    <span className="col-span-2 text-center text-xs font-mono font-bold text-white">
                      #{set.setNum}
                    </span>

                    {/* Weight with +/- 2.5kg quick controls */}
                    <div className="col-span-5 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleQuickAdjust(exIdx, setIdx, 'weight', -2.5)}
                        className="w-5 h-7 bg-[#21262d] active:bg-[#30363d] rounded text-[10px] font-bold text-[#8b949e] hover:text-white"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                        className="w-14 bg-[#161b22] border border-[#30363d] rounded-lg py-1 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleQuickAdjust(exIdx, setIdx, 'weight', 2.5)}
                        className="w-5 h-7 bg-[#21262d] active:bg-[#30363d] rounded text-[10px] font-bold text-[#8b949e] hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    {/* Reps with +/- 1 quick controls */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                        className="w-11 bg-[#161b22] border border-[#30363d] rounded-lg py-1 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Checkbox button */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSet(exIdx, setIdx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'border border-[#484f58] hover:border-emerald-400 bg-[#161b22] text-transparent'
                        }`}
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => handleAddSet(exIdx)}
                className="w-full py-1.5 border border-dashed border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-98 transition-all"
              >
                <Plus size={14} />
                <span>Додати підхід</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Complete or Cancel Workout Controls */}
      <div className="space-y-2">
        <button
          onClick={handleCompleteWorkout}
          className="w-full py-3.5 bg-emerald-500 active:scale-98 text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Trophy size={18} />
          <span>Завершити тренування</span>
        </button>

        <button
          onClick={handleCancelWorkout}
          className="w-full py-2.5 text-[#8b949e] hover:text-rose-400 text-xs font-semibold"
        >
          Скасувати без збереження
        </button>
      </div>
    </div>
  );
};
