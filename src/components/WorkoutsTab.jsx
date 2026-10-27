import React, { useState } from 'react';
import { 
  Play, Plus, Dumbbell, ChevronDown, ChevronUp, 
  Trash2, Edit2, Check, X 
} from 'lucide-react';
import { haptic } from '../services/telegram';

const MUSCLE_GROUPS = [
  { name: 'Груди', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  { name: 'Верх грудей', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  { name: 'Спина', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  { name: 'Широчайші', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  { name: 'Ноги', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { name: 'Біцепс стегна', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { name: 'Плечі', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { name: 'Руки', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { name: 'Біцепс', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { name: 'Тріцепс', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { name: 'Прес', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' }
];

const getMuscleBadgeStyle = (muscle) => {
  const found = MUSCLE_GROUPS.find((m) => m.name.toLowerCase() === (muscle || '').toLowerCase());
  return found ? found.color : 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/30';
};

export const WorkoutsTab = ({ programs, setPrograms, onStartWorkout }) => {
  const [expandedProgramId, setExpandedProgramId] = useState(programs[0]?.id || null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');

  // Exercise creation state
  const [addingExerciseToDay, setAddingExerciseToDay] = useState(null); // { progId, dayId }
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Груди');
  const [newExWeight, setNewExWeight] = useState(80);
  const [newExReps, setNewExReps] = useState(8);

  // Quick edit record modal/state for an exercise
  const [editingEx, setEditingEx] = useState(null); // { progId, dayId, exId, weight, reps }

  const toggleExpand = (id) => {
    haptic.selection();
    setExpandedProgramId(expandedProgramId === id ? null : id);
  };

  const handleCreateProgram = (e) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    haptic.impact('heavy');
    const newProg = {
      id: 'prog_' + Date.now(),
      name: newProgramName.trim(),
      description: 'Власна тренувальна програма',
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
    haptic.impact('medium');
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
    haptic.impact('heavy');

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
                    muscle: newExMuscle.trim() || 'Груди',
                    lastWeight: parseFloat(newExWeight) || 0,
                    lastReps: parseInt(newExReps, 10) || 8
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
    haptic.success();
  };

  const handleSaveQuickRecord = (programId, dayId, exId, weight, reps) => {
    haptic.impact('medium');
    const updated = programs.map((p) => {
      if (p.id === programId) {
        return {
          ...p,
          days: p.days.map((d) => {
            if (d.id === dayId) {
              return {
                ...d,
                exercises: d.exercises.map((e) => {
                  if (e.id === exId) {
                    return {
                      ...e,
                      lastWeight: parseFloat(weight) || 0,
                      lastReps: parseInt(reps, 10) || 0
                    };
                  }
                  return e;
                })
              };
            }
            return d;
          })
        };
      }
      return p;
    });
    setPrograms(updated);
    setEditingEx(null);
    haptic.success();
  };

  const handleDeleteExercise = (programId, dayId, exId) => {
    haptic.impact('medium');
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
    <div className="flex-1 pb-28 pt-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 mb-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5] block font-stat">
            СИЛОВИЙ БЛОК
          </span>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
            ПРОГРАМИ ТРЕНУВАНЬ
          </h2>
        </div>
        <button
          onClick={() => {
            haptic.selection();
            setIsCreatingProgram(!isCreatingProgram);
          }}
          style={{ minHeight: '44px' }}
          className="px-3.5 py-2 bg-[#CCFF00] active-press text-black rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 glow-volt-sm font-stat"
        >
          <Plus size={16} strokeWidth={3} />
          <span>СТВОРИТИ</span>
        </button>
      </div>

      {/* New Program Input */}
      {isCreatingProgram && (
        <form onSubmit={handleCreateProgram} className="bg-[#11141D] border-2 border-[#CCFF00] rounded-3xl p-4 mb-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-white font-stat">
              НОВА ПРОГРАМА / СПЛІТ
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingProgram(false)}
              className="text-[#8E95A5] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <input
            type="text"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            placeholder="Наприклад: Спліт (Груди + Руки)"
            className="w-full bg-[#08090C] border border-[#222838] focus:border-[#CCFF00] rounded-2xl px-4 py-3 text-base font-bold text-white outline-none"
          />

          <button
            type="submit"
            style={{ minHeight: '44px' }}
            className="w-full bg-[#CCFF00] text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active-press glow-volt-sm"
          >
            <Check size={16} strokeWidth={3} />
            <span>СТВОРИТИ ПРОГРАМУ</span>
          </button>
        </form>
      )}

      {/* Programs List */}
      <div className="space-y-4">
        {programs.map((program) => {
          const isExpanded = expandedProgramId === program.id;

          return (
            <div
              key={program.id}
              className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 shadow-xl"
            >
              {/* Program Header */}
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpand(program.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
                      {program.name}
                    </h3>
                    <span className="text-[10px] font-bold text-[#8E95A5] uppercase font-stat">
                      {program.days?.length || 0} ТРЕНУВАЛЬНИХ ДНІВ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProgram(program.id);
                    }}
                    className="p-2 text-[#6F778B] hover:text-rose-400 active-press"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="p-2 text-[#8E95A5]">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Program Days */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#1C212E] space-y-4 animate-in fade-in duration-150">
                  {program.days?.map((day) => (
                    <div
                      key={day.id}
                      className="bg-[#08090C] border border-[#1E2330] rounded-3xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div>
                          <h4 className="text-base font-black text-white uppercase italic flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                            <span className="w-2 h-2 rounded-full bg-[#CCFF00] drop-shadow-[0_0_4px_rgba(204,255,0,0.8)]" />
                            {day.name}
                          </h4>
                          <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider font-stat">
                            {day.exercises?.length || 0} ВПРАВ
                          </span>
                        </div>

                        {/* Start Workout Button */}
                        <button
                          onClick={() => {
                            haptic.impact('heavy');
                            onStartWorkout(program, day);
                          }}
                          style={{ minHeight: '40px' }}
                          className="px-4 py-2 bg-[#CCFF00] active-press text-black rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 glow-volt-sm"
                        >
                          <Play size={14} fill="currentColor" />
                          <span>ПОЧАТИ</span>
                        </button>
                      </div>

                      {/* Exercises List (Gymshark style: Exercise + Muscle Badge + Last Performance [ 85 КГ ] × [ 8 РАЗІВ ]) */}
                      <div className="space-y-2 mb-3">
                        {day.exercises?.length === 0 ? (
                          <div className="text-center py-4 text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
                            У цьому дні ще немає вправ
                          </div>
                        ) : (
                          day.exercises.map((ex, idx) => {
                            const isEditingThis = editingEx && editingEx.exId === ex.id;
                            const badgeStyle = getMuscleBadgeStyle(ex.muscle);

                            return (
                              <div
                                key={ex.id || idx}
                                className="p-3 rounded-2xl bg-[#11141D] border border-[#1E2330] flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                                  <span className="text-[#CCFF00] font-stat font-extrabold text-xs w-4">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="font-bold text-white text-sm block truncate">
                                      {ex.name}
                                    </span>
                                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider mt-0.5 font-stat ${badgeStyle}`}>
                                      {ex.muscle || 'Груди'}
                                    </span>
                                  </div>
                                </div>

                                {/* Right side: "Останній раз робив: [ 85 КГ ] × [ 8 РАЗІВ ]" */}
                                <div className="flex items-center gap-1.5">
                                  {isEditingThis ? (
                                    <div className="flex items-center gap-1 bg-[#08090C] border border-[#CCFF00] rounded-xl p-1">
                                      <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.5"
                                        value={editingEx.weight}
                                        onChange={(e) => setEditingEx({ ...editingEx, weight: e.target.value })}
                                        className="w-12 bg-[#141824] text-center font-stat font-bold text-xs text-white rounded p-1 outline-none"
                                        placeholder="кг"
                                      />
                                      <span className="text-xs text-[#8E95A5]">×</span>
                                      <input
                                        type="number"
                                        inputMode="numeric"
                                        value={editingEx.reps}
                                        onChange={(e) => setEditingEx({ ...editingEx, reps: e.target.value })}
                                        className="w-10 bg-[#141824] text-center font-stat font-bold text-xs text-white rounded p-1 outline-none"
                                        placeholder="раз"
                                      />
                                      <button
                                        onClick={() => handleSaveQuickRecord(program.id, day.id, ex.id, editingEx.weight, editingEx.reps)}
                                        className="p-1 bg-[#CCFF00] text-black rounded font-bold"
                                      >
                                        <Check size={14} strokeWidth={3} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        haptic.selection();
                                        setEditingEx({
                                          progId: program.id,
                                          dayId: day.id,
                                          exId: ex.id,
                                          weight: ex.lastWeight || 0,
                                          reps: ex.lastReps || 0
                                        });
                                      }}
                                      className="px-2.5 py-1.5 bg-[#08090C] hover:bg-[#141824] border border-[#232734] hover:border-[#CCFF00]/50 rounded-xl text-right active-press transition-all"
                                      title="Натисни для швидкого редагування"
                                    >
                                      <span className="text-[9px] uppercase font-bold text-[#8E95A5] block">
                                        Останній раз:
                                      </span>
                                      <div className="font-stat font-black text-xs text-[#CCFF00] flex items-center gap-1">
                                        <span className="bg-[#141824] px-1.5 py-0.5 rounded border border-[#232734]">
                                          {ex.lastWeight || 0} КГ
                                        </span>
                                        <span className="text-[#8E95A5]">×</span>
                                        <span className="bg-[#141824] px-1.5 py-0.5 rounded border border-[#232734]">
                                          {ex.lastReps || 0} РАЗІВ
                                        </span>
                                      </div>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteExercise(program.id, day.id, ex.id)}
                                    className="p-1.5 text-[#6F778B] hover:text-rose-400 active-press"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Exercise Modal / Form toggle */}
                      {addingExerciseToDay?.progId === program.id && addingExerciseToDay?.dayId === day.id ? (
                        <div className="bg-[#11141D] border border-[#CCFF00]/50 rounded-2xl p-3 space-y-2.5 animate-in fade-in">
                          <input
                            type="text"
                            value={newExName}
                            onChange={(e) => setNewExName(e.target.value)}
                            placeholder="Назва вправи (напр: Жим гантелей)"
                            className="w-full bg-[#08090C] border border-[#232734] rounded-xl px-3 py-2 text-sm font-bold text-white outline-none"
                          />

                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={newExMuscle}
                              onChange={(e) => setNewExMuscle(e.target.value)}
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2 py-2 text-xs font-bold text-white outline-none"
                            >
                              {MUSCLE_GROUPS.map((m) => (
                                <option key={m.name} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.5"
                              value={newExWeight}
                              onChange={(e) => setNewExWeight(e.target.value)}
                              placeholder="Вага (кг)"
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2 py-2 text-xs font-stat font-bold text-center text-white outline-none"
                            />

                            <input
                              type="number"
                              inputMode="numeric"
                              value={newExReps}
                              onChange={(e) => setNewExReps(e.target.value)}
                              placeholder="Рази"
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2 py-2 text-xs font-stat font-bold text-center text-white outline-none"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setAddingExerciseToDay(null)}
                              className="px-3 py-1 text-xs font-bold text-[#8E95A5] uppercase"
                            >
                              Скасувати
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddExercise(program.id, day.id)}
                              className="px-4 py-1.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl glow-volt-sm"
                            >
                              Додати вправу
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            haptic.selection();
                            setAddingExerciseToDay({ progId: program.id, dayId: day.id });
                          }}
                          style={{ minHeight: '38px' }}
                          className="w-full py-2 bg-[#11141D] hover:bg-[#181D2A] border border-[#1E2330] rounded-xl text-xs font-black uppercase text-[#8E95A5] hover:text-[#CCFF00] flex items-center justify-center gap-1.5 active-press transition-colors font-stat"
                        >
                          <Plus size={14} />
                          <span>+ ДОДАТИ ВПРАВУ</span>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddDayToProgram(program.id)}
                    style={{ minHeight: '40px' }}
                    className="w-full py-2.5 bg-[#08090C] border border-dashed border-[#232734] rounded-2xl text-xs font-black uppercase tracking-wider text-[#A6B0C3] hover:text-white flex items-center justify-center gap-1.5 active-press font-stat"
                  >
                    <Plus size={15} />
                    <span>ДОДАТИ ДЕНЬ ДО ЦІЄЇ ПРОГРАМИ</span>
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
