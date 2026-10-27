import React, { useState } from 'react';
import { 
  Check, Plus, Trash2, ArrowRightCircle, 
  Flame, Calendar, Sparkles, Filter 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../services/telegram';

const CATEGORIES = [
  { id: 'gym', label: 'Зал', icon: '🏋️' },
  { id: 'goal', label: 'Ціль', icon: '🎯' },
  { id: 'work', label: 'Справи', icon: '💼' },
  { id: 'home', label: 'Дім', icon: '🏠' }
];

export const PlannerTab = ({ tasks, setTasks }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('gym');
  const [priority, setPriority] = useState('normal');

  // Filter tasks for the selected date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedCount = dayTasks.filter((t) => t.completed).length;
  const progressPercent = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  // Calculate streak: consecutive days with at least 1 completed task
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
        // If today is incomplete, check yesterday
        if (dStr === todayStr && streak === 0) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return Math.max(streak, 1);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    haptic.impact('medium');
    const newTask = {
      id: 'task_' + Date.now(),
      text: taskText.trim(),
      date: selectedDate,
      completed: false,
      priority,
      category,
      createdAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setTaskText('');
  };

  const toggleTask = (taskId) => {
    haptic.impact('light');
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          haptic.success();
          // Check if this was the last task to complete
          const remaining = dayTasks.filter((dt) => dt.id !== taskId && !dt.completed);
          if (remaining.length === 0) {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.7 }
            });
          }
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    setTasks(updated);
  };

  const deleteTask = (taskId) => {
    haptic.impact('medium');
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
    <div className="flex-1 pb-24 pt-3 px-4 max-w-md mx-auto w-full">
      {/* Header with Streak */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Щоденник планів</span>
          </h1>
          <p className="text-xs text-[#8b949e]">Керуй своїм днем та тримай фокус</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl text-amber-400 font-bold text-xs shadow-sm">
          <Flame size={16} className="text-orange-400 fill-orange-400 animate-bounce" />
          <span>{calculateStreak()} днів серія</span>
        </div>
      </div>

      {/* Date Switcher Bar */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#161b22] border border-[#30363d] rounded-2xl mb-4">
        <button
          onClick={() => { haptic.selection(); setSelectedDate(yesterdayStr); }}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            selectedDate === yesterdayStr
              ? 'bg-[#21262d] text-white shadow-sm'
              : 'text-[#8b949e] hover:text-white'
          }`}
        >
          Вчора
        </button>
        <button
          onClick={() => { haptic.selection(); setSelectedDate(todayStr); }}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            selectedDate === todayStr
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'text-[#8b949e] hover:text-white'
          }`}
        >
          Сьогодні
        </button>
        <button
          onClick={() => { haptic.selection(); setSelectedDate(tomorrowStr); }}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            selectedDate === tomorrowStr
              ? 'bg-[#21262d] text-white shadow-sm'
              : 'text-[#8b949e] hover:text-white'
          }`}
        >
          Завтра
        </button>
        <label
          className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            selectedDate !== todayStr && selectedDate !== yesterdayStr && selectedDate !== tomorrowStr
              ? 'bg-[#21262d] text-emerald-400 border border-emerald-500/30'
              : 'text-[#8b949e] hover:text-white'
          }`}
        >
          <Calendar size={13} />
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

      {/* Day Progress Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-[#8b949e] uppercase tracking-wider">
            {selectedDate === todayStr ? 'Сьогоднішній прогрес' : `Дата: ${selectedDate}`}
          </span>
          <span className="font-bold text-emerald-400">
            {completedCount}/{dayTasks.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Input Form */}
      <form onSubmit={handleAddTask} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Що плануєш зробити?.."
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!taskText.trim()}
            className="p-2.5 bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-500 active:scale-95 text-black rounded-xl font-bold transition-all shadow-sm flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Category & Priority Selectors */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#21262d]">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { haptic.selection(); setCategory(cat.id); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  category === cat.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#21262d] text-[#8b949e] border border-transparent'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              haptic.selection();
              setPriority(priority === 'normal' ? 'high' : 'normal');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              priority === 'high'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            {priority === 'high' ? '🔥 Важливо' : 'Звичайне'}
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-2 mb-4">
        {dayTasks.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#161b22]/50 border border-dashed border-[#30363d] rounded-2xl">
            <Sparkles size={32} className="mx-auto text-[#8b949e] mb-2 opacity-50" />
            <p className="text-sm font-semibold text-white">Планів на цей день немає</p>
            <p className="text-xs text-[#8b949e] mt-1">Додай задачу зверху або скористайся відпочинком!</p>
          </div>
        ) : (
          dayTasks.map((task) => {
            const catObj = CATEGORIES.find((c) => c.id === task.category) || CATEGORIES[0];

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 ${
                  task.completed
                    ? 'bg-[#161b22]/40 border-[#21262d] opacity-65'
                    : 'bg-[#161b22] border-[#30363d] shadow-sm'
                }`}
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-sm'
                        : 'border-[#484f58] hover:border-emerald-400 bg-[#0d1117]'
                    }`}
                  >
                    {task.completed && <Check size={16} strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug break-words ${
                        task.completed ? 'line-through text-[#8b949e]' : 'text-white'
                      }`}
                    >
                      {task.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#8b949e] flex items-center gap-1">
                        <span>{catObj.icon}</span> {catObj.label}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Важливо
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-[#8b949e] hover:text-rose-400 active:scale-90 transition-all ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Action to Move Incomplete Tasks to Tomorrow */}
      {dayTasks.some((t) => !t.completed) && (
        <button
          onClick={moveIncompleteToTomorrow}
          className="w-full py-2.5 px-3 bg-[#21262d] hover:bg-[#30363d] active:scale-98 border border-[#30363d] text-[#c9d1d9] rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <ArrowRightCircle size={15} className="text-emerald-400" />
          <span>Перенести невиконані плани на завтра</span>
        </button>
      )}
    </div>
  );
};
