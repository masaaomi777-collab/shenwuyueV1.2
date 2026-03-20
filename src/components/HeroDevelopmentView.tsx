import React, { useState } from 'react';
import { PlayerState, HeroType, PlayerHero } from '../game/types';
import { SKILL_TREES } from '../game/constants';
import { ArrowUp, Shield, Zap, Wind, Flame, Snowflake, Mountain, Ghost, ChevronRight, CheckCircle2 } from 'lucide-react';

interface HeroDevelopmentViewProps {
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
}

export function HeroDevelopmentView({ playerState, setPlayerState }: HeroDevelopmentViewProps) {
  const [selectedHero, setSelectedHero] = useState<HeroType>('flame');
  const hero = playerState.heroes[selectedHero];

  const handleUpgrade = () => {
    const cost = hero.level * 10;
    if (playerState.upgradeTickets < cost) return;

    setPlayerState(prev => ({
      ...prev,
      upgradeTickets: prev.upgradeTickets - cost,
      heroes: {
        ...prev.heroes,
        [selectedHero]: {
          ...prev.heroes[selectedHero],
          level: prev.heroes[selectedHero].level + 1
        }
      }
    }));
  };

  const handleStarUp = () => {
    const cost = hero.star * 50;
    if (hero.shards < cost) return;

    setPlayerState(prev => ({
      ...prev,
      heroes: {
        ...prev.heroes,
        [selectedHero]: {
          ...prev.heroes[selectedHero],
          star: prev.heroes[selectedHero].star + 1,
          shards: prev.heroes[selectedHero].shards - cost
        }
      }
    }));
  };

  const toggleDeployment = () => {
    const deployedCount = Object.values(playerState.heroes).filter(h => h.isDeployed).length;
    if (!hero.isDeployed && deployedCount >= 4) return;

    setPlayerState(prev => ({
      ...prev,
      heroes: {
        ...prev.heroes,
        [selectedHero]: {
          ...prev.heroes[selectedHero],
          isDeployed: !prev.heroes[selectedHero].isDeployed
        }
      }
    }));
  };

  const getHeroIcon = (type: HeroType) => {
    switch (type) {
      case 'flame': return <Flame className="text-red-500" />;
      case 'ice': return <Snowflake className="text-blue-400" />;
      case 'lightning': return <Zap className="text-yellow-400" />;
      case 'wind': return <Wind className="text-teal-400" />;
      case 'rock': return <Mountain className="text-amber-700" />;
      case 'shadow': return <Ghost className="text-purple-500" />;
    }
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

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'basic': return '基础';
      case 'advanced': return '进阶';
      case 'ultimate': return '终极';
      default: return tier;
    }
  };

  const skillTree = SKILL_TREES[selectedHero] || [];

  return (
    <div className="h-full flex flex-col p-4 gap-4 bg-gray-900">
      {/* Hero List */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(Object.keys(playerState.heroes) as HeroType[]).map(type => (
          <button
            key={type}
            onClick={() => setSelectedHero(type)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex items-center justify-center relative transition-all ${selectedHero === type ? 'border-blue-500 bg-blue-900/40 scale-105' : 'border-gray-700 bg-gray-800'}`}
          >
            {getHeroIcon(type)}
            {playerState.heroes[type].isDeployed && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
            )}
          </button>
        ))}
      </div>

      {/* Hero Details */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-2xl font-black uppercase tracking-widest ${getElementColor(selectedHero)}`}>{getHeroName(selectedHero)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">LV.{hero.level}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < hero.star ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={toggleDeployment}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${hero.isDeployed ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}
            >
              {hero.isDeployed ? '下阵' : '上阵'}
            </button>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
              <span className="text-xs text-gray-500 block mb-1">英雄攻击</span>
              <span className="text-lg font-bold text-blue-400">{20 + hero.level * 5 + hero.star * 10}</span>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
              <span className="text-xs text-gray-500 block mb-1">防御塔增益</span>
              <span className="text-lg font-bold text-green-400">+{hero.level * 2 + hero.star * 5}%</span>
            </div>
          </div>

          {/* Upgrade Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              disabled={playerState.upgradeTickets < hero.level * 10}
              className={`flex-1 py-3 rounded-xl font-bold flex flex-col items-center gap-0.5 border-2 transition-all ${playerState.upgradeTickets >= hero.level * 10 ? 'bg-blue-600 border-blue-400 text-white active:scale-95' : 'bg-gray-700 border-gray-600 text-gray-500 opacity-50'}`}
            >
              <span className="text-sm">升级</span>
              <span className="text-[10px] opacity-80 flex items-center gap-1">消耗 {hero.level * 10} 强化券</span>
            </button>
            <button
              onClick={handleStarUp}
              disabled={hero.shards < hero.star * 50}
              className={`flex-1 py-3 rounded-xl font-bold flex flex-col items-center gap-0.5 border-2 transition-all ${hero.shards >= hero.star * 50 ? 'bg-yellow-600 border-yellow-400 text-white active:scale-95' : 'bg-gray-700 border-gray-600 text-gray-500 opacity-50'}`}
            >
              <span className="text-sm">升星</span>
              <span className="text-[10px] opacity-80 flex items-center gap-1">消耗 {hero.star * 50} 碎片</span>
            </button>
          </div>
        </div>

        {/* Skill Tree Preview */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
            <Zap size={16} /> 技能树预览
          </h4>
          <div className="flex flex-col gap-3">
            {skillTree.map(skill => (
              <div key={skill.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${skill.tier === 'ultimate' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}>
                  {skill.tier === 'ultimate' ? <Zap size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-200">{skill.name}</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${skill.tier === 'ultimate' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{getTierName(skill.tier)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{skill.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Currency Display */}
      <div className="flex justify-between text-xs text-gray-500 px-2">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 font-bold">{playerState.upgradeTickets}</span> 强化券
        </div>
        <div className="flex items-center gap-1">
          <span className="text-purple-500 font-bold">{hero.shards}</span> {getHeroName(selectedHero)} 碎片
        </div>
      </div>
    </div>
  );
}
