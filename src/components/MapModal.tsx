import React from 'react';
import { X, Compass, MapPin, Sparkles, Shield, ChevronRight, Lock } from 'lucide-react';
import { AreaId } from '../types';
import { sound } from '../services/audio';

interface AreaInfo {
  id: AreaId;
  name: string;
  level: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme' | 'Final';
  description: string;
  themeColor: string;
  icon: string;
  coords: { x: number; y: number }; // Percentage for map layout
}

const ALL_AREAS: AreaInfo[] = [
  {
    id: 'skyfall_village',
    name: 'Skyfall Village',
    level: 'Lv. 1-5',
    difficulty: 'Easy',
    description: 'A peaceful haven at the foot of the skyfall crater. Home to Elder Matthew, Blacksmith Brand, and shopkeeper Lily.',
    themeColor: '#10b981',
    icon: '🏡',
    coords: { x: 14, y: 72 },
  },
  {
    id: 'whispering_forest',
    name: 'Whispering Forest',
    level: 'Lv. 5-10',
    difficulty: 'Easy',
    description: 'Ancient woodlands corrupted by wild aether. Home to forest goblins, shadow wolves, and the Briar Treant.',
    themeColor: '#22c55e',
    icon: '🌲',
    coords: { x: 26, y: 64 },
  },
  {
    id: 'ancient_sanctum',
    name: 'Ancient Sanctum',
    level: 'Lv. 10-15',
    difficulty: 'Medium',
    description: 'Subterranean temple housing the celestial Sky Core. Guarded by stone sentinels and the colossus Talos.',
    themeColor: '#0ea5e9',
    icon: '🏛️',
    coords: { x: 38, y: 55 },
  },
  {
    id: 'frozen_kingdom',
    name: 'Frozen Kingdom',
    level: 'Lv. 15-20',
    difficulty: 'Medium',
    description: 'Glacial tundra plagued by eternal blizzards. Ruled by Frost Queen Aurelia from atop Frostspire Peak.',
    themeColor: '#38bdf8',
    icon: '❄️',
    coords: { x: 50, y: 44 },
  },
  {
    id: 'volcanic_wasteland',
    name: 'Volcanic Wasteland',
    level: 'Lv. 20-25',
    difficulty: 'Hard',
    description: 'Scorched earth crossed with rivers of molten lava. Caldera of Ignis the Magma Colossus.',
    themeColor: '#ef4444',
    icon: '🌋',
    coords: { x: 62, y: 52 },
  },
  {
    id: 'sunken_city',
    name: 'Sunken City',
    level: 'Lv. 25-30',
    difficulty: 'Hard',
    description: 'Submerged ruins of ancient Thalassa. Bioluminescent deep-sea horrors guard oceanic treasures.',
    themeColor: '#06b6d4',
    icon: '🌊',
    coords: { x: 74, y: 62 },
  },
  {
    id: 'dark_swamp',
    name: 'The Dark Swamp',
    level: 'Lv. 30-35',
    difficulty: 'Very Hard',
    description: 'Miasmic bogs overflowing with toxic spores and mire horrors. Lair of the ancient Swamp Witch.',
    themeColor: '#84cc16',
    icon: '🍄',
    coords: { x: 68, y: 35 },
  },
  {
    id: 'sky_islands',
    name: 'Sky Islands',
    level: 'Lv. 35-40',
    difficulty: 'Very Hard',
    description: 'Floating stratospheric isles suspended above the clouds. Domain of winged harpies and the Storm Guardian.',
    themeColor: '#a855f7',
    icon: '☁️',
    coords: { x: 52, y: 24 },
  },
  {
    id: 'shadow_castle',
    name: 'Shadow Castle',
    level: 'Lv. 40-50',
    difficulty: 'Extreme',
    description: 'Gothic citadel of pure void matter. Throne room of Malakor, Lord of Shadows.',
    themeColor: '#9333ea',
    icon: '🏰',
    coords: { x: 34, y: 22 },
  },
  {
    id: 'celestial_fortress',
    name: 'Celestial Fortress',
    level: 'Lv. 50+',
    difficulty: 'Final',
    description: 'The shattered apex of the cosmos where the Sky Core originated. Final battlefield against THE SKYFALL.',
    themeColor: '#f59e0b',
    icon: '⭐',
    coords: { x: 20, y: 15 },
  },
];

const AREA_UNLOCK_HINTS: Partial<Record<AreaId, string>> = {
  skyfall_village: 'Starting Realm • Unlocked',
  whispering_forest: 'Open from Skyfall Village East Portal',
  ancient_sanctum: 'Defeat Ancient Briar Treant in Whispering Forest',
  frozen_kingdom: 'Defeat Sky Guardian Talos in Ancient Sanctum',
  volcanic_wasteland: 'Defeat Frost Queen Aurelia in The Frozen Kingdom',
  sunken_city: 'Defeat Magma Colossus Ignis in Volcanic Wasteland',
  dark_swamp: 'Defeat Abyssal Guardian Leviathan in Sunken City',
  sky_islands: 'Defeat Swamp Witch Morwenna in The Dark Swamp',
  shadow_castle: 'Defeat Storm Guardian Zephyrus in Sky Islands',
  celestial_fortress: 'Defeat Lord of Shadows Malakor in Shadow Castle',
};

