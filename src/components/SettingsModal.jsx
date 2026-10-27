import React, { useState } from 'react';
import { X, Volume2, VolumeX, Download, Upload, RotateCcw, Check, User, Shield } from 'lucide-react';
import { UserVectorAvatar } from './CustomIcons';
import { haptic } from '../services/telegram';

const AVATAR_OPTIONS = ['titan', 'boss', 'cyborg', 'warrior', 'beast', 'phoenix'];

export const SettingsModal = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetDefaults,
  onExportJSON,
  onImportJSON
}) => {
  if (!isOpen) return null;

  const [nickname, setNickname] = useState(profile?.nickname || 'Артем');
  const [avatarId, setAvatarId] = useState(profile?.avatarId || 'titan');
  const [soundEnabled, setSoundEnabled] = useState(profile?.soundEnabled ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    haptic.success();
    onUpdateProfile({
      ...profile,
      nickname: nickname.trim() || 'Атлет',
      avatarId,
      soundEnabled
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-[#0E1118] border-2 border-[#232734] rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1E2330]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                НАЛАШТУВАННЯ ПРОФІЛЮ
              </h3>
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase font-stat tracking-wider">
                ACKERMAN CONFIG
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              haptic.impact('light');
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#171B26] text-[#8E95A5] hover:text-white flex items-center justify-center active-press"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nickname Input */}
          <div>
            <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-[#CCFF00]" />
              <span>ТВІЙ НІКНЕЙМ У ДОДАТКУ ТА СУПЕРНИЦТВІ</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Введи свій нікнейм"
              className="w-full bg-[#141824] border border-[#262E40] focus:border-[#CCFF00] rounded-2xl px-4 py-3 text-white text-base font-bold placeholder-[#6F778B] outline-none transition-all"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-2">
              ОБЕРИ ВЕКТОРНИЙ КІБЕР-АВАТАР
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setAvatarId(id);
                  }}
                  className={`p-1 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    avatarId === id
                      ? 'border-[#CCFF00] bg-[#CCFF00]/15 scale-105 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <UserVectorAvatar avatarId={id} size={36} />
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="bg-[#141824] border border-[#232734] rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00]">
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
              <div>
                <span className="text-xs font-black text-white uppercase block">
                  ЗВУКОВІ СИГНАЛИ ТА ТАЙМЕР
                </span>
                <span className="text-[10px] font-bold text-[#8E95A5]">
                  Гонг завершення відпочинку та нагадування
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setSoundEnabled(!soundEnabled);
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors active-press ${
                soundEnabled ? 'bg-[#CCFF00]' : 'bg-[#232734]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Save Profile Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#CCFF00] text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active-press glow-volt-sm"
          >
            {savedSuccess ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>ЗБЕРЕЖЕНО!</span>
              </>
            ) : (
              <span>ЗБЕРЕГТИ ЗМІНИ</span>
            )}
          </button>
        </form>

        {/* Backup & Restore Data */}
        <div className="mt-5 pt-4 border-t border-[#1E2330] space-y-2">
          <span className="text-[10px] font-black uppercase text-[#8E95A5] tracking-widest block mb-2 font-stat">
            СИНХРОНІЗАЦІЯ & БЕКАП ДАНИХ
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onExportJSON}
              className="py-2.5 px-3 bg-[#141824] border border-[#232734] hover:border-[#CCFF00]/40 rounded-xl text-[11px] font-black uppercase text-white flex items-center justify-center gap-1.5 active-press"
            >
              <Download size={14} className="text-[#CCFF00]" />
              <span>Експорт JSON</span>
            </button>

            <label className="py-2.5 px-3 bg-[#141824] border border-[#232734] hover:border-[#CCFF00]/40 rounded-xl text-[11px] font-black uppercase text-white flex items-center justify-center gap-1.5 active-press cursor-pointer">
              <Upload size={14} className="text-[#CCFF00]" />
              <span>Імпорт JSON</span>
              <input type="file" accept=".json" onChange={onImportJSON} className="sr-only" />
            </label>
          </div>

          {/* Reset to starter defaults */}
          <button
            type="button"
            onClick={onResetDefaults}
            className="w-full mt-2 py-2 text-rose-400 hover:text-rose-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active-press"
          >
            <RotateCcw size={12} />
            <span>Скинути все до стартового пресету</span>
          </button>
        </div>
      </div>
    </div>
  );
};
