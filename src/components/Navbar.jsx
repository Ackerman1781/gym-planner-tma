import React from 'react';
import { CalendarCheck2, Dumbbell, Zap, TrendingUp, Cpu } from 'lucide-react';
import { haptic } from '../services/telegram';

export const Navbar = ({ currentTab, setTab, hasActiveWorkout }) => {
  const tabs = [
    { id: 'planner', label: 'ПЛАНИ', icon: CalendarCheck2 },
    { id: 'workouts', label: 'ЗАЛ', icon: Dumbbell },
    { 
      id: 'active', 
      label: 'СЕСІЯ', 
      icon: Zap, 
      highlight: hasActiveWorkout 
    },
    { id: 'progress', label: 'ПРОГРЕС', icon: TrendingUp },
    { id: 'settings', label: 'СИСТЕМА', icon: Cpu }
  ];

  const handleSelect = (tabId) => {
    haptic.selection();
    setTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0E14]/95 backdrop-blur-xl border-t border-[#1F2432] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
      <div className="max-w-md mx-auto px-2 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl active-press transition-all duration-150 ${
                isActive
                  ? 'text-[#CCFF00] font-black scale-105'
                  : 'text-[#6F778B] hover:text-[#A6B0C3]'
              }`}
            >
              {tab.highlight && (
                <span className="absolute top-1 right-2.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CCFF00]"></span>
                </span>
              )}
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#CCFF00]/15 shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.8 : 2} />
              </div>
              <span className="text-[10px] mt-1 font-extrabold tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
