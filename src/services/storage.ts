import { SaveGameData, PlayerStats, InventorySlot, EquipmentState, Quest, AreaId } from '../types';
import { ITEMS } from '../game/itemsData';
import { INITIAL_QUESTS } from '../game/questData';

const SAVE_KEY_PREFIX = 'tales_of_skyfall_save_';

export class StorageService {
  public static getInitialStats(): PlayerStats {
    return {
      name: 'Aeron',
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: 120,
      maxHp: 120,
      energy: 100,
      maxEnergy: 100,
      baseAttack: 12,
      baseDefense: 4,
      critChance: 0.05,
      movementSpeed: 135,
      skillDamageMultiplier: 1.0,
      gold: 50,
      enemiesDefeated: 0,
      bossesDefeatedCount: 0,
      questsCompletedCount: 0,
      unlockedAreasCount: 1,
      playTimeSeconds: 0,
    };
  }

  public static getInitialInventory(): InventorySlot[] {
    return [
      { item: ITEMS.health_potion, quantity: 3 },
      { item: ITEMS.energy_elixir, quantity: 2 },
    ];
  }

  public static getInitialEquipment(): EquipmentState {
    return {
      weapon: ITEMS.rusty_sword,
      armor: ITEMS.apprentice_tunic,
      accessory: null,
    };
  }

  public static save(slot: number = 1, data: SaveGameData): boolean {
    try {
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game state', e);
      return false;
    }
  }

  public static load(slot: number = 1): SaveGameData | null {
    try {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`);
      if (!raw) return null;
      return JSON.parse(raw) as SaveGameData;
    } catch (e) {
      console.error('Failed to load save file', e);
      return null;
    }
  }

  public static hasSave(slot: number = 1): boolean {
    return localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`) !== null;
  }

  public static clearSave(slot: number = 1): void {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`);
  }

  public static createDefaultSave(): SaveGameData {
    return {
      version: 1,
      timestamp: Date.now(),
      currentArea: 'skyfall_village',
      playerPos: { x: 11 * 32, y: 10 * 32 },
      playerStats: this.getInitialStats(),
      inventory: this.getInitialInventory(),
      equipment: this.getInitialEquipment(),
      quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
      unlockedAreas: ['skyfall_village'],
      openedChests: [],
      solvedPuzzles: [],
      defeatedBosses: [],
    };
  }
}

export const storageService = {
  saveGame: (data: SaveGameData, slot: number = 1) => StorageService.save(slot, data),
  loadGame: (slot: number = 1) => StorageService.load(slot),
  hasSaveFile: (slot: number = 1) => StorageService.hasSave(slot),
  clearSave: (slot: number = 1) => StorageService.clearSave(slot),
  saveSettings: (settings: any) => {
    try {
      localStorage.setItem('tales_of_skyfall_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },
  loadSettings: () => {
    try {
      const raw = localStorage.getItem('tales_of_skyfall_settings');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
};

