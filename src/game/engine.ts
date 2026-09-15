import {
  AreaId,
  Direction,
  PlayerAction,
  PlayerStats,
  InventorySlot,
  EquipmentState,
  Quest,
  EnemyEntity,
  Projectile,
  DamageNumber,
  Particle,
  InteractiveObject,
  NPCEntity,
  SaveGameData,
  InteractionPrompt,
  PortalConfirmInfo,
  FishingRodId,
  FishingBaitId,
  FishSpecies,
  FishCatchRecord,
  FishingEngineState,
  FishBuff,
  Item,
} from '../types';
import { MAPS, MapData } from './mapData';
import { PixelRenderer } from './sprites';
import { sound } from '../services/audio';
import { ITEMS } from './itemsData';
import { INITIAL_QUESTS } from './questData';
import {
  ALL_FISH,
  FISHING_RODS,
  FISHING_BAITS,
  pickRandomFish,
  generateFishMeasurements,
  fishToInventoryItem,
} from './fishingData';

export const AREA_NAMES: Record<AreaId, string> = {
  skyfall_village: 'Skyfall Village',
  whispering_forest: 'Whispering Forest',
  ancient_sanctum: 'Ancient Sanctum',
  frozen_kingdom: 'The Frozen Kingdom',
  volcanic_wasteland: 'Volcanic Wasteland',
  sunken_city: 'Sunken City',
  dark_swamp: 'The Dark Swamp',
  sky_islands: 'Sky Islands',
  shadow_castle: 'Shadow Castle',
  celestial_fortress: 'Celestial Fortress',
};

export const FORWARD_PORTAL_REQUIREMENTS: Record<
  string,
  { requiredBossId: string; requiredBossName: string; requiredAreaName: string }
> = {
  portal_to_dungeon: {
    requiredBossId: 'mini_boss_treant',
    requiredBossName: 'Ancient Briar Treant',
    requiredAreaName: 'Whispering Forest',
  },
  portal_to_sanctum: {
    requiredBossId: 'mini_boss_treant',
    requiredBossName: 'Ancient Briar Treant',
    requiredAreaName: 'Whispering Forest',
  },
  portal_to_frozen: {
    requiredBossId: 'boss_talos',
    requiredBossName: 'Sky Guardian Talos',
    requiredAreaName: 'Ancient Sanctum',
  },
  portal_to_volcano: {
    requiredBossId: 'boss_frost_queen',
    requiredBossName: 'Frost Queen Lyanna',
    requiredAreaName: 'The Frozen Kingdom',
  },
  portal_to_sunken: {
    requiredBossId: 'boss_magma_colossus',
    requiredBossName: 'Magma Colossus Ignis',
    requiredAreaName: 'Volcanic Wasteland',
  },
  portal_to_swamp: {
    requiredBossId: 'boss_magma_colossus',
    requiredBossName: 'Magma Colossus Ignis',
    requiredAreaName: 'Sunken City',
  },
  portal_to_sky: {
    requiredBossId: 'boss_swamp_witch',
    requiredBossName: 'Swamp Necromancer',
    requiredAreaName: 'The Dark Swamp',
  },
  portal_to_castle: {
    requiredBossId: 'boss_storm_guardian',
    requiredBossName: 'Storm Guardian Zephyr',
    requiredAreaName: 'Sky Islands',
  },
  portal_to_celestial: {
    requiredBossId: 'boss_lord_of_shadows',
    requiredBossName: 'Malakor, Lord of Shadows',
    requiredAreaName: 'Shadow Castle',
  },
};

export interface ActiveFishBuff {
  fishId: string;
  name: string;
  icon: string;
  buffText: string;
  effect?: FishBuff['statBonus'];
  remainingSeconds: number;
}

