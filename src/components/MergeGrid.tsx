import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { HeroType } from '../game/types';

export function MergeGrid({ engine }: { engine: GameEngine }) {
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(fromIdx) && fromIdx !== toIdx) {
      engine.mergeSlots(fromIdx, toIdx);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getElementColor = (type: HeroType) => {
    switch (type) {
      case 'flame': return 'bg-red-500';
      case 'ice': return 'bg-blue-400';
      case 'lightning': return 'bg-yellow-400';
      case 'wind': return 'bg-teal-400';
      case 'rock': return 'bg-amber-700';
      case 'shadow': return 'bg-purple-600';
      default: return 'bg-gray-500';
    }
  };

  const getElementLabel = (type: HeroType) => {
    switch (type) {
      case 'flame': return '火';
      case 'ice': return '冰';
      case 'lightning': return '雷';
      case 'wind': return '风';
      case 'rock': return '岩';
      case 'shadow': return '影';
      default: return '无';
    }
  };

  return (
    <div className="grid grid-cols-8 gap-1">
      {engine.grid.map((slot, idx) => {
        const isLocked = idx >= engine.unlockedSlotsCount;

        return (
          <div
            key={idx}
            draggable={!isLocked && !!slot}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            className={`aspect-square rounded-md flex items-center justify-center relative border-2 transition-all
              ${isLocked ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}
              ${!isLocked && slot ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
          >
            {isLocked && <div className="text-gray-600 text-xs">🔒</div>}
            {!isLocked && slot && (
              <div className={`w-full h-full rounded-sm flex flex-col items-center justify-center ${getElementColor(slot.heroType)}`}>
                <span className="text-xs font-bold text-white/90 drop-shadow-md">{getElementLabel(slot.heroType)}</span>
                <div className="flex gap-[1px] mt-1">
                  {Array(slot.star).fill(0).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-sm" />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

