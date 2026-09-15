import { AreaId, InteractiveObject, NPCEntity, EnemyEntity } from '../types';
import { ITEMS } from './itemsData';

export interface MapData {
  id: AreaId;
  name: string;
  music: 'village' | 'forest' | 'dungeon' | 'boss' | 'frozen' | 'volcano' | 'sunken' | 'swamp' | 'sky' | 'castle' | 'celestial';
  width: number; // in tiles
  height: number;
  tileSize: number;
  tiles: number[][]; // 0: ground, 1: solid wall/tree/boundary, 2: path, 3: water/chasm/lava, 4: decorative
  playerSpawn: { x: number; y: number };
  npcs: NPCEntity[];
  enemies: EnemyEntity[];
  objects: InteractiveObject[];
}

export const MAPS: Record<AreaId, () => MapData> = {
  // =========================================================================
  // 1. SKYFALL VILLAGE (46x34 Tiles)
  // Sub-zones: Central Plaza, Elder's Manor, Blacksmith Forge, Lily's Market,
  // Training Ground, Riverside Mill, Fisherman's Pier & Lake, Secret Ruins Grotto.
  // =========================================================================
  skyfall_village: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        // Outer boundaries
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          // East gate exit to Whispering Forest
          if (c === width - 1 && (r >= 14 && r <= 17)) {
            tiles[r][c] = 2;
          } else {
            tiles[r][c] = 1;
          }
        }
        // Winding River & Lake in the South-East (rows 22-30, cols 24-42)
        else if (
          (r >= 24 && r <= 31 && c >= 26 && c <= 43 && !(r >= 26 && r <= 28 && c >= 32 && c <= 34)) || // Lake
          (r >= 16 && r <= 24 && c >= 28 && c <= 30 && !(r >= 19 && r <= 20)) // River stream with wooden bridge
        ) {
          tiles[r][c] = 3; // Water
        }
        // Wooden Bridges across river
        else if (r >= 19 && r <= 20 && c >= 28 && c <= 30) {
          tiles[r][c] = 2; // Wooden bridge
        }
        // Buildings & Cottages (Solid walls)
        else if (
          (r >= 3 && r <= 7 && c >= 4 && c <= 10) || // Elder Matthew's Manor
          (r >= 3 && r <= 7 && c >= 16 && c <= 22) || // Lily's General Store
          (r >= 14 && r <= 18 && c >= 4 && c <= 10) || // Blacksmith Brand's Forge
          (r >= 23 && r <= 27 && c >= 4 && c <= 9) || // Residential Cottage
          (r >= 25 && r <= 29 && c >= 18 && c <= 23) // Fisherman Finn's Tackle Shack
        ) {
          tiles[r][c] = 1;
        }
        // Stone Fences around Training Ground (rows 3-10, cols 30-42)
        else if (
          (r === 3 || r === 10 || c === 30 || c === 42) &&
          (r >= 3 && r <= 10 && c >= 30 && c <= 42) &&
          !(r === 10 && (c === 35 || c === 36)) // Training gate opening
        ) {
          tiles[r][c] = 1;
        }
        // Cobblestone Main Roads & Plaza Paths
        else if (
          (r >= 14 && r <= 16 && c >= 10 && c <= width - 2) || // Main East-West thoroughfare
          (c >= 12 && c <= 14 && r >= 3 && r <= 31) || // North-South central avenue
          (r >= 8 && r <= 9 && c >= 4 && c <= 24) || // Plaza promenade
          (c >= 33 && c <= 35 && r >= 10 && r <= 16) || // Path to training ground
          (r >= 20 && r <= 22 && c >= 22 && c <= 36) // Path to Fishing Lake & Pier
        ) {
          tiles[r][c] = 2; // Path
        }
        // Flower Beds and Gardens
        else if (
          ((r === 2 || r === 8) && c >= 11 && c <= 15) ||
          ((r >= 20 && r <= 22) && c >= 15 && c <= 17) ||
          ((r >= 10 && r <= 12) && c >= 25 && c <= 28)
        ) {
          tiles[r][c] = 4; // Flowers
        }
        // Lush green village grass
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const npcs: NPCEntity[] = [
      {
        id: 'npc_matthew',
        name: 'Elder Matthew',
        role: 'Village Elder',
        x: 13 * tileSize,
        y: 8 * tileSize,
        width: 24,
        height: 30,
        facing: 'down',
        portrait: 'elder',
        initialDialogId: 'matthew_intro',
        questIndicator: 'available',
      },
      {
        id: 'npc_lily',
        name: 'Lily',
        role: 'Shopkeeper',
        x: 19 * tileSize,
        y: 8 * tileSize,
        width: 24,
        height: 30,
        facing: 'down',
        portrait: 'shopkeeper',
        initialDialogId: 'lily_intro',
        shopRole: 'merchant',
      },
      {
        id: 'npc_brand',
        name: 'Blacksmith Brand',
        role: 'Master Smith',
        x: 8 * tileSize,
        y: 19 * tileSize,
        width: 24,
        height: 30,
        facing: 'right',
        portrait: 'blacksmith',
        initialDialogId: 'brand_intro',
        questIndicator: 'available',
        shopRole: 'blacksmith',
      },
      {
        id: 'npc_vance',
        name: 'Captain Vance',
        role: 'Guard Captain',
        x: 36 * tileSize,
        y: 11 * tileSize,
        width: 24,
        height: 30,
        facing: 'down',
        portrait: 'guard',
        initialDialogId: 'vance_intro',
        questIndicator: 'available',
      },
      {
        id: 'npc_finn',
        name: 'Fisherman Finn',
        role: 'Master Angler',
        x: 25 * tileSize,
        y: 24 * tileSize,
        width: 24,
        height: 30,
        facing: 'right',
        portrait: 'fisherman',
        initialDialogId: 'finn_intro',
        questIndicator: 'available',
        shopRole: 'fisherman',
      },
      {
        id: 'npc_stranger',
        name: 'Hooded Traveler',
        role: 'Mysterious Stranger',
        x: 5 * tileSize,
        y: 11 * tileSize,
        width: 24,
        height: 30,
        facing: 'right',
        portrait: 'mysterious',
        initialDialogId: 'stranger_intro',
      },
    ];

    const objects: InteractiveObject[] = [
      // Checkpoint Crystal in Village Center Plaza
      {
        id: 'checkpoint_village',
        type: 'checkpoint_crystal',
        x: 13 * tileSize + 16,
        y: 13 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Rest Campfire near Plaza
      {
        id: 'campfire_village',
        type: 'campfire',
        x: 16 * tileSize + 16,
        y: 12 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
        customText: 'Resting by the warm village hearth restores your HP and Energy to full!',
      },
      // Exit Portal to Whispering Forest
      {
        id: 'portal_to_forest',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 15 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'whispering_forest',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
      },
      // Fishing Spots in Lake Skyfall
      {
        id: 'fish_spot_village_1',
        type: 'fishing_spot',
        spotName: 'Skyfall Village Lake Pier',
        x: 29 * tileSize + 16,
        y: 25 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'fish_spot_village_2',
        type: 'fishing_spot',
        spotName: 'Quiet Millpond Grotto',
        x: 38 * tileSize + 16,
        y: 28 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      // Signs with Lore
      {
        id: 'sign_village_main',
        type: 'sign',
        x: 14 * tileSize + 16,
        y: 17 * tileSize + 16,
        width: 24,
        height: 24,
        state: 'active',
        customText: '📜 [NOTICE BOARD]: Welcome to Skyfall Village. East: Whispering Forest. South: Fishermans Haven. North: Training Yard.',
      },
      {
        id: 'sign_village_lake',
        type: 'sign',
        x: 23 * tileSize + 16,
        y: 23 * tileSize + 16,
        width: 24,
        height: 24,
        state: 'active',
        customText: '🐟 [LAKE ANGLER NOTICE]: Fresh Skyfall Carps & Golden Trout dwell here! Talk to Finn for rods & bait.',
      },
      // Library Bookshelf in Elder\'s Manor
      {
        id: 'bookshelf_elder',
        type: 'bookshelf',
        x: 7 * tileSize + 16,
        y: 8 * tileSize + 16,
        width: 24,
        height: 24,
        state: 'active',
        customText: '📖 [CHRONICLES OF AETHERIA]: "When the Sky Core fractured, knight sentinels fell from the celestial heights..."',
      },
      // Ancient Guardian Statue in Secret Corner
      {
        id: 'statue_village',
        type: 'ancient_statue',
        x: 3 * tileSize + 16,
        y: 3 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
        customText: '🗿 [STONE SENTINEL]: An ancient weathered statue depicting the legendary Sky Knight Aeron holding his broadsword.',
      },
      // Magic Shrine in Grove
      {
        id: 'shrine_village',
        type: 'magic_shrine',
        x: 42 * tileSize + 16,
        y: 4 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
        customText: '✨ [AETHER GROVE SHRINE]: The gentle mana breeze invigorates your spirit (+10 Max Energy boost)!',
      },
      // Treasure Chests
      {
        id: 'chest_village_secret',
        type: 'chest',
        x: 43 * tileSize + 16,
        y: 8 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 80, item: ITEMS.health_potion_large },
      },
      {
        id: 'chest_village_lake',
        type: 'chest',
        x: 41 * tileSize + 16,
        y: 31 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 120, item: ITEMS.bait_worm },
      },
      // Destructible Barrels, Crates, and Breakable Jars
      {
        id: 'barrel_v1',
        type: 'barrel',
        x: 10 * tileSize + 16,
        y: 19 * tileSize + 16,
        width: 20,
        height: 22,
        state: 'closed',
        loot: { gold: 15, item: ITEMS.slime_gel },
      },
      {
        id: 'barrel_v2',
        type: 'barrel',
        x: 17 * tileSize + 16,
        y: 9 * tileSize + 16,
        width: 20,
        height: 22,
        state: 'closed',
        loot: { gold: 20, item: ITEMS.bait_basic },
      },
      {
        id: 'crate_v1',
        type: 'crate',
        x: 21 * tileSize + 16,
        y: 9 * tileSize + 16,
        width: 22,
        height: 22,
        state: 'closed',
        loot: { gold: 25, item: ITEMS.forest_herb },
      },
      {
        id: 'crate_v2',
        type: 'crate',
        x: 27 * tileSize + 16,
        y: 23 * tileSize + 16,
        width: 22,
        height: 22,
        state: 'closed',
        loot: { gold: 35, item: ITEMS.bait_worm },
      },
      {
        id: 'jar_v1',
        type: 'breakable_jar',
        x: 32 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 20,
        height: 20,
        state: 'closed',
        loot: { gold: 12 },
      },
      {
        id: 'jar_v2',
        type: 'breakable_jar',
        x: 34 * tileSize + 16,
        y: 8 * tileSize + 16,
        width: 20,
        height: 20,
        state: 'closed',
        loot: { gold: 18, item: ITEMS.health_potion },
      },
    ];

    // Training Dummies and Friendly Sparring Slimes in Village Grounds
    const enemies: EnemyEntity[] = [
      {
        id: 'dummy_1',
        type: 'melee_goblin',
        name: 'Training Target A',
        x: 35 * tileSize,
        y: 5 * tileSize,
        width: 24,
        height: 28,
        hp: 120,
        maxHp: 120,
        attack: 0,
        defense: 2,
        speed: 0,
        detectionRange: 0,
        attackRange: 0,
        attackCooldown: 999,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 25, gold: 15 },
      },
      {
        id: 'dummy_2',
        type: 'melee_goblin',
        name: 'Training Target B',
        x: 39 * tileSize,
        y: 7 * tileSize,
        width: 24,
        height: 28,
        hp: 150,
        maxHp: 150,
        attack: 0,
        defense: 4,
        speed: 0,
        detectionRange: 0,
        attackRange: 0,
        attackCooldown: 999,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 35, gold: 20 },
      },
      {
        id: 'slime_meadow_1',
        type: 'green_slime',
        name: 'Meadow Slime',
        x: 39 * tileSize,
        y: 20 * tileSize,
        width: 22,
        height: 20,
        hp: 40,
        maxHp: 40,
        attack: 4,
        defense: 1,
        speed: 0.8,
        detectionRange: 120,
        attackRange: 24,
        attackCooldown: 1200,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 18, gold: 10, items: [{ item: ITEMS.slime_gel, chance: 0.8 }] },
      },
    ];

    return {
      id: 'skyfall_village',
      name: 'Skyfall Village',
      music: 'village',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 13 * tileSize, y: 15 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 2. WHISPERING FOREST (48x36 Tiles)
  // Sub-zones: Forest Entrance, Ancient River Valley, Goblin Encampment,
  // Deep Moss Grotto, Waterfall Fishing Cove, Briar Treant Glade.
  // =========================================================================
  whispering_forest: () => {
    const width = 48;
    const height = 36;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        // Outer boundaries
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          // West exit back to village
          if (c === 0 && (r >= 14 && r <= 17)) {
            tiles[r][c] = 2;
          }
          // East exit forward to Ancient Sanctum
          else if (c === width - 1 && (r >= 18 && r <= 21)) {
            tiles[r][c] = 2;
          } else {
            tiles[r][c] = 1;
          }
        }
        // Winding Forest River & Waterfall Basin (cols 18-23, rows 3-32)
        else if (
          (c >= 19 && c <= 22 && r >= 2 && r <= 33 && !(r >= 15 && r <= 17)) || // River
          (c >= 20 && c <= 30 && r >= 26 && r <= 32) // Waterfall Pool Cove
        ) {
          tiles[r][c] = 3; // River / water
        }
        // Forest Log Bridge across river
        else if (r >= 15 && r <= 17 && c >= 19 && c <= 22) {
          tiles[r][c] = 2; // Bridge
        }
        // Dense Ancient Oak clusters (Solid tree walls)
        else if (
          ((r >= 3 && r <= 7) && (c >= 3 && c <= 9)) ||
          ((r >= 22 && r <= 27) && (c >= 4 && c <= 10)) ||
          ((r >= 4 && r <= 9) && (c >= 26 && c <= 34)) ||
          ((r >= 23 && r <= 28) && (c >= 34 && c <= 42)) ||
          ((r >= 12 && r <= 16) && (c >= 36 && c <= 41))
        ) {
          tiles[r][c] = 1;
        }
        // Main Forest Dirt Paths
        else if (
          (r >= 15 && r <= 17 && c >= 1 && c <= 19) || // West to bridge
          (r >= 18 && r <= 20 && c >= 22 && c <= width - 2) || // Bridge to East Dungeon gate
          (c >= 10 && c <= 12 && r >= 8 && r <= 26) || // South to Goblin Camp
          (c >= 25 && c <= 27 && r >= 17 && r <= 28) // Path to Waterfall Fishing Cove
        ) {
          tiles[r][c] = 2;
        }
        // Forest Clearing Moss
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      // Portal back to Skyfall Village
      {
        id: 'portal_to_village',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'skyfall_village',
        targetSpawn: { x: 42 * tileSize, y: 15 * tileSize },
      },
      // Portal forward to Ancient Sanctum (Locked until Treant defeated)
      {
        id: 'portal_to_sanctum',
        type: 'portal',
        x: 46 * tileSize + 16,
        y: 19 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'ancient_sanctum',
        targetSpawn: { x: 3 * tileSize, y: 17 * tileSize },
        isLocked: true,
        requiredBossId: 'mini_boss_treant',
        requiredBossName: 'Ancient Briar Treant',
        lockReason: 'Defeat Ancient Briar Treant to unseal the Sanctum Entrance!',
      },
      // Checkpoint Crystal
      {
        id: 'checkpoint_forest',
        type: 'checkpoint_crystal',
        x: 14 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Forest Campfire
      {
        id: 'campfire_forest',
        type: 'campfire',
        x: 15 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
        customText: 'Resting by the forest fire eases your fatigue. Full recovery!',
      },
      // Fishing Spots
      {
        id: 'fish_spot_forest_1',
        type: 'fishing_spot',
        spotName: 'Whispering River Shallows',
        x: 20 * tileSize + 16,
        y: 9 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'fish_spot_forest_2',
        type: 'fishing_spot',
        spotName: 'Hidden Waterfall Cove',
        x: 26 * tileSize + 16,
        y: 29 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      // Lore Signs
      {
        id: 'sign_forest_entry',
        type: 'sign',
        x: 5 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 24,
        height: 24,
        state: 'active',
        customText: '🌲 [DANGER]: Deep forest ahead. Goblins nest in the south groves. Beware the Briar Treant!',
      },
      // Shrines & Statues
      {
        id: 'shrine_forest',
        type: 'magic_shrine',
        x: 8 * tileSize + 16,
        y: 4 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
        customText: '🌿 [SYLVAN SHRINE]: Ancient druidic magic surges through you!',
      },
      // Treasure Chests
      {
        id: 'chest_forest_cove',
        type: 'chest',
        x: 32 * tileSize + 16,
        y: 30 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 150, item: ITEMS.bait_insect },
      },
      {
        id: 'chest_forest_goblin',
        type: 'chest',
        x: 6 * tileSize + 16,
        y: 32 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 200, item: ITEMS.forged_armor },
      },
      // Destructibles
      {
        id: 'barrel_f1',
        type: 'barrel',
        x: 9 * tileSize + 16,
        y: 20 * tileSize + 16,
        width: 20,
        height: 22,
        state: 'closed',
        loot: { gold: 20, item: ITEMS.forest_herb },
      },
      {
        id: 'crate_f1',
        type: 'crate',
        x: 10 * tileSize + 16,
        y: 21 * tileSize + 16,
        width: 22,
        height: 22,
        state: 'closed',
        loot: { gold: 30, item: ITEMS.bait_worm },
      },
      {
        id: 'jar_f1',
        type: 'breakable_jar',
        x: 27 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 20,
        height: 20,
        state: 'closed',
        loot: { gold: 15 },
      },
    ];

    const npcs: NPCEntity[] = [
      {
        id: 'npc_hermit',
        name: 'Forest Ranger Luke',
        role: 'Woodland Scout',
        x: 13 * tileSize,
        y: 18 * tileSize,
        width: 24,
        height: 30,
        facing: 'right',
        portrait: 'guard',
        initialDialogId: 'vance_intro',
      },
    ];

    const enemies: EnemyEntity[] = [
      // Goblin Patrols in West Grove
      {
        id: 'goblin_1',
        type: 'melee_goblin',
        name: 'Forest Goblin Scout',
        x: 10 * tileSize,
        y: 10 * tileSize,
        width: 24,
        height: 26,
        hp: 60,
        maxHp: 60,
        attack: 7,
        defense: 2,
        speed: 1.2,
        detectionRange: 130,
        attackRange: 26,
        attackCooldown: 1000,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'down',
        loot: { exp: 30, gold: 15, items: [{ item: ITEMS.forest_herb, chance: 0.5 }] },
      },
      {
        id: 'goblin_2',
        type: 'melee_goblin',
        name: 'Forest Goblin Slasher',
        x: 7 * tileSize,
        y: 28 * tileSize,
        width: 24,
        height: 26,
        hp: 75,
        maxHp: 75,
        attack: 9,
        defense: 3,
        speed: 1.3,
        detectionRange: 140,
        attackRange: 26,
        attackCooldown: 900,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'right',
        loot: { exp: 40, gold: 22, items: [{ item: ITEMS.iron_ore, chance: 0.4 }] },
      },
      // Spitter Bugs & Slimes
      {
        id: 'spitter_1',
        type: 'ranged_spitter',
        name: 'Thorn Spitter',
        x: 32 * tileSize,
        y: 12 * tileSize,
        width: 24,
        height: 24,
        hp: 50,
        maxHp: 50,
        attack: 8,
        defense: 1,
        speed: 0.9,
        detectionRange: 160,
        attackRange: 140,
        attackCooldown: 1500,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 35, gold: 18 },
      },
      // Mini-Boss: Ancient Briar Treant guarding East Gate
      {
        id: 'mini_boss_treant',
        type: 'mini_boss_treant',
        name: 'Ancient Briar Treant',
        x: 38 * tileSize,
        y: 20 * tileSize,
        width: 38,
        height: 44,
        hp: 450,
        maxHp: 450,
        attack: 16,
        defense: 8,
        speed: 0.9,
        detectionRange: 180,
        attackRange: 42,
        attackCooldown: 1600,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 250, gold: 180, items: [{ item: ITEMS.ancient_rune, chance: 1.0 }, { item: ITEMS.skyfall_blade, chance: 0.6 }] },
      },
    ];

    return {
      id: 'whispering_forest',
      name: 'Whispering Forest',
      music: 'forest',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 3 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 3. ANCIENT SANCTUM (46x34 Tiles)
  // Sub-zones: Grand Rune Atrium, Flooded Relic Basin, Puzzle Chamber,
  // Celestial Archive, Fishing Sanctuary Well, Boss Colosseum (Talos).
  // =========================================================================
  ancient_sanctum: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) {
            tiles[r][c] = 2; // West exit back to forest
          } else if (c === width - 1 && (r >= 15 && r <= 18)) {
            tiles[r][c] = 2; // East exit to Frozen Kingdom
          } else {
            tiles[r][c] = 1;
          }
        }
        // Flooded Sanctuary Pool (cols 14-20, rows 6-12)
        else if (c >= 14 && c <= 20 && r >= 6 && r <= 12) {
          tiles[r][c] = 3; // Water
        }
        // Heavy Granite Chamber Walls
        else if (
          ((r >= 3 && r <= 14) && (c === 10 || c === 24)) ||
          ((r >= 20 && r <= 31) && (c === 10 || c === 24)) ||
          ((c >= 26 && c <= 42) && (r === 6 || r === 27))
        ) {
          tiles[r][c] = 1;
        }
        // Sanctuary Paved Corridors
        else if (
          (r >= 15 && r <= 18 && c >= 1 && c <= width - 2) ||
          (c >= 16 && c <= 18 && r >= 3 && r <= 31)
        ) {
          tiles[r][c] = 2;
        }
        // Slate Stone Floors
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_forest',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'whispering_forest',
        targetSpawn: { x: 44 * tileSize, y: 19 * tileSize },
      },
      {
        id: 'portal_to_frozen',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'frozen_kingdom',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
        isLocked: true,
        requiredBossId: 'boss_talos',
        requiredBossName: 'Sky Guardian Talos',
        lockReason: 'Defeat Sky Guardian Talos to unlock the northern Glacier Portal!',
      },
      {
        id: 'checkpoint_sanctum',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      {
        id: 'campfire_sanctum',
        type: 'campfire',
        x: 7 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
      },
      // Sanctuary Fishing Spot
      {
        id: 'fish_spot_sanctum',
        type: 'fishing_spot',
        spotName: 'Ancient Sanctuary Flooded Well',
        x: 17 * tileSize + 16,
        y: 9 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      // Puzzle Mechanics
      {
        id: 'sanctum_plate_1',
        type: 'pressure_plate',
        x: 5 * tileSize + 16,
        y: 25 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'inactive',
        targetId: 'sanctum_gate_1',
      },
      {
        id: 'sanctum_block_1',
        type: 'movable_block',
        x: 7 * tileSize + 16,
        y: 23 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'inactive',
      },
      {
        id: 'sanctum_gate_1',
        type: 'locked_door',
        x: 10 * tileSize + 16,
        y: 25 * tileSize + 16,
        width: 32,
        height: 48,
        state: 'locked',
      },
      // Lore & Chests
      {
        id: 'bookshelf_sanctum',
        type: 'bookshelf',
        x: 4 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 24,
        height: 24,
        state: 'active',
        customText: '📖 [ANCIENT GRIMOIRE]: "Talos was built to guard the Astral Gate from corruption. High defense, vulnerable to Sky Slashing."',
      },
      {
        id: 'chest_sanctum_vault',
        type: 'chest',
        x: 17 * tileSize + 16,
        y: 26 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 350, item: ITEMS.ancient_chestplate },
      },
      // Destructibles
      {
        id: 'jar_s1',
        type: 'breakable_jar',
        x: 12 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 20,
        height: 20,
        state: 'closed',
        loot: { gold: 30 },
      },
      {
        id: 'jar_s2',
        type: 'breakable_jar',
        x: 22 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 20,
        height: 20,
        state: 'closed',
        loot: { gold: 40, item: ITEMS.energy_potion },
      },
    ];

    const npcs: NPCEntity[] = [];

    const enemies: EnemyEntity[] = [
      {
        id: 'golem_guard_1',
        type: 'tank_golem',
        name: 'Sanctum Stone Guardian',
        x: 20 * tileSize,
        y: 20 * tileSize,
        width: 32,
        height: 36,
        hp: 180,
        maxHp: 180,
        attack: 14,
        defense: 10,
        speed: 0.8,
        detectionRange: 150,
        attackRange: 32,
        attackCooldown: 1500,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 90, gold: 50, items: [{ item: ITEMS.ancient_rune, chance: 0.8 }] },
      },
      // Boss Talos in East Arena
      {
        id: 'boss_talos',
        type: 'boss_talos',
        name: 'Sky Guardian Talos',
        x: 35 * tileSize,
        y: 16 * tileSize,
        width: 44,
        height: 52,
        hp: 950,
        maxHp: 950,
        attack: 24,
        defense: 14,
        speed: 1.1,
        detectionRange: 220,
        attackRange: 48,
        attackCooldown: 1800,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 600, gold: 500, items: [{ item: ITEMS.astral_saber, chance: 0.8 }, { item: ITEMS.rod_crystal, chance: 0.5 }] },
      },
    ];

    return {
      id: 'ancient_sanctum',
      name: 'Ancient Sanctum',
      music: 'dungeon',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 4. FROZEN KINGDOM (46x34 Tiles)
  // Sub-zones: Permafrost Outskirts, Glacial Lake, Ice Crystal Caves,
  // Frost Fishing Hole, Frost Queen's Glacial Citadel.
  // =========================================================================
  frozen_kingdom: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) {
            tiles[r][c] = 2; // West exit back to Sanctum
          } else if (c === width - 1 && (r >= 15 && r <= 18)) {
            tiles[r][c] = 2; // East exit to Volcanic Wasteland
          } else {
            tiles[r][c] = 1;
          }
        }
        // Sub-zero Glacial Lake (cols 12-24, rows 20-30)
        else if (c >= 14 && c <= 24 && r >= 20 && r <= 29) {
          tiles[r][c] = 3; // Ice water
        }
        // Glacier Ice Spires (Solid walls)
        else if (
          ((r >= 3 && r <= 9) && (c >= 4 && c <= 10)) ||
          ((r >= 3 && r <= 9) && (c >= 20 && c <= 28)) ||
          ((r >= 22 && r <= 30) && (c >= 4 && c <= 10)) ||
          ((r >= 4 && r <= 8) && (c >= 34 && c <= 42)) ||
          ((r >= 24 && r <= 30) && (c >= 34 && c <= 42))
        ) {
          tiles[r][c] = 1;
        }
        // Ice Roads
        else if (
          (r >= 15 && r <= 18 && c >= 1 && c <= width - 2) ||
          (c >= 18 && c <= 20 && r >= 10 && r <= 20)
        ) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_sanctum_from_frozen',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'ancient_sanctum',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'portal_to_volcano',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'volcanic_wasteland',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
        isLocked: true,
        requiredBossId: 'boss_frost_queen',
        requiredBossName: 'Frost Queen Lyanna',
        lockReason: 'Defeat Frost Queen Lyanna to melt the infernal seal!',
      },
      {
        id: 'checkpoint_frozen',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      {
        id: 'campfire_frozen',
        type: 'campfire',
        x: 7 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
      },
      // Glacial Fishing Spot
      {
        id: 'fish_spot_frozen',
        type: 'fishing_spot',
        spotName: 'Sub-Zero Glacial Ice Hole',
        x: 19 * tileSize + 16,
        y: 24 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'sign_frozen',
        type: 'sign',
        x: 8 * tileSize + 16,
        y: 18 * tileSize + 16,
        width: 24,
        height: 24,
        state: 'active',
        customText: '❄️ [WARNING]: Extreme blizzard zone. Frost Queens ice lances pierce standard armor.',
      },
      {
        id: 'chest_frozen',
        type: 'chest',
        x: 30 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 450, item: ITEMS.frost_spear },
      },
      // Destructibles
      {
        id: 'crate_fr1',
        type: 'crate',
        x: 12 * tileSize + 16,
        y: 14 * tileSize + 16,
        width: 22,
        height: 22,
        state: 'closed',
        loot: { gold: 45, item: ITEMS.bait_magic },
      },
    ];

    const npcs: NPCEntity[] = [];

    const enemies: EnemyEntity[] = [
      {
        id: 'frost_archer_1',
        type: 'ranged_archer',
        name: 'Frostbite Sniper',
        x: 18 * tileSize,
        y: 12 * tileSize,
        width: 24,
        height: 28,
        hp: 90,
        maxHp: 90,
        attack: 16,
        defense: 4,
        speed: 1.1,
        detectionRange: 170,
        attackRange: 150,
        attackCooldown: 1400,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'down',
        loot: { exp: 60, gold: 35 },
      },
      // Boss Frost Queen Lyanna
      {
        id: 'boss_frost_queen',
        type: 'boss_frost_queen',
        name: 'Frost Queen Lyanna',
        x: 36 * tileSize,
        y: 16 * tileSize,
        width: 40,
        height: 48,
        hp: 1300,
        maxHp: 1300,
        attack: 28,
        defense: 16,
        speed: 1.2,
        detectionRange: 220,
        attackRange: 50,
        attackCooldown: 1700,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 800, gold: 700, items: [{ item: ITEMS.frost_armor, chance: 1.0 }, { item: ITEMS.bait_rare, chance: 0.8 }] },
      },
    ];

    return {
      id: 'frozen_kingdom',
      name: 'Frozen Kingdom',
      music: 'frozen',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 5. VOLCANIC WASTELAND (46x34 Tiles)
  // Sub-zones: Basalt Ravine, Boiling Magma River, Obsidian Bridge,
  // Molten Fishing Hotspot, Magma Colossus Caldera.
  // =========================================================================
  volcanic_wasteland: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) {
            tiles[r][c] = 2;
          } else if (c === width - 1 && (r >= 15 && r <= 18)) {
            tiles[r][c] = 2;
          } else {
            tiles[r][c] = 1;
          }
        }
        // Molten Magma River (cols 18-22, rows 2-32)
        else if (c >= 18 && c <= 21 && r >= 2 && r <= 32 && !(r >= 15 && r <= 18)) {
          tiles[r][c] = 3; // Liquid Magma
        }
        // Obsidian Bridge
        else if (r >= 15 && r <= 18 && c >= 18 && c <= 21) {
          tiles[r][c] = 2;
        }
        // Basalt Pillars
        else if (
          ((r >= 3 && r <= 8) && (c >= 4 && c <= 12)) ||
          ((r >= 22 && r <= 30) && (c >= 4 && c <= 12)) ||
          ((r >= 4 && r <= 8) && (c >= 26 && c <= 34)) ||
          ((r >= 24 && r <= 30) && (c >= 26 && c <= 34))
        ) {
          tiles[r][c] = 1;
        }
        // Scorched Paths
        else if (
          (r >= 15 && r <= 18 && c >= 1 && c <= width - 2)
        ) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_frozen_from_volcano',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'frozen_kingdom',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'portal_to_sunken',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'sunken_city',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
        isLocked: true,
        requiredBossId: 'boss_magma_colossus',
        requiredBossName: 'Magma Colossus Ignis',
        lockReason: 'Defeat Magma Colossus Ignis to cool the oceanic rift!',
      },
      {
        id: 'checkpoint_volcano',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Magma Lava Fishing Spot
      {
        id: 'fish_spot_volcano',
        type: 'fishing_spot',
        spotName: 'Boiling Magma Caldera Hotspot',
        x: 19 * tileSize + 16,
        y: 8 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'chest_volcano',
        type: 'chest',
        x: 30 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 600, item: ITEMS.magma_blade },
      },
    ];

    const npcs: NPCEntity[] = [];

    const enemies: EnemyEntity[] = [
      {
        id: 'magma_golem_1',
        type: 'magma_golem',
        name: 'Molten Core Golem',
        x: 12 * tileSize,
        y: 22 * tileSize,
        width: 32,
        height: 36,
        hp: 220,
        maxHp: 220,
        attack: 20,
        defense: 12,
        speed: 0.9,
        detectionRange: 150,
        attackRange: 34,
        attackCooldown: 1400,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'right',
        loot: { exp: 120, gold: 60 },
      },
      // Boss Magma Colossus Ignis
      {
        id: 'boss_magma_colossus',
        type: 'boss_magma_colossus',
        name: 'Magma Colossus Ignis',
        x: 36 * tileSize,
        y: 16 * tileSize,
        width: 48,
        height: 56,
        hp: 1800,
        maxHp: 1800,
        attack: 34,
        defense: 18,
        speed: 1.0,
        detectionRange: 220,
        attackRange: 55,
        attackCooldown: 1900,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 1200, gold: 1000, items: [{ item: ITEMS.molten_armor, chance: 1.0 }] },
      },
    ];

    return {
      id: 'volcanic_wasteland',
      name: 'Volcanic Wasteland',
      music: 'volcano',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 6. SUNKEN CITY (46x34 Tiles)
  // Sub-zones: Submerged Colonnade, Coral Lagoon, Pearl Clam Reefs,
  // Abyssal Ocean Fishing Trench, Sunken Palace of Leviathan.
  // =========================================================================
  sunken_city: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else if (c === width - 1 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else tiles[r][c] = 1;
        }
        // Deep Abyssal Lagoon (cols 14-26, rows 18-30)
        else if (c >= 14 && c <= 26 && r >= 19 && r <= 29) {
          tiles[r][c] = 3;
        }
        // Submerged Marble Pillars
        else if (
          ((r >= 3 && r <= 9) && (c >= 4 && c <= 10)) ||
          ((r >= 3 && r <= 9) && (c >= 28 && c <= 36)) ||
          ((r >= 22 && r <= 30) && (c >= 4 && c <= 10))
        ) {
          tiles[r][c] = 1;
        }
        else if (r >= 15 && r <= 18 && c >= 1 && c <= width - 2) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_volcano_from_sunken',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'volcanic_wasteland',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'portal_to_swamp',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'dark_swamp',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'checkpoint_sunken',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Sunken Fishing Spot
      {
        id: 'fish_spot_sunken',
        type: 'fishing_spot',
        spotName: 'Abyssal Coral Lagoon Trench',
        x: 20 * tileSize + 16,
        y: 24 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'chest_sunken',
        type: 'chest',
        x: 32 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 750, item: ITEMS.abyssal_trident },
      },
    ];

    const npcs: NPCEntity[] = [];
    const enemies: EnemyEntity[] = [
      {
        id: 'watcher_1',
        type: 'flying_watcher',
        name: 'Abyssal Siren Eye',
        x: 24 * tileSize,
        y: 10 * tileSize,
        width: 26,
        height: 26,
        hp: 110,
        maxHp: 110,
        attack: 18,
        defense: 5,
        speed: 1.3,
        detectionRange: 160,
        attackRange: 140,
        attackCooldown: 1300,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 95, gold: 55 },
      },
    ];

    return {
      id: 'sunken_city',
      name: 'Sunken City',
      music: 'sunken',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 7. DARK SWAMP (46x34 Tiles)
  // Sub-zones: Poison Bog, Twisted Willow Roots, Witch's Grove,
  // Murky Toxic Fishing Marsh, Shadow Portal Gate.
  // =========================================================================
  dark_swamp: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else if (c === width - 1 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else tiles[r][c] = 1;
        }
        // Toxic Bog Pools (cols 12-24, rows 4-14)
        else if (c >= 12 && c <= 24 && r >= 5 && r <= 13) {
          tiles[r][c] = 3; // Toxic water
        }
        // Twisted Cypress Stems
        else if (
          ((r >= 22 && r <= 29) && (c >= 4 && c <= 12)) ||
          ((r >= 22 && r <= 29) && (c >= 26 && c <= 36))
        ) {
          tiles[r][c] = 1;
        }
        else if (r >= 15 && r <= 18 && c >= 1 && c <= width - 2) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_sunken_from_swamp',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'sunken_city',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'portal_to_sky',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'sky_islands',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'checkpoint_swamp',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Swamp Fishing Spot
      {
        id: 'fish_spot_swamp',
        type: 'fishing_spot',
        spotName: 'Murky Spore Bog Marsh',
        x: 18 * tileSize + 16,
        y: 9 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
    ];

    const npcs: NPCEntity[] = [];
    const enemies: EnemyEntity[] = [
      {
        id: 'mage_1',
        type: 'dark_mage',
        name: 'Swamp Necromancer',
        x: 26 * tileSize,
        y: 22 * tileSize,
        width: 24,
        height: 28,
        hp: 130,
        maxHp: 130,
        attack: 22,
        defense: 6,
        speed: 1.0,
        detectionRange: 160,
        attackRange: 130,
        attackCooldown: 1400,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 110, gold: 70 },
      },
    ];

    return {
      id: 'dark_swamp',
      name: 'Dark Swamp',
      music: 'swamp',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 8. SKY ISLANDS (46x34 Tiles)
  // Sub-zones: Floating Cloud Bridges, Aether Shallows, Starlight Pond,
  // Windmill Heights, Storm Guardian Tempest Peak.
  // =========================================================================
  sky_islands: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else if (c === width - 1 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else tiles[r][c] = 1;
        }
        // Floating Cloud Chasm / Void (cols 16-22, rows 2-32)
        else if (c >= 17 && c <= 21 && r >= 2 && r <= 32 && !(r >= 15 && r <= 18)) {
          tiles[r][c] = 3; // Cloud chasm
        }
        // Cloud Bridge
        else if (r >= 15 && r <= 18 && c >= 17 && c <= 21) {
          tiles[r][c] = 2;
        }
        // Floating Aether Spires
        else if (
          ((r >= 3 && r <= 9) && (c >= 4 && c <= 12)) ||
          ((r >= 22 && r <= 30) && (c >= 4 && c <= 12)) ||
          ((r >= 4 && r <= 9) && (c >= 26 && c <= 34)) ||
          ((r >= 23 && r <= 29) && (c >= 26 && c <= 34))
        ) {
          tiles[r][c] = 1;
        }
        else if (r >= 15 && r <= 18 && c >= 1 && c <= width - 2) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_swamp_from_sky',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'dark_swamp',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'portal_to_castle',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'shadow_castle',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
        isLocked: true,
        requiredBossId: 'boss_storm_guardian',
        requiredBossName: 'Storm Guardian Zephyr',
        lockReason: 'Defeat Storm Guardian Zephyr to disperse the hurricane vortex!',
      },
      {
        id: 'checkpoint_sky',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Sky Cloud Fishing Spot
      {
        id: 'fish_spot_sky',
        type: 'fishing_spot',
        spotName: 'Floating Aether Cloud Pond',
        x: 19 * tileSize + 16,
        y: 26 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'chest_sky',
        type: 'chest',
        x: 30 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 900, item: ITEMS.rod_celestial },
      },
    ];

    const npcs: NPCEntity[] = [];
    const enemies: EnemyEntity[] = [
      {
        id: 'harpy_1',
        type: 'sky_harpy',
        name: 'Storm Harpy Flurry',
        x: 24 * tileSize,
        y: 12 * tileSize,
        width: 28,
        height: 30,
        hp: 140,
        maxHp: 140,
        attack: 24,
        defense: 7,
        speed: 1.4,
        detectionRange: 170,
        attackRange: 130,
        attackCooldown: 1200,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 130, gold: 80 },
      },
      // Boss Storm Guardian Zephyr
      {
        id: 'boss_storm_guardian',
        type: 'boss_storm_guardian',
        name: 'Storm Guardian Zephyr',
        x: 36 * tileSize,
        y: 16 * tileSize,
        width: 44,
        height: 52,
        hp: 2200,
        maxHp: 2200,
        attack: 38,
        defense: 20,
        speed: 1.3,
        detectionRange: 220,
        attackRange: 50,
        attackCooldown: 1600,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 1600, gold: 1200, items: [{ item: ITEMS.astral_saber, chance: 1.0 }] },
      },
    ];

    return {
      id: 'sky_islands',
      name: 'Sky Islands',
      music: 'sky',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 9. SHADOW CASTLE (46x34 Tiles)
  // Sub-zones: Void Moat & Gate, Dungeon Oubliette, Shadow Cistern,
  // Throne Antechamber, Lord of Shadows Arena.
  // =========================================================================
  shadow_castle: () => {
    const width = 46;
    const height = 34;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else if (c === width - 1 && (r >= 15 && r <= 18)) tiles[r][c] = 2;
          else tiles[r][c] = 1;
        }
        // Void Moat (cols 12-24, rows 4-12)
        else if (c >= 12 && c <= 24 && r >= 4 && r <= 11) {
          tiles[r][c] = 3; // Void water
        }
        // Fortress Ramparts
        else if (
          ((r >= 22 && r <= 30) && (c >= 4 && c <= 12)) ||
          ((r >= 22 && r <= 30) && (c >= 26 && c <= 36))
        ) {
          tiles[r][c] = 1;
        }
        else if (r >= 15 && r <= 18 && c >= 1 && c <= width - 2) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_sky_from_castle',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'sky_islands',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'portal_to_celestial',
        type: 'portal',
        x: 44 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'celestial_fortress',
        targetSpawn: { x: 3 * tileSize, y: 16 * tileSize },
        isLocked: true,
        requiredBossId: 'boss_lord_of_shadows',
        requiredBossName: 'Malakor, Lord of Shadows',
        lockReason: 'Defeat Malakor to dispel the abyssal shadow veil!',
      },
      {
        id: 'checkpoint_castle',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 16 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      // Shadow Moat Fishing Spot
      {
        id: 'fish_spot_castle',
        type: 'fishing_spot',
        spotName: 'Shadow Citadel Void Moat',
        x: 18 * tileSize + 16,
        y: 8 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
    ];

    const npcs: NPCEntity[] = [];
    const enemies: EnemyEntity[] = [
      // Boss Malakor
      {
        id: 'boss_lord_of_shadows',
        type: 'boss_lord_of_shadows',
        name: 'Malakor, Lord of Shadows',
        x: 36 * tileSize,
        y: 16 * tileSize,
        width: 46,
        height: 54,
        hp: 2800,
        maxHp: 2800,
        attack: 44,
        defense: 24,
        speed: 1.2,
        detectionRange: 240,
        attackRange: 52,
        attackCooldown: 1700,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 2200, gold: 1800, items: [{ item: ITEMS.shadow_scythe, chance: 1.0 }] },
      },
    ];

    return {
      id: 'shadow_castle',
      name: 'Shadow Castle',
      music: 'castle',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 16 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },

  // =========================================================================
  // 10. CELESTIAL FORTRESS (48x36 Tiles)
  // Sub-zones: Divine Marble Courtyard, Harmonic Conduits, Starlight Nexus Pool,
  // Grand Pinnacle Dais (Final Boss: Skyfall Celestial Core).
  // =========================================================================
  celestial_fortress: () => {
    const width = 48;
    const height = 36;
    const tileSize = 32;

    const tiles: number[][] = [];
    for (let r = 0; r < height; r++) {
      tiles[r] = [];
      for (let c = 0; c < width; c++) {
        if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
          if (c === 0 && (r >= 16 && r <= 19)) tiles[r][c] = 2;
          else tiles[r][c] = 1;
        }
        // Cosmic Star Pool (cols 14-24, rows 22-31)
        else if (c >= 15 && c <= 24 && r >= 22 && r <= 31) {
          tiles[r][c] = 3; // Starlight cosmic pool
        }
        // Golden Divine Columns
        else if (
          ((r >= 3 && r <= 10) && (c >= 4 && c <= 12)) ||
          ((r >= 3 && r <= 10) && (c >= 28 && c <= 38)) ||
          ((r >= 24 && r <= 32) && (c >= 4 && c <= 12))
        ) {
          tiles[r][c] = 1;
        }
        else if (
          (r >= 16 && r <= 19 && c >= 1 && c <= width - 2) ||
          (c >= 18 && c <= 21 && r >= 10 && r <= 22)
        ) {
          tiles[r][c] = 2;
        }
        else {
          tiles[r][c] = 0;
        }
      }
    }

    const objects: InteractiveObject[] = [
      {
        id: 'portal_to_castle_from_celestial',
        type: 'portal',
        x: 2 * tileSize + 16,
        y: 17 * tileSize + 16,
        width: 32,
        height: 32,
        state: 'active',
        targetArea: 'shadow_castle',
        targetSpawn: { x: 42 * tileSize, y: 16 * tileSize },
      },
      {
        id: 'checkpoint_celestial',
        type: 'checkpoint_crystal',
        x: 6 * tileSize + 16,
        y: 17 * tileSize + 16,
        width: 28,
        height: 32,
        state: 'active',
      },
      {
        id: 'campfire_celestial',
        type: 'campfire',
        x: 7 * tileSize + 16,
        y: 15 * tileSize + 16,
        width: 28,
        height: 28,
        state: 'active',
      },
      // Celestial Starlight Fishing Spot
      {
        id: 'fish_spot_celestial',
        type: 'fishing_spot',
        spotName: 'Cosmic Starlight Nexus Pool',
        x: 19 * tileSize + 16,
        y: 26 * tileSize + 16,
        width: 36,
        height: 36,
        state: 'active',
      },
      {
        id: 'chest_celestial',
        type: 'chest',
        x: 32 * tileSize + 16,
        y: 6 * tileSize + 16,
        width: 28,
        height: 24,
        state: 'closed',
        loot: { gold: 2000, item: ITEMS.celestial_blade },
      },
    ];

    const npcs: NPCEntity[] = [];
    const enemies: EnemyEntity[] = [
      {
        id: 'guardian_1',
        type: 'celestial_guardian',
        name: 'Divine Seraph Guard',
        x: 22 * tileSize,
        y: 14 * tileSize,
        width: 34,
        height: 38,
        hp: 350,
        maxHp: 350,
        attack: 28,
        defense: 16,
        speed: 1.1,
        detectionRange: 180,
        attackRange: 38,
        attackCooldown: 1400,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        loot: { exp: 250, gold: 150 },
      },
      // Final Boss: Skyfall Celestial Core
      {
        id: 'boss_skyfall',
        type: 'boss_skyfall',
        name: 'The Fractured Sky Core',
        x: 38 * tileSize,
        y: 17 * tileSize,
        width: 52,
        height: 60,
        hp: 4200,
        maxHp: 4200,
        attack: 55,
        defense: 30,
        speed: 1.3,
        detectionRange: 260,
        attackRange: 60,
        attackCooldown: 1600,
        attackTimer: 0,
        state: 'idle',
        stateTimer: 0,
        facing: 'left',
        isBoss: true,
        bossPhase: 1,
        loot: { exp: 5000, gold: 5000, items: [{ item: ITEMS.celestial_blade, chance: 1.0 }] },
      },
    ];

    return {
      id: 'celestial_fortress',
      name: 'Celestial Fortress',
      music: 'celestial',
      width,
      height,
      tileSize,
      tiles,
      playerSpawn: { x: 4 * tileSize, y: 17 * tileSize },
      npcs,
      enemies,
      objects,
    };
  },
};
