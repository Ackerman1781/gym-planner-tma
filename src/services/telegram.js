// Telegram Web App API Wrapper & Haptic/Sound Engine

export const tg = typeof window !== 'undefined' && window.Telegram?.WebApp ? window.Telegram.WebApp : null;

export const initTelegramApp = () => {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
      }
    } catch (e) {
      console.warn('Telegram WebApp init warning:', e);
    }
  }
};

// Haptic feedback with fallbacks
export const haptic = {
  impact: (style = 'medium') => {
    try {
      tg?.HapticFeedback?.impactOccurred(style);
    } catch (e) {}
  },
  success: () => {
    try {
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {}
  },
  warning: () => {
    try {
      tg?.HapticFeedback?.notificationOccurred('warning');
    } catch (e) {}
  },
  selection: () => {
    try {
      tg?.HapticFeedback?.selectionChanged();
    } catch (e) {}
  }
};

// Clean synthesized audio chime for Rest Timer completion (works even on mobile webview!)
export const playTimerChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // 3 short pleasant beeps
    const now = ctx.currentTime;
    [0, 0.18, 0.36].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 2 ? 880 : 660, now + delay); // E5 -> A5
      
      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.16);
    });
  } catch (e) {
    console.warn('Audio playback not permitted yet:', e);
  }
};

// Telegram CloudStorage with LocalStorage fallback
export const cloudStorage = {
  get: async (key) => {
    // Try Telegram CloudStorage first if available
    if (tg?.CloudStorage?.getItem) {
      return new Promise((resolve) => {
        try {
          tg.CloudStorage.getItem(key, (err, value) => {
            if (!err && value) {
              resolve(value);
            } else {
              resolve(localStorage.getItem(key));
            }
          });
        } catch (e) {
          resolve(localStorage.getItem(key));
        }
      });
    }
    return localStorage.getItem(key);
  },

  set: async (key, value) => {
    // Always write to local storage first for instant responsiveness
    try {
      localStorage.setItem(key, value);
    } catch (e) {}

    // Also persist to Telegram Cloud
    if (tg?.CloudStorage?.setItem) {
      return new Promise((resolve) => {
        try {
          tg.CloudStorage.setItem(key, value, (err, success) => {
            resolve(!err && success);
          });
        } catch (e) {
          resolve(false);
        }
      });
    }
    return true;
  }
};

// Web Notification helper
export const triggerBrowserNotification = (title, body) => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  } catch (e) {
    console.warn('Browser notification error:', e);
  }
};

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user || {
    id: 'local_user',
    first_name: 'Артем',
    username: 'ackerman'
  };
};
