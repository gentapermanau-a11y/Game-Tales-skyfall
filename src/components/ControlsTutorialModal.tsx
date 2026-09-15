import React from 'react';
import { X, Keyboard, Sword, Zap, Shield, Sparkles, Check } from 'lucide-react';
import { sound } from '../services/audio';

interface ControlsTutorialModalProps {
  onClose: () => void;
}

export const ControlsTutorialModal: React.FC<ControlsTutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-pixel select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/70 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Keyboard className="text-amber-400" size={22} />
            <h2 className="text-lg font-bold tracking-wider text-amber-300 uppercase">
              PC KEYBOARD CONTROLS & COMBAT TUTORIAL
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* VIRTUAL PIXEL KEYBOARD DIAGRAM */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center gap-3">
            <div className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
              PRIMARY KEYBOARD LAYOUT
            </div>

            {/* Top row: Number quick slots */}
            <div className="flex items-center gap-2">
              {['1', '2', '3', '4'].map((num, idx) => {
                const labels = ['HP Brew', 'Elixir', 'Sky Slash', 'Checkpoint'];
                return (
                  <div key={num} className="flex flex-col items-center">
                    <div className="w-11 h-10 rounded bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-sm font-bold text-amber-300 shadow font-mono">
                      {num}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5">{labels[idx]}</span>
                  </div>
                );
              })}
            </div>

            {/* Middle row: Movement WASD + Action Keys */}
            <div className="grid grid-cols-2 gap-6 w-full pt-2 border-t border-slate-800/80">
              {/* Movement Block */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Movement
                </span>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded bg-slate-800 border-2 border-sky-500/60 flex items-center justify-center text-sm font-bold text-white shadow font-mono">
                    W
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-10 h-10 rounded bg-slate-800 border-2 border-sky-500/60 flex items-center justify-center text-sm font-bold text-white shadow font-mono">
                      A
                    </div>
                    <div className="w-10 h-10 rounded bg-slate-800 border-2 border-sky-500/60 flex items-center justify-center text-sm font-bold text-white shadow font-mono">
                      S
                    </div>
                    <div className="w-10 h-10 rounded bg-slate-800 border-2 border-sky-500/60 flex items-center justify-center text-sm font-bold text-white shadow font-mono">
                      D
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Action Block */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Combat & Interaction
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded bg-amber-950/80 border-2 border-amber-500 flex items-center justify-center text-sm font-bold text-amber-200 shadow font-mono">
                      J
                    </div>
                    <span className="text-[9px] text-amber-400 font-bold mt-0.5">ATTACK</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded bg-purple-950/80 border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-200 shadow font-mono">
                      K
                    </div>
                    <span className="text-[9px] text-purple-400 font-bold mt-0.5">SKILL</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-200 shadow font-mono">
                      L
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold mt-0.5">DODGE</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded bg-blue-950/80 border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-200 shadow font-mono">
                      E
                    </div>
                    <span className="text-[9px] text-blue-400 font-bold mt-0.5">ACTION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COMBAT SYSTEM BREAKDOWN */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sword size={16} className="text-amber-400" />
              <span>COMBAT COMBOS & MECHANICS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>3-Hit Sword Combo (J ➔ J ➔ J)</span>
                </div>
                <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                  Chain attacks together. The 3rd hit unleashes a sweeping heavy slash that deals 180% damage and knocks enemies back!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Sky Slash (Press K)</span>
                </div>
                <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                  Consumes 25 Energy. Generates an explosive radiant shockwave hitting all nearby enemies with severe damage and stun!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Invincible Dodge Dash (Press L)</span>
                </div>
                <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                  Gives Aeron 0.3s of complete invulnerability frames to phase through enemy attacks and boss telegraph red zones.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-bold text-sky-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Checkpoint Crystals</span>
                </div>
                <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                  Press E near a glowing crystal to instantly restore 100% HP & Energy, set your active respawn point, and save the game.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER CONFIRM BUTTON */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs tracking-wider flex items-center gap-2 border border-amber-400/60 shadow-lg active:scale-95 transition-all"
          >
            <Check size={16} />
            <span>GOT IT! START ADVENTURE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
