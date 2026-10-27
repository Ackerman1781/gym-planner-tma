import React from 'react';
import { Sliders } from 'lucide-react';
import { AckermanLogo, StreakFlameIcon } from './CustomIcons';
import { haptic } from '../services/telegram';

export const Header = ({ streak = 14, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#08090C]/90 backdrop-blur-xl border-b border-[#1A1F2C] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-2.5">
          <AckermanLogo size={34} className="hover:scale-105 transition-transform" />
          <div>
            <h1 className="text-lg font-black text-white italic tracking-tight font-['Space_Grotesk',sans-serif] leading-none m-0">
              ACKERMAN <span className="text-[#CCFF00]">PROGRESS</span>
            </h1>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8E95A5] block mt-0.5 font-stat">
              PERFORMANCE ENGINE
            </span>
          </div>
        </div>

        {/* Right side: Streak Badge + Settings Icon */}
        <div className="flex items-center gap-2">
          {/* Discipline Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12151D] border border-[#232734] drop-shadow-[0_0_8px_rgba(204,255,0,0.15)]">
            <StreakFlameIcon size={17} active={true} />
            <span className="font-stat font-black text-sm text-[#CCFF00] leading-none">
              {streak}
            </span>
            <span className="text-[9px] font-black uppercase text-[#8E95A5] tracking-wider leading-none">
              ДНІВ
            </span>
          </div>

          {/* Settings Trigger Icon (SVG only) */}
          <button
            onClick={() => {
              haptic.selection();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-xl bg-[#12151D] border border-[#232734] hover:border-[#CCFF00]/50 active-press flex items-center justify-center text-[#A6B0C3] hover:text-[#CCFF00] transition-colors"
            title="Налаштування"
          >
            <Sliders size={18} strokeWidth={2.3} />
          </button>
        </div>
      </div>
    </header>
  );
};
