import React, { useState, useEffect } from 'react';
import { GameSettings } from '../../types';
import { sound } from '../../services/audio';
import { storageService } from '../../services/storage';
import { X, Volume2, Sparkles, Monitor, RotateCcw, Check, Sun, Moon, Sunset } from 'lucide-react';
import { AtmosphereType } from './MenuBackgroundCanvas';

interface MenuSettingsModalProps {
  settings: GameSettings;
  atmosphere: AtmosphereType;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onUpdateAtmosphere: (atm: AtmosphereType) => void;
  onClose: () => void;
}

export const MenuSettingsModal: React.FC<MenuSettingsModalProps> = ({
  settings,
  atmosphere,
  onUpdateSettings,
  onUpdateAtmosphere,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        sound.playButtonClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const handleMasterChange = (val: number) => {
    sound.setMasterVolume(val);
    const updated = { ...settings, masterVolume: val };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
    triggerSaveNotice();
  };

  const handleMusicChange = (val: number) => {
    sound.setMusicVolume(val);
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
    triggerSaveNotice();
  };

  const handleSfxChange = (val: number) => {
    sound.setSfxVolume(val);
    sound.playButtonClick();
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
    triggerSaveNotice();
  };

  const toggleScreenShake = () => {
    sound.playButtonClick();
    const updated = { ...settings, screenShake: !settings.screenShake };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
    triggerSaveNotice();
  };

  const toggleKeyboardGuide = () => {
    sound.playButtonClick();
    const updated = { ...settings, showKeyboardGuide: !settings.showKeyboardGuide };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
    triggerSaveNotice();
  };

  const setParticleQuality = (quality: 'low' | 'medium' | 'high') => {
    sound.playButtonClick();
    const updated = { ...settings, particleQuality: quality };
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
    triggerSaveNotice();
  };

  const toggleFullscreen = () => {
    sound.playButtonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetSettings = () => {
    sound.playButtonClick();
    const defaultSettings: GameSettings = {
      masterVolume: 1.0,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      screenShake: true,
      textSpeed: 'normal',
      showFps: false,
      touchControls: true,
      showKeyboardGuide: true,
      particleQuality: 'high',
      graphicsQuality: 'high',
      atmosphere: 'day',
    };
    sound.setMasterVolume(1.0);
    sound.setMusicVolume(0.5);
    sound.setSfxVolume(0.8);
    onUpdateSettings(defaultSettings);
    onUpdateAtmosphere('day');
    storageService.saveSettings(defaultSettings);
    triggerSaveNotice();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-pixel select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-950 border-2 border-amber-500 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-4 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              ⚙️
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wider">
                GAME SETTINGS & PREFERENCES
              </h2>
              <span className="text-[10px] text-slate-400">
                Adjust audio, graphics, controls, and performance options
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

        {/* AUDIO SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Volume2 size={15} />
            <span>AUDIO LEVELS & CHIPTUNE MIXER</span>
          </div>

          {/* Master Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Master Volume</span>
              <span className="text-amber-300 font-mono">
                {Math.round((settings.masterVolume ?? 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume ?? 1.0}
              onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-700"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>BGM & Music</span>
              <span className="text-amber-300 font-mono">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-700"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Sound Effects (SFX)</span>
              <span className="text-amber-300 font-mono">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-700"
            />
          </div>
        </div>

        {/* ATMOSPHERE & GRAPHICS SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles size={15} />
            <span>VISUAL ATMOSPHERE & GRAPHICS</span>
          </div>

          {/* Time of day atmosphere */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-300">World Horizon Atmosphere</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  sound.playButtonClick();
                  onUpdateAtmosphere('day');
                }}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  atmosphere === 'day'
                    ? 'bg-sky-600 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun size={13} className="text-amber-300" />
                <span>DAY</span>
              </button>

              <button
                onClick={() => {
                  sound.playButtonClick();
                  onUpdateAtmosphere('sunset');
                }}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  atmosphere === 'sunset'
                    ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sunset size={13} className="text-orange-300" />
                <span>SUNSET</span>
              </button>

              <button
                onClick={() => {
                  sound.playButtonClick();
                  onUpdateAtmosphere('night');
                }}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  atmosphere === 'night'
                    ? 'bg-indigo-700 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon size={13} className="text-sky-200" />
                <span>NIGHT</span>
              </button>
            </div>
          </div>

          {/* Particle Quality */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300">Particle Quality</span>
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setParticleQuality(q)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${
                    (settings.particleQuality || 'high') === q
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Shake Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div>
              <div className="text-xs text-slate-300">Combat Screen Shake</div>
              <div className="text-[10px] text-slate-500 font-sans">
                Camera shakes on critical hits and ultimate strikes
              </div>
            </div>
            <button
              onClick={toggleScreenShake}
              className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors ${
                settings.screenShake
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {settings.screenShake ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Show Keyboard Guide */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div>
              <div className="text-xs text-slate-300">Show Keyboard Guide</div>
              <div className="text-[10px] text-slate-500 font-sans">
                Display compact key badges at the bottom of the screen
              </div>
            </div>
            <button
              onClick={toggleKeyboardGuide}
              className={`px-4 py-1.5 rounded text-xs font-bold border transition-colors ${
                settings.showKeyboardGuide !== false
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {settings.showKeyboardGuide !== false ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* FULLSCREEN & RESET CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded border border-slate-700 flex items-center gap-1.5"
            >
              <Monitor size={14} />
              <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN MODE'}</span>
            </button>

            <button
              onClick={handleResetSettings}
              className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-bold rounded border border-slate-700 flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>RESET DEFAULTS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {savedNotice && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> SAVED
              </span>
            )}
            <button
              onClick={() => {
                sound.playButtonClick();
                onClose();
              }}
              className="px-5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded shadow active:scale-95"
            >
              [ESC] BACK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
