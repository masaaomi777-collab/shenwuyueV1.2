/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Game } from './components/Game';
import { MainMenu } from './components/MainMenu';
import { SummonView } from './components/SummonView';
import { HeroDevelopmentView } from './components/HeroDevelopmentView';
import { PlayerState, LevelConfig, HeroType } from './game/types';
import { LEVELS } from './game/constants';
import { assets } from './game/AssetManager';
import { Ghost, Home, User } from 'lucide-react';

const INITIAL_PLAYER_STATE: PlayerState = {
  upgradeTickets: 100,
  summonTickets: 20,
  unlockedLevels: 1,
  prologueCompleted: false,
  heroes: {
    flame: { type: 'flame', level: 1, star: 1, shards: 0, isDeployed: true },
    ice: { type: 'ice', level: 1, star: 1, shards: 0, isDeployed: true },
    lightning: { type: 'lightning', level: 1, star: 1, shards: 0, isDeployed: true },
    wind: { type: 'wind', level: 1, star: 1, shards: 0, isDeployed: true },
    rock: { type: 'rock', level: 1, star: 1, shards: 0, isDeployed: false },
    shadow: { type: 'shadow', level: 1, star: 1, shards: 0, isDeployed: false },
  }
};

type View = 'main_menu' | 'summon' | 'hero_dev' | 'game';

export default function App() {
  const [view, setView] = useState<View>('main_menu');
  const [loading, setLoading] = useState(true);
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem('playerState');
    return saved ? JSON.parse(saved) : INITIAL_PLAYER_STATE;
  });
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('playerState', JSON.stringify(playerState));
  }, [playerState]);

  const handleStartGame = (level: LevelConfig) => {
    setSelectedLevel(level);
    setView('game');
  };

  const handleGameOver = (result: 'win' | 'lose') => {
    if (result === 'win') {
      setPlayerState(prev => ({
        ...prev,
        upgradeTickets: prev.upgradeTickets + selectedLevel.rewardTickets,
        unlockedLevels: Math.max(prev.unlockedLevels, selectedLevel.id + 1)
      }));
    }
    setView('main_menu');
  };

  const handleReset = () => {
    if (window.confirm('确定要初始化所有数据吗？（英雄等级、资源、首局状态将重置）')) {
      setPlayerState(INITIAL_PLAYER_STATE);
      localStorage.removeItem('playerState');
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-md h-full bg-black shadow-2xl overflow-hidden flex flex-col">
        {/* Background for UI Views - Moved here to fill entire screen including bottom nav */}
        {view !== 'game' && !loading && (
          <div 
            className="absolute inset-0 bg-cover bg-bottom pointer-events-none z-0"
            style={{ backgroundImage: 'url(/res/UI/bg.png)' }}
          />
        )}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono tracking-widest animate-pulse">LOADING ASSETS...</p>
          </div>
        ) : view === 'game' ? (
          <Game 
            levelConfig={selectedLevel} 
            playerState={playerState} 
            onBack={() => setView('main_menu')}
            onGameOver={handleGameOver}
            onPrologueEnd={() => setPlayerState(prev => ({ ...prev, prologueCompleted: true }))}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {view === 'main_menu' && (
                <MainMenu 
                  playerState={playerState} 
                  onStart={handleStartGame} 
                  onReset={handleReset}
                />
              )}
              {view === 'summon' && (
                <SummonView 
                  playerState={playerState} 
                  setPlayerState={setPlayerState} 
                />
              )}
              {view === 'hero_dev' && (
                <HeroDevelopmentView 
                  playerState={playerState} 
                  setPlayerState={setPlayerState} 
                />
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="h-20 flex items-center justify-around px-4 relative z-20">
              <img src="/res/UI/bgbt.png" alt="" className="absolute inset-0 w-full h-full object-fill -z-10" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setView('summon')}
                className={`flex flex-col items-center gap-1 transition-all ${view === 'summon' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              >
                <img src="/res/UI/btn_hl.png" alt="唤灵" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                <span className="text-[10px] font-bold tracking-widest text-[#d4af37]">唤灵</span>
              </button>
              <button 
                onClick={() => setView('main_menu')}
                className={`flex flex-col items-center gap-1 transition-all ${view === 'main_menu' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              >
                <img src="/res/UI/btn_gx.png" alt="归墟" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                <span className="text-[10px] font-bold tracking-widest text-[#d4af37]">归墟</span>
              </button>
              <button 
                onClick={() => setView('hero_dev')}
                className={`flex flex-col items-center gap-1 transition-all ${view === 'hero_dev' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              >
                <img src="/res/UI/btn_ts.png" alt="天师" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                <span className="text-[10px] font-bold tracking-widest text-[#d4af37]">天师</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
