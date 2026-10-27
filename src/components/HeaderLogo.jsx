import React from 'react';
import { getTelegramUser } from '../services/telegram';

export const HeaderLogo = () => {
  const user = getTelegramUser();

  return (
    <header className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#1A1D27] bg-[#08090C]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Custom SVG Kinetic Monolith Logo */}
        <div className="relative flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_0_10px_rgba(204,255,0,0.35)]"
          >
            {/* Hexagonal Iron Plate Outline */}
            <polygon
              points="24,4 43,14 43,34 24,44 5,34 5,14"
              fill="#12151D"
              stroke="#CCFF00"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Inner Plate Detail */}
            <polygon
              points="24,10 38,18 38,30 24,38 10,30 10,18"
              fill="#08090C"
              stroke="#262B3A"
              strokeWidth="1.5"
            />
            {/* Kinetic Power Flash / Lightning Core */}
            <path
              d="M26 13L16 26H24L22 35L32 22H24L26 13Z"
              fill="#CCFF00"
            />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-white uppercase italic m-0 font-['Space_Grotesk',sans-serif]">
              IRON<span className="text-[#CCFF00]">PLAN</span>
            </h1>
            <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 uppercase">
              PRO
            </span>
          </div>
          <p className="text-[10px] tracking-wider font-semibold text-[#8E95A5] uppercase">
            Performance & Gym System
          </p>
        </div>
      </div>

      {/* User Avatar Pill */}
      <div className="flex items-center gap-2 bg-[#12151D] border border-[#232734] py-1 px-2.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
        <span className="text-xs font-bold text-white max-w-[90px] truncate">
          {user?.first_name || 'Атлет'}
        </span>
      </div>
    </header>
  );
};