export interface EngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onInventoryUpdate: (inv: InventorySlot[]) => void;
  onEquipmentUpdate: (eq: EquipmentState) => void;
  onQuestsUpdate: (quests: Quest[]) => void;
  onAreaChange: (areaName: string) => void;
  onDialogueTrigger: (dialogId: string) => void;
  onShopTrigger: (shopkeeper: NPCEntity) => void;
  onBossStart: (boss: EnemyEntity) => void;
  onBossEnd: () => void;
  onGameOver: () => void;
  onVictory: () => void;
  onMessage: (msg: string) => void;
  onPromptChange?: (prompt: InteractionPrompt | null) => void;
  onPortalWarp?: (targetAreaName: string, isWarping: boolean) => void;
  onPortalConfirmTrigger?: (info: PortalConfirmInfo) => void;
  onFishingUpdate?: (state: FishingEngineState | null) => void;
  onFishCaught?: (fish: FishSpecies, size: number, weight: number, isNewRecord: boolean) => void;
  onFishCollectionUpdate?: (collection: Record<string, FishCatchRecord>) => void;
  onFishBuffsUpdate?: (buffs: ActiveFishBuff[]) => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;
  private animId: number = 0;
  private lastTime: number = 0;
  private callbacks: EngineCallbacks;

  // World & Map
  public currentAreaId: AreaId = 'skyfall_village';
  public currentMap!: MapData;

  // Player state
  public px: number = 0;
  public py: number = 0;
  public playerAction: PlayerAction = 'idle';
  public playerFacing: Direction = 'down';
  public playerFrame: number = 0;
  public isInvincible: boolean = false;
  public invincibleTimer: number = 0;
  public isHurt: boolean = false;
  public hurtTimer: number = 0;

  // Combat Timers & Combos
  public comboStep: number = 1;
  public comboTimer: number = 0;
  public attackTimer: number = 0;
  public dodgeTimer: number = 0;
  public dodgeCooldown: number = 0;
  public skillTimer: number = 0;
  public skillCooldown: number = 0;
  public ultTimer: number = 0;
  public ultCooldown: number = 0;

  // Active Slash Animation
  public activeSlash: { progress: number; comboStep: number; facing: Direction } | null = null;
  public activeCyclone: { timer: number; maxTimer: number; angle: number } | null = null;
  public activeUlt: { timer: number; maxTimer: number } | null = null;
  public activeSkySlash: { x: number; y: number; facing: Direction; timer: number; maxTimer: number } | null = null;
  public activeWindDash: { x: number; y: number; facing: Direction; timer: number; maxTimer: number } | null = null;
  public activeGroundBreak: { x: number; y: number; timer: number; maxTimer: number } | null = null;

  // Camera & Visuals
  public camX: number = 0;
  public camY: number = 0;
  public screenShake: number = 0;
  public screenShakeEnabled: boolean = true;

  // Entities & FX
  public enemies: EnemyEntity[] = [];
  public npcs: NPCEntity[] = [];
  public objects: InteractiveObject[] = [];
  public projectiles: Projectile[] = [];
  public damageNumbers: DamageNumber[] = [];
  public particles: Particle[] = [];

  // Progression & Save State
  public stats: PlayerStats = {
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
  public inventory: InventorySlot[] = [
    { item: ITEMS.rusty_sword, quantity: 1 },
    { item: ITEMS.apprentice_tunic, quantity: 1 },
    { item: ITEMS.copper_ring, quantity: 1 },
    { item: ITEMS.health_potion, quantity: 4 },
    { item: ITEMS.energy_elixir, quantity: 2 },
    { item: ITEMS.rod_wooden, quantity: 1 },
    { item: ITEMS.bait_basic, quantity: 10 },
  ];
  public equipment: EquipmentState = {
    weapon: ITEMS.rusty_sword,
    armor: ITEMS.apprentice_tunic,
    accessory: ITEMS.copper_ring,
  };
  public quests: Quest[] = JSON.parse(JSON.stringify(INITIAL_QUESTS));
  public openedChests: Set<string> = new Set();
  public solvedPuzzles: Set<string> = new Set();
  public defeatedBosses: Set<string> = new Set();
  public unlockedAreas: Set<AreaId> = new Set(['skyfall_village']);
  public checkpointArea: AreaId = 'skyfall_village';
  public checkpointSpawn: { x: number; y: number } = { x: 13 * 32, y: 15 * 32 };
  private weatherTimer: number = 0;

  // Active Boss
  public activeBoss: EnemyEntity | null = null;

  // Input state
  private keys: Record<string, boolean> = {};
  public moveInput: { x: number; y: number } = { x: 0, y: 0 };
  public isPaused: boolean = false;

  // ==========================================
  // FISHING SYSTEM STATE
  // ==========================================
  public fishingState: FishingEngineState | null = null;
  public fishCollection: Record<string, FishCatchRecord> = {};
  public activeFishBuffs: ActiveFishBuff[] = [];
  public equippedRod: FishingRodId = 'rod_wooden';
  public equippedBait: FishingBaitId | null = 'bait_basic';
  public isReelingHeld: boolean = false;
  public totalFishCaught: number = 0;
  public autoFishingTimer: number = 0;
  private currentFishingSpotObj: InteractiveObject | null = null;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
    this.initFishCollection();
  }

  private initFishCollection() {
    for (const fish of ALL_FISH) {
      this.fishCollection[fish.id] = {
        fishId: fish.id,
        discovered: false,
        caughtCount: 0,
        biggestSize: 0,
        heaviestWeight: 0,
      };
    }
  }

  public init(canvas: HTMLCanvasElement, savedData?: SaveGameData | null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }

    if (savedData) {
      this.loadFromSave(savedData);
    } else {
      this.currentAreaId = 'skyfall_village';
      this.stats = {
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
      this.inventory = [
        { item: ITEMS.rusty_sword, quantity: 1 },
        { item: ITEMS.apprentice_tunic, quantity: 1 },
        { item: ITEMS.copper_ring, quantity: 1 },
        { item: ITEMS.health_potion, quantity: 4 },
        { item: ITEMS.energy_elixir, quantity: 2 },
        { item: ITEMS.rod_wooden, quantity: 1 },
        { item: ITEMS.bait_basic, quantity: 10 },
      ];
      this.equipment = {
        weapon: ITEMS.rusty_sword,
        armor: ITEMS.apprentice_tunic,
        accessory: ITEMS.copper_ring,
      };
      this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
      this.recalculateDerivedStats();
      this.loadArea(this.currentAreaId);
      this.notifyAll();
    }

    this.lastTime = performance.now();
    this.startLoop();
  }

  public loadFromSave(data: SaveGameData) {
    this.currentAreaId = data.currentArea || 'skyfall_village';
    this.stats = { ...this.stats, ...(data.playerStats || {}) };
    this.inventory = Array.isArray(data.inventory) ? [...data.inventory] : [...this.inventory];
    this.equipment = { ...this.equipment, ...(data.equipment || {}) };
    this.quests = Array.isArray(data.quests) && data.quests.length > 0
      ? [...data.quests]
      : JSON.parse(JSON.stringify(INITIAL_QUESTS));
    this.openedChests = new Set(data.openedChests || []);
    this.solvedPuzzles = new Set(data.solvedPuzzles || []);
    this.defeatedBosses = new Set(data.defeatedBosses || []);
    this.unlockedAreas = new Set(data.unlockedAreas || [data.currentArea || 'skyfall_village']);
    if (data.checkpointArea) {
      this.checkpointArea = data.checkpointArea;
    }
    if (data.checkpointSpawn) {
      this.checkpointSpawn = data.checkpointSpawn;
    }
    if (data.fishCollection) {
      this.fishCollection = { ...this.fishCollection, ...data.fishCollection };
    }
    if (data.equippedRod) {
      this.equippedRod = data.equippedRod;
    }
    if (data.totalFishCaught) {
      this.totalFishCaught = data.totalFishCaught;
    }

    this.loadArea(this.currentAreaId, data.playerPos);
    this.recalculateDerivedStats();
    this.notifyAll();
  }

  public getSaveData(): SaveGameData {
    return {
      version: 2,
      timestamp: Date.now(),
      currentArea: this.currentAreaId,
      playerPos: { x: this.px, y: this.py },
      playerStats: { ...this.stats },
      inventory: [...this.inventory],
      equipment: { ...this.equipment },
      quests: [...this.quests],
      unlockedAreas: Array.from(this.unlockedAreas),
      checkpointArea: this.checkpointArea,
      checkpointSpawn: this.checkpointSpawn,
      openedChests: Array.from(this.openedChests),
      solvedPuzzles: Array.from(this.solvedPuzzles),
      defeatedBosses: Array.from(this.defeatedBosses),
      fishCollection: { ...this.fishCollection },
      equippedRod: this.equippedRod,
      totalFishCaught: this.totalFishCaught,
    };
  }

  public loadArea(areaId: AreaId, spawnPos?: { x: number; y: number }) {
    this.clearInputs();
    this.cancelFishing();
    this.currentAreaId = areaId;
    this.unlockedAreas.add(areaId);
    this.currentMap = MAPS[areaId]();

    this.px = spawnPos ? spawnPos.x : this.currentMap.playerSpawn.x;
    this.py = spawnPos ? spawnPos.y : this.currentMap.playerSpawn.y;

    // Filter already opened chests / defeated enemies / solved puzzles & apply portal lock rules
    this.objects = this.currentMap.objects.map((obj) => {
      let state = obj.state;
      if (this.openedChests.has(obj.id)) {
        state = 'open';
      }
      if (this.solvedPuzzles.has(obj.id)) {
        state = 'active';
      }
      const newObj: InteractiveObject = { ...obj, state };
      if (newObj.type === 'portal') {
        const req = FORWARD_PORTAL_REQUIREMENTS[newObj.id];
        if (req && req.requiredBossId) {
          const isDefeated = this.defeatedBosses.has(req.requiredBossId);
          newObj.isLocked = !isDefeated;
          newObj.requiredBossName = req.requiredBossName;
          newObj.lockReason = `Defeat ${req.requiredBossName} in ${req.requiredAreaName} first!`;
        } else {
          newObj.isLocked = false;
        }
      }
      return newObj;
    });

    this.enemies = this.currentMap.enemies.filter(
      (e) => !this.defeatedBosses.has(e.id)
    );
    this.npcs = [...this.currentMap.npcs];

    this.projectiles = [];
    this.damageNumbers = [];
    this.particles = [];
    this.activeBoss = null;

    // Check quest NPC indicators
    this.updateNPCQuestIndicators();

    // Play area BGM
    sound.playMusic(this.currentMap.music);
    this.callbacks.onAreaChange(this.currentMap.name);
  }

  public autoSave() {
    try {
      const data = this.getSaveData();
      localStorage.setItem('tales_of_skyfall_save_1', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to auto-save', e);
    }
  }

  private notifyAll() {
    this.callbacks.onStatsUpdate({ ...this.stats });
    this.callbacks.onInventoryUpdate([...this.inventory]);
    this.callbacks.onEquipmentUpdate({ ...this.equipment });
    this.callbacks.onQuestsUpdate([...this.quests]);
    if (this.callbacks.onFishCollectionUpdate) {
      this.callbacks.onFishCollectionUpdate({ ...this.fishCollection });
    }
    if (this.callbacks.onFishBuffsUpdate) {
      this.callbacks.onFishBuffsUpdate([...this.activeFishBuffs]);
    }
  }

  public recalculateDerivedStats() {
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusHp = 0;
    let bonusCrit = 0;
    let bonusSkillDmg = 0;
    let bonusSpeed = 0;

    const gears = [this.equipment.weapon, this.equipment.armor, this.equipment.accessory];
    for (const g of gears) {
      if (g && g.stats) {
        if (g.stats.attack) bonusAtk += g.stats.attack;
        if (g.stats.defense) bonusDef += g.stats.defense;
        if (g.stats.maxHp) bonusHp += g.stats.maxHp;
        if (g.stats.critChance) bonusCrit += g.stats.critChance;
        if (g.stats.skillDamage) bonusSkillDmg += g.stats.skillDamage;
        if (g.stats.speedBonus) bonusSpeed += g.stats.speedBonus;
      }
    }

    // Add Active Fish Buffs bonuses
    for (const buff of this.activeFishBuffs) {
      if (!buff.effect) continue;
      if (buff.effect.attackPct) bonusAtk += (10 + this.stats.level * 4) * buff.effect.attackPct;
      if (buff.effect.defensePct) bonusDef += (2 + this.stats.level * 2) * buff.effect.defensePct;
      if (buff.effect.critChanceBonus) bonusCrit += buff.effect.critChanceBonus;
      if (buff.effect.speedPct) bonusSpeed += 135 * buff.effect.speedPct;
      if (buff.effect.skillDamagePct) bonusSkillDmg += 100 * buff.effect.skillDamagePct;
      if (buff.effect.maxHpPct) bonusHp += (100 + this.stats.level * 20) * buff.effect.maxHpPct;
    }

    const baseMaxHp = 100 + this.stats.level * 20;
    this.stats.maxHp = baseMaxHp + bonusHp;
    this.stats.hp = Math.min(this.stats.hp, this.stats.maxHp);
    this.stats.baseAttack = 10 + this.stats.level * 4 + bonusAtk;
    this.stats.baseDefense = 2 + this.stats.level * 2 + bonusDef;
    this.stats.critChance = 0.05 + bonusCrit;
    this.stats.skillDamageMultiplier = 1.0 + bonusSkillDmg / 100;
    this.stats.movementSpeed = 135 + bonusSpeed;
    this.stats.unlockedAreasCount = this.unlockedAreas.size;

    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  // --- LOOP & UPDATE ---

  private startLoop() {
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (!this.isPaused) {
        this.update(dt);
      }
      this.render();

      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  public handleKeyDown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    // Direct Fishing Reeling Key [Space] or [E]
    if (this.fishingState && this.fishingState.phase === 'reeling') {
      if (key === ' ' || key === 'e') {
        this.isReelingHeld = true;
      }
    }

    // Direct Fishing Hook Key during bite
    if (this.fishingState && this.fishingState.phase === 'bite') {
      if (key === ' ' || key === 'e') {
        this.hookFish();
        return;
      }
    }

    // Interact [E]
    if (key === 'e') {
      this.handleInteract();
    }
    // Attack [J]
    if (key === 'j') {
      this.handleAttack();
    }
    // Dodge [K]
    if (key === 'k') {
      this.handleDodge();
    }
    // Skill [L]
    if (key === 'l') {
      this.handleSkill();
    }
    // Ultimate [U]
    if (key === 'u') {
      this.handleUltimate();
    }
    // Quick Slots 1-4
    if (['1', '2', '3', '4'].includes(key)) {
      this.useQuickSlot(parseInt(key));
    }
  }

  public handleKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    this.keys[key] = false;

    if (this.fishingState && (key === ' ' || key === 'e')) {
      this.isReelingHeld = false;
    }
  }

  public clearInputs() {
    this.keys = {};
    this.moveInput = { x: 0, y: 0 };
    this.isReelingHeld = false;
  }

  // --- MAIN UPDATE TICK ---

  private update(dt: number) {
    // 1. Play time tick
    this.stats.playTimeSeconds += dt;

    // 2. Update Fish Buff Timers
    if (this.activeFishBuffs.length > 0) {
      let expired = false;
      for (let i = this.activeFishBuffs.length - 1; i >= 0; i--) {
        this.activeFishBuffs[i].remainingSeconds -= dt;
        if (this.activeFishBuffs[i].remainingSeconds <= 0) {
          this.callbacks.onMessage(`Fish buff expired: ${this.activeFishBuffs[i].name}`);
          this.activeFishBuffs.splice(i, 1);
          expired = true;
        }
      }
      if (expired) {
        this.recalculateDerivedStats();
        if (this.callbacks.onFishBuffsUpdate) {
          this.callbacks.onFishBuffsUpdate([...this.activeFishBuffs]);
        }
      }
    }

    // 3. Update Fishing Mini-Game & Auto-Fishing
    if (this.fishingState) {
      this.updateFishing(dt);
    }

    // 4. Update Player Cooldowns & Action State
    this.updateTimers(dt);

    // 5. Update Player Movement (if not locked in fishing or attack)
    if (!this.fishingState) {
      this.updatePlayer(dt);
    }

    // 6. Update Entities (Enemies, Bosses, NPCs)
    this.updateEnemies(dt);

    // 7. Update Projectiles & FX
    this.updateProjectiles(dt);
    this.updateSkills(dt);
    this.updateFX(dt);

    // 8. Update Ambient Weather Particles
    this.updateAmbientWeather(dt);

    // 9. Update Puzzles (Pressure plates, blocks)
    this.updatePuzzles();

    // 10. Update Camera to smoothly track player
    if (this.canvas) {
      const targetCamX = this.px - this.canvas.width / 2;
      const targetCamY = this.py - this.canvas.height / 2;
      const mapPixelW = this.currentMap.width * this.currentMap.tileSize;
      const mapPixelH = this.currentMap.height * this.currentMap.tileSize;

      this.camX += (targetCamX - this.camX) * 0.12;
      this.camY += (targetCamY - this.camY) * 0.12;

      this.camX = Math.max(0, Math.min(mapPixelW - this.canvas.width, this.camX));
      this.camY = Math.max(0, Math.min(mapPixelH - this.canvas.height, this.camY));
    }

    // 11. Update Contextual Interaction Prompt
    this.updateInteractionPrompt();
  }

  private updateTimers(dt: number) {
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.isInvincible = false;
    }
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) this.isHurt = false;
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboStep = 1;
    }
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
    if (this.skillCooldown > 0) this.skillCooldown -= dt;
    if (this.ultCooldown > 0) this.ultCooldown -= dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 20);
    }

    // Natural energy regeneration (4 per second)
    if (this.stats.energy < this.stats.maxEnergy && this.playerAction !== 'dead') {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + dt * 4);
      this.callbacks.onStatsUpdate({ ...this.stats });
    }

    // Animation frame cycling
    this.playerFrame += dt * 8;
  }

  // --- INTERACTION PROMPTS ---

  private lastPromptKey: string = '';
  public activePrompt: InteractionPrompt | null = null;

  public updateInteractionPrompt() {
    if (this.fishingState) {
      this.activePrompt = null;
      if (this.callbacks.onPromptChange) this.callbacks.onPromptChange(null);
      return;
    }

    let bestPrompt: InteractionPrompt | null = null;
    let closestDist = 54;

    // 1. Check nearby NPCs
    for (const npc of this.npcs) {
      const dist = Math.hypot(npc.x - this.px, npc.y - this.py);
      if (dist < closestDist) {
        closestDist = dist;
        bestPrompt = {
          key: 'E',
          action: npc.shopRole === 'fisherman' ? 'ANGLER SHOP' : npc.shopRole === 'merchant' || npc.shopRole === 'blacksmith' ? 'TRADE' : 'TALK',
          targetName: npc.name,
          icon: npc.shopRole === 'fisherman' ? '🎣' : npc.shopRole ? '🛒' : '💬',
        };
      }
    }

    // 2. Check nearby Objects
    for (const obj of this.objects) {
      const dist = Math.hypot(obj.x - this.px, obj.y - this.py);
      if (dist < closestDist) {
        closestDist = dist;
        if (obj.type === 'fishing_spot') {
          bestPrompt = {
            key: 'E',
            action: 'START FISHING',
            targetName: obj.spotName || 'Quiet Waters',
            icon: '🎣',
          };
        } else if (obj.type === 'campfire') {
          bestPrompt = {
            key: 'E',
            action: 'REST & HEAL',
            targetName: 'Cozy Campfire',
            icon: '🔥',
          };
        } else if (obj.type === 'portal') {
          const targetName = obj.targetArea ? (AREA_NAMES[obj.targetArea] || obj.targetArea) : 'Next Realm';
          if (obj.isLocked) {
            bestPrompt = {
              key: 'E',
              action: 'LOCKED PORTAL',
              targetName: obj.requiredBossName ? `Defeat ${obj.requiredBossName}` : 'Sealed by Boss',
              icon: '🔒',
              isLocked: true,
              lockReason: obj.lockReason,
            };
          } else {
            bestPrompt = {
              key: 'E',
              action: 'ENTER PORTAL',
              targetName: targetName,
              icon: '🌀',
              isLocked: false,
            };
          }
        } else if (obj.type === 'chest' && obj.state === 'closed') {
          bestPrompt = {
            key: 'E',
            action: 'OPEN CHEST',
            targetName: 'Treasure Chest',
            icon: '📦',
          };
        } else if (obj.type === 'checkpoint_crystal') {
          bestPrompt = {
            key: 'E',
            action: 'REST & SAVE',
            targetName: 'Checkpoint Crystal',
            icon: '💠',
          };
        } else if (obj.type === 'sign') {
          bestPrompt = {
            key: 'E',
            action: 'READ NOTICE',
            targetName: 'Wooden Sign',
            icon: '📜',
          };
        } else if (obj.type === 'bookshelf') {
          bestPrompt = {
            key: 'E',
            action: 'READ ARCHIVE',
            targetName: 'Ancient Grimoire',
            icon: '📖',
          };
        } else if (obj.type === 'ancient_statue') {
          bestPrompt = {
            key: 'E',
            action: 'EXAMINE STATUE',
            targetName: 'Sky Knight Monument',
            icon: '🗿',
          };
        } else if (obj.type === 'magic_shrine') {
          bestPrompt = {
            key: 'E',
            action: 'PRAY AT SHRINE',
            targetName: 'Aether Shrine',
            icon: '✨',
          };
        }
      }
    }

    const keyHash = bestPrompt
      ? `${bestPrompt.key}:${bestPrompt.action}:${bestPrompt.targetName || ''}:${bestPrompt.isLocked}`
      : '';
    if (keyHash !== this.lastPromptKey) {
      this.lastPromptKey = keyHash;
      this.activePrompt = bestPrompt;
      if (this.callbacks.onPromptChange) {
        this.callbacks.onPromptChange(bestPrompt);
      }
    }
  }

  // --- PLAYER CONTROLLER ---

  private updatePlayer(dt: number) {
    if (this.playerAction === 'dead') return;

    // If attacking, locked in place briefly
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.playerAction = 'idle';
      }
      return;
    }
    if (this.activeUlt) return;

    // Dodge rolling
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      const dodgeSpeed = 220;
      let dx = 0;
      let dy = 0;
      if (this.playerFacing === 'right') dx = 1;
      else if (this.playerFacing === 'left') dx = -1;
      else if (this.playerFacing === 'up') dy = -1;
      else if (this.playerFacing === 'down') dy = 1;

      this.moveEntity(this, dx * dodgeSpeed * dt, dy * dodgeSpeed * dt);
      if (this.dodgeTimer <= 0) {
        this.playerAction = 'idle';
      }
      return;
    }

    // Regular movement
    let mx = this.moveInput.x;
    let my = this.moveInput.y;
    if (this.keys['a'] || this.keys['arrowleft']) mx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) mx += 1;
    if (this.keys['w'] || this.keys['arrowup']) my -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) my += 1;

    if (Math.abs(mx) < 0.05) mx = 0;
    if (Math.abs(my) < 0.05) my = 0;

    if (mx !== 0 || my !== 0) {
      const mag = Math.hypot(mx, my);
      const nx = mx / mag;
      const ny = my / mag;

      const speed = this.stats.movementSpeed;
      this.moveEntity(this, nx * speed * dt, ny * speed * dt);
      this.playerAction = 'walk';

      if (Math.abs(nx) > Math.abs(ny)) {
        this.playerFacing = nx > 0 ? 'right' : 'left';
      } else {
        this.playerFacing = ny > 0 ? 'down' : 'up';
      }
    } else {
      if (this.playerAction === 'walk') {
        this.playerAction = 'idle';
      }
    }
  }

  private moveEntity(entity: { px: number; py: number }, dx: number, dy: number) {
    const newX = entity.px + dx;
    const newY = entity.py + dy;
    const radius = 10;

    if (!this.checkTileCollision(newX, entity.py, radius) && !this.checkObjectCollision(newX, entity.py, radius)) {
      entity.px = newX;
    }
    if (!this.checkTileCollision(entity.px, newY, radius) && !this.checkObjectCollision(entity.px, newY, radius)) {
      entity.py = newY;
    }
  }

  private checkTileCollision(x: number, y: number, radius: number): boolean {
    const ts = this.currentMap.tileSize;
    const minCol = Math.floor((x - radius) / ts);
    const maxCol = Math.floor((x + radius) / ts);
    const minRow = Math.floor((y - radius) / ts);
    const maxRow = Math.floor((y + radius) / ts);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r < 0 || r >= this.currentMap.height || c < 0 || c >= this.currentMap.width) {
          return true;
        }
        const tile = this.currentMap.tiles[r][c];
        if (tile === 1 || tile === 3) {
          return true;
        }
      }
    }
    return false;
  }

  private checkObjectCollision(x: number, y: number, radius: number): boolean {
    for (const obj of this.objects) {
      if (obj.type === 'locked_door' && obj.state !== 'open' && obj.state !== 'unlocked') {
        const left = obj.x - obj.width / 2;
        const right = obj.x + obj.width / 2;
        const top = obj.y - obj.height / 2;
        const bottom = obj.y + obj.height / 2;
        if (x + radius > left && x - radius < right && y + radius > top && y - radius < bottom) {
          return true;
        }
      }
    }
    return false;
  }

  // --- COMBAT ACTIONS ---

  public handleAttack() {
    if (this.playerAction === 'dead' || this.attackTimer > 0 || this.dodgeTimer > 0 || this.activeUlt) return;

    this.playerAction = 'attack';
    this.attackTimer = 0.22;
    sound.playAttack(this.comboStep);

    this.activeSlash = { progress: 0, comboStep: this.comboStep, facing: this.playerFacing };
    if (this.comboStep === 3) {
      this.activeSkySlash = { x: this.px, y: this.py, facing: this.playerFacing, timer: 0.32, maxTimer: 0.32 };
    }

    let stepX = 0;
    let stepY = 0;
    if (this.playerFacing === 'right') stepX = 6;
    else if (this.playerFacing === 'left') stepX = -6;
    else if (this.playerFacing === 'up') stepY = -6;
    else if (this.playerFacing === 'down') stepY = 6;
    this.moveEntity(this, stepX, stepY);

    const reach = 42;
    const hitX = this.px + stepX * 4;
    const hitY = this.py + stepY * 4;

    const multiplier = this.comboStep === 1 ? 1.0 : this.comboStep === 2 ? 1.3 : 1.8;
    const isCrit = Math.random() < this.stats.critChance;
    const rawDamage = Math.round(this.stats.baseAttack * multiplier * (isCrit ? 1.8 : 1.0));

    // Damage enemies
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      const dist = Math.hypot(enemy.x - hitX, enemy.y - hitY);
      if (dist < reach + enemy.width / 2) {
        this.hitEnemy(enemy, rawDamage, isCrit, stepX, stepY);
      }
    }

    // Damage breakables (jars, barrels, crates)
    for (const obj of this.objects) {
      if ((obj.type === 'breakable_jar' || obj.type === 'barrel' || obj.type === 'crate') && obj.state !== 'open') {
        const dist = Math.hypot(obj.x - hitX, obj.y - hitY);
        if (dist < reach + 14) {
          obj.state = 'open';
          sound.playHit();
          this.spawnSparks(obj.x, obj.y, obj.type === 'breakable_jar' ? '#b45309' : '#78350f', 12);
          if (obj.loot) {
            this.giveLoot(obj.loot);
          }
        }
      }
    }

    // Advance combo
    this.comboStep = this.comboStep < 3 ? this.comboStep + 1 : 1;
    this.comboTimer = 0.8;
  }

  public handleDodge() {
    if (this.playerAction === 'dead' || this.dodgeCooldown > 0 || this.stats.energy < 15) return;

    this.stats.energy -= 15;
    this.dodgeTimer = 0.22;
    this.dodgeCooldown = 0.45;
    this.isInvincible = true;
    this.invincibleTimer = 0.25;
    sound.playDodge();
    this.spawnSparks(this.px, this.py, '#bae6fd', 8);
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  public handleSkill() {
    if (this.playerAction === 'dead' || this.skillCooldown > 0 || this.stats.energy < 25) return;

    this.stats.energy -= 25;
    this.skillCooldown = 3.5;
    sound.playSkill();

    this.activeCyclone = { timer: 0.6, maxTimer: 0.6, angle: 0 };
    if (this.screenShakeEnabled) this.screenShake = 7;

    // Damage all enemies in 90px radius
    const skillDmg = Math.round(this.stats.baseAttack * 2.2 * this.stats.skillDamageMultiplier);
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      const dist = Math.hypot(enemy.x - this.px, enemy.y - this.py);
      if (dist < 90) {
        this.hitEnemy(enemy, skillDmg, true, (enemy.x - this.px) * 0.1, (enemy.y - this.py) * 0.1);
      }
    }

    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  public handleUltimate() {
    if (this.playerAction === 'dead' || this.ultCooldown > 0 || this.stats.energy < 50) return;

    this.stats.energy -= 50;
    this.ultCooldown = 12.0;
    sound.playUltimate();

    this.activeUlt = { timer: 1.2, maxTimer: 1.2 };
    if (this.screenShakeEnabled) this.screenShake = 14;

    const ultDmg = Math.round(this.stats.baseAttack * 4.5 * this.stats.skillDamageMultiplier);
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      const dist = Math.hypot(enemy.x - this.px, enemy.y - this.py);
      if (dist < 160) {
        this.hitEnemy(enemy, ultDmg, true, (enemy.x - this.px) * 0.2, (enemy.y - this.py) * 0.2);
      }
    }

    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  // --- INTERACTION HANDLER ---

  public handleInteract() {
    if (this.playerAction === 'dead') return;

    // 1. Check NPC interaction
    for (const npc of this.npcs) {
      const dist = Math.hypot(npc.x - this.px, npc.y - this.py);
      if (dist < 46) {
        sound.playButtonClick();
        if (npc.shopRole === 'merchant' || npc.shopRole === 'blacksmith' || npc.shopRole === 'fisherman') {
          this.callbacks.onShopTrigger(npc);
          return;
        }
        this.callbacks.onDialogueTrigger(npc.initialDialogId);
        return;
      }
    }

    // 2. Check Interactive Objects
    for (const obj of this.objects) {
      const dist = Math.hypot(obj.x - this.px, obj.y - this.py);
      if (dist < 50) {
        // Fishing Spot
        if (obj.type === 'fishing_spot') {
          this.startFishing(obj);
          return;
        }

        // Rest Campfire
        if (obj.type === 'campfire') {
          sound.playLevelUp();
          this.stats.hp = this.stats.maxHp;
          this.stats.energy = this.stats.maxEnergy;
          this.spawnSparks(obj.x, obj.y, '#f97316', 25);
          this.damageNumbers.push({
            id: Math.random().toString(),
            x: this.px,
            y: this.py - 24,
            value: this.stats.maxHp,
            color: '#34d399',
            isCritical: true,
            opacity: 1,
            vy: -35,
          });
          this.callbacks.onStatsUpdate({ ...this.stats });
          this.callbacks.onMessage(obj.customText || 'Resting by the warm campfire restored full HP & Energy!');
          return;
        }

        // Chest
        if (obj.type === 'chest' && obj.state === 'closed') {
          obj.state = 'open';
          this.openedChests.add(obj.id);
          sound.playChestOpen();
          this.spawnSparks(obj.x, obj.y, '#f59e0b', 20);
          if (obj.loot) this.giveLoot(obj.loot);
          return;
        }

        // Checkpoint Crystal
        if (obj.type === 'checkpoint_crystal') {
          sound.playLevelUp();
          this.stats.hp = this.stats.maxHp;
          this.stats.energy = this.stats.maxEnergy;
          this.checkpointArea = this.currentAreaId;
          this.checkpointSpawn = { x: obj.x, y: obj.y + 24 };
          this.unlockedAreas.add(this.currentAreaId);
          this.spawnSparks(obj.x, obj.y, '#38bdf8', 30);
          this.callbacks.onStatsUpdate({ ...this.stats });
          this.callbacks.onMessage('Checkpoint crystal activated! Game saved.');
          this.autoSave();
          return;
        }

        // Sign, Bookshelf, Statue, Shrine
        if (obj.type === 'sign' || obj.type === 'bookshelf' || obj.type === 'ancient_statue' || obj.type === 'magic_shrine') {
          sound.playButtonClick();
          this.spawnSparks(obj.x, obj.y, '#38bdf8', 12);
          if (obj.type === 'magic_shrine') {
            this.stats.energy = this.stats.maxEnergy;
            this.callbacks.onStatsUpdate({ ...this.stats });
          }
          this.callbacks.onMessage(obj.customText || `Exacting examination of ${obj.type}...`);
          return;
        }

        // Portal
        if (obj.type === 'portal' && obj.targetArea) {
          const targetAreaName = AREA_NAMES[obj.targetArea] || obj.targetArea;
          if (this.callbacks.onPortalConfirmTrigger) {
            this.callbacks.onPortalConfirmTrigger({
              targetAreaId: obj.targetArea,
              targetAreaName,
              isLocked: !!obj.isLocked,
              lockReason: obj.lockReason,
              requiredBossName: obj.requiredBossName,
            });
            return;
          }

          if (obj.isLocked) {
            sound.playPortalLocked();
            this.callbacks.onMessage(`🔒 PORTAL SEALED! ${obj.lockReason || 'Defeat the area boss first!'}`);
            return;
          }

          this.executePortalTravel(obj.targetArea, obj.targetSpawn);
          return;
        }
      }
    }
  }

  public executePortalTravel(targetArea: AreaId, targetSpawn?: { x: number; y: number }) {
    sound.playPortalWarp();
    this.spawnSparks(this.px, this.py, '#38bdf8', 45);
    const targetAreaName = AREA_NAMES[targetArea] || targetArea;
    this.callbacks.onMessage(`🌀 Teleporting to ${targetAreaName}...`);

    if (this.callbacks.onPortalWarp) {
      this.callbacks.onPortalWarp(targetAreaName, true);
    }

    setTimeout(() => {
      this.loadArea(targetArea, targetSpawn);
      if (this.callbacks.onPortalWarp) {
        this.callbacks.onPortalWarp(targetAreaName, false);
      }
      this.autoSave();
    }, 600);
  }

  // ==========================================
  // FISHING ENGINE METHODS
  // ==========================================

  public startFishing(spot?: InteractiveObject) {
    this.currentFishingSpotObj = spot || this.objects.find((o) => o.type === 'fishing_spot') || null;

    // Check if player has any rod in inventory
    const hasRod = this.inventory.some((s) => s.item.category === 'fishing_rod');
    if (!hasRod && !this.equippedRod) {
      this.callbacks.onMessage('You need a Fishing Rod to fish! Talk to Fisherman Finn in Skyfall Village.');
      return;
    }

    const currentRod = FISHING_RODS[this.equippedRod] || FISHING_RODS.rod_wooden;

    // Count available bait
    const baitSlot = this.equippedBait
      ? this.inventory.find((s) => s.item.id === this.equippedBait)
      : null;
    const baitCount = baitSlot ? baitSlot.quantity : 0;

    this.fishingState = {
      phase: 'idle',
      isAutoFishing: false,
      spotId: this.currentFishingSpotObj ? this.currentFishingSpotObj.id : null,
      spotName: this.currentFishingSpotObj?.spotName || 'Quiet Waters',
      equippedRod: this.equippedRod,
      equippedBait: this.equippedBait,
      baitCount,
      targetFish: null,
      reelProgress: 20,
      fishTension: 15,
      barPosition: 40,
      fishPosition: 50,
      fishVelocity: 15,
      barSize: Math.round(24 * currentRod.barSizeMultiplier),
      biteTimer: 0,
      catchAnimationTimer: 0,
      lastCaughtFish: null,
    };

    this.playerAction = 'idle';
    sound.playButtonClick();
    if (this.callbacks.onFishingUpdate) {
      this.callbacks.onFishingUpdate({ ...this.fishingState });
    }
  }

  public castLine() {
    if (!this.fishingState) return;

    sound.playAttack(1);
    this.fishingState.phase = 'casting';
    this.fishingState.targetFish = null;
    this.fishingState.reelProgress = 20;
    this.fishingState.fishTension = 15;
    this.fishingState.biteTimer = 0;

    if (this.callbacks.onFishingUpdate) {
      this.callbacks.onFishingUpdate({ ...this.fishingState });
    }

    // After 0.8s casting, transition to waiting
    setTimeout(() => {
      if (!this.fishingState || this.fishingState.phase !== 'casting') return;
      this.fishingState.phase = 'waiting';

      const bait = this.fishingState.equippedBait
        ? FISHING_BAITS[this.fishingState.equippedBait]
        : null;
      const speedBonus = bait ? bait.biteSpeedBonus : 1.0;
      const biteDelay = (2.2 + Math.random() * 3.2) / speedBonus;

      this.fishingState.biteTimer = biteDelay;

      if (this.callbacks.onFishingUpdate) {
        this.callbacks.onFishingUpdate({ ...this.fishingState });
      }
    }, 800);
  }

  public hookFish() {
    if (!this.fishingState || this.fishingState.phase !== 'bite') return;

    sound.playHit();
    const fish = pickRandomFish(
      this.currentAreaId,
      this.fishingState.equippedRod,
      this.fishingState.equippedBait
    );

    const rod = FISHING_RODS[this.fishingState.equippedRod] || FISHING_RODS.rod_wooden;

    this.fishingState.phase = 'reeling';
    this.fishingState.targetFish = fish;
    this.fishingState.reelProgress = 25;
    this.fishingState.fishTension = 20;
    this.fishingState.fishPosition = 50;
    this.fishingState.barPosition = 40;
    this.fishingState.barSize = Math.round(24 * rod.barSizeMultiplier);
    this.fishingState.fishVelocity = (Math.random() > 0.5 ? 1 : -1) * (20 + fish.difficulty * 8);

    if (this.callbacks.onFishingUpdate) {
      this.callbacks.onFishingUpdate({ ...this.fishingState });
    }
  }

  public setReeling(isHeld: boolean) {
    this.isReelingHeld = isHeld;
  }

  public toggleAutoFishing() {
    if (!this.fishingState) return;
    this.fishingState.isAutoFishing = !this.fishingState.isAutoFishing;
    if (this.fishingState.isAutoFishing && this.fishingState.phase === 'idle') {
      this.castLine();
    }
    if (this.callbacks.onFishingUpdate) {
      this.callbacks.onFishingUpdate({ ...this.fishingState });
    }
  }

  public setEquippedBait(baitId: FishingBaitId | null) {
    this.equippedBait = baitId;
    if (this.fishingState) {
      this.fishingState.equippedBait = baitId;
      const baitSlot = baitId ? this.inventory.find((s) => s.item.id === baitId) : null;
      this.fishingState.baitCount = baitSlot ? baitSlot.quantity : 0;
      if (this.callbacks.onFishingUpdate) {
        this.callbacks.onFishingUpdate({ ...this.fishingState });
      }
    }
  }

  public setEquippedRod(rodId: FishingRodId) {
    this.equippedRod = rodId;
    if (this.fishingState) {
      this.fishingState.equippedRod = rodId;
      const rod = FISHING_RODS[rodId] || FISHING_RODS.rod_wooden;
      this.fishingState.barSize = Math.round(24 * rod.barSizeMultiplier);
      if (this.callbacks.onFishingUpdate) {
        this.callbacks.onFishingUpdate({ ...this.fishingState });
      }
    }
  }

  public cancelFishing() {
    this.fishingState = null;
    this.isReelingHeld = false;
    if (this.callbacks.onFishingUpdate) {
      this.callbacks.onFishingUpdate(null);
    }
  }

  private updateFishing(dt: number) {
    if (!this.fishingState) return;

    // WAITING PHASE
    if (this.fishingState.phase === 'waiting') {
      this.fishingState.biteTimer -= dt;
      if (this.fishingState.biteTimer <= 0) {
        this.fishingState.phase = 'bite';
        this.fishingState.biteTimer = 1.6; // 1.6s bite window
        sound.playPuzzleSolve();

        if (this.currentFishingSpotObj) {
          this.spawnSparks(this.currentFishingSpotObj.x, this.currentFishingSpotObj.y, '#38bdf8', 12);
        }

        // If Auto-fishing is enabled, auto hook after 0.4s
        if (this.fishingState.isAutoFishing) {
          setTimeout(() => {
            if (this.fishingState && this.fishingState.phase === 'bite') {
              this.hookFish();
            }
          }, 400);
        }
      }
      if (this.callbacks.onFishingUpdate) {
        this.callbacks.onFishingUpdate({ ...this.fishingState });
      }
      return;
    }

    // BITE PHASE
    if (this.fishingState.phase === 'bite') {
      this.fishingState.biteTimer -= dt;
      if (this.fishingState.biteTimer <= 0) {
        // Missed bite window
        this.fishingState.phase = 'escaped';
        sound.playPortalLocked();
        if (this.callbacks.onFishingUpdate) {
          this.callbacks.onFishingUpdate({ ...this.fishingState });
        }
      }
      return;
    }

    // REELING PHASE
    if (this.fishingState.phase === 'reeling') {
      const rod = FISHING_RODS[this.fishingState.equippedRod] || FISHING_RODS.rod_wooden;
      const fish = this.fishingState.targetFish || ALL_FISH[0];

      // Move player green capture bar (Holding rises, releasing falls)
      if (this.isReelingHeld) {
        this.fishingState.barPosition = Math.min(100 - this.fishingState.barSize, this.fishingState.barPosition + 65 * dt);
      } else {
        this.fishingState.barPosition = Math.max(0, this.fishingState.barPosition - 55 * dt);
      }

      // Auto-fishing bot logic helper
      if (this.fishingState.isAutoFishing) {
        const targetBar = this.fishingState.fishPosition - this.fishingState.barSize / 2;
        if (this.fishingState.barPosition < targetBar) {
          this.fishingState.barPosition = Math.min(100 - this.fishingState.barSize, this.fishingState.barPosition + 70 * dt);
        } else {
          this.fishingState.barPosition = Math.max(0, this.fishingState.barPosition - 50 * dt);
        }
      }

      // Fish vertical swimming oscillation
      this.fishingState.fishPosition += this.fishingState.fishVelocity * dt;
      if (this.fishingState.fishPosition <= 5 || this.fishingState.fishPosition >= 95 || Math.random() < 0.04 * fish.difficulty) {
        this.fishingState.fishVelocity = (Math.random() > 0.5 ? 1 : -1) * (20 + fish.difficulty * 9 + Math.random() * 15);
      }
      this.fishingState.fishPosition = Math.max(0, Math.min(100, this.fishingState.fishPosition));

      // Check if fish is inside green capture bar
      const barTop = this.fishingState.barPosition + this.fishingState.barSize;
      const barBottom = this.fishingState.barPosition;
      const isInside = this.fishingState.fishPosition >= barBottom && this.fishingState.fishPosition <= barTop;

      if (isInside) {
        this.fishingState.reelProgress = Math.min(100, this.fishingState.reelProgress + (18 + rod.power * 4) * dt);
        this.fishingState.fishTension = Math.max(0, this.fishingState.fishTension - 14 * dt);
      } else {
        this.fishingState.reelProgress = Math.max(0, this.fishingState.reelProgress - 15 * dt);
        this.fishingState.fishTension = Math.min(100, this.fishingState.fishTension + 22 * dt);
      }

      // Line snapped condition
      if (this.fishingState.fishTension >= 100 || this.fishingState.reelProgress <= 0) {
        this.fishingState.phase = 'escaped';
        sound.playPortalLocked();
        this.callbacks.onMessage('Line snapped! The fish got away.');
        if (this.callbacks.onFishingUpdate) {
          this.callbacks.onFishingUpdate({ ...this.fishingState });
        }
        return;
      }

      // Catch victory condition
      if (this.fishingState.reelProgress >= 100) {
        this.catchFish(fish);
        return;
      }

      if (this.callbacks.onFishingUpdate) {
        this.callbacks.onFishingUpdate({ ...this.fishingState });
      }
    }
  }

  public catchFish(fish: FishSpecies) {
    if (!this.fishingState) return;

    sound.playLevelUp();
    const measurements = generateFishMeasurements(fish);
    this.totalFishCaught++;

    // Update Fish Almanac
    const record = this.fishCollection[fish.id] || {
      fishId: fish.id,
      discovered: false,
      caughtCount: 0,
      biggestSize: 0,
      heaviestWeight: 0,
    };
    const isNew = !record.discovered;
    record.discovered = true;
    record.caughtCount++;
    record.biggestSize = Math.max(record.biggestSize, measurements.size);
    record.heaviestWeight = Math.max(record.heaviestWeight, measurements.weight);
    this.fishCollection[fish.id] = record;

    // Add Fish Item to Inventory
    const item = fishToInventoryItem(fish);
    this.addItem(item, 1);

    // Consume 1 bait if equipped
    if (this.fishingState.equippedBait) {
      this.removeItem(this.fishingState.equippedBait, 1);
      const baitSlot = this.inventory.find((s) => s.item.id === this.fishingState?.equippedBait);
      this.fishingState.baitCount = baitSlot ? baitSlot.quantity : 0;
      if (this.fishingState.baitCount <= 0) {
        this.fishingState.equippedBait = null;
        this.equippedBait = null;
      }
    }

    // Advance quests
    this.advanceQuest('fq_fisherman_request', 'catch_fish', 1);
    if (fish.rarity === 'rare' || fish.rarity === 'epic' || fish.rarity === 'legendary') {
      this.advanceQuest('fq_rare_catch', 'catch_rare', 1);
    }
    if (fish.rarity === 'legendary') {
      this.advanceQuest('fq_legend_lake', 'catch_legendary', 1);
    }

    // Gain Exp & Gold
    this.gainExp(fish.value * 2);
    this.stats.gold += Math.round(fish.value * 0.8);

    this.fishingState.phase = 'caught';
    this.fishingState.lastCaughtFish = {
      species: fish,
      size: measurements.size,
      weight: measurements.weight,
      isNewDiscovery: isNew,
    };

    if (this.callbacks.onFishCaught) {
      this.callbacks.onFishCaught(fish, measurements.size, measurements.weight, isNew);
    }
    if (this.callbacks.onFishCollectionUpdate) {
      this.callbacks.onFishCollectionUpdate({ ...this.fishCollection });
    }
    if (this.callbacks.onFishingUpdate) {
      this.callbacks.onFishingUpdate({ ...this.fishingState });
    }

    this.callbacks.onMessage(`Caught ${fish.name}! (${measurements.size}cm, ${measurements.weight}kg)`);
    this.autoSave();

    // If Auto-fishing, continue next cast after 2.4s
    if (this.fishingState.isAutoFishing) {
      setTimeout(() => {
        if (this.fishingState && this.fishingState.isAutoFishing && this.fishingState.phase === 'caught') {
          this.castLine();
        }
      }, 2400);
    }
  }

  // Consume Fish to activate culinary buff
  public consumeFish(fishItem: Item) {
    const species = ALL_FISH.find((f) => f.id === fishItem.id);
    if (!species) return;

    const slotIndex = this.inventory.findIndex((s) => s.item.id === fishItem.id);
    if (slotIndex === -1) return;

    sound.playLevelUp();
    this.removeItem(fishItem.id, 1);

    // Apply immediate HP/Energy recovery
    if (species.buff.healHp) {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + species.buff.healHp);
      this.spawnSparks(this.px, this.py, '#10b981', 14);
      this.damageNumbers.push({
        id: Math.random().toString(),
        x: this.px,
        y: this.py - 24,
        value: species.buff.healHp,
        color: '#10b981',
        opacity: 1,
        vy: -30,
      });
    }
    if (species.buff.restoreEnergy) {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + species.buff.restoreEnergy);
      this.spawnSparks(this.px, this.py, '#38bdf8', 14);
    }

    // Apply Duration Buff
    if (species.buff.durationSeconds && species.buff.durationSeconds > 0) {
      this.activeFishBuffs = this.activeFishBuffs.filter((b) => b.fishId !== species.id);
      this.activeFishBuffs.push({
        fishId: species.id,
        name: species.name,
        icon: species.icon,
        buffText: species.buffText,
        effect: species.buff.statBonus,
        remainingSeconds: species.buff.durationSeconds,
      });
      this.callbacks.onMessage(`Ate ${species.name}! Buff activated: ${species.buffText}`);
    } else {
      this.callbacks.onMessage(`Ate ${species.name}! Restored vitality.`);
    }

    this.recalculateDerivedStats();
    if (this.callbacks.onFishBuffsUpdate) {
      this.callbacks.onFishBuffsUpdate([...this.activeFishBuffs]);
    }
  }

  public getAvailableBaits(): { baitId: FishingBaitId; count: number }[] {
    const baits: { baitId: FishingBaitId; count: number }[] = [];
    for (const slot of this.inventory) {
      if (slot.item.category === 'bait') {
        baits.push({ baitId: slot.item.id as FishingBaitId, count: slot.quantity });
      }
    }
    return baits;
  }

  // --- ENEMIES & AI ---

  private updateEnemies(dt: number) {
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;

      const dist = Math.hypot(this.px - enemy.x, this.py - enemy.y);
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

      // Telegraph timer
      if (enemy.telegraphTimer !== undefined) {
        enemy.telegraphTimer -= dt;
        if (enemy.telegraphTimer <= 0) {
          this.executeEnemyTelegraphAttack(enemy);
        }
        continue;
      }

      // Boss detection
      if (enemy.isBoss && !this.activeBoss && dist < enemy.detectionRange) {
        this.activeBoss = enemy;
        this.callbacks.onBossStart(enemy);
      }

      // Chase Player
      if (dist < enemy.detectionRange && dist > enemy.attackRange) {
        const angle = Math.atan2(this.py - enemy.y, this.px - enemy.x);
        const speed = enemy.speed * 48;
        const ex = enemy.x + Math.cos(angle) * speed * dt;
        const ey = enemy.y + Math.sin(angle) * speed * dt;

        if (!this.checkTileCollision(ex, ey, enemy.width / 2)) {
          enemy.x = ex;
          enemy.y = ey;
        }
        enemy.facing = Math.cos(angle) > 0 ? 'right' : 'left';
        enemy.state = 'chase';
      }
      // Attack Player
      else if (dist <= enemy.attackRange && enemy.attackCooldown <= 0) {
        this.startEnemyTelegraph(enemy);
      } else {
        enemy.state = 'idle';
      }
    }
  }

  private startEnemyTelegraph(enemy: EnemyEntity) {
    enemy.state = 'prepare_attack';
    const telegraphTime = enemy.isBoss ? 0.9 : 0.7;
    enemy.telegraphTimer = telegraphTime;
    enemy.telegraphArea = {
      x: enemy.x,
      y: enemy.y,
      radius: enemy.attackRange + 18,
      type: 'circle',
    };
  }

  private executeEnemyTelegraphAttack(enemy: EnemyEntity) {
    const dist = Math.hypot(this.px - enemy.x, this.py - enemy.y);
    if (dist < enemy.attackRange + 22) {
      this.hitPlayer(enemy.attack);
    }
    enemy.telegraphArea = undefined;
    enemy.telegraphTimer = undefined;
    enemy.state = 'idle';
    enemy.attackCooldown = enemy.isBoss ? 1.8 : 1.4;
  }

  public hitEnemy(enemy: EnemyEntity, damage: number, isCritical: boolean = false, knockX: number = 0, knockY: number = 0) {
    if (enemy.state === 'dead') return;

    const actualDamage = Math.max(1, damage - enemy.defense);
    enemy.hp = Math.max(0, enemy.hp - actualDamage);
    sound.playHit();

    // Knockback
    enemy.x += knockX * 3;
    enemy.y += knockY * 3;

    this.spawnSparks(enemy.x, enemy.y, '#f43f5e', 8);
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: enemy.x,
      y: enemy.y - 20,
      value: actualDamage,
      color: isCritical ? '#fbbf24' : '#ffffff',
      isCritical,
      opacity: 1,
      vy: -35,
    });

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: EnemyEntity) {
    enemy.state = 'dead';
    sound.playEnemyDeath();
    this.spawnSparks(enemy.x, enemy.y, '#fbbf24', 25);
    this.stats.enemiesDefeated++;

    if (enemy.isBoss) {
      this.stats.bossesDefeatedCount++;
      this.defeatedBosses.add(enemy.id);
      this.activeBoss = null;
      this.callbacks.onBossEnd();
      this.refreshPortalLocks();
    }

    this.gainExp(enemy.loot.exp);
    this.giveLoot(enemy.loot);
  }

  public hitPlayer(incomingDamage: number) {
    if (this.isInvincible || this.playerAction === 'dead') return;

    const actualDamage = Math.max(1, Math.round(incomingDamage - this.stats.baseDefense * 0.6));
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);

    this.isHurt = true;
    this.hurtTimer = 0.25;
    this.isInvincible = true;
    this.invincibleTimer = 0.65;

    sound.playHit();
    if (this.screenShakeEnabled) this.screenShake = 8;

    this.damageNumbers.push({
      id: Math.random().toString(),
      x: this.px,
      y: this.py - 18,
      value: actualDamage,
      color: '#ef4444',
      opacity: 1,
      vy: -30,
    });

    this.callbacks.onStatsUpdate({ ...this.stats });

    if (this.stats.hp <= 0) {
      this.playerAction = 'dead';
      this.callbacks.onGameOver();
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifeTime += dt;

      if (p.isEnemy) {
        const dist = Math.hypot(this.px - p.x, this.py - p.y);
        if (dist < p.radius + 10) {
          this.hitPlayer(p.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (this.checkTileCollision(p.x, p.y, p.radius) || p.lifeTime >= p.maxLifeTime) {
        this.spawnSparks(p.x, p.y, p.color, 4);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateSkills(dt: number) {
    if (this.activeSlash) {
      this.activeSlash.progress += dt * 4.5;
      if (this.activeSlash.progress >= 1) this.activeSlash = null;
    }
    if (this.activeSkySlash) {
      this.activeSkySlash.timer -= dt;
      if (this.activeSkySlash.timer <= 0) this.activeSkySlash = null;
    }
    if (this.activeCyclone) {
      this.activeCyclone.timer -= dt;
      this.activeCyclone.angle += dt * 14;
      if (this.activeCyclone.timer <= 0) this.activeCyclone = null;
    }
    if (this.activeUlt) {
      this.activeUlt.timer -= dt;
      if (this.activeUlt.timer <= 0) this.activeUlt = null;
    }
  }

  private updateFX(dt: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y += dn.vy * dt;
      dn.opacity -= dt * 1.5;
      if (dn.opacity <= 0) this.damageNumbers.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  public spawnSparks(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        alpha: 1,
        decay: 2.2 + Math.random() * 1.5,
      });
    }
  }

  private updatePuzzles() {
    this.checkPuzzlePressurePlates();
  }

  private checkPuzzlePressurePlates() {
    for (const plate of this.objects) {
      if (plate.type === 'pressure_plate') {
        const isPlayerOn = Math.hypot(this.px - plate.x, this.py - plate.y) < 18;
        const isBlockOn = this.objects.some(
          (b) => b.type === 'movable_block' && Math.hypot(b.x - plate.x, b.y - plate.y) < 18
        );

        const active = isPlayerOn || isBlockOn;
        if (active && plate.state !== 'active') {
          plate.state = 'active';
          sound.playPuzzleSolve();
          this.callbacks.onMessage('A heavy mechanism shifted in the distance!');
          if (this.screenShakeEnabled) this.screenShake = 6;

          if (plate.targetId) {
            const target = this.objects.find((o) => o.id === plate.targetId);
            if (target && target.type === 'locked_door') {
              target.state = 'open';
            }
          }
        }
      }
    }
  }

  public gainExp(amount: number) {
    this.stats.exp += amount;
    while (this.stats.exp >= this.stats.expToNext) {
      this.stats.exp -= this.stats.expToNext;
      this.stats.level++;
      this.stats.expToNext = Math.round(this.stats.expToNext * 1.45);
      sound.playLevelUp();
      this.recalculateDerivedStats();
      this.stats.hp = this.stats.maxHp;
      this.stats.energy = this.stats.maxEnergy;
      this.spawnSparks(this.px, this.py, '#fbbf24', 25);
      this.callbacks.onMessage(`LEVEL UP! You are now Level ${this.stats.level}!`);
    }
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  public addItem(item: any, quantity: number = 1) {
    const existing = this.inventory.find((slot) => slot.item.id === item.id);
    if (existing && item.stackable) {
      existing.quantity += quantity;
    } else {
      this.inventory.push({ item, quantity });
    }
    sound.playCoin();
    this.callbacks.onInventoryUpdate([...this.inventory]);
    this.callbacks.onMessage(`Received: ${item.name} x${quantity}`);
  }

  public giveLoot(loot: { gold: number; item?: any }) {
    if (loot.gold > 0) {
      this.stats.gold += loot.gold;
      this.callbacks.onStatsUpdate({ ...this.stats });
      this.callbacks.onMessage(`Found ${loot.gold} Gold!`);
    }
    if (loot.item) {
      this.addItem(loot.item, 1);
    }
  }

  public equipItem(item: any) {
    if (item.category === 'weapon') {
      this.equipment.weapon = item;
    } else if (item.category === 'armor') {
      this.equipment.armor = item;
    } else if (item.category === 'accessory') {
      this.equipment.accessory = item;
    } else if (item.category === 'fishing_rod') {
      this.setEquippedRod(item.id as FishingRodId);
    }
    sound.playHit();
    this.recalculateDerivedStats();
    this.callbacks.onEquipmentUpdate({ ...this.equipment });
  }

  public useConsumable(item: any) {
    if (item.category === 'fish') {
      this.consumeFish(item);
      return;
    }

    const slotIndex = this.inventory.findIndex((s) => s.item.id === item.id);
    if (slotIndex === -1) return;

    if (item.effect?.healHp) {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + item.effect.healHp);
      this.spawnSparks(this.px, this.py, '#10b981', 12);
      this.damageNumbers.push({
        id: Math.random().toString(),
        x: this.px,
        y: this.py - 20,
        value: item.effect.healHp,
        color: '#10b981',
        opacity: 1,
        vy: -25,
      });
    }
    if (item.effect?.restoreEnergy) {
      this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + item.effect.restoreEnergy);
      this.spawnSparks(this.px, this.py, '#38bdf8', 12);
    }

    sound.playChestOpen();
    this.inventory[slotIndex].quantity--;
    if (this.inventory[slotIndex].quantity <= 0) {
      this.inventory.splice(slotIndex, 1);
    }

    this.callbacks.onStatsUpdate({ ...this.stats });
    this.callbacks.onInventoryUpdate([...this.inventory]);
  }

  public useItem(item: any) {
    this.useConsumable(item);
  }

  public removeItem(itemId: string, quantity: number = 1) {
    const slotIndex = this.inventory.findIndex((s) => s.item.id === itemId);
    if (slotIndex !== -1) {
      this.inventory[slotIndex].quantity -= quantity;
      if (this.inventory[slotIndex].quantity <= 0) {
        this.inventory.splice(slotIndex, 1);
      }
      this.callbacks.onInventoryUpdate([...this.inventory]);
    }
  }

  public respawnPlayer() {
    this.stats.hp = this.stats.maxHp;
    this.stats.energy = this.stats.maxEnergy;
    this.playerAction = 'idle';
    this.isInvincible = true;
    this.invincibleTimer = 2.0;
    this.loadArea(this.checkpointArea, this.checkpointSpawn);
    this.callbacks.onStatsUpdate({ ...this.stats });
    this.callbacks.onMessage(`Awakened back at ${this.currentMap.name} Sanctuary!`);
  }

  public fastTravel(areaId: AreaId) {
    this.spawnSparks(this.px, this.py, '#38bdf8', 25);
    this.unlockedAreas.add(areaId);
    this.loadArea(areaId);
    this.spawnSparks(this.px, this.py, '#fbbf24', 30);
    this.callbacks.onMessage(`Warped to ${this.currentMap.name}!`);
  }

  public useQuickSlot(slot: number) {
    if (slot === 1) {
      const pot = this.inventory.find(
        (s) => s.item.category === 'consumable' && (s.item.effect?.healHp ?? 0) > 0
      );
      if (pot) this.useConsumable(pot.item);
      else this.callbacks.onMessage('No Health Potions remaining in inventory!');
    } else if (slot === 2) {
      const elixir = this.inventory.find(
        (s) => s.item.category === 'consumable' && (s.item.effect?.restoreEnergy ?? 0) > 0
      );
      if (elixir) this.useConsumable(elixir.item);
      else this.callbacks.onMessage('No Energy Elixirs remaining in inventory!');
    } else if (slot === 3) {
      this.handleSkill();
    } else if (slot === 4) {
      sound.playLevelUp();
      this.loadArea(this.checkpointArea, this.checkpointSpawn);
      this.spawnSparks(this.px, this.py, '#38bdf8', 25);
      this.callbacks.onMessage('Used Waystone Recall! Teleported to Checkpoint Crystal.');
    }
  }

  private updateAmbientWeather(dt: number) {
    this.weatherTimer += dt;
    if (this.weatherTimer < 0.12) return;
    this.weatherTimer = 0;

    if (this.particles.length > 50 || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    switch (this.currentAreaId) {
      case 'skyfall_village': {
        this.particles.push({
          x: this.camX + Math.random() * w,
          y: this.camY - 10,
          vx: 15 + Math.random() * 25,
          vy: 20 + Math.random() * 25,
          size: 2 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#86efac' : '#fef08a',
          alpha: 0.8,
          decay: 0.28,
        });
        break;
      }
      case 'whispering_forest': {
        const isFirefly = Math.random() > 0.6;
        this.particles.push({
          x: this.camX + Math.random() * w,
          y: isFirefly ? this.camY + Math.random() * h : this.camY - 10,
          vx: isFirefly ? (Math.random() - 0.5) * 30 : 20 + Math.random() * 30,
          vy: isFirefly ? (Math.random() - 0.5) * 30 : 25 + Math.random() * 30,
          size: isFirefly ? 2 : 3,
          color: isFirefly ? '#fde047' : '#22c55e',
          alpha: 0.9,
          decay: 0.35,
        });
        break;
      }
      default: {
        this.particles.push({
          x: this.camX + Math.random() * w,
          y: this.camY + Math.random() * h,
          vx: (Math.random() - 0.5) * 20,
          vy: -15 - Math.random() * 25,
          size: 2 + Math.random() * 2,
          color: '#38bdf8',
          alpha: 0.85,
          decay: 0.4,
        });
        break;
      }
    }
  }

  // Aliases for player controls
  public playerAttack() { this.handleAttack(); }
  public playerDodge() { this.handleDodge(); }
  public playerSkill() { this.handleSkill(); }
  public playerUltimate() { this.handleUltimate(); }
  public playerInteract() { this.handleInteract(); }

  // --- QUEST SYSTEM ---

  public advanceQuest(questId: string, objectiveId: string, amount: number) {
    if (!this.quests) return;
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest) return;

    if (quest.status === 'not_started') {
      quest.status = 'active';
    }

    const obj = quest.objectives?.find((o) => o.id === objectiveId);
    if (obj && !obj.completed) {
      obj.current = Math.min(obj.required, obj.current + amount);
      if (obj.current >= obj.required) {
        obj.completed = true;
        this.callbacks.onMessage(`Quest Update: ${obj.text} (Completed)`);
      }

      if (quest.objectives?.every((o) => o.completed)) {
        quest.status = 'completed';
        this.stats.questsCompletedCount = (this.stats.questsCompletedCount || 0) + 1;
        sound.playLevelUp();
        this.callbacks.onMessage(`QUEST COMPLETED: ${quest.title}!`);
        this.gainExp(quest.reward.exp);
        this.stats.gold += quest.reward.gold;
        if (quest.reward.items) {
          for (const rew of quest.reward.items) {
            this.addItem(rew.item, rew.quantity);
          }
        }
      }
    }

    this.updateNPCQuestIndicators();
    this.callbacks.onQuestsUpdate([...this.quests]);
  }

  public completeQuestObjective(questId: string, objectiveId: string, currentVal: number) {
    if (!this.quests) return;
    const quest = this.quests.find((q) => q.id === questId);
    if (quest) {
      const obj = quest.objectives?.find((o) => o.id === objectiveId);
      if (obj) {
        obj.current = currentVal;
        if (obj.current >= obj.required) {
          obj.completed = true;
          this.advanceQuest(questId, objectiveId, 0);
        }
      }
    }
  }

  private updateNPCQuestIndicators() {
    if (!this.quests || !this.npcs) return;
    for (const npc of this.npcs) {
      if (npc.id === 'npc_matthew') {
        const mq1 = this.quests.find((q) => q.id === 'mq1_awakening');
        if (mq1 && mq1.status === 'active' && !mq1.objectives?.[0]?.completed) {
          npc.questIndicator = 'available';
        } else {
          npc.questIndicator = null;
        }
      }
    }
  }

  public refreshPortalLocks() {
    for (const obj of this.objects) {
      if (obj.type === 'portal') {
        const req = FORWARD_PORTAL_REQUIREMENTS[obj.id];
        if (req && req.requiredBossId) {
          const isDefeated = this.defeatedBosses.has(req.requiredBossId);
          obj.isLocked = !isDefeated;
          obj.requiredBossName = req.requiredBossName;
          obj.lockReason = `Defeat ${req.requiredBossName} in ${req.requiredAreaName} first!`;
        } else {
          obj.isLocked = false;
        }
      }
    }
  }

  // --- RENDER PIPELINE ---

  public render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    // Screen Shake
    if (this.screenShake > 0 && this.screenShakeEnabled) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(Math.round(shakeX), Math.round(shakeY));
    }

    // Camera Transform
    ctx.translate(-Math.round(this.camX), -Math.round(this.camY));

    // 1. Draw Biome Map Tiles with High-Quality Pixel Textures
    this.renderTiles(ctx);

    // 2. Draw Interactive Objects (Chests, Campfires, Fishing Spots, Signs, etc.)
    for (const obj of this.objects) {
      PixelRenderer.drawObject(ctx, obj, this.playerFrame);
    }

    // 3. Draw Fishing Line & Bobber if fishing
    if (this.fishingState && this.currentFishingSpotObj) {
      PixelRenderer.drawFishingLine(
        ctx,
        this.px,
        this.py,
        this.currentFishingSpotObj.x,
        this.currentFishingSpotObj.y,
        this.playerFrame,
        this.fishingState.phase === 'bite'
      );
    }

    // 4. Draw Telegraphs
    for (const enemy of this.enemies) {
      if (enemy.telegraphArea && enemy.telegraphTimer !== undefined) {
        const maxTime = enemy.isBoss ? 0.9 : 0.8;
        const progress = Math.max(0, Math.min(1, 1 - enemy.telegraphTimer / maxTime));
        PixelRenderer.drawTelegraph(ctx, enemy.telegraphArea, progress);
      }
    }

    // 5. Draw NPCs
    for (const npc of this.npcs) {
      PixelRenderer.drawNPC(
        ctx,
        npc.x,
        npc.y,
        npc.portrait,
        npc.name,
        npc.role,
        this.playerFrame,
        npc.questIndicator
      );
    }

    // 6. Draw Enemies
    for (const enemy of this.enemies) {
      if (enemy.state !== 'dead') {
        PixelRenderer.drawEnemy(
          ctx,
          enemy.x,
          enemy.y,
          enemy.type,
          enemy.facing,
          this.playerFrame,
          enemy.state,
          enemy.hp,
          enemy.maxHp,
          enemy.name
        );
      }
    }

    // 7. Draw Player
    if (this.playerAction !== 'dead') {
      PixelRenderer.drawPlayer(
        ctx,
        this.px,
        this.py,
        this.playerAction,
        this.playerFacing,
        this.playerFrame,
        this.isInvincible,
        this.isHurt
      );
    }

    // 8. Draw Attack Slash FX
    if (this.activeSlash) {
      PixelRenderer.drawSlashArc(
        ctx,
        this.px,
        this.py,
        this.activeSlash.facing,
        this.activeSlash.progress,
        this.activeSlash.comboStep
      );
    }

    // 9. Draw Sky Slash Wave
    if (this.activeSkySlash) {
      const prog = 1 - this.activeSkySlash.timer / this.activeSkySlash.maxTimer;
      PixelRenderer.drawSkySlash(
        ctx,
        this.activeSkySlash.x,
        this.activeSkySlash.y,
        this.activeSkySlash.facing,
        prog
      );
    }

    // 10. Draw Cyclone Skill
    if (this.activeCyclone) {
      PixelRenderer.drawCyclone(ctx, this.px, this.py, 60, this.activeCyclone.angle);
    }

    // 11. Draw Ultimate
    if (this.activeUlt) {
      const progress = 1 - this.activeUlt.timer / this.activeUlt.maxTimer;
      PixelRenderer.drawUltimate(ctx, this.px, this.py, progress);
    }

    // 12. Draw Projectiles
    for (const p of this.projectiles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 13. Draw Particles
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.globalAlpha = 1.0;
    }

    // 14. Draw Damage Numbers
    for (const dn of this.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, dn.opacity);
      ctx.font = dn.isCritical ? 'bold 15px monospace' : 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(dn.value.toString(), dn.x + 1, dn.y + 1);
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.value.toString(), dn.x, dn.y);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderTiles(ctx: CanvasRenderingContext2D) {
    const ts = this.currentMap.tileSize;
    const startCol = Math.max(0, Math.floor(this.camX / ts));
    const endCol = Math.min(this.currentMap.width, Math.ceil((this.camX + this.canvas!.width) / ts) + 1);
    const startRow = Math.max(0, Math.floor(this.camY / ts));
    const endRow = Math.min(this.currentMap.height, Math.ceil((this.camY + this.canvas!.height) / ts) + 1);

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = this.currentMap.tiles[r][c];
        const tx = c * ts;
        const ty = r * ts;

        PixelRenderer.drawTile(
          ctx,
          this.currentAreaId,
          tile,
          tx,
          ty,
          ts,
          this.playerFrame,
          r,
          c
        );
      }
    }
  }
}
