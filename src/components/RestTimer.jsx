import React, { useEffect, useState, useRef } from 'react';
import { Timer, X, Plus, Play, Pause, CheckCircle2 } from 'lucide-react';
import { haptic, playTimerChime } from '../services/telegram';

export const RestTimer = ({ initialSeconds = 90, onFinish, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, secondsLeft]);

  const handleComplete = () => {
    haptic.success();
    playTimerChime();
    if (onFinish) onFinish();
  };

  const addTime = (secs) => {
    haptic.impact('heavy');
    setSecondsLeft((prev) => prev + secs);
  };

  const toggleRun = () => {
    haptic.selection();
    setIsRunning(!isRunning);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-24 left-3 right-3 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom duration-200">
      <div className="bg-[#12151D]/98 border-2 border-[#CCFF00] backdrop-blur-2xl rounded-3xl p-4 shadow-2xl shadow-[#CCFF00]/10 text-white flex items-center justify-between glow-volt-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 flex items-center justify-center bg-[#CCFF00]/15 rounded-2xl text-[#CCFF00] border border-[#CCFF00]/40">
            <Timer size={26} strokeWidth={2.5} className={isRunning && secondsLeft > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#8E95A5] font-black flex items-center gap-1.5">
              <span>ВІДПОЧИНОК</span>
              {secondsLeft === 0 && <span className="text-[#CCFF00] font-black animate-pulse">ЧАС ПРАЦЮВАТИ! 💥</span>}
            </div>
            <div className="text-2xl font-black font-stat tracking-tight text-white flex items-center gap-2">
              {formatTime(secondsLeft)}
              {secondsLeft === 0 && (
                <CheckCircle2 size={22} className="text-[#CCFF00] animate-bounce" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addTime(30)}
            className="px-3.5 py-2 bg-[#1A1E29] active-press border border-[#2B3142] rounded-2xl text-xs font-black uppercase text-[#CCFF00] flex items-center gap-1 glow-volt-sm"
          >
            <Plus size={14} strokeWidth={3} /> 30С
          </button>
          
          <button
            onClick={toggleRun}
            className="p-2.5 bg-[#1A1E29] active-press border border-[#2B3142] rounded-2xl text-white"
          >
            {isRunning ? <Pause size={18} strokeWidth={2.5} /> : <Play size={18} strokeWidth={2.5} className="text-[#CCFF00]" />}
          </button>

          <button
            onClick={() => {
              haptic.impact('light');
              onClose();
            }}
            className="p-2.5 bg-[#1A1E29]/60 active-press border border-[#2B3142] rounded-2xl text-[#8E95A5] hover:text-rose-400"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
