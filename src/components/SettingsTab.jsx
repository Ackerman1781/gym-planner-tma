import React, { useState } from 'react';
import { 
  Cloud, Download, Upload, RefreshCw, 
  User, CheckCircle2, ShieldCheck, HelpCircle, Bot, ExternalLink 
} from 'lucide-react';
import { haptic, getTelegramUser, tg } from '../services/telegram';
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
  const [copied, setCopied] = useState(false);

  const handleExportJSON = () => {
    haptic.impact('medium');
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
        alert('Дані успішно відновлено з файлу!');
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
    <div className="flex-1 pb-24 pt-3 px-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Хмара & Налаштування</span>
        </h1>
        <p className="text-xs text-[#8b949e]">Автономність, хмарні копії та підключення</p>
      </div>

      {/* Telegram User Profile Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-4 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
          {user?.first_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-white truncate">
              {user?.first_name} {user?.last_name || ''}
            </h3>
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          </div>
          <p className="text-xs text-[#8b949e] truncate">
            @{user?.username || 'telegram_user'} • ID: {user?.id}
          </p>
        </div>
      </div>

      {/* Cloud Status */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Хмарна синхронізація</h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Активна 24/7
          </span>
        </div>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          Всі твої плани, програми тренувань і підходи автоматично зберігаються в хмарі Telegram (CloudStorage) та локально на пристрої. Працює автономно навіть з вимкненим комп'ютером.
        </p>
      </div>

      {/* Backup & Restore Controls */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">Резервне копіювання</h3>

        <button
          onClick={handleExportJSON}
          className="w-full py-2.5 px-3 bg-[#0d1117] hover:bg-[#21262d] active:scale-98 border border-[#30363d] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
        >
          <Download size={15} className="text-emerald-400" />
          <span>Завантажити копію (JSON)</span>
        </button>

        <label className="w-full py-2.5 px-3 bg-[#0d1117] hover:bg-[#21262d] active:scale-98 border border-[#30363d] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer">
          <Upload size={15} className="text-emerald-400" />
          <span>Відновити з файлу (JSON)</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="sr-only"
          />
        </label>
      </div>

      {/* How to Connect to Telegram Bot Instruction */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Як додати кнопку в бот</h3>
        </div>
        <ol className="text-xs text-[#8b949e] space-y-2 list-decimal list-inside leading-relaxed">
          <li>Зайди в <strong className="text-white">@BotFather</strong> у Telegram.</li>
          <li>Введи команду <strong className="text-emerald-400">/mybots</strong> і обери свого бота.</li>
          <li>Натисни <strong className="text-white">Bot Settings → Menu Button → Configure Menu Button</strong>.</li>
          <li>Вкажи URL сайту (який видасть Vercel) та назву, наприклад: <strong className="text-white">🏋️ IronPlan</strong>.</li>
        </ol>
      </div>

      {/* Reset */}
      <button
        onClick={handleResetDefaults}
        className="w-full py-2 text-[#8b949e] hover:text-rose-400 text-xs font-semibold text-center"
      >
        Скинути дані до тестових зразків
      </button>
    </div>
  );
};