interface MapModalProps {
  currentAreaId: AreaId;
  unlockedAreas?: AreaId[];
  onFastTravel: (areaId: AreaId) => void;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  currentAreaId,
  unlockedAreas,
  onFastTravel,
  onClose,
}) => {
  const [selectedArea, setSelectedArea] = React.useState<AreaInfo>(
    ALL_AREAS.find((a) => a.id === currentAreaId) || ALL_AREAS[0]
  );

  // Default unlocked: village is always unlocked; others must be reached/unlocked
  const isUnlocked = (areaId: AreaId) => {
    if (areaId === 'skyfall_village') {
      return true;
    }
    if (!unlockedAreas || unlockedAreas.length === 0) {
      return false;
    }
    return unlockedAreas.includes(areaId);
  };

  const handleTeleport = (area: AreaInfo) => {
    sound.playLevelUp();
    onFastTravel(area.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-pixel select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/60 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Compass className="text-amber-400 animate-spin" size={22} />
            <h2 className="text-xl font-bold tracking-wider text-amber-300">
              REALM MAP • THE 10 FLOATING SANCTUMS
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT SPLIT: WORLD MAP CANVAS (LEFT) + REGION DETAILS (RIGHT) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 min-h-0">
          {/* MAP CANVAS VIEW */}
          <div className="md:col-span-2 relative bg-slate-950/80 p-4 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            {/* STYLIZED CARTOGRAPHIC GRID & STARS */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
            
            {/* CONNECTING SKY PATHWAYS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/60 stroke-[2] stroke-dasharray-[4_4]">
              {ALL_AREAS.slice(0, -1).map((area, idx) => {
                const next = ALL_AREAS[idx + 1];
                return (
                  <line
                    key={area.id}
                    x1={`${area.coords.x}%`}
                    y1={`${area.coords.y}%`}
                    x2={`${next.coords.x}%`}
                    y2={`${next.coords.y}%`}
                  />
                );
              })}
            </svg>

            {/* AREA NODES */}
            <div className="relative w-full h-[360px] sm:h-[420px]">
              {ALL_AREAS.map((area) => {
                const isCurrent = area.id === currentAreaId;
                const isSelected = area.id === selectedArea.id;
                const unlocked = isUnlocked(area.id);

                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      sound.playButtonClick();
                      setSelectedArea(area);
                    }}
                    style={{ left: `${area.coords.x}%`, top: `${area.coords.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center z-10 transition-transform ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                    }`}
                  >
                    {/* Node Icon Box */}
                    <div
                      style={{ borderColor: area.themeColor }}
                      className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-lg border-2 shadow-lg transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 ring-4 ring-amber-400/50 animate-pulse'
                          : isSelected
                          ? 'bg-slate-800 ring-2 ring-white/50'
                          : 'bg-slate-900/90'
                      }`}
                    >
                      <span>{area.icon}</span>
                      {isCurrent && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow">
                          <MapPin size={10} className="text-slate-950 fill-current" />
                        </div>
                      )}
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                          <Lock size={14} className="text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Area Name Label */}
                    <span
                      className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-md ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : isCurrent
                          ? 'bg-amber-900/90 text-amber-200 border border-amber-500/40'
                          : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {area.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REGION DETAILS PANEL (RIGHT) */}
          <div className="p-6 bg-slate-900/95 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-lg bg-slate-800 border border-slate-700">
                  {selectedArea.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedArea.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      {selectedArea.level}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {selectedArea.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {selectedArea.id === currentAreaId && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                  <MapPin size={14} />
                  <span>YOU ARE CURRENTLY HERE</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-slate-300 font-sans leading-relaxed">
                <p>{selectedArea.description}</p>
              </div>

              {/* LOCKED STATUS OR CHECKPOINT INFO */}
              {!isUnlocked(selectedArea.id) ? (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider">
                    <Lock size={14} />
                    <span>REALM SEALED</span>
                  </div>
                  <div className="text-slate-300 bg-rose-950/40 p-2.5 rounded border border-rose-800/50 leading-relaxed">
                    <span className="font-bold text-rose-300">Unlock Condition:</span>{' '}
                    {AREA_UNLOCK_HINTS[selectedArea.id] || 'Defeat the previous area boss.'}
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Checkpoint Crystal:
                  </div>
                  <div className="flex items-center gap-2 text-sky-300 bg-sky-950/30 p-2 rounded border border-sky-800/40">
                    <Sparkles size={14} className="text-sky-400" />
                    <span>Restores Full HP & Energy when touched</span>
                  </div>
                </div>
              )}
            </div>

            {/* FAST TRAVEL BUTTON */}
            <div className="pt-6 border-t border-slate-800">
              {selectedArea.id === currentAreaId ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                >
                  Current Location
                </button>
              ) : !isUnlocked(selectedArea.id) ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-lg bg-slate-800/90 text-rose-400 border border-rose-800/50 text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 shadow"
                >
                  <Lock size={14} className="text-rose-400" />
                  <span>REALM LOCKED • DEFEAT PREVIOUS BOSS</span>
                </button>
              ) : (
                <button
                  onClick={() => handleTeleport(selectedArea)}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] text-white text-xs font-bold tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all border border-amber-400/50"
                >
                  <Sparkles size={14} />
                  <span>WARP TO REALM</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER SHORTCUT HINT */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              M
            </span>
            <span>Toggle Map</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              ESC
            </span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
