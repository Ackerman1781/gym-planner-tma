import React, { useState } from 'react';
import { 
  Cloud, Download, Upload, ShieldCheck, Bot 
} from 'lucide-react';
import { haptic, getTelegramUser } from '../services/telegram';
import { DEFAULT_PROGRAMS, DEFAULT_TASKS, DEFAULT_HISTORY } from '../services/storage';

export const SettingsTab = ({ 
  tasks, 
  setTasks, 
  programs, 
  setPrograms, 
  history, 
  setHistory 
}) => {
  const user = getTelegramUser();

  const handleExportJSON = () => {
    haptic.impact('heavy');
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      user: user?.id,
      tasks,
      programs,
      history
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironplan_backup_${new Date().toISOString().split('T')[0]}.json`;
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
      haptic.success();
    }
  };

  return (
    <div className="flex-1 pb-28 pt-4 px-4 max-w-md mx-auto w-full">
      {/* Top Banner */}
      <div className="mb-5 bg-[#12151D] border border-[#232734] rounded-3xl p-4 shadow-lg">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E95A5] block">
          НАЛАШТУВАННЯ
        </span>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
          СИСТЕМА & ХМАРА
        </h2>
      </div>

      {/* Athlete Profile Card */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-4 shadow-lg flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-[#CCFF00]/15 border-2 border-[#CCFF00]/40 text-[#CCFF00] flex items-center justify-center font-black text-xl font-stat glow-volt-sm">
          {user?.first_name?.charAt(0) || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-black text-white uppercase truncate">
              {user?.first_name} {user?.last_name || ''}
            </h3>
            <ShieldCheck size={16} className="text-[#CCFF00] shrink-0" />
          </div>
          <p className="text-xs font-bold text-[#8E95A5] truncate font-stat mt-0.5">
            @{user?.username || 'athlete'} • ID: {user?.id}
          </p>
        </div>
      </div>

      {/* Cloud Status */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Cloud size={20} className="text-[#CCFF00]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Синхронізація Telegram</h3>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-black text-[#CCFF00] bg-[#CCFF00]/15 px-2.5 py-1 rounded-full border border-[#CCFF00]/30 glow-volt-sm uppercase">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
            АКТИВНА 24/7
          </span>
        </div>
        <p className="text-xs font-bold text-[#8E95A5] leading-relaxed">
          Всі тренування, ваги та плани автоматично закріплені за твоїм Telegram ID. Додаток працює надійно навіть при вимкненому ПК.
        </p>
      </div>

      {/* Backup Controls */}
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

      {/* Bot Info */}
      <div className="bg-[#12151D] border border-[#232734] rounded-3xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={18} className="text-[#CCFF00]" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Бот у Telegram</h3>
        </div>
        <p className="text-xs font-bold text-[#8E95A5] leading-relaxed">
          Додаток прив'язаний до <strong className="text-white">@ackerman_gym_bot</strong>. Меню налаштовано через кнопку запуску.
        </p>
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
