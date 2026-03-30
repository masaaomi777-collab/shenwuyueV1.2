import React, { useState, useEffect } from 'react';
import { PlayerState, LevelConfig } from '../game/types';
import { LEVELS } from '../game/constants';
import { Play, Bell, Scroll, Ghost, Home, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MysticalCarriageCanvas } from './MysticalCarriageCanvas';

interface MainMenuProps {
  playerState: PlayerState;
  onStart: (level: LevelConfig) => void;
  onReset: () => void;
}

const BG_URL = "/res/UI/bg.png";

export function MainMenu({ playerState, onStart, onReset }: MainMenuProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = LEVELS[levelIdx];
  const isUnlocked = currentLevel.id <= playerState.unlockedLevels;

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-between pt-4 pb-12 px-6 overflow-hidden bg-transparent">
      {/* Animated Fog Layers (Subtle) */}
      <motion.div 
        animate={{ x: [-100, 100], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/fog.png')] opacity-20 pointer-events-none"
      />

      {/* Header - Level Name at Top */}
      <header className="relative z-20 flex flex-col items-center w-full pt-0">
        <div className="text-center min-w-[240px] relative py-4 px-8">
          <img 
            src="/res/bg_name.png" 
            alt="" 
            className="absolute inset-0 w-full h-full object-fill -z-10" 
            referrerPolicy="no-referrer"
          />
          <h2 className="text-4xl font-bold tracking-[0.2em] text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{currentLevel.name}</h2>
          <p className="mt-1 text-[12px] tracking-[0.5em] text-[#d4af37]/70 uppercase font-medium">灾厄：壹</p>
        </div>
      </header>
      
      {/* Main Content Wrapper */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center">
        {/* Centerpiece: The Floor Image (Replaces Carriage) - Absolute positioned to not affect layout */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md aspect-video flex items-center justify-center">
          {/* Level Switch Buttons - Positioned relative to the image */}
          <button 
            onClick={() => setLevelIdx(prev => Math.max(0, prev - 1))}
            disabled={levelIdx === 0}
            className="absolute left-[-30px] p-2 disabled:opacity-20 hover:scale-110 transition-transform z-30 pointer-events-auto"
          >
            <img src="/res/UI/btn_left.png" alt="Previous" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
            >
              <img 
                src={currentLevel.floorAsset || "/res/UI/floor_1.png"} 
                alt={currentLevel.name} 
                className="w-full h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          <button 
            onClick={() => setLevelIdx(prev => Math.min(LEVELS.length - 1, prev + 1))}
            disabled={levelIdx === LEVELS.length - 1}
            className="absolute right-[-30px] p-2 disabled:opacity-20 hover:scale-110 transition-transform z-30 pointer-events-auto"
          >
            <img src="/res/UI/btn_left.png" alt="Next" className="w-12 h-12 object-contain scale-x-[-1]" referrerPolicy="no-referrer" />
          </button>
        </div>

        {/* Action Section - Fixed at bottom, moved down further */}
        <div className="mt-auto mb-12 translate-y-[20%] flex flex-col items-center gap-8 w-full">
          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isUnlocked && onStart(currentLevel)}
            disabled={!isUnlocked}
            className={`group relative transition-all flex items-center justify-center ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:brightness-110'}`}
          >
            <img src="/res/UI/btn_start.png" alt="" className="w-48 h-auto object-contain" referrerPolicy="no-referrer" />
            <span className="absolute text-white font-bold text-2xl tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {isUnlocked ? '启程' : '未解锁'}
            </span>
          </motion.button>

          {/* Resources */}
          <div className="flex gap-16 text-sm tracking-widest">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <img src="/res/UI/miquan.png" alt="密卷" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                <span className="text-white text-xl font-bold">{playerState.upgradeTickets}</span>
              </div>
              <span className="text-[#d4af37]/60 text-xs">密卷</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <img src="/res/UI/shengguanmao.png" alt="升官帽" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                <span className="text-white text-xl font-bold">{playerState.summonTickets}</span>
              </div>
              <span className="text-[#d4af37]/60 text-xs">升官帽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button (Top Right) */}
      <button 
        onClick={onReset}
        className="absolute top-4 right-4 p-2 bg-red-900/20 text-red-500/60 rounded-lg border border-red-500/20 text-[10px] hover:bg-red-900/40 hover:text-red-500 transition-all z-20"
      >
        重置
      </button>

      {/* Decorative Chains */}
      <div className="absolute top-0 left-0 w-32 h-64 pointer-events-none opacity-20">
        <div className="w-[1px] h-full bg-gradient-to-b from-gray-600 to-transparent mx-auto relative">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3 h-6 border border-gray-500 rounded-full" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-6 border border-gray-500 rounded-full" />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-64 pointer-events-none opacity-20">
        <div className="w-[1px] h-full bg-gradient-to-b from-gray-600 to-transparent mx-auto relative">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3 h-6 border border-gray-500 rounded-full" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-6 border border-gray-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
