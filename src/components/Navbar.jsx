import React from 'react';
import { CalendarCheck2, Dumbbell, Activity, LineChart, Settings } from 'lucide-react';
import { haptic } from '../services/telegram';

export const Navbar = ({ currentTab, setTab, hasActiveWorkout }) => {
  const tabs = [
    { id: 'planner', label: 'Плани', icon: CalendarCheck2 },
    { id: 'workouts', label: 'Зал', icon: Dumbbell },
    { 
      id: 'active', 
      label: 'Тренування', 
      icon: Activity, 
      highlight: hasActiveWorkout 
    },
    { id: 'progress', label: 'Прогрес / 1ПМ', icon: LineChart },
    { id: 'settings', label: 'Хмара', icon: Settings }
  ];

  const handleSelect = (tabId) => {
    haptic.selection();
    setTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#161b22]/95 backdrop-blur-md border-t border-[#30363d] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="max-w-md mx-auto px-3 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-emerald-400 font-semibold scale-105'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              {tab.highlight && (
                <span className="absolute top-1 right-3.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
