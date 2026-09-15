/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { storageService } from './services/storage';
import { sound } from './services/audio';
import { INITIAL_QUESTS } from './game/questData';
import { ITEMS } from './game/itemsData';
import { MAPS } from './game/mapData';
import {
  PlayerStats,
  EquipmentState,
  InventorySlot,
  Quest,
  GameSettings,
  AreaId,
  EnemyEntity,
  Item,
  InteractionPrompt,
  PortalConfirmInfo,
  NPCEntity,
  FishingEngineState,
  FishCatchRecord,
} from './types';
import { ActiveFishBuff } from './game/engine';

import { HUD } from './components/HUD';
import { DialogueBox } from './components/DialogueBox';
import { InventoryModal } from './components/InventoryModal';
import { QuestModal } from './components/QuestModal';
import { ShopModal } from './components/ShopModal';
import { CharacterModal } from './components/CharacterModal';
import { SettingsModal } from './components/SettingsModal';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { MapModal } from './components/MapModal';
import { PauseModal } from './components/PauseModal';
import { ControlsTutorialModal } from './components/ControlsTutorialModal';
import { PortalModal } from './components/PortalModal';
import { UpgradeModal } from './components/UpgradeModal';
import { FishingOverlay } from './components/FishingOverlay';
import { FishAlmanacModal } from './components/FishAlmanacModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Application Screen State
  const [inGame, setInGame] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'inventory' | 'quests' | 'character' | 'settings' | 'shop' | 'map' | 'pause' | 'controls' | 'upgrade' | 'almanac' | null
  >(null);
  const [activeShopkeeper, setActiveShopkeeper] = useState<NPCEntity | null>(null);
  const [portalConfirmInfo, setPortalConfirmInfo] = useState<PortalConfirmInfo | null>(null);
  const [unlockedAreas, setUnlockedAreas] = useState<AreaId[]>(['skyfall_village']);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Fishing state
  const [fishingState, setFishingState] = useState<FishingEngineState | null>(null);
  const [fishCollection, setFishCollection] = useState<Record<string, FishCatchRecord>>({});
  const [activeFishBuffs, setActiveFishBuffs] = useState<ActiveFishBuff[]>([]);

  // Game Engine State Sync
  const [stats, setStats] = useState<PlayerStats>({
    name: 'Aeron',
    level: 1,
    exp: 0,
    expToNext: 100,
    hp: 120,
    maxHp: 120,
    energy: 100,
    maxEnergy: 100,
    baseAttack: 18,
    baseDefense: 6,
    critChance: 0.05,
    movementSpeed: 135,
    skillDamageMultiplier: 1.0,
    gold: 50,
    enemiesDefeated: 0,
    bossesDefeatedCount: 0,
    questsCompletedCount: 0,
    unlockedAreasCount: 1,
    playTimeSeconds: 0,
  });

  const [equipment, setEquipment] = useState<EquipmentState>({
    weapon: ITEMS.rusty_sword,
    armor: ITEMS.apprentice_tunic,
    accessory: ITEMS.copper_ring,
  });

  const [inventory, setInventory] = useState<InventorySlot[]>([
    { item: ITEMS.rusty_sword, quantity: 1 },
    { item: ITEMS.apprentice_tunic, quantity: 1 },
    { item: ITEMS.copper_ring, quantity: 1 },
    { item: ITEMS.health_potion, quantity: 4 },
  ]);

  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [currentArea, setCurrentArea] = useState<AreaId>('skyfall_village');
  const [activeBoss, setActiveBoss] = useState<EnemyEntity | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Interaction prompt & Portal Warp state
  const [interactionPrompt, setInteractionPrompt] = useState<InteractionPrompt | null>(null);
  const [portalWarpInfo, setPortalWarpInfo] = useState<{ targetAreaName: string; isWarping: boolean } | null>(null);

  // Cooldowns for UI display
  const [skillCd, setSkillCd] = useState(0);
  const [ultCd, setUltCd] = useState(0);
  const [dodgeCd, setDodgeCd] = useState(0);

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    return (
      storageService.loadSettings() || {
        musicVolume: 0.4,
        sfxVolume: 0.8,
        screenShake: true,
        textSpeed: 'normal',
        touchControls: true,
        showFps: false,
      }
    );
  });

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 3200);
  }, []);

  // Sync sound volume changes
  useEffect(() => {
    sound.setMusicVolume(settings.musicVolume);
    sound.setSfxVolume(settings.sfxVolume);
  }, [settings.musicVolume, settings.sfxVolume]);

  // Audio BGM sync on area switch
  useEffect(() => {
    if (inGame && !isGameOver && !isVictory) {
      if (activeBoss && activeBoss.state !== 'dead') {
        sound.playBgm('boss');
      } else {
        sound.playBgm(currentArea);
      }
    }
  }, [inGame, currentArea, activeBoss, isGameOver, isVictory]);

  // Initialize Game Engine when game starts and canvas is ready
  useEffect(() => {
    if (!inGame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 640;
    canvas.height = 360;

    const engine = new GameEngine({
      onStatsUpdate: (newStats) => setStats({ ...newStats }),
      onInventoryUpdate: (newInv) => setInventory([...newInv]),
      onEquipmentUpdate: (newEq) => setEquipment({ ...newEq }),
      onQuestsUpdate: (newQ) => setQuests([...newQ]),
      onAreaChange: (areaName) => {
        showNotification(`Entering ${areaName}`);
        if (engineRef.current) {
          setCurrentArea(engineRef.current.currentAreaId);
        }
      },
      onDialogueTrigger: (dId) => {
        setDialogId(dId);
      },
      onShopTrigger: (npc) => {
        setActiveShopkeeper(npc || null);
        setActiveModal('shop');
      },
      onPortalConfirmTrigger: (info) => {
        setPortalConfirmInfo(info);
      },
      onBossStart: (boss) => {
        setActiveBoss(boss);
        sound.playBgm('boss');
      },
      onBossEnd: () => {
        setActiveBoss(null);
      },
      onGameOver: () => {
        setIsGameOver(true);
        sound.playGameOver();
      },
      onVictory: () => {
        setIsVictory(true);
        sound.playVictoryFanfare();
      },
      onMessage: (msg) => {
        showNotification(msg);
      },
      onPromptChange: (prompt) => {
        setInteractionPrompt(prompt);
      },
      onPortalWarp: (targetAreaName, isWarping) => {
        setPortalWarpInfo(isWarping ? { targetAreaName, isWarping } : null);
      },
      onFishingUpdate: (state) => {
        setFishingState(state ? { ...state } : null);
      },
      onFishCollectionUpdate: (col) => {
        setFishCollection({ ...col });
      },
      onFishBuffsUpdate: (buffs) => {
        setActiveFishBuffs([...buffs]);
      },
    });

    engineRef.current = engine;

    // Apply sound volumes
    sound.setMusicVolume(settings.musicVolume);
    sound.setSfxVolume(settings.sfxVolume);

    // Initial load from storage if present
    const saved = storageService.loadGame();
    engine.init(canvas, saved || undefined);
    if (engine.fishCollection) {
      setFishCollection({ ...engine.fishCollection });
    }

    return () => {
      engine.stopLoop();
      engineRef.current = null;
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, [inGame, showNotification]);

  // Handle cooldown timers update for HUD
  useEffect(() => {
    if (!inGame) return;
    const timer = setInterval(() => {
      if (engineRef.current) {
        setSkillCd(Math.max(0, engineRef.current.skillCooldown));
        setUltCd(Math.max(0, engineRef.current.ultCooldown));
        setDodgeCd(Math.max(0, engineRef.current.dodgeCooldown));
      }
    }, 100);
    return () => clearInterval(timer);
  }, [inGame]);

  // Pause engine and clear inputs when modals, dialogue, or game end states are active
  useEffect(() => {
    if (engineRef.current) {
      if (dialogId || activeModal || portalConfirmInfo || isGameOver || isVictory) {
        engineRef.current.isPaused = true;
        engineRef.current.clearInputs();
      } else {
        engineRef.current.isPaused = false;
        engineRef.current.clearInputs();
      }
    }
  }, [dialogId, activeModal, portalConfirmInfo, isGameOver, isVictory]);

  // Global Keyboard Event Handlers
  useEffect(() => {
    if (!inGame) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, ignore
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code.toLowerCase();
      const key = e.key.toLowerCase();

      // Close modal or open pause on Escape
      if (code === 'escape') {
        if (portalConfirmInfo) {
          setPortalConfirmInfo(null);
          return;
        }
        if (activeModal) {
          setActiveModal(null);
          return;
        }
        if (dialogId) {
          setDialogId(null);
          return;
        }
        setActiveModal('pause');
        return;
      }

      // If a modal or dialogue is open, skip gameplay buttons
      if (activeModal || dialogId || portalConfirmInfo || isGameOver || isVictory) return;

      // Menu Shortcuts
      if (key === 'i' || key === 'b') {
        sound.playButtonClick();
        setActiveModal('inventory');
        return;
      }
      if (key === 'q') {
        sound.playButtonClick();
        setActiveModal('quests');
        return;
      }
      if (key === 'm') {
        sound.playButtonClick();
        setActiveModal('map');
        return;
      }
      if (key === 'c' || key === 'p') {
        sound.playButtonClick();
        setActiveModal('character');
        return;
      }
      if (key === 'f') {
        sound.playButtonClick();
        setActiveModal('almanac');
        return;
      }
      if (key === 'h') {
        sound.playButtonClick();
        setActiveModal('controls');
        return;
      }
      if (key === 'o') {
        sound.playButtonClick();
        setActiveModal('settings');
        return;
      }

      // Quick Slots 1, 2, 3, 4
      if (key === '1') {
        engineRef.current?.useQuickSlot(1);
        return;
      }
      if (key === '2') {
        engineRef.current?.useQuickSlot(2);
        return;
      }
      if (key === '3') {
        engineRef.current?.useQuickSlot(3);
        return;
      }
      if (key === '4') {
        engineRef.current?.useQuickSlot(4);
        return;
      }

      // Movement & Combat Handlers
      if (engineRef.current) {
        if (code === 'arrowup' || code === 'keyw' || key === 'w' || key === 'arrowup') {
          engineRef.current.keys['w'] = true;
          engineRef.current.keys['arrowup'] = true;
        }
        if (code === 'arrowdown' || code === 'keys' || key === 's' || key === 'arrowdown') {
          engineRef.current.keys['s'] = true;
          engineRef.current.keys['arrowdown'] = true;
        }
        if (code === 'arrowleft' || code === 'keya' || key === 'a' || key === 'arrowleft') {
          engineRef.current.keys['a'] = true;
          engineRef.current.keys['arrowleft'] = true;
        }
        if (code === 'arrowright' || code === 'keyd' || key === 'd' || key === 'arrowright') {
          engineRef.current.keys['d'] = true;
          engineRef.current.keys['arrowright'] = true;
        }

        // Attacks & Combos (J, Space)
        if (key === 'j' || code === 'space' || key === ' ') {
          e.preventDefault();
          engineRef.current.playerAttack();
        }
        // Skill (K)
        if (key === 'k') {
          engineRef.current.playerSkill();
        }
        // Dodge (L, Shift)
        if (key === 'l' || code === 'shiftleft' || code === 'shiftright') {
          engineRef.current.playerDodge();
        }
        // Ultimate (U)
        if (key === 'u') {
          engineRef.current.playerUltimate();
        }
        // Interact (E, F)
        if (key === 'e' || key === 'f') {
          engineRef.current.playerInteract();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase();
      const key = e.key.toLowerCase();
      if (engineRef.current) {
        if (code === 'arrowup' || code === 'keyw' || key === 'w' || key === 'arrowup') {
          engineRef.current.keys['w'] = false;
          engineRef.current.keys['arrowup'] = false;
        }
        if (code === 'arrowdown' || code === 'keys' || key === 's' || key === 'arrowdown') {
          engineRef.current.keys['s'] = false;
          engineRef.current.keys['arrowdown'] = false;
        }
        if (code === 'arrowleft' || code === 'keya' || key === 'a' || key === 'arrowleft') {
          engineRef.current.keys['a'] = false;
          engineRef.current.keys['arrowleft'] = false;
        }
        if (code === 'arrowright' || code === 'keyd' || key === 'd' || key === 'arrowright') {
          engineRef.current.keys['d'] = false;
          engineRef.current.keys['arrowright'] = false;
        }
      }
    };

    const handleBlur = () => {
      if (engineRef.current) {
        engineRef.current.clearInputs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleBlur);
      if (engineRef.current) {
        engineRef.current.clearInputs();
      }
    };
  }, [inGame, activeModal, dialogId, isGameOver, isVictory]);

  // Quick Potion logic
  const handleQuickPotion = () => {
    if (!engineRef.current || !inventory) return;
    const potion = inventory.find(
      (slot) =>
        slot.item &&
        slot.item.category === 'consumable' &&
        (slot.item.id === 'health_potion' || slot.item.id === 'great_health_potion') &&
        slot.quantity > 0
    );

    if (potion) {
      engineRef.current.useItem(potion.item);
    } else {
      showNotification('No healing potions available in inventory!');
    }
  };

  const getPotionCount = () => {
    if (!inventory) return 0;
    const p = inventory.find(
      (s) => s.item && (s.item.id === 'health_potion' || s.item.id === 'great_health_potion')
    );
    return p ? p.quantity : 0;
  };

  // Move input from virtual joystick
  const handleMoveInput = (x: number, y: number) => {
    if (!engineRef.current) return;
    const mag = Math.hypot(x, y);
    if (mag < 0.1) {
      engineRef.current.moveInput = { x: 0, y: 0 };
    } else {
      engineRef.current.moveInput = { x, y };
    }
  };

  // Save / Load Game Operations
  const handleSaveGame = () => {
    if (!engineRef.current) return;
    const data = engineRef.current.getSaveData();
    storageService.saveGame(data);
    showNotification('Game Progress Saved!');
  };

  const handleLoadGame = () => {
    const data = storageService.loadGame();
    if (data && engineRef.current) {
      engineRef.current.loadFromSave(data);
      showNotification('Save File Loaded Successfully!');
      setActiveModal(null);
    } else {
      showNotification('No existing save game found.');
    }
  };

  const handleResetSave = () => {
    storageService.clearSave();
    window.location.reload();
  };

  // Respawn after Game Over
  const handleRespawn = () => {
    setIsGameOver(false);
    if (engineRef.current) {
      engineRef.current.respawnPlayer();
    }
  };

  return (
    <main className="relative w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center select-none font-pixel">
      {!inGame ? (
        <MainMenu
          hasSaveFile={storageService.hasSaveFile()}
          saveData={storageService.loadGame()}
          stats={stats}
          equipment={equipment}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onNewGame={() => {
            setInGame(true);
          }}
          onContinue={() => {
            setInGame(true);
          }}
        />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {/* 2D PIXEL CANVAS */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-crosshair image-render-pixel"
            onClick={() => {
              // Click to attack or focus
              if (engineRef.current && !activeModal && !dialogId) {
                engineRef.current.playerAttack();
              }
            }}
          />

          {/* ACTION RPG HUD LAYER */}
          <HUD
            stats={stats}
            currentAreaName={MAPS[currentArea]?.name || 'Skyfall Realm'}
            currentAreaId={currentArea}
            activeBoss={activeBoss}
            notification={notification}
            onAttack={() => engineRef.current?.playerAttack()}
            onDodge={() => engineRef.current?.playerDodge()}
            onSkill={() => engineRef.current?.playerSkill()}
            onUltimate={() => engineRef.current?.playerUltimate()}
            onInteract={() => engineRef.current?.playerInteract()}
            onUsePotion={handleQuickPotion}
            potionCount={getPotionCount()}
            onOpenInventory={() => setActiveModal('inventory')}
            onOpenQuests={() => setActiveModal('quests')}
            onOpenCharacter={() => setActiveModal('character')}
            onOpenSettings={() => setActiveModal('settings')}
            onOpenMap={() => setActiveModal('map')}
            onOpenPause={() => setActiveModal('pause')}
            onOpenControls={() => setActiveModal('controls')}
            onOpenFishAlmanac={() => setActiveModal('almanac')}
            activeFishBuffs={activeFishBuffs}
            onQuickSlot={(slot) => engineRef.current?.useQuickSlot(slot)}
            skillCooldown={skillCd}
            ultCooldown={ultCd}
            dodgeCooldown={dodgeCd}
            onMoveInput={handleMoveInput}
            touchControls={settings.touchControls}
            showFps={settings.showFps}
            showKeyboardGuide={settings.showKeyboardGuide !== false}
            interactionPrompt={interactionPrompt}
            portalWarpInfo={portalWarpInfo}
          />

          {/* DIALOGUE BOX */}
          {dialogId && (
            <DialogueBox
              dialogId={dialogId}
              textSpeed={settings.textSpeed}
              onClose={() => setDialogId(null)}
              onSelectOption={(nextId) => {
                if (nextId) {
                  setDialogId(nextId);
                } else {
                  setDialogId(null);
                }
              }}
            />
          )}

          {/* INVENTORY & GEAR MODAL */}
          {activeModal === 'inventory' && (
            <InventoryModal
              inventory={inventory}
              equipment={equipment}
              gold={stats.gold}
              onClose={() => setActiveModal(null)}
              onEquip={(item) => {
                engineRef.current?.equipItem(item);
                showNotification(`Equipped ${item.name}`);
              }}
              onUnequip={(slot) => {
                engineRef.current?.unequipItem(slot);
              }}
              onUseConsumable={(item) => {
                engineRef.current?.useItem(item);
              }}
            />
          )}

          {/* QUEST JOURNAL */}
          {activeModal === 'quests' && (
            <QuestModal quests={quests} onClose={() => setActiveModal(null)} />
          )}

          {/* CHARACTER PROFILE */}
          {activeModal === 'character' && (
            <CharacterModal
              stats={stats}
              equipment={equipment}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* SHOP MODAL */}
          {activeModal === 'shop' && (
            <ShopModal
              gold={stats.gold}
              inventory={inventory}
              shopkeeper={activeShopkeeper}
              defeatedBosses={engineRef.current ? Array.from(engineRef.current.defeatedBosses) : []}
              onOpenUpgrade={() => setActiveModal('upgrade')}
              onClose={() => setActiveModal(null)}
              onBuyItem={(item, cost) => {
                if (engineRef.current) {
                  engineRef.current.stats.gold -= cost;
                  engineRef.current.addItem(item, 1);
                  sound.playItemPickup();
                  showNotification(`Purchased ${item.name}!`);
                  setStats({ ...engineRef.current.stats });
                }
              }}
              onSellItem={(item, qty, earnings) => {
                if (engineRef.current) {
                  engineRef.current.removeItem(item.id, qty);
                  engineRef.current.stats.gold += earnings;
                  sound.playItemPickup();
                  showNotification(`Sold ${item.name} for +${earnings} Gold!`);
                  setStats({ ...engineRef.current.stats });
                }
              }}
            />
          )}

          {/* UPGRADE MODAL */}
          {activeModal === 'upgrade' && (
            <UpgradeModal
              equipment={equipment}
              inventory={inventory}
              gold={stats.gold}
              onUpgrade={(slot) => {
                if (engineRef.current) {
                  engineRef.current.upgradeEquipment(slot);
                }
              }}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* REALM PORTAL CONFIRMATION MODAL */}
          {portalConfirmInfo && (
            <PortalModal
              portalInfo={portalConfirmInfo}
              onConfirm={() => {
                if (engineRef.current && portalConfirmInfo) {
                  const targetArea = portalConfirmInfo.targetAreaId;
                  setPortalConfirmInfo(null);
                  engineRef.current.executePortalTravel(targetArea);
                }
              }}
              onCancel={() => setPortalConfirmInfo(null)}
            />
          )}

          {/* GAME OVER MODAL */}
          {isGameOver && (
            <GameOverModal
              onRespawn={handleRespawn}
              onReturnToMenu={() => {
                setIsGameOver(false);
                setInGame(false);
              }}
            />
          )}

          {/* CHAPTER 1 VICTORY MODAL */}
          {isVictory && (
            <VictoryModal
              onContinue={() => {
                setIsVictory(false);
                showNotification('Chapter 1 Complete! Continue freely exploring.');
              }}
            />
          )}

          {/* WORLD REALM MAP MODAL */}
          {activeModal === 'map' && (
            <MapModal
              currentAreaId={currentArea}
              unlockedAreas={
                engineRef.current ? Array.from(engineRef.current.unlockedAreas) : unlockedAreas
              }
              onFastTravel={(areaId) => {
                if (engineRef.current) {
                  engineRef.current.fastTravel(areaId);
                  setCurrentArea(areaId);
                }
              }}
              onClose={() => setActiveModal(null)}
            />
          )}

          {/* PAUSE MENU MODAL */}
          {activeModal === 'pause' && (
            <PauseModal
              onResume={() => setActiveModal(null)}
              onOpenInventory={() => setActiveModal('inventory')}
              onOpenQuests={() => setActiveModal('quests')}
              onOpenMap={() => setActiveModal('map')}
              onOpenCharacter={() => setActiveModal('character')}
              onOpenControls={() => setActiveModal('controls')}
              onOpenSettings={() => setActiveModal('settings')}
              onSaveGame={handleSaveGame}
              onMainMenu={() => {
                setActiveModal(null);
                setInGame(false);
              }}
            />
          )}

          {/* KEYBOARD CONTROLS & COMBAT TUTORIAL MODAL */}
          {activeModal === 'controls' && (
            <ControlsTutorialModal onClose={() => setActiveModal(null)} />
          )}

          {/* FISHING MINI-GAME & AUTO-FISHING OVERLAY */}
          {fishingState && (
            <FishingOverlay
              fishingState={fishingState}
              onCast={() => engineRef.current?.castLine()}
              onHook={() => engineRef.current?.hookFish()}
              onReelStart={() => engineRef.current?.setReeling(true)}
              onReelEnd={() => engineRef.current?.setReeling(false)}
              onCancel={() => engineRef.current?.cancelFishing()}
              onToggleAutoFishing={() => engineRef.current?.toggleAutoFishing()}
              onSelectBait={(baitId) => engineRef.current?.setEquippedBait(baitId)}
              onSelectRod={(rodId) => engineRef.current?.setEquippedRod(rodId)}
              availableBaits={engineRef.current ? engineRef.current.getAvailableBaits() : []}
            />
          )}

          {/* FISH ALMANAC / COLLECTION MODAL */}
          {activeModal === 'almanac' && (
            <FishAlmanacModal
              fishCollection={fishCollection}
              totalFishCaught={engineRef.current?.totalFishCaught || 0}
              onClose={() => setActiveModal(null)}
            />
          )}
        </div>
      )}

      {/* SETTINGS MODAL (ACCESSIBLE FROM BOTH MENU AND GAME) */}
      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSet) => {
            setSettings(newSet);
            storageService.saveSettings(newSet);
          }}
          onSaveGame={handleSaveGame}
          onLoadGame={handleLoadGame}
          onResetSave={handleResetSave}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}
