import React, { useState, useEffect } from 'react';
import { PlayerStats, EquipmentState, GameSettings, SaveGameData } from '../types';
import { sound } from '../services/audio';
import { storageService } from '../services/storage';
import {
  Play,
  RotateCcw,
  User,
  Settings,
  Keyboard,
  LogOut,
  Sparkles,
  Shield,
  Clock,
  Coins,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';

import { MenuBackgroundCanvas, AtmosphereType } from './mainmenu/MenuBackgroundCanvas';
import { NewGameCinematic } from './mainmenu/NewGameCinematic';
import { LoadingScreen } from './mainmenu/LoadingScreen';
import { InteractiveControlsModal } from './mainmenu/InteractiveControlsModal';
import { MenuProfileModal } from './mainmenu/MenuProfileModal';
import { MenuSettingsModal } from './mainmenu/MenuSettingsModal';

interface MainMenuProps {
  hasSaveFile: boolean;
  saveData?: SaveGameData | null;
  stats: PlayerStats;
  equipment: EquipmentState;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onNewGame: () => void;
  onContinue: () => void;
  onUpdateName?: (name: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSaveFile,
  saveData,
  stats,
  equipment,
  settings,
  onUpdateSettings,
  onNewGame,
  onContinue,
  onUpdateName,
}) => {
  // Screen views
  const [activeScreen, setActiveScreen] = useState<
    'main' | 'cinematic' | 'loading' | 'profile' | 'settings' | 'controls' | 'exit_confirm'
  >('main');

  const [loadingDest, setLoadingDest] = useState('Skyfall Village');
  const [loadingMode, setLoadingMode] = useState<'new_game' | 'continue'>('new_game');

  // Atmosphere State
  const [atmosphere, setAtmosphere] = useState<AtmosphereType>(() => {
    return (settings.atmosphere as AtmosphereType) || 'day';
  });

  // Menu item selection (for keyboard navigation)
  const [selectedIndex, setSelectedIndex] = useState(hasSaveFile ? 1 : 0);

  const MENU_ITEMS = [
    { id: 'new_game', label: 'NEW GAME', icon: Play, desc: 'Start a new adventure from Chapter 1' },
    {
      id: 'continue',
      label: 'CONTINUE',
      icon: RotateCcw,
      desc: hasSaveFile ? 'Resume your saved journey' : 'No saved data found',
      disabled: !hasSaveFile,
    },
    { id: 'profile', label: 'PROFILE', icon: User, desc: 'View Aeron attributes & equipment' },
    { id: 'settings', label: 'SETTINGS', icon: Settings, desc: 'Adjust audio, graphics & controls' },
    { id: 'controls', label: 'CONTROLS', icon: Keyboard, desc: 'View laptop keyboard guide & tester' },
    { id: 'exit', label: 'EXIT GAME', icon: LogOut, desc: 'Return or clear session' },
  ];

  // Keyboard Navigation (W/S, Arrow Keys, Enter, Space)
  useEffect(() => {
    if (activeScreen !== 'main') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        sound.playButtonClick();
        setSelectedIndex((prev) => (prev + 1) % MENU_ITEMS.length);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        sound.playButtonClick();
        setSelectedIndex((prev) => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        triggerMenuAction(MENU_ITEMS[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, selectedIndex, hasSaveFile]);

  // Execute menu action
  const triggerMenuAction = (id: string) => {
    sound.playButtonClick();
    if (id === 'new_game') {
      setActiveScreen('cinematic');
    } else if (id === 'continue') {
      if (!hasSaveFile) return;
      setLoadingMode('continue');
      setLoadingDest(saveData?.currentArea ? formatAreaName(saveData.currentArea) : 'Whispering Realm');
      setActiveScreen('loading');
    } else if (id === 'profile') {
      setActiveScreen('profile');
    } else if (id === 'settings') {
      setActiveScreen('settings');
    } else if (id === 'controls') {
      setActiveScreen('controls');
    } else if (id === 'exit') {
      setActiveScreen('exit_confirm');
    }
  };

  const formatAreaName = (areaId: string) => {
    return areaId
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Format playtime for save data
  const formatTime = (seconds?: number) => {
    const total = Math.floor(seconds || 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between select-none font-pixel overflow-hidden">
      {/* 1. LIVING PIXEL CANVAS BACKGROUND */}
      <MenuBackgroundCanvas atmosphere={atmosphere} />

      {/* 2. TOP STATUS BAR / ATMOSPHERE TOGGLE */}
      <div className="z-10 w-full px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 text-[11px] text-amber-400 tracking-wider">
          <Sparkles size={14} className="animate-spin text-amber-300" />
          <span className="drop-shadow">ACTION RPG • CHAPTER 1: THE SKYFALL AWAKENING</span>
        </div>

        {/* ATMOSPHERE CONTROLS (DAY / SUNSET / NIGHT) */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-sm border border-slate-700/80 p-1 rounded-lg">
          <button
            onClick={() => {
              sound.playButtonClick();
              setAtmosphere('day');
            }}
            className={`p-1.5 rounded transition-all ${
              atmosphere === 'day'
                ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Day Atmosphere"
          >
            <Sun size={14} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              setAtmosphere('sunset');
            }}
            className={`p-1.5 rounded transition-all ${
              atmosphere === 'sunset'
                ? 'bg-amber-600 text-white shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Sunset Atmosphere"
          >
            <Sunset size={14} />
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              setAtmosphere('night');
            }}
            className={`p-1.5 rounded transition-all ${
              atmosphere === 'night'
                ? 'bg-indigo-600 text-white shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Night Atmosphere"
          >
            <Moon size={14} />
          </button>
        </div>
      </div>

      {/* 3. MAIN TITLE & MENU NAVIGATION (LEFT ALIGNED TO SHOWCASE AERON ON RIGHT) */}
      <div className="z-10 px-8 sm:px-14 my-auto max-w-xl flex flex-col gap-5 pointer-events-auto animate-in fade-in duration-500">
        {/* GAME TITLE WITH SHIMMER & GLOW */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-widest drop-shadow">
            <span>⚔️</span>
            <span>HEROIC CHRONICLES</span>
          </div>

          <h1 className="relative text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)]">
            TALES OF THE SKYFALL
            {/* Shimmer Light Sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />
          </h1>

          <p className="text-xs sm:text-sm text-sky-200 font-mono tracking-widest uppercase drop-shadow flex items-center gap-2">
            <span>A JOURNEY BEYOND THE SKY</span>
            <span className="w-8 h-0.5 bg-sky-400/80 rounded" />
          </p>

          {/* CREATOR BADGE */}
          <div className="flex items-center gap-2 mt-1">
            <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 border-2 border-amber-400/80 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-[0_0_18px_rgba(245,158,11,0.35)]">
              <span className="text-sm">👑</span>
              <span className="text-slate-200 font-medium">Created by:</span>
              <span className="text-amber-200 uppercase font-mono tracking-widest font-black text-sm drop-shadow">Duo Lier (GR)</span>
            </div>
          </div>
        </div>

        {/* MENU BUTTON LIST */}
        <div className="flex flex-col gap-2.5 w-72 sm:w-80">
          {MENU_ITEMS.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative flex flex-col">
                <button
                  disabled={item.disabled}
                  onMouseEnter={() => {
                    sound.playButtonClick();
                    setSelectedIndex(idx);
                  }}
                  onClick={() => triggerMenuAction(item.id)}
                  className={`group relative w-full py-2.5 px-4 rounded-md border-2 font-bold text-xs flex items-center justify-between transition-all duration-150 ${
                    item.disabled
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-300 text-white translate-x-2 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                      : 'bg-slate-950/80 hover:bg-slate-900 border-slate-700 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Active Pointer Sword */}
                    {isSelected && <span className="text-amber-300 animate-pulse text-sm">⚔️</span>}
                    <Icon size={15} className={isSelected ? 'text-white' : 'text-amber-400'} />
                    <span className="tracking-wider">{item.label}</span>
                  </div>

                  {item.id === 'continue' && !hasSaveFile && (
                    <span className="text-[9px] text-slate-500 uppercase font-mono">[NO SAVE]</span>
                  )}
                </button>

                {/* CONTINUE SAVE PREVIEW CARD */}
                {item.id === 'continue' && hasSaveFile && isSelected && (
                  <div className="mt-1 ml-4 p-2 bg-slate-950/90 border border-emerald-500/50 rounded text-[10px] text-slate-300 flex flex-col gap-1 shadow-lg animate-in fade-in duration-150">
                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                      <span>{saveData?.playerStats?.name || 'Aeron'} • LV.{saveData?.playerStats?.level || 1}</span>
                      <span className="text-[9px] text-slate-400">{formatAreaName(saveData?.currentArea || 'skyfall_village')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[9px]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-sky-400" />
                        {formatTime(saveData?.playerStats?.playTimeSeconds)}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Coins size={11} className="text-amber-400" />
                        {saveData?.playerStats?.gold || 0} G
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* QUICK KEYBOARD NAV GUIDE */}
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">W/S / ↑↓</span>
          <span>NAVIGATE</span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">ENTER</span>
          <span>SELECT</span>
        </div>
      </div>

      {/* 4. FOOTER */}
      <div className="z-20 w-full px-6 py-3 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-slate-400 pointer-events-auto gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-amber-400" />
          <span className="font-semibold text-slate-300 hidden sm:inline">TALES OF THE SKYFALL • 2D ACTION RPG</span>
        </div>

        {/* Center Credit */}
        <div id="mainmenu-creator-credit" className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-2 border-amber-400 rounded-full text-amber-300 font-bold text-xs tracking-wider shadow-[0_0_16px_rgba(245,158,11,0.45)]">
          <span className="text-sm">✨</span>
          <span className="text-slate-200">Created by:</span>
          <span className="text-amber-200 uppercase font-mono tracking-widest font-black text-sm">Duo Lier (GR)</span>
        </div>

        <div className="text-slate-400 font-mono text-[10px]">PRESS [H] FOR KEYBOARD GUIDE • TARGET 60 FPS</div>
      </div>

      {/* 5. MODALS & TRANSITIONS */}

      {/* NEW GAME CINEMATIC */}
      {activeScreen === 'cinematic' && (
        <NewGameCinematic
          onComplete={() => {
            setLoadingMode('new_game');
            setLoadingDest('Skyfall Village');
            setActiveScreen('loading');
          }}
        />
      )}

      {/* LOADING SCREEN */}
      {activeScreen === 'loading' && (
        <LoadingScreen
          destinationText={`Entering ${loadingDest}...`}
          onLoaded={() => {
            if (loadingMode === 'new_game') {
              storageService.clearSave();
              onNewGame();
            } else {
              onContinue();
            }
          }}
        />
      )}

      {/* PROFILE MODAL */}
      {activeScreen === 'profile' && (
        <MenuProfileModal
          stats={saveData?.playerStats || stats}
          equipment={saveData?.equipment || equipment}
          onClose={() => setActiveScreen('main')}
          onUpdateName={onUpdateName}
        />
      )}

      {/* SETTINGS MODAL */}
      {activeScreen === 'settings' && (
        <MenuSettingsModal
          settings={settings}
          atmosphere={atmosphere}
          onUpdateSettings={onUpdateSettings}
          onUpdateAtmosphere={setAtmosphere}
          onClose={() => setActiveScreen('main')}
        />
      )}

      {/* CONTROLS MODAL */}
      {activeScreen === 'controls' && (
        <InteractiveControlsModal onClose={() => setActiveScreen('main')} />
      )}

      {/* EXIT CONFIRMATION MODAL */}
      {activeScreen === 'exit_confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-950 border-2 border-amber-500 rounded-xl p-5 flex flex-col gap-3 shadow-2xl text-center">
            <h3 className="text-sm font-bold text-amber-300">EXIT TALES OF THE SKYFALL?</h3>
            <p className="text-xs text-slate-300">
              Your adventure progress is preserved in your active browser save.
            </p>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={() => {
                  sound.playButtonClick();
                  setActiveScreen('main');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded"
              >
                RETURN TO MENU
              </button>
              {hasSaveFile && (
                <button
                  onClick={() => {
                    sound.playButtonClick();
                    storageService.clearSave();
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-rose-200 text-xs font-bold rounded border border-rose-700"
                >
                  RESET SAVE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
