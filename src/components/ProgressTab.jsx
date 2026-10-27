import React, { useState } from 'react';
import { 
  Calculator, Trophy, Dumbbell, History, 
  TrendingUp, Calendar, ChevronDown, ChevronUp, Layers 
} from 'lucide-react';
import { haptic } from '../services/telegram';
import { calculate1RM, get1RMPercentages, formatDuration } from '../services/fitnessMath';

export const ProgressTab = ({ history, programs }) => {
  // 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcReps, setCalcReps] = useState(8);

  // Exercise Filter State
  const [selectedExercise, setSelectedExercise] = useState('Жим штанги лежачи');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  const calculated1RM = calculate1RM(calcWeight, calcReps);
  const percentages = get1RMPercentages(calculated1RM);

  // Collect all unique exercise names from programs and history
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

  // Extract history points for selected exercise
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
    <div className="flex-1 pb-24 pt-3 px-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Прогрес & 1ПМ</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Аналіз сили, прогресія ваги та калькулятор</p>
      </div>

      {/* 1RM Calculator Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calculator size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">
              Калькулятор 1ПМ (Одноповторний максимум)
            </h2>
            <span className="text-[11px] text-[#8b949e]">Розрахуй свій разовий максимум за формулою</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-center">
            <label className="text-[10px] uppercase font-bold text-[#8b949e] block mb-1">
              Вага (кг)
            </label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(e.target.value)}
              className="w-full bg-transparent text-center font-mono font-bold text-lg text-white focus:outline-none"
            />
          </div>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-center">
            <label className="text-[10px] uppercase font-bold text-[#8b949e] block mb-1">
              Повтори
            </label>
            <input
              type="number"
              value={calcReps}
              onChange={(e) => setCalcReps(e.target.value)}
              className="w-full bg-transparent text-center font-mono font-bold text-lg text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Big 1RM Result Banner */}
        <div className="bg-gradient-to-br from-emerald-500/20 via-[#1c2128] to-[#161b22] border border-emerald-500/30 rounded-xl p-3.5 text-center mb-4">
          <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider block">
            Орієнтовний 1ПМ:
          </span>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
            {calculated1RM} <span className="text-base font-normal text-[#8b949e]">кг</span>
          </div>
        </div>

        {/* Percentage Grid */}
        <div>
          <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-2">
            Тренувальні відсотки від максимуму:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            {percentages.slice(0, 6).map((p) => (
              <div key={p.percent} className="bg-[#0d1117] border border-[#21262d] rounded-lg py-1.5 px-1">
                <span className="text-[10px] text-[#8b949e] block">{p.percent}%</span>
                <span className="font-mono font-bold text-white text-xs">{p.weight} кг</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Progression Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-sm font-bold text-white leading-tight">
              Динаміка ваги у вправі
            </h2>
          </div>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExercise}
          onChange={(e) => {
            haptic.selection();
            setSelectedExercise(e.target.value);
          }}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 mb-3"
        >
          {allExerciseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Progress List / Chart points */}
        {exerciseHistory.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#8b949e]">
            Немає записів для цієї вправи у завершених тренуваннях.
          </div>
        ) : (
          <div className="space-y-2">
            {exerciseHistory.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0d1117] border border-[#21262d] rounded-xl p-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-white font-semibold block">{item.dayName}</span>
                  <span className="text-[10px] text-[#8b949e]">{item.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-mono font-bold text-sm block">
                    {item.maxWeight} кг
                  </span>
                  <span className="text-[10px] text-[#8b949e]">
                    {item.sets.length} {item.sets.length === 1 ? 'підхід' : 'підходи'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Workouts History */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <History size={18} />
          </div>
          <h2 className="text-sm font-bold text-white leading-tight">
            Історія тренувань ({history.length})
          </h2>
        </div>

        <div className="space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8b949e]">
              Історія порожня. Заверши своє перше тренування!
            </div>
          ) : (
            history.map((workout) => {
              const isExpanded = expandedHistoryId === workout.id;
              const dateStr = workout.date ? new Date(workout.date).toLocaleDateString('uk-UA') : 'Нещодавно';

              return (
                <div
                  key={workout.id}
                  className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3 text-xs cursor-pointer select-none"
                  onClick={() => {
                    haptic.selection();
                    setExpandedHistoryId(isExpanded ? null : workout.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white leading-snug">{workout.dayName}</h4>
                      <span className="text-[10px] text-[#8b949e]">
                        {dateStr} • {formatDuration(workout.durationSeconds || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[11px]">
                        {workout.stats?.totalTonnage || 0} кг
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-[#8b949e]" /> : <ChevronDown size={16} className="text-[#8b949e]" />}
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 pt-2 border-t border-[#21262d] space-y-1.5">
                      {workout.exercises?.map((ex, exI) => (
                        <div key={exI} className="text-[11px] text-[#8b949e]">
                          <span className="text-white font-medium">{ex.name}: </span>
                          <span className="font-mono">
                            {ex.sets?.filter((s) => s.completed).map((s) => `${s.weight}×${s.reps}`).join(', ') || '—'}
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
