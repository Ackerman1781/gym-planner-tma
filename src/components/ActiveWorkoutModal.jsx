import React, { useState, useEffect } from 'react';
import { 
  Check, Plus, Trash2, Clock, Dumbbell, 
  RotateCcw, Trophy, X, Zap 
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
      <div className="flex-1 pb-28 pt-16 px-4 max-w-md mx-auto w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#CCFF00]/10 border-2 border-[#CCFF00]/30 text-[#CCFF00] mx-auto flex items-center justify-center mb-5 glow-volt-sm">
          <Dumbbell size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 font-['Space_Grotesk',sans-serif]">
          НЕМАЄ АКТИВНОГО ТРЕНУВАННЯ
        </h2>
        <p className="text-sm font-bold text-[#8E95A5] max-w-xs mx-auto mb-6">
          Перейди у вкладку «ЗАЛ», обери день тренування та тисни «ПОЧАТИ»!
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
      onTriggerRestTimer(90);
    } else {
      haptic.impact('light');
    }
  };

  const handleAddSet = (exIdx) => {
    haptic.impact('medium');
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
    haptic.impact('heavy');
    const updatedEx = [...activeWorkout.exercises];
    updatedEx[exIdx].sets.splice(setIdx, 1);
    updatedEx[exIdx].sets.forEach((s, idx) => { s.setNum = idx + 1; });
    setActiveWorkout({ ...activeWorkout, exercises: updatedEx });
  };

  const handleCopyLastWeights = (exIdx, exerciseName) => {
    const last = getLastExercisePerformance(exerciseName, history);
    if (!last || !last.sets?.length) return;

    haptic.impact('heavy');
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
      particleCount: 120,
      spread: 80,
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
    if (confirm('Скасувати тренування без збереження?')) {
      setActiveWorkout(null);
    }
  };

  const liveStats = calculateWorkoutStats(activeWorkout.exercises);

  return (
    <div className="flex-1 pb-32 pt-4 px-4 max-w-md mx-auto w-full">
      {/* Sticky High-Contrast HUD Header */}
      <div className="bg-[#12151D] border-2 border-[#2B3142] rounded-3xl p-4 mb-5 shadow-2xl sticky top-2 z-30 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase font-black text-[#CCFF00] tracking-widest flex items-center gap-1.5 glow-volt-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping"></span>
              LIVE WORKOUT // СЕСІЯ
            </span>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
              {activeWorkout.dayName}
            </h2>
          </div>

          {/* Big Digital Timer */}
          <div className="flex items-center gap-1.5 font-stat text-lg font-black text-[#CCFF00] bg-[#08090C] border border-[#2B3142] px-3.5 py-1.5 rounded-2xl glow-volt-sm">
            <Clock size={16} strokeWidth={2.5} />
            <span>{formatDuration(elapsed)}</span>
          </div>
        </div>

        {/* Big Athletic Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[#1C202C]">
          <div>
            <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-wider block">СЕТИ</span>
            <span className="font-stat text-lg font-black text-white">{liveStats.totalSets}</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-wider block">ПОВТОРИ</span>
            <span className="font-stat text-lg font-black text-white">{liveStats.totalReps}</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-wider block">ТОННАЖ</span>
            <span className="font-stat text-lg font-black text-[#CCFF00]">{liveStats.totalTonnage} <span className="text-xs font-normal text-[#8E95A5]">кг</span></span>
          </div>
        </div>
      </div>

      {/* Exercises Cards */}
      <div className="space-y-4 mb-6">
        {activeWorkout.exercises.map((ex, exIdx) => {
          const lastPerf = getLastExercisePerformance(ex.name, history);

          return (
            <div
              key={ex.id || exIdx}
              className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-black text-white uppercase italic leading-tight font-['Space_Grotesk',sans-serif]">
                    {ex.name}
                  </h3>
                  <span className="text-xs font-extrabold text-[#8E95A5] uppercase tracking-wider">
                    {ex.muscle || 'Загальне'} • Ціль: {ex.targetSets} × {ex.targetReps}
                  </span>
                </div>

                {/* Big "Як минулого разу" button */}
                {lastPerf && (
                  <button
                    onClick={() => handleCopyLastWeights(exIdx, ex.name)}
                    className="px-2.5 py-1.5 bg-[#CCFF00]/15 active-press text-[#CCFF00] border border-[#CCFF00]/40 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 glow-volt-sm shrink-0"
                  >
                    <RotateCcw size={13} strokeWidth={2.5} />
                    <span>Як минулого разу</span>
                  </button>
                )}
              </div>

              {/* Last Performance Bar */}
              {lastPerf && lastPerf.sets?.length > 0 && (
                <div className="text-xs bg-[#08090C] text-[#8E95A5] px-3 py-2 rounded-2xl mb-3.5 border border-[#1F2432] flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#CCFF00] font-black uppercase tracking-wider shrink-0">Минулий раз:</span>
                  <div className="flex items-center gap-2.5 font-stat font-bold text-white truncate">
                    {lastPerf.sets.map((s, idx) => (
                      <span key={idx} className="bg-[#161A24] px-1.5 py-0.5 rounded-lg border border-[#262B3A]">
                        {s.weight}кг × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Big Bold Sets Rows */}
              <div className="space-y-2.5 mb-3.5">
                <div className="grid grid-cols-12 text-[10px] uppercase font-black text-[#8E95A5] tracking-widest px-1 text-center">
                  <span className="col-span-2">СЕТ</span>
                  <span className="col-span-5">ВАГА (КГ)</span>
                  <span className="col-span-3">ПОВТОРИ</span>
                  <span className="col-span-2">ГОТОВО</span>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-12 items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                      set.completed
                        ? 'bg-[#182210] border-[#CCFF00]/50 shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                        : 'bg-[#08090C] border-[#232734]'
                    }`}
                  >
                    {/* Set Number */}
                    <span className="col-span-2 text-center font-stat text-sm font-black text-white">
                      {set.setNum < 10 ? `0${set.setNum}` : set.setNum}
                    </span>

                    {/* Big Weight Inputs & Quick Buttons */}
                    <div className="col-span-5 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleQuickAdjust(exIdx, setIdx, 'weight', -2.5)}
                        className="w-7 h-10 bg-[#161A24] active-press rounded-xl text-xs font-black text-[#8E95A5] hover:text-white border border-[#2B3142]"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                        className="w-16 bg-[#12151D] border border-[#2B3142] rounded-xl py-2 text-center font-stat font-black text-base text-white focus:outline-none focus:border-[#CCFF00]"
                      />
                      <button
                        onClick={() => handleQuickAdjust(exIdx, setIdx, 'weight', 2.5)}
                        className="w-7 h-10 bg-[#161A24] active-press rounded-xl text-xs font-black text-[#8E95A5] hover:text-white border border-[#2B3142]"
                      >
                        +
                      </button>
                    </div>

                    {/* Big Reps Input */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                        className="w-12 bg-[#12151D] border border-[#2B3142] rounded-xl py-2 text-center font-stat font-black text-base text-white focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    {/* Huge Checkbox */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSet(exIdx, setIdx)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center active-press transition-all ${
                          set.completed
                            ? 'bg-[#CCFF00] text-black glow-volt-sm'
                            : 'border-2 border-[#363C4E] hover:border-[#CCFF00] bg-[#12151D] text-transparent'
                        }`}
                      >
                        <Check size={20} strokeWidth={3.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => handleAddSet(exIdx)}
                className="w-full py-2.5 border-2 border-dashed border-[#232734] hover:border-[#CCFF00]/40 text-[#8E95A5] hover:text-[#CCFF00] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active-press transition-all"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Додати підхід</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Complete or Cancel Controls */}
      <div className="space-y-3">
        <button
          onClick={handleCompleteWorkout}
          className="w-full py-4 bg-[#CCFF00] active-press text-black rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 glow-volt transition-all shadow-xl"
        >
          <Trophy size={20} strokeWidth={2.5} />
          <span>ЗАВЕРШИТИ ТРЕНУВАННЯ</span>
        </button>

        <button
          onClick={handleCancelWorkout}
          className="w-full py-2 text-[#8E95A5] hover:text-rose-400 text-xs font-black uppercase tracking-wider text-center"
        >
          Скасувати без збереження
        </button>
      </div>
    </div>
  );
};
