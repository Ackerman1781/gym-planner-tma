import React from 'react';

// 1. ACKERMAN PROGRESS Brand Emblem (Gymshark-inspired aggressive geometric minimalism)
export const AckermanLogo = ({ size = 36, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="ackermanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CCFF00" />
        <stop offset="100%" stopColor="#88B800" />
      </linearGradient>
      <filter id="voltGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer Hexagonal Heavy Titanium Rim */}
    <polygon
      points="32,4 58,18 58,46 32,60 6,46 6,18"
      fill="#10131B"
      stroke="#CCFF00"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Inner Chiseled Core */}
    <polygon
      points="32,12 50,22 50,42 32,52 14,42 14,22"
      fill="#08090C"
      stroke="#272E3E"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Aggressive Cybernetic Lightning / Progress Bolt */}
    <path
      d="M36 15L20 33H33L28 49L46 29H33L36 15Z"
      fill="url(#ackermanGrad)"
      filter="url(#voltGlow)"
    />
  </svg>
);

// 2. Discipline Streak Flame with Volt Lightning Core (NO emojis!)
export const StreakFlameIcon = ({ size = 20, active = true, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M12 2C10 5 7 8 7 12C7 15.5 9.5 19 12 21C14.5 19 17 15.5 17 12C17 7 13 4 12 2Z"
      fill={active ? '#CCFF00' : '#4B5563'}
      className={active ? 'drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]' : ''}
    />
    <path
      d="M12 7L10 12H13L11 17L15 11H12L12 7Z"
      fill="#08090C"
    />
  </svg>
);

// 3. Leaderboard Podium Badges (Gold Crown, Silver Shield, Bronze Crest)
export const PodiumBadge = ({ place = 1, size = 22, className = '' }) => {
  if (place === 1) {
    // Gold Crown for Top 1
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)] ${className}`}
      >
        <path
          d="M3 18L4.5 9L9 13.5L12 6L15 13.5L19.5 9L21 18H3Z"
          fill="#FFD700"
          stroke="#FFF275"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="3" y="18" width="18" height="3" rx="1" fill="#FFC300" />
        <circle cx="12" cy="5" r="1.5" fill="#FFFFFF" />
        <circle cx="4.5" cy="8" r="1.2" fill="#FFFFFF" />
        <circle cx="19.5" cy="8" r="1.2" fill="#FFFFFF" />
      </svg>
    );
  }
  if (place === 2) {
    // Silver Shield for Top 2
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 drop-shadow-[0_0_6px_rgba(226,232,240,0.5)] ${className}`}
      >
        <path
          d="M12 2L4 5V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V5L12 2Z"
          fill="#334155"
          stroke="#E2E8F0"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 5V19C15 18 17.5 14 17.5 11V6.5L12 5Z"
          fill="#94A3B8"
        />
        <text x="12" y="15" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">2</text>
      </svg>
    );
  }
  // Bronze Crest for Top 3
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_0_6px_rgba(205,127,50,0.4)] ${className}`}
    >
      <path
        d="M12 2L4 5V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V5L12 2Z"
        fill="#3A2414"
        stroke="#CD7F32"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 5V19C15 18 17.5 14 17.5 11V6.5L12 5Z"
        fill="#B87333"
      />
      <text x="12" y="15" fill="#FFE5D0" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">3</text>
    </svg>
  );
};

// 4. Cyber-Athletic Rank Badges (ROOKIE, PRO, TITAN, ACKERMAN BOSS)
export const RankBadge = ({ rank = 'ROOKIE', size = 18, showLabel = true, className = '' }) => {
  const normRank = rank ? rank.toUpperCase() : 'ROOKIE';

  if (normRank.includes('BOSS')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00] text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.4)] ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 19L4 7L8.5 12L12 4L15.5 12L20 7L22 19H2Z" fill="#CCFF00" />
          <circle cx="12" cy="3" r="1.5" fill="#FFFFFF" />
        </svg>
        {showLabel && <span className="text-[10px] font-black uppercase tracking-wider font-stat">BOSS</span>}
      </div>
    );
  }

  if (normRank === 'TITAN') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FFB703]/15 border border-[#FFB703]/70 text-[#FFB703] ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 6V12C3 17.5 6.8 21.5 12 23C17.2 21.5 21 17.5 21 12V6L12 2Z" fill="#FFB703" stroke="#FFE8A3" strokeWidth="1.5" />
          <path d="M13 6L8 13H12L11 18L16 11H12L13 6Z" fill="#08090C" />
        </svg>
        {showLabel && <span className="text-[10px] font-black uppercase tracking-wider font-stat">TITAN</span>}
      </div>
    );
  }

  if (normRank === 'PRO') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/60 text-[#00F0FF] ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 22,8.5 22,17.5 12,22 2,17.5 2,8.5" fill="#00F0FF" />
          <polygon points="12,6 18,10 18,15 12,18 6,15 6,10" fill="#08090C" />
          <circle cx="12" cy="12" r="2.5" fill="#00F0FF" />
        </svg>
        {showLabel && <span className="text-[10px] font-black uppercase tracking-wider font-stat">PRO</span>}
      </div>
    );
  }

  // ROOKIE
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#8E95A5]/15 border border-[#8E95A5]/40 text-[#A6B0C3] ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L4 6.5V12C4 16.5 7.4 20.5 12 21.8C16.6 20.5 20 16.5 20 12V6.5L12 3Z" fill="#8E95A5" />
        <path d="M12 6.5L6.5 9V12C6.5 15.2 8.8 18.2 12 19.2C15.2 18.2 17.5 15.2 17.5 12V9L12 6.5Z" fill="#12151D" />
      </svg>
      {showLabel && <span className="text-[10px] font-black uppercase tracking-wider font-stat">ROOKIE</span>}
    </div>
  );
};

// 5. Clean Vector Avatars for Profiles (6 styles - zero emojis!)
export const UserVectorAvatar = ({ avatarId = 'titan', size = 44, className = '' }) => {
  const normId = avatarId || 'titan';

  const avatarStyles = {
    boss: {
      bg: '#1A2208',
      stroke: '#CCFF00',
      icon: (
        <path d="M16 10L32 6L48 10V26C48 37 38 48 32 54C26 48 16 37 16 26V10ZM24 26H40M32 20V42" stroke="#CCFF00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )
    },
    titan: {
      bg: '#141824',
      stroke: '#00F0FF',
      icon: (
        <path d="M18 16L32 10L46 16L50 32L32 52L14 32L18 16ZM26 26L32 20L38 26L32 40L26 26Z" fill="#00F0FF" />
      )
    },
    cyborg: {
      bg: '#1F1329',
      stroke: '#D946EF',
      icon: (
        <>
          <rect x="18" y="18" width="28" height="28" rx="8" stroke="#D946EF" strokeWidth="3" fill="none" />
          <circle cx="26" cy="30" r="4" fill="#CCFF00" />
          <circle cx="38" cy="30" r="4" fill="#CCFF00" />
          <path d="M26 38H38" stroke="#D946EF" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    },
    warrior: {
      bg: '#241414',
      stroke: '#EF4444',
      icon: (
        <path d="M20 14L32 8L44 14V30C44 40 32 50 32 50C32 50 20 40 20 30V14ZM32 16L26 28H38L32 16Z" fill="#EF4444" />
      )
    },
    beast: {
      bg: '#1E1D13',
      stroke: '#F59E0B',
      icon: (
        <path d="M16 18L24 12L32 22L40 12L48 18L44 38L32 50L20 38L16 18Z" fill="#F59E0B" />
      )
    },
    phoenix: {
      bg: '#11221D',
      stroke: '#10B981',
      icon: (
        <path d="M32 10C24 16 14 22 14 36C22 36 28 30 32 24C36 30 42 36 50 36C50 22 40 16 32 10ZM32 30V48" stroke="#10B981" strokeWidth="3" strokeLinecap="round" fill="none" />
      )
    }
  };

  const current = avatarStyles[normId] || avatarStyles.titan;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-2xl flex items-center justify-center border-2 overflow-hidden shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: current.bg,
        borderColor: current.stroke
      }}
    >
      <svg width={size * 0.85} height={size * 0.85} viewBox="0 0 64 64" fill="none">
        {current.icon}
      </svg>
    </div>
  );
};

// 6. Tactile High-Contrast Custom SVG Checkbox (NO emoji!)
export const CustomCheckbox = ({ checked = false, onChange, size = 28 }) => (
  <button
    type="button"
    onClick={onChange}
    style={{ width: size, height: size }}
    className={`shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 active-press border-2 ${
      checked
        ? 'bg-[#CCFF00] border-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.5)] text-black'
        : 'bg-[#12151D] border-[#2C3346] hover:border-[#CCFF00]/50 text-transparent'
    }`}
  >
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </button>
);

// 7. Category Tag Vector Icons (NO emoji!)
export const CategoryTagIcon = ({ category = 'gym', size = 16, className = '' }) => {
  const normCat = (category || 'gym').toLowerCase();

  if (normCat === 'gym' || normCat === '#зал') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12M4 7h4M16 7h4M4 17h4M16 17h4" />
      </svg>
    );
  }

  if (normCat === 'study' || normCat === '#навчання') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10M6 10h10M6 14h6" />
      </svg>
    );
  }

  if (normCat === 'work' || normCat === '#справи') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="7" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }

  // Personal / #Особисте
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
};

// 8. Personal Record (PR) Vector Emblem
export const PREmblem = ({ size = 24, className = '' }) => (
  <div className={`flex items-center justify-center rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] p-1 font-stat font-black drop-shadow-[0_0_8px_rgba(204,255,0,0.3)] ${className}`}>
    <span className="text-[11px] font-black tracking-tighter">PR</span>
  </div>
);
