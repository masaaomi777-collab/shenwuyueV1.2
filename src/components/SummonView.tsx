import React, { useState } from 'react';
import { PlayerState, HeroType } from '../game/types';
import { Sparkles, Coins } from 'lucide-react';

interface SummonViewProps {
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
}

export function SummonView({ playerState, setPlayerState }: SummonViewProps) {
  const [summoning, setSummoning] = useState(false);
  const [result, setResult] = useState<{ type: HeroType, count: number } | null>(null);

  const handleSummon = () => {
    if (playerState.summonTickets < 10) return;

    setSummoning(true);
    setResult(null);

    setTimeout(() => {
      const types: HeroType[] = ['flame', 'ice', 'lightning', 'wind', 'rock', 'shadow'];
      const type = types[Math.floor(Math.random() * types.length)];
      const count = 10 + Math.floor(Math.random() * 10); // 10-20 shards

      setPlayerState(prev => ({
        ...prev,
        summonTickets: prev.summonTickets - 10,
        heroes: {
          ...prev.heroes,
          [type]: {
            ...prev.heroes[type],
            shards: prev.heroes[type].shards + count
          }
        }
      }));

      setResult({ type, count });
      setSummoning(false);
    }, 1000);
  };

  const getElementColor = (type: HeroType) => {
    switch (type) {
      case 'flame': return 'text-red-500';
      case 'ice': return 'text-blue-400';
      case 'lightning': return 'text-yellow-400';
      case 'wind': return 'text-teal-400';
      case 'rock': return 'text-amber-700';
      case 'shadow': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };

  const getHeroName = (type: HeroType) => {
    switch (type) {
      case 'flame': return '火';
      case 'ice': return '冰';
      case 'lightning': return '雷';
      case 'wind': return '风';
      case 'rock': return '岩';
      case 'shadow': return '影';
      default: return type;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
          <Sparkles size={24} /> 英雄召唤
        </h2>
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <span className="text-sm font-bold text-purple-400">{playerState.summonTickets}</span>
          <span className="text-xs text-gray-400 uppercase">召唤券</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        {/* Summon Portal */}
        <div className={`relative w-64 h-64 rounded-full border-8 border-dashed border-yellow-500/30 flex items-center justify-center ${summoning ? 'animate-spin' : ''}`}>
          <div className="absolute inset-4 rounded-full border-4 border-yellow-500/50 animate-pulse" />
          <div className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center">
             <Sparkles size={64} className="text-yellow-500" />
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="text-center animate-bounce">
            <h3 className="text-lg text-gray-300">获得碎片:</h3>
            <div className={`text-4xl font-black ${getElementColor(result.type)}`}>
              {getHeroName(result.type)} x{result.count}
            </div>
          </div>
        )}

        {/* Summon Button */}
        <button
          onClick={handleSummon}
          disabled={playerState.summonTickets < 10 || summoning}
          className={`px-12 py-4 rounded-2xl font-bold text-xl flex flex-col items-center gap-1 transition-all ${playerState.summonTickets >= 10 ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-900 shadow-xl active:scale-95' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
        >
          <span>十连召唤</span>
          <span className="text-sm flex items-center gap-1 opacity-80">
            消耗 10 召唤券
          </span>
        </button>
      </div>

      {/* Shard Inventory */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.values(playerState.heroes)).map(hero => (
          <div key={hero.type} className="bg-gray-800 p-3 rounded-xl border border-gray-700 flex flex-col items-center">
            <span className={`text-xs font-bold uppercase ${getElementColor(hero.type)}`}>{getHeroName(hero.type)}</span>
            <span className="text-sm text-gray-300">{hero.shards} 碎片</span>
          </div>
        ))}
      </div>
    </div>
  );
}
