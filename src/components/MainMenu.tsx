import React, { useState } from 'react';
import { PlayerState, LevelConfig } from '../game/types';
import { LEVELS } from '../game/constants';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MainMenuProps {
  playerState: PlayerState;
  onStart: (level: LevelConfig) => void;
  onReset: () => void;
}

export function MainMenu({ playerState, onStart, onReset }: MainMenuProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = LEVELS[levelIdx];
  const isUnlocked = currentLevel.id <= playerState.unlockedLevels;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 gap-8 relative">
      {/* Reset Button (Top Right) */}
      <button 
        onClick={onReset}
        className="absolute top-4 right-4 p-2 bg-red-900/30 text-red-400 rounded-lg border border-red-500/30 text-xs hover:bg-red-900/50 transition-all"
      >
        初始化数据
      </button>

      {/* Level Selector */}
      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setLevelIdx(prev => Math.max(0, prev - 1))}
            disabled={levelIdx === 0}
            className="p-2 bg-gray-800 rounded-full disabled:opacity-30"
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="text-center min-w-[200px]">
            <h2 className="text-2xl font-bold text-blue-400">{currentLevel.name}</h2>
            <p className="text-sm text-gray-400">难度: {currentLevel.difficulty}</p>
            {!isUnlocked && <p className="text-xs text-red-500 mt-1">未解锁</p>}
          </div>

          <button 
            onClick={() => setLevelIdx(prev => Math.min(LEVELS.length - 1, prev + 1))}
            disabled={levelIdx === LEVELS.length - 1}
            className="p-2 bg-gray-800 rounded-full disabled:opacity-30"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* Fortress Image (Placeholder) */}
      <div className="relative w-48 h-64 bg-blue-900/30 rounded-3xl border-4 border-blue-500/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
        <div className="w-32 h-40 bg-blue-600 rounded-lg shadow-2xl relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 rounded-full border-4 border-blue-400" />
        </div>
        <div className="absolute bottom-4 text-blue-200 font-bold tracking-widest text-sm z-20">FORTRESS</div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => onStart(currentLevel)}
        disabled={!isUnlocked}
        className={`group relative px-12 py-4 rounded-2xl font-black text-xl tracking-widest flex items-center gap-3 transition-all ${isUnlocked ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
      >
        <Play fill="currentColor" />
        出发
        {isUnlocked && (
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-pulse" />
        )}
      </button>

      {/* Stats Summary */}
      <div className="flex gap-8 text-sm text-gray-400">
        <div className="flex flex-col items-center">
          <span className="text-yellow-500 font-bold">{playerState.upgradeTickets}</span>
          <span>强化券</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-purple-500 font-bold">{playerState.summonTickets}</span>
          <span>召唤券</span>
        </div>
      </div>
    </div>
  );
}
