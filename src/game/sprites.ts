import { Direction, PlayerAction, EnemyType } from '../types';

export class PixelRenderer {
  // Draw animated player character
  static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    action: PlayerAction,
    facing: Direction,
    frame: number,
    isInvincible: boolean,
    isHurt: boolean
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Invincibility flashing / Hurt coloring
    if (isInvincible && Math.floor(frame / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    if (isHurt) {
      ctx.filter = 'brightness(2) saturate(2) hue-rotate(330deg)';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bobbing offset for idle/walk
    let bob = 0;
    if (action === 'walk') {
      bob = Math.sin(frame * 0.3) * 2;
    } else if (action === 'idle') {
      bob = Math.sin(frame * 0.08) * 1;
    }

    // Facing flip
    const flipX = facing === 'left';
    if (flipX) ctx.scale(-1, 1);

    // Dodge rolling animation
    if (action === 'dodge') {
      const angle = (frame * 0.6) % (Math.PI * 2);
      ctx.rotate(flipX ? -angle : angle);
      
      // Roll ball body
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, 4, 11, 0, Math.PI * 2);
      ctx.fill();

      // Armor plating glint
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, -2, 12, 5);
      ctx.restore();
      return;
    }

    // --- CAPE ---
    ctx.fillStyle = '#1d4ed8'; // Azure royal cape
    ctx.beginPath();
    const capeFlutter = Math.sin(frame * 0.25) * 3;
    ctx.moveTo(-7, -4 + bob);
    ctx.lineTo(7, -4 + bob);
    ctx.lineTo(8 + capeFlutter, 14 + bob);
    ctx.lineTo(-8 + capeFlutter, 14 + bob);
    ctx.closePath();
    ctx.fill();

    // --- LEGS / BOOTS ---
    ctx.fillStyle = '#334155'; // Dark iron boots
    const legOffset = action === 'walk' ? Math.sin(frame * 0.3) * 4 : 0;
    // Left leg
    ctx.fillRect(-6, 8 + bob - legOffset, 4, 9 + legOffset);
    // Right leg
    ctx.fillRect(2, 8 + bob + legOffset, 4, 9 - legOffset);

    // Boot cuffs
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-7, 13 + bob - legOffset, 6, 4);
    ctx.fillRect(1, 13 + bob + legOffset, 6, 4);

    // --- TORSO / ARMOR ---
    ctx.fillStyle = '#0f172a'; // Under-tunic
    ctx.fillRect(-7, -4 + bob, 14, 13);

