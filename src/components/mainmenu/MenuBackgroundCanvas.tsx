import React, { useRef, useEffect } from 'react';

export type AtmosphereType = 'day' | 'sunset' | 'night';

interface MenuBackgroundCanvasProps {
  atmosphere: AtmosphereType;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  swaySpeed: number;
  swayDist: number;
}

interface Bird {
  x: number;
  y: number;
  speed: number;
  size: number;
  wingTimer: number;
}

export const MenuBackgroundCanvas: React.FC<MenuBackgroundCanvasProps> = ({
  atmosphere,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Camera smoothing
    let camX = 0;
    let camY = 0;

    // Time & animation trackers
    let time = 0;

    // Cloud layers positions
    const clouds = [
      { x: 50, y: height * 0.18, speed: 0.12, width: 220, height: 60, scale: 0.9 },
      { x: 380, y: height * 0.28, speed: 0.18, width: 280, height: 75, scale: 1.1 },
      { x: 800, y: height * 0.14, speed: 0.14, width: 250, height: 65, scale: 1.0 },
      { x: 1200, y: height * 0.22, speed: 0.2, width: 320, height: 85, scale: 1.2 },
      { x: 1600, y: height * 0.16, speed: 0.11, width: 210, height: 55, scale: 0.8 },
    ];

    // Flying birds/creatures
    const birds: Bird[] = [
      { x: -50, y: height * 0.25, speed: 1.4, size: 4, wingTimer: 0 },
      { x: -120, y: height * 0.28, speed: 1.2, size: 3.5, wingTimer: 0.5 },
      { x: -200, y: height * 0.23, speed: 1.6, size: 3, wingTimer: 1.0 },
    ];

    // Ambient floating particles (embers/leaves/motes)
    const particles: Particle[] = [];
    const maxParticles = 65;

    const spawnParticle = (): Particle => {
      const isNight = atmosphere === 'night';
      const isSunset = atmosphere === 'sunset';
      let color = '#fef08a';
      if (isNight) {
        color = Math.random() < 0.6 ? '#67e8f9' : '#a7f3d0'; // celestial cyan/firefly green
      } else if (isSunset) {
        color = Math.random() < 0.5 ? '#f97316' : '#fde047'; // amber embers
      } else {
        color = Math.random() < 0.4 ? '#ec4899' : '#38bdf8'; // cherry petals or sky motes
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 0.8 + 0.4) * (Math.random() < 0.2 ? -1 : 1),
        vy: Math.random() * 0.6 + 0.2,
        size: Math.random() * 2.5 + 1.2,
        color,
        alpha: 0,
        maxAlpha: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: Math.random() * 260 + 140,
        swaySpeed: Math.random() * 0.04 + 0.02,
        swayDist: Math.random() * 20 + 8,
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(spawnParticle());
    }

    // Stars for night atmosphere
    const stars: { x: number; y: number; size: number; baseAlpha: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.55,
        size: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
      });
    }

    // Character idle variables
    let headTurnTimer = 0;
    let headTurnAngle = 0;
    let swordGlintTimer = 0;

    const render = () => {
      time += 0.016;

      // Stable fixed camera (no mouse following)
      camX = 0;
      camY = 0;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // 1. SKY GRADIENT & CELESTIAL BODIES
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (atmosphere === 'day') {
        skyGrad.addColorStop(0, '#0284c7'); // Rich Sky Blue
        skyGrad.addColorStop(0.35, '#38bdf8'); // Azure
        skyGrad.addColorStop(0.7, '#bae6fd'); // Light Cyan
        skyGrad.addColorStop(1, '#fef08a'); // Warm Horizon
      } else if (atmosphere === 'sunset') {
        skyGrad.addColorStop(0, '#311042'); // Deep Twilight Violet
        skyGrad.addColorStop(0.3, '#701a75'); // Magenta
        skyGrad.addColorStop(0.65, '#ea580c'); // Radiant Orange
        skyGrad.addColorStop(0.9, '#f59e0b'); // Golden Amber
        skyGrad.addColorStop(1, '#fef08a'); // Warm Gold Horizon
      } else {
        // Night
        skyGrad.addColorStop(0, '#030712'); // Pitch Void
        skyGrad.addColorStop(0.35, '#0f172a'); // Deep Midnight
        skyGrad.addColorStop(0.7, '#1e1b4b'); // Celestial Indigo
        skyGrad.addColorStop(1, '#1e293b'); // Horizon Mist
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Night Stars
      if (atmosphere === 'night') {
        ctx.save();
        for (const star of stars) {
          const sx = star.x * width + camX * 0.08;
          const sy = star.y * height + camY * 0.08;
          const twinkle = Math.sin(time * 3 * star.twinkleSpeed * 50) * 0.35 + 0.65;
          ctx.fillStyle = `rgba(224, 242, 254, ${star.baseAlpha * twinkle})`;
          ctx.fillRect(sx, sy, star.size, star.size);
        }
        ctx.restore();
      }

      // Sun or Moon
      ctx.save();
      const celestialX = width * (atmosphere === 'sunset' ? 0.45 : 0.68) + camX * 0.12;
      const celestialY = height * (atmosphere === 'sunset' ? 0.48 : 0.22) + camY * 0.12;

      if (atmosphere === 'night') {
        // Crescent Moon
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Moon shadow cutout to make crescent
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(celestialX + 12, celestialY - 6, 26, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sun with soft halo
        const sunRadius = atmosphere === 'sunset' ? 44 : 38;
        const sunGlow = ctx.createRadialGradient(
          celestialX,
          celestialY,
          sunRadius * 0.3,
          celestialX,
          celestialY,
          sunRadius * 4
        );
        const sunColor = atmosphere === 'sunset' ? 'rgba(251, 146, 60,' : 'rgba(254, 240, 138,';
        sunGlow.addColorStop(0, sunColor + ' 0.9)');
        sunGlow.addColorStop(0.3, sunColor + ' 0.4)');
        sunGlow.addColorStop(1, sunColor + ' 0)');

        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, sunRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = atmosphere === 'sunset' ? '#ffedd5' : '#ffffff';
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // God rays / Light shafts
        ctx.save();
        ctx.globalAlpha = atmosphere === 'sunset' ? 0.18 : 0.12;
        ctx.fillStyle = atmosphere === 'sunset' ? '#f59e0b' : '#ffffff';
        for (let r = 0; r < 5; r++) {
          const rayAngle = (r * 0.25 - 0.5) + Math.sin(time * 0.3 + r) * 0.05;
          ctx.beginPath();
          ctx.moveTo(celestialX, celestialY);
          ctx.lineTo(celestialX + Math.cos(rayAngle) * width * 1.2 - 120, celestialY + Math.sin(rayAngle) * height * 1.2);
          ctx.lineTo(celestialX + Math.cos(rayAngle) * width * 1.2 + 120, celestialY + Math.sin(rayAngle) * height * 1.2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();

      // ==========================================
      // 2. PARALLAX CLOUDS (DEEP LAYER)
      // ==========================================
      ctx.save();
      for (const cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width * cloud.scale < -100) {
          cloud.x = width + 100;
        }

        const cx = cloud.x + camX * 0.25;
        const cy = cloud.y + camY * 0.2;
        const cloudGrad = ctx.createLinearGradient(cx, cy - 30, cx, cy + 30);

        if (atmosphere === 'day') {
          cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
          cloudGrad.addColorStop(1, 'rgba(224, 242, 254, 0.45)');
        } else if (atmosphere === 'sunset') {
          cloudGrad.addColorStop(0, 'rgba(253, 186, 116, 0.65)');
          cloudGrad.addColorStop(1, 'rgba(194, 65, 12, 0.35)');
        } else {
          cloudGrad.addColorStop(0, 'rgba(30, 41, 59, 0.55)');
          cloudGrad.addColorStop(1, 'rgba(15, 23, 42, 0.25)');
        }

        ctx.fillStyle = cloudGrad;
        // Draw fluffy pixel-style cloud puffs
        const cw = cloud.width * cloud.scale;
        const ch = cloud.height * cloud.scale;
        ctx.beginPath();
        ctx.ellipse(cx + cw * 0.5, cy, cw * 0.45, ch * 0.35, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + cw * 0.3, cy - ch * 0.15, cw * 0.25, ch * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + cw * 0.68, cy - ch * 0.1, cw * 0.28, ch * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ==========================================
      // 3. DISTANT MOUNTAINS & FLOATING SKY ISLANDS
      // ==========================================
      const mountainY = height * 0.62 + camY * 0.4;
      ctx.save();
      const mountainGrad = ctx.createLinearGradient(0, mountainY - 140, 0, height);
      if (atmosphere === 'day') {
        mountainGrad.addColorStop(0, '#38bdf8');
        mountainGrad.addColorStop(0.5, '#0284c7');
        mountainGrad.addColorStop(1, '#0369a1');
      } else if (atmosphere === 'sunset') {
        mountainGrad.addColorStop(0, '#7c2d12');
        mountainGrad.addColorStop(0.5, '#4c1d95');
        mountainGrad.addColorStop(1, '#311042');
      } else {
        mountainGrad.addColorStop(0, '#1e293b');
        mountainGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = mountainGrad;
      ctx.beginPath();
      ctx.moveTo(-50, height);
      const mOffsetX = camX * 0.35;
      ctx.lineTo(-50, mountainY);
      ctx.lineTo(width * 0.12 + mOffsetX, mountainY - 80);
      ctx.lineTo(width * 0.26 + mOffsetX, mountainY - 20);
      ctx.lineTo(width * 0.4 + mOffsetX, mountainY - 110);
      ctx.lineTo(width * 0.58 + mOffsetX, mountainY - 45);
      ctx.lineTo(width * 0.75 + mOffsetX, mountainY - 130);
      ctx.lineTo(width * 0.9 + mOffsetX, mountainY - 40);
      ctx.lineTo(width + 50, mountainY - 90);
      ctx.lineTo(width + 50, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Floating Sky Island in mid-distance
      ctx.save();
      const islandX = width * 0.28 + camX * 0.55;
      const islandY = height * 0.45 + camY * 0.55;
      const islandBob = Math.sin(time * 0.8) * 6;

      ctx.fillStyle = atmosphere === 'night' ? '#1e293b' : atmosphere === 'sunset' ? '#581c87' : '#0369a1';
      // Island base (inverted triangle)
      ctx.beginPath();
      ctx.moveTo(islandX - 90, islandY + islandBob);
      ctx.lineTo(islandX + 90, islandY + islandBob);
      ctx.lineTo(islandX + 15, islandY + 65 + islandBob);
      ctx.lineTo(islandX - 25, islandY + 45 + islandBob);
      ctx.closePath();
      ctx.fill();

      // Island lush top
      ctx.fillStyle = atmosphere === 'night' ? '#0f766e' : atmosphere === 'sunset' ? '#b45309' : '#15803d';
      ctx.fillRect(islandX - 94, islandY - 6 + islandBob, 188, 12);

      // Waterfall spilling from island into sky
      const waterGrad = ctx.createLinearGradient(0, islandY + islandBob, 0, islandY + 110 + islandBob);
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      waterGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(islandX + 22, islandY + islandBob, 6, 95);

      // Glowing crystal on island
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(islandX - 30, islandY - 26 + islandBob);
      ctx.lineTo(islandX - 24, islandY - 4 + islandBob);
      ctx.lineTo(islandX - 36, islandY - 4 + islandBob);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Distant Fantasy Castle Citadel on high cliff left
      ctx.save();
      const castleX = width * 0.08 + camX * 0.6;
      const castleY = height * 0.54 + camY * 0.6;
      ctx.fillStyle = atmosphere === 'night' ? '#0f172a' : atmosphere === 'sunset' ? '#3b0764' : '#1e3a5f';

      // Towers & battlements
      ctx.fillRect(castleX, castleY - 60, 22, 60);
      ctx.fillRect(castleX + 32, castleY - 95, 26, 95);
      ctx.fillRect(castleX + 68, castleY - 55, 20, 55);
      // Roof cones
      ctx.beginPath();
      ctx.moveTo(castleX - 3, castleY - 60);
      ctx.lineTo(castleX + 11, castleY - 80);
      ctx.lineTo(castleX + 25, castleY - 60);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(castleX + 28, castleY - 95);
      ctx.lineTo(castleX + 45, castleY - 125);
      ctx.lineTo(castleX + 62, castleY - 95);
      ctx.fill();

      // Lit Windows
      ctx.fillStyle = atmosphere === 'night' ? '#fef08a' : '#fde047';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 8;
      ctx.fillRect(castleX + 41, castleY - 70, 7, 10);
      ctx.fillRect(castleX + 41, castleY - 45, 7, 10);
      ctx.fillRect(castleX + 8, castleY - 40, 6, 8);
      ctx.restore();

      // ==========================================
      // 4. BIRDS / SKY FLIERS
      // ==========================================
      ctx.save();
      for (const bird of birds) {
        bird.x += bird.speed;
        bird.wingTimer += 0.15;
        if (bird.x > width + 100) {
          bird.x = -80;
          bird.y = height * (0.15 + Math.random() * 0.25);
        }
        const bx = bird.x + camX * 0.5;
        const by = bird.y + Math.sin(bird.wingTimer * 0.5) * 6 + camY * 0.5;
        const wingY = Math.sin(bird.wingTimer) * 4;

        ctx.strokeStyle = atmosphere === 'night' ? '#64748b' : '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - bird.size * 2, by - wingY);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + bird.size * 2, by - wingY);
        ctx.stroke();
      }
      ctx.restore();

      // ==========================================
      // 5. MIDGROUND SWAYING TREES
      // ==========================================
      ctx.save();
      const treeBaseY = height * 0.72 + camY * 0.8;
      const windSway = Math.sin(time * 2.2) * 4;

      for (let t = 0; t < 6; t++) {
        const tx = width * (0.05 + t * 0.18) + camX * 0.75;
        const treeH = 90 + (t % 3) * 20;

        // Trunk
        ctx.fillStyle = atmosphere === 'night' ? '#0f172a' : '#3d1c06';
        ctx.fillRect(tx, treeBaseY - treeH * 0.3, 10, treeH * 0.3);

        // Pine layers
        ctx.fillStyle =
          atmosphere === 'night'
            ? '#064e3b'
            : atmosphere === 'sunset'
            ? '#78350f'
            : '#14532d';

        for (let l = 0; l < 3; l++) {
          const ly = treeBaseY - treeH * 0.3 - l * 26;
          const lw = 44 - l * 8;
          ctx.beginPath();
          ctx.moveTo(tx + 5 - lw + windSway * (l + 1) * 0.5, ly);
          ctx.lineTo(tx + 5 + lw + windSway * (l + 1) * 0.5, ly);
          ctx.lineTo(tx + 5 + windSway * (l + 2) * 0.5, ly - 32);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();

      // ==========================================
      // 6. FOREGROUND CLIFF & STONE RUIN (RIGHT/CENTER)
      // ==========================================
      ctx.save();
      const cliffStartX = width * 0.42 + camX * 1.1;
      const cliffTopY = height * 0.68 + camY * 1.1;

      // Dark Cliff Rock Mass
      const rockGrad = ctx.createLinearGradient(0, cliffTopY, 0, height);
      if (atmosphere === 'night') {
        rockGrad.addColorStop(0, '#1e293b');
        rockGrad.addColorStop(1, '#020617');
      } else if (atmosphere === 'sunset') {
        rockGrad.addColorStop(0, '#451a03');
        rockGrad.addColorStop(1, '#180701');
      } else {
        rockGrad.addColorStop(0, '#334155');
        rockGrad.addColorStop(1, '#0f172a');
      }

      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(cliffStartX, height + 20);
      ctx.lineTo(cliffStartX + 30, cliffTopY + 40);
      ctx.lineTo(cliffStartX + 80, cliffTopY + 12);
      ctx.lineTo(cliffStartX + 160, cliffTopY);
      ctx.lineTo(width + 40, cliffTopY);
      ctx.lineTo(width + 40, height + 20);
      ctx.closePath();
      ctx.fill();

      // Lush Grassy Top Edge
      ctx.fillStyle = atmosphere === 'night' ? '#065f46' : atmosphere === 'sunset' ? '#854d0e' : '#16a34a';
      ctx.beginPath();
      ctx.moveTo(cliffStartX + 70, cliffTopY + 14);
      ctx.lineTo(cliffStartX + 160, cliffTopY);
      ctx.lineTo(width + 40, cliffTopY);
      ctx.lineTo(width + 40, cliffTopY + 16);
      ctx.lineTo(cliffStartX + 65, cliffTopY + 22);
      ctx.closePath();
      ctx.fill();

      // Swaying Grass blades on the cliff top
      const grassSway = Math.sin(time * 3.5) * 3;
      ctx.strokeStyle = atmosphere === 'night' ? '#10b981' : '#4ade80';
      ctx.lineWidth = 2;
      for (let g = 0; g < 40; g++) {
        const gx = cliffStartX + 100 + g * ((width - cliffStartX - 80) / 40);
        const gy = cliffTopY;
        ctx.beginPath();
        ctx.moveTo(gx, gy + 3);
        ctx.lineTo(gx + grassSway + (g % 2 === 0 ? 2 : -1), gy - 9 - (g % 3) * 3);
        ctx.stroke();
      }

      // Ancient Stone Celestial Pillar on the edge
      const pillarX = cliffStartX + 135;
      const pillarY = cliffTopY - 48;
      ctx.fillStyle = atmosphere === 'night' ? '#334155' : '#475569';
      ctx.fillRect(pillarX, pillarY, 18, 55);
      ctx.fillRect(pillarX - 4, pillarY, 26, 6);
      ctx.fillRect(pillarX - 4, pillarY + 48, 26, 8);

      // Glowing Celestial Rune on Pillar
      const runePulse = Math.sin(time * 2) * 0.4 + 0.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10 * runePulse;
      ctx.fillStyle = `rgba(56, 189, 248, ${runePulse})`;
      ctx.fillRect(pillarX + 6, pillarY + 14, 6, 20);
      ctx.fillRect(pillarX + 3, pillarY + 22, 12, 4);

      // Hanging Rune Lantern
      const lanternSwing = Math.sin(time * 2.5) * 4;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pillarX + 22, pillarY + 6);
      ctx.lineTo(pillarX + 22 + lanternSwing * 0.5, pillarY + 24);
      ctx.stroke();

      // Lantern Glass & Glow
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fillRect(pillarX + 18 + lanternSwing * 0.5, pillarY + 24, 8, 10);
      ctx.restore();

      // ==========================================
      // 7. AERON ON THE CLIFF LEDGE (LIVING ANIMATION)
      // ==========================================
      ctx.save();
      const aeronX = width * 0.72 + camX * 1.15;
      const aeronY = cliffTopY - 2 + camY * 1.15;

      // Character Breathing & Bobbing
      const breathBob = Math.sin(time * 2.5) * 1.5;

      // Head turn periodic timer
      headTurnTimer += 0.016;
      if (headTurnTimer > 4.5) {
        headTurnAngle = Math.sin((headTurnTimer - 4.5) * 4) * 2;
        if (headTurnTimer > 6.0) headTurnTimer = 0;
      } else {
        headTurnAngle = 0;
      }

      // Sword glint periodic timer
      swordGlintTimer += 0.016;
      const isSwordGlint = (swordGlintTimer % 5.0) < 0.3;

      // Cast Shadow on cliff
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(aeronX, aeronY + 2, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scale character up slightly for heroic prominence
      ctx.translate(aeronX, aeronY);
      ctx.scale(1.85, 1.85);

      // --- DYNAMIC FLOWING CAPE (WIND PHYSICS) ---
      ctx.fillStyle = '#1d4ed8'; // Azure royal cape
      ctx.beginPath();
      const capeWave1 = Math.sin(time * 5.0) * 4.5;
      const capeWave2 = Math.sin(time * 5.0 + 1.2) * 6.5;
      ctx.moveTo(-6, -18 + breathBob);
      ctx.lineTo(4, -18 + breathBob);
      ctx.lineTo(8 + capeWave1, -2 + breathBob);
      ctx.lineTo(14 + capeWave2, 8 + breathBob);
      ctx.lineTo(2 + capeWave2, 10 + breathBob);
      ctx.lineTo(-7 + capeWave1, 4 + breathBob);
      ctx.closePath();
      ctx.fill();

      // Cape Gold Trim
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // --- LEGS & GREAVES ---
      // Left leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-6, -4, 4, 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-6, 2, 4, 4); // Greave plate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, 6, 6, 3); // Boot

      // Right leg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -4, 4, 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 2, 4, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1, 6, 6, 3);

      // --- TORSO & CHESTPLATE ---
      ctx.fillStyle = '#334155'; // Dark steel cuirass
      ctx.fillRect(-7, -19 + breathBob, 14, 15);
      // Gold chest emblem / trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-2, -16 + breathBob, 4, 8);
      ctx.fillRect(-5, -14 + breathBob, 10, 3);

      // Belt & Gold Buckle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -5 + breathBob, 14, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -5 + breathBob, 4, 3);

      // --- SHEATHED SWORD / HILT AT WAIST ---
      ctx.save();
      ctx.translate(-8, -8 + breathBob);
      ctx.rotate(-0.55);
      // Scabbard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 4, 22);
      // Gold scabbard tip & collar
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-0.5, 0, 5, 2.5);
      ctx.fillRect(0, 19, 4, 3);
      // Crossguard
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-4, -2, 12, 2.5);
      // Pommel & grip
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(0.5, -8, 3, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, -9.5, 4, 2);

      // Sword glint star
      if (isSwordGlint) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 8;
        ctx.fillRect(1, -2, 2, 2);
        ctx.fillRect(-1, -1, 6, 1);
        ctx.fillRect(1.5, -3.5, 1, 6);
      }
      ctx.restore();

      // --- ARMS & PAULDRONS ---
      // Left arm (resting on hip)
      ctx.fillStyle = '#475569';
      ctx.fillRect(-9, -19 + breathBob, 3, 10);
      // Left pauldron
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-10, -20 + breathBob, 4, 5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-10, -21 + breathBob, 4, 1.5);

      // Right arm (holding cape or relaxed)
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, -19 + breathBob, 3, 11);
      // Right pauldron
      ctx.fillStyle = '#64748b';
      ctx.fillRect(6, -20 + breathBob, 4, 5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(6, -21 + breathBob, 4, 1.5);

      // --- HEAD, FACE & FLOWING HAIR ---
      ctx.save();
      ctx.translate(headTurnAngle, 0);

      // Face skin
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-4, -27 + breathBob, 8, 8);

      // Eyes (looking out at the vista)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -24 + breathBob, 2, 2);
      ctx.fillRect(2, -24 + breathBob, 2, 2);
      ctx.fillStyle = '#38bdf8'; // Celestial blue iris glint
      ctx.fillRect(-1.5, -24 + breathBob, 1, 1);
      ctx.fillRect(2.5, -24 + breathBob, 1, 1);

      // Hair (Golden-brown adventurer hair swaying in wind)
      ctx.fillStyle = '#b45309';
      const hairWave = Math.sin(time * 4.0) * 2;
      ctx.fillRect(-5, -30 + breathBob, 10, 4); // Top hair
      ctx.fillRect(-6, -28 + breathBob, 3, 5); // Left bangs
      ctx.fillRect(3, -28 + breathBob, 3, 5); // Right bangs
      // Wind hair locks blowing back
      ctx.fillRect(-7 + hairWave, -29 + breathBob, 3, 3);
      ctx.fillRect(4 + hairWave, -29 + breathBob, 4, 3);

      // Adventurer Headband
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-5, -27 + breathBob, 10, 1.5);
      ctx.restore();

      ctx.restore();

      // ==========================================
      // 8. PARTICLES (EMBERS, FLOWER PETALS, MOTES)
      // ==========================================
      ctx.save();
      for (const p of particles) {
        p.life++;
        p.x += p.vx + Math.sin(time * 2 + p.swaySpeed * p.life) * 0.8;
        p.y -= p.vy;

        // Fade in and out
        if (p.life < 40) {
          p.alpha = (p.life / 40) * p.maxAlpha;
        } else if (p.life > p.maxLife - 50) {
          p.alpha = ((p.maxLife - p.life) / 50) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        if (p.life >= p.maxLife || p.y < -20 || p.x > width + 40 || p.x < -40) {
          Object.assign(p, spawnParticle());
          p.y = height + 10;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = atmosphere === 'night' ? 8 : 4;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();

      // ==========================================
      // 9. BOTTOM AMBIENT FOG / MIST OVER THE ABYSS
      // ==========================================
      ctx.save();
      const mistGrad = ctx.createLinearGradient(0, height - 90, 0, height);
      mistGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
      mistGrad.addColorStop(
        1,
        atmosphere === 'night'
          ? 'rgba(15, 23, 42, 0.75)'
          : atmosphere === 'sunset'
          ? 'rgba(49, 16, 66, 0.65)'
          : 'rgba(224, 242, 254, 0.5)'
      );
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height - 90, width, 90);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [atmosphere]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none image-render-pixel"
    />
  );
};
