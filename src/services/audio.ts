// Web Audio API Procedural Chiptune & Sound Generator for Tales of the Skyfall

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private currentTrack: string | null = null;
  private isPlayingMusic: boolean = false;
  private musicTimer: number | null = null;
  private musicStep: number = 0;
  
  private musicVolume: number = 0.6;
  private sfxVolume: number = 0.8;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMasterVolume(vol: number) {
    const v = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(v, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---

  public playAttack(comboStep: number = 1) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    // Pith rises with combo
    const baseFreq = comboStep === 1 ? 280 : comboStep === 2 ? 340 : 440;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);

    // Add brief noise burst for swing swoosh
    this.playNoise(0.08, 0.15);
  }

  public playHit() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playDodge() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSkill() {
    this.playSkySlash();
  }

  public playSkySlash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = i * 0.05;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 + i * 160, now + delay);
      osc.frequency.exponentialRampToValueAtTime(950 + i * 120, now + delay + 0.16);

      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.16);
    }
    this.playNoise(0.12, 0.2);
  }

  public playWindDash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);

    this.playNoise(0.2, 0.25);
  }

  public playGroundBreak() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);

    this.playNoise(0.35, 0.4);
  }

  public playSkyfallStrike() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Ascending chime whistle
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(300, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Huge crashing explosion after 0.22s
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(450, now + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(45, now + 0.85);

    gain2.gain.setValueAtTime(0.55, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);

    setTimeout(() => {
      this.playNoise(0.55, 0.45);
    }, 220);
  }

  public playUltimate() {
    this.playSkyfallStrike();
  }

  public playChestOpen() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [330, 440, 550, 660, 880];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time);
      osc.stop(time + 0.15);
    });
  }

  public playCoin() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playPuzzleSolve() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major
    const now = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time);
      osc.stop(time + 0.4);
    });
  }

  public playLevelUp() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25, 880]; // A Major fanfare
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = now + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + (idx === 3 ? 0.6 : 0.2));

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time);
      osc.stop(time + (idx === 3 ? 0.6 : 0.2));
    });
  }

  public playDialogBlip() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const pitch = 380 + Math.random() * 80;
    osc.frequency.setValueAtTime(pitch, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playButtonClick() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPortalWarp() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Dual rising sweep for dimensional warp
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.5);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(330, now);
    osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
    this.playNoise(0.25, 0.12);
  }

  public playPortalLocked() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(90, now + 0.1);
    osc.frequency.setValueAtTime(70, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playBossRoar() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.8);
    this.playNoise(0.4, 0.3);
  }

  private playNoise(duration: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // --- Procedural Chiptune Music Generator ---

  public playMusic(
    theme:
      | 'village'
      | 'forest'
      | 'dungeon'
      | 'boss'
      | 'menu'
      | 'frozen'
      | 'volcano'
      | 'sunken'
      | 'swamp'
      | 'sky'
      | 'castle'
      | 'celestial'
  ) {
    this.initCtx();
    if (this.currentTrack === theme && this.isPlayingMusic) return;

    this.stopMusic();
    this.currentTrack = theme;
    this.isPlayingMusic = true;
    this.musicStep = 0;

    // Melody definitions (frequencies in Hz)
    const melodyMap: Record<string, { tempo: number; notes: number[]; bass: number[] }> = {
      menu: {
        tempo: 220,
        notes: [392, 440, 523.25, 587.33, 659.25, 587.33, 523.25, 440],
        bass: [130.81, 146.83, 164.81, 174.61],
      },
      village: {
        tempo: 200,
        notes: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23, 392.0, 329.63],
        bass: [130.81, 164.81, 196.0, 174.61],
      },
      forest: {
        tempo: 240,
        notes: [329.63, 392.0, 493.88, 440.0, 392.0, 329.63, 293.66, 369.99, 440.0, 493.88, 587.33, 493.88],
        bass: [164.81, 146.83, 130.81, 123.47],
      },
      dungeon: {
        tempo: 170,
        notes: [220.0, 233.08, 220.0, 196.0, 185.0, 220.0, 246.94, 220.0, 174.61, 164.81, 174.61, 220.0],
        bass: [110.0, 116.54, 98.0, 82.41],
      },
      frozen: {
        tempo: 210,
        notes: [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0, 523.25],
        bass: [130.81, 164.81, 146.83, 110.0],
      },
      volcano: {
        tempo: 160,
        notes: [164.81, 174.61, 196.0, 185.0, 164.81, 146.83, 155.56, 164.81],
        bass: [82.41, 87.31, 98.0, 73.42],
      },
      sunken: {
        tempo: 250,
        notes: [329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 349.23, 293.66],
        bass: [110.0, 130.81, 146.83, 98.0],
      },
      swamp: {
        tempo: 230,
        notes: [196.0, 207.65, 196.0, 174.61, 185.0, 196.0, 220.0, 164.81],
        bass: [98.0, 103.83, 98.0, 82.41],
      },
      sky: {
        tempo: 190,
        notes: [440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 493.88, 523.25],
        bass: [146.83, 164.81, 174.61, 130.81],
      },
      castle: {
        tempo: 150,
        notes: [220.0, 246.94, 261.63, 220.0, 293.66, 261.63, 246.94, 207.65],
        bass: [110.0, 123.47, 130.81, 103.83],
      },
      celestial: {
        tempo: 180,
        notes: [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33],
        bass: [130.81, 146.83, 164.81, 196.0],
      },
      boss: {
        tempo: 140,
        notes: [220, 220, 330, 220, 440, 392, 330, 311.13, 293.66, 330, 392, 440, 523.25, 493.88, 440, 392],
        bass: [110, 110, 110, 110, 98, 98, 87.31, 82.41],
      },
    };

    const track = melodyMap[theme] || melodyMap.village;

    const playNextNote = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const noteFreq = track.notes[this.musicStep % track.notes.length];
      const bassFreq = track.bass[Math.floor(this.musicStep / 2) % track.bass.length];

      // Lead Melody
      if (noteFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = theme === 'boss' ? 'sawtooth' : theme === 'dungeon' ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(noteFreq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + track.tempo / 1000 * 0.85);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + track.tempo / 1000 * 0.9);
      }

      // Bassline
      if (this.musicStep % 2 === 0 && bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + track.tempo / 1000 * 1.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + track.tempo / 1000 * 1.9);
      }

      this.musicStep++;
      this.musicTimer = window.setTimeout(playNextNote, track.tempo);
    };

    playNextNote();
  }

  public playBgm(theme: 'village' | 'forest' | 'dungeon' | 'boss' | 'menu' | string) {
    let track = theme;
    if (theme === 'skyfall_village') track = 'village';
    else if (theme === 'whispering_forest') track = 'forest';
    else if (theme === 'ancient_sanctum') track = 'dungeon';
    else if (theme === 'frozen_kingdom') track = 'frozen';
    else if (theme === 'volcanic_wasteland') track = 'volcano';
    else if (theme === 'sunken_city') track = 'sunken';
    else if (theme === 'dark_swamp') track = 'swamp';
    else if (theme === 'sky_islands') track = 'sky';
    else if (theme === 'shadow_castle') track = 'castle';
    else if (theme === 'celestial_fortress') track = 'celestial';
    this.playMusic(track as any);
  }

  public playGameOver() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    this.stopMusic();

    const notes = [220, 207.65, 196, 185];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = now + idx * 0.25;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  public playVictoryFanfare() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    this.stopMusic();

    const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
    const times = [0, 0.12, 0.24, 0.38, 0.52, 0.72];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + times[idx];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (idx === 5 ? 1.0 : 0.2));

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + (idx === 5 ? 1.0 : 0.2));
    });
  }

  public playItemPickup() {
    this.playCoin();
  }

  public playEnemyDeath() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
    this.playNoise(0.2, 0.25);
  }

  public playCast() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
    this.playNoise(0.12, 0.15);
  }

  public playBite() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // High alert double ding
    [0, 0.08].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + delay;

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1174, t + 0.04);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  public playFishCatch() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  public playFishEscape() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playFishReel() {
    this.playNoise(0.04, 0.08);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const sound = new SoundEngine();
