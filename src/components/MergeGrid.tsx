import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { HeroType } from '../game/types';

export function MergeGrid({ engine }: { engine: GameEngine }) {
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [touchPos, setTouchPos] = React.useState<{ x: number, y: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (idx >= engine.unlockedSlotsCount) {
      e.preventDefault();
      return;
    }
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
    if (engine.grid[idx] && idx < engine.unlockedSlotsCount) {
      setDraggedIdx(idx);
      const touch = e.touches[0];
      setTouchPos({ x: touch.clientX, y: touch.clientY });
      // Prevent default to avoid scrolling/zooming during drag
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIdx !== null) {
      const touch = e.touches[0];
      setTouchPos({ x: touch.clientX, y: touch.clientY });
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (draggedIdx === null) return;

    const touch = e.changedTouches[0];
    // Temporarily disable pointer events on the ghost to get the element underneath
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = target?.closest('[data-slot-idx]');
    
    if (slotElement) {
      const toIdx = parseInt(slotElement.getAttribute('data-slot-idx')!);
      if (!isNaN(toIdx) && toIdx !== draggedIdx) {
        engine.mergeSlots(draggedIdx, toIdx);
      }
    }
    setDraggedIdx(null);
    setTouchPos(null);
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
    <div className="relative pt-6 pb-2 px-2 bg-slate-800 rounded-xl border-t-4 border-slate-600 shadow-2xl">
      {/* 城墙锯齿效果 - 放在容器内部顶部 */}
      <div className="absolute -top-4 left-0 w-full flex justify-around px-4 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-6 h-4 bg-slate-600 rounded-t-sm shadow-md border-x border-slate-500" />
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 touch-none relative z-10">
        {engine.grid.map((slot, idx) => {
          const isLocked = idx >= engine.unlockedSlotsCount;
          return (
            <div
              key={idx}
              data-slot-idx={idx}
              draggable={!!slot && !isLocked}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              onTouchStart={(e) => handleTouchStart(e, idx)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`aspect-square rounded-lg flex items-center justify-center relative border-2 transition-all
                ${isLocked ? 'bg-slate-950 border-slate-900 opacity-40' : slot ? 'bg-slate-700 border-slate-500 shadow-lg cursor-grab active:cursor-grabbing' : 'bg-slate-900/40 border-slate-800/50 shadow-inner'}
                ${draggedIdx === idx ? 'opacity-50 scale-95' : ''}
                ${!isLocked && !slot ? 'hover:border-blue-500/30' : ''}
              `}
            >
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-slate-700 rounded-full" />
                </div>
              )}
              {slot && !isLocked && (
                <div className={`w-full h-full rounded-md flex flex-col items-center justify-center ${getElementColor(slot.heroType)} shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3)] border border-white/20`}>
                  <span className="text-sm font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{getElementLabel(slot.heroType)}</span>
                  <div className="flex gap-[1px] mt-1">
                    {Array(slot.star).fill(0).map((_, i) => (
                      <span key={i} className="w-2 h-2 bg-yellow-300 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-yellow-600" />
                    ))}
                  </div>
                </div>
              )}
              {/* 装饰性石砖纹理 */}
              {!slot && !isLocked && (
                <div className="absolute inset-0 opacity-20 pointer-events-none p-1">
                  <div className="w-full h-full border border-slate-600 rounded-sm border-dashed" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Touch Drag Ghost */}
      {draggedIdx !== null && touchPos && engine.grid[draggedIdx] && (
        <div 
          className={`fixed pointer-events-none z-[100] w-12 h-12 rounded-lg flex flex-col items-center justify-center ${getElementColor(engine.grid[draggedIdx]!.heroType)} shadow-2xl border-2 border-white/40 scale-110 opacity-90`}
          style={{ 
            left: touchPos.x - 24, 
            top: touchPos.y - 24,
            transform: 'translate3d(0,0,0)'
          }}
        >
          <span className="text-sm font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {getElementLabel(engine.grid[draggedIdx]!.heroType)}
          </span>
          <div className="flex gap-[1px] mt-1">
            {Array(engine.grid[draggedIdx]!.star).fill(0).map((_, i) => (
              <span key={i} className="w-2 h-2 bg-yellow-300 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-yellow-600" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

