import React, { useState } from 'react';
import { EquipmentState, InventorySlot } from '../types';
import { X, Shield, Swords, Sparkles, Hammer, Coins } from 'lucide-react';
import { sound } from '../services/audio';

interface UpgradeModalProps {
  equipment: EquipmentState;
  inventory: InventorySlot[];
  gold: number;
  onUpgrade: (slot: 'weapon' | 'armor') => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  equipment,
  inventory,
  gold,
  onUpgrade,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'weapon' | 'armor'>('weapon');
  const selectedItem = selectedSlot === 'weapon' ? equipment.weapon : equipment.armor;

  const curLevel = selectedItem?.upgradeLevel || 0;
  const isMaxLevel = curLevel >= 5;
  const nextLevel = curLevel + 1;
  const goldCost = nextLevel * 60;
  const oreNeeded = nextLevel;

  const oreSlot = inventory.find((s) => s.item.id === 'iron_ore');
  const oreCount = oreSlot ? oreSlot.quantity : 0;

  const canAfford = !isMaxLevel && gold >= goldCost && oreCount >= oreNeeded;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs font-pixel select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-950 border-2 border-amber-500 rounded-lg shadow-[0_0_40px_rgba(245,158,11,0.25)] p-4 sm:p-5 flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
              ⚒️
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300">BLACKSMITH FORGE</h2>
              <span className="text-[10px] text-slate-400">Upgrade Equipment (Max Lv.5)</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded border border-slate-700 active:scale-95"
            title="Close [ESC]"
          >
            <X size={16} />
          </button>
        </div>

        {/* SLOT TABS: WEAPON / ARMOR */}
        <div className="flex rounded bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => {
              sound.playButtonClick();
              setSelectedSlot('weapon');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${
              selectedSlot === 'weapon'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords size={13} />
            <span>WEAPON</span>
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              setSelectedSlot('armor');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${
              selectedSlot === 'armor'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={13} />
            <span>ARMOR</span>
          </button>
        </div>

        {/* ITEM CARD & PREVIEW */}
        {selectedItem ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white tracking-wide">{selectedItem.name}</span>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                  Current: <span className="font-bold">Lv.{curLevel}</span> / Lv.5
                </div>
              </div>
              <div className="text-2xl">
                {selectedSlot === 'weapon' ? '⚔️' : '🛡️'}
              </div>
            </div>

            {/* STAT COMPARISON */}
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xs space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Refinement Preview
              </div>
              {selectedSlot === 'weapon' && (
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-300">Attack Power</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      +{ (selectedItem.stats?.attack || 0) + curLevel * 4 }
                    </span>
                    {!isMaxLevel && (
                      <>
                        <span className="text-emerald-400">▶</span>
                        <span className="text-emerald-300 font-bold">
                          +{ (selectedItem.stats?.attack || 0) + nextLevel * 4 }
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedSlot === 'armor' && (
                <>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-300">Defense</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        +{ (selectedItem.stats?.defense || 0) + curLevel * 3 }
                      </span>
                      {!isMaxLevel && (
                        <>
                          <span className="text-emerald-400">▶</span>
                          <span className="text-emerald-300 font-bold">
                            +{ (selectedItem.stats?.defense || 0) + nextLevel * 3 }
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-300">Max HP</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        +{ (selectedItem.stats?.maxHp || 0) + curLevel * 25 }
                      </span>
                      {!isMaxLevel && (
                        <>
                          <span className="text-emerald-400">▶</span>
                          <span className="text-emerald-300 font-bold">
                            +{ (selectedItem.stats?.maxHp || 0) + nextLevel * 25 }
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* UPGRADE REQUIREMENTS */}
            {!isMaxLevel ? (
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xs space-y-1.5 font-mono">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Required Materials
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Coins size={12} className="text-amber-400" /> Gold Cost
                  </span>
                  <span className={gold >= goldCost ? 'text-amber-300 font-bold' : 'text-rose-400 font-bold'}>
                    {gold} / {goldCost} G
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span>🪨</span> Skyfall Iron Ore
                  </span>
                  <span className={oreCount >= oreNeeded ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {oreCount} / {oreNeeded} Ores
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/50 rounded">
                🌟 THIS EQUIPMENT IS AT MAXIMUM REFINEMENT (Lv.5)!
              </div>
            )}

            {/* UPGRADE BUTTON */}
            {!isMaxLevel && (
              <button
                onClick={() => {
                  if (canAfford) {
                    onUpgrade(selectedSlot);
                  }
                }}
                disabled={!canAfford}
                className={`w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                  canAfford
                    ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Hammer size={14} />
                <span>REFINE TO LEVEL {nextLevel}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No equipment equipped in this slot.
          </div>
        )}
      </div>
    </div>
  );
};
