import React, { useState } from 'react';
import { 
  Play, Plus, Dumbbell, ChevronDown, ChevronUp, 
  Trash2, Edit2, Check, Flame 
} from 'lucide-react';
import { haptic } from '../services/telegram';

export const WorkoutsTab = ({ programs, setPrograms, onStartWorkout }) => {
  const [expandedProgramId, setExpandedProgramId] = useState(programs[0]?.id || null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  
  // Adding exercise modal/form
  const [addingExerciseToDay, setAddingExerciseToDay] = useState(null);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('');
  const [newExWeight, setNewExWeight] = useState(60);
  const [newExReps, setNewExReps] = useState(10);

  // Quick edit record modal/state for an exercise
  const [editingEx, setEditingEx] = useState(null); // { programId, dayId, exId, weight, reps }

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
                    muscle: newExMuscle.trim() || 'Загальне',
                    lastWeight: parseFloat(newExWeight) || 0,
                    lastReps: parseInt(newExReps, 10) || 10
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
    <div className="flex-1 pb-28 pt-4 px-4 max-w-md mx-auto w-full">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-5 bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#8E95A5] block">
            СИЛОВИЙ БЛОК
          </span>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
            ПРОГРАМИ ТРЕНУВАНЬ
          </h2>
        </div>
        <button
          onClick={() => {
            haptic.selection();
            setIsCreatingProgram(!isCreatingProgram);
          }}
          className="px-4 py-2.5 bg-[#CCFF00] active-press text-black rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 glow-volt-sm"
        >
          <Plus size={16} strokeWidth={3} />
          <span>СТВОРИТИ</span>
        </button>
      </div>

      {/* New Program Input Card */}
      {isCreatingProgram && (
        <form onSubmit={handleCreateProgram} className="bg-[#12151D] border-2 border-[#CCFF00] rounded-3xl p-4 mb-5 shadow-2xl animate-in fade-in">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
            Нова програма тренувань
          </h3>
          <input
            type="text"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            placeholder="Назва спліту (напр: Силовий 3-денний)"
            className="w-full bg-[#08090C] border border-[#232734] rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-[#6F778B] focus:outline-none focus:border-[#CCFF00] mb-3"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingProgram(false)}
              className="px-4 py-2 text-xs font-bold text-[#8E95A5] rounded-xl uppercase"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={!newProgramName.trim()}
              className="px-5 py-2.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl glow-volt-sm disabled:opacity-40"
            >
              Створити
            </button>
          </div>
        </form>
      )}

      {/* Programs List (Gymshark / Hevy Style) */}
      <div className="space-y-4">
        {programs.map((program) => {
          const isExpanded = expandedProgramId === program.id;

          return (
            <div
              key={program.id}
              className="bg-[#12151D] border border-[#232734] rounded-3xl overflow-hidden shadow-md transition-all"
            >
              {/* Program Header */}
              <div
                onClick={() => toggleExpand(program.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none active:bg-[#191D28]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center shrink-0">
                    <Dumbbell size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic leading-tight m-0 font-['Space_Grotesk',sans-serif]">
                      {program.name}
                    </h3>
                    <p className="text-xs font-extrabold text-[#8E95A5] uppercase tracking-wider mt-0.5">
                      {program.days?.length || 0} {program.days?.length === 1 ? 'ДЕНЬ' : 'ДНІВ'} ТРЕНУВАНЬ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProgram(program.id);
                    }}
                    className="p-2 text-[#6F778B] hover:text-rose-400"
                  >
                    <Trash2 size={18} />
                  </button>
                  {isExpanded ? <ChevronUp size={24} className="text-[#8E95A5]" /> : <ChevronDown size={24} className="text-[#8E95A5]" />}
                </div>
              </div>

              {/* Days Body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#1C202C] space-y-4">
                  {program.days?.map((day) => (
                    <div
                      key={day.id}
                      className="bg-[#08090C] border border-[#232734] rounded-3xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div>
                          <h4 className="text-base font-black text-white uppercase italic flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]"></span>
                            {day.name}
                          </h4>
                          <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
                            {day.exercises?.length || 0} ВПРАВ
                          </span>
                        </div>

                        {/* Start Workout Button */}
                        <button
                          onClick={() => {
                            haptic.impact('heavy');
                            onStartWorkout(program, day);
                          }}
                          className="px-4 py-2.5 bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 glow-volt-sm transition-all"
                        >
                          <Play size={15} fill="currentColor" />
                          <span>ПОЧАТИ</span>
                        </button>
                      </div>

                      {/* Exercises List (Gymshark style: Exercise + Muscle + Last Record: 80 kg × 8) */}
                      <div className="space-y-2.5 mb-3.5">
                        {day.exercises?.map((ex, idx) => {
                          const isEditingThis = editingEx && editingEx.exId === ex.id;

                          return (
                            <div
                              key={ex.id || idx}
                              className="p-3 rounded-2xl bg-[#12151D] border border-[#1F2432] flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[#CCFF00] font-stat font-extrabold text-xs w-5">
                                  {idx < 9 ? `0${idx + 1}` : idx + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-white text-sm block truncate">
                                    {ex.name}
                                  </span>
                                  <span className="text-[11px] font-extrabold text-[#8E95A5] uppercase tracking-wider">
                                    {ex.muscle || 'Загальне'}
                                  </span>
                                </div>
                              </div>

                              {/* Right side: Last recorded weight and reps (Editable in 1 click!) */}
                              <div className="flex items-center gap-2">
                                {isEditingThis ? (
                                  <div className="flex items-center gap-1 bg-[#08090C] border border-[#CCFF00] rounded-xl p-1">
                                    <input
                                      type="number"
                                      value={editingEx.weight}
                                      onChange={(e) => setEditingEx({ ...editingEx, weight: e.target.value })}
                                      className="w-12 bg-[#12151D] text-center font-stat font-bold text-xs text-white rounded p-1"
                                      placeholder="кг"
                                    />
                                    <span className="text-xs text-[#8E95A5]">×</span>
                                    <input
                                      type="number"
                                      value={editingEx.reps}
                                      onChange={(e) => setEditingEx({ ...editingEx, reps: e.target.value })}
                                      className="w-10 bg-[#12151D] text-center font-stat font-bold text-xs text-white rounded p-1"
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
                                        programId: program.id,
                                        dayId: day.id,
                                        exId: ex.id,
                                        weight: ex.lastWeight || 0,
                                        reps: ex.lastReps || 0
                                      });
                                    }}
                                    className="px-2.5 py-1.5 bg-[#08090C] hover:bg-[#182015] border border-[#2B3142] hover:border-[#CCFF00]/40 rounded-xl text-right active-press transition-all"
                                    title="Натисни, щоб змінити останню вагу"
                                  >
                                    <span className="text-[9px] uppercase font-bold text-[#8E95A5] block">
                                      Останній раз:
                                    </span>
                                    <span className="font-stat font-black text-xs text-[#CCFF00]">
                                      {ex.lastWeight || 0} кг × {ex.lastReps || 0}
                                    </span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteExercise(program.id, day.id, ex.id)}
                                  className="text-[#6F778B] hover:text-rose-400 p-1.5"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Exercise Form */}
                      {addingExerciseToDay === day.id ? (
                        <div className="bg-[#12151D] border-2 border-dashed border-[#CCFF00]/40 rounded-2xl p-3.5 space-y-2.5">
                          <input
                            type="text"
                            value={newExName}
                            onChange={(e) => setNewExName(e.target.value)}
                            placeholder="Назва вправи (напр: Жим лежачи)"
                            className="w-full bg-[#08090C] border border-[#232734] rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-[#6F778B] focus:outline-none focus:border-[#CCFF00]"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={newExMuscle}
                              onChange={(e) => setNewExMuscle(e.target.value)}
                              placeholder="М'язи (Груди)"
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2.5 py-2 text-xs font-bold text-white placeholder-[#6F778B]"
                            />
                            <input
                              type="number"
                              value={newExWeight}
                              onChange={(e) => setNewExWeight(e.target.value)}
                              placeholder="Вага (кг)"
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2.5 py-2 text-xs font-bold text-white text-center"
                            />
                            <input
                              type="number"
                              value={newExReps}
                              onChange={(e) => setNewExReps(e.target.value)}
                              placeholder="Повтори"
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2.5 py-2 text-xs font-bold text-white text-center"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setAddingExerciseToDay(null)}
                              className="px-3 py-1.5 text-xs font-bold text-[#8E95A5] uppercase"
                            >
                              Скасувати
                            </button>
                            <button
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
                            setAddingExerciseToDay(day.id);
                          }}
                          className="w-full py-2.5 border-2 border-dashed border-[#232734] hover:border-[#CCFF00]/40 text-[#8E95A5] hover:text-[#CCFF00] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active-press transition-all"
                        >
                          <Plus size={16} strokeWidth={3} />
                          <span>Додати вправу в цей день</span>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddDayToProgram(program.id)}
                    className="w-full py-3 bg-[#12151D] hover:bg-[#191D28] border border-[#232734] rounded-2xl text-xs font-black uppercase tracking-wider text-[#CCFF00] flex items-center justify-center gap-2 active-press transition-all"
                  >
                    <Plus size={16} strokeWidth={3} />
                    <span>Додати новий день тренувань</span>
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
