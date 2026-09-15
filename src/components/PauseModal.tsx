import React from 'react';
import {
  Play,
  Package,
  BookOpen,
  Map,
  User,
  Settings,
  HelpCircle,
  Save,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { sound } from '../services/audio';

interface PauseModalProps {
  onResume: () => void;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenMap: () => void;
  onOpenCharacter: () => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  onSaveGame: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenInventory,
  onOpenQuests,
  onOpenMap,
  onOpenCharacter,
  onOpenControls,
  onOpenSettings,
  onSaveGame,
  onMainMenu,
}) => {
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);

  const handleManualSave = () => {
    sound.playLevelUp();
    onSaveGame();
    setSaveStatus('Progress successfully saved!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-pixel select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏸️</span>
            <h2 className="text-lg font-bold tracking-wider text-amber-300 uppercase">
              GAME PAUSED
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onResume();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* MENU OPTIONS LIST */}
        <div className="p-6 space-y-2.5">
          {saveStatus && (
            <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
              <Sparkles size={14} />
              <span>{saveStatus}</span>
            </div>
          )}

          <button
            onClick={() => {
              sound.playButtonClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs tracking-wider flex items-center justify-between border border-amber-400 shadow-md active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <Play size={16} fill="currentColor" />
              <span>RESUME GAME</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-800/80 text-amber-100 font-mono">
              ESC
            </span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenInventory();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <Package size={16} className="text-sky-400" />
              <span>INVENTORY & EQUIPMENT</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
              I
            </span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenQuests();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-amber-400" />
              <span>QUEST JOURNAL</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
              Q
            </span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenMap();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <Map size={16} className="text-emerald-400" />
              <span>WORLD MAP & FAST TRAVEL</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
              M
            </span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenCharacter();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <User size={16} className="text-purple-400" />
              <span>AERON'S ATTRIBUTES</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
              C
            </span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenControls();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-indigo-400" />
              <span>KEYBOARD CONTROLS GUIDE</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
              H
            </span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-slate-400" />
              <span>SETTINGS & AUDIO</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
              O
            </span>
          </button>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={handleManualSave}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs tracking-wider flex items-center justify-center gap-2 border border-emerald-600/40 active:scale-[0.99] transition-all shadow"
            >
              <Save size={16} />
              <span>MANUAL SAVE GAME</span>
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                onMainMenu();
              }}
              className="w-full py-2 px-4 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-xs tracking-wider flex items-center justify-center gap-2 border border-red-800/40 active:scale-[0.99] transition-all"
            >
              <LogOut size={14} />
              <span>EXIT TO MAIN MENU</span>
            </button>

            <div className="pt-2 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
              <span>Game by</span>
              <span className="text-amber-300 font-bold">Duo Lier (GR)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
