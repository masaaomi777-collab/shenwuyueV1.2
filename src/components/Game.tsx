import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { MergeGrid } from './MergeGrid';
import { SkillSelection } from './SkillSelection';
import { Heart, Coins, Pause, Play, Home, TreeDeciduous, Mountain, Box } from 'lucide-react';
import { HeroType, LevelConfig, PlayerState } from '../game/types';
import { Joystick } from './Joystick';

import { assets } from '../game/AssetManager';
import { GRASS_TEXTURE, SAND_TEXTURE, ROAD_TEXTURE } from '../game/textures';
import { spineManager, SpineFortress } from '../game/SpineManager';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const spineFortressRef = useRef<SpineFortress | null>(null);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine(levelConfig, playerState);
  }

  const drawRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    Promise.all([
      assets.loadImages({
        'castle': '/res/castle.png',
        'road': '/res/road.png',
        'roadedge': '/res/roadedge.png',
        'background': '/res/background.png',
        'bg_name': '/res/bg_name.png',
        'dec_1': '/res/dec_1.png',
        'dec_2': '/res/dec_2.png',
        'dec_3': '/res/dec_3.png',
        'dec_4': '/res/dec_4.png',
        'grass_texture': GRASS_TEXTURE,
        'sand_texture': SAND_TEXTURE,
        'road_texture': ROAD_TEXTURE,
        'hero_flame': '/res/role/fire.png',
        'hero_ice': '/res/role/water.png',
        'hero_wind': '/res/role/wind.png',
        'monster_1': '/res/role/monster_1.png',
        'monster_2': '/res/role/monster_2.png',
        'boss_0': '/res/role/boss_0.png',
        'boss_1': '/res/role/boss_1.png'
      }),
      spineManager.load()
    ]).then(() => {
      console.log('Assets loaded successfully');
      spineFortressRef.current = spineManager.createFortress();
      setAssetsLoaded(true);
    }).catch(err => {
      console.error('Failed to load assets:', err);
      setLoadError(err.message || String(err));
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

      // Update Spine animation
      if (spineFortressRef.current) {
        let animName = 'stand';
        let loop = true;

        if (engine.nodeState === 'stopped_at_node') {
          if (engine.fortressAttacked) {
            animName = 'atked';
            loop = false;
            engine.fortressAttacked = false;
          } else {
            animName = 'stand';
          }
        } else {
          const isSlowed = engine.fortress.speed < engine.fortress.baseSpeed;
          animName = isSlowed ? 'run' : 'speed_run';
        }

        spineFortressRef.current.setAnimation(animName, loop);
        spineFortressRef.current.update(dt);
      }

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
    
    // Fallback background color
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);
    
    ctx.save();
    let camX: number, camY: number;
    if (engine.isPrologue) {
      camX = width / 2 - 300;
      camY = height / 2 - 400;
    } else {
      camX = width / 2 - engine.fortress.x;
      camY = height / 2 - engine.fortress.y; // 放置在屏幕正中间
    }
    ctx.translate(camX, camY);

    // 0. Draw Background
    const levelBg = levelConfig.backgroundAsset ? assets.get(levelConfig.backgroundAsset) : null;
    const grassImg = assets.get('grass_texture');
    const sandImg = assets.get('sand_texture');
    const roadImg = assets.get('road');
    const roadEdgeImg = assets.get('roadedge');
    const roadWidth = 120;

    if (levelBg) {
      const pattern = ctx.createPattern(levelBg, 'repeat');
      if (pattern) {
        const matrix = new DOMMatrix();
        matrix.a = 0.5; // Adjust scale as needed
        matrix.d = 0.5;
        pattern.setTransform(matrix);
        ctx.fillStyle = pattern;
        ctx.fillRect(-camX, -camY, width, height);
      }
    } else if (grassImg) {
      const pattern = ctx.createPattern(grassImg, 'repeat');
      if (pattern) {
        const matrix = new DOMMatrix();
        matrix.a = 0.5;
        matrix.d = 0.5;
        pattern.setTransform(matrix);
        ctx.fillStyle = pattern;
        ctx.fillRect(-camX, -camY, width, height);
      }
    } else {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-camX, -camY, width, height);
    }

    // 1. Draw Road Path & Edges
    if (roadImg) {
      const roadWidth = 120;
      const roadEdgeImg = assets.get('roadedge');

      levelConfig.waypoints.forEach((wp, i) => {
        if (i === 0) return;
        const prevWp = levelConfig.waypoints[i - 1];
        const nextWp = levelConfig.waypoints[i + 1];
        const prevPrevWp = levelConfig.waypoints[i - 2];

        const dx = wp.x - prevWp.x;
        const dy = wp.y - prevWp.y;
        const realLen = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Determine turn direction at start and end of this segment
        let turnAtStart = 0;
        if (prevPrevWp) {
          const v1x = prevWp.x - prevPrevWp.x;
          const v1y = prevWp.y - prevPrevWp.y;
          const cross = v1x * dy - v1y * dx;
          turnAtStart = cross > 0 ? 1 : (cross < 0 ? -1 : 0);
        }

        let turnAtEnd = 0;
        if (nextWp) {
          const v2x = nextWp.x - wp.x;
          const v2y = nextWp.y - wp.y;
          const cross = dx * v2y - dy * v2x;
          turnAtEnd = cross > 0 ? 1 : (cross < 0 ? -1 : 0);
        }

        ctx.save();
        ctx.translate(prevWp.x, prevWp.y);
        ctx.rotate(angle);

        // Draw Tiled Road Segment - Original proportions, no stretching
        // Scale to fit roadWidth
        const tileScale = roadWidth / roadImg.height;
        const tileW = roadImg.width * tileScale;
        const tileH = roadWidth;

        // Calculate how many tiles fit to cover from start edge to end edge
        // Start edge is at -roadWidth/2, End edge is at realLen + roadWidth/2
        const baseLen = realLen + roadWidth;
        const numTiles = Math.ceil(baseLen / tileW);
        const drawLen = numTiles * tileW;
        const startX = -roadWidth / 2;

        // Draw road tiles
        for (let x = 0; x < drawLen; x += tileW) {
          ctx.drawImage(roadImg, 0, 0, roadImg.width, roadImg.height, startX + x, -tileH / 2, tileW, tileH);
        }

        // Draw Road Edges
        if (roadEdgeImg) {
          const isHorizontal = roadEdgeImg.width >= roadEdgeImg.height;
          const imgLen = isHorizontal ? roadEdgeImg.width : roadEdgeImg.height;
          const imgThick = isHorizontal ? roadEdgeImg.height : roadEdgeImg.width;
          
          const edgeHeight = 15; // Half size (from 30 to 15)
          const edgeScale = edgeHeight / imgThick;
          const edgeW = imgLen * edgeScale;

          // Use seeds for random gaps
          const seedTop = (prevWp.x + prevWp.y) * 1000;
          const seedBottom = (prevWp.x - prevWp.y) * 1000 + 500; // Asymmetrical seed

          const getRand = (idx: number, seed: number) => {
            const x = Math.sin(seed + idx) * 10000;
            return x - Math.floor(x);
          };

          // Inner turn logic: skip edges in the square area of the turn circle (roadWidth x roadWidth)
          // Start waypoint is at 0 in local coords. Square is [-roadWidth/2, roadWidth/2].
          // End waypoint is at realLen in local coords. Square is [realLen - roadWidth/2, realLen + roadWidth/2].
          const skipAreaSize = roadWidth; 

          for (let x = 0; x < drawLen; x += edgeW) {
            const currentXLocal = startX + x;
            
            // Top Edge
            const isTopInnerAtStart = turnAtStart === -1;
            const isTopInnerAtEnd = turnAtEnd === -1;
            const inTopInnerStartArea = Math.abs(currentXLocal) < skipAreaSize / 2 && isTopInnerAtStart;
            const inTopInnerEndArea = Math.abs(currentXLocal - realLen) < skipAreaSize / 2 && isTopInnerAtEnd;

            if (!inTopInnerStartArea && !inTopInnerEndArea) {
              if (getRand(x, seedTop) > 0.3) { // 30% skip
                ctx.save();
                if (!isHorizontal) {
                  ctx.translate(currentXLocal + edgeW / 2, -roadWidth / 2);
                  ctx.rotate(Math.PI / 2);
                  ctx.drawImage(roadEdgeImg, 0, 0, roadEdgeImg.width, roadEdgeImg.height, -edgeHeight / 2, -edgeW / 2, edgeHeight, edgeW);
                } else {
                  ctx.drawImage(roadEdgeImg, 0, 0, roadEdgeImg.width, roadEdgeImg.height, currentXLocal, -roadWidth / 2 - edgeHeight / 2, edgeW, edgeHeight);
                }
                ctx.restore();
              }
            }
            
            // Bottom Edge
            const isBottomInnerAtStart = turnAtStart === 1;
            const isBottomInnerAtEnd = turnAtEnd === 1;
            const inBottomInnerStartArea = Math.abs(currentXLocal) < skipAreaSize / 2 && isBottomInnerAtStart;
            const inBottomInnerEndArea = Math.abs(currentXLocal - realLen) < skipAreaSize / 2 && isBottomInnerAtEnd;

            if (!inBottomInnerStartArea && !inBottomInnerEndArea) {
              if (getRand(x, seedBottom) > 0.3) {
                ctx.save();
                ctx.translate(currentXLocal + edgeW / 2, roadWidth / 2);
                ctx.scale(1, -1);
                if (!isHorizontal) {
                  ctx.rotate(Math.PI / 2);
                  ctx.drawImage(roadEdgeImg, 0, 0, roadEdgeImg.width, roadEdgeImg.height, -edgeHeight / 2, -edgeW / 2, edgeHeight, edgeW);
                } else {
                  ctx.drawImage(roadEdgeImg, 0, 0, roadEdgeImg.width, roadEdgeImg.height, -edgeW / 2, -edgeHeight / 2, edgeW, edgeHeight);
                }
                ctx.restore();
              }
            }
          }
        }

        ctx.restore();
      });
    }

    // 1.5 Draw Decorations
    engine.decorations.forEach(dec => {
      const img = assets.get(dec.type);
      if (img) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.rotate(dec.rotation);
        const dw = img.width * dec.scale;
        const dh = img.height * dec.scale;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }
    });

    // 2. Draw waypoints (only if not prologue)
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
    ctx.save();
    ctx.translate(engine.fortress.x, engine.fortress.y);
    
    if (spineFortressRef.current) {
      spineFortressRef.current.render(ctx, 0, 0, engine.fortress.rotation);
    } else {
      const castleImg = assets.get('castle');
      // Rotate to face forward. Math.PI/2 adjustment assumes image front is at the top.
      ctx.rotate(engine.fortress.rotation + Math.PI / 2);
      if (castleImg) {
        ctx.drawImage(castleImg, -60, -75, 120, 150);
      } else {
        ctx.fillStyle = engine.isPrologue ? '#4b5563' : '#3b82f6'; // Gray if damaged
        ctx.fillRect(-40, -50, 80, 100);
      }
    }
    
    ctx.restore();

    // Draw Player (Prologue)
    if (engine.player) {
      const playerImg = assets.get('hero_flame');
      const drawRadius = engine.player.radius * 4;
      if (playerImg) {
        ctx.drawImage(playerImg, engine.player.x - drawRadius, engine.player.y - drawRadius, drawRadius * 2, drawRadius * 2);
      } else {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(engine.player.x, engine.player.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
        // Direction indicator
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(engine.player.x, engine.player.y - drawRadius * 0.5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
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
      const isBoss = m.radius >= 25;
      let img = null;
      const drawRadius = m.radius * 4;
      
      if (isBoss) {
        img = m.isAttacking ? assets.get('boss_1') : assets.get('boss_0');
      } else {
        // Simple logic to pick monster image based on ID
        const monsterIdx = (parseInt(m.id.slice(-1)) || 0) % 2 + 1;
        img = assets.get(`monster_${monsterIdx}`);
      }

      if (img) {
        ctx.drawImage(img, m.x - drawRadius, m.y - drawRadius, drawRadius * 2, drawRadius * 2);
      } else {
        ctx.fillStyle = isBoss ? '#991b1b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(m.x, m.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#000';
      ctx.fillRect(m.x - 10, m.y - drawRadius - 8, 20, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(m.x - 10, m.y - drawRadius - 8, 20 * (m.hp / m.maxHp), 4);
    });

    // Draw heroes
    engine.heroes.forEach(h => {
      const img = assets.get(`hero_${h.heroType}`);
      const drawRadius = h.radius * 4;
      if (img) {
        ctx.drawImage(img, h.x - drawRadius, h.y - drawRadius, drawRadius * 2, drawRadius * 2);
      } else {
        ctx.fillStyle = getElementColor(h.heroType);
        ctx.beginPath();
        ctx.arc(h.x, h.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
      }
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
      {loadError && (
        <div className="absolute top-16 left-4 right-4 bg-red-500/80 text-white p-2 text-xs rounded z-50">
          Load Error: {loadError}
        </div>
      )}
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <img src="/res/UI/icon_coin.png" alt="Coins" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" /> {engine.coins}
          </div>
          <button onClick={togglePause} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
        <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 relative pointer-events-auto">
           <div className="h-full bg-blue-500 transition-all" style={{ width: `${(engine.energy / engine.maxEnergy) * 100}%` }} />
           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
             {engine.energy} / {engine.maxEnergy}
           </div>
        </div>
      </div>

      {/* Bottom UI */}
      <div className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${isPrologue ? 'h-48' : 'h-auto p-4 pb-8 flex flex-col gap-4'} z-10`}>
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
            
            <div className="flex flex-col items-center gap-2">
              {/* Fortress Health Bar (Prologue) */}
              <div className="w-48 h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden relative shadow-lg">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-green-500 transition-all duration-500" 
                  style={{ width: `${(engine.fortress.hp / engine.fortress.maxHp) * 100}%` }} 
                />
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
            </div>

            <Joystick onMove={(dx, dy) => { joystickInput.current = { dx, dy }; }} />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 px-2">
            <button 
              onClick={() => engine.usePlayerSkill()}
              className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg border-2 ${engine.playerSkillCd <= 0 ? 'bg-green-600 border-green-400 active:scale-95' : 'bg-gray-600 border-gray-500 opacity-50'}`}
            >
              <Heart className="text-white" size={28} />
              {engine.playerSkillCd > 0 && <span className="absolute text-white font-bold">{Math.ceil(engine.playerSkillCd)}</span>}
            </button>

            <div className="flex-grow max-w-[280px] flex flex-col gap-2">
              {/* Fortress Health Bar */}
              <div className="w-full h-5 bg-black/60 rounded-full border-2 border-white/10 overflow-hidden relative shadow-2xl">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 transition-all duration-500 ease-out" 
                  style={{ width: `${(engine.fortress.hp / engine.fortress.maxHp) * 100}%` }} 
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase tracking-[0.2em]">
                  堡垒生命: {Math.ceil(engine.fortress.hp)} / {engine.fortress.maxHp}
                </div>
              </div>
              <MergeGrid engine={engine} />
            </div>

            <button
              onClick={() => engine.summonHero()}
              className={`w-14 h-14 rounded-xl flex-shrink-0 font-bold flex flex-col items-center justify-center shadow-lg border-2 active:scale-95 transition-transform ${engine.coins >= engine.summonCost ? 'bg-yellow-500 border-yellow-300 text-yellow-900' : 'bg-gray-600 border-gray-500 text-gray-400'}`}
            >
              <img src="/res/UI/icon_coin.png" alt="Summon" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
              <span className="text-[10px] mt-0.5">{engine.summonCost}</span>
            </button>
          </div>
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

