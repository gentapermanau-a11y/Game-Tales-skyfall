import { Quest, DialogNode } from '../types';
import { ITEMS } from './itemsData';

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'mq1_awakening',
    title: 'Awakening from the Heavens',
    description: 'You survived a fall from the sky with only minor amnesia. Speak with Elder Matthew and complete basic combat training with Captain Vance.',
    type: 'main',
    status: 'active',
    objectives: [
      { id: 'talk_matthew', text: 'Speak to Elder Matthew in the village center', current: 0, required: 1, completed: false },
      { id: 'practice_attack', text: 'Strike the Training Dummy 3 times', current: 0, required: 3, completed: false },
    ],
    reward: {
      exp: 100,
      gold: 50,
      items: [{ item: ITEMS.health_potion, quantity: 3 }],
      unlockArea: 'whispering_forest',
    },
  },
  {
    id: 'mq2_forest',
    title: 'The Whispering Blight',
    description: 'The Sky Core anomaly has riled the creatures of Whispering Forest. Clear the path and investigate the ancient ruins.',
    type: 'main',
    status: 'not_started',
    objectives: [
      { id: 'defeat_goblins', text: 'Defeat 4 Corrupted Forest Goblins', current: 0, required: 4, completed: false },
      { id: 'defeat_treant', text: 'Defeat Mini-Boss: Ancient Briar Treant', current: 0, required: 1, completed: false },
    ],
    reward: {
      exp: 250,
      gold: 120,
      items: [{ item: ITEMS.iron_broadsword, quantity: 1 }],
      unlockArea: 'ancient_sanctum',
    },
  },
  {
    id: 'mq3_sanctum',
    title: 'Echoes of the Sky Core',
    description: 'Delve into the Ancient Sanctum dungeon, navigate the traps, solve the ancient puzzles, and defeat the corrupted Sky Guardian Talos.',
    type: 'main',
    status: 'not_started',
    objectives: [
      { id: 'solve_puzzle', text: 'Activate the pressure plate & solve the dungeon puzzle', current: 0, required: 1, completed: false },
      { id: 'find_sanctum_key', text: 'Find the Golden Sanctum Key in the dungeon chest', current: 0, required: 1, completed: false },
      { id: 'defeat_talos', text: 'Defeat Chapter Boss: Sky Guardian Talos', current: 0, required: 1, completed: false },
    ],
    reward: {
      exp: 600,
      gold: 300,
      items: [
        { item: ITEMS.skyfall_blade, quantity: 1 },
        { item: ITEMS.first_sky_core, quantity: 1 },
      ],
    },
  },
  {
    id: 'sq_matthew_amulet',
    title: "Elder's Lost Heirloom",
    description: "Elder Matthew dropped his cherished sapphire pendant while fleeing wild wolves near the forest boundary.",
    type: 'side',
    status: 'not_started',
    objectives: [
      { id: 'find_amulet', text: 'Retrieve the Lost Amulet from Whispering Forest', current: 0, required: 1, completed: false },
      { id: 'return_amulet', text: 'Return the amulet to Elder Matthew', current: 0, required: 1, completed: false },
    ],
    reward: {
      exp: 120,
      gold: 80,
      items: [{ item: ITEMS.copper_ring, quantity: 1 }],
    },
  },
  {
    id: 'sq_blacksmith_ore',
    title: "Brand's Forge Fuel",
    description: "Blacksmith Brand is running low on high-quality Iron Ore to reinforce village defenses. Gather ore deposits.",
    type: 'side',
    status: 'not_started',
    objectives: [
      { id: 'collect_ore', text: 'Gather 2 Skyfall Iron Ores', current: 0, required: 2, completed: false },
    ],
    reward: {
      exp: 150,
      gold: 90,
      items: [{ item: ITEMS.iron_mail, quantity: 1 }],
    },
  },
  {
    id: 'fq_fisherman_request',
    title: "Fisherman's Request",
    description: 'Fisherman Finn needs fresh river fish to restock his lake pantry and make fish stew for the villagers.',
    type: 'side',
    status: 'not_started',
    objectives: [
      { id: 'catch_river_fish', text: 'Catch 3 River Fish in Skyfall Village waters', current: 0, required: 3, completed: false },
    ],
    reward: {
      exp: 100,
      gold: 150,
      items: [{ item: ITEMS.bait_worm, quantity: 5 }],
    },
  },
  {
    id: 'fq_rare_catch',
    title: 'Rare Catch of the Wild',
    description: 'Master angler Finn wants to examine a Rare-tier aquatic specimen from the enchanted waterways.',
    type: 'side',
    status: 'not_started',
    objectives: [
      { id: 'catch_rare_fish', text: 'Catch 1 Rare tier fish', current: 0, required: 1, completed: false },
    ],
    reward: {
      exp: 500,
      gold: 350,
      items: [{ item: ITEMS.bait_rare, quantity: 2 }],
    },
  },
  {
    id: 'fq_legend_lake',
    title: 'Legend of the Sovereign Waters',
    description: 'Whispers speak of ancient legendary leviathans swimming in the highest sky islands and shadow catacombs. Prove your mastery!',
    type: 'side',
    status: 'not_started',
    objectives: [
      { id: 'catch_legendary_fish', text: 'Catch 1 Legendary tier fish', current: 0, required: 1, completed: false },
    ],
    reward: {
      exp: 2000,
      gold: 1500,
      items: [{ item: ITEMS.rod_celestial, quantity: 1 }],
    },
  },
];

