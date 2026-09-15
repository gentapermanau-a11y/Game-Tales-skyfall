import React from 'react';
import { FishingEngineState, FishingBaitId, FishingRodId } from '../types';
import { FISHING_RODS, FISHING_BAITS, ALL_FISH } from '../game/fishingData';
import { Sparkles, Fish, Play, RotateCcw, X, AlertCircle, Award } from 'lucide-react';
import { sound } from '../services/audio';

interface FishingOverlayProps {
  fishingState: FishingEngineState;
  onCast: () => void;
  onHook: () => void;
  onReelStart: () => void;
  onReelEnd: () => void;
  onCancel: () => void;
  onToggleAutoFishing: () => void;
  onSelectBait: (baitId: FishingBaitId | null) => void;
  onSelectRod?: (rodId: FishingRodId) => void;
  availableBaits: { baitId: FishingBaitId; count: number }[];
  availableRods?: FishingRodId[];
}

export const FishingOverlay: React.FC<FishingOverlayProps> = ({
  fishingState,
  onCast,
  onHook,
  onReelStart,
  onReelEnd,
  onCancel,
  onToggleAutoFishing,
  onSelectBait,
  onSelectRod,
  availableBaits,
  availableRods = ['rod_wooden', 'rod_iron', 'rod_reinforced', 'rod_elemental', 'rod_celestial'],
}) => {
  const currentRod = FISHING_RODS[fishingState.equippedRod] || FISHING_RODS.rod_wooden;
  const currentBait = fishingState.equippedBait ? FISHING_BAITS[fishingState.equippedBait] : null;

  return (
    <div
      id="fishing-overlay"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] select-none pointer-events-auto"
    >
      {/* Top Header Card */}
      <div
        id="fishing-header-card"
        className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-amber-500/40 rounded-xl px-5 py-2.5 shadow-2xl flex flex-wrap items-center justify-center gap-3 text-white max-w-[95vw]"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎣</span>
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {fishingState.spotName || 'Quiet Waters'}
            </h3>
            <p className="text-[10px] text-slate-300">
              Power: <span className="text-amber-300 font-bold">{currentRod.power}</span> | Control: <span className="text-cyan-300 font-bold">x{currentRod.barSizeMultiplier}</span>
            </p>
          </div>
        </div>

        {/* Rod Selector */}
        {onSelectRod && (
          <>
            <div className="h-6 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Pancingan:</span>
              <select
                id="fishing-rod-select"
                value={fishingState.equippedRod}
                onChange={(e) => {
                  sound.playButtonClick();
                  onSelectRod(e.target.value as FishingRodId);
                }}
                className="bg-slate-800 text-xs text-amber-300 border border-amber-500/50 rounded px-2 py-1 focus:outline-none focus:border-amber-400 font-bold"
              >
                {availableRods.map((rodId) => {
                  const r = FISHING_RODS[rodId];
                  return (
                    <option key={rodId} value={rodId}>
                      {r ? r.name : rodId}
                    </option>
                  );
                })}
              </select>
            </div>
          </>
        )}

        <div className="h-6 w-px bg-slate-700 hidden sm:block" />

        {/* Bait Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Bait:</span>
          <select
            id="fishing-bait-select"
            value={fishingState.equippedBait || ''}
            onChange={(e) => onSelectBait((e.target.value as FishingBaitId) || null)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
          >
            <option value="">No Bait</option>
            {availableBaits.map((b) => (
              <option key={b.baitId} value={b.baitId}>
                {FISHING_BAITS[b.baitId]?.name || b.baitId} (x{b.count})
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-slate-700" />

        {/* Auto Fishing Button */}
        <button
          id="btn-toggle-autofish"
          onClick={() => {
            sound.playButtonClick();
            onToggleAutoFishing();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
            fishingState.isAutoFishing
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold shadow-[0_0_16px_rgba(245,158,11,0.6)] ring-2 ring-amber-300'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
          title="Toggle Auto-Fishing (100% Auto Menang)"
        >
          <Sparkles size={14} className={fishingState.isAutoFishing ? 'text-slate-950 animate-spin' : 'text-amber-400'} />
          <span>{fishingState.isAutoFishing ? '⚡ AUTO-MANCING: AKTIF (AUTO MENANG)' : '⚡ AUTO-MANCING: OFF'}</span>
        </button>

        {/* Close Button */}
        <button
          id="btn-close-fishing"
          onClick={() => {
            sound.playButtonClick();
            onCancel();
          }}
          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          title="Exit Fishing"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Interactive Stage Area */}
      <div id="fishing-stage-box" className="relative flex flex-col items-center">
        {/* PHASE 1: IDLE / CASTING */}
        {fishingState.phase === 'idle' && (
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center max-w-sm flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🎣
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">Ready to Cast</h2>
              <p className="text-xs text-slate-400 mt-1">
                Cast your line into the waters. Wait for ripples and exclamation mark to hook!
              </p>
            </div>
            <button
              id="btn-cast-line"
              onClick={() => {
                sound.playAttack(1);
                onCast();
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Play size={16} fill="white" />
              Cast Fishing Line [SPACE / E]
            </button>
          </div>
        )}

        {/* PHASE 2: CASTING ANIMATION */}
        {fishingState.phase === 'casting' && (
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl px-6 py-4 shadow-xl text-center flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-cyan-300">Casting into the depths...</span>
          </div>
        )}

        {/* PHASE 3: WAITING FOR BITE */}
        {fishingState.phase === 'waiting' && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl px-6 py-4 shadow-2xl text-center flex flex-col items-center gap-2 animate-pulse">
            <div className="text-2xl animate-bounce">🌊</div>
            <span className="text-sm font-bold text-slate-200">Bobber floating...</span>
            <span className="text-[11px] text-slate-400">Watch for ripples. Hook when [!] appears!</span>
          </div>
        )}

        {/* PHASE 4: BITE! HOOK NOW */}
        {fishingState.phase === 'bite' && (
          <div
            id="fishing-bite-prompt"
            onClick={() => {
              sound.playHit();
              onHook();
            }}
            className="cursor-pointer bg-gradient-to-r from-amber-600 to-rose-600 border-2 border-amber-300 rounded-2xl px-8 py-6 shadow-[0_0_30px_rgba(245,158,11,0.6)] text-center flex flex-col items-center gap-2 animate-bounce active:scale-95 transition-transform"
          >
            <span className="text-4xl font-black text-amber-200">❗ BITE! ❗</span>
            <span className="text-sm font-black text-white uppercase tracking-wider">
              CLICK OR PRESS [SPACE / E] TO HOOK!
            </span>
            <div className="w-48 h-2 bg-slate-900/80 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-amber-300 transition-all duration-75"
                style={{ width: `${Math.max(0, (fishingState.biteTimer / 1.6) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* PHASE 5: REELING MINI-GAME */}
        {fishingState.phase === 'reeling' && (
          <div
            id="fishing-reeling-card"
            className="bg-slate-950/95 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 w-80"
          >
            {/* Top Reel Info */}
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Fish size={15} />
                Reeling In Fish...
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  fishingState.fishTension > 75
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                    : fishingState.fishTension > 45
                    ? 'bg-amber-950 text-amber-300'
                    : 'bg-emerald-950 text-emerald-300'
                }`}
              >
                Tension: {Math.round(fishingState.fishTension)}%
              </span>
            </div>

            {/* Vertical Catch Gauge */}
            <div className="flex items-center gap-6 w-full justify-center">
              {/* Vertical Reel Bar Container */}
              <div
                id="reel-vertical-track"
                className="relative w-12 h-64 bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner flex flex-col justify-end"
              >
                {/* Background water depth gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-slate-900 to-cyan-950/40" />

                {/* Player Green Capture Bar */}
                <div
                  id="reel-player-bar"
                  className="absolute left-0 right-0 bg-gradient-to-r from-emerald-500/80 to-teal-400/80 border-y-2 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-75 pointer-events-none"
                  style={{
                    bottom: `${fishingState.barPosition}%`,
                    height: `${fishingState.barSize}%`,
                  }}
                />

                {/* Fish Icon Target */}
                <div
                  id="reel-fish-target"
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl transition-all duration-75 pointer-events-none"
                  style={{
                    bottom: `${fishingState.fishPosition}%`,
                  }}
                >
                  🐟
                </div>
              </div>

              {/* Progress & Tension Vertical Meters */}
              <div className="flex flex-col gap-4">
                {/* Catch Progress Meter */}
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Catch</span>
                  <div className="w-4 h-36 bg-slate-900 border border-slate-700 rounded-full overflow-hidden flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all duration-75"
                      style={{ height: `${fishingState.reelProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-300">
                    {Math.round(fishingState.reelProgress)}%
                  </span>
                </div>

                {/* Tension Warning Meter */}
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Line</span>
                  <div className="w-3 h-14 bg-slate-900 border border-slate-700 rounded-full overflow-hidden flex flex-col justify-end">
                    <div
                      className={`w-full transition-all duration-75 ${
                        fishingState.fishTension > 75
                          ? 'bg-rose-500'
                          : fishingState.fishTension > 45
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ height: `${fishingState.fishTension}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reeling Controls */}
            <div className="w-full flex flex-col gap-2">
              {fishingState.isAutoFishing ? (
                <div className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] text-sm flex items-center justify-center gap-2 animate-pulse">
                  <Sparkles size={16} className="animate-spin" />
                  <span>⚡ AUTO-WINNING (100% PASTI MENANG)...</span>
                </div>
              ) : (
                <button
                  id="btn-hold-reel"
                  onMouseDown={onReelStart}
                  onMouseUp={onReelEnd}
                  onTouchStart={onReelStart}
                  onTouchEnd={onReelEnd}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  HOLD TO REEL [SPACE / HOLD]
                </button>
              )}
              <p className="text-[10px] text-slate-400 text-center">
                {fishingState.isAutoFishing
                  ? 'Auto-fishing aktif: Sistem otomatis mengunci ikan & memenangkan tangkapan!'
                  : 'Keep the green bar over the fish to fill the catch meter!'}
              </p>
            </div>
          </div>
        )}

        {/* PHASE 6: CAUGHT REWARD BANNER */}
        {fishingState.phase === 'caught' && fishingState.lastCaughtFish && (
          <div
            id="fishing-caught-banner"
            className="bg-slate-950/95 border-2 border-amber-400 rounded-2xl p-6 shadow-[0_0_35px_rgba(245,158,11,0.4)] text-center flex flex-col items-center gap-4 max-w-sm animate-in zoom-in duration-200"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Sparkles size={16} />
              Fish Caught!
              <Sparkles size={16} />
            </div>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-400/40 flex items-center justify-center text-5xl shadow-xl">
              {fishingState.lastCaughtFish.species.icon}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {fishingState.lastCaughtFish.species.name}
                </h2>
                {fishingState.lastCaughtFish.isNewDiscovery && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase">
                    New!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 italic">
                "{fishingState.lastCaughtFish.species.description}"
              </p>
            </div>

            {/* Measurements & Buff Details */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase">Length</span>
                <span className="text-slate-100 font-bold font-mono">
                  {fishingState.lastCaughtFish.size} cm
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase">Weight</span>
                <span className="text-slate-100 font-bold font-mono">
                  {fishingState.lastCaughtFish.weight} kg
                </span>
              </div>
            </div>

            <div className="w-full bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 text-xs text-amber-200 text-center font-semibold">
              ✨ Buff: {fishingState.lastCaughtFish.species.buffText}
            </div>

            <div className="w-full flex gap-2">
              <button
                id="btn-fish-again"
                onClick={() => {
                  sound.playButtonClick();
                  onCast();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Play size={13} fill="white" />
                Fish Again
              </button>
              <button
                id="btn-finish-fishing"
                onClick={() => {
                  sound.playButtonClick();
                  onCancel();
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* PHASE 7: ESCAPED / SNAPPED BANNER */}
        {fishingState.phase === 'escaped' && (
          <div className="bg-slate-950/95 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center gap-3 max-w-xs animate-in zoom-in duration-150">
            <AlertCircle size={36} className="text-rose-400" />
            <h3 className="text-base font-black text-rose-300">The Fish Escaped!</h3>
            <p className="text-xs text-slate-400">
              The line lost tension or snapped under stress. Try again with steadier reeling!
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onCast();
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onCancel();
                }}
                className="px-4 py-2 bg-slate-900 text-slate-400 font-semibold rounded-xl text-xs hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
