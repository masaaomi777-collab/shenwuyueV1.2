import React, { useEffect, useRef } from 'react';

export function MysticalCarriageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + Math.sin(time) * 10; // Floating effect

      // --- Draw Carriage Body ---
      ctx.save();
      ctx.translate(centerX, centerY);

      // Main body (Ancient wooden box style)
      ctx.fillStyle = '#2a1a1a';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      
      // Base
      ctx.beginPath();
      ctx.roundRect(-80, -40, 160, 80, 5);
      ctx.fill();
      ctx.stroke();

      // Roof (Curved ancient style)
      ctx.beginPath();
      ctx.moveTo(-90, -40);
      ctx.quadraticCurveTo(0, -80, 90, -40);
      ctx.lineTo(80, -30);
      ctx.lineTo(-80, -30);
      ctx.closePath();
      ctx.fillStyle = '#3d2b1f';
      ctx.fill();
      ctx.stroke();

      // Window/Door
      ctx.fillStyle = '#1a120b';
      ctx.fillRect(-30, -20, 60, 40);
      ctx.strokeStyle = '#d4af37';
      ctx.strokeRect(-30, -20, 60, 40);

      // Decorative lines
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(30, 0);
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 20);
      ctx.stroke();

      // --- Wheels ---
      const wheelRotation = time * 2;
      const drawWheel = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(wheelRotation);
        
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();
        
        // Spokes
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(30, 0);
          ctx.stroke();
        }
        ctx.restore();
      };

      drawWheel(-60, 50);
      drawWheel(60, 50);

      // --- Lanterns ---
      const drawLantern = (x: number, y: number) => {
        const glow = Math.abs(Math.sin(time * 2)) * 10 + 10;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glow * 2);
        gradient.addColorStop(0, 'rgba(0, 255, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glow * 2, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(x - 5, y - 8, 10, 16);
        ctx.fillStyle = '#00ff64';
        ctx.fillRect(x - 3, y - 6, 6, 12);
      };

      drawLantern(-95, -30);
      drawLantern(95, -30);

      // --- Spiritual Energy Particles ---
      for (let i = 0; i < 5; i++) {
        const px = Math.sin(time + i) * 100;
        const py = Math.cos(time * 0.5 + i) * 50 - 20;
        const size = Math.abs(Math.sin(time + i)) * 3;
        
        ctx.fillStyle = 'rgba(0, 255, 100, 0.6)';
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={400} 
      className="w-full h-full drop-shadow-[0_0_30px_rgba(0,255,100,0.2)]"
    />
  );
}
