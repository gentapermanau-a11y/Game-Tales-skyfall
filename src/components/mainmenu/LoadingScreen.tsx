import React, { useState, useEffect } from 'react';
import { Sparkles, Shield } from 'lucide-react';

interface LoadingScreenProps {
  onLoaded: () => void;
  destinationText?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoaded,
  destinationText = 'Entering Skyfall Village...',
}) => {
  const [progress, setProgress] = useState(0);

  const TIPS = [
    'TIP: Time your Dodge Roll [L / Shift] to gain invincibility frames and pass through boss slash waves.',
    'TIP: Unleash a full 3-hit attack chain [J / Space] to launch a piercing Sky Slash projectile wave.',
    'TIP: Collect refined Iron Ore and Gold to forge higher tiers of weapons and armor with the blacksmith.',
    'TIP: Defeating realm bosses shatters ancient dimensional seals guarding portal gateways.',
    'TIP: Push heavy stone blocks onto rune pressure plates to solve sanctum puzzles and open secret gates.',
    'TIP: Skyward Cyclone [K] clears surrounding mobs, while Heavenly Judgment [U] decimates bosses.'
  ];

  const [currentTip] = useState(
    () => TIPS[Math.floor(Math.random() * TIPS.length)]
  );

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1600; // 1.6s smooth transition

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onLoaded, 150);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onLoaded]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-black select-none font-pixel animate-in fade-in duration-200">
      {/* TOP DECORATION */}
      <div className="flex items-center gap-2 text-xs text-amber-400/80 tracking-widest uppercase mt-4">
        <Sparkles size={14} className="animate-spin text-amber-300" />
        <span>TALES OF THE SKYFALL • LOADING REALM</span>
        <Sparkles size={14} className="animate-spin text-amber-300" />
      </div>

      {/* CENTER LOGO & ANIMATED CELESTIAL RUNE */}
      <div className="flex flex-col items-center gap-6 my-auto">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Rotating celestial ring 1 */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: '6s' }} />
          {/* Rotating celestial ring 2 (counter) */}
          <div className="absolute inset-2 rounded-full border border-sky-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
          {/* Inner pulsating glow */}
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse">
            ⚔️
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 tracking-wider">
            TALES OF THE SKYFALL
          </h2>
          <p className="text-xs text-sky-400 font-mono tracking-wide">{destinationText}</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-72 sm:w-96 flex flex-col gap-2">
          <div className="relative h-3.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-sky-400 rounded-full transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/80 rounded-full blur-[1px] animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>SYNCHRONIZING REALM TILES</span>
            <span className="text-amber-300 font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* BOTTOM RANDOM GAMEPLAY TIP */}
      <div className="max-w-lg w-full bg-slate-900/90 border border-amber-500/30 rounded-lg p-3.5 text-center shadow-lg">
        <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
          <Shield size={13} />
          <span>SURVIVAL GUIDELINES</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{currentTip}</p>
      </div>
    </div>
  );
};
