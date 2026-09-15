import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { sound } from '../services/audio';

interface GameOverModalProps {
  onRespawn: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRespawn, onReturnToMenu }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-pixel select-none animate-fade-in">
      <div className="w-full max-w-md bg-slate-950 border-3 border-red-800 rounded-lg p-6 flex flex-col items-center text-center gap-4 pixel-box shadow-2xl">
        <div className="text-5xl animate-pulse">💀</div>
        <h2 className="text-2xl font-bold text-red-500 tracking-wider">YOU HAVE FALLEN</h2>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          The corrupting aura of the Sky Core overwhelmed your earthly vessel. But celestial spirits never truly perish...
        </p>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={() => {
              sound.playButtonClick();
              onRespawn();
            }}
            className="py-2.5 px-4 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded border border-red-500 shadow active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>REVIVE AT SAFE SANCTUARY</span>
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              onReturnToMenu();
            }}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home size={14} />
            <span>RETURN TO TITLE SCREEN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
