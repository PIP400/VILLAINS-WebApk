export type CharacterId = string;

export interface Ability {
  name: string;
  description: string;
  cooldown: number; // in ms
  sfxName: string;
  sfxText: string;
  type: 'projectile' | 'aoe' | 'buff' | 'summon';
  color: string;
}

export interface CharacterPalette {
  primary: string; // Black armor/robes
  accent1: string; // Theme main color (e.g., deep violet, lava orange)
  accent2: string; // Theme secondary (e.g., bright magenta, burning yellow)
  body: string;    // Skin/core body (e.g., bone white, glowing ice blue, demonic shadow)
  weapon: string;  // Weapon color
}

export interface Character {
  id: CharacterId;
  name: string;
  title: string;
  quote: string;
  description: string;
  baseHp: number;
  baseSpeed: number; // grid units per frame
  baseAtk: number;
  magicType: string;
  weaponName: string;
  abilities: Ability[];
  palette: CharacterPalette;
}

export type AnimationState = 'idle' | 'walk' | 'attack' | 'ability' | 'hit' | 'die';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark' | 'bubble';
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  owner: 'player' | 'enemy';
  damage: number;
  life: number;
  maxLife: number;
  trailParticlesCount: number;
  effectType: 'void' | 'magma' | 'frost' | 'plague' | 'arcane' | 'holy';
  behavior?: 'straight' | 'homing' | 'orbit';
  targetId?: number; // for homing
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
  type: 'crawler' | 'ranged' | 'brute' | 'swarm';
  color: string;
  accentColor: string;
  name: string;
  lastAttackTime: number;
  frozenTimer: number;
  poisonTimer: number;
  poisonDamage: number;
  burnedTimer: number;
  state: 'idle' | 'walk' | 'hit' | 'die';
  animFrame: number;
  isBoss?: boolean;
  lastAbilityTime?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  vy: number;
  alpha: number;
  life: number;
}

export interface GameState {
  score: number;
  kills: number;
  wave: number;
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  playerMaxMana: number;
  cooldowns: Record<string, number>; // abilityName -> lastCastTimestamp
  gameTime: number;
}