export const DIALOG_NODES: Record<string, DialogNode> = {
  // --- ELDER MATTHEW ---
  matthew_intro: {
    id: 'matthew_intro',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "By the stars! You're awake, young knight! You literally plummeted out of a rift in the stratosphere and landed right in our village square!",
    options: [
      { text: "Who am I? Where is this place?", nextDialogId: 'matthew_lore' },
      { text: "My head hurts, but my sword arm is intact.", nextDialogId: 'matthew_training' },
    ],
  },
  matthew_lore: {
    id: 'matthew_lore',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "This is Skyfall Village, nestled beneath the floating celestial citadels. For centuries, the Sky Core preserved equilibrium. But recently, tremors shook the heavens, and corrupted beasts invaded!",
    options: [
      { text: "Did my fall have something to do with the Sky Core?", nextDialogId: 'matthew_destiny' },
    ],
  },
  matthew_destiny: {
    id: 'matthew_destiny',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "The ancient prophecies speak of a champion bearing celestial resonance. Take your rusty blade to the training dummy south, then speak to Captain Vance! Also, I seem to have dropped my amulet in the forest...",
    options: [
      { text: "I'll do my best to protect the village!", nextDialogId: 'matthew_quest_start' },
    ],
  },
  matthew_training: {
    id: 'matthew_training',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "Spoken like a true knight! Go speak to Captain Vance by the training dummy. Once you're ready, the gate to Whispering Forest lies to the east.",
    options: [
      { text: "Understood, Elder!", nextDialogId: 'matthew_quest_start' },
    ],
  },
  matthew_quest_start: {
    id: 'matthew_quest_start',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "May the celestial winds guide your blade. Check your Quest Log [Q / Menu] to keep track of your goals!",
  },
  matthew_idle: {
    id: 'matthew_idle',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "Be careful in the Whispering Forest and the Ancient Sanctum. Legend has it the Guardian Talos was once our protector before corruption seized its core.",
    options: [
      { text: "I found your lost amulet!", nextDialogId: 'matthew_amulet_turnin' },
      { text: "Farewell, Elder." },
    ],
  },
  matthew_amulet_turnin: {
    id: 'matthew_amulet_turnin',
    speaker: 'Elder Matthew',
    speakerRole: 'Village Elder',
    portrait: 'elder',
    text: "My family's heirloom! Oh bless your kind heart! Take this Carved Copper Ring—it has served my bloodline well in battles of old.",
  },

  // --- CAPTAIN VANCE ---
  vance_intro: {
    id: 'vance_intro',
    speaker: 'Captain Vance',
    speakerRole: 'Village Guard Captain',
    portrait: 'guard',
    text: "Stand tall, stranger! If you plan to head into the forest, show me you know how to wield that steel. Give that wooden dummy a solid 3-hit combo! [Attack button / Space / J]",
    options: [
      { text: "Watch and learn, Captain!", nextDialogId: 'vance_tip' },
    ],
  },
  vance_tip: {
    id: 'vance_tip',
    speaker: 'Captain Vance',
    speakerRole: 'Village Guard Captain',
    portrait: 'guard',
    text: "Remember: Roll [Dodge / K] gives you invincibility frames to slip past enemy sweeps. Your Skill [Skyward Cyclone] handles crowds, and when your Energy peaks, unleash Heavenly Judgment!",
  },
  vance_cleared: {
    id: 'vance_cleared',
    speaker: 'Captain Vance',
    speakerRole: 'Village Guard Captain',
    portrait: 'guard',
    text: "Splendid form! You didn't lose your combat instincts on the way down. The Whispering Forest gate is now open. Go speak to Lily and Brand if you need supplies!",
  },

  // --- BLACKSMITH BRAND ---
  brand_intro: {
    id: 'brand_intro',
    speaker: 'Blacksmith Brand',
    speakerRole: 'Master Smith',
    portrait: 'blacksmith',
    text: "Hah! The meteor boy! You broke three roof tiles when you crashed, but you look like you know good ironwork. Need your blade sharpened or armor forged?",
    options: [
      { text: "Let me check your forge wares.", action: () => {} },
      { text: "Do you need any materials?", nextDialogId: 'brand_quest' },
    ],
  },
  brand_quest: {
    id: 'brand_quest',
    speaker: 'Blacksmith Brand',
    speakerRole: 'Master Smith',
    portrait: 'blacksmith',
    text: "I do! The corrupted beasts stole my shipment of Skyfall Iron Ore. If you find 2 ores in the forest or dungeon, bring them to me and I'll craft you a Reinforced Iron Mail!",
  },

  // --- SHOPKEEPER LILY ---
  lily_intro: {
    id: 'lily_intro',
    speaker: 'Lily',
    speakerRole: 'Apothecary & Merchant',
    portrait: 'shopkeeper',
    text: "Welcome to Skyfall Sundries! Don't go wandering into dark dungeons without Healing Potions and Energy Elixirs, okay? Monsters hit hard these days!",
    options: [
      { text: "Show me your goods, Lily.", action: () => {} },
      { text: "Any rumors about the Ancient Sanctum?", nextDialogId: 'lily_rumors' },
    ],
  },
  lily_rumors: {
    id: 'lily_rumors',
    speaker: 'Lily',
    speakerRole: 'Apothecary & Merchant',
    portrait: 'shopkeeper',
    text: "The explorers say the sanctum is full of ancient stone pressure plates and locked gates. You have to push the heavy stones onto matching runes to unlock the path!",
  },

  // --- MYSTERIOUS HOODED STRANGER ---
  stranger_intro: {
    id: 'stranger_intro',
    speaker: 'Mysterious Stranger',
    speakerRole: '???',
    portrait: 'mysterious',
    text: "You do not remember, do you? You were not meant to fall... you were cast down. The Sky Core does not merely power this world; it holds the cage shut.",
    options: [
      { text: "What cage? Who are you?", nextDialogId: 'stranger_clue' },
    ],
  },
  stranger_clue: {
    id: 'stranger_clue',
    speaker: 'Mysterious Stranger',
    speakerRole: '???',
    portrait: 'mysterious',
    text: "Defeat Talos in the sanctum. Restore the primary shard. Only then will your wings of memory rekindle. We will meet again on the Sky Fortress...",
  },

  // --- FISHERMAN FINN ---
  finn_intro: {
    id: 'finn_intro',
    speaker: 'Fisherman Finn',
    speakerRole: 'Master Angler',
    portrait: 'fisherman',
    text: "Ahoy there, skyfarer! The rivers and lakes across these realms are teeming with rare fish. Catching them grants incredible passive buffs to your strength, speed, and vitality!",
    options: [
      { text: "Show me your fishing gear and baits!", action: () => {} },
      { text: "How does fishing work around here?", nextDialogId: 'finn_tips' },
      { text: "Do you have any requests for me?", nextDialogId: 'finn_quest' },
    ],
  },
  finn_tips: {
    id: 'finn_tips',
    speaker: 'Fisherman Finn',
    speakerRole: 'Master Angler',
    portrait: 'fisherman',
    text: "Approach any sparkling Fishing Spot near the water and press [E] or click FISH. When a fish bites, hold or tap [SPACE] to keep the green bar on the fish until the meter fills up! You can also toggle Auto-Fishing if you have bait!",
  },
  finn_quest: {
    id: 'finn_quest',
    speaker: 'Fisherman Finn',
    speakerRole: 'Master Angler',
    portrait: 'fisherman',
    text: "I need 3 fresh River Fish for the village feast. Catch them right here at the village lakeside, and I'll reward you with gold, EXP, and premium earthworms!",
  },
};

