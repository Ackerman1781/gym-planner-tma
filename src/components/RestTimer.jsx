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
    haptic.impact('light');
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

  const progress = Math.max(0, Math.min(100, (secondsLeft / initialSeconds) * 100));

  return (
    <div className="fixed bottom-20 left-3 right-3 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom duration-200">
      <div className="bg-[#1c2128]/95 border border-emerald-500/40 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl shadow-emerald-950/40 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/30">
            <Timer size={22} className={isRunning && secondsLeft > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#8b949e] font-semibold flex items-center gap-1.5">
              <span>Відпочинок</span>
              {secondsLeft === 0 && <span className="text-emerald-400 font-bold">Час до бою! 💥</span>}
            </div>
            <div className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              {formatTime(secondsLeft)}
              {secondsLeft === 0 && (
                <CheckCircle2 size={18} className="text-emerald-400 animate-bounce" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addTime(30)}
            className="px-2.5 py-1.5 bg-[#21262d] active:bg-[#30363d] border border-[#30363d] rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus size={13} /> 30с
          </button>
          
          <button
            onClick={toggleRun}
            className="p-2 bg-[#21262d] active:bg-[#30363d] border border-[#30363d] rounded-xl text-[#c9d1d9] active:scale-95 transition-all"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} className="text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              haptic.impact('light');
              onClose();
            }}
            className="p-2 bg-[#21262d]/50 active:bg-rose-900/30 border border-[#30363d] rounded-xl text-[#8b949e] hover:text-rose-400 active:scale-95 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
