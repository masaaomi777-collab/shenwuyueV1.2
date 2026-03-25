import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { MergeGrid } from './MergeGrid';
import { SkillSelection } from './SkillSelection';
import { Heart, Coins, Pause, Play, Home, TreeDeciduous, Mountain, Box } from 'lucide-react';
import { HeroType, LevelConfig, PlayerState } from '../game/types';
import { Joystick } from './Joystick';

import { assets } from '../game/AssetManager';

interface GameProps {
  levelConfig: LevelConfig;
  playerState: PlayerState;
  onBack: () => void;
  onGameOver: (result: 'win' | 'lose') => void;
  onPrologueEnd: () => void;
}

export function Game({ levelConfig, playerState, onBack, onGameOver, onPrologueEnd }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const joystickInput = useRef({ dx: 0, dy: 0 });
  const [, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPrologue, setIsPrologue] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine(levelConfig, playerState);
  }

  const drawRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    const version = Date.now();
    assets.loadImages({
      'castle': `/res/castle.png?v=${version}`,
      'road': `/res/road.png?v=${version}`,
      'background': `/res/background.png?v=${version}`
    }).then(() => {
      console.log('Assets loaded successfully');
      setAssetsLoaded(true);
    }).catch(err => {
      console.error('Failed to load assets:', err);
      // 即使失败也尝试进入游戏，避免卡死
      setAssetsLoaded(true);
    });
  }, []);

  const decorations = React.useMemo(() => [], []);

  useEffect(() => {
    const engine = engineRef.current!;
    engine.onSyncUI = () => {
      setTick(t => t + 1);
      setIsPrologue(engine.isPrologue);
    };
    engine.onSkillSelection = () => setTick(t => t + 1);
    engine.onGameOver = (result) => {
      onGameOver(result);
    };
    engine.onPrologueEnd = () => {
      onPrologueEnd();
      setIsPrologue(false);
    };

    let reqId: number;
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      if (engine.isPrologue) {
        engine.movePlayer(joystickInput.current.dx, joystickInput.current.dy, dt);
      }
      engine.update(time);
      if (drawRef.current) drawRef.current(time);
      reqId = requestAnimationFrame(loop);
    };
    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [onGameOver, onPrologueEnd]);

  const getElementColor = (type: HeroType) => {
    switch (type) {
      case 'flame': return '#ef4444';
      case 'ice': return '#60a5fa';
      case 'lightning': return '#facc15';
      case 'wind': return '#2dd4bf';
      case 'rock': return '#b45309';
      case 'shadow': return '#9333ea';
      default: return '#9ca3af';
    }
  };

  const draw = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const engine = engineRef.current!;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    let camX, camY;
    if (engine.isPrologue) {
      camX = width / 2 - 300;
      camY = height / 2 - 400;
    } else {
      camX = width / 2 - engine.fortress.x;
      camY = height / 2 - engine.fortress.y; // 放置在屏幕正中间
    }
    ctx.translate(camX, camY);

    // 1. Draw tiled background (Relative to world, after camera translate)
    const bgImg = assets.get('background');
    if (bgImg) {
      const pattern = ctx.createPattern(bgImg, 'repeat');
      if (pattern) {
        // 使用 DOMMatrix 缩小背景缩放比例
        const matrix = new DOMMatrix();
        const bgScale = 0.5; // 缩小比例，使背景元素更小
        matrix.a = bgScale;
        matrix.d = bgScale;
        pattern.setTransform(matrix);
        
        ctx.fillStyle = pattern;
        ctx.fillRect(-camX, -camY, width, height);
      }
    } else {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-camX, -camY, width, height);
    }

    // 2. Draw road path (Using soil yellow color)
    ctx.strokeStyle = '#d4a373'; // 土黄色
    ctx.lineWidth = 100; // 道路宽度
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    levelConfig.waypoints.forEach((wp, i) => {
      if (i === 0) ctx.moveTo(wp.x, wp.y);
      else ctx.lineTo(wp.x, wp.y);
    });
    ctx.stroke();

    // 3. Draw waypoints (only if not prologue)
    if (!engine.isPrologue) {
      // Draw road path dots (optional, can be removed if roadImg is enough)
      levelConfig.waypoints.forEach(wp => {
        if (wp.type !== 'normal') {
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      });
    }

    // Draw decorations (Removed)

    // Draw Resource Nodes (Prologue)
    engine.resourceNodes.forEach(rn => {
      ctx.beginPath();
      if (rn.type === 'wood') ctx.fillStyle = '#10b981';
      else if (rn.type === 'stone') ctx.fillStyle = '#78350f';
      else if (rn.type === 'steel') ctx.fillStyle = '#94a3b8';
      ctx.arc(rn.x, rn.y, rn.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // HP bar
      ctx.fillStyle = '#000';
      ctx.fillRect(rn.x - 20, rn.y - rn.radius - 10, 40, 4);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(rn.x - 20, rn.y - rn.radius - 10, 40 * (rn.hp / rn.maxHp), 4);
    });

    // Draw Area Effects
    engine.areaEffects.forEach(ae => {
      ctx.fillStyle = getElementColor(ae.heroType) + '40';
      ctx.beginPath();
      ctx.arc(ae.x, ae.y, ae.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw fortress
    const castleImg = assets.get('castle');
    ctx.save();
    ctx.translate(engine.fortress.x, engine.fortress.y);
    // Rotate to face forward. Math.PI/2 adjustment assumes image front is at the top.
    ctx.rotate(engine.fortress.rotation + Math.PI / 2);
    if (castleImg) {
      ctx.drawImage(castleImg, -60, -75, 120, 150);
    } else {
      ctx.fillStyle = engine.isPrologue ? '#4b5563' : '#3b82f6'; // Gray if damaged
      ctx.fillRect(-40, -50, 80, 100);
    }
    
    if (!engine.isPrologue) {
      const towerPositions = [
        { x: -45, y: -40 }, { x: 35, y: -40 },
        { x: -45, y: 20 }, { x: 35, y: 20 }
      ];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = engine.activeElements[i] ? getElementColor(engine.activeElements[i]) : '#60a5fa';
        ctx.fillRect(towerPositions[i].x, towerPositions[i].y, 10, 20);
      }
    }
    ctx.restore();

    // Draw fortress HP & Shield
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(engine.fortress.x - 40, engine.fortress.y + 60, 80, 8);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(engine.fortress.x - 40, engine.fortress.y + 60, 80 * (engine.fortress.hp / engine.fortress.maxHp), 8);

    // Draw Player (Prologue)
    if (engine.player) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(engine.player.x, engine.player.y, engine.player.radius, 0, Math.PI * 2);
      ctx.fill();
      // Direction indicator
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(engine.player.x, engine.player.y - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw flying materials
    engine.flyingMaterials.forEach(fm => {
      if (fm.type === 'wood') ctx.fillStyle = '#10b981';
      else if (fm.type === 'stone') ctx.fillStyle = '#78350f';
      else if (fm.type === 'steel') ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(fm.x, fm.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw monsters
    engine.monsters.forEach(m => {
      ctx.fillStyle = m.maxHp > 100 ? '#991b1b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.fillRect(m.x - 10, m.y - m.radius - 8, 20, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(m.x - 10, m.y - m.radius - 8, 20 * (m.hp / m.maxHp), 4);
    });

    // Draw heroes
    engine.heroes.forEach(h => {
      ctx.fillStyle = getElementColor(h.heroType);
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw projectiles
    engine.projectiles.forEach(p => {
      ctx.fillStyle = getElementColor(p.heroType);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.isGiantRock ? 12 : 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  const engine = engineRef.current!;

  const togglePause = () => {
    engine.isPaused = !engine.isPaused;
    setIsPaused(engine.isPaused);
  };

  if (!assetsLoaded) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-blue-400 animate-pulse font-bold tracking-widest text-xl">资源加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 text-white select-none">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <Coins size={18} /> {engine.coins}
          </div>
          <button onClick={togglePause} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
        <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 relative">
           <div className="h-full bg-blue-500 transition-all" style={{ width: `${(engine.energy / engine.maxEnergy) * 100}%` }} />
           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
             {engine.energy} / {engine.maxEnergy}
           </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {/* Bottom UI */}
      <div className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${isPrologue ? 'h-48' : 'h-auto bg-gray-800/90 rounded-t-2xl p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4'} z-10`}>
        {isPrologue ? (
          <div className="w-full h-full flex items-center justify-between px-8">
            <div className="flex flex-col gap-2">
               <button 
                onClick={() => engine.usePlayerSkill()}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 ${engine.playerSkillCd <= 0 ? 'bg-green-600 border-green-400 active:scale-95' : 'bg-gray-600 border-gray-500 opacity-50'}`}
              >
                <Heart className="text-white" size={32} />
                {engine.playerSkillCd > 0 && <span className="absolute text-white font-bold">{Math.ceil(engine.playerSkillCd)}</span>}
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-2 bg-black/40 p-3 rounded-2xl border border-white/10">
              <div className="flex gap-4 text-sm font-bold">
                <div className="flex items-center gap-1 text-green-400">
                  <TreeDeciduous size={16} /> {engine.prologueMaterials.wood}/3
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Mountain size={16} /> {engine.prologueMaterials.stone}/3
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Box size={16} /> {engine.prologueMaterials.steel}/3
                </div>
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-tighter">收集材料修复堡垒</div>
            </div>

            <Joystick onMove={(dx, dy) => { joystickInput.current = { dx, dy }; }} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end px-2">
              <button 
                onClick={() => engine.usePlayerSkill()}
                className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg border-2 ${engine.playerSkillCd <= 0 ? 'bg-green-600 border-green-400 active:scale-95' : 'bg-gray-600 border-gray-500 opacity-50'}`}
              >
                <Heart className="text-white" size={28} />
                {engine.playerSkillCd > 0 && <span className="absolute text-white font-bold">{Math.ceil(engine.playerSkillCd)}</span>}
              </button>

              <button
                onClick={() => engine.summonHero()}
                className={`px-6 py-3 rounded-xl font-bold flex flex-col items-center justify-center shadow-lg border-2 active:scale-95 transition-transform ${engine.coins >= engine.summonCost ? 'bg-yellow-500 border-yellow-300 text-yellow-900' : 'bg-gray-600 border-gray-500 text-gray-400'}`}
              >
                <span className="text-sm uppercase tracking-wider">召唤</span>
                <span className="flex items-center gap-1"><Coins size={14}/> {engine.summonCost}</span>
              </button>
            </div>
            <MergeGrid engine={engine} />
          </>
        )}
      </div>

      {/* Modals */}
      {engine.isSkillSelection && (
        <SkillSelection choices={engine.skillChoices} onSelect={(id) => engine.selectSkill(id)} />
      )}
      
      {isPaused && !engine.isSkillSelection && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 flex flex-col gap-6 items-center min-w-[280px]">
            <h2 className="text-3xl font-black text-blue-400 tracking-widest">暂停中</h2>
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={togglePause}
                className="w-full py-4 bg-blue-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Play fill="currentColor" /> 继续游戏
              </button>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-gray-700 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Home /> 返回主页
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

