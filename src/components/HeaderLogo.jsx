import React from 'react';
import { getTelegramUser } from '../services/telegram';

export const HeaderLogo = () => {
  const user = getTelegramUser();

  return (
    <header className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#1F2432] bg-[#08090C]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Kinetic Iron Monolith SVG Logo */}
        <div className="relative flex items-center justify-center">
          <svg
            width="38"
            height="38"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]"
          >
            <polygon
              points="24,4 43,14 43,34 24,44 5,34 5,14"
              fill="#12151D"
              stroke="#CCFF00"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polygon
              points="24,10 38,18 38,30 24,38 10,30 10,18"
              fill="#08090C"
              stroke="#2B3142"
              strokeWidth="1.5"
            />
            <path
              d="M26 13L16 26H24L22 35L32 22H24L26 13Z"
              fill="#CCFF00"
            />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-white uppercase italic m-0 font-['Space_Grotesk',sans-serif]">
              ACKERMAN <span className="text-[#CCFF00]">PROGRESS</span>
            </h1>
          </div>
          <p className="text-[10px] tracking-wider font-extrabold text-[#8E95A5] uppercase">
            Performance & Life System
          </p>
        </div>
      </div>

      {/* User Status Badge */}
      <div className="flex items-center gap-2 bg-[#12151D] border border-[#232734] py-1 px-3 rounded-full glow-volt-sm">
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
        <span className="text-xs font-black text-white max-w-[85px] truncate">
          {user?.first_name || 'Атлет'}
        </span>
      </div>
    </header>
  );
};
