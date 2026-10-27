import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowRightCircle, Bell, BellOff, 
  Clock, Check, Sparkles, CalendarDays 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomCheckbox, CategoryTagIcon } from './CustomIcons';
import { haptic, triggerBrowserNotification } from '../services/telegram';

const CATEGORIES = [
  { id: 'gym', tag: '#Зал' },
  { id: 'study', tag: '#Навчання' },
  { id: 'work', tag: '#Справи' },
  { id: 'personal', tag: '#Особисте' }
];

export const PlannerTab = ({ tasks, setTasks, soundEnabled = true }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('gym');
  const [reminderTime, setReminderTime] = useState('17:30');
  const [hasReminder, setHasReminder] = useState(true);

  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedCount = dayTasks.filter((t) => t.completed).length;
  const progressPercent = dayTasks.length > 0 
    ? Math.round((completedCount / dayTasks.length) * 100) 
    : 0;

  const handleRequestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    haptic.impact('heavy');
    if (hasReminder) {
      handleRequestNotificationPermission();
    }

    const newTask = {
      id: 'task_' + Date.now(),
      text: taskText.trim(),
      date: selectedDate,
      completed: false,
      category,
      reminderTime: hasReminder ? reminderTime : null,
      hasReminder,
      createdAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setTaskText('');
    haptic.success();
  };

  const toggleTask = (taskId) => {
    haptic.impact('medium');
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          haptic.success();
          // Check if all today's tasks completed -> trigger confetti celebration!
          const remaining = dayTasks.filter((dt) => dt.id !== taskId && !dt.completed);
          if (remaining.length === 0) {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#CCFF00', '#FFFFFF', '#00F0FF']
            });
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    setTasks(updated);
  };

  const toggleReminder = (taskId) => {
    haptic.selection();
    handleRequestNotificationPermission();
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, hasReminder: !t.hasReminder };
      }
      return t;
    });
    setTasks(updated);
  };

  const deleteTask = (taskId) => {
    haptic.impact('medium');
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const moveToTomorrow = (taskId) => {
    haptic.impact('medium');
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, date: tomorrowStr };
      }
      return t;
    });
    setTasks(updated);
  };

  return (
    <div className="flex-1 pb-28 pt-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-150">
      {/* Date Switcher */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            haptic.selection();
            setSelectedDate(todayStr);
          }}
          style={{ minHeight: '44px' }}
          className={`flex-1 rounded-2xl font-black text-xs uppercase tracking-wider font-stat transition-all active-press ${
            selectedDate === todayStr
              ? 'bg-[#CCFF00] text-black drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]'
              : 'bg-[#11141D] text-[#8E95A5] border border-[#222838]'
          }`}
        >
          СЬОГОДНІ
        </button>

        <button
          onClick={() => {
            haptic.selection();
            setSelectedDate(tomorrowStr);
          }}
          style={{ minHeight: '44px' }}
          className={`flex-1 rounded-2xl font-black text-xs uppercase tracking-wider font-stat transition-all active-press ${
            selectedDate === tomorrowStr
              ? 'bg-[#CCFF00] text-black drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]'
              : 'bg-[#11141D] text-[#8E95A5] border border-[#222838]'
          }`}
        >
          ЗАВТРА
        </button>

        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="sr-only"
            id="planner-date-input"
          />
          <label
            htmlFor="planner-date-input"
            style={{ minHeight: '44px', minWidth: '44px' }}
            className={`rounded-2xl border flex items-center justify-center cursor-pointer active-press ${
              selectedDate !== todayStr && selectedDate !== tomorrowStr
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                : 'bg-[#11141D] text-[#8E95A5] border-[#222838]'
            }`}
          >
            <CalendarDays size={18} />
          </label>
        </div>
      </div>

      {/* Daily Progress Card */}
      <div className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat block">
              ПРОГРЕС ДНЯ
            </span>
            <h3 className="text-lg font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
              {completedCount} з {dayTasks.length} ВИКОНАНО ({progressPercent}%)
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="w-full h-2 bg-[#08090C] rounded-full overflow-hidden border border-[#1E2330]">
          <div
            className="h-full bg-[#CCFF00] rounded-full transition-all duration-300 drop-shadow-[0_0_6px_rgba(204,255,0,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Form (Todoist / Apple Reminders style) */}
      <form onSubmit={handleAddTask} className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 mb-4 shadow-xl space-y-3">
        <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-widest block font-stat">
          НОВИЙ ПЛАН
        </span>

        {/* Task Title */}
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Що потрібно зробити?"
          className="w-full bg-[#08090C] border border-[#222838] focus:border-[#CCFF00] rounded-2xl px-4 py-3 text-base font-bold text-white placeholder-[#6F778B] outline-none transition-all"
        />

        {/* Category Tag Selection */}
        <div>
          <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1.5 font-stat">
            ТЕГ КАТЕГОРІЇ
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setCategory(cat.id);
                  }}
                  style={{ minHeight: '38px' }}
                  className={`rounded-xl flex items-center justify-center gap-1.5 text-xs font-black uppercase font-stat transition-all active-press ${
                    isSelected
                      ? 'bg-[#CCFF00] text-black drop-shadow-[0_0_6px_rgba(204,255,0,0.3)]'
                      : 'bg-[#08090C] border border-[#222838] text-[#8E95A5]'
                  }`}
                >
                  <CategoryTagIcon category={cat.id} size={14} />
                  <span>{cat.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reminder settings */}
        <div className="bg-[#08090C] border border-[#222838] rounded-2xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setHasReminder(!hasReminder);
              }}
              style={{ minHeight: '38px' }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black uppercase font-stat transition-all active-press ${
                hasReminder
                  ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40'
                  : 'bg-[#141824] text-[#8E95A5]'
              }`}
            >
              {hasReminder ? <Bell size={14} /> : <BellOff size={14} />}
              <span>{hasReminder ? 'Нагадування увімкнено' : 'Без нагадування'}</span>
            </button>
          </div>

          {hasReminder && (
            <div className="flex items-center gap-1.5 bg-[#141824] px-2.5 py-1 rounded-xl border border-[#262E40]">
              <Clock size={13} className="text-[#CCFF00]" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-transparent text-white font-stat font-bold text-xs outline-none"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{ minHeight: '48px' }}
          className="w-full bg-[#CCFF00] text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active-press glow-volt-sm"
        >
          <Plus size={16} strokeWidth={3} />
          <span>ДОДАТИ ДО ПЛАНУ</span>
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-2.5">
        {dayTasks.length === 0 ? (
          <div className="text-center py-10 bg-[#11141D] border border-dashed border-[#222838] rounded-3xl">
            <CalendarCheck2 size={32} className="mx-auto text-[#8E95A5] mb-2 opacity-50" />
            <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider block">
              На цей день завдань немає
            </span>
          </div>
        ) : (
          dayTasks.map((t) => {
            const catObj = CATEGORIES.find((c) => c.id === t.category) || CATEGORIES[0];

            return (
              <div
                key={t.id}
                className={`bg-[#11141D] border rounded-2xl p-3.5 flex items-center justify-between transition-all duration-200 ${
                  t.completed
                    ? 'border-[#1E2330] opacity-60'
                    : 'border-[#222838] hover:border-[#CCFF00]/40 shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <CustomCheckbox
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    size={28}
                  />

                  <div className="min-w-0 flex-1">
                    <span
                      className={`font-bold text-sm block truncate transition-all ${
                        t.completed
                          ? 'line-through text-[#6F778B]'
                          : 'text-white'
                      }`}
                    >
                      {t.text}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-md font-stat">
                        <CategoryTagIcon category={t.category} size={11} />
                        <span>{catObj.tag}</span>
                      </span>

                      {t.reminderTime && (
                        <button
                          type="button"
                          onClick={() => toggleReminder(t.id)}
                          className={`inline-flex items-center gap-1 text-[10px] font-stat font-bold px-1.5 py-0.5 rounded-md active-press ${
                            t.hasReminder
                              ? 'text-[#CCFF00] bg-[#CCFF00]/10'
                              : 'text-[#6F778B] bg-[#141824]'
                          }`}
                        >
                          {t.hasReminder ? <Bell size={11} /> : <BellOff size={11} />}
                          <span>{t.reminderTime}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!t.completed && (
                    <button
                      onClick={() => moveToTomorrow(t.id)}
                      title="Перенести на завтра"
                      style={{ minHeight: '36px', minWidth: '36px' }}
                      className="p-2 rounded-xl bg-[#08090C] text-[#8E95A5] hover:text-[#CCFF00] active-press flex items-center justify-center border border-[#1E2330]"
                    >
                      <ArrowRightCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(t.id)}
                    style={{ minHeight: '36px', minWidth: '36px' }}
                    className="p-2 rounded-xl bg-[#08090C] text-[#8E95A5] hover:text-rose-400 active-press flex items-center justify-center border border-[#1E2330]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
