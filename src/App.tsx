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
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem('playerState');
    return saved ? JSON.parse(saved) : INITIAL_PLAYER_STATE;
  });
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);

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
      <div className="relative w-full max-w-md h-full bg-gray-900 shadow-2xl overflow-hidden flex flex-col">
        {view === 'game' ? (
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
            <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-around px-4">
              <button 
                onClick={() => setView('summon')}
                className={`flex flex-col items-center gap-1 ${view === 'summon' ? 'text-yellow-400' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 bg-yellow-500 rounded-sm" />
                <span className="text-xs">召唤</span>
              </button>
              <button 
                onClick={() => setView('main_menu')}
                className={`flex flex-col items-center gap-1 ${view === 'main_menu' ? 'text-blue-400' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 bg-blue-500 rounded-sm" />
                <span className="text-xs">主页</span>
              </button>
              <button 
                onClick={() => setView('hero_dev')}
                className={`flex flex-col items-center gap-1 ${view === 'hero_dev' ? 'text-purple-400' : 'text-gray-400'}`}
              >
                <div className="w-6 h-6 bg-purple-500 rounded-sm" />
                <span className="text-xs">英雄</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