    // Breastplate (Silver Knight steel)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6, -3 + bob, 12, 10);
    // Golden crest insignia
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -1 + bob, 4, 5);
    ctx.fillRect(-4, 1 + bob, 8, 2);

    // Pauldrons (Shoulder guards)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-9, -5 + bob, 4, 5);
    ctx.fillRect(5, -5 + bob, 4, 5);

    // --- HEAD & HELMET ---
    // Visor shadow
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-6, -16 + bob, 12, 12);

    // Steel helm
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6, -17 + bob, 12, 6);
    ctx.fillRect(-7, -15 + bob, 3, 7);
    ctx.fillRect(4, -15 + bob, 3, 7);

    // Helmet slit / Eyes
    ctx.fillStyle = '#38bdf8'; // Glowing azure eyes
    if (facing === 'down') {
      ctx.fillRect(-3, -11 + bob, 2, 2);
      ctx.fillRect(1, -11 + bob, 2, 2);
    } else if (facing === 'right') {
      ctx.fillRect(2, -11 + bob, 3, 2);
    } else if (facing === 'up') {
      // Back of helm
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-4, -13 + bob, 8, 6);
    }

    // Helmet plume (Azure feather)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-2, -21 + bob, 4, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-1, -22 + bob, 2, 3);

    // --- WEAPON & SWORD SWING ---
    if (action === 'attack') {
      const swingProgress = (frame % 10) / 10;
      const angle = -Math.PI / 4 + swingProgress * Math.PI;

      ctx.save();
      ctx.translate(6, 2 + bob);
      ctx.rotate(angle);

      // Sword Hilt
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-2, 0, 4, 5);
      // Crossguard
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-5, -2, 10, 3);
      // Blade
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-2, -22, 4, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -21, 2, 18);
      ctx.restore();
    } else {
      // Idle sword sheathed at hip
      ctx.fillStyle = '#b45309';
      ctx.fillRect(6, 0 + bob, 3, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(5, 5 + bob, 4, 11);
    }

    ctx.restore();
  }

  // Draw attack slash FX trail
  static drawSlashArc(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    progress: number,
    comboStep: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    let baseAngle = 0;
    if (facing === 'right') baseAngle = 0;
    else if (facing === 'down') baseAngle = Math.PI / 2;
    else if (facing === 'left') baseAngle = Math.PI;
    else if (facing === 'up') baseAngle = -Math.PI / 2;

    const radius = 36;
    const arcSpan = Math.PI * 0.9;
    const startAngle = baseAngle - arcSpan / 2 + progress * 0.2;
    const endAngle = startAngle + arcSpan * progress;

    const colors = ['#38bdf8', '#fbbf24', '#f43f5e'];
    const color = colors[(comboStep - 1) % colors.length];

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4 + (1 - progress) * 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, startAngle + 0.1, endAngle);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Skill 1: Sky Slash (Piercing Crescent Wave)
  static drawSkySlash(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    progress: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    let angle = 0;
    if (facing === 'right') angle = 0;
    else if (facing === 'left') angle = Math.PI;
    else if (facing === 'up') angle = -Math.PI / 2;
    else if (facing === 'down') angle = Math.PI / 2;

    ctx.rotate(angle);

    const dist = progress * 70;
    ctx.translate(dist, 0);

    const alpha = Math.max(0, 1 - progress * 0.8);
    ctx.globalAlpha = alpha;

    // Outer glow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 32, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Sharp energy crescent
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 32, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Core spark
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(32, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Skill 2: Wind Dash (Sonic Rush & Trail)
  static drawWindDash(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    progress: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    let angle = 0;
    if (facing === 'right') angle = 0;
    else if (facing === 'left') angle = Math.PI;
    else if (facing === 'up') angle = -Math.PI / 2;
    else if (facing === 'down') angle = Math.PI / 2;

    ctx.rotate(angle);

    // Afterimage speed streaks
    for (let i = 0; i < 4; i++) {
      const offset = (i + 1) * -16;
      ctx.fillStyle = `rgba(56, 189, 248, ${0.4 - i * 0.08})`;
      ctx.fillRect(offset, -12 + i * 2, 14, 24 - i * 4);
    }

    // Cone wind shield
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(24, 0);
    ctx.lineTo(-10, 20);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Skill 3: Ground Break (Shockwave Earth Fissure)
  static drawGroundBreak(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    progress: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    const radius = Math.min(75, progress * 85);
    const alpha = Math.max(0, 1 - progress);

    // Shockwave ring
    ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ground rupture fissure cracks
    ctx.strokeStyle = `rgba(180, 83, 9, ${alpha * 0.9})`;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const midR = radius * 0.5;
      const endR = radius * 0.95;
      ctx.lineTo(Math.cos(a) * midR + (Math.sin(a * 4) * 6), Math.sin(a) * midR);
      ctx.lineTo(Math.cos(a) * endR, Math.sin(a) * endR);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Skill: Skyward Cyclone
  static drawCyclone(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    angle: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Outer swirling wind circle
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 4 spinning wind blade arcs
    for (let i = 0; i < 4; i++) {
      const a = angle + (i * Math.PI) / 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(radius * 0.65, 0, 14, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Blade trail
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, -0.4, 0.4);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Ultimate: Heavenly Judgment
  static drawUltimate(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    progress: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Magic seal on the ground
    const sealRadius = 65;
    ctx.save();
    ctx.scale(1, 0.55);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Rune ring
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Giant Sky Sword descending from the sky
    const swordY = -280 * (1 - Math.min(progress * 1.8, 1));
    ctx.save();
    ctx.translate(0, swordY);

    // Holy aura
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#fbbf24';

    // Giant Blade
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.moveTo(0, 40); // tip
    ctx.lineTo(-18, -120);
    ctx.lineTo(-12, -130);
    ctx.lineTo(12, -130);
    ctx.lineTo(18, -120);
    ctx.closePath();
    ctx.fill();

    // Blade core gold
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-5, -120, 10, 130);

    // Crossguard
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-35, -138, 70, 12);

    // Hilt & Pommel
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7, -170, 14, 32);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -175, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Shockwave burst if landed
    if (progress > 0.55) {
      const burstRadius = (progress - 0.55) * 180;
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - (progress - 0.55) * 2.2)})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, burstRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Enemies
  static drawEnemy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: EnemyType,
    facing: Direction,
    frame: number,
    state: string,
    hp: number,
    maxHp: number,
    name: string
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (state === 'hurt') {
      ctx.filter = 'brightness(2.2) saturate(2)';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowWidth = type === 'boss_talos' ? 36 : type === 'mini_boss_treant' ? 28 : 14;
    ctx.ellipse(0, 16, shadowWidth, shadowWidth * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    const flipX = facing === 'left';
    if (flipX) ctx.scale(-1, 1);

    const bob = Math.sin(frame * 0.2) * 2;

    switch (type) {
      case 'melee_goblin': {
        // Corrupted forest goblin
        // Body
        ctx.fillStyle = '#4d7c0f'; // Goblin green
        ctx.fillRect(-7, -4 + bob, 14, 12);
        // Ragged loincloth
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-8, 5 + bob, 16, 6);
        // Head
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(0, -9 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        // Pointy ears
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.moveTo(-7, -10 + bob);
        ctx.lineTo(-14, -13 + bob);
        ctx.lineTo(-7, -7 + bob);
        ctx.fill();
        // Glowing red malicious eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(1, -11 + bob, 3, 3);
        // Spiked wooden club
        ctx.fillStyle = '#92400e';
        ctx.fillRect(8, -14 + bob, 5, 22);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(13, -12 + bob, 3, 3);
        ctx.fillRect(6, -8 + bob, 3, 3);
        break;
      }

      case 'ranged_spitter': {
        // Spore spitter plant monster
        ctx.fillStyle = '#6b21a8'; // Purple bulb
        ctx.beginPath();
        ctx.arc(0, -4 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
        // Spore mouth
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(4, -4 + bob, 5, 0, Math.PI * 2);
        ctx.fill();
        // Vine tendrils
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, 8);
        ctx.quadraticCurveTo(-14, 16, -10, 18);
        ctx.moveTo(8, 8);
        ctx.quadraticCurveTo(14, 16, 10, 18);
        ctx.stroke();
        break;
      }

      case 'fast_wolf': {
        // Shadow Wolf
        ctx.fillStyle = '#334155'; // Dark slate fur
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0 + bob, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(12, -4 + bob, 7, 0, Math.PI * 2);
        ctx.fill();
        // Snout
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(16, -3 + bob, 5, 4);
        // Crimson eyes
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(13, -6 + bob, 2, 2);
        // Ears
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(8, -9 + bob);
        ctx.lineTo(11, -15 + bob);
        ctx.lineTo(14, -8 + bob);
        ctx.fill();
        // Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, 6, 4, 10);
        ctx.fillRect(6, 6, 4, 10);
        break;
      }

      case 'tank_golem': {
        // Stone Golem
        ctx.fillStyle = '#475569';
        ctx.fillRect(-14, -14 + bob, 28, 24);
        // Stone plates
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-12, -12 + bob, 11, 10);
        ctx.fillRect(1, -12 + bob, 11, 10);
        // Glowing cyan core crack
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(-2, -6 + bob, 4, 12);
        // Heavy stone arms
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, -10 + bob, 6, 18);
        ctx.fillRect(12, -10 + bob, 6, 18);
        break;
      }

      case 'flying_watcher': {
        // Arcane Aether Eye
        const floatY = bob * 2;
        ctx.fillStyle = '#4338ca'; // Arcane indigo sphere
        ctx.beginPath();
        ctx.arc(0, -6 + floatY, 13, 0, Math.PI * 2);
        ctx.fill();
        // Big pupil eye
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(4, -6 + floatY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(4, -8 + floatY, 3, 5);
        // Winglets
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.moveTo(-10, -12 + floatY);
        ctx.lineTo(-20, -18 + floatY);
        ctx.lineTo(-12, -2 + floatY);
        ctx.fill();
        break;
      }

      case 'mini_boss_treant': {
        // Ancient Briar Treant
        ctx.fillStyle = '#451a03'; // Dark elder bark
        ctx.fillRect(-18, -26 + bob, 36, 36);
        // Moss & foliage crown
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -28 + bob, 20, 0, Math.PI * 2);
        ctx.arc(-14, -22 + bob, 12, 0, Math.PI * 2);
        ctx.arc(14, -22 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
        // Glowing hollow eyes
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-8, -18 + bob, 5, 4);
        ctx.fillRect(3, -18 + bob, 5, 4);
        // Spiked branch arms
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-26, -14 + bob, 10, 26);
        ctx.fillRect(16, -14 + bob, 10, 26);
        break;
      }

      case 'boss_talos': {
        // Chapter 1 Boss: Sky Guardian Talos
        const isPhase2 = hp / maxHp < 0.5;
        const armorColor = isPhase2 ? '#7f1d1d' : '#1e3a8a';
        const trimColor = isPhase2 ? '#ef4444' : '#fbbf24';

        // Floating celestial mantle wings
        ctx.fillStyle = isPhase2 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.moveTo(-32, -35 + bob);
        ctx.lineTo(-50, -55 + bob);
        ctx.lineTo(-25, -15 + bob);
        ctx.moveTo(32, -35 + bob);
        ctx.lineTo(50, -55 + bob);
        ctx.lineTo(25, -15 + bob);
        ctx.fill();

        // Giant plate armor torso
        ctx.fillStyle = armorColor;
        ctx.fillRect(-22, -30 + bob, 44, 40);

        // Gold/Red Filigree Trim
        ctx.strokeStyle = trimColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(-20, -28 + bob, 40, 36);

        // Chest Core Reactor
        ctx.fillStyle = isPhase2 ? '#ff0055' : '#00f2ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = isPhase2 ? '#ff0055' : '#00f2ff';
        ctx.beginPath();
        ctx.arc(0, -10 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Heavy Crowned Helm
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -46 + bob, 28, 18);
        ctx.fillStyle = trimColor;
        ctx.fillRect(-16, -48 + bob, 32, 5); // Crown brow
        // Visor slit
        ctx.fillStyle = isPhase2 ? '#f43f5e' : '#38bdf8';
        ctx.fillRect(-8, -38 + bob, 16, 4);

        // Great Rune Sword in hand
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(24, -40 + bob, 8, 55);
        ctx.fillStyle = trimColor;
        ctx.fillRect(20, -10 + bob, 16, 6); // hilt
        break;
      }

      case 'green_slime': {
        // Bouncy emerald slime
        const squish = Math.sin(frame * 0.25);
        const w = 14 + squish * 3;
        const h = 11 - squish * 2;
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(0, 4 - squish, w + 1, h + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(0, 3 - squish, w, h, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slime eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, 0 - squish, 3, 4);
        ctx.fillRect(2, 0 - squish, 3, 4);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-3, 1 - squish, 2, 2);
        ctx.fillRect(3, 1 - squish, 2, 2);
        break;
      }

      case 'ranged_archer': {
        // Goblin scout archer
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(-6, -4 + bob, 12, 12);
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(0, -8 + bob, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(1, -9 + bob, 2, 2);
        // Wooden recurve bow
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(8, -2 + bob, 10, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        break;
      }

      case 'skeleton_warrior': {
        // Skeletal soldier
        ctx.fillStyle = '#f8fafc'; // Bone ivory
        // Skull
        ctx.fillRect(-5, -12 + bob, 10, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-3, -9 + bob, 2, 3);
        ctx.fillRect(2, -9 + bob, 2, 3);
        // Ribcage
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-6, -3 + bob, 12, 2);
        ctx.fillRect(-5, 0 + bob, 10, 2);
        ctx.fillRect(-4, 3 + bob, 8, 2);
        // Shield
        ctx.fillStyle = '#475569';
        ctx.fillRect(-12, -4 + bob, 5, 12);
        // Rusted sword
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(8, -8 + bob, 3, 16);
        break;
      }

      case 'dark_mage': {
        // Dark cultist spellcaster
        ctx.fillStyle = '#3b0764'; // Deep violet robes
        ctx.beginPath();
        ctx.moveTo(0, -14 + bob);
        ctx.lineTo(-9, 10 + bob);
        ctx.lineTo(9, 10 + bob);
        ctx.closePath();
        ctx.fill();
        // Cowl & glowing eyes
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, -8 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(-2, -9 + bob, 2, 2);
        ctx.fillRect(2, -9 + bob, 2, 2);
        // Magic staff
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, -16 + bob, 2, 26);
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(10, -18 + bob, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'ice_wolf': {
        // Frost wolf
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.ellipse(0, 0 + bob, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(16, -3 + bob, 5, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(13, -6 + bob, 2, 2);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(-10, 6, 4, 10);
        ctx.fillRect(6, 6, 4, 10);
        break;
      }

      case 'frozen_knight': {
        // Glacial armor soldier
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-8, -8 + bob, 16, 16);
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeRect(-8, -8 + bob, 16, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-4, -14 + bob, 8, 7);
        // Ice halberd
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(10, -20 + bob, 3, 30);
        ctx.fillRect(7, -22 + bob, 9, 6);
        break;
      }

      case 'magma_golem': {
        // Volcanic Golem
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-14, -14 + bob, 28, 24);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-12, -10 + bob, 24, 3);
        ctx.fillRect(-6, -2 + bob, 12, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, 0 + bob, 8, 6);
        break;
      }

      case 'abyssal_creature': {
        // Deep sea creature
        ctx.fillStyle = '#0e7490';
        ctx.beginPath();
        ctx.arc(0, 0 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(6, -2 + bob, 4, 4);
        // Angler lure
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(2, -10 + bob);
        ctx.quadraticCurveTo(8, -18 + bob, 12, -14 + bob);
        ctx.stroke();
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(12, -14 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'swamp_beast': {
        // Toxic mire beast
        ctx.fillStyle = '#14532d';
        ctx.fillRect(-12, -10 + bob, 24, 20);
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(-4, -4 + bob, 4, 0, Math.PI * 2);
        ctx.arc(6, 2 + bob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-2, -6 + bob, 3, 3);
        ctx.fillRect(4, -6 + bob, 3, 3);
        break;
      }

      case 'sky_harpy': {
        // Winged harpy
        const wingFlap = Math.sin(frame * 0.4) * 6;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-6, -4 + bob);
        ctx.lineTo(-24, -14 + bob + wingFlap);
        ctx.lineTo(-12, 6 + bob);
        ctx.moveTo(6, -4 + bob);
        ctx.lineTo(24, -14 + bob + wingFlap);
        ctx.lineTo(12, 6 + bob);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -6 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'shadow_warrior': {
        // Void ninja
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-8, -12 + bob, 16, 22);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-4, -8 + bob, 8, 3);
        // Dual shadow katanas
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(-14, -12 + bob, 3, 20);
        ctx.fillRect(11, -12 + bob, 3, 20);
        break;
      }

      case 'celestial_guardian': {
        // Astral warrior
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-10, -14 + bob, 20, 24);
        ctx.fillStyle = '#fef08a';
        ctx.strokeRect(-10, -14 + bob, 20, 24);
        // Halo
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -22 + bob, 9, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      // --- BOSSES ---
      case 'boss_frost_queen': {
        // Frozen Queen Sovereign
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-14, -20 + bob, 28, 32);
        // Ice gown
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(0, -16 + bob);
        ctx.lineTo(-18, 16 + bob);
        ctx.lineTo(18, 16 + bob);
        ctx.closePath();
        ctx.fill();
        // Crown
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-10, -28 + bob, 20, 8);
        ctx.fillRect(-4, -32 + bob, 8, 4);
        // Frost Scepter
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(18, -32 + bob, 4, 46);
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(20, -34 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'boss_magma_colossus': {
        // Magma Colossus
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(-28, -36 + bob, 56, 48);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-24, -32 + bob, 48, 8);
        ctx.fillRect(-20, -16 + bob, 40, 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-12, -12 + bob, 24, 6);
        // Erupting shoulders
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-32, -42 + bob, 12, 10);
        ctx.fillRect(20, -42 + bob, 12, 10);
        break;
      }

      case 'boss_abyssal_guardian': {
        // Abyssal Kraken Guardian
        ctx.fillStyle = '#083344';
        ctx.beginPath();
        ctx.arc(0, -10 + bob, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, -10 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
        // Tentacles
        ctx.strokeStyle = '#0e7490';
        ctx.lineWidth = 6;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 12, 10);
          ctx.quadraticCurveTo(i * 18, 30 + Math.sin(frame * 0.2 + i) * 6, i * 14, 42);
          ctx.stroke();
        }
        break;
      }

      case 'boss_swamp_witch': {
        // Ancient Swamp Hag
        ctx.fillStyle = '#14532d';
        ctx.fillRect(-14, -18 + bob, 28, 30);
        // Witch hat
        ctx.fillStyle = '#052e16';
        ctx.beginPath();
        ctx.moveTo(0, -38 + bob);
        ctx.lineTo(-16, -18 + bob);
        ctx.lineTo(16, -18 + bob);
        ctx.closePath();
        ctx.fill();
        // Poison orb
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(16, -6 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'boss_storm_guardian': {
        // Storm Celestial Djinn
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-16, -26 + bob, 32, 36);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-12, -22 + bob, 24, 8);
        // Lightning wings
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-16, -10 + bob);
        ctx.lineTo(-38, -30 + bob);
        ctx.lineTo(-24, -2 + bob);
        ctx.lineTo(-44, 18 + bob);
        ctx.moveTo(16, -10 + bob);
        ctx.lineTo(38, -30 + bob);
        ctx.lineTo(24, -2 + bob);
        ctx.lineTo(44, 18 + bob);
        ctx.stroke();
        break;
      }

      case 'boss_lord_of_shadows': {
        // Lord of Shadows
        ctx.fillStyle = '#020617';
        ctx.fillRect(-18, -32 + bob, 36, 44);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(-18, -32 + bob, 36, 44);
        // Crown of thorns
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(-14, -42 + bob, 28, 10);
        // Void Greatsword
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(22, -44 + bob, 8, 60);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(18, -14 + bob, 16, 5);
        break;
      }

      case 'boss_skyfall': {
        // FINAL BOSS: THE SKYFALL
        const phaseColor = hp / maxHp > 0.5 ? '#67e8f9' : '#f43f5e';
        // Orbiting Cosmic Rings
        ctx.save();
        ctx.rotate(frame * 0.05);
        ctx.strokeStyle = phaseColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 20, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Astral Armor body
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-22, -30 + bob, 44, 46);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-22, -30 + bob, 44, 46);

        // Radiant Sky Core in chest
        ctx.fillStyle = phaseColor;
        ctx.shadowBlur = 20;
        ctx.shadowColor = phaseColor;
        ctx.beginPath();
        ctx.arc(0, -6 + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Heavenly Crown Helm
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-16, -46 + bob, 32, 16);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-10, -40 + bob, 20, 5);
        break;
      }
    }

    ctx.restore();

    // Floating Enemy HP bar (above enemy head)
    if (!type.startsWith('boss_')) {
      const barWidth = type === 'mini_boss_treant' ? 50 : 28;
      const barHeight = 4;
      const barY = y - (type === 'mini_boss_treant' ? 44 : 26);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x - barWidth / 2, barY, (barWidth * hp) / maxHp, barHeight);
    }
  }

  // Draw NPC with expressive pixel styles and quest beacons
  static drawNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    portrait: string,
    name: string,
    role: string,
    frame: number,
    questIndicator?: 'available' | 'in_progress' | 'complete' | null
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(frame * 0.08) * 1.5;

    // Body based on role/portrait
    if (portrait === 'elder') {
      // White beard, purple robes, wooden cane
      ctx.fillStyle = '#581c87'; // Royal violet robe
      ctx.fillRect(-7, -4 + bob, 14, 16);
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(-5, 0 + bob, 10, 12);
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-5, -14 + bob, 10, 10);
      // Beard
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-6, -7 + bob, 12, 10);
      // Cane
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, -10 + bob, 3, 24);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(9, -11 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (portrait === 'guard') {
      // Captain Vance: Steel armor, red cape, polearm
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(-8, -4 + bob, 16, 16);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-6, -3 + bob, 12, 11);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-5, -14 + bob, 10, 10);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-6, -17 + bob, 12, 6);
      // Spear
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, -25 + bob, 2, 38);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(9, -32 + bob);
      ctx.lineTo(6, -24 + bob);
      ctx.lineTo(12, -24 + bob);
      ctx.fill();
    } else if (portrait === 'blacksmith') {
      // Brand: Heavy leather apron, hammer, muscles
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-8, -4 + bob, 16, 16);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-6, -3 + bob, 12, 7);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(-6, -15 + bob, 12, 11);
      // Bandana
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-7, -17 + bob, 14, 5);
      // Hammer
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, -6 + bob, 8, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, -1 + bob, 3, 14);
    } else if (portrait === 'shopkeeper') {
      // Lily: Green dress, satchel, flower in hair
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-7, -4 + bob, 14, 16);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(-5, -2 + bob, 10, 8);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-6, -15 + bob, 12, 11);
      // Hair flower
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(6, -14 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (portrait === 'fisherman') {
      // Fisherman Finn: Blue woolen beanie, yellow rain jacket, tackle vest, fishing rod
      ctx.fillStyle = '#eab308'; // Yellow raincoat
      ctx.fillRect(-7, -4 + bob, 14, 16);
      ctx.fillStyle = '#854d0e'; // Tackle vest pockets
      ctx.fillRect(-6, 0 + bob, 5, 6);
      ctx.fillRect(1, 0 + bob, 5, 6);
      ctx.fillStyle = '#fbcfe8'; // Face
      ctx.fillRect(-6, -15 + bob, 12, 11);
      // Blue Beanie
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-7, -18 + bob, 14, 6);
      // Fishing rod held at angle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, -22 + bob, 2, 34);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, -24 + bob, 1, 6);
    } else {
      // Generic mysterious hooded traveler
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-7, -4 + bob, 14, 16);
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.arc(0, -10 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-2, -9 + bob, 4, 2);
    }

    // Name tag
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(name, 0, -22 + bob);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(name, 0, -23 + bob);

    // Quest indicator beacon above head
    if (questIndicator) {
      const beaconY = -35 + Math.sin(frame * 0.15) * 3;
      if (questIndicator === 'available') {
        // Golden exclamation mark
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('!', 0, beaconY);
      } else if (questIndicator === 'in_progress') {
        // Silver question mark
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('?', 0, beaconY);
      } else if (questIndicator === 'complete') {
        // Golden sparkling question mark
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('?', 0, beaconY);
      }
    }

    ctx.restore();
  }

  // Draw interactive objects (chest, switches, blocks, gates)
  static drawObject(
    ctx: CanvasRenderingContext2D,
    obj: { type: string; state: string; x: number; y: number; width: number; height: number; isLocked?: boolean; targetArea?: string },
    frame: number
  ) {
    ctx.save();
    ctx.translate(Math.round(obj.x), Math.round(obj.y));

    switch (obj.type) {
      case 'chest': {
        const isOpen = obj.state === 'open';
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-14, -6, 28, 16);

        // Chest base
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-12, -4, 24, 12);
        // Gold bands
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-12, -4, 3, 12);
        ctx.fillRect(9, -4, 3, 12);
        // Keyhole
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 0, 4, 4);

        // Lid
        if (isOpen) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-12, -14, 24, 8);
          // Gleam particles from open chest
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-4, -10, 8, 4);
        } else {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-13, -10, 26, 7);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-13, -10, 3, 7);
          ctx.fillRect(10, -10, 3, 7);
        }
        break;
      }

      case 'pressure_plate': {
        const isPressed = obj.state === 'active';
        ctx.fillStyle = isPressed ? '#1e293b' : '#334155';
        ctx.fillRect(-14, -14, 28, 28);
        ctx.strokeStyle = isPressed ? '#fbbf24' : '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-12, -12, 24, 24);

        // Central rune
        ctx.fillStyle = isPressed ? '#f59e0b' : '#0284c7';
        ctx.fillRect(-5, -5, 10, 10);
        break;
      }

      case 'movable_block': {
        // Heavy ancient rune boulder/block
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-14, -10, 28, 26);

        ctx.fillStyle = '#475569';
        ctx.fillRect(-14, -14, 28, 28);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-12, -12, 24, 24);
        // Ancient star glyph
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-3, -8, 6, 16);
        ctx.fillRect(-8, -3, 16, 6);
        break;
      }

      case 'locked_door': {
        const isUnlocked = obj.state === 'open' || obj.state === 'unlocked';
        if (isUnlocked) {
          // Open archway
          ctx.fillStyle = '#020617';
          ctx.fillRect(-20, -28, 40, 56);
        } else {
          // Iron portcullis gate
          ctx.fillStyle = '#090d16';
          ctx.fillRect(-20, -28, 40, 56);
          // Vertical iron bars
          ctx.fillStyle = '#94a3b8';
          for (let i = -16; i <= 16; i += 8) {
            ctx.fillRect(i, -28, 3, 56);
          }
          // Horizontal crossbeams
          ctx.fillRect(-20, -10, 40, 4);
          ctx.fillRect(-20, 10, 40, 4);

          // Golden padlock
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-6, -4, 12, 10);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-2, -1, 4, 4);
        }
        break;
      }

      case 'torch': {
        // Wall sconce or pedestal
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-3, 0, 6, 12);
        // Animated fire flame
        const flameOffset = Math.sin(frame * 0.4) * 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -4 + flameOffset, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -5 + flameOffset, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-1, -7 + flameOffset, 2, 3);
        break;
      }

      case 'portal': {
        const isLocked = !!obj.isLocked;
        const pulse = Math.sin(frame * 0.1) * 3;

        // Ground shadow / aura base
        ctx.fillStyle = isLocked ? 'rgba(239, 68, 68, 0.18)' : 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 26 + pulse, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isLocked) {
          // --- LOCKED / SEALED PORTAL ---
          // Dark obsidian rune base
          ctx.strokeStyle = 'rgba(153, 27, 27, 0.85)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.stroke();

          // Pulsing crimson barrier
          const sealPulse = Math.sin(frame * 0.15) * 0.2 + 0.7;
          ctx.fillStyle = `rgba(185, 28, 28, ${0.35 * sealPulse})`;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();

          // Rotating barrier spikes
          ctx.save();
          ctx.rotate(frame * -0.02);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x1 = Math.cos(angle) * 12;
            const y1 = Math.sin(angle) * 12;
            const x2 = Math.cos(angle) * 22;
            const y2 = Math.sin(angle) * 22;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
          ctx.restore();

          // Padlock Icon in Center
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(-6, -2, 12, 11);
          ctx.fillStyle = '#fca5a5';
          ctx.fillRect(-4, 0, 8, 7);
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -3, 5, Math.PI, 0, false);
          ctx.stroke();
          // Keyhole
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(-1.5, 2, 3, 4);

          // Top Floating Indicator: SEALED
          const floatY = Math.sin(frame * 0.08) * 2 - 28;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-24, floatY - 9, 48, 14);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.strokeRect(-24, floatY - 9, 48, 14);
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SEALED 🔒', 0, floatY + 2);
        } else {
          // --- ACTIVE WORKING PORTAL ---
          // Realm-themed color selection
          let outerColor = 'rgba(56, 189, 248, 0.85)';
          let innerColor = 'rgba(168, 85, 247, 0.85)';
          let coreColor = '#ffffff';

          const target = obj.targetArea;
          if (target === 'whispering_forest') {
            outerColor = 'rgba(34, 197, 94, 0.85)';
            innerColor = 'rgba(16, 185, 129, 0.85)';
            coreColor = '#bbf7d0';
          } else if (target === 'ancient_sanctum') {
            outerColor = 'rgba(245, 158, 11, 0.85)';
            innerColor = 'rgba(56, 189, 248, 0.85)';
            coreColor = '#fef08a';
          } else if (target === 'frozen_kingdom') {
            outerColor = 'rgba(56, 189, 248, 0.9)';
            innerColor = 'rgba(192, 132, 252, 0.85)';
            coreColor = '#e0f2fe';
          } else if (target === 'volcanic_wasteland') {
            outerColor = 'rgba(239, 68, 68, 0.9)';
            innerColor = 'rgba(249, 115, 22, 0.85)';
            coreColor = '#ffedd5';
          } else if (target === 'sunken_city') {
            outerColor = 'rgba(6, 182, 212, 0.9)';
            innerColor = 'rgba(14, 165, 233, 0.85)';
            coreColor = '#cffafe';
          } else if (target === 'dark_swamp') {
            outerColor = 'rgba(168, 85, 247, 0.9)';
            innerColor = 'rgba(132, 204, 22, 0.85)';
            coreColor = '#f3e8ff';
          } else if (target === 'sky_islands') {
            outerColor = 'rgba(14, 165, 233, 0.9)';
            innerColor = 'rgba(224, 242, 254, 0.9)';
            coreColor = '#ffffff';
          } else if (target === 'shadow_castle') {
            outerColor = 'rgba(124, 58, 237, 0.9)';
            innerColor = 'rgba(217, 70, 239, 0.85)';
            coreColor = '#fae8ff';
          } else if (target === 'celestial_fortress') {
            outerColor = 'rgba(251, 191, 36, 0.95)';
            innerColor = 'rgba(244, 114, 182, 0.9)';
            coreColor = '#fffbeb';
          }

          // Counter-rotating outer vortex
          ctx.save();
          ctx.rotate(frame * 0.05);
          ctx.strokeStyle = outerColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 22 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Swirling rune dashes
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = innerColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 16 + pulse * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          // Inner rotating energy core
          ctx.save();
          ctx.rotate(frame * -0.07);
          ctx.strokeStyle = innerColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Luminous bright center singularity
          ctx.fillStyle = coreColor;
          ctx.beginPath();
          ctx.arc(0, 0, 5 + Math.sin(frame * 0.2) * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Orbiting radiant spark particles
          for (let p = 0; p < 3; p++) {
            const angle = frame * 0.08 + (p * Math.PI * 2) / 3;
            const dist = 18 + Math.sin(frame * 0.15 + p) * 3;
            const sx = Math.cos(angle) * dist;
            const sy = Math.sin(angle) * dist;
            ctx.fillStyle = coreColor;
            ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
          }

          // Top Floating Indicator: PORTAL
          const floatY = Math.sin(frame * 0.08) * 2 - 28;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-22, floatY - 9, 44, 14);
          ctx.strokeStyle = outerColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(-22, floatY - 9, 44, 14);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PORTAL', 0, floatY + 2);
        }
        break;
      }

      case 'breakable_jar': {
        if (obj.state === 'open') {
          // Shattered ceramic fragments
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-8, 2, 4, 3);
          ctx.fillRect(4, 3, 5, 3);
          ctx.fillRect(-1, -2, 3, 3);
        } else {
          // Clay amphora/pot
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          // Neck & lip
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-4, -12, 8, 4);
          // Glaze stripe
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-7, -2, 14, 3);
        }
        break;
      }

      case 'checkpoint_crystal': {
        // Carved celestial stone plinth
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, 6, 24, 8);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-10, 4, 20, 2);
        // Ancient glyphs on base
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-6, 8, 3, 3);
        ctx.fillRect(3, 8, 3, 3);

        // Levitating glowing crystal
        const floatY = Math.sin(frame * 0.1) * 4;
        const crystalColor = obj.state === 'active' ? '#38bdf8' : '#e0f2fe';
        const glowColor = obj.state === 'active' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(224, 242, 254, 0.2)';

        // Glow aura
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(0, -6 + floatY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Crystal diamond
        ctx.fillStyle = crystalColor;
        ctx.beginPath();
        ctx.moveTo(0, -18 + floatY);
        ctx.lineTo(8, -6 + floatY);
        ctx.lineTo(0, 6 + floatY);
        ctx.lineTo(-8, -6 + floatY);
        ctx.closePath();
        ctx.fill();

        // Crystal facet specular highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -18 + floatY);
        ctx.lineTo(4, -6 + floatY);
        ctx.lineTo(0, 6 + floatY);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'fishing_spot': {
        const pulse = Math.sin(frame * 0.08) * 4;
        const ripple = (frame * 0.04) % 1;

        // Outer water ripple rings
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.7 * (1 - ripple)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 + ripple * 16, 9 + ripple * 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12 + pulse, 6 + pulse * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Water sparkle core
        ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Swimming fish shadow beneath surface
        const fishAngle = frame * 0.05;
        const fx = Math.cos(fishAngle) * 10;
        const fy = Math.sin(fishAngle) * 5;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 4, 2, fishAngle + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();

        // Occasional jumping fish animation (every ~3.5 seconds)
        const jumpPhase = (frame % 200) / 200;
        if (jumpPhase < 0.2) {
          const jp = jumpPhase / 0.2; // 0 to 1
          const jx = Math.sin(jp * Math.PI) * 12 - 6;
          const jy = -Math.sin(jp * Math.PI) * 18;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(jx, jy, 5, 2.5, jp > 0.5 ? 0.5 : -0.5, 0, Math.PI * 2);
          ctx.fill();
          // Water splash drops
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(jx - 2, jy + 3, 2, 2);
          ctx.fillRect(jx + 2, jy + 4, 1.5, 1.5);
        }

        // Sparkling floating glitter
        for (let i = 0; i < 3; i++) {
          const spAngle = frame * 0.06 + (i * Math.PI * 2) / 3;
          const spX = Math.cos(spAngle) * 14;
          const spY = Math.sin(spAngle) * 7;
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(spX - 1, spY - 1, 2, 2);
        }

        // Floating Tag
        const floatTag = Math.sin(frame * 0.09) * 2 - 22;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(-22, floatTag - 8, 44, 13);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-22, floatTag - 8, 44, 13);
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText('🐟 FISH', 0, floatTag + 2);
        break;
      }

      case 'barrel': {
        const isSmashed = obj.state === 'open';
        if (isSmashed) {
          // Shattered wooden staves
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-9, 2, 5, 3);
          ctx.fillRect(3, 4, 6, 3);
          ctx.fillRect(-2, 0, 4, 3);
          ctx.fillStyle = '#64748b'; // iron band fragment
          ctx.fillRect(5, 6, 3, 2);
        } else {
          // Intact wooden barrel
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(-8, 5, 16, 5);
          // Oak wood body
          ctx.fillStyle = '#92400e';
          ctx.fillRect(-8, -10, 16, 17);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-6, -9, 12, 15);
          // Iron hoops
          ctx.fillStyle = '#475569';
          ctx.fillRect(-8, -7, 16, 2);
          ctx.fillRect(-8, 2, 16, 2);
        }
        break;
      }

      case 'crate': {
        const isBroken = obj.state === 'open';
        if (isBroken) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-10, 1, 6, 4);
          ctx.fillRect(2, 3, 7, 3);
          ctx.fillRect(-3, -2, 5, 4);
        } else {
          // Wooden cargo box with cross brace
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(-9, 6, 18, 5);
          ctx.fillStyle = '#a16207';
          ctx.fillRect(-9, -9, 18, 18);
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(-7, -7, 14, 14);
          // Cross lines
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-7, -7);
          ctx.lineTo(7, 7);
          ctx.moveTo(7, -7);
          ctx.lineTo(-7, 7);
          ctx.stroke();
        }
        break;
      }

      case 'campfire': {
        // Stone ring
        ctx.fillStyle = '#475569';
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          const sx = Math.cos(angle) * 11;
          const sy = Math.sin(angle) * 7;
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Logs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-8, -2, 16, 4);
        ctx.fillRect(-2, -6, 4, 12);
        // Flame
        const fProg = Math.sin(frame * 0.3) * 2;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, -6 + fProg, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -7 + fProg, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -9 + fProg, 2, 3);

        // Campfire Rest Tag
        const floatY = Math.sin(frame * 0.08) * 2 - 24;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(-20, floatY - 8, 40, 13);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(-20, floatY - 8, 40, 13);
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('🔥 REST', 0, floatY + 2);
        break;
      }

      case 'sign': {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-2, -3, 4, 14);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-11, -12, 22, 11);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        ctx.strokeRect(-11, -12, 22, 11);
        // Lines of text
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-8, -9, 16, 2);
        ctx.fillRect(-8, -5, 12, 2);
        break;
      }

      case 'bookshelf': {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-12, -18, 24, 26);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-10, -16, 20, 10);
        ctx.fillRect(-10, -3, 20, 9);
        // Books
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -15, 4, 8);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-3, -15, 4, 8);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(2, -15, 4, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-7, -2, 5, 7);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-1, -2, 4, 7);
        break;
      }

      case 'ancient_statue': {
        // Grand Stone Sentinel Statue
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14, -26, 28, 32);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-12, -24, 24, 28);
        // Glowing cyan eye visor
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-6, -18, 12, 3);
        // Broadsword embedded in stone
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-2, -12, 4, 16);
        break;
      }

      case 'magic_shrine': {
        // Stone dais
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -4, 28, 12);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, -6, 24, 4);
        // Floating Magic Sphere
        const orbFloat = Math.sin(frame * 0.1) * 3;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.beginPath();
        ctx.arc(0, -18 + orbFloat, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(0, -18 + orbFloat, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -20 + orbFloat, 2, 2);
        break;
      }
    }

    ctx.restore();
  }

  // Draw fishing line & rod connecting player to water bobber
  static drawFishingLine(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    spotX: number,
    spotY: number,
    frame: number,
    isBite: boolean
  ) {
    ctx.save();

    // Line from player rod tip to water bobber
    const rodTipX = px + 14;
    const rodTipY = py - 8;
    const bobberX = spotX;
    const bobberY = spotY + Math.sin(frame * 0.15) * 2;

    // Curved fishing line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rodTipX, rodTipY);
    const midX = (rodTipX + bobberX) / 2;
    const midY = Math.min(rodTipY, bobberY) - 10 + (isBite ? 6 : 0);
    ctx.quadraticCurveTo(midX, midY, bobberX, bobberY);
    ctx.stroke();

    // Floating Red/White Bobber
    ctx.fillStyle = '#ef4444'; // Red top
    ctx.beginPath();
    ctx.arc(bobberX, bobberY - 2, 4, Math.PI, 0, false);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // White bottom
    ctx.beginPath();
    ctx.arc(bobberX, bobberY - 2, 4, 0, Math.PI, false);
    ctx.fill();

    // Water ripple at bobber
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(bobberX, bobberY + 2, 6, 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Exclamation mark when bite triggers!
    if (isBite) {
      const biteY = bobberY - 18 + Math.sin(frame * 0.4) * 2;
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', bobberX, biteY);
      // Glow circle behind exclamation
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(bobberX, biteY - 6, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // High-fidelity Tile & Biome Renderer for all 10 distinct RPG Realms
  static drawTile(
    ctx: CanvasRenderingContext2D,
    areaId: string,
    tile: number,
    tx: number,
    ty: number,
    ts: number,
    frame: number,
    r: number,
    c: number
  ) {
    const wave = Math.sin(frame * 0.05 + c * 0.5 + r * 0.3) * 2;

    switch (areaId) {
      // 1. SKYFALL VILLAGE: Lush emerald village, cobblestones, peaceful river, timber houses
      case 'skyfall_village': {
        if (tile === 3) {
          // Animated clear village river
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 2, ty + 6 + wave, ts - 4, 2);
          ctx.fillRect(tx + 6, ty + 18 - wave, ts - 12, 2);
          // Lilypad
          if ((r * 5 + c * 7) % 7 === 0) {
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(tx + 16, ty + 16, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(tx + 15, ty + 15, 2, 2);
          }
        } else if (tile === 2) {
          // Cobblestone path
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(tx + 1, ty + 1, ts - 2, ts - 2);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 2, ty + 2, ts - 4, ts - 4);
        } else if (tile === 1) {
          // Village buildings / wooden fences / stone walls
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tx + 2, ty + 2, ts - 4, ts - 4);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(tx + 4, ty + 4, ts - 8, ts - 8);
        } else if (tile === 4) {
          // Flower Garden patch
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(tx, ty, ts, ts);
          const flowerColors = ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8'];
          const fc = flowerColors[(r + c) % flowerColors.length];
          ctx.fillStyle = fc;
          ctx.beginPath();
          ctx.arc(tx + 10, ty + 10, 3, 0, Math.PI * 2);
          ctx.arc(tx + 22, ty + 20, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Grass
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(tx + 6, ty + 8, 3, 3);
          ctx.fillRect(tx + 20, ty + 18, 3, 3);
        }
        break;
      }

      // 2. WHISPERING FOREST: Deep ancient canopy, moss, winding forest river, glowing mushrooms
      case 'whispering_forest': {
        if (tile === 3) {
          // Forest River with floating fallen leaves
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 3, ty + 8 + wave, ts - 6, 2);
          // Floating leaf
          if ((r + c * 3) % 5 === 0) {
            ctx.fillStyle = '#84cc16';
            ctx.fillRect(tx + 12 + wave, ty + 12, 4, 3);
          }
        } else if (tile === 2) {
          // Dirt forest trail
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tx + 4, ty + 6, 4, 4);
        } else if (tile === 1) {
          // Massive ancient oak tree trunks & dense woods
          ctx.fillStyle = '#052e16';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(tx + 16, ty + 16, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.arc(tx + 16, ty + 16, 9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Mossy forest floor with bioluminescent mushrooms
          ctx.fillStyle = '#14532d';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(tx + 4, ty + 12, 4, 4);
          if ((r * 3 + c * 7) % 13 === 0) {
            ctx.fillStyle = '#a855f7'; // Glowing purple mushroom
            ctx.beginPath();
            ctx.arc(tx + 14, ty + 14, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      // 3. ANCIENT SANCTUM: Slate runes, cyan energy conduits, flooded temple pools
      case 'ancient_sanctum': {
        if (tile === 3) {
          // Flooded sanctuary waters
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(tx + 4, ty + 8 + wave, ts - 8, 2);
        } else if (tile === 2) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 4, ty + 4, ts - 8, ts - 8);
        } else if (tile === 1) {
          // Ancient carved granite fortress wall
          ctx.fillStyle = '#020617';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(tx + 2, ty + 2, ts - 4, ts - 4);
          ctx.fillStyle = '#38bdf8'; // Glowing rune symbol
          if ((r + c) % 4 === 0) ctx.fillRect(tx + 14, ty + 14, 4, 4);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx, ty, ts, ts);
        }
        break;
      }

      // 4. FROZEN KINGDOM: Frost tiles, ice floes, sub-zero glacial lakes
      case 'frozen_kingdom': {
        if (tile === 3) {
          // Glacial ice water with floating ice shards
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(tx + 6, ty + 6 + wave, 12, 8);
        } else if (tile === 2) {
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(tx, ty, ts, ts);
        } else if (tile === 1) {
          // Giant frost spires / glacier pillars
          ctx.fillStyle = '#0c4a6e';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 4, ty + 4, ts - 8, ts - 8);
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(tx + 8, ty + 8, ts - 16, ts - 16);
        } else {
          // Snow and permafrost
          ctx.fillStyle = '#f0f9ff';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(tx + 6, ty + 6, 6, 6);
        }
        break;
      }

      // 5. VOLCANIC WASTELAND: Basalt stone, glowing molten magma rivers, obsidian pillars
      case 'volcanic_wasteland': {
        if (tile === 3) {
          // Liquid bubbling magma
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(tx + 2, ty + 4 + wave, ts - 4, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(tx + 8, ty + 12 + wave, 8, 3);
        } else if (tile === 2) {
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(tx, ty, ts, ts);
        } else if (tile === 1) {
          // Obsidian columns
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(tx + 14, ty + 14, 4, 4);
        } else {
          // Scorched volcanic crust
          ctx.fillStyle = '#292524';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#44403c';
          ctx.fillRect(tx + 4, ty + 4, 6, 6);
          if ((r + c * 2) % 9 === 0) {
            ctx.fillStyle = '#ef4444'; // Glowing magma crack
            ctx.fillRect(tx + 10, ty + 14, 12, 2);
          }
        }
        break;
      }

      // 6. SUNKEN CITY: Submerged marble ruins, bioluminescent turquoise water, sea kelp
      case 'sunken_city': {
        if (tile === 3) {
          // Deep abyssal water
          ctx.fillStyle = '#0e7490';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(tx + 3, ty + 6 + wave, ts - 6, 2);
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(tx + 10, ty + 18 - wave, 8, 2);
        } else if (tile === 2) {
          ctx.fillStyle = '#164e63';
          ctx.fillRect(tx, ty, ts, ts);
        } else if (tile === 1) {
          // Submerged classical pillars
          ctx.fillStyle = '#083344';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#155e75';
          ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6);
        } else {
          ctx.fillStyle = '#155e75';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#0e7490';
          ctx.fillRect(tx + 6, ty + 6, 8, 8);
        }
        break;
      }

      // 7. DARK SWAMP: Murky poison bog, rotten logs, glowing spore mushrooms
      case 'dark_swamp': {
        if (tile === 3) {
          // Murky toxic green bog water
          ctx.fillStyle = '#365314';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#4d7c0f';
          ctx.fillRect(tx + 4, ty + 8 + wave, ts - 8, 2);
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(tx + 12, ty + 16, 4, 3);
        } else if (tile === 2) {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(tx, ty, ts, ts);
        } else if (tile === 1) {
          // Rotten twisted swamp cypress
          ctx.fillStyle = '#18181b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#27272a';
          ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6);
        } else {
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#292524';
          ctx.fillRect(tx + 4, ty + 6, 6, 6);
        }
        break;
      }

      // 8. SKY ISLANDS: Golden floating earth, cloud streams, stellar pools
      case 'sky_islands': {
        if (tile === 3) {
          // Floating celestial clouds / sky void
          ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(tx + 16, ty + 16 + wave, 12, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 2) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(tx, ty, ts, ts);
        } else if (tile === 1) {
          // Floating sky stone spires
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6);
        } else {
          // Golden floating prairie
          ctx.fillStyle = '#eab308';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(tx + 6, ty + 6, 6, 6);
        }
        break;
      }

      // 9. SHADOW CASTLE: Void stone, dark purple moats, sinister gargoyles
      case 'shadow_castle': {
        if (tile === 3) {
          // Void moat
          ctx.fillStyle = '#3b0764';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#7e22ce';
          ctx.fillRect(tx + 4, ty + 8 + wave, ts - 8, 2);
        } else if (tile === 2) {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.strokeStyle = '#581c87';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 2, ty + 2, ts - 4, ts - 4);
        } else if (tile === 1) {
          // Shadow Citadel Ramparts
          ctx.fillStyle = '#09090b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#2e1065';
          ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6);
        } else {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#27272a';
          ctx.fillRect(tx + 4, ty + 4, 6, 6);
        }
        break;
      }

      // 10. CELESTIAL FORTRESS: Pure white/gold marble, cosmic star conduits, divine sanctuary
      default: {
        if (tile === 3) {
          // Starlight cosmic pool
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(tx + 4, ty + 8 + wave, ts - 8, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tx + 14, ty + 14, 3, 3);
        } else if (tile === 2) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 3, ty + 3, ts - 6, ts - 6);
        } else if (tile === 1) {
          // Golden Celestial Pillars
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tx + 6, ty + 6, ts - 12, ts - 12);
        } else {
          // Divine pearl marble floor
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(tx, ty, ts, ts);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx, ty, ts, ts);
        }
        break;
      }
    }
  }

  // Draw Telegraph warning area for enemy/boss heavy attacks
  static drawTelegraph(
    ctx: CanvasRenderingContext2D,
    area: { x: number; y: number; radius?: number; width?: number; height?: number; type: 'circle' | 'line' | 'cone' },
    timerProgress: number // 0 to 1
  ) {
    ctx.save();
    ctx.translate(Math.round(area.x), Math.round(area.y));

    if (area.type === 'circle' && area.radius) {
      // Outer warning zone
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, area.radius, 0, Math.PI * 2);
      ctx.fill();

      // Expanding charge indicator
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, area.radius * timerProgress, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, area.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (area.type === 'line' && area.width && area.height) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(-area.width / 2, -area.height / 2, area.width, area.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(-area.width / 2, -area.height / 2, area.width, area.height);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.fillRect(-area.width / 2, -area.height / 2, area.width * timerProgress, area.height);
    }

    ctx.restore();
  }
}
