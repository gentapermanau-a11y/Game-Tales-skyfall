import React, { useState } from 'react';
import { Item, InventorySlot, NPCEntity } from '../types';
import { ITEMS } from '../game/itemsData';
import { X, Coins, ShoppingBag, ArrowLeftRight, Lock, Hammer } from 'lucide-react';
import { sound } from '../services/audio';

interface ShopModalProps {
  gold: number;
  inventory: InventorySlot[];
  shopkeeper?: NPCEntity | null;
  defeatedBosses?: string[];
  onOpenUpgrade?: () => void;
  onClose: () => void;
  onBuyItem: (item: Item, cost: number) => void;
  onSellItem: (item: Item, quantity: number, earnings: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  gold,
  inventory,
  shopkeeper,
  defeatedBosses = [],
  onOpenUpgrade,
  onClose,
  onBuyItem,
  onSellItem,
}) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'weapon' | 'armor' | 'consumable' | 'material'>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(ITEMS.health_potion);

  const isFisherman = shopkeeper?.shopRole === 'fisherman' || shopkeeper?.id === 'npc_fisherman';
  const isBlacksmith = shopkeeper?.role === 'Blacksmith' || shopkeeper?.id === 'npc_brand';

  // Shop stock catalog tailored to NPC shopkeeper
  const shopCatalog: Item[] = isFisherman
    ? [
        ITEMS.rod_wooden,
        ITEMS.rod_iron,
        ITEMS.rod_hunter,
        ITEMS.rod_crystal,
        ITEMS.rod_celestial,
        ITEMS.bait_basic,
        ITEMS.bait_worm,
        ITEMS.bait_insect,
        ITEMS.bait_magic,
        ITEMS.bait_rare,
        ITEMS.health_potion,
      ]
    : [
        ITEMS.health_potion,
        ITEMS.great_health_potion,
        ITEMS.energy_elixir,
        ITEMS.iron_sword,
        ITEMS.iron_broadsword,
        ITEMS.skyfall_blade,
        ITEMS.astral_saber,
        ITEMS.apprentice_tunic,
        ITEMS.iron_mail,
        ITEMS.skyfall_aegis_armor,
        ITEMS.copper_ring,
        ITEMS.windstep_boots,
        ITEMS.iron_ore,
        ITEMS.rod_wooden,
        ITEMS.bait_basic,
      ];

  const filteredCatalog = shopCatalog.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const handleBuy = (item: Item) => {
    if (item.requiredBossId && !defeatedBosses.includes(item.requiredBossId)) {
      sound.playPortalLocked();
      return;
    }
    if (gold < item.value) {
      sound.playButtonClick();
      return;
    }
    onBuyItem(item, item.value);
  };

  const handleSell = (slot: InventorySlot) => {
    const sellPrice = Math.max(1, Math.floor(slot.item.value * 0.6));
    onSellItem(slot.item, 1, sellPrice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs font-pixel select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-amber-500 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex flex-col gap-3.5 max-h-[88vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl">
              {isFisherman ? '🎣' : isBlacksmith ? '⚒️' : '🏪'}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300">
                {shopkeeper ? `${shopkeeper.name.toUpperCase()}'S SHOP` : 'SKYFALL GENERAL MERCHANT'}
              </h2>
              <span className="text-[10px] text-slate-400">
                {isFisherman
                  ? 'Master Rods, Special Baits & Angling Equipment'
                  : isBlacksmith
                  ? 'Weapons, Armors & Equipment Refinement'
                  : 'Apothecary Potions, Gear & Sundries'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/60 px-2.5 py-1 rounded text-xs text-amber-300 font-bold font-mono">
              <Coins size={13} className="text-amber-400" />
              <span>{gold} Gold</span>
            </div>
            <button
              onClick={() => {
                sound.playButtonClick();
                onClose();
              }}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-700 active:scale-90"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* TOP CONTROLS & UPGRADE SHORTCUT */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* MODE TOGGLE */}
          <div className="flex gap-1.5 bg-slate-900 p-1 rounded border border-slate-800">
            <button
              onClick={() => {
                sound.playButtonClick();
                setMode('buy');
                setSelectedItem(filteredCatalog[0] || null);
              }}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'buy' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={13} />
              <span>BUY</span>
            </button>
            <button
              onClick={() => {
                sound.playButtonClick();
                setMode('sell');
                setSelectedItem(inventory[0]?.item || null);
              }}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'sell' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight size={13} />
              <span>SELL</span>
            </button>
          </div>

          {/* BLACKSMITH UPGRADE SHORTCUT */}
          {onOpenUpgrade && (
            <button
              onClick={() => {
                sound.playButtonClick();
                onOpenUpgrade();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 border border-amber-400 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Hammer size={13} />
              <span>UPGRADE EQUIPMENT (LV.1 - LV.5)</span>
            </button>
          )}
        </div>

        {/* CATEGORY FILTER TABS (BUY MODE) */}
        {mode === 'buy' && (
          <div className="flex flex-wrap gap-1 text-[10px]">
            {(['all', 'weapon', 'armor', 'consumable', 'material'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playButtonClick();
                  setCategoryFilter(cat);
                }}
                className={`px-2 py-0.5 rounded uppercase font-bold border transition-colors ${
                  categoryFilter === cat
                    ? 'bg-amber-950 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* MAIN LIST & DETAIL */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 flex-1">
          {/* ITEMS LIST */}
          <div className="sm:col-span-7 flex flex-col gap-2 overflow-y-auto max-h-[290px] pr-1">
            {mode === 'buy' ? (
              filteredCatalog.map((item) => {
                const isLocked = item.requiredBossId ? !defeatedBosses.includes(item.requiredBossId) : false;
                const canAfford = gold >= item.value && !isLocked;
                const isSel = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
                      isSel
                        ? 'bg-amber-950/70 border-amber-500'
                        : isLocked
                        ? 'bg-slate-950/80 border-slate-800/80 opacity-70'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isLocked && (
                            <span className="text-[9px] text-rose-400 font-mono flex items-center gap-0.5 bg-rose-950/80 px-1 rounded border border-rose-800">
                              <Lock size={9} /> LOCKED
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] uppercase text-slate-400">{item.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold flex items-center gap-1 font-mono ${
                          canAfford ? 'text-amber-300' : isLocked ? 'text-slate-500' : 'text-rose-400'
                        }`}
                      >
                        <Coins size={11} />
                        {item.value} G
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(item);
                        }}
                        disabled={!canAfford}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded active:scale-95 transition-all ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : isLocked
                            ? 'bg-rose-950/60 border border-rose-800 text-rose-300 cursor-not-allowed text-[9px]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isLocked ? 'SEALED' : 'BUY'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : inventory.length > 0 ? (
              inventory.map((slot, idx) => {
                const sellPrice = Math.max(1, Math.floor(slot.item.value * 0.6));
                const isSel = selectedItem?.id === slot.item.id;
                const isQuest = slot.item.category === 'quest';

                return (
                  <div
                    key={`${slot.item.id}-${idx}`}
                    onClick={() => setSelectedItem(slot.item)}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
                      isSel ? 'bg-emerald-950/70 border-emerald-500' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{slot.item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          {slot.item.name} {slot.quantity > 1 && `x${slot.quantity}`}
                        </div>
                        <div className="text-[9px] uppercase text-slate-400">{slot.item.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 font-mono">
                        +{sellPrice} G
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSell(slot);
                        }}
                        disabled={isQuest}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded active:scale-95 transition-all ${
                          !isQuest
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isQuest ? 'BOUND' : 'SELL'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                No items in inventory to sell.
              </div>
            )}
          </div>

          {/* ITEM DETAIL CARD */}
          <div className="sm:col-span-5 bg-slate-900/90 border border-slate-800 p-3 rounded flex flex-col justify-between">
            {selectedItem ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="text-3xl">{selectedItem.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedItem.name}</h4>
                    <span className="text-[9px] uppercase text-amber-400 font-bold">
                      {selectedItem.rarity} {selectedItem.category}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 italic leading-relaxed">
                  "{selectedItem.description}"
                </p>

                {selectedItem.requiredBossId && !defeatedBosses.includes(selectedItem.requiredBossId) && (
                  <div className="bg-rose-950/60 border border-rose-600/70 p-2 rounded text-[10px] text-rose-300 font-bold flex items-center gap-1.5">
                    <Lock size={12} className="shrink-0" />
                    <span>Requires defeating {selectedItem.requiredBossName || 'area boss'} to purchase!</span>
                  </div>
                )}

                {selectedItem.stats && (
                  <div className="bg-slate-950/60 p-2 rounded text-[10px] space-y-1 font-mono">
                    {selectedItem.stats.attack && (
                      <div className="text-rose-300">Attack +{selectedItem.stats.attack}</div>
                    )}
                    {selectedItem.stats.defense && (
                      <div className="text-blue-300">Defense +{selectedItem.stats.defense}</div>
                    )}
                    {selectedItem.stats.maxHp && (
                      <div className="text-emerald-300">Max HP +{selectedItem.stats.maxHp}</div>
                    )}
                    {selectedItem.stats.critChance && (
                      <div className="text-amber-300">Crit +{(selectedItem.stats.critChance * 100).toFixed(0)}%</div>
                    )}
                  </div>
                )}

                {selectedItem.effect && (
                  <div className="bg-emerald-950/40 p-1.5 rounded text-[10px] text-emerald-300 font-mono">
                    {selectedItem.effect.healHp && `Heals ${selectedItem.effect.healHp} HP`}
                    {selectedItem.effect.restoreEnergy && `Restores ${selectedItem.effect.restoreEnergy} Energy`}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">Select an item</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
