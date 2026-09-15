import React, { useRef, useState, useEffect } from 'react';
import { PlayerStats, EnemyEntity, AreaId, InteractionPrompt, FishingRodId } from '../types';
import { ActiveFishBuff } from '../game/engine';
import {
  Shield,
  Heart,
  Zap,
  Coins,
  Backpack,
  Scroll,
  User,
  Settings as SettingsIcon,
  Sparkles,
  MapPin,
  Compass,
  HelpCircle,
  Pause,
  BookOpen,
  Fish,
} from 'lucide-react';
import { sound } from '../services/audio';
import { KeyboardGuide } from './KeyboardGuide';

interface HUDProps {
  stats: PlayerStats;
  currentAreaName: string;
  currentAreaId: AreaId;
  activeBoss: EnemyEntity | null;
  notification: string | null;
  onAttack: () => void;
  onDodge: () => void;
  onSkill: () => void;
  onUltimate: () => void;
  onInteract: () => void;
  onUsePotion: () => void;
  potionCount: number;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenCharacter: () => void;
  onOpenSettings: () => void;
  onOpenMap?: () => void;
  onOpenPause?: () => void;
  onOpenControls?: () => void;
  onOpenFishAlmanac?: () => void;
  activeFishBuffs?: ActiveFishBuff[];
  equippedRod?: FishingRodId;
  onFishingAction?: () => void;
  onQuickSlot?: (slot: number) => void;
  skillCooldown: number;
  ultCooldown: number;
  dodgeCooldown: number;
  onMoveInput: (x: number, y: number) => void;
  touchControls: boolean;
  showFps: boolean;
  showKeyboardGuide?: boolean;
  interactionPrompt?: InteractionPrompt | null;
  portalWarpInfo?: { targetAreaName: string; isWarping: boolean } | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentAreaName,
  activeBoss,
  notification,
  onAttack,
  onDodge,
  onSkill,
  onUltimate,
  onInteract,
  onUsePotion,
  potionCount,
  onOpenInventory,
  onOpenQuests,
  onOpenCharacter,
  onOpenSettings,
  onOpenMap,
  onOpenPause,
  onOpenControls,
  onOpenFishAlmanac,
  activeFishBuffs = [],
  equippedRod = 'rod_wooden',
  onFishingAction,
  onQuickSlot,
  skillCooldown,
  ultCooldown,
  dodgeCooldown,
  onMoveInput,
  touchControls,
  showFps,
  showKeyboardGuide = true,
  interactionPrompt,
  portalWarpInfo,
}) => {
  // Virtual Joystick Logic with pointer capture
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  // FPS Counter
  const [fps, setFps] = useState(60);
  const framesCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());

  useEffect(() => {
    let animId: number;
    const calcFps = (time: number) => {
      framesCountRef.current++;
      if (time - lastFpsTimeRef.current >= 1000) {
        setFps(Math.round((framesCountRef.current * 1000) / (time - lastFpsTimeRef.current)));
        framesCountRef.current = 0;
        lastFpsTimeRef.current = time;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const resetJoystick = () => {
    activePointerIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onMoveInput(0, 0);
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 40;

    if (dist < 4) {
      setKnobPos({ x: 0, y: 0 });
      onMoveInput(0, 0);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });
    onMoveInput(kx / maxRadius, ky / maxRadius);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateJoystickPos(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      updateJoystickPos(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      resetJoystick();
    }
  };

  // Safety fallback for global blur or cancel
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (activePointerIdRef.current !== null) {
        resetJoystick();
      }
    };
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);
    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
    };
  }, []);

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const energyPercent = Math.max(0, Math.min(100, (stats.energy / stats.maxEnergy) * 100));
  const expPercent = Math.max(0, Math.min(100, (stats.exp / stats.expToNext) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-3 font-pixel">
      {/* TOP BAR */}
      <div className="flex items-start justify-between w-full pointer-events-auto gap-2">
        {/* PLAYER STATUS CARD */}
        <div className="bg-slate-950/85 backdrop-blur-sm border-2 border-slate-700 px-3 py-2 rounded shadow-lg flex flex-col gap-1 min-w-[210px] sm:min-w-[260px]">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Shield size={14} className="text-amber-400" />
              LV.{stats.level} {stats.name ? stats.name.toUpperCase() : 'AERON'}
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Coins size={13} className="text-amber-400" />
              {stats.gold}
            </span>
          </div>

          {/* HP BAR */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <Heart size={12} className="text-red-500 fill-red-500 shrink-0" />
            <div className="relative flex-1 h-3.5 bg-slate-900 border border-red-950 rounded-xs overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-150"
                style={{ width: `${hpPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold drop-shadow">
                {stats.hp} / {stats.maxHp}
              </span>
            </div>
          </div>

          {/* ENERGY BAR */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <Zap size={12} className="text-sky-400 fill-sky-400 shrink-0" />
            <div className="relative flex-1 h-3 bg-slate-900 border border-sky-950 rounded-xs overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-150"
                style={{ width: `${energyPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold drop-shadow">
                {Math.round(stats.energy)} / {stats.maxEnergy}
              </span>
            </div>
          </div>

          {/* EXP MINI BAR */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-400 transition-all duration-200"
              style={{ width: `${expPercent}%` }}
            />
          </div>

          {/* ACTIVE FISH BUFFS */}
          {activeFishBuffs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {activeFishBuffs.map((buff) => (
                <div
                  key={buff.fishId}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-500/50 rounded text-[9px] text-cyan-200 shadow animate-pulse"
                  title={`${buff.name}: ${buff.buffText} (${Math.ceil(buff.remainingSeconds)}s left)`}
                >
                  <span>{buff.icon}</span>
                  <span className="font-mono font-bold">{Math.ceil(buff.remainingSeconds)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOCATION & NOTIFICATION BANNER */}
        <div className="flex flex-col items-center flex-1 max-w-md mx-2">
          <div className="bg-slate-950/80 border border-amber-600/40 text-amber-200 px-3 py-1 rounded-full text-[10px] sm:text-xs flex items-center gap-1.5 shadow-md">
            <MapPin size={12} className="text-amber-400" />
            <span>{currentAreaName}</span>
          </div>

          {notification && (
            <div className="mt-2 bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-amber-950/90 border-y-2 border-amber-500 text-amber-100 text-xs px-4 py-1.5 rounded shadow-xl animate-bounce text-center">
              {notification}
            </div>
          )}

          {/* BOSS HP BAR */}
          {activeBoss && activeBoss.state !== 'dead' && (
            <div className="w-full mt-2 bg-slate-950/95 border-2 border-red-600 p-2 rounded shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-red-400 mb-1">
                <span>⚔️ {activeBoss.name}</span>
                <span className="text-amber-300">
                  {activeBoss.bossPhase === 2 ? '🔥 ENRAGED' : 'PHASE 1'}
                </span>
              </div>
              <div className="relative w-full h-4 bg-slate-900 border border-red-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150"
                  style={{ width: `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                  {activeBoss.hp} / {activeBoss.maxHp}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT MENU BUTTONS */}
        <div className="flex items-center gap-1.5 bg-slate-950/85 border-2 border-slate-700 p-1.5 rounded shadow-lg">
          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenInventory();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded border border-slate-600 active:scale-95 transition-all relative"
            title="Inventory [I]"
          >
            <Backpack size={16} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenQuests();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded border border-slate-600 active:scale-95 transition-all relative"
            title="Quests [Q]"
          >
            <Scroll size={16} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onOpenMap) onOpenMap();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded border border-slate-600 active:scale-95 transition-all relative"
            title="World Map [M]"
          >
            <Compass size={16} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onOpenFishAlmanac) onOpenFishAlmanac();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 rounded border border-slate-600 active:scale-95 transition-all relative"
            title="Angler Almanac [F]"
          >
            <BookOpen size={16} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenCharacter();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded border border-slate-600 active:scale-95 transition-all"
            title="Character Stats [C]"
          >
            <User size={16} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onOpenControls) onOpenControls();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded border border-slate-600 active:scale-95 transition-all"
            title="Keyboard Guide [H]"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onOpenPause) onOpenPause();
              else onOpenSettings();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded border border-slate-600 active:scale-95 transition-all"
            title="Pause & Settings [ESC]"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* QUICK SLOTS BAR (LEFT MID) */}
      <div className="pointer-events-auto self-start mt-auto mb-16 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-700 p-1.5 rounded-lg shadow-xl backdrop-blur-xs">
          {/* Slot 1: Health Potion */}
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onQuickSlot) onQuickSlot(1);
              else onUsePotion();
            }}
            className="relative w-10 h-10 bg-slate-900 hover:bg-red-950/80 border border-red-700/80 text-white rounded flex flex-col items-center justify-center shadow active:scale-95 transition-all"
            title="[1] Health Potion"
          >
            <span className="text-base">🧪</span>
            <span className="absolute -top-1.5 -left-1 text-[9px] font-mono font-bold bg-slate-800 text-amber-300 px-1 rounded border border-slate-600">
              1
            </span>
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] px-1 rounded-full font-bold">
              {potionCount}
            </span>
          </button>

          {/* Slot 2: Energy Elixir */}
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onQuickSlot) onQuickSlot(2);
            }}
            className="relative w-10 h-10 bg-slate-900 hover:bg-sky-950/80 border border-sky-700/80 text-white rounded flex flex-col items-center justify-center shadow active:scale-95 transition-all"
            title="[2] Energy Elixir"
          >
            <span className="text-base">💧</span>
            <span className="absolute -top-1.5 -left-1 text-[9px] font-mono font-bold bg-slate-800 text-amber-300 px-1 rounded border border-slate-600">
              2
            </span>
          </button>

          {/* Slot 3: Sky Slash */}
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onQuickSlot) onQuickSlot(3);
              else onSkill();
            }}
            className="relative w-10 h-10 bg-slate-900 hover:bg-purple-950/80 border border-purple-700/80 text-white rounded flex flex-col items-center justify-center shadow active:scale-95 transition-all"
            title="[3] Sky Slash"
          >
            <span className="text-base">⚡</span>
            <span className="absolute -top-1.5 -left-1 text-[9px] font-mono font-bold bg-slate-800 text-amber-300 px-1 rounded border border-slate-600">
              3
            </span>
          </button>

          {/* Slot 4: Checkpoint Warp */}
          <button
            onClick={() => {
              sound.playButtonClick();
              if (onQuickSlot) onQuickSlot(4);
            }}
            className="relative w-10 h-10 bg-slate-900 hover:bg-emerald-950/80 border border-emerald-700/80 text-white rounded flex flex-col items-center justify-center shadow active:scale-95 transition-all"
            title="[4] Warp to Checkpoint"
          >
            <span className="text-base">💠</span>
            <span className="absolute -top-1.5 -left-1 text-[9px] font-mono font-bold bg-slate-800 text-amber-300 px-1 rounded border border-slate-600">
              4
            </span>
          </button>
        </div>

        {showFps && (
          <div className="bg-black/60 text-[10px] text-emerald-400 px-2 py-0.5 rounded w-fit border border-emerald-900">
            {fps} FPS
          </div>
        )}
      </div>

      {/* PORTAL WARP TRANSITION OVERLAY */}
      {portalWarpInfo?.isWarping && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none font-pixel">
          <div className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-950/90 border-2 border-sky-400/80 shadow-[0_0_60px_rgba(56,189,248,0.4)]">
            <div className="w-20 h-20 rounded-full border-4 border-sky-400 border-t-transparent animate-spin flex items-center justify-center">
              <span className="text-3xl animate-pulse">🌀</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
                REALM TELEPORTATION
              </span>
              <h2 className="text-xl font-bold tracking-wider text-amber-300 drop-shadow mt-0.5">
                {portalWarpInfo.targetAreaName}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Aligning celestial coordinates...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS (JOYSTICK + ACTION BUTTONS) */}
      <div className="flex items-end justify-between w-full pointer-events-none pb-2 relative">
        {/* VIRTUAL JOYSTICK (LEFT) */}
        <div className="pointer-events-auto">
          {touchControls && (
            <div
              ref={joystickBaseRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/60 border-2 border-slate-600 flex items-center justify-center relative touch-none select-none shadow-2xl backdrop-blur-xs cursor-pointer"
            >
              {/* Center thumb stick */}
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300 shadow-lg pointer-events-none flex items-center justify-center"
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                }}
              >
                <div className="w-4 h-4 rounded-full bg-amber-200/60" />
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS (RIGHT) */}
        <div className="pointer-events-auto flex items-end gap-1.5 sm:gap-2.5">
          {/* FISHING ROD / MANCING BUTTON */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (onFishingAction) onFishingAction();
            }}
            className="w-12 h-12 sm:w-13 sm:h-13 bg-gradient-to-br from-teal-800 to-cyan-900 hover:from-teal-700 hover:to-cyan-800 active:scale-90 border-2 border-cyan-400 text-white rounded-full flex flex-col items-center justify-center shadow-lg transition-transform text-[9px] font-bold touch-none select-none"
            title="Pakai Pancingan / Fish [G]"
          >
            <span className="text-sm">🎣</span>
            <span className="text-[8px] text-cyan-200">MANCING</span>
          </button>

          {/* INTERACT BUTTON */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onInteract();
            }}
            className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-800 hover:bg-emerald-700 active:scale-90 border-2 border-emerald-400 text-white rounded-full flex flex-col items-center justify-center shadow-lg transition-transform text-[10px] font-bold touch-none select-none"
            title="Interact [E]"
          >
            <Sparkles size={16} className="text-emerald-200 mb-0.5" />
            <span>ACTION</span>
          </button>

          {/* DODGE BUTTON */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (dodgeCooldown <= 0) onDodge();
            }}
            disabled={dodgeCooldown > 0}
            className={`w-13 h-13 sm:w-14 sm:h-14 ${
              dodgeCooldown > 0
                ? 'bg-slate-800 border-slate-600 opacity-60'
                : 'bg-indigo-700 hover:bg-indigo-600 active:scale-90 border-indigo-400'
            } border-2 text-white rounded-full flex flex-col items-center justify-center shadow-lg transition-transform text-[10px] font-bold relative overflow-hidden touch-none select-none`}
            title="Dodge Roll [L]"
          >
            <span className="text-sm">💨</span>
            <span>ROLL</span>
            {dodgeCooldown > 0 && (
              <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-slate-300">
                {dodgeCooldown.toFixed(1)}
              </span>
            )}
          </button>

          {/* SKILL: CYCLONE BUTTON */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (skillCooldown <= 0) onSkill();
            }}
            disabled={skillCooldown > 0}
            className={`w-14 h-14 sm:w-16 sm:h-16 ${
              skillCooldown > 0
                ? 'bg-slate-800 border-slate-600 opacity-60'
                : 'bg-sky-600 hover:bg-sky-500 active:scale-90 border-sky-300'
            } border-2 text-white rounded-full flex flex-col items-center justify-center shadow-lg transition-transform text-[10px] font-bold relative overflow-hidden touch-none select-none`}
            title="Sky Slash [K]"
          >
            <span className="text-base">🌪️</span>
            <span>SKILL</span>
            {skillCooldown > 0 && (
              <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-sky-200">
                {skillCooldown.toFixed(1)}
              </span>
            )}
          </button>

          {/* ULTIMATE: HEAVENLY JUDGMENT */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (ultCooldown <= 0 && stats.energy >= 80) onUltimate();
            }}
            disabled={ultCooldown > 0 || stats.energy < 80}
            className={`w-14 h-14 sm:w-16 sm:h-16 ${
              ultCooldown > 0 || stats.energy < 80
                ? 'bg-slate-800 border-slate-700 opacity-50'
                : 'bg-amber-600 hover:bg-amber-500 active:scale-90 border-amber-300 ring-2 ring-amber-400/50 animate-pulse'
            } border-2 text-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-transform text-[9px] font-bold relative overflow-hidden touch-none select-none`}
            title="Heavenly Judgment [U]"
          >
            <span className="text-base">⚡</span>
            <span>ULTIMATE</span>
            {ultCooldown > 0 && (
              <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-bold text-amber-200">
                {ultCooldown.toFixed(1)}
              </span>
            )}
          </button>

          {/* BASIC ATTACK COMBO (BIGGEST BUTTON) */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onAttack();
            }}
            className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-90 border-3 border-amber-400 text-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-transform text-xs font-bold ml-1 touch-none select-none"
            title="Attack Combo [J]"
          >
            <span className="text-2xl mb-0.5">⚔️</span>
            <span className="tracking-wider">ATTACK</span>
          </button>
        </div>
      </div>

      {/* LAPTOP KEYBOARD GUIDE (D始めて FLUSH AT THE ABSOLUTE BOTTOM OF THE SCREEN, UNDERNEATH TOUCH CONTROLS) */}
      {showKeyboardGuide && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center max-w-[92vw]">
          <KeyboardGuide
            prompt={interactionPrompt}
            isTouchMode={touchControls}
            onAttack={onAttack}
            onDodge={onDodge}
            onSkill={onSkill}
            onInteract={onInteract}
            onFishingAction={onFishingAction}
            onOpenInventory={onOpenInventory}
            onOpenQuests={onOpenQuests}
            onOpenMap={onOpenMap}
            onOpenPause={onOpenPause}
          />
        </div>
      )}
    </div>
  );
};
