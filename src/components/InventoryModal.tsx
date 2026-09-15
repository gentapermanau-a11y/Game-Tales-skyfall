import React, { useState } from 'react';
import { InventorySlot, EquipmentState, Item, ItemCategory, FishingRodId } from '../types';
import { X, Shield, Swords, Sparkles, Coins } from 'lucide-react';
import { sound } from '../services/audio';
import { FISHING_RODS } from '../game/fishingData';

interface InventoryModalProps {
  inventory: InventorySlot[];
  equipment: EquipmentState;
  gold: number;
  equippedRod?: FishingRodId;
  onClose: () => void;
  onEquip: (item: Item) => void;
  onUnequip: (slot: 'weapon' | 'armor' | 'accessory') => void;
  onUseConsumable: (item: Item) => void;
  onEquipRod?: (rodId: FishingRodId) => void;
  onEatFish?: (item: Item) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  equipment,
  gold,
  equippedRod = 'rod_wooden',
  onClose,
  onEquip,
  onUnequip,
  onUseConsumable,
  onEquipRod,
  onEatFish,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | ItemCategory>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    inventory[0]?.item || equipment.weapon || null
  );

  const filteredSlots = inventory.filter((slot) => {
    if (activeTab === 'all') return true;
    return slot.item.category === activeTab;
  });

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-400 bg-amber-950/40 text-amber-200';
      case 'epic':
        return 'border-purple-400 bg-purple-950/40 text-purple-200';
      case 'rare':
        return 'border-sky-400 bg-sky-950/40 text-sky-200';
      default:
        return 'border-slate-600 bg-slate-900/60 text-slate-200';
    }
  };

  const isEquipped = (item: Item) => {
    if (item.category === 'fishing_rod') {
      return equippedRod === item.id;
    }
    return (
      equipment.weapon?.id === item.id ||
      equipment.armor?.id === item.id ||
      equipment.accessory?.id === item.id
    );
  };

  const equippedRodData = FISHING_RODS[equippedRod] || FISHING_RODS.rod_wooden;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs font-pixel select-none animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-950 border-3 border-slate-700 rounded-lg shadow-2xl p-4 sm:p-6 flex flex-col gap-4 pixel-box max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="text-sm sm:text-base font-bold text-amber-400">INVENTORY & GEAR</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/50 px-3 py-1 rounded text-xs text-amber-300 font-bold">
              <Coins size={14} className="text-amber-400" />
              <span>{gold} Gold</span>
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
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
          {(['all', 'weapon', 'armor', 'accessory', 'fishing_rod', 'fish', 'consumable', 'material', 'quest'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playButtonClick();
                  setActiveTab(tab);
                }}
                className={`px-2.5 py-1 text-[10px] sm:text-xs rounded uppercase font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab === 'fishing_rod' ? '🎣 Rods' : tab === 'fish' ? '🐟 Fish' : tab}
              </button>
            )
          )}
        </div>

        {/* MAIN BODY: EQUIPMENT SLOTS (LEFT) + INVENTORY GRID (CENTER) + DETAILS (RIGHT) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
          {/* EQUIPPED SLOTS */}
          <div className="md:col-span-3 bg-slate-900/80 border border-slate-800 p-3 rounded flex flex-col gap-2">
            <h3 className="text-[10px] sm:text-xs text-slate-400 font-bold flex items-center gap-1">
              <Swords size={12} className="text-amber-400" />
              EQUIPPED GEAR
            </h3>

            {/* WEAPON */}
            <div
              onClick={() => {
                if (equipment.weapon) {
                  sound.playButtonClick();
                  setSelectedItem(equipment.weapon);
                }
              }}
              className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                equipment.weapon ? getRarityBorder(equipment.weapon.rarity) : 'border-slate-800 bg-slate-950/40 text-slate-600'
              }`}
            >
              <span className="text-xl">{equipment.weapon ? equipment.weapon.icon : '⚔️'}</span>
              <div className="overflow-hidden">
                <div className="text-[9px] text-slate-400 uppercase">Weapon</div>
                <div className="text-[10px] font-bold truncate">
                  {equipment.weapon ? equipment.weapon.name : 'Empty'}
                </div>
              </div>
            </div>

            {/* ARMOR */}
            <div
              onClick={() => {
                if (equipment.armor) {
                  sound.playButtonClick();
                  setSelectedItem(equipment.armor);
                }
              }}
              className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                equipment.armor ? getRarityBorder(equipment.armor.rarity) : 'border-slate-800 bg-slate-950/40 text-slate-600'
              }`}
            >
              <span className="text-xl">{equipment.armor ? equipment.armor.icon : '🛡️'}</span>
              <div className="overflow-hidden">
                <div className="text-[9px] text-slate-400 uppercase">Armor</div>
                <div className="text-[10px] font-bold truncate">
                  {equipment.armor ? equipment.armor.name : 'Empty'}
                </div>
              </div>
            </div>

            {/* ACCESSORY */}
            <div
              onClick={() => {
                if (equipment.accessory) {
                  sound.playButtonClick();
                  setSelectedItem(equipment.accessory);
                }
              }}
              className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                equipment.accessory ? getRarityBorder(equipment.accessory.rarity) : 'border-slate-800 bg-slate-950/40 text-slate-600'
              }`}
            >
              <span className="text-xl">{equipment.accessory ? equipment.accessory.icon : '💍'}</span>
              <div className="overflow-hidden">
                <div className="text-[9px] text-slate-400 uppercase">Accessory</div>
                <div className="text-[10px] font-bold truncate">
                  {equipment.accessory ? equipment.accessory.name : 'Empty'}
                </div>
              </div>
            </div>

            {/* FISHING ROD SLOT */}
            <div
              onClick={() => {
                const rodSlot = inventory.find((s) => s.item.id === equippedRod);
                if (rodSlot) {
                  sound.playButtonClick();
                  setSelectedItem(rodSlot.item);
                }
              }}
              className="p-2 rounded border border-amber-500/60 bg-amber-950/30 text-amber-200 cursor-pointer flex items-center gap-2 hover:bg-amber-950/50 transition-colors"
            >
              <span className="text-xl">{equippedRodData.icon || '🎣'}</span>
              <div className="overflow-hidden">
                <div className="text-[9px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <span>Pancingan</span>
                  <span className="text-[7px] bg-emerald-900 text-emerald-300 px-1 rounded">EQUIPPED</span>
                </div>
                <div className="text-[10px] font-bold truncate text-white">
                  {equippedRodData.name}
                </div>
              </div>
            </div>
          </div>

          {/* INVENTORY GRID */}
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 p-3 rounded overflow-y-auto max-h-[300px]">
            <h3 className="text-[10px] sm:text-xs text-slate-400 font-bold mb-2">
              BAG ITEMS ({filteredSlots.length})
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {filteredSlots.map((slot, index) => {
                const isSel = selectedItem?.id === slot.item.id;
                return (
                  <button
                    key={`${slot.item.id}-${index}`}
                    onClick={() => {
                      sound.playButtonClick();
                      setSelectedItem(slot.item);
                    }}
                    className={`h-14 rounded border-2 flex flex-col items-center justify-center relative active:scale-95 transition-all ${
                      getRarityBorder(slot.item.rarity)
                    } ${isSel ? 'ring-2 ring-white' : ''}`}
                  >
                    <span className="text-xl">{slot.item.icon}</span>
                    {slot.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded">
                        x{slot.quantity}
                      </span>
                    )}
                    {isEquipped(slot.item) && (
                      <span className="absolute top-0.5 left-1 text-[7px] font-bold text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-600">
                        EQ
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredSlots.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-500">
                  No items in this category.
                </div>
              )}
            </div>
          </div>

          {/* ITEM DETAIL CARD */}
          <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 p-3 rounded flex flex-col justify-between">
            {selectedItem ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="text-3xl">{selectedItem.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{selectedItem.name}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400">
                      {selectedItem.rarity} {selectedItem.category}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] sm:text-xs text-slate-300 italic leading-relaxed">
                  "{selectedItem.description}"
                </p>

                {/* STATS */}
                {selectedItem.stats && (
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[10px] space-y-1">
                    {selectedItem.stats.attack && (
                      <div className="flex justify-between text-rose-300">
                        <span>Attack:</span>
                        <span className="font-bold">+{selectedItem.stats.attack}</span>
                      </div>
                    )}
                    {selectedItem.stats.defense && (
                      <div className="flex justify-between text-blue-300">
                        <span>Defense:</span>
                        <span className="font-bold">+{selectedItem.stats.defense}</span>
                      </div>
                    )}
                    {selectedItem.stats.maxHp && (
                      <div className="flex justify-between text-emerald-300">
                        <span>Max HP:</span>
                        <span className="font-bold">+{selectedItem.stats.maxHp}</span>
                      </div>
                    )}
                    {selectedItem.stats.critChance && (
                      <div className="flex justify-between text-amber-300">
                        <span>Crit Rate:</span>
                        <span className="font-bold">+{(selectedItem.stats.critChance * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {selectedItem.stats.skillDamage && (
                      <div className="flex justify-between text-purple-300">
                        <span>Skill Damage:</span>
                        <span className="font-bold">+{selectedItem.stats.skillDamage}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* EFFECT */}
                {selectedItem.effect && (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 p-2 rounded text-[10px] text-emerald-300">
                    {selectedItem.effect.healHp && <div>Restores {selectedItem.effect.healHp} Health Points</div>}
                    {selectedItem.effect.restoreEnergy && <div>Restores {selectedItem.effect.restoreEnergy} Energy</div>}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                  <span>Merchant Value:</span>
                  <span className="text-amber-300 font-bold">{selectedItem.value} Gold</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                Select an item to view stats
              </div>
            )}

            {/* ACTION BUTTONS */}
            {selectedItem && (
              <div className="mt-3 pt-2 border-t border-slate-800 flex gap-2">
                {(selectedItem.category === 'weapon' ||
                  selectedItem.category === 'armor' ||
                  selectedItem.category === 'accessory') && (
                  <button
                    onClick={() => {
                      onEquip(selectedItem);
                    }}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold active:scale-95 transition-transform"
                  >
                    {isEquipped(selectedItem) ? 'Re-Equip' : 'Equip Gear'}
                  </button>
                )}

                {/* FISHING ROD EQUIP BUTTON */}
                {selectedItem.category === 'fishing_rod' && (
                  <button
                    onClick={() => {
                      if (onEquipRod) {
                        onEquipRod(selectedItem.id as FishingRodId);
                      }
                    }}
                    disabled={isEquipped(selectedItem)}
                    className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                      isEquipped(selectedItem)
                        ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-200 cursor-default'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg active:scale-95'
                    }`}
                  >
                    {isEquipped(selectedItem) ? '✓ Sedang Dipakai (Equipped)' : '🎣 Pakai Pancingan Ini'}
                  </button>
                )}

                {/* FISH CONSUME BUTTON */}
                {selectedItem.category === 'fish' && (
                  <button
                    onClick={() => {
                      if (onEatFish) {
                        onEatFish(selectedItem);
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold active:scale-95 transition-transform shadow-lg"
                  >
                    🍴 Santap Ikan (Aktifkan Buff)
                  </button>
                )}

                {selectedItem.category === 'consumable' && (
                  <button
                    onClick={() => {
                      onUseConsumable(selectedItem);
                    }}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold active:scale-95 transition-transform"
                  >
                    Use Item
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
