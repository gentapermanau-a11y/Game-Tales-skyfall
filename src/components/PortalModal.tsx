import React from 'react';
import { sound } from '../services/audio';
import { PortalConfirmInfo } from '../types';

interface PortalModalProps {
  portalInfo: PortalConfirmInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  portalInfo,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-pixel select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-950/95 border-2 border-sky-400 rounded-lg shadow-[0_0_40px_rgba(56,189,248,0.3)] p-5 flex flex-col items-center gap-4 text-center">
        {/* ICON & TITLE */}
        <div className="w-14 h-14 rounded-full bg-sky-950 border-2 border-sky-400 flex items-center justify-center text-3xl shadow-inner">
          {portalInfo.isLocked ? '🔒' : '🌀'}
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
            REALM GATEWAY
          </span>
          <h2 className="text-base sm:text-lg font-bold text-amber-300 mt-0.5">
            TRAVEL TO [{portalInfo.targetAreaName.toUpperCase()}]?
          </h2>
        </div>

        {/* LOCKED OR UNLOCKED STATUS */}
        {portalInfo.isLocked ? (
          <div className="w-full bg-rose-950/60 border border-rose-500/70 rounded p-3 text-rose-200 text-xs flex flex-col gap-1">
            <span className="font-bold uppercase tracking-wider text-rose-300">
              GATEWAY SEALED
            </span>
            <p className="text-[11px] text-slate-300 font-sans">
              {portalInfo.lockReason || (portalInfo.requiredBossName ? `Defeat ${portalInfo.requiredBossName} first!` : 'Defeat the area boss to unlock this portal.')}
            </p>
          </div>
        ) : (
          <div className="w-full bg-sky-950/40 border border-sky-500/50 rounded p-2.5 text-sky-200 text-[11px] font-sans">
            Step through the celestial dimensional rift to enter {portalInfo.targetAreaName}.
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex items-center gap-3 w-full mt-1">
          {portalInfo.isLocked ? (
            <button
              onClick={() => {
                sound.playButtonClick();
                onCancel();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded text-xs font-bold transition-all active:scale-95"
            >
              CLOSE [ESC]
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onCancel();
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded text-xs font-bold transition-all active:scale-95"
              >
                NO (STAY)
              </button>
              <button
                onClick={() => {
                  onConfirm();
                }}
                className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 border border-sky-300 text-white rounded text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>YES (TRAVEL)</span>
                <span>▶</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
