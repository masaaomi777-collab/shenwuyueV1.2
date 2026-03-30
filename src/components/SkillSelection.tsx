import React from 'react';
import { Zap, Shield, Sword, Flame, Snowflake, Wind, Mountain, Ghost } from 'lucide-react';
import { SkillNode, HeroType } from '../game/types';

export function SkillSelection({ choices, onSelect }: { choices: SkillNode[], onSelect: (id: string) => void }) {
  
  const getIcon = (type: HeroType) => {
    switch(type) {
      case 'flame': return <Flame size={24} className="text-red-400" />;
      case 'ice': return <Snowflake size={24} className="text-blue-400" />;
      case 'lightning': return <Zap size={24} className="text-yellow-400" />;
      case 'wind': return <Wind size={24} className="text-teal-400" />;
      case 'rock': return <Mountain size={24} className="text-amber-600" />;
      case 'shadow': return <Ghost size={24} className="text-purple-400" />;
      default: return <Sword size={24} className="text-gray-400" />;
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">能量充满！</h2>
          <p className="text-gray-400 text-sm">选择一项技能强化你的英雄</p>
        </div>

        <div className="flex flex-col gap-3">
          {choices.map(s => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-400 rounded-xl p-4 flex items-center gap-4 transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-600 group-hover:border-blue-400`}>
                {getIcon(s.heroType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-lg">{s.name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${s.tier === 'ultimate' ? 'bg-yellow-500/20 text-yellow-400' : s.tier === 'advanced' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {s.tier === 'ultimate' ? '终极' : s.tier === 'advanced' ? '进阶' : '基础'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            </button>
          ))}
          {choices.length === 0 && (
            <div className="text-center text-gray-400 py-4">没有可用的技能。</div>
          )}
        </div>
      </div>
    </div>
  );
}

