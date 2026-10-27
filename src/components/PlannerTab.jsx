import React, { useState } from 'react';
import { 
  Check, Plus, Trash2, ArrowRightCircle, 
  Flame, Calendar, Sparkles, Bell, BellOff, Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../services/telegram';

const CATEGORIES = [
  { id: 'gym', label: 'ЗАЛ', icon: '🏋️' },
  { id: 'goal', label: 'ЦІЛЬ', icon: '🎯' },
  { id: 'work', label: 'СПРАВИ', icon: '💼' },
  { id: 'home', label: 'ДІМ', icon: '🏠' }
];

export const PlannerTab = ({ tasks, setTasks }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('gym');
  const [priority, setPriority] = useState('normal');
  const [reminderTime, setReminderTime] = useState('18:00');
  const [hasReminder, setHasReminder] = useState(true);

  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedCount = dayTasks.filter((t) => t.completed).length;
  const progressPercent = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

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

  const handleRequestNotification = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    haptic.impact('heavy');
    if (hasReminder) {
      handleRequestNotification();
    }

    const newTask = {
      id: 'task_' + Date.now(),
      text: taskText.trim(),
      date: selectedDate,
      completed: false,
      priority,
      category,
      reminderTime: hasReminder ? reminderTime : null,
      hasReminder,
      createdAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setTaskText('');
  };

  const toggleTask = (taskId) => {
    haptic.impact('medium');
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          haptic.success();
          const remaining = dayTasks.filter((dt) => dt.id !== taskId && !dt.completed);
          if (remaining.length === 0) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.65 }
            });
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    setTasks(updated);
  };

  const toggleReminder = (taskId, e) => {
    e.stopPropagation();
    haptic.selection();
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, hasReminder: !t.hasReminder };
      }
      return t;
    });
    setTasks(updated);
  };

  const deleteTask = (taskId) => {
    haptic.impact('heavy');
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const moveIncompleteToTomorrow = () => {
    haptic.impact('heavy');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let count = 0;
    const updated = tasks.map((t) => {
      if (t.date === selectedDate && !t.completed) {
        count += 1;
        return { ...t, date: tomorrowStr };
      }
      return t;
    });

    if (count > 0) {
      setTasks(updated);
      setSelectedDate(tomorrowStr);
      haptic.success();
    }
  };

  const getDayOffsetDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const yesterdayStr = getDayOffsetDate(-1);
  const tomorrowStr = getDayOffsetDate(1);

  return (
    <div className="flex-1 pb-28 pt-4 px-4 max-w-md mx-auto w-full">
      {/* Top Banner with Big Streak */}
      <div className="flex items-center justify-between mb-5 bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#8E95A5] block">
            РОЗКЛАД ТА СПРАВИ
          </span>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
            ПЛАНУВАННЯ ДНЯ
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/40 rounded-2xl text-[#CCFF00] font-black text-sm glow-volt-sm">
            <Flame size={18} className="text-[#CCFF00] fill-[#CCFF00] animate-bounce" />
            <span className="font-stat">{calculateStreak()} ДНІВ</span>
          </div>
          <span className="text-[10px] text-[#8E95A5] font-bold uppercase mt-1">Серія фокусу</span>
        </div>
      </div>

      {/* Date Switcher Bar */}
      <div className="grid grid-cols-4 gap-2 p-1.5 bg-[#12151D] border border-[#232734] rounded-2xl mb-4">
        <button
          onClick={() => { haptic.selection(); setSelectedDate(yesterdayStr); }}
          className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            selectedDate === yesterdayStr
              ? 'bg-[#232734] text-white shadow-md'
              : 'text-[#6F778B] hover:text-white'
          }`}
        >
          Вчора
        </button>
        <button
          onClick={() => { haptic.selection(); setSelectedDate(todayStr); }}
          className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            selectedDate === todayStr
              ? 'bg-[#CCFF00] text-black font-black glow-volt-sm'
              : 'text-[#6F778B] hover:text-white'
          }`}
        >
          Сьогодні
        </button>
        <button
          onClick={() => { haptic.selection(); setSelectedDate(tomorrowStr); }}
          className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            selectedDate === tomorrowStr
              ? 'bg-[#232734] text-white shadow-md'
              : 'text-[#6F778B] hover:text-white'
          }`}
        >
          Завтра
        </button>
        <label
          className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            selectedDate !== todayStr && selectedDate !== yesterdayStr && selectedDate !== tomorrowStr
              ? 'bg-[#232734] text-[#CCFF00] border border-[#CCFF00]/40'
              : 'text-[#6F778B] hover:text-white'
          }`}
        >
          <Calendar size={14} />
          <span>{selectedDate.slice(5)}</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                haptic.selection();
                setSelectedDate(e.target.value);
              }
            }}
            className="sr-only"
          />
        </label>
      </div>

      {/* Progress Card */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-extrabold text-[#8E95A5] uppercase tracking-wider">
            {selectedDate === todayStr ? 'ПРОГРЕС СЬОГОДНІ' : `ДАТА: ${selectedDate}`}
          </span>
          <span className="text-base font-black font-stat text-[#CCFF00]">
            {completedCount}/{dayTasks.length} <span className="text-xs text-[#8E95A5]">({progressPercent}%)</span>
          </span>
        </div>
        <div className="w-full h-3 bg-[#08090C] rounded-full overflow-hidden p-0.5 border border-[#232734]">
          <div
            className="h-full bg-[#CCFF00] transition-all duration-300 rounded-full glow-volt-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task with Reminders (Things 3 style) */}
      <form onSubmit={handleAddTask} className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Що потрібно виконати?.."
            className="flex-1 bg-[#08090C] border border-[#232734] rounded-2xl px-4 py-3.5 text-base font-bold text-white placeholder-[#6F778B] focus:outline-none focus:border-[#CCFF00] transition-colors"
          />
          <button
            type="submit"
            disabled={!taskText.trim()}
            className="w-14 h-14 bg-[#CCFF00] disabled:opacity-30 disabled:hover:bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xl flex items-center justify-center glow-volt-sm shrink-0"
          >
            <Plus size={26} strokeWidth={3} />
          </button>
        </div>

        {/* Time Reminder & Category Controls */}
        <div className="space-y-2.5 pt-2 border-t border-[#1C202C]">
          <div className="flex items-center justify-between">
            {/* Reminder Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  haptic.selection();
                  setHasReminder(!hasReminder);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  hasReminder
                    ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40'
                    : 'bg-[#191D28] text-[#8E95A5]'
                }`}
              >
                {hasReminder ? <Bell size={14} className="animate-bounce" /> : <BellOff size={14} />}
                <span>{hasReminder ? 'Нагадування вкл' : 'Без нагадування'}</span>
              </button>

              {hasReminder && (
                <div className="flex items-center gap-1 bg-[#08090C] border border-[#2B3142] rounded-xl px-2.5 py-1 text-xs font-stat font-bold text-white">
                  <Clock size={13} className="text-[#CCFF00]" />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-transparent text-white focus:outline-none text-xs"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setPriority(priority === 'normal' ? 'high' : 'normal');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                priority === 'high'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              {priority === 'high' ? '🔥 ВАЖЛИВО' : 'ЗВИЧАЙНЕ'}
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { haptic.selection(); setCategory(cat.id); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  category === cat.id
                    ? 'bg-[#CCFF00] text-black glow-volt-sm'
                    : 'bg-[#191D28] text-[#8E95A5] border border-transparent'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-3 mb-5">
        {dayTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#12151D]/60 border border-dashed border-[#232734] rounded-3xl">
            <Sparkles size={36} className="mx-auto text-[#6F778B] mb-3 opacity-60" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Планів на цей день немає
            </h3>
            <p className="text-xs text-[#8E95A5] font-semibold mt-1">
              Додай задачу з нагадуванням або відпочивай!
            </p>
          </div>
        ) : (
          dayTasks.map((task) => {
            const catObj = CATEGORIES.find((c) => c.id === task.category) || CATEGORIES[0];

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-150 ${
                  task.completed
                    ? 'bg-[#0E1017] border-[#1C202C] opacity-60'
                    : 'bg-[#12151D] border-[#232734] shadow-md'
                }`}
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${
                      task.completed
                        ? 'bg-[#CCFF00] border-[#CCFF00] text-black glow-volt-sm'
                        : 'border-[#363C4E] hover:border-[#CCFF00] bg-[#08090C]'
                    }`}
                  >
                    {task.completed && <Check size={22} strokeWidth={3.5} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base font-bold leading-snug break-words ${
                        task.completed ? 'line-through text-[#6F778B]' : 'text-white'
                      }`}
                    >
                      {task.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-bold text-[#8E95A5] flex items-center gap-1 uppercase tracking-wider">
                        <span>{catObj.icon}</span> {catObj.label}
                      </span>
                      {task.hasReminder && task.reminderTime && (
                        <button
                          type="button"
                          onClick={(e) => toggleReminder(task.id, e)}
                          className="text-[10px] text-[#CCFF00] font-black bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <Bell size={11} />
                          <span>{task.reminderTime}</span>
                        </button>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[10px] text-rose-400 font-black bg-rose-500/15 px-2 py-0.5 rounded-md uppercase">
                          ВАЖЛИВО
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2.5 text-[#6F778B] hover:text-rose-400 active-press rounded-xl ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Move Incomplete to Tomorrow */}
      {dayTasks.some((t) => !t.completed) && (
        <button
          onClick={moveIncompleteToTomorrow}
          className="w-full py-3.5 px-4 bg-[#191D28] hover:bg-[#232734] active-press border border-[#2B3142] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <ArrowRightCircle size={18} className="text-[#CCFF00]" />
          <span>Перенести невиконане на завтра</span>
        </button>
      )}
    </div>
  );
};
