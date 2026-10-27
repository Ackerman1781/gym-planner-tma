import React, { useState } from 'react';
import { 
  Users, Flame, Trophy, Plus, Share2, Download, 
  ArrowRight, X, Swords, Check, Dumbbell, Shield 
} from 'lucide-react';
import { 
  UserVectorAvatar, PodiumBadge, RankBadge, StreakFlameIcon 
} from './CustomIcons';
import { 
  getPlayerRank, generateProfileCode, parseProfileCode 
} from '../services/storage';
import { haptic } from '../services/telegram';

export const SquadTab = ({ squad, setSquad, userProfile, userRecords }) => {
  // Sort Mode: 'streak' or 'bench'
  const [sortMode, setSortMode] = useState('streak');

  // Detail Modal for a player
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Add friend manually modal
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendStreak, setFriendStreak] = useState(10);
  const [friendBench, setFriendBench] = useState(90);
  const [friendSquat, setFriendSquat] = useState(110);
  const [friendBicep, setFriendBicep] = useState(38);
  const [friendAvatar, setFriendAvatar] = useState('cyborg');

  // Import code modal
  const [isImportingCode, setIsImportingCode] = useState(false);
  const [importCodeStr, setImportCodeStr] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Find user's own data in squad
  const myPlayer = squad.find((p) => p.isMe) || {
    id: 'user_me',
    name: userProfile?.nickname || 'Артем',
    isMe: true,
    streak: 14,
    bench: 95,
    squat: 120,
    bicep: 40,
    workouts: 32,
    avatarId: userProfile?.avatarId || 'titan'
  };

  // Sort squad according to mode
  const sortedSquad = [...squad].sort((a, b) => {
    if (sortMode === 'streak') {
      return (b.streak || 0) - (a.streak || 0);
    }
    return (b.bench || 0) - (a.bench || 0);
  });

  const handleShareMyCode = () => {
    haptic.selection();
    const code = generateProfileCode(myPlayer);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      alert('Твій персональний код профілю скопійовано!\nНадішли його другові в Telegram.');
    } else {
      prompt('Скопіюй свій код профілю:', code);
    }
  };

  const handleImportCode = (e) => {
    e.preventDefault();
    if (!importCodeStr.trim()) return;

    haptic.impact('heavy');
    const friend = parseProfileCode(importCodeStr.trim());
    if (friend) {
      // Check if friend with same name exists -> update, otherwise add
      const existsIndex = squad.findIndex(
        (f) => f.name.toLowerCase() === friend.name.toLowerCase()
      );
      if (existsIndex >= 0) {
        const updated = [...squad];
        updated[existsIndex] = { ...updated[existsIndex], ...friend };
        setSquad(updated);
      } else {
        setSquad([...squad, friend]);
      }
      setImportSuccess(true);
      haptic.success();
      setTimeout(() => {
        setImportSuccess(false);
        setIsImportingCode(false);
        setImportCodeStr('');
      }, 500);
    } else {
      alert('Невірний формат коду друга. Перевір правильність вставки.');
    }
  };

  const handleCreateFriend = (e) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    haptic.impact('heavy');
    const newFriend = {
      id: 'friend_' + Date.now(),
      name: friendName.trim(),
      isMe: false,
      streak: parseInt(friendStreak, 10) || 1,
      bench: parseFloat(friendBench) || 60,
      squat: parseFloat(friendSquat) || 80,
      bicep: parseFloat(friendBicep) || 30,
      workouts: Math.floor((parseInt(friendStreak, 10) || 1) * 2.2),
      avatarId: friendAvatar
    };

    setSquad([...squad, newFriend]);
    setIsAddingFriend(false);
    setFriendName('');
    haptic.success();
  };

  return (
    <div className="flex-1 pb-28 pt-3 px-4 max-w-md mx-auto w-full animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-[#11141D] border border-[#222838] rounded-3xl p-4 mb-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A5] block font-stat">
            СУПЕРНИЦТВО & ДИСЦИПЛІНА
          </span>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight font-['Space_Grotesk',sans-serif]">
            ACKERMAN SQUAD
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareMyCode}
            style={{ minHeight: '38px' }}
            className="px-2.5 py-1.5 bg-[#171B26] border border-[#2B3142] hover:border-[#CCFF00]/50 rounded-xl text-[10px] font-black uppercase text-white flex items-center gap-1 active-press"
            title="Поділитися моїм кодом"
          >
            <Share2 size={13} className="text-[#CCFF00]" />
            <span>Код</span>
          </button>

          <button
            onClick={() => {
              haptic.selection();
              setIsImportingCode(true);
            }}
            style={{ minHeight: '38px' }}
            className="px-2.5 py-1.5 bg-[#171B26] border border-[#2B3142] hover:border-[#CCFF00]/50 rounded-xl text-[10px] font-black uppercase text-white flex items-center gap-1 active-press"
            title="Імпортувати код друга"
          >
            <Download size={13} className="text-[#CCFF00]" />
            <span>Імпорт</span>
          </button>

          <button
            onClick={() => {
              haptic.selection();
              setIsAddingFriend(true);
            }}
            style={{ minHeight: '38px' }}
            className="px-3 py-1.5 bg-[#CCFF00] active-press text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 glow-volt-sm font-stat"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Друг</span>
          </button>
        </div>
      </div>

      {/* Sorting 1-Click Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => {
            haptic.selection();
            setSortMode('streak');
          }}
          style={{ minHeight: '44px' }}
          className={`rounded-2xl font-black text-xs uppercase tracking-wider font-stat flex items-center justify-center gap-1.5 transition-all active-press ${
            sortMode === 'streak'
              ? 'bg-[#CCFF00] text-black drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]'
              : 'bg-[#11141D] text-[#8E95A5] border border-[#222838]'
          }`}
        >
          <StreakFlameIcon size={16} active={sortMode === 'streak'} />
          <span>ЗА СТРІКОМ</span>
        </button>

        <button
          onClick={() => {
            haptic.selection();
            setSortMode('bench');
          }}
          style={{ minHeight: '44px' }}
          className={`rounded-2xl font-black text-xs uppercase tracking-wider font-stat flex items-center justify-center gap-1.5 transition-all active-press ${
            sortMode === 'bench'
              ? 'bg-[#CCFF00] text-black drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]'
              : 'bg-[#11141D] text-[#8E95A5] border border-[#222838]'
          }`}
        >
          <Dumbbell size={16} />
          <span>ЗА МАКС. ЖИМОМ</span>
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5">
        {sortedSquad.map((player, idx) => {
          const place = idx + 1;
          const isLeader = place === 1;
          const rank = getPlayerRank(player.streak, isLeader);
          const isUser = player.isMe;

          return (
            <div
              key={player.id || idx}
              onClick={() => {
                haptic.selection();
                setSelectedPlayer({ ...player, place, rank });
              }}
              className={`rounded-2xl p-3.5 flex items-center justify-between cursor-pointer active-press transition-all ${
                isUser
                  ? 'bg-[#141A24] border-2 border-[#CCFF00] drop-shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                  : isLeader
                  ? 'bg-[#141824] border-2 border-[#FFD700]/70'
                  : 'bg-[#11141D] border border-[#222838] hover:border-[#CCFF00]/40'
              }`}
            >
              {/* Left Side: Place + Avatar + Name + Rank */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 text-center shrink-0">
                  {place <= 3 ? (
                    <PodiumBadge place={place} size={22} className="mx-auto" />
                  ) : (
                    <span className="font-stat font-black text-sm text-[#8E95A5]">
                      #{place}
                    </span>
                  )}
                </div>

                <UserVectorAvatar avatarId={player.avatarId} size={42} />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-white text-sm uppercase truncate font-['Space_Grotesk',sans-serif]">
                      {player.name}
                    </h4>
                    {isUser && (
                      <span className="px-1.5 py-0.2 rounded bg-[#CCFF00] text-black text-[9px] font-black uppercase font-stat">
                        ТИ
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    <RankBadge rank={rank} size={13} />
                  </div>
                </div>
              </div>

              {/* Right Side: Key stat by sort mode */}
              <div className="text-right shrink-0">
                {sortMode === 'streak' ? (
                  <div>
                    <div className="flex items-center justify-end gap-1 font-stat font-black text-base text-[#CCFF00]">
                      <StreakFlameIcon size={14} />
                      <span>{player.streak}</span>
                      <span className="text-[10px] text-white">ДНІВ</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#8E95A5] uppercase font-stat block">
                      Жим: {player.bench || 0} кг
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="font-stat font-black text-base text-[#CCFF00]">
                      {player.bench || 0} <span className="text-[10px] text-white">КГ</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#8E95A5] uppercase font-stat block">
                      Стрік: {player.streak} дн
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal for Selected Player with Head-to-Head Comparison */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#0E1118] border-2 border-[#232734] rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#232734]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] font-stat">
                КАРТКА АТЛЕТА ACKERMAN SQUAD
              </span>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-8 h-8 rounded-xl bg-[#171B26] text-[#8E95A5] hover:text-white flex items-center justify-center active-press"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Hero */}
            <div className="flex items-center gap-3.5 mb-5 bg-[#141824] border border-[#262E40] rounded-2xl p-4">
              <UserVectorAvatar avatarId={selectedPlayer.avatarId} size={54} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                    {selectedPlayer.name}
                  </h3>
                  {selectedPlayer.isMe && (
                    <span className="px-2 py-0.5 rounded-md bg-[#CCFF00] text-black text-[9px] font-black uppercase font-stat">
                      ТИ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RankBadge rank={selectedPlayer.rank} size={14} />
                  <span className="text-xs font-bold text-[#8E95A5] font-stat">
                    Місце у топі: #{selectedPlayer.place}
                  </span>
                </div>
              </div>
            </div>

            {/* Player Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-2.5 text-center">
                <span className="text-[9px] font-black uppercase text-[#8E95A5] font-stat block mb-1">
                  СТРІК
                </span>
                <span className="text-base font-black font-stat text-[#CCFF00]">
                  {selectedPlayer.streak} дн
                </span>
              </div>

              <div className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-2.5 text-center">
                <span className="text-[9px] font-black uppercase text-[#8E95A5] font-stat block mb-1">
                  ТРЕНУВАНЬ
                </span>
                <span className="text-base font-black font-stat text-white">
                  {selectedPlayer.workouts || 12}
                </span>
              </div>

              <div className="bg-[#08090C] border border-[#1E2330] rounded-2xl p-2.5 text-center">
                <span className="text-[9px] font-black uppercase text-[#8E95A5] font-stat block mb-1">
                  ЖИМ 1RM
                </span>
                <span className="text-base font-black font-stat text-[#CCFF00]">
                  {selectedPlayer.bench || 0} кг
                </span>
              </div>
            </div>

            {/* Head-to-Head Comparison with User */}
            {!selectedPlayer.isMe && (
              <div className="bg-[#08090C] border border-[#232734] rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3 border-b border-[#1E2330] pb-2">
                  <span className="text-xs font-black uppercase text-white flex items-center gap-1.5 font-stat">
                    <Swords size={14} className="text-[#CCFF00]" />
                    <span>ПОРІВНЯННЯ З ТОБОЮ (HEAD-TO-HEAD)</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Metric: Bench Press */}
                  <div>
                    <div className="flex justify-between text-xs font-stat mb-1">
                      <span className="text-white font-bold">Ти: {myPlayer.bench || 0} кг</span>
                      <span className="text-[#8E95A5] uppercase text-[10px]">ЖИМ ЛЕЖАЧИ</span>
                      <span className="text-[#CCFF00] font-bold">{selectedPlayer.bench || 0} кг</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-[#141824]">
                      <div
                        className="bg-white transition-all"
                        style={{
                          width: `${((myPlayer.bench || 1) / ((myPlayer.bench || 1) + (selectedPlayer.bench || 1))) * 100}%`
                        }}
                      />
                      <div
                        className="bg-[#CCFF00] transition-all"
                        style={{
                          width: `${((selectedPlayer.bench || 1) / ((myPlayer.bench || 1) + (selectedPlayer.bench || 1))) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Metric: Streak */}
                  <div>
                    <div className="flex justify-between text-xs font-stat mb-1">
                      <span className="text-white font-bold">Ти: {myPlayer.streak} дн</span>
                      <span className="text-[#8E95A5] uppercase text-[10px]">СТРІК ДИСЦИПЛІНИ</span>
                      <span className="text-[#CCFF00] font-bold">{selectedPlayer.streak} дн</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-[#141824]">
                      <div
                        className="bg-white transition-all"
                        style={{
                          width: `${((myPlayer.streak || 1) / ((myPlayer.streak || 1) + (selectedPlayer.streak || 1))) * 100}%`
                        }}
                      />
                      <div
                        className="bg-[#CCFF00] transition-all"
                        style={{
                          width: `${((selectedPlayer.streak || 1) / ((myPlayer.streak || 1) + (selectedPlayer.streak || 1))) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Metric: Squats */}
                  <div>
                    <div className="flex justify-between text-xs font-stat mb-1">
                      <span className="text-white font-bold">Ти: {myPlayer.squat || 0} кг</span>
                      <span className="text-[#8E95A5] uppercase text-[10px]">ПРИСІДАННЯ</span>
                      <span className="text-[#CCFF00] font-bold">{selectedPlayer.squat || 0} кг</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-[#141824]">
                      <div
                        className="bg-white transition-all"
                        style={{
                          width: `${((myPlayer.squat || 1) / ((myPlayer.squat || 1) + (selectedPlayer.squat || 1))) * 100}%`
                        }}
                      />
                      <div
                        className="bg-[#CCFF00] transition-all"
                        style={{
                          width: `${((selectedPlayer.squat || 1) / ((myPlayer.squat || 1) + (selectedPlayer.squat || 1))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedPlayer(null)}
              style={{ minHeight: '44px' }}
              className="w-full bg-[#141824] active-press border border-[#262E40] text-white rounded-2xl font-black text-xs uppercase tracking-wider"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Friend Manually */}
      {isAddingFriend && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#0E1118] border-2 border-[#CCFF00] rounded-3xl w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#232734]">
              <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                ДОДАТИ ДРУГА ДО ТАБЛИЦІ
              </h3>
              <button
                onClick={() => setIsAddingFriend(false)}
                className="w-8 h-8 rounded-xl bg-[#171B26] text-[#8E95A5] hover:text-white flex items-center justify-center active-press"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFriend} className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1">
                  ІМ'Я АБО НІКНЕЙМ
                </label>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="Наприклад: Роман 'Titan'"
                  className="w-full bg-[#141824] border border-[#262E40] text-white rounded-2xl px-4 py-3 text-base font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1 font-stat">
                    СТРІК (ДНІВ)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={friendStreak}
                    onChange={(e) => setFriendStreak(e.target.value)}
                    className="w-full bg-[#141824] border border-[#262E40] text-center font-stat font-bold text-white rounded-2xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1 font-stat">
                    ЖИМ ЛЕЖАЧИ (КГ)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={friendBench}
                    onChange={(e) => setFriendBench(e.target.value)}
                    className="w-full bg-[#141824] border border-[#262E40] text-center font-stat font-bold text-[#CCFF00] rounded-2xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1 font-stat">
                    ПРИСІДАННЯ (КГ)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={friendSquat}
                    onChange={(e) => setFriendSquat(e.target.value)}
                    className="w-full bg-[#141824] border border-[#262E40] text-center font-stat font-bold text-white rounded-2xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1 font-stat">
                    БІЦЕПС (КГ)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={friendBicep}
                    onChange={(e) => setFriendBicep(e.target.value)}
                    className="w-full bg-[#141824] border border-[#262E40] text-center font-stat font-bold text-white rounded-2xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1.5">
                  ОБЕРИ АВАТАР ДРУГА
                </label>
                <div className="flex gap-2">
                  {['titan', 'boss', 'cyborg', 'warrior', 'beast'].map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setFriendAvatar(av)}
                      className={`p-1 rounded-xl border-2 ${
                        friendAvatar === av ? 'border-[#CCFF00]' : 'border-transparent opacity-60'
                      }`}
                    >
                      <UserVectorAvatar avatarId={av} size={32} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{ minHeight: '48px' }}
                className="w-full bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 glow-volt-sm"
              >
                <Check size={16} strokeWidth={3} />
                <span>ДОДАТИ ДРУГА ДО ТАБЛИЦІ</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Code */}
      {isImportingCode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#0E1118] border-2 border-[#CCFF00] rounded-3xl w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#232734]">
              <h3 className="text-base font-black text-white uppercase italic font-['Space_Grotesk',sans-serif]">
                ІМПОРТУВАТИ КОД ДРУГА
              </h3>
              <button
                onClick={() => setIsImportingCode(false)}
                className="w-8 h-8 rounded-xl bg-[#171B26] text-[#8E95A5] hover:text-white flex items-center justify-center active-press"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleImportCode} className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase text-[#8E95A5] tracking-wider block mb-1">
                  ВСТАВ КОД, ЯКИЙ ТОБІ НАДІСЛАВ ДРУГ:
                </label>
                <textarea
                  rows={3}
                  value={importCodeStr}
                  onChange={(e) => setImportCodeStr(e.target.value)}
                  placeholder="Встав код (наприклад: AP#eyJ2IjoxLCJuIjoi...)"
                  className="w-full bg-[#141824] border border-[#262E40] text-white rounded-2xl p-3 text-xs font-stat outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                style={{ minHeight: '48px' }}
                className="w-full bg-[#CCFF00] active-press text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 glow-volt-sm"
              >
                {importSuccess ? (
                  <>
                    <Check size={16} strokeWidth={3} />
                    <span>УСПІШНО ІМПОРТОВАНО!</span>
                  </>
                ) : (
                  <span>ІМПОРТУВАТИ ДРУГА</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
