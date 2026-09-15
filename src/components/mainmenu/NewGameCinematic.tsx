import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/audio';
import { FastForward, Sparkles } from 'lucide-react';

interface NewGameCinematicProps {
  onComplete: () => void;
}

export const NewGameCinematic: React.FC<NewGameCinematicProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const NARRATIVES = [
    'In an age when the Celestial Resonator maintained the eternal harmony of heaven and earth...',
    'A cataclysmic shockwave severed the Sky Core into resonant shards, casting darkness over forgotten temples...',
    'Plummeting from the upper heavens through the celestial tempest, a young knight descends into Skyfall Village...',
    'Aeron, awaken... Your blade shall piece together the shattered sky!'
  ];

  // Narration typewriter effect
  useEffect(() => {
    const currentText = NARRATIVES[phase] || '';
    setTypedText('');
    let charIndex = 0;

    const timer = setInterval(() => {
      charIndex++;
      setTypedText(currentText.substring(0, charIndex));
      if (charIndex % 3 === 0) {
        sound.playButtonClick();
      }
      if (charIndex >= currentText.length) {
        clearInterval(timer);
      }
    }, 32);

    return () => clearInterval(timer);
  }, [phase]);

  // Phase advancement timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase < NARRATIVES.length - 1) {
        setPhase((prev) => prev + 1);
        sound.playLevelUp();
      } else {
        // Complete cinematic
        onComplete();
      }
    }, 5500);

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // Keyboard shortcut [SPACE] or [ENTER] to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        sound.playButtonClick();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  // Canvas visual effects for the falling knight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let progress = 0;
    const windStreaks: { x: number; y: number; length: number; speed: number; alpha: number }[] = [];
    for (let i = 0; i < 40; i++) {
      windStreaks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 80 + 30,
        speed: Math.random() * 12 + 10,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      progress += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Deep sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0c1938');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Wind streaks rushing upward as Aeron falls
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      for (const streak of windStreaks) {
        streak.y -= streak.speed;
        if (streak.y < -100) {
          streak.y = height + 50;
          streak.x = Math.random() * width;
        }
        ctx.globalAlpha = streak.alpha;
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x, streak.y - streak.length);
        ctx.stroke();
      }

      // Falling celestial streak (Aeron)
      const centerX = width * 0.5;
      const fallY = (height * 0.1) + Math.min(height * 0.65, (progress * 110) % (height * 0.8));

      // Golden meteor glow
      const meteorGlow = ctx.createRadialGradient(centerX, fallY, 10, centerX, fallY, 90);
      meteorGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      meteorGlow.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)');
      meteorGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = meteorGlow;
      ctx.beginPath();
      ctx.arc(centerX, fallY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Shockwave ring
      const ringRadius = (progress * 80) % 70;
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - ringRadius / 70})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, fallY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Falling Aeron silhouette with cape
      ctx.save();
      ctx.translate(centerX, fallY);
      ctx.fillStyle = '#1d4ed8'; // Cape
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(8, -12);
      ctx.lineTo(12 + Math.sin(progress * 20) * 8, -40);
      ctx.lineTo(-12 + Math.sin(progress * 20) * 8, -40);
      ctx.closePath();
      ctx.fill();

      // Armor body
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-6, -8, 12, 16);
      // Sword
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(8, -16, 3, 24);
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between select-none font-pixel overflow-hidden bg-black animate-in fade-in duration-300">
      {/* BACKGROUND CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* TOP CINEMATIC LETTERBOX BAR */}
      <div className="z-10 w-full h-16 sm:h-20 bg-black flex items-center justify-between px-6 border-b border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-400 text-xs tracking-widest uppercase">
          <Sparkles size={14} className="animate-spin text-amber-300" />
          <span>PROLOGUE: THE CELESTIAL SKYFALL</span>
        </div>
        <div className="text-[10px] text-slate-500">PHASE {phase + 1} / 4</div>
      </div>

      {/* CENTER NARRATIVE SUBTITLES */}
      <div className="z-10 max-w-2xl mx-auto px-6 py-8 text-center bg-slate-950/80 backdrop-blur-md rounded-xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <p className="text-base sm:text-xl text-amber-200 font-bold leading-relaxed tracking-wide drop-shadow min-h-[4rem] flex items-center justify-center">
          {typedText}
          <span className="inline-block w-2 h-5 ml-1 bg-amber-400 animate-pulse" />
        </p>
      </div>

      {/* BOTTOM CINEMATIC LETTERBOX BAR */}
      <div className="z-10 w-full h-16 sm:h-20 bg-black flex items-center justify-between px-6 border-t border-amber-500/20">
        <div className="text-xs text-slate-400 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline">Aeron is descending to the mortal realm...</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] text-amber-300/90 font-bold">Created by Duo Lier (GR)</span>
        </div>

        {/* SKIP BUTTON */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onComplete();
          }}
          className="px-4 py-2 rounded bg-amber-600/30 hover:bg-amber-500 text-amber-200 hover:text-slate-950 border border-amber-400/60 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <FastForward size={14} />
          <span>[SPACE] SKIP CINEMATIC</span>
        </button>
      </div>
    </div>
  );
};
