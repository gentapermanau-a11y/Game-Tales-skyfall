import React, { useEffect, useRef } from 'react';
import { PlayerStats, EquipmentState } from '../../types';
import { sound } from '../../services/audio';
import { X, Shield, Sword, Zap, Heart, Coins, Trophy, Clock, Skull } from 'lucide-react';
import { PixelRenderer } from '../../game/sprites';

interface MenuProfileModalProps {
  stats: PlayerStats;
  equipment: EquipmentState;
  onClose: () => void;
  onUpdateName?: (name: string) => void;
}

export const MenuProfileModal: React.FC<MenuProfileModalProps> = ({
  stats,
  equipment,
  onClose,
  onUpdateName,
}) => {
  const spriteCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(stats.name || 'Aeron');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'KeyC') {
        sound.playButtonClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Mini canvas for animated Aeron sprite
  useEffect(() => {
    const canvas = spriteCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 + 10);
      ctx.scale(2.4, 2.4);
      PixelRenderer.drawPlayer(ctx, 0, 0, 'idle', 'down', frame, false, false);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const totalSec = Math.floor(stats.playTimeSeconds || 0);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const formattedPlayTime = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const expPct = Math.min(100, Math.floor((stats.exp / (stats.expToNext || 100)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-pixel select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-amber-500 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-4 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wider">
                AERON • ADVENTURER PROFILE
              </h2>
              <span className="text-[10px] text-slate-400">Knight of the Celestial Resonator</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded border border-slate-700 active:scale-95 transition-colors"
            title="[ESC] Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* HERO CARD WITH SPRITE CANVAS & CORE ATTRIBUTES */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-4 rounded-lg">
          {/* Animated Sprite Canvas */}
          <div className="relative w-28 h-28 bg-slate-950 rounded-lg border-2 border-amber-400/80 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
            <canvas ref={spriteCanvasRef} width={112} height={112} className="w-full h-full image-render-pixel" />
            <div className="absolute bottom-1 text-[8px] font-mono text-amber-300 bg-black/60 px-1.5 rounded">
              IDLE
            </div>
          </div>

          <div className="flex-1 w-full min-w-0 flex flex-col gap-2">
            <div className="flex justify-between items-baseline gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-slate-900 border border-amber-500 text-white px-2 py-0.5 rounded text-base font-bold outline-none w-44"
                    autoFocus
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (nameInput.trim() && onUpdateName) {
                          onUpdateName(nameInput.trim());
                        }
                        setIsEditingName(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setNameInput(stats.name || 'Aeron');
                      }
                    }}
                    onBlur={() => {
                      if (nameInput.trim() && onUpdateName) {
                        onUpdateName(nameInput.trim());
                      }
                      setIsEditingName(false);
                    }}
                  />
                  <span className="text-[10px] text-amber-400">⏎ Enter</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)} title="Click to edit character name">
                  <span className="text-lg font-bold text-white tracking-wide hover:text-amber-300 transition-colors">{stats.name || 'Aeron'}</span>
                  <span className="text-xs text-amber-400 opacity-75 group-hover:opacity-100 flex items-center gap-1 font-mono">✏️ Edit</span>
                </div>
              )}
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300">
                LEVEL {stats.level}
              </span>
            </div>

            {/* EXP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>EXPERIENCE</span>
                <span>{stats.exp} / {stats.expToNext} ({expPct}%)</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full border border-slate-700 overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${expPct}%` }} />
              </div>
            </div>

            {/* HP & Energy Bars */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-1">
              <div className="bg-slate-900/80 p-2 rounded border border-red-950 flex items-center gap-1.5">
                <Heart size={13} className="text-red-500 fill-red-500 shrink-0" />
                <span className="text-red-300 font-bold">{stats.hp} / {stats.maxHp} HP</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-sky-950 flex items-center gap-1.5">
                <Zap size={13} className="text-sky-400 fill-sky-400 shrink-0" />
                <span className="text-sky-300 font-bold">{stats.energy} / {stats.maxEnergy} MP</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMBAT STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Sword size={12} className="text-amber-400" /> Attack
            </span>
            <span className="text-sm font-bold text-amber-300">{stats.baseAttack}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield size={12} className="text-blue-400" /> Defense
            </span>
            <span className="text-sm font-bold text-blue-300">{stats.baseDefense}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap size={12} className="text-yellow-400" /> Critical
            </span>
            <span className="text-sm font-bold text-yellow-300">{Math.round((stats.critChance || 0.05) * 100)}%</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Coins size={12} className="text-amber-400" /> Total Gold
            </span>
            <span className="text-sm font-bold text-amber-300">{stats.gold} G</span>
          </div>
        </div>

        {/* CURRENT EQUIPMENT SLOTS */}
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            EQUIPPED GEAR
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Weapon */}
            <div className="bg-slate-950 p-2 rounded border border-slate-700 flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-500/60 flex items-center justify-center text-base">
                ⚔️
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-slate-400 uppercase">Weapon</div>
                <div className="font-bold text-amber-200 truncate">{equipment.weapon?.name || 'Bare Hands'}</div>
              </div>
            </div>

            {/* Armor */}
            <div className="bg-slate-950 p-2 rounded border border-slate-700 flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-950/60 border border-blue-500/60 flex items-center justify-center text-base">
                🛡️
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-slate-400 uppercase">Armor</div>
                <div className="font-bold text-blue-200 truncate">{equipment.armor?.name || 'Cloth Clothes'}</div>
              </div>
            </div>

            {/* Accessory */}
            <div className="bg-slate-950 p-2 rounded border border-slate-700 flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center text-base">
                💍
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-slate-400 uppercase">Accessory</div>
                <div className="font-bold text-emerald-200 truncate">{equipment.accessory?.name || 'None'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESSION & FEATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center gap-2">
            <Skull size={15} className="text-red-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400">Enemies Defeated</div>
              <div className="font-bold text-white">{stats.enemiesDefeated || 0}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center gap-2">
            <Trophy size={15} className="text-amber-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400">Bosses Slain</div>
              <div className="font-bold text-white">{stats.bossesDefeatedCount || 0}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center gap-2">
            <Shield size={15} className="text-emerald-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400">Quests Completed</div>
              <div className="font-bold text-white">{stats.questsCompletedCount || 0}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-center gap-2">
            <Clock size={15} className="text-cyan-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400">Play Time</div>
              <div className="font-bold text-white font-mono">{formattedPlayTime}</div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTON */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded shadow active:scale-95 transition-all"
          >
            [ESC] BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
