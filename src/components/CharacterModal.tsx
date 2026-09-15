import React from 'react';
import { PlayerStats, EquipmentState } from '../types';
import { X, Shield, Swords, Heart, Zap, Sparkles, Crosshair, Trophy, Compass, Clock, Coins, Footprints } from 'lucide-react';
import { sound } from '../services/audio';

interface CharacterModalProps {
  stats: PlayerStats;
  equipment: EquipmentState;
  onClose: () => void;
  onUpdateName?: (name: string) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ stats, equipment, onClose, onUpdateName }) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(stats.name || 'Aeron');
  const expPercent = Math.max(0, Math.min(100, (stats.exp / stats.expToNext) * 100));

  // Format playtime
  const totalSec = Math.floor(stats.playTimeSeconds || 0);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const formattedPlayTime = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs font-pixel select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-950 border-2 border-amber-500 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] p-4 sm:p-5 flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wider">{(stats.name || 'Aeron').toUpperCase()} • ADVENTURER PROFILE</h2>
              <span className="text-[10px] text-slate-400">{stats.name || 'Aeron'} • Knight of Skyfall</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded border border-slate-700 active:scale-95 transition-colors"
            title="Close [ESC / P]"
          >
            <X size={16} />
          </button>
        </div>

        {/* HERO BANNER */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-3 rounded-md shadow-inner">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-slate-950 border-2 border-amber-400/80 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
            ⚔️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-slate-900 border border-amber-500 text-white px-2 py-0.5 rounded text-sm font-bold outline-none w-36"
                    autoFocus
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (nameInput.trim() && onUpdateName) {
                          onUpdateName(nameInput.trim());
                        }
                        setIsEditingName(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setNameInput(stats.name || 'Aeron');
                      }
                    }}
                    onBlur={() => {
                      if (nameInput.trim() && onUpdateName) {
                        onUpdateName(nameInput.trim());
                      }
                      setIsEditingName(false);
                    }}
                  />
                  <span className="text-[9px] text-amber-400">⏎</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)} title="Click to edit name">
                  <span className="text-base font-bold text-white tracking-wide hover:text-amber-300 transition-colors">{stats.name || 'Aeron'}</span>
                  <span className="text-[11px] text-amber-400 opacity-75 group-hover:opacity-100">✏️</span>
                </div>
              )}
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/80 text-amber-300">
                LEVEL {stats.level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>EXP: {stats.exp} / {stats.expToNext}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 flex items-center gap-1 font-mono">
                <Coins size={11} /> {stats.gold} Gold
              </span>
            </div>

            {/* EXP BAR */}
            <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ATTRIBUTES & PROGRESSION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* COMBAT ATTRIBUTES */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-md space-y-1.5 text-xs">
            <h3 className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Swords size={12} /> Combat Attributes
            </h3>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-red-400 flex items-center gap-1.5">
                <Heart size={13} /> HP (Health)
              </span>
              <span className="font-bold text-white font-mono">{Math.round(stats.hp)} / {stats.maxHp}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-sky-400 flex items-center gap-1.5">
                <Zap size={13} /> Mana / Energy
              </span>
              <span className="font-bold text-white font-mono">{Math.round(stats.energy)} / {stats.maxEnergy}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Swords size={13} /> Attack Power
              </span>
              <span className="font-bold text-white font-mono">{stats.baseAttack} ATK</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-blue-400 flex items-center gap-1.5">
                <Shield size={13} /> Defense Armor
              </span>
              <span className="font-bold text-white font-mono">{stats.baseDefense} DEF</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-yellow-400 flex items-center gap-1.5">
                <Crosshair size={13} /> Critical Rate
              </span>
              <span className="font-bold text-white font-mono">{(stats.critChance * 100).toFixed(0)}%</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Footprints size={13} /> Movement Speed
              </span>
              <span className="font-bold text-white font-mono">{stats.movementSpeed || 135} SPD</span>
            </div>
          </div>

          {/* ADVENTURE & PROGRESSION COUNTERS */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-md space-y-1.5 text-xs">
            <h3 className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Trophy size={12} /> Adventure Records
            </h3>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span>👾</span> Enemies Defeated
              </span>
              <span className="font-bold text-amber-300 font-mono">{stats.enemiesDefeated || 0}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span>👑</span> Bosses Defeated
              </span>
              <span className="font-bold text-rose-400 font-mono">{stats.bossesDefeatedCount || 0}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span>📜</span> Quests Completed
              </span>
              <span className="font-bold text-emerald-400 font-mono">{stats.questsCompletedCount || 0}</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Compass size={13} className="text-cyan-400" /> Realms Unlocked
              </span>
              <span className="font-bold text-cyan-300 font-mono">{stats.unlockedAreasCount || 1} / 10</span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Coins size={13} className="text-amber-400" /> Total Gold
              </span>
              <span className="font-bold text-amber-300 font-mono">{stats.gold} G</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-400" /> Play Time
              </span>
              <span className="font-bold text-indigo-300 font-mono text-[11px]">{formattedPlayTime}</span>
            </div>
          </div>
        </div>

        {/* ACTIVE EQUIPMENT CARDS WITH BONUS BREAKDOWNS */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-md space-y-2">
          <h3 className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>🛡️</span> Equipped Gear Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {/* WEAPON */}
            <div className="bg-slate-950 border border-slate-800 rounded p-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                  <span>WEAPON</span>
                  {equipment.weapon?.upgradeLevel ? (
                    <span className="text-amber-400 font-bold">Lv.{equipment.weapon.upgradeLevel}</span>
                  ) : null}
                </div>
                <div className="font-bold text-amber-300 truncate">
                  {equipment.weapon ? equipment.weapon.name : 'Unarmed'}
                </div>
              </div>
              <div className="mt-1 text-[10px] text-emerald-400 font-mono">
                {equipment.weapon?.stats?.attack ? `+${equipment.weapon.stats.attack + ((equipment.weapon.upgradeLevel || 0) * 4)} ATK` : '+0 ATK'}
              </div>
            </div>

            {/* ARMOR */}
            <div className="bg-slate-950 border border-slate-800 rounded p-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                  <span>ARMOR</span>
                  {equipment.armor?.upgradeLevel ? (
                    <span className="text-amber-400 font-bold">Lv.{equipment.armor.upgradeLevel}</span>
                  ) : null}
                </div>
                <div className="font-bold text-sky-300 truncate">
                  {equipment.armor ? equipment.armor.name : 'Cloth'}
                </div>
              </div>
              <div className="mt-1 text-[10px] text-emerald-400 font-mono">
                {equipment.armor?.stats?.defense ? `+${equipment.armor.stats.defense + ((equipment.armor.upgradeLevel || 0) * 3)} DEF ` : ''}
                {equipment.armor?.stats?.maxHp ? `+${equipment.armor.stats.maxHp} HP` : ''}
              </div>
            </div>

            {/* ACCESSORY */}
            <div className="bg-slate-950 border border-slate-800 rounded p-2 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 mb-0.5">ACCESSORY</div>
                <div className="font-bold text-purple-300 truncate">
                  {equipment.accessory ? equipment.accessory.name : 'None'}
                </div>
              </div>
              <div className="mt-1 text-[10px] text-emerald-400 font-mono">
                {equipment.accessory?.stats?.critChance ? `+${(equipment.accessory.stats.critChance * 100).toFixed(0)}% Crit ` : ''}
                {equipment.accessory?.stats?.speedBonus ? `+${equipment.accessory.stats.speedBonus} SPD` : ''}
                {!equipment.accessory && '+0 Stat Bonus'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

