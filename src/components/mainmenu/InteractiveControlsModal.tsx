import React, { useState, useEffect } from 'react';
import { sound } from '../../services/audio';
import { X, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react';

interface InteractiveControlsModalProps {
  onClose: () => void;
}

export const InteractiveControlsModal: React.FC<InteractiveControlsModalProps> = ({ onClose }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        sound.playButtonClick();
        onClose();
        return;
      }
      setPressedKeys((prev) => new Set(prev).add(e.code.toUpperCase()));
      setLastPressed(e.key.toUpperCase());
      sound.playButtonClick();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code.toUpperCase());
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onClose]);

  // Key configurations
  const KEY_BINDINGS: Record<
    string,
    { label: string; action: string; color: string; desc: string }
  > = {
    KEYW: { label: 'W', action: 'Move Up', color: 'bg-emerald-600 border-emerald-400 text-white', desc: 'Northward movement' },
    KEYA: { label: 'A', action: 'Move Left', color: 'bg-emerald-600 border-emerald-400 text-white', desc: 'Westward movement' },
    KEYS: { label: 'S', action: 'Move Down', color: 'bg-emerald-600 border-emerald-400 text-white', desc: 'Southward movement' },
    KEYD: { label: 'D', action: 'Move Right', color: 'bg-emerald-600 border-emerald-400 text-white', desc: 'Eastward movement' },
    KEYJ: { label: 'J', action: 'Attack', color: 'bg-amber-600 border-amber-400 text-white', desc: '3-hit sword combo' },
    KEYK: { label: 'K', action: 'Cyclone Skill', color: 'bg-cyan-600 border-cyan-400 text-white', desc: 'Skyward AoE whirlwind' },
    KEYL: { label: 'L', action: 'Dodge Roll', color: 'bg-purple-600 border-purple-400 text-white', desc: 'Dash with invincibility frames' },
    KEYU: { label: 'U', action: 'Ultimate', color: 'bg-rose-600 border-rose-400 text-white', desc: 'Heavenly Judgment strike' },
    KEYE: { label: 'E', action: 'Interact', color: 'bg-yellow-600 border-yellow-300 text-white', desc: 'Talk to NPCs, open chests, push blocks' },
    KEYI: { label: 'I', action: 'Inventory', color: 'bg-blue-600 border-blue-400 text-white', desc: 'Manage gear & consumables' },
    KEYQ: { label: 'Q', action: 'Quest Log', color: 'bg-orange-600 border-orange-400 text-white', desc: 'View active objectives & rewards' },
    KEYM: { label: 'M', action: 'World Map', color: 'bg-teal-600 border-teal-400 text-white', desc: 'View realm portals & locations' },
    KEYC: { label: 'C', action: 'Profile', color: 'bg-indigo-600 border-indigo-400 text-white', desc: 'View Aeron attributes & stats' },
    KEYP: { label: 'P', action: 'Profile', color: 'bg-indigo-600 border-indigo-400 text-white', desc: 'Alternative profile shortcut' },
    SPACE: { label: 'SPACE', action: 'Attack / Skip', color: 'bg-amber-600 border-amber-400 text-white', desc: 'Attack in combat / skip dialog & intro' },
    SHIFTLEFT: { label: 'SHIFT', action: 'Dodge', color: 'bg-purple-600 border-purple-400 text-white', desc: 'Alternative dodge shortcut' },
    ESCAPE: { label: 'ESC', action: 'Menu / Back', color: 'bg-slate-700 border-slate-500 text-white', desc: 'Pause game or close current window' },
  };

  const isKeyActive = (code: string) => pressedKeys.has(code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-pixel select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-950 border-2 border-amber-500/80 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-4 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wider">
                KEYBOARD CONTROLS & TESTER
              </h2>
              <span className="text-[10px] text-slate-400">
                Press any key on your keyboard to test responsiveness in real-time
              </span>
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

        {/* INTERACTIVE KEY PRESS BANNER */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>
              {lastPressed
                ? `Active Key Detected: "${lastPressed}"`
                : 'Press any key on your keyboard to test inputs'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 size={11} /> 60 FPS INPUT READY
          </span>
        </div>

        {/* VISUAL LAPTOP KEYBOARD DIAGRAM */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 shadow-inner items-center">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
            LAPTOP KEYBOARD OVERVIEW
          </div>

          {/* Row 1: Function / Numbers */}
          <div className="flex gap-1.5 sm:gap-2">
            {['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((k) => {
              const code = k === 'ESC' ? 'ESCAPE' : `DIGIT${k}`;
              const isP = isKeyActive(code);
              return (
                <div
                  key={k}
                  className={`w-7 sm:w-9 h-7 sm:h-8 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                    isP
                      ? 'bg-amber-400 text-black border-amber-200 scale-95 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : k === 'ESC'
                      ? 'bg-slate-800 text-slate-200 border-slate-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {k}
                </div>
              );
            })}
          </div>

          {/* Row 2: QWERTY */}
          <div className="flex gap-1.5 sm:gap-2">
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => {
              const code = `KEY${k}`;
              const binding = KEY_BINDINGS[code];
              const isP = isKeyActive(code);
              return (
                <div
                  key={k}
                  className={`w-7 sm:w-9 h-7 sm:h-8 rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                    isP
                      ? 'bg-amber-400 text-black border-amber-200 scale-95 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : binding
                      ? binding.color
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title={binding ? `${k}: ${binding.action}` : k}
                >
                  <span>{k}</span>
                </div>
              );
            })}
          </div>

          {/* Row 3: ASDF */}
          <div className="flex gap-1.5 sm:gap-2 pl-2 sm:pl-3">
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k) => {
              const code = `KEY${k}`;
              const binding = KEY_BINDINGS[code];
              const isP = isKeyActive(code);
              return (
                <div
                  key={k}
                  className={`w-7 sm:w-9 h-7 sm:h-8 rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                    isP
                      ? 'bg-amber-400 text-black border-amber-200 scale-95 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : binding
                      ? binding.color
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title={binding ? `${k}: ${binding.action}` : k}
                >
                  <span>{k}</span>
                </div>
              );
            })}
          </div>

          {/* Row 4: ZXCV */}
          <div className="flex gap-1.5 sm:gap-2 pl-4 sm:pl-6">
            {['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => {
              const code = k === 'SHIFT' ? 'SHIFTLEFT' : `KEY${k}`;
              const binding = KEY_BINDINGS[code];
              const isP = isKeyActive(code) || (k === 'SHIFT' && isKeyActive('SHIFTRIGHT'));
              return (
                <div
                  key={k}
                  className={`h-7 sm:h-8 rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                    k === 'SHIFT' ? 'w-12 sm:w-14' : 'w-7 sm:w-9'
                  } ${
                    isP
                      ? 'bg-amber-400 text-black border-amber-200 scale-95 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : binding
                      ? binding.color
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title={binding ? `${k}: ${binding.action}` : k}
                >
                  <span>{k}</span>
                </div>
              );
            })}
          </div>

          {/* Row 5: Space */}
          <div className="flex gap-2 items-center justify-center pt-1">
            <div
              className={`h-7 sm:h-8 w-44 sm:w-60 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all border ${
                isKeyActive('SPACE')
                  ? 'bg-amber-400 text-black border-amber-200 scale-95 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'bg-amber-600 border-amber-400 text-white'
              }`}
              title="Space: Normal Attack"
            >
              SPACE (ATTACK / SKIP)
            </div>
          </div>
        </div>

        {/* DETAILED ACTION KEY LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {Object.entries(KEY_BINDINGS).map(([code, item]) => (
            <div
              key={code}
              className={`p-2.5 rounded border flex items-center justify-between transition-colors ${
                isKeyActive(code)
                  ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-7 rounded bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-bold text-amber-300 text-[11px] shrink-0">
                  {item.label}
                </span>
                <div>
                  <div className="font-bold text-white text-[11px]">{item.action}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{item.desc}</div>
                </div>
              </div>
              {isKeyActive(code) && (
                <span className="text-[9px] text-amber-300 font-bold animate-pulse">PRESSED</span>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER BUTTON */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded shadow active:scale-95 transition-all flex items-center gap-2"
          >
            <span>[ESC] BACK TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
