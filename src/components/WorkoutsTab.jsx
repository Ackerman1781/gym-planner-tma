import React, { useState } from 'react';
import { 
  Play, Plus, Dumbbell, ChevronDown, ChevronUp, 
  Trash2, Edit3, CheckCircle2, Flame, Layers 
} from 'lucide-react';
import { haptic } from '../services/telegram';

export const WorkoutsTab = ({ programs, setPrograms, onStartWorkout }) => {
  const [expandedProgramId, setExpandedProgramId] = useState(programs[0]?.id || null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  
  // Quick adding an exercise to a specific day
  const [addingExerciseToDay, setAddingExerciseToDay] = useState(null);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState('8-12');

  const toggleExpand = (id) => {
    haptic.selection();
    setExpandedProgramId(expandedProgramId === id ? null : id);
  };

  const handleCreateProgram = (e) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    haptic.impact('medium');
    const newProg = {
      id: 'prog_' + Date.now(),
      name: newProgramName.trim(),
      description: 'Користувацька програма тренувань',
      days: [
        {
          id: 'day_' + Date.now(),
          name: 'День 1',
          exercises: []
        }
      ]
    };

    setPrograms([...programs, newProg]);
    setExpandedProgramId(newProg.id);
    setNewProgramName('');
    setIsCreatingProgram(false);
    haptic.success();
  };

  const handleAddDayToProgram = (programId) => {
    haptic.impact('light');
    const updated = programs.map((p) => {
      if (p.id === programId) {
        const nextDayNum = (p.days?.length || 0) + 1;
        return {
          ...p,
          days: [
            ...(p.days || []),
            {
              id: 'day_' + Date.now(),
              name: `День ${nextDayNum}`,
              exercises: []
            }
          ]
        };
      }
      return p;
    });
    setPrograms(updated);
  };

  const handleAddExercise = (programId, dayId) => {
    if (!newExName.trim()) return;
    haptic.impact('medium');

    const updated = programs.map((p) => {
      if (p.id === programId) {
        return {
          ...p,
          days: p.days.map((d) => {
            if (d.id === dayId) {
              return {
                ...d,
                exercises: [
                  ...d.exercises,
                  {
                    id: 'ex_' + Date.now(),
                    name: newExName.trim(),
                    muscle: newExMuscle.trim() || 'Загальне',
                    targetSets: parseInt(newExSets, 10) || 3,
                    targetReps: newExReps.trim() || '10'
                  }
                ]
              };
            }
            return d;
          })
        };
      }
      return p;
    });

    setPrograms(updated);
    setAddingExerciseToDay(null);
    setNewExName('');
    setNewExMuscle('');
    haptic.success();
  };

  const handleDeleteExercise = (programId, dayId, exId) => {
    haptic.impact('light');
    const updated = programs.map((p) => {
      if (p.id === programId) {
        return {
          ...p,
          days: p.days.map((d) => {
            if (d.id === dayId) {
              return {
                ...d,
                exercises: d.exercises.filter((e) => e.id !== exId)
              };
            }
            return d;
          })
        };
      }
      return p;
    });
    setPrograms(updated);
  };

  const handleDeleteProgram = (programId) => {
    haptic.impact('heavy');
    if (confirm('Видалити цю програму тренувань?')) {
      setPrograms(programs.filter((p) => p.id !== programId));
    }
  };

  return (
    <div className="flex-1 pb-24 pt-3 px-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Програми тренувань</span>
          </h1>
          <p className="text-xs text-[#8b949e]">Твої спліти, вправи та робочі ваги</p>
        </div>
        <button
          onClick={() => {
            haptic.selection();
            setIsCreatingProgram(!isCreatingProgram);
          }}
          className="px-3 py-1.5 bg-emerald-500/10 active:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <Plus size={15} />
          <span>Створити</span>
        </button>
      </div>

      {/* New Program Input Modal/Card */}
      {isCreatingProgram && (
        <form onSubmit={handleCreateProgram} className="bg-[#161b22] border border-emerald-500/40 rounded-2xl p-4 mb-4 shadow-lg animate-in fade-in">
          <h3 className="text-sm font-bold text-white mb-2">Нова програма</h3>
          <input
            type="text"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            placeholder="Наприклад: Мій 4-денний спліт"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-emerald-500 mb-3"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingProgram(false)}
              className="px-3 py-1.5 text-xs text-[#8b949e] rounded-xl"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={!newProgramName.trim()}
              className="px-4 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-xl disabled:opacity-50"
            >
              Створити
            </button>
          </div>
        </form>
      )}

      {/* Programs Accordion List */}
      <div className="space-y-3">
        {programs.map((program) => {
          const isExpanded = expandedProgramId === program.id;

          return (
            <div
              key={program.id}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Program Header */}
              <div
                onClick={() => toggleExpand(program.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none active:bg-[#1c2128]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight m-0">
                      {program.name}
                    </h2>
                    <p className="text-xs text-[#8b949e] mt-0.5">
                      {program.days?.length || 0} {program.days?.length === 1 ? 'день' : 'днів'} тренувань
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProgram(program.id);
                    }}
                    className="p-1.5 text-[#8b949e] hover:text-rose-400"
                  >
                    <Trash2 size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={20} className="text-[#8b949e]" /> : <ChevronDown size={20} className="text-[#8b949e]" />}
                </div>
              </div>

              {/* Program Body (Days & Exercises) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#21262d] space-y-4">
                  {program.days?.map((day) => (
                    <div
                      key={day.id}
                      className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-3.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            {day.name}
                          </h4>
                          <span className="text-[11px] text-[#8b949e]">
                            {day.exercises?.length || 0} вправ
                          </span>
                        </div>

                        {/* Start Workout Button */}
                        <button
                          onClick={() => {
                            haptic.impact('heavy');
                            onStartWorkout(program, day);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-500 active:scale-95 text-black rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all"
                        >
                          <Play size={14} fill="currentColor" />
                          <span>Почати</span>
                        </button>
                      </div>

                      {/* Exercises in this Day */}
                      <div className="space-y-2 mb-3">
                        {day.exercises?.map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#161b22] border border-[#21262d] text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[#8b949e] font-mono text-[11px] w-4">
                                {idx + 1}.
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-white block truncate">
                                  {ex.name}
                                </span>
                                <span className="text-[10px] text-[#8b949e]">
                                  {ex.muscle} • {ex.targetSets} × {ex.targetReps}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteExercise(program.id, day.id, ex.id)}
                              className="text-[#8b949e] hover:text-rose-400 p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Exercise to Day Form / Trigger */}
                      {addingExerciseToDay === day.id ? (
                        <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-xl p-2.5 space-y-2">
                          <input
                            type="text"
                            value={newExName}
                            onChange={(e) => setNewExName(e.target.value)}
                            placeholder="Назва вправи (напр: Жим гантелей)"
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-emerald-500"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={newExMuscle}
                              onChange={(e) => setNewExMuscle(e.target.value)}
                              placeholder="М'яз (напр: Груди)"
                              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#8b949e]"
                            />
                            <input
                              type="number"
                              value={newExSets}
                              onChange={(e) => setNewExSets(e.target.value)}
                              placeholder="Підходи"
                              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-white text-center"
                            />
                            <input
                              type="text"
                              value={newExReps}
                              onChange={(e) => setNewExReps(e.target.value)}
                              placeholder="Повтори"
                              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-white text-center"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setAddingExerciseToDay(null)}
                              className="px-2 py-1 text-[11px] text-[#8b949e]"
                            >
                              Скасувати
                            </button>
                            <button
                              onClick={() => handleAddExercise(program.id, day.id)}
                              className="px-3 py-1 bg-emerald-500 text-black font-bold text-[11px] rounded-lg"
                            >
                              Додати вправу
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            haptic.selection();
                            setAddingExerciseToDay(day.id);
                          }}
                          className="w-full py-1.5 border border-dashed border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-98 transition-all"
                        >
                          <Plus size={14} />
                          <span>Додати вправу в цей день</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add New Day to Program */}
                  <button
                    onClick={() => handleAddDayToProgram(program.id)}
                    className="w-full py-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-xl text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <Plus size={15} />
                    <span>Додати ще один день тренування</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
