import React, { useState } from 'react';
import { 
  ArrowRight, CalendarCheck2, Trophy, Plus, Dumbbell, 
  Trash2, Calendar, Play, Sparkles, X, Check 
} from 'lucide-react';
import { PREmblem, PodiumBadge } from './CustomIcons';
import { haptic } from '../services/telegram';

export const HomeTab = ({
  tasks,
  programs,
  squad,
  records,
  onSaveRecord,
  onDeleteRecord,
  setTab,
  onStartWorkout
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const progressPercent = todayTasks.length > 0 
    ? Math.round((completedTasks / todayTasks.length) * 100) 
    : 0;

  // Find user in squad to display ranking
  const sortedSquad = [...squad].sort((a, b) => (b.streak || 0) - (a.streak || 0));
  const userRankIdx = sortedSquad.findIndex((s) => s.isMe);
  const userRankPosition = userRankIdx >= 0 ? userRankIdx + 1 : 1;

  // Suggested workout
  const defaultProg = programs[0];
  const nextDay = defaultProg?.days?.[0];

  // Modal to add new 1RM Record
  const [isAddingPR, setIsAddingPR] = useState(false);
  const [prExercise, setPrExercise] = useState('Жим штанги лежачи');
  const [customExercise, setCustomExercise] = useState('');
  const [prWeight, setPrWeight] = useState(100);
  const [prDate, setPrDate] = useState(todayStr);

  const handleCreatePR = (e) => {
    e.preventDefault();
    const finalExerciseName = prExercise === 'custom' 
      ? (customExercise.trim() || 'Власна вправа') 
      : prExercise;

    if (!finalExerciseName) return;

    haptic.impact('heavy');
    const newRecord = {
      id: 'pr_' + Date.now(),
      exercise: finalExerciseName,
      weight: parseFloat(prWeight) || 0,
      reps: 1,
      date: prDate
    };

    onSaveRecord(newRecord);
    setIsAddingPR(false);
    setCustomExercise('');
    haptic.success();
  };

  return (
    <div className="flex-1 pb-28 pt-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-150">
      {/* Project Description Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141824] via-[#0E1118] to-[#08090C] border border-[#232734] rounded-3xl p-5 mb-4 shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] text-[10px] font-black uppercase tracking-widest mb-2.5 drop-shadow-[0_0_6px_rgba(204,255,0,0.3)]">
          <Sparkles size={12} />
          <span>DAILY LIFE & DISCIPLINE</span>
        </div>

        <p className="text-sm font-bold text-white leading-relaxed">
          Проект створений для полегшення повсякденного життя та залізної дисципліни. Твій ритм. Твій прогрес.
        </p>
      </div>

      {/* Widget "Сьогодні за планом" */}
      <div className="space-y-3 mb-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Tasks Status */}
          <div
            onClick={() => {
              haptic.selection();
              setTab('planner');
            }}
            className="bg-[#11141D] border border-[#222838] hover:border-[#CCFF00]/50 rounded-3xl p-4 flex flex-col justify-between active-press cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat">
                ПЛАНИ
              </span>
              <CalendarCheck2 size={18} className="text-[#CCFF00]" />
            </div>

            <div>
              <div className="text-2xl font-black font-stat text-white">
                {completedTasks}/{todayTasks.length}
              </div>
              <span className="text-xs font-bold text-[#8E95A5] uppercase block mt-0.5">
                Виконано на сьогодні
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#08090C] rounded-full overflow-hidden mt-3 border border-[#1E2330]">
              <div
                className="h-full bg-[#CCFF00] rounded-full transition-all duration-300 drop-shadow-[0_0_4px_rgba(204,255,0,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Personal Record / Best Lift Widget */}
          <div
            onClick={() => {
              haptic.selection();
              setIsAddingPR(true);
            }}
            className="bg-[#11141D] border border-[#222838] hover:border-[#CCFF00]/50 rounded-3xl p-4 flex flex-col justify-between active-press cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat">
                РЕКОРД (1RM)
              </span>
              <Trophy size={18} className="text-[#CCFF00]" />
            </div>

            <div>
              <div className="text-2xl font-black font-stat text-[#CCFF00] drop-shadow-[0_0_6px_rgba(204,255,0,0.3)]">
                {records?.[0]?.weight || 95} <span className="text-sm font-normal text-white">КГ</span>
              </div>
              <span className="text-xs font-bold text-[#8E95A5] uppercase block mt-0.5 truncate">
                {records?.[0]?.exercise || 'Жим штанги'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#8E95A5] mt-3 font-stat">
              <span>{records.length} РЕКОРДІВ</span>
              <ArrowRight size={12} className="text-[#CCFF00]" />
            </div>
          </div>
        </div>

        {/* Atmospheric Quick Workout Launcher Banner */}
        {nextDay && defaultProg && (
          <div className="relative overflow-hidden rounded-3xl border border-[#262D3E] shadow-xl group">
            {/* Dark Gym Backdrop Photo with Gradient Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80")'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#0E1118]/85 to-[#08090C]/60" />

            <div className="relative p-5 z-10 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-[#CCFF00] text-black font-black text-[10px] uppercase tracking-wider font-stat drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]">
                  ACKERMAN WORKOUT
                </span>
                <span className="text-xs font-black uppercase text-[#A6B0C3] font-stat">
                  {nextDay.exercises?.length || 0} ВПРАВ
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
                  {nextDay.name}
                </h3>
                <span className="text-xs font-bold text-[#A6B0C3]">
                  {defaultProg.name}
                </span>
              </div>

              <button
                onClick={() => {
                  haptic.impact('heavy');
                  onStartWorkout(defaultProg, nextDay);
                }}
                style={{ minHeight: '48px' }}
                className="w-full bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 glow-volt-sm"
              >
                <Play size={16} fill="currentColor" />
                <span>РОЗПОЧАТИ ТРЕНУВАННЯ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Block "Календар Рекордів (Жим та база на 1 раз)" */}
      <div className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <PREmblem size={26} />
            <div>
              <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif] leading-tight">
                Календар Рекордів (1RM)
              </h3>
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider font-stat">
                Твій максимальний жим та база
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              haptic.selection();
              setIsAddingPR(true);
            }}
            style={{ minHeight: '36px' }}
            className="px-3 py-1.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl active-press glow-volt-sm flex items-center gap-1 font-stat"
          >
            <Plus size={14} strokeWidth={3} />
            <span>+ Рекорд</span>
          </button>
        </div>

        {/* PR Timeline List */}
        <div className="space-y-2.5">
          {records.length === 0 ? (
            <div className="text-center py-6 text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
              Рекордів ще не записано
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] font-stat font-black text-xs">
                    1RM
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase leading-tight font-['Space_Grotesk',sans-serif]">
                      {rec.exercise}
                    </h4>
                    <span className="text-[10px] font-bold text-[#8E95A5] flex items-center gap-1 mt-0.5 font-stat">
                      <Calendar size={11} /> {rec.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-black font-stat text-[#CCFF00] drop-shadow-[0_0_6px_rgba(204,255,0,0.3)]">
                      {rec.weight} <span className="text-xs font-normal text-white">КГ</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      haptic.impact('medium');
                      onDeleteRecord(rec.id);
                    }}
                    className="p-1.5 text-[#6F778B] hover:text-rose-400 active-press"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add PR Modal */}
      {isAddingPR && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#0E1118] border-2 border-[#CCFF00] rounded-3xl w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#232734]">
              <div className="flex items-center gap-2">
                <PREmblem size={24} />
                <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                  ЗАПИСАТИ НОВИЙ РЕКОРД (1RM)
                </h3>
              </div>
              <button
                onClick={() => setIsAddingPR(false)}
                className="w-8 h-8 rounded-xl bg-[#171B26] text-[#8E95A5] hover:text-white flex items-center justify-center active-press"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1">
                  ОБЕРИ ВПРАВУ
                </label>
                <select
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                  className="w-full bg-[#141824] border border-[#262E40] text-white rounded-2xl px-4 py-3 text-base font-bold outline-none"
                >
                  <option value="Жим штанги лежачи">Жим штанги лежачи</option>
                  <option value="Присідання зі штангою">Присідання зі штангою</option>
                  <option value="Станова тяга">Станова тяга</option>
                  <option value="Армійський жим">Армійський жим</option>
                  <option value="custom">+ Власна вправа</option>
                </select>
              </div>

              {prExercise === 'custom' && (
                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1">
                    НАЗВА ВПРАВИ
                  </label>
                  <input
                    type="text"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                    placeholder="Наприклад: Підйом на біцепс"
                    className="w-full bg-[#141824] border border-[#262E40] text-white rounded-2xl px-4 py-3 text-base font-bold outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1 font-stat">
                    ВАГА НА 1 РАЗ (КГ)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={prWeight}
                    onChange={(e) => setPrWeight(e.target.value)}
                    className="w-full bg-[#141824] border border-[#262E40] text-[#CCFF00] font-stat font-black text-center rounded-2xl px-4 py-3 text-lg outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1 font-stat">
                    ДАТА РЕКОРДУ
                  </label>
                  <input
                    type="date"
                    value={prDate}
                    onChange={(e) => setPrDate(e.target.value)}
                    className="w-full bg-[#141824] border border-[#262E40] text-white font-bold text-center rounded-2xl px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] font-bold text-[#8E95A5]">
                Примітка: цей рекорд автоматично оновить твій показник жиму у таблиці лідерів Squad!
              </p>

              <button
                type="submit"
                style={{ minHeight: '48px' }}
                className="w-full bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 glow-volt-sm"
              >
                <Check size={16} strokeWidth={3} />
                <span>ЗБЕРЕГТИ РЕКОРД</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
