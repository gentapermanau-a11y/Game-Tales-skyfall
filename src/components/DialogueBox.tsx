import React, { useState, useEffect } from 'react';
import { DialogNode } from '../types';
import { DIALOG_NODES } from '../game/questData';
import { sound } from '../services/audio';

interface DialogueBoxProps {
  dialogId: string;
  onClose: () => void;
  onSelectOption?: (nextId?: string) => void;
  textSpeed: 'slow' | 'normal' | 'fast';
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogId,
  onClose,
  onSelectOption,
  textSpeed,
}) => {
  const node: DialogNode | undefined = DIALOG_NODES[dialogId];
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const speedMs = textSpeed === 'fast' ? 12 : textSpeed === 'slow' ? 35 : 22;

  useEffect(() => {
    if (!node) return;

    setDisplayedText('');
    setIsTypingComplete(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < node.text.length) {
        setDisplayedText(node.text.slice(0, currentIndex + 1));
        if (currentIndex % 3 === 0) {
          sound.playDialogBlip();
        }
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [dialogId, node, speedMs]);

  // Keyboard listener for fast dialogue advancing (E, Space, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'e' || key === ' ' || key === 'enter') {
        e.preventDefault();
        if (!isTypingComplete) {
          setDisplayedText(node.text);
          setIsTypingComplete(true);
        } else if (!node.options || node.options.length === 0) {
          handleOptionClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTypingComplete, node]);

  if (!node) return null;

  const handleBoxClick = () => {
    if (!isTypingComplete) {
      setDisplayedText(node.text);
      setIsTypingComplete(true);
    }
  };

  const handleOptionClick = (nextId?: string, action?: () => void) => {
    sound.playButtonClick();
    if (action) action();
    if (nextId) {
      if (onSelectOption) onSelectOption(nextId);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed left-3 sm:left-6 bottom-14 sm:bottom-16 z-50 max-w-[calc(100vw-1.5rem)] w-[360px] sm:w-[430px] font-pixel select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div
        onClick={handleBoxClick}
        className="w-full bg-slate-950/95 border-2 border-amber-500 rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.85)] p-3 sm:p-3.5 flex flex-col gap-2.5 backdrop-blur-md cursor-pointer"
      >
        {/* HEADER: NPC PORTRAIT + NAME + CLOSE BUTTON */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-slate-900 border border-amber-400/80 overflow-hidden flex items-center justify-center text-2xl shadow-inner shrink-0">
              {node.portrait === 'elder' && '🧙‍♂️'}
              {node.portrait === 'guard' && '🛡️'}
              {node.portrait === 'blacksmith' && '⚒️'}
              {node.portrait === 'shopkeeper' && '🧪'}
              {node.portrait === 'fisherman' && '🎣'}
              {node.portrait === 'witch' && '🧙‍♀️'}
              {node.portrait === 'mysterious' && '🔮'}
              {node.portrait === 'player' && '⚔️'}
              {node.portrait === 'system' && '📜'}
            </div>
            <div className="flex flex-col">
              <span className="text-amber-300 font-bold text-xs sm:text-sm tracking-wide">{node.speaker}</span>
              {node.speakerRole && (
                <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">{node.speakerRole}</span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playButtonClick();
              onClose();
            }}
            className="text-slate-400 hover:text-rose-400 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 border border-slate-700/60 transition-colors"
            title="Close [ESC]"
          >
            ✕
          </button>
        </div>

        {/* DIALOG BODY */}
        <div className="min-h-[52px] flex items-start">
          <p className="text-slate-100 text-[11px] sm:text-xs leading-relaxed whitespace-pre-line">
            {displayedText}
            {!isTypingComplete && <span className="inline-block animate-pulse ml-0.5 text-amber-400">▮</span>}
          </p>
        </div>

        {/* FOOTER: BRANCHING OPTIONS OR ADVANCE PROMPT */}
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[9px] text-slate-500">
            {isTypingComplete ? 'Click choice or press E' : 'Click to skip text'}
          </span>

          {isTypingComplete && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {node.options && node.options.length > 0 ? (
                node.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(opt.nextDialogId, opt.action);
                    }}
                    className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/70 hover:border-amber-400 text-amber-200 text-[10px] sm:text-xs rounded active:scale-95 flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>▶</span>
                    <span>{opt.text}</span>
                  </button>
                ))
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick();
                  }}
                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/80 hover:border-emerald-400 text-emerald-200 text-[10px] sm:text-xs rounded active:scale-95 flex items-center gap-1 shadow-sm transition-all"
                >
                  <kbd className="px-1 py-0 bg-slate-900 text-amber-300 rounded text-[9px] font-mono border border-slate-700">E</kbd>
                  <span>NEXT ▶</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
