import React from 'react';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { sound } from '../services/audio';

interface VictoryModalProps {
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-pixel select-none animate-fade-in">
      <div className="w-full max-w-lg bg-slate-950 border-3 border-amber-500 rounded-lg p-6 flex flex-col items-center text-center gap-4 pixel-box-gold shadow-2xl">
        <div className="flex items-center gap-3">
          <Sparkles size={24} className="text-amber-400 animate-spin" />
          <Trophy size={40} className="text-amber-400" />
          <Sparkles size={24} className="text-amber-400 animate-spin" />
        </div>

        <div>
          <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
            CHAPTER 1 CONQUERED
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
            THE SKY CORE AWAKENED!
          </h2>
        </div>

        <div className="bg-slate-900/90 border border-amber-600/50 p-4 rounded text-left space-y-2 text-xs text-slate-200 font-sans leading-relaxed">
          <p>
            With a decisive strike, the ancient corrupted golem <span className="text-rose-400 font-bold">Guardian Talos</span> shatters. Its ocular crystal purifies into an incandescent <span className="text-amber-300 font-bold">First Sky Core Fragment</span> that merges effortlessly into your sword!
          </p>
          <p>
            The dark miasma shrouding the Whispering Forest lifts, and the villagers of Skyfall herald your name as the true Champion of the Heavens.
          </p>
        </div>

        <div className="w-full bg-slate-900/70 border border-slate-800 p-2.5 rounded text-[11px] flex justify-around text-amber-300 font-bold">
          <span>⚔️ Boss: Vanquished</span>
          <span>💎 Core Fragment: 1/4</span>
          <span>🏆 Chapter 1: Cleared</span>
        </div>

        <button
          onClick={() => {
            sound.playButtonClick();
            onContinue();
          }}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded border-2 border-amber-400 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>CONTINUE FREE ADVENTURE</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
