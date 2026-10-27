import React, { useState } from 'react';
import { 
  Play, Plus, Dumbbell, ChevronDown, ChevronUp, 
  Trash2, Zap, Layers 
} from 'lucide-react';
import { haptic } from '../services/telegram';

export const WorkoutsTab = ({ programs, setPrograms, onStartWorkout }) => {
  const [expandedProgramId, setExpandedProgramId] = useState(programs[0]?.id || null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  
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
            СИЛОВІ ПРОГРАМИ
          </span>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
            БАЗА ТРЕНУВАНЬ
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
            Нова тренувальна програма
          </h3>
          <input
            type="text"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            placeholder="Назва (напр: Спліт на масу)"
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

      {/* Programs List */}
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

              {/* Days Accordion Body */}
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
                            {day.exercises?.length || 0} ВПРАВ У СПИСКУ
                          </span>
                        </div>

                        {/* Bold Start Workout Button */}
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

                      {/* Exercises in this Day */}
                      <div className="space-y-2 mb-3">
                        {day.exercises?.map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-[#12151D] border border-[#1F2432]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-[#CCFF00] font-stat font-extrabold text-xs w-5">
                                {idx < 9 ? `0${idx + 1}` : idx + 1}
                              </span>
                              <div className="truncate">
                                <span className="font-bold text-white text-sm block truncate">
                                  {ex.name}
                                </span>
                                <span className="text-[11px] font-extrabold text-[#8E95A5] uppercase tracking-wider">
                                  {ex.muscle} • {ex.targetSets} СЕТИ × {ex.targetReps}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteExercise(program.id, day.id, ex.id)}
                              className="text-[#6F778B] hover:text-rose-400 p-1.5"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Exercise Form */}
                      {addingExerciseToDay === day.id ? (
                        <div className="bg-[#12151D] border-2 border-dashed border-[#CCFF00]/40 rounded-2xl p-3.5 space-y-2.5">
                          <input
                            type="text"
                            value={newExName}
                            onChange={(e) => setNewExName(e.target.value)}
                            placeholder="Назва вправи (напр: Жим штанги)"
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
                              value={newExSets}
                              onChange={(e) => setNewExSets(e.target.value)}
                              placeholder="Сети"
                              className="bg-[#08090C] border border-[#232734] rounded-xl px-2.5 py-2 text-xs font-bold text-white text-center"
                            />
                            <input
                              type="text"
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
