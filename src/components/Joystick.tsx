import React, { useState, useRef, useEffect } from 'react';

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
  size?: number;
}

export function Joystick({ onMove, size = 120 }: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e);
  };

  const handleMove = (e: any) => {
    if (!isDragging && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const dist = Math.hypot(dx, dy);
    const maxDist = size / 2;

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setPos({ x: dx, y: dy });
    onMove(dx / maxDist, dy / maxDist);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative rounded-full bg-gray-800/50 border-2 border-gray-600/50 touch-none"
      style={{ width: size, height: size }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div 
        className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-blue-500 shadow-lg border-2 border-blue-300 pointer-events-none transition-transform duration-75"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      />
    </div>
  );
}
