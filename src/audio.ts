// Web Audio API Retro Sound Effects Synthesizer

class AudioEngine {
  private ctx: AudioContext | null = null;
  private volumeNode: GainNode | null = null;
  private isMuted: boolean = false;
  private currentVolume: number = 0.3;

  constructor() {
    // Lazy initialized on first user interaction due to browser autoplay policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser.", e);
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(muted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.volumeNode && this.ctx && !this.isMuted) {
      this.volumeNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  getMuted() {
    return this.isMuted;
  }

  getVolume() {
    return this.currentVolume;
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number): { osc: OscillatorNode, gain: GainNode } | null {
    this.init();
    if (!this.ctx || this.isMuted) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    osc.connect(gain);
    if (this.volumeNode) {
      gain.connect(this.volumeNode);
    } else {
      gain.connect(this.ctx.destination);
    }

    return { osc, gain };
  }

  private createNoiseBuffer(): AudioBuffer | null {
    this.init();
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds maximum
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // SOUND EFFECTS:

  playSlash() {
    const sound = this.createOscillator('triangle', 180, 0.15);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx!.currentTime;

    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.start(t);
    osc.stop(t + 0.15);

    // Add noise crunch
    this.playNoise(2000, 300, 0.08, 0.3);
  }

  playShoot(colorType: string) {
    const freq = colorType === 'arcane' ? 600 : colorType === 'void' ? 350 : 250;
    const type: OscillatorType = colorType === 'arcane' ? 'sine' : 'sawtooth';
    const sound = this.createOscillator(type, freq, 0.2);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx!.currentTime;

    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, t + 0.15);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playHit() {
    const sound = this.createOscillator('sawtooth', 120, 0.1);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx!.currentTime;

    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);

    this.playNoise(800, 400, 0.08, 0.4);
  }

  playHeal() {
    const sound = this.createOscillator('sine', 200, 0.4);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx!.currentTime;

    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(500, t + 0.2);
    osc.frequency.linearRampToValueAtTime(800, t + 0.4);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  playFreeze() {
    // Glacial Prison - KRRRACK!
    // Multiple metallic square sweeps
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sound = this.createOscillator('square', 800 + i * 300, 0.12);
        if (!sound) return;
        const { osc, gain } = sound;
        const t = this.ctx!.currentTime;

        osc.frequency.exponentialRampToValueAtTime(150 + i * 50, t + 0.1);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.start(t);
        osc.stop(t + 0.12);
      }, i * 40);
    }
  }

  playExplosion() {
    const sound = this.createOscillator('sawtooth', 90, 0.55);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx!.currentTime;

    osc.frequency.exponentialRampToValueAtTime(20, t + 0.45);
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

    osc.start(t);
    osc.stop(t + 0.55);

    // Deep heavy noise
    this.playNoise(400, 50, 0.5, 0.8);
  }

  playNoise(highPassFreq: number, lowPassFreq: number, duration: number, volume: number) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const noiseBuffer = this.createNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((highPassFreq + lowPassFreq) / 2, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    if (this.volumeNode) {
      gain.connect(this.volumeNode);
    } else {
      gain.connect(this.ctx.destination);
    }

    noiseSource.start();
    noiseSource.stop(this.ctx.currentTime + duration);
  }

