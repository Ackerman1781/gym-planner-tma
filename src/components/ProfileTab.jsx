import React, { useState } from 'react';
import { 
  Trophy, History, Plus, Trash2, Calendar, 
  Cloud, Download, Upload, ShieldCheck, ChevronDown, ChevronUp, Bot 
} from 'lucide-react';
import { haptic, getTelegramUser } from '../services/telegram';
import { formatDuration } from '../services/fitnessMath';
import { DEFAULT_PROGRAMS, DEFAULT_TASKS, DEFAULT_HISTORY, DEFAULT_RECORDS } from '../services/storage';

export const ProfileTab = ({ 
  history, 
  records, 
  setRecords, 
  tasks, 
  setTasks, 
  programs, 
  setPrograms, 
  setHistory 
}) => {
  const user = getTelegramUser();
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Add new PR modal state
  const [isAddingPR, setIsAddingPR] = useState(false);
  const [newPRExercise, setNewPRExercise] = useState('');
  const [newPRWeight, setNewPRWeight] = useState(100);
  const [newPRDate, setNewPRDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddPR = (e) => {
    e.preventDefault();
    if (!newPRExercise.trim()) return;

    haptic.impact('heavy');
    const newRecord = {
      id: 'pr_' + Date.now(),
      exercise: newPRExercise.trim(),
      weight: parseFloat(newPRWeight) || 0,
      reps: 1,
      date: newPRDate
    };

    setRecords([newRecord, ...records]);
    setNewPRExercise('');
    setIsAddingPR(false);
    haptic.success();
  };

  const handleDeletePR = (id) => {
    haptic.impact('medium');
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleExportJSON = () => {
    haptic.impact('heavy');
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      user: user?.id,
      tasks,
      programs,
      history,
      records
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ackerman_progress_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    haptic.success();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.programs) setPrograms(parsed.programs);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.records) setRecords(parsed.records);
        haptic.success();
        alert('Дані успішно відновлено!');
      } catch (err) {
        alert('Помилка читання файлу резервної копії.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    haptic.impact('heavy');
    if (confirm('Скинути всі дані до початкових зразків?')) {
      setTasks(DEFAULT_TASKS);
      setPrograms(DEFAULT_PROGRAMS);
      setHistory(DEFAULT_HISTORY);
      setRecords(DEFAULT_RECORDS);
      haptic.success();
    }
  };

  return (
    <div className="flex-1 pb-28 pt-4 px-4 max-w-md mx-auto w-full">
      {/* Top Profile Card */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#CCFF00]/15 border-2 border-[#CCFF00]/40 text-[#CCFF00] flex items-center justify-center font-black text-xl font-stat glow-volt-sm">
            {user?.first_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-white uppercase italic leading-tight m-0 font-['Space_Grotesk',sans-serif]">
                {user?.first_name} {user?.last_name || ''}
              </h2>
              <ShieldCheck size={16} className="text-[#CCFF00] shrink-0" />
            </div>
            <p className="text-xs font-bold text-[#8E95A5] uppercase font-stat mt-0.5">
              @{user?.username || 'athlete'} • ID: {user?.id}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-black text-[#CCFF00] bg-[#CCFF00]/15 px-2.5 py-1 rounded-full border border-[#CCFF00]/30 glow-volt-sm uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse"></span>
          ХМАРА 24/7
        </span>
      </div>

      {/* Personal Records & Best Lifts (Календар жимів на раз / Рекорди) */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
              <Trophy size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase italic leading-tight font-['Space_Grotesk',sans-serif]">
                Календар жимів на раз (PR)
              </h3>
              <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
                Твої максимальні силові рекорди
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              haptic.selection();
              setIsAddingPR(!isAddingPR);
            }}
            className="px-3 py-1.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl glow-volt-sm active-press flex items-center gap-1"
          >
            <Plus size={14} strokeWidth={3} />
            <span>ДОДАТИ</span>
          </button>
        </div>

        {/* Add PR Form */}
        {isAddingPR && (
          <form onSubmit={handleAddPR} className="bg-[#08090C] border-2 border-[#CCFF00] rounded-2xl p-3.5 mb-3.5 space-y-2.5 animate-in fade-in">
            <input
              type="text"
              value={newPRExercise}
              onChange={(e) => setNewPRExercise(e.target.value)}
              placeholder="Вправа (напр: Жим лежачи на раз)"
              className="w-full bg-[#12151D] border border-[#232734] rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-[#6F778B] focus:outline-none focus:border-[#CCFF00]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={newPRWeight}
                onChange={(e) => setNewPRWeight(e.target.value)}
                placeholder="Вага на 1 раз (кг)"
                className="bg-[#12151D] border border-[#232734] rounded-xl px-3 py-2 text-xs font-stat font-bold text-white text-center"
              />
              <input
                type="date"
                value={newPRDate}
                onChange={(e) => setNewPRDate(e.target.value)}
                className="bg-[#12151D] border border-[#232734] rounded-xl px-3 py-2 text-xs font-bold text-white text-center"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingPR(false)}
                className="px-3 py-1 text-xs font-bold text-[#8E95A5] uppercase"
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl glow-volt-sm"
              >
                Зберегти рекорд
              </button>
            </div>
          </form>
        )}

        {/* PR List */}
        <div className="space-y-2.5">
          {records.length === 0 ? (
            <div className="text-center py-6 text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
              Немає записаних рекордів
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#08090C] border border-[#1F2432] rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center font-stat font-black text-xs">
                    1RM
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm uppercase leading-tight">{rec.exercise}</h4>
                    <span className="text-[10px] font-bold text-[#8E95A5] flex items-center gap-1 mt-0.5">
                      <Calendar size={11} /> {rec.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-stat font-black text-lg text-[#CCFF00] glow-volt-sm">
                    {rec.weight} <span className="text-xs font-bold text-[#8E95A5]">КГ</span>
                  </span>
                  <button
                    onClick={() => handleDeletePR(rec.id)}
                    className="p-1.5 text-[#6F778B] hover:text-rose-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Workout History */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
            <History size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase italic leading-tight font-['Space_Grotesk',sans-serif]">
              Історія тренувань ({history.length})
            </h3>
            <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">Журнал завершених тренувань</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-6 text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
              Історія порожня
            </div>
          ) : (
            history.map((workout) => {
              const isExpanded = expandedHistoryId === workout.id;
              const dateStr = workout.date ? new Date(workout.date).toLocaleDateString('uk-UA') : 'Нещодавно';

              return (
                <div
                  key={workout.id}
                  className="bg-[#08090C] border border-[#1F2432] rounded-2xl p-3 cursor-pointer select-none active:bg-[#12151D]"
                  onClick={() => {
                    haptic.selection();
                    setExpandedHistoryId(isExpanded ? null : workout.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white uppercase text-sm leading-snug">{workout.dayName}</h4>
                      <span className="text-[10px] font-bold text-[#8E95A5]">
                        {dateStr} • {formatDuration(workout.durationSeconds || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] font-black font-stat text-xs border border-[#CCFF00]/30">
                        {workout.stats?.totalTonnage || 0} КГ
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-[#8E95A5]" /> : <ChevronDown size={16} className="text-[#8E95A5]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-[#1F2432] space-y-1">
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

      {/* Simple Settings & Backup */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-4 shadow-lg space-y-3">
        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">
          Резервне копіювання даних
        </h3>

        <button
          onClick={handleExportJSON}
          className="w-full py-3 px-4 bg-[#08090C] hover:bg-[#161A24] active-press border border-[#2B3142] rounded-2xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Download size={16} className="text-[#CCFF00]" />
          <span>Завантажити копію (JSON)</span>
        </button>

        <label className="w-full py-3 px-4 bg-[#08090C] hover:bg-[#161A24] active-press border border-[#2B3142] rounded-2xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
          <Upload size={16} className="text-[#CCFF00]" />
          <span>Відновити з файлу (JSON)</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="sr-only"
          />
        </label>
      </div>

      {/* Reset Defaults */}
      <button
        onClick={handleResetDefaults}
        className="w-full py-2.5 text-[#8E95A5] hover:text-rose-400 text-xs font-black uppercase tracking-wider text-center"
      >
        Скинути все до початкових зразків
      </button>
    </div>
  );
};
