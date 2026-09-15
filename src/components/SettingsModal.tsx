import React from 'react';
import { GameSettings } from '../types';
import { X, Volume2, Monitor, Keyboard, RotateCcw, Save, Download } from 'lucide-react';
import { sound } from '../services/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onSaveGame,
  onLoadGame,
  onResetSave,
  onClose,
}) => {
  const handleMusicChange = (val: number) => {
    sound.setMusicVolume(val);
    onUpdateSettings({ ...settings, musicVolume: val });
  };

  const handleSfxChange = (val: number) => {
    sound.setSfxVolume(val);
    onUpdateSettings({ ...settings, sfxVolume: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs font-pixel select-none animate-fade-in">
      <div className="w-full max-w-lg bg-slate-950 border-3 border-slate-700 rounded-lg shadow-2xl p-4 sm:p-6 flex flex-col gap-4 pixel-box max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-sm sm:text-base font-bold text-amber-400">GAME SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-600 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* AUDIO SETTINGS */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Volume2 size={14} className="text-amber-400" />
            AUDIO & SOUND
          </h3>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>BGM Music Volume:</span>
              <span className="font-bold">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>SFX Effects Volume:</span>
              <span className="font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>
        </div>

        {/* GAMEPLAY & DISPLAY */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Monitor size={14} className="text-sky-400" />
            GAMEPLAY & ACCESSIBILITY
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Combat Screen Shake:</span>
            <button
              onClick={() => {
                sound.playButtonClick();
                onUpdateSettings({ ...settings, screenShake: !settings.screenShake });
              }}
              className={`px-3 py-1 rounded text-[10px] font-bold ${
                settings.screenShake ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.screenShake ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Dialogue Text Speed:</span>
            <div className="flex gap-1">
              {(['slow', 'normal', 'fast'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    sound.playButtonClick();
                    onUpdateSettings({ ...settings, textSpeed: spd });
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    settings.textSpeed === spd
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Virtual Joystick (Touch):</span>
            <button
              onClick={() => {
                sound.playButtonClick();
                onUpdateSettings({ ...settings, touchControls: !settings.touchControls });
              }}
              className={`px-3 py-1 rounded text-[10px] font-bold ${
                settings.touchControls ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.touchControls ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>FPS Display:</span>
            <button
              onClick={() => {
                sound.playButtonClick();
                onUpdateSettings({ ...settings, showFps: !settings.showFps });
              }}
              className={`px-3 py-1 rounded text-[10px] font-bold ${
                settings.showFps ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.showFps ? 'SHOW' : 'HIDE'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Laptop Keyboard Guide (Bottom Bar):</span>
            <button
              onClick={() => {
                sound.playButtonClick();
                onUpdateSettings({
                  ...settings,
                  showKeyboardGuide: settings.showKeyboardGuide !== false ? false : true,
                });
              }}
              className={`px-3 py-1 rounded text-[10px] font-bold ${
                settings.showKeyboardGuide !== false
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.showKeyboardGuide !== false ? 'SHOWN' : 'HIDDEN'}
            </button>
          </div>
        </div>

        {/* KEYBOARD CONTROLS REFERENCE */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <Keyboard size={14} className="text-emerald-400" />
            KEYBOARD SHORTCUTS
          </h3>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
            <div><span className="text-amber-400 font-bold">[W][A][S][D]:</span> Move Character</div>
            <div><span className="text-red-400 font-bold">[J] / Space:</span> Attack Combo</div>
            <div><span className="text-sky-400 font-bold">[K]:</span> Skyward Cyclone Skill</div>
            <div><span className="text-indigo-400 font-bold">[L] / Shift:</span> Dodge Roll</div>
            <div><span className="text-emerald-400 font-bold">[E] / F:</span> Contextual Interact</div>
            <div><span className="text-amber-400 font-bold">[U]:</span> Heavenly Judgment Ultimate</div>
            <div><span className="text-slate-300 font-bold">[I]:</span> Open Inventory</div>
            <div><span className="text-slate-300 font-bold">[Q]:</span> Quest Log</div>
            <div><span className="text-slate-300 font-bold">[M]:</span> Realm World Map</div>
            <div><span className="text-slate-300 font-bold">[ESC]:</span> Pause / Menu</div>
          </div>
        </div>

        {/* SAVE & LOAD BUTTONS */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => onSaveGame()}
            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Save size={14} />
            <span>SAVE PROGRESS</span>
          </button>
          <button
            onClick={() => onLoadGame()}
            className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Download size={14} />
            <span>LOAD SAVE</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset current save game file? All progress will restart.')) {
                onResetSave();
              }
            }}
            className="px-3 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <RotateCcw size={14} />
            <span>RESET SAVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