  playStep() {
    // Gentle low thud
    const sound = this.createOscillator('triangle', 70, 0.08);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx!.currentTime;

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playSpell(abilityName: string) {
    // Plays dynamic sounds for standard or advanced abilities
    const name = abilityName.toLowerCase();
    
    // Slash / Swing / Slices
    if (name.includes('slash') || name.includes('cleave') || name.includes('scythe') || name.includes('sweep') || name.includes('rip') || name.includes('crack') || name.includes('blade')) {
      this.playSlash();
    }
    // Explosions / Heavy Blasts
    else if (name.includes('strike') || name.includes('smite') || name.includes('explosion') || name.includes('eruption') || name.includes('blast') || name.includes('collapse') || name.includes('meltdown') || name.includes('maw') || name.includes('cataclysm') || name.includes('apocalypse') || name.includes('moon') || name.includes('star') || name.includes('crush') || name.includes('annihilation') || name.includes('meteor')) {
      this.playExplosion();
      if (name.includes('apocalypse') || name.includes('moon') || name.includes('cataclysm')) {
        setTimeout(() => this.playExplosion(), 150);
        setTimeout(() => this.playExplosion(), 300);
      }
    }
    // Freezing / Stuns / Chains
    else if (name.includes('prison') || name.includes('cage') || name.includes('freeze') || name.includes('chains') || name.includes('hourglass') || name.includes('zero')) {
      this.playFreeze();
      if (name.includes('zero')) {
        setTimeout(() => this.playExplosion(), 200);
      }
    }
    // Drains / Siphons / Devours
    else if (name.includes('drain') || name.includes('harvest') || name.includes('siphon') || name.includes('feast')) {
      const sound = this.createOscillator('sine', 440, 0.6);
      if (sound) {
        const { osc, gain } = sound;
        const t = this.ctx!.currentTime;
        osc.frequency.linearRampToValueAtTime(120, t + 0.6);
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        osc.start(t); osc.stop(t + 0.6);
      }
    }
    // Portals / Summons / Static Constructs
    else if (name.includes('portal') || name.includes('summon') || name.includes('orbs') || name.includes('halos') || name.includes('spirits') || name.includes('pests')) {
      const sound = this.createOscillator('sawtooth', 80, 0.7);
      if (sound) {
        const { osc, gain } = sound;
        const t = this.ctx!.currentTime;
        osc.frequency.exponentialRampToValueAtTime(250, t + 0.4);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.7);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
        osc.start(t); osc.stop(t + 0.7);
      }
    }
    // Toxic/Poison Gases
    else if (name.includes('cloud') || name.includes('puddle') || name.includes('spore') || name.includes('gas') || name.includes('acid') || name.includes('contagion') || name.includes('burst')) {
      this.playNoise(1800, 900, 0.8, 0.35);
    }
    // Projectiles / Shoots
    else if (name.includes('spear') || name.includes('trident') || name.includes('stinger') || name.includes('bolt') || name.includes('missiles') || name.includes('laser') || name.includes('wisps') || name.includes('flask') || name.includes('shoot') || name.includes('rift')) {
      this.playShoot(name.includes('laser') || name.includes('missiles') ? 'arcane' : 'void');
    }
    // Buffs / Speed / Commands
    else if (name.includes('rage') || name.includes('wings') || name.includes('armor') || name.includes('cape') || name.includes('injection') || name.includes('shift') || name.includes('dash') || name.includes('roar') || name.includes('command') || name.includes('aura')) {
      const sound = this.createOscillator('sawtooth', 150, 0.5);
      if (sound) {
        const { osc, gain } = sound;
        const t = this.ctx!.currentTime;
        osc.frequency.linearRampToValueAtTime(350, t + 0.2);
        osc.frequency.linearRampToValueAtTime(200, t + 0.5);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t); osc.stop(t + 0.5);
      }
    }
    else {
      // Fallback
      this.playShoot('arcane');
    }
  }

  // Play a talk chatter sound unique per character type
  playChatter(charId: string) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    let freq = 150;
    let type: OscillatorType = 'sine';
    let duration = 0.08;

    switch (charId) {
      case 'vorgan':
        freq = 90;
        type = 'triangle';
        duration = 0.12;
        break;
      case 'kargul':
        freq = 70;
        type = 'sawtooth';
        duration = 0.14;
        break;
      case 'zyrael':
        freq = 200;
        type = 'sine';
        duration = 0.1;
        break;
      case 'malgor':
        freq = 350;
        type = 'square';
        duration = 0.06;
        break;
      case 'xilthar':
        freq = 280;
        type = 'sine';
        duration = 0.08;
        break;
      case 'azrakel':
        freq = 160;
        type = 'triangle';
        duration = 0.1;
        break;
    }

    const sound = this.createOscillator(type, freq + Math.random() * 40 - 20, duration);
    if (!sound) return;
    const { osc, gain } = sound;
    const t = this.ctx.currentTime;

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.start(t);
    osc.stop(t + duration);
  }
}

export const audio = new AudioEngine();
