export type GameStateScreen = 'menu' | 'intro' | 'playing' | 'gameover' | 'victory';

export type AreaId =
  | 'skyfall_village'
  | 'whispering_forest'
  | 'ancient_sanctum'
  | 'frozen_kingdom'
  | 'volcanic_wasteland'
  | 'sunken_city'
  | 'dark_swamp'
  | 'sky_islands'
  | 'shadow_castle'
  | 'celestial_fortress';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerAction = 'idle' | 'walk' | 'attack' | 'dodge' | 'skill' | 'ultimate' | 'hurt' | 'dead';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemCategory = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'quest' | 'fish' | 'fishing_rod' | 'bait';

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface FishBuff {
  id: string;
  fishId: string;
  name: string;
  rarity: FishRarity;
  icon: string;
  description: string;
  durationSeconds?: number;
  healHp?: number;
  restoreEnergy?: number;
  statBonus?: {
    attackPct?: number; // e.g. 0.05 = +5%
    maxHpPct?: number; // e.g. 0.05 = +5%
    defensePct?: number; // e.g. 0.08 = +8%
    critChanceBonus?: number; // e.g. 0.05 = +5%
    speedPct?: number; // e.g. 0.03 = +3%
    skillDamagePct?: number; // e.g. 0.05 = +5%
  };
}

export interface FishSpecies {
  id: string;
  name: string;
  rarity: FishRarity;
  area: AreaId;
  areaName: string;
  icon: string;
  value: number; // sell price in Gold
  description: string;
  buffText: string;
  sizeMin: number; // cm
  sizeMax: number; // cm
  weightMin: number; // kg
  weightMax: number; // kg
  difficulty?: number; // 1 (easy) to 5 (legendary fast)
  timeAvailability?: 'all' | 'day' | 'night';
  buff: FishBuff;
}

export type FishingRodId = 'rod_wooden' | 'rod_iron' | 'rod_hunter' | 'rod_crystal' | 'rod_celestial';

export interface FishingRod {
  id: FishingRodId;
  name: string;
  description: string;
  power: number; // 1 to 5
  rarityBonus: number; // multiplier for higher rarity
  barSizeMultiplier: number;
  icon: string;
  price: number;
}

export type FishingBaitId = 'bait_basic' | 'bait_worm' | 'bait_insect' | 'bait_magic' | 'bait_rare';

export interface FishingBait {
  id: FishingBaitId;
  name: string;
  description: string;
  rarityBonus: number;
  biteSpeedBonus: number;
  icon: string;
  price: number;
}

export interface FishCatchRecord {
  fishId: string;
  discovered: boolean;
  caughtCount: number;
  biggestSize: number;
  heaviestWeight: number;
  firstCaughtDate?: string;
}

export type FishingPhase = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught' | 'escaped';

export interface FishingEngineState {
  phase: FishingPhase;
  isAutoFishing: boolean;
  spotId: string | null;
  spotName?: string;
  equippedRod: FishingRodId;
  equippedBait: FishingBaitId | null;
  baitCount: number;
  targetFish: FishSpecies | null;
  reelProgress: number; // 0 to 100
  fishTension: number; // 0 to 100
  barPosition: number; // 0 to 100 (player green bar)
  fishPosition: number; // 0 to 100 (fish icon target)
  fishVelocity: number;
  barSize: number; // size in percentage e.g. 24
  biteTimer: number;
  catchAnimationTimer: number;
  lastCaughtFish: {
    species: FishSpecies;
    size: number;
    weight: number;
    isNewDiscovery: boolean;
  } | null;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string;
  value: number; // gold value
  upgradeLevel?: number; // 0 to 5
  requiresBossDefeated?: string; // lock requirement
  requiredBossId?: string;
  requiredBossName?: string;
  stats?: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    critChance?: number;
    skillDamage?: number;
    speedBonus?: number;
  };
  effect?: {
    healHp?: number;
    restoreEnergy?: number;
  };
  stackable?: boolean;
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export interface EquipmentState {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface PlayerStats {
  name: string; // 'Aeron'
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  baseAttack: number;
  baseDefense: number;
  critChance: number; // 0-1
  movementSpeed: number; // e.g. 135
  skillDamageMultiplier: number;
  gold: number;
  // Progress & Profile counters:
  enemiesDefeated: number;
  bossesDefeatedCount: number;
  questsCompletedCount: number;
  unlockedAreasCount: number;
  playTimeSeconds: number;
}

export interface QuestObjective {
  id: string;
  text: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  exp: number;
  gold: number;
  items?: { item: Item; quantity: number }[];
  unlockArea?: AreaId;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'hidden';
  status: 'not_started' | 'active' | 'completed';
  objectives: QuestObjective[];
  reward: QuestReward;
}

export interface DialogOption {
  text: string;
  nextDialogId?: string;
  action?: () => void;
  questAction?: {
    questId: string;
    action: 'start' | 'advance' | 'complete';
  };
}

export interface DialogNode {
  id: string;
  speaker: string;
  speakerRole?: string;
  portrait: 'player' | 'elder' | 'blacksmith' | 'shopkeeper' | 'guard' | 'mysterious' | 'system' | 'fisherman' | 'witch';
  text: string;
  options?: DialogOption[];
  onComplete?: () => void;
}

export type EnemyType = 
  | 'green_slime'
  | 'melee_goblin' 
  | 'ranged_archer'
  | 'ranged_spitter' 
  | 'fast_wolf' 
  | 'skeleton_warrior'
  | 'dark_mage'
  | 'ice_wolf'
  | 'frozen_knight'
  | 'tank_golem' 
  | 'magma_golem'
  | 'abyssal_creature'
  | 'swamp_beast'
  | 'flying_watcher' 
  | 'sky_harpy'
  | 'shadow_warrior'
  | 'celestial_guardian'
  | 'mini_boss_treant' 
  | 'boss_talos'
  | 'boss_frost_queen'
  | 'boss_magma_colossus'
  | 'boss_abyssal_guardian'
  | 'boss_swamp_witch'
  | 'boss_storm_guardian'
  | 'boss_lord_of_shadows'
  | 'boss_skyfall';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  attackCooldown: number;
  attackTimer: number;
  state: 'idle' | 'chase' | 'prepare_attack' | 'attack' | 'hurt' | 'dead';
  stateTimer: number;
  facing: Direction;
  isBoss?: boolean;
  bossPhase?: number;
  telegraphTimer?: number;
  telegraphArea?: { x: number; y: number; radius?: number; width?: number; height?: number; type: 'circle' | 'line' | 'cone' };
  loot: { exp: number; gold: number; items?: { item: Item; chance: number }[] };
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isEnemy: boolean;
  lifeTime: number;
  maxLifeTime: number;
  color: string;
  trailParticles?: boolean;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  value: number;
  color: string;
  isCritical?: boolean;
  opacity: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'rect' | 'circle' | 'spark' | 'smoke';
}

