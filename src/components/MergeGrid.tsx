import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { HeroType } from '../game/types';

export function MergeGrid({ engine }: { engine: GameEngine }) {
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    if (idx < engine.unlockedSlotsCount && engine.grid[idx]) {
      setDraggedIdx(idx);
      // Prevent default to avoid scrolling/zooming during drag
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (draggedIdx === null) return;

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = target?.closest('[data-slot-idx]');
    
    if (slotElement) {
      const toIdx = parseInt(slotElement.getAttribute('data-slot-idx')!);
      if (!isNaN(toIdx) && toIdx !== draggedIdx) {
        engine.mergeSlots(draggedIdx, toIdx);
      }
    }
    setDraggedIdx(null);
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
    <div className="grid grid-cols-8 gap-1 touch-none">
      {engine.grid.map((slot, idx) => {
        const isLocked = idx >= engine.unlockedSlotsCount;

        return (
          <div
            key={idx}
            data-slot-idx={idx}
            draggable={!isLocked && !!slot}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            onTouchStart={(e) => handleTouchStart(e, idx)}
            onTouchEnd={handleTouchEnd}
            className={`aspect-square rounded-md flex items-center justify-center relative border-2 transition-all
              ${isLocked ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}
              ${!isLocked && slot ? 'cursor-grab active:cursor-grabbing' : ''}
              ${draggedIdx === idx ? 'opacity-50 scale-95' : ''}
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

