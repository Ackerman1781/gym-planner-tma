import React from 'react';
import { 
  Play, CalendarCheck2, Dumbbell, Flame, 
  ArrowRight, Sparkles, Trophy, Zap, ShieldCheck 
} from 'lucide-react';
import { haptic } from '../services/telegram';

export const HomeTab = ({ 
  tasks, 
  programs, 
  records, 
  setTab, 
  onStartWorkout 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progressPercent = todayTasks.length > 0 
    ? Math.round((completedCount / todayTasks.length) * 100) 
    : 0;

  // Next suggested workout (first day of first program)
  const defaultProg = programs[0];
  const nextDay = defaultProg?.days?.[0];

  const calculateStreak = () => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const dStr = d.toISOString().split('T')[0];
      const hasCompleted = tasks.some((t) => t.date === dStr && t.completed);
      if (hasCompleted) {
        streak += 1;
        d.setDate(d.getDate() - 1);
      } else {
        if (dStr === todayStr && streak === 0) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return Math.max(streak, 1);
  };

  return (
    <div className="flex-1 pb-28 pt-4 px-4 max-w-md mx-auto w-full animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#161B26] to-[#0E1118] border-2 border-[#262D3E] rounded-3xl p-5 mb-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Big Centered Hero Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            <svg
              width="76"
              height="76"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_0_18px_rgba(204,255,0,0.45)]"
            >
              <polygon
                points="24,4 43,14 43,34 24,44 5,34 5,14"
                fill="#12151D"
                stroke="#CCFF00"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <polygon
                points="24,10 38,18 38,30 24,38 10,30 10,18"
                fill="#08090C"
                stroke="#2B3142"
                strokeWidth="1.5"
              />
              <path
                d="M26 13L16 26H24L22 35L32 22H24L26 13Z"
                fill="#CCFF00"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-white uppercase italic tracking-wider font-['Space_Grotesk',sans-serif] m-0">
            ACKERMAN <span className="text-[#CCFF00]">PROGRESS</span>
          </h2>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 text-[10px] font-black uppercase tracking-widest my-2.5 glow-volt-sm">
            <Sparkles size={11} />
            <span>DAILY LIFE & ATHLETIC ENGINE</span>
          </div>

          {/* Mission statement requested by user */}
          <p className="text-xs font-bold text-[#A6B0C3] leading-relaxed max-w-xs mt-1">
            Проєкт створений для полегшення твого повсякденного життя, щоденної залізної дисципліни та максимального фізичного прогресу.
          </p>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="space-y-4 mb-5">
        {/* Today's Planner Snapshot */}
        <div 
          onClick={() => { haptic.selection(); setTab('planner'); }}
          className="bg-[#12151D] border border-[#232734] hover:border-[#CCFF00]/40 rounded-3xl p-4 shadow-lg cursor-pointer active-press transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center border border-[#CCFF00]/30 glow-volt-sm">
                <CalendarCheck2 size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5] block">
                  ПЛАНИ НА СЬОГОДНІ
                </span>
                <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                  {completedCount} з {todayTasks.length} ЗАВЕРШЕНО
                </h3>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#1A1F2C] text-[#CCFF00]">
              <ArrowRight size={18} strokeWidth={2.5} />
            </div>
          </div>

          <div className="w-full h-2.5 bg-[#08090C] rounded-full overflow-hidden border border-[#232734] p-0.5">
            <div
              className="h-full bg-[#CCFF00] rounded-full transition-all duration-300 glow-volt-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Workout Launcher */}
        {nextDay && defaultProg && (
          <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center border border-[#CCFF00]/30 glow-volt-sm">
                  <Dumbbell size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5] block">
                    ГОТОВИЙ ДО ЗАЛУ?
                  </span>
                  <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                    {nextDay.name}
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#8E95A5] uppercase font-stat">
                {nextDay.exercises?.length || 0} ВПРАВ
              </span>
            </div>

            <button
              onClick={() => {
                haptic.impact('heavy');
                onStartWorkout(defaultProg, nextDay);
              }}
              className="w-full py-3.5 bg-[#CCFF00] text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 glow-volt active-press transition-all"
            >
              <Play size={16} fill="currentColor" />
              <span>РОЗПОЧАТИ ТРЕНУВАННЯ ⚡</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats & Personal Records Widget */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Streak Counter */}
        <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5]">
              ДИСЦИПЛІНА
            </span>
            <Flame size={18} className="text-[#CCFF00] fill-[#CCFF00] animate-bounce" />
          </div>
          <div>
            <div className="text-3xl font-black font-stat text-[#CCFF00] glow-volt-sm">
              {calculateStreak()}
            </div>
            <span className="text-xs font-bold text-white uppercase mt-0.5 block">
              Днів поспіль у формі
            </span>
          </div>
        </div>

        {/* PR Quick Link */}
        <div 
          onClick={() => { haptic.selection(); setTab('settings'); }}
          className="bg-[#12151D] border border-[#232734] hover:border-[#CCFF00]/40 rounded-3xl p-4 flex flex-col justify-between cursor-pointer active-press"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5]">
              РЕКОРДИ (PR)
            </span>
            <Trophy size={18} className="text-[#CCFF00]" />
          </div>
          <div>
            <div className="text-3xl font-black font-stat text-white">
              {records?.[0]?.weight || 95} <span className="text-sm font-normal text-[#CCFF00]">КГ</span>
            </div>
            <span className="text-xs font-bold text-[#8E95A5] uppercase mt-0.5 block truncate">
              {records?.[0]?.exercise || 'Жим штанги'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