export interface InteractionPrompt {
  key: string;
  action: string;
  targetName?: string;
  icon?: string;
  isLocked?: boolean;
  lockReason?: string;
}

export interface InteractiveObject {
  id: string;
  type:
    | 'chest'
    | 'switch'
    | 'pressure_plate'
    | 'movable_block'
    | 'locked_door'
    | 'torch'
    | 'portal'
    | 'breakable_jar'
    | 'checkpoint_crystal'
    | 'fishing_spot'
    | 'barrel'
    | 'crate'
    | 'campfire'
    | 'sign'
    | 'bookshelf'
    | 'ancient_statue'
    | 'magic_shrine';
  x: number;
  y: number;
  width: number;
  height: number;
  state: 'closed' | 'open' | 'active' | 'inactive' | 'locked' | 'unlocked';
  requiresKeyId?: string;
  targetId?: string; // which door/mechanism this switch triggers
  loot?: { gold: number; item?: Item };
  targetArea?: AreaId;
  targetSpawn?: { x: number; y: number };
  isLocked?: boolean;
  requiredBossId?: string;
  requiredBossName?: string;
  lockReason?: string;
  customText?: string;
  spotName?: string;
}

export interface NPCEntity {
  id: string;
  name: string;
  role: string;
  shopRole?: 'merchant' | 'blacksmith' | 'armorer' | 'mage' | 'traveler' | 'healer' | 'fisherman';
  x: number;
  y: number;
  width: number;
  height: number;
  facing: Direction;
  portrait: 'player' | 'elder' | 'blacksmith' | 'shopkeeper' | 'guard' | 'mysterious' | 'system' | 'fisherman' | 'witch';
  initialDialogId: string;
  questIndicator?: 'available' | 'in_progress' | 'complete' | null;
}

export interface PortalConfirmInfo {
  targetAreaId: AreaId;
  targetAreaName: string;
  isLocked?: boolean;
  lockReason?: string;
  requiredBossName?: string;
}

export interface GameSettings {
  masterVolume?: number; // 0 - 1
  musicVolume: number; // 0 - 1
  sfxVolume: number; // 0 - 1
  screenShake: boolean;
  textSpeed: 'slow' | 'normal' | 'fast';
  showFps: boolean;
  touchControls: boolean;
  showKeyboardGuide: boolean;
  particleQuality?: 'low' | 'medium' | 'high';
  graphicsQuality?: 'normal' | 'high';
  atmosphere?: 'day' | 'sunset' | 'night' | 'dynamic';
}

export interface SaveGameData {
  version: number;
  timestamp: number;
  currentArea: AreaId;
  playerPos: { x: number; y: number };
  playerStats: PlayerStats;
  inventory: InventorySlot[];
  equipment: EquipmentState;
  quests: Quest[];
  unlockedAreas: AreaId[];
  checkpointArea?: AreaId;
  checkpointSpawn?: { x: number; y: number };
  openedChests: string[];
  solvedPuzzles: string[];
  defeatedBosses: string[];
  fishCollection?: Record<string, FishCatchRecord>;
  activeFishBuffs?: string[];
  equippedRod?: FishingRodId;
  fishingSpotsDiscovered?: string[];
  totalFishCaught?: number;
}
