import React, { useState } from 'react';
import { 
  Calculator, Dumbbell, History, 
  TrendingUp, Calendar, ChevronDown, ChevronUp 
} from 'lucide-react';
import { haptic } from '../services/telegram';
import { calculate1RM, get1RMPercentages, formatDuration } from '../services/fitnessMath';

export const ProgressTab = ({ history, programs }) => {
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcReps, setCalcReps] = useState(8);

  const [selectedExercise, setSelectedExercise] = useState('Жим штанги лежачи');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  const calculated1RM = calculate1RM(calcWeight, calcReps);
  const percentages = get1RMPercentages(calculated1RM);

  const allExerciseNames = Array.from(
    new Set([
      'Жим штанги лежачи',
      'Присідання зі штангою',
      'Тяга штанги в нахилі',
      'Армійський жим',
      ...programs.flatMap((p) => p.days?.flatMap((d) => d.exercises?.map((e) => e.name) || []) || []),
      ...history.flatMap((h) => h.exercises?.map((e) => e.name) || [])
    ])
  );

  const exerciseHistory = history
    .map((w) => {
      const ex = w.exercises?.find((e) => e.name.toLowerCase() === selectedExercise.toLowerCase());
      if (!ex) return null;
      const completedSets = ex.sets?.filter((s) => s.completed) || [];
      if (!completedSets.length) return null;

      const maxWeight = Math.max(...completedSets.map((s) => parseFloat(s.weight) || 0));
      return {
        date: w.date ? new Date(w.date).toLocaleDateString('uk-UA') : 'Нещодавно',
        dayName: w.dayName,
        maxWeight,
        sets: completedSets
      };
    })
    .filter(Boolean)
    .reverse();

  return (
    <div className="flex-1 pb-28 pt-4 px-4 max-w-md mx-auto w-full">
      {/* Top Banner */}
      <div className="mb-5 bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E95A5] block">
          СИЛОВИЙ АНАЛІЗ
        </span>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
          ПРОГРЕС & 1ПМ
        </h2>
      </div>

      {/* 1RM Calculator Card */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
            <Calculator size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase italic leading-tight font-['Space_Grotesk',sans-serif]">
              Калькулятор 1ПМ (Разовий максимум)
            </h3>
            <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">Розрахунок за формулами Epley & Brzycki</span>
          </div>
        </div>

        {/* Big Numeric Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#08090C] border border-[#232734] rounded-2xl p-3 text-center">
            <label className="text-[10px] uppercase font-black text-[#8E95A5] tracking-widest block mb-1">
              ВАГА (КГ)
            </label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(e.target.value)}
              className="w-full bg-transparent text-center font-stat font-black text-2xl text-white focus:outline-none"
            />
          </div>
          <div className="bg-[#08090C] border border-[#232734] rounded-2xl p-3 text-center">
            <label className="text-[10px] uppercase font-black text-[#8E95A5] tracking-widest block mb-1">
              ПОВТОРИ
            </label>
            <input
              type="number"
              value={calcReps}
              onChange={(e) => setCalcReps(e.target.value)}
              className="w-full bg-transparent text-center font-stat font-black text-2xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* GIANT 1RM Result Banner */}
        <div className="bg-gradient-to-br from-[#CCFF00]/20 via-[#182015] to-[#12151D] border-2 border-[#CCFF00] rounded-2xl p-4 text-center mb-4 glow-volt-sm">
          <span className="text-xs font-black text-[#CCFF00] uppercase tracking-widest block">
            ТЕОРЕТИЧНИЙ МАКСИМУМ (1 REP MAX):
          </span>
          <div className="text-4xl font-black font-stat text-white mt-1">
            {calculated1RM} <span className="text-lg font-bold text-[#CCFF00]">КГ</span>
          </div>
        </div>

        {/* Percentages Grid */}
        <div>
          <span className="text-[10px] font-black text-[#8E95A5] uppercase tracking-widest block mb-2.5">
            ТРЕНУВАЛЬНІ ВІДСОТКИ НАВАНТАЖЕННЯ:
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            {percentages.slice(0, 6).map((p) => (
              <div key={p.percent} className="bg-[#08090C] border border-[#1F2432] rounded-xl py-2 px-1">
                <span className="text-[11px] font-black text-[#8E95A5] block">{p.percent}%</span>
                <span className="font-stat font-black text-white text-sm">{p.weight} <span className="text-[10px] text-[#CCFF00]">кг</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Progression Card */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase italic leading-tight font-['Space_Grotesk',sans-serif]">
              Динаміка ваги у вправі
            </h3>
            <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">Ріст показників</span>
          </div>
        </div>

        <select
          value={selectedExercise}
          onChange={(e) => {
            haptic.selection();
            setSelectedExercise(e.target.value);
          }}
          className="w-full bg-[#08090C] border border-[#2B3142] rounded-2xl px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00] mb-3.5"
        >
          {allExerciseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {exerciseHistory.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
            Немає записів для цієї вправи
          </div>
        ) : (
          <div className="space-y-2.5">
            {exerciseHistory.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#08090C] border border-[#1F2432] rounded-2xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <span className="text-white font-black text-sm uppercase block">{item.dayName}</span>
                  <span className="text-[11px] font-bold text-[#8E95A5]">{item.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#CCFF00] font-stat font-black text-base block glow-volt-sm">
                    {item.maxWeight} КГ
                  </span>
                  <span className="text-[10px] font-bold text-[#8E95A5] uppercase">
                    {item.sets.length} {item.sets.length === 1 ? 'СЕТ' : 'СЕТИ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History List */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
            <History size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase italic leading-tight font-['Space_Grotesk',sans-serif]">
              Історія тренувань ({history.length})
            </h3>
            <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">Журнал завершених сесій</span>
          </div>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8 text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
              Історія порожня. Проведи своє перше тренування!
            </div>
          ) : (
            history.map((workout) => {
              const isExpanded = expandedHistoryId === workout.id;
              const dateStr = workout.date ? new Date(workout.date).toLocaleDateString('uk-UA') : 'Нещодавно';

              return (
                <div
                  key={workout.id}
                  className="bg-[#08090C] border border-[#1F2432] rounded-2xl p-3.5 cursor-pointer select-none active:bg-[#12151D]"
                  onClick={() => {
                    haptic.selection();
                    setExpandedHistoryId(isExpanded ? null : workout.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white uppercase text-sm leading-snug">{workout.dayName}</h4>
                      <span className="text-[11px] font-bold text-[#8E95A5]">
                        {dateStr} • {formatDuration(workout.durationSeconds || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] font-black font-stat text-xs border border-[#CCFF00]/30">
                        {workout.stats?.totalTonnage || 0} КГ
                      </span>
                      {isExpanded ? <ChevronUp size={18} className="text-[#8E95A5]" /> : <ChevronDown size={18} className="text-[#8E95A5]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-[#1F2432] space-y-1.5">
                      {workout.exercises?.map((ex, exI) => (
                        <div key={exI} className="text-xs text-[#8E95A5]">
                          <span className="text-white font-bold">{ex.name}: </span>
                          <span className="font-stat text-[#CCFF00]">
                            {ex.sets?.filter((s) => s.completed).map((s) => `${s.weight}кг×${s.reps}`).join(', ') || '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
