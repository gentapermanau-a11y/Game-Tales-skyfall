import React from 'react';
import { InteractionPrompt } from '../types';

interface KeyboardGuideProps {
  prompt?: InteractionPrompt | null;
  isTouchMode?: boolean;
  onAttack?: () => void;
  onDodge?: () => void;
  onSkill?: () => void;
  onInteract?: () => void;
  onOpenInventory?: () => void;
  onOpenQuests?: () => void;
  onOpenMap?: () => void;
  onOpenPause?: () => void;
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({
  prompt,
  isTouchMode = false,
  onAttack,
  onDodge,
  onSkill,
  onInteract,
  onOpenInventory,
  onOpenQuests,
  onOpenMap,
  onOpenPause,
}) => {
  const interactiveClass = isTouchMode
    ? 'pointer-events-none'
    : 'pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity';

  return (
    <div
      id="laptop-keyboard-guide"
      className="pointer-events-none select-none font-pixel flex flex-col items-center gap-0.5 max-w-full"
    >
      {/* CONTEXTUAL ACTION BANNER (ULTRA-SLIM MICRO PILL) */}
      {prompt ? (
        <div
          className={`pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] sm:text-[9px] font-bold tracking-tight shadow-md backdrop-blur-xs animate-in fade-in zoom-in-95 duration-100 ${
            prompt.isLocked
              ? 'bg-rose-950/85 border-rose-500/70 text-rose-200'
              : prompt.action.includes('PORTAL')
              ? 'bg-sky-950/85 border-sky-400/70 text-sky-200'
              : prompt.action.includes('TALK') || prompt.action.includes('SHOP')
              ? 'bg-emerald-950/85 border-emerald-400/70 text-emerald-200'
              : 'bg-amber-950/85 border-amber-400/70 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-0.5">
            {prompt.key.split('+').map((k, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[7px] text-slate-400">+</span>}
                <kbd
                  className={`px-1 py-0 rounded text-[7px] sm:text-[8px] font-mono font-bold leading-tight shadow-xs ${
                    prompt.isLocked
                      ? 'bg-rose-900 border border-rose-400 text-white'
                      : 'bg-slate-900 border border-amber-400 text-amber-300'
                  }`}
                >
                  {k.trim()}
                </kbd>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {prompt.icon && <span className="text-[9px] sm:text-[10px]">{prompt.icon}</span>}
            <span className="uppercase">{prompt.action}</span>
            {prompt.targetName && (
              <span className="text-white/80 font-normal truncate max-w-[100px] sm:max-w-[160px]">
                • {prompt.targetName}
              </span>
            )}
          </div>
        </div>
      ) : null}

      {/* PERSISTENT LAPTOP KEYBOARD STRIP (ULTRA-COMPACT MICRO DOCK BAR AT THE VERY BOTTOM) */}
      <div className="bg-slate-950/85 border-t border-x border-slate-800/90 rounded-t rounded-b-none px-1.5 sm:px-2.5 py-0.5 backdrop-blur-xs shadow-2xl flex items-center gap-1 sm:gap-2 text-[7px] sm:text-[8px] text-slate-300 whitespace-nowrap">
        {/* Movement */}
        <div className="flex items-center gap-0.5">
          <kbd className="px-1 py-0 bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-[2px] text-[7px] leading-tight">
            WASD
          </kbd>
          <span className="text-slate-400 hidden sm:inline">Move</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Combat actions */}
        <button
          onClick={onAttack}
          className={`flex items-center gap-0.5 ${interactiveClass}`}
          title="[J] / Space to Attack"
        >
          <kbd className="px-1 py-0 bg-slate-900 border border-slate-700 text-red-400 font-mono font-bold rounded-[2px] text-[7px] leading-tight">
            J
          </kbd>
          <span className="text-slate-400">Atk</span>
        </button>

        <button
          onClick={onSkill}
          className={`flex items-center gap-0.5 ${interactiveClass}`}
          title="[K] to cast Skill"
        >
          <kbd className="px-1 py-0 bg-slate-900 border border-slate-700 text-sky-400 font-mono font-bold rounded-[2px] text-[7px] leading-tight">
            K
          </kbd>
          <span className="text-slate-400">Skl</span>
        </button>

        <button
          onClick={onDodge}
          className={`flex items-center gap-0.5 ${interactiveClass}`}
          title="[L] / Shift to Dodge"
        >
          <kbd className="px-1 py-0 bg-slate-900 border border-slate-700 text-indigo-400 font-mono font-bold rounded-[2px] text-[7px] leading-tight">
            L
          </kbd>
          <span className="text-slate-400">Ddg</span>
        </button>

        <button
          onClick={onInteract}
          className={`flex items-center gap-0.5 ${interactiveClass} ${
            prompt ? 'text-amber-300 font-bold' : ''
          }`}
          title="[E] to Interact"
        >
          <kbd
            className={`px-1 py-0 bg-slate-900 border font-mono font-bold rounded-[2px] text-[7px] leading-tight ${
              prompt
                ? 'border-amber-400 text-amber-300 bg-amber-950/40'
                : 'border-slate-700 text-emerald-400'
            }`}
          >
            E
          </kbd>
          <span className={prompt ? 'text-amber-300 font-bold' : 'text-slate-400'}>Act</span>
        </button>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Menus (shown on sm+ screens, or ultra-condensed) */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <button
            onClick={onOpenInventory}
            className={`flex items-center gap-0.5 ${interactiveClass}`}
            title="[I] Inventory"
          >
            <kbd className="px-0.5 py-0 bg-slate-900 border border-slate-700 text-slate-300 font-mono rounded-[2px] text-[7px] leading-tight">
              I
            </kbd>
            <span>Bag</span>
          </button>

          <button
            onClick={onOpenQuests}
            className={`flex items-center gap-0.5 ${interactiveClass}`}
            title="[Q] Quests"
          >
            <kbd className="px-0.5 py-0 bg-slate-900 border border-slate-700 text-slate-300 font-mono rounded-[2px] text-[7px] leading-tight">
              Q
            </kbd>
            <span>Qst</span>
          </button>

          <button
            onClick={onOpenMap}
            className={`flex items-center gap-0.5 ${interactiveClass}`}
            title="[M] Map"
          >
            <kbd className="px-0.5 py-0 bg-slate-900 border border-slate-700 text-slate-300 font-mono rounded-[2px] text-[7px] leading-tight">
              M
            </kbd>
            <span>Map</span>
          </button>

          <button
            onClick={onOpenPause}
            className={`flex items-center gap-0.5 ${interactiveClass}`}
            title="[ESC] Menu"
          >
            <kbd className="px-0.5 py-0 bg-slate-900 border border-slate-700 text-slate-300 font-mono rounded-[2px] text-[7px] leading-tight">
              ESC
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
