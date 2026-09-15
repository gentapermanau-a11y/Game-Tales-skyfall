import React, { useState } from 'react';
import { AreaId, FishCatchRecord, FishRarity } from '../types';
import { ALL_FISH, FISHING_RODS } from '../game/fishingData';
import { AREA_NAMES } from '../game/engine';
import { BookOpen, X, Sparkles, Trophy, Fish, Award, Filter, MapPin } from 'lucide-react';
import { sound } from '../services/audio';

interface FishAlmanacModalProps {
  fishCollection: Record<string, FishCatchRecord>;
  onClose: () => void;
  totalFishCaught?: number;
}

export const FishAlmanacModal: React.FC<FishAlmanacModalProps> = ({
  fishCollection,
  onClose,
  totalFishCaught = 0,
}) => {
  const [selectedArea, setSelectedArea] = useState<AreaId | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<FishRarity | 'all'>('all');
  const [selectedFishId, setSelectedFishId] = useState<string>(ALL_FISH[0]?.id || '');

  // Filter species
  const filteredFish = ALL_FISH.filter((fish) => {
    if (selectedArea !== 'all' && fish.area !== selectedArea) return false;
    if (selectedRarity !== 'all' && fish.rarity !== selectedRarity) return false;
    return true;
  });

  const discoveredCount = Object.values(fishCollection).filter((c: FishCatchRecord) => c?.discovered).length;
  const totalCount = ALL_FISH.length;
  const completionPercentage = Math.round((discoveredCount / totalCount) * 100);

  const activeFish = ALL_FISH.find((f) => f.id === selectedFishId) || ALL_FISH[0];
  const activeRecord = activeFish ? fishCollection[activeFish.id] : null;

  const rarityColor: Record<FishRarity, string> = {
    common: 'text-slate-300 border-slate-600 bg-slate-800/40',
    uncommon: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    rare: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
    epic: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
    legendary: 'text-amber-400 border-amber-500/50 bg-amber-950/30',
  };

  return (
    <div
      id="fish-almanac-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Aetherian Angler Almanac
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-mono">
                  {discoveredCount} / {totalCount} ({completionPercentage}%)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Species catalog across all 10 fantasy realms, size records, and consumable culinary buffs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-slate-400">Total Caught:</span>
              <span className="font-bold text-amber-300 font-mono">{totalFishCaught}</span>
            </div>

            <button
              id="btn-close-almanac"
              onClick={() => {
                sound.playButtonClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center gap-3 text-xs">
          {/* Area filter */}
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-amber-400" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value as any)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Realms (10 Areas)</option>
              {Object.entries(AREA_NAMES).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-cyan-400" />
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as any)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Modal Body: Left Grid + Right Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Species List Grid (7 cols) */}
          <div className="md:col-span-7 p-4 overflow-y-auto max-h-[55vh] md:max-h-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredFish.map((fish) => {
                const record = fishCollection[fish.id];
                const isDiscovered = record?.discovered;
                const isSelected = selectedFishId === fish.id;

                return (
                  <button
                    key={fish.id}
                    onClick={() => {
                      sound.playButtonClick();
                      setSelectedFishId(fish.id);
                    }}
                    className={`relative p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg'
                        : isDiscovered
                        ? `${rarityColor[fish.rarity]} hover:border-slate-400`
                        : 'border-slate-800 bg-slate-950/40 text-slate-600 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl filter drop-shadow">
                        {isDiscovered ? fish.icon : '❓'}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          isDiscovered ? rarityColor[fish.rarity] : 'text-slate-600'
                        }`}
                      >
                        {isDiscovered ? fish.rarity : 'Unknown'}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={`text-xs font-bold truncate ${
                          isDiscovered ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {isDiscovered ? fish.name : '???'}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {AREA_NAMES[fish.area] || fish.area}
                      </p>
                    </div>

                    {isDiscovered && record && (
                      <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-700/50 pt-1 mt-0.5">
                        <span>Caught: {record.caughtCount}</span>
                        <span className="text-amber-300 font-bold">{record.biggestSize}cm</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Species Detailed Inspector (5 cols) */}
          <div className="md:col-span-5 p-6 bg-slate-950/40 overflow-y-auto flex flex-col gap-4">
            {activeFish ? (
              activeRecord?.discovered ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-400/40 flex items-center justify-center text-4xl shadow-lg">
                      {activeFish.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{activeFish.name}</h3>
                      </div>
                      <span
                        className={`inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded border mt-1 ${rarityColor[activeFish.rarity]}`}
                      >
                        {activeFish.rarity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    "{activeFish.description}"
                  </p>

                  {/* Habitat & Behavior */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Habitat:</span>
                      <span className="font-semibold text-slate-200">
                        {AREA_NAMES[activeFish.area] || activeFish.area}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Time:</span>
                      <span className="font-semibold text-slate-200 uppercase">
                        {activeFish.timeAvailability || 'All day'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Fight Difficulty:</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < (activeFish.difficulty || 1) ? 'bg-amber-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Personal Best Records */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy size={13} /> Personal Angling Records
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block">Max Length</span>
                        <span className="font-mono font-bold text-amber-300">
                          {activeRecord.biggestSize} cm
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block">Max Weight</span>
                        <span className="font-mono font-bold text-amber-300">
                          {activeRecord.heaviestWeight} kg
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block">Caught</span>
                        <span className="font-mono font-bold text-slate-100">
                          {activeRecord.caughtCount}x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Consumable Culinary Buff */}
                  <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
                    <h5 className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} /> Consumable Culinary Buff
                    </h5>
                    <p className="text-xs text-cyan-100 font-semibold">{activeFish.buffText}</p>
                    <p className="text-[10px] text-slate-400">
                      Use directly from inventory or hotbar to gain temporary stat bonuses during exploration!
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl text-slate-600">
                    ❓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-400">Undiscovered Species</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Cast your rod with specialized baits in{' '}
                      <span className="text-slate-300 font-semibold">
                        {AREA_NAMES[activeFish.area] || activeFish.area}
                      </span>{' '}
                      to record this elusive creature in your almanac.
                    </p>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
