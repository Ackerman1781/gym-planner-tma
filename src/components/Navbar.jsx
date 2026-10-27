import React from 'react';
import { Home, CalendarCheck2, Dumbbell, Zap, Users } from 'lucide-react';
import { haptic } from '../services/telegram';

const NAV_ITEMS = [
  { id: 'home', label: 'ГОЛОВНА', icon: Home },
  { id: 'planner', label: 'ПЛАНИ', icon: CalendarCheck2 },
  { id: 'workouts', label: 'ЗАЛ', icon: Dumbbell },
  { id: 'training', label: 'ТРЕНУВАННЯ', icon: Zap },
  { id: 'squad', label: 'КОМАНДА', icon: Users }
];

export const Navbar = ({ currentTab, setTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090C]/95 backdrop-blur-2xl border-t border-[#1C212E] pb-[max(10px,env(safe-area-inset-bottom))] pt-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                haptic.selection();
                setTab(item.id);
              }}
              style={{ minHeight: '52px' }}
              className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-150 active-press select-none ${
                isActive
                  ? 'text-[#CCFF00]'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.8 : 2}
                  className={`transition-transform duration-150 ${
                    isActive
                      ? 'scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.65)]'
                      : ''
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#CCFF00] drop-shadow-[0_0_4px_rgba(204,255,0,0.8)]" />
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-tight mt-1 font-stat ${
                  isActive ? 'text-[#CCFF00]' : 'text-[#8E95A5]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
