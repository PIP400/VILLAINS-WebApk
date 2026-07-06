import React, { useEffect, useRef, useState } from 'react';
import { Character, CharacterId, Particle, Projectile, Enemy, FloatingText, GameState, Ability } from '../types';
import { drawPixelSprite, drawArenaFloor, drawEnemySprite } from '../sprites';
import { audio } from '../audio';
import { Play, RotateCcw, Volume2, VolumeX, ShieldAlert, Zap, Skull, Flame, RefreshCw, Sparkles, MessageSquare, Smartphone } from 'lucide-react';

interface ArenaGameProps {
  selectedCharacter: Character;
  onStatsUpdate?: (score: number, kills: number, wave: number) => void;
}

// Summon helper state
interface Summon {
  id: number;
  x: number;
  y: number;
  type: 'orb' | 'pest' | 'abyssal';
  color: string;
  life: number;
  maxLife: number;
  lastShootTime: number;
  vx: number;
  vy: number;
}

export default function ArenaGame({ selectedCharacter, onStatsUpdate }: ArenaGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game UI States
  const [isPlaying, setIsPlaying] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    kills: 0,
    wave: 1,
    playerHp: selectedCharacter.baseHp,
    playerMaxHp: selectedCharacter.baseHp,
    playerMana: 100,
    playerMaxMana: 100,
    cooldowns: {},
    gameTime: 0
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.25);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomLevelRef = useRef(1);
  zoomLevelRef.current = zoomLevel; // Sync immediately on every render to prevent stale closure in high-frequency game loop
  const [spawnerMode, setSpawnerMode] = useState<'wave' | 'sandbox'>('sandbox');
  const [showUpgradeChoice, setShowUpgradeChoice] = useState(false);
  const [mobileControlsEnabled, setMobileControlsEnabled] = useState(false);
  
  // Custom Speech text
  const [customSpeechText, setCustomSpeechText] = useState('');
  
  // Ref-based state variables to maintain high-frequency 60fps game loop without React stale closure issues
  const keysPressed = useRef<Record<string, boolean>>({});
  const playerPos = useRef({ x: 1500, y: 1500, vx: 0, vy: 0, direction: 'right' as 'left' | 'right' });
  const playerAnim = useRef({ state: 'idle' as any, frame: 0, isCasting: false });
  const playerStats = useRef({ 
    hp: selectedCharacter.baseHp, 
    maxHp: selectedCharacter.baseHp, 
    mana: 100,
    projectileCountBonus: 0,
    projectileSizeMultiplier: 1.0,
    criticalChance: 0.1
  });
  const gameStats = useRef({ score: 0, kills: 0, wave: 1 });
  const lastStepSoundTime = useRef(0);

  // Active entities
  const projectiles = useRef<Projectile[]>([]);
  const particles = useRef<Particle[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const floatingTexts = useRef<FloatingText[]>([]);
  const summons = useRef<Summon[]>([]);
  
  // Overwrite projectiles.current.push to apply size and count upgrades dynamically
  if (projectiles.current && !(projectiles.current as any).isOverridden) {
    const originalPush = projectiles.current.push;
    projectiles.current.push = function(...items: Projectile[]) {
      const modifiedItems: Projectile[] = [];
      items.forEach(proj => {
        if (proj.owner === 'player') {
          const sizeMod = playerStats.current.projectileSizeMultiplier || 1.0;
          const countBonus = playerStats.current.projectileCountBonus || 0;
          
          // Add the modified core projectile
          const p = {
            ...proj,
            id: proj.id || Math.random(),
            size: proj.size * sizeMod,
          };
          modifiedItems.push(p);
          
          // Add bonus projectiles if countBonus > 0
          if (countBonus > 0) {
            const angle = Math.atan2(p.vy, p.vx);
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            for (let i = 1; i <= countBonus; i++) {
              const offset = 0.15 * Math.ceil(i / 2) * (i % 2 === 0 ? 1 : -1);
              const newAngle = angle + offset;
              modifiedItems.push({
                ...p,
                id: Math.random(),
                vx: Math.cos(newAngle) * speed,
                vy: Math.sin(newAngle) * speed,
                damage: Math.floor(p.damage * 0.8),
              });
            }
          }
        } else {
          modifiedItems.push(proj);
        }
      });
      return originalPush.apply(this, modifiedItems as any);
    };
    (projectiles.current as any).isOverridden = true;
  }
  
  // Screen effects
  const screenShake = useRef(0);
  const isDeadState = useRef(false);

  // Dialogue system state
  const speechBubble = useRef<{ text: string; fullText: string; index: number; timer: number } | null>(null);

  // Synchronize character swap
  useEffect(() => {
    playerStats.current.maxHp = selectedCharacter.baseHp;
    playerStats.current.hp = selectedCharacter.baseHp;
    playerStats.current.mana = 100;
    playerStats.current.projectileCountBonus = 0;
    playerStats.current.projectileSizeMultiplier = 1.0;
    playerStats.current.criticalChance = 0.1;
    setGameState(prev => ({
      ...prev,
      playerHp: selectedCharacter.baseHp,
      playerMaxHp: selectedCharacter.baseHp,
      playerMana: 100,
      cooldowns: {}
    }));
    isDeadState.current = false;
    playerAnim.current = { state: 'idle', frame: 0, isCasting: false };
    
    // Clear summons and projectiles on character change
    summons.current = [];
    projectiles.current = [];

    // Speak introductory quote
    triggerSpeech(selectedCharacter.quote);
  }, [selectedCharacter]);

  // Audio system volume control
  useEffect(() => {
    audio.setMute(!soundEnabled);
    audio.setVolume(soundVolume);
  }, [soundEnabled, soundVolume]);

  // Trigger dialogue bubbles over the character
  const triggerSpeech = (text: string) => {
    speechBubble.current = {
      text: '',
      fullText: text,
      index: 0,
      timer: 180 // frames to stay on screen after typing complete (approx 3s)
    };
  };

  const handleCustomSpeechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSpeechText.trim()) {
      triggerSpeech(customSpeechText.trim());
      setCustomSpeechText('');
    }
  };

  // Cooldown checking
  const getCooldownRemaining = (abilityName: string) => {
    const lastCast = gameState.cooldowns[abilityName] || 0;
    const ability = selectedCharacter.abilities.find(a => a.name === abilityName);
    if (!ability) return 0;
    const elapsed = Date.now() - lastCast;
    return Math.max(0, Math.ceil((ability.cooldown - elapsed) / 1000));
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      // Handle Ability shortcuts (1, 2, 3, 4 or z, x, c, v)
      const keyLower = e.key.toLowerCase();
      const keyMap: Record<string, number> = {
        'z': 0, 'x': 1, 'c': 2, 'v': 3,
        '1': 0, '2': 1, '3': 2, '4': 3
      };
      if (keyLower in keyMap) {
        const index = keyMap[keyLower];
        castAbility(selectedCharacter.abilities[index]);
      }

      // Handle direct basic slash (Space)
      if (e.key === ' ') {
        e.preventDefault();
        performBasicAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedCharacter, gameState]);

  // Main Canvas Setup & Frame loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 500;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initial character intro speech
    triggerSpeech(selectedCharacter.quote);

    let frameCount = 0;

    // --- GAME STEP LOOP ---
    const gameLoop = () => {
      if (isPlaying && !isDeadState.current) {
        updateGame(frameCount);
      }
      renderGame(ctx, canvas, frameCount);
      frameCount++;
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [selectedCharacter, isPlaying]);

  // --- CORE PHYSICS UPDATE ---
  const updateGame = (frame: number) => {
    const player = playerPos.current;
    const anim = playerAnim.current;
    const speed = selectedCharacter.baseSpeed;

    // 1. Move Player
    let dx = 0;
    let dy = 0;

    if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1;
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1;
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

    // Normalize diagonal speed
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    player.vx = dx * speed;
    player.vy = dy * speed;

    player.x += player.vx;
    player.y += player.vy;

    // Keep within boundaries
    const margin = 32;
    const MAP_SIZE = 3000;
    if (player.x < margin) player.x = margin;
    if (player.x > MAP_SIZE - margin) player.x = MAP_SIZE - margin;
    if (player.y < margin) player.y = margin;
    if (player.y > MAP_SIZE - margin) player.y = MAP_SIZE - margin;

    // Flip direction based on motion
    if (dx > 0) player.direction = 'right';
    if (dx < 0) player.direction = 'left';

    // Update Animation State
    if (!anim.isCasting) {
      if (dx !== 0 || dy !== 0) {
        anim.state = 'walk';
        // Play footstep beeps
        if (Date.now() - lastStepSoundTime.current > 330) {
          audio.playStep();
          lastStepSoundTime.current = Date.now();
        }
      } else {
        anim.state = 'idle';
      }
    }
    anim.frame++;

    // Recover Player Mana slowly
    if (frame % 10 === 0 && playerStats.current.mana < 100) {
      playerStats.current.mana = Math.min(100, playerStats.current.mana + 1);
      setGameState(prev => ({ ...prev, playerMana: playerStats.current.mana }));
    }

    // 2. Typewriter Dialog Bubble Update
    const bubble = speechBubble.current;
    if (bubble) {
      if (bubble.index < bubble.fullText.length) {
        // Add character at steady rate
        if (frame % 3 === 0) {
          bubble.text += bubble.fullText[bubble.index];
          bubble.index++;
          // Play chatter sound
          audio.playChatter(selectedCharacter.id);
        }
      } else {
        // Complete, decrement display timer
        bubble.timer--;
        if (bubble.timer <= 0) {
          speechBubble.current = null;
        }
      }
    }

    // 3. Update Summons
    summons.current.forEach(sum => {
      sum.life--;
      // Summons move slightly (drift / float)
      sum.x += sum.vx;
      sum.y += sum.vy;

      // Bound check
      if (sum.x < 30 || sum.x > 3000 - 30) sum.vx *= -1;
      if (sum.y < 30 || sum.y > 3000 - 30) sum.vy *= -1;

      // Fire at closest enemies
      if (Date.now() - sum.lastShootTime > 1500) {
        const closest = getClosestEnemy(sum.x, sum.y);
        if (closest) {
          const angle = Math.atan2(closest.y - sum.y, closest.x - sum.x);
          const pSpeed = 6;
          projectiles.current.push({
            id: Math.random(),
            x: sum.x,
            y: sum.y,
            vx: Math.cos(angle) * pSpeed,
            vy: Math.sin(angle) * pSpeed,
            size: 5,
            color: sum.color,
            glowColor: sum.color,
            owner: 'player',
            damage: 25,
            life: 120,
            maxLife: 120,
            trailParticlesCount: 2,
            effectType: selectedCharacter.id === 'vorgan' ? 'void' : 'plague'
          });
          audio.playShoot('arcane');
          sum.lastShootTime = Date.now();
        }
      }
    });
    summons.current = summons.current.filter(sum => sum.life > 0);

    // 4. Update Projectiles
    projectiles.current.forEach(proj => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      // Spawn trail particles
      for (let i = 0; i < proj.trailParticlesCount; i++) {
        particles.current.push({
          id: Math.random(),
          x: proj.x + (Math.random() - 0.5) * 4,
          y: proj.y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1 - proj.vx * 0.1,
          vy: (Math.random() - 0.5) * 1 - proj.vy * 0.1,
          color: proj.color,
          size: Math.random() * 3 + 1,
          alpha: 1,
          life: 20 + Math.random() * 15,
          maxLife: 35
        });
      }

      // Homing behavior
      if (proj.behavior === 'homing' && proj.targetId !== undefined) {
        const target = enemies.current.find(e => e.id === proj.targetId);
        if (target && target.hp > 0) {
          const angle = Math.atan2(target.y - proj.y, target.x - proj.x);
          // Gently shift vector toward target
          const targetVx = Math.cos(angle) * 7;
          const targetVy = Math.sin(angle) * 7;
          proj.vx = proj.vx * 0.88 + targetVx * 0.12;
          proj.vy = proj.vy * 0.88 + targetVy * 0.12;
        }
      }

      // Check Hits
      if (proj.owner === 'player') {
        enemies.current.forEach(enemy => {
          if (enemy.hp > 0 && getDistance(proj.x, proj.y, enemy.x, enemy.y) < enemy.size + proj.size + 10) {
            damageEnemy(enemy, proj.damage, proj.effectType);
            proj.life = 0; // Destroy projectile
          }
        });
      } else {
        // Enemy projectile hitting Player
        if (getDistance(proj.x, proj.y, player.x, player.y) < 22) {
          damagePlayer(proj.damage);
          proj.life = 0;
        }
      }
    });
    projectiles.current = projectiles.current.filter(p => p.life > 0);

    // 5. Update Particles
    particles.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = p.life / p.maxLife;
    });
    particles.current = particles.current.filter(p => p.life > 0);

    // 6. Update Enemies
    enemies.current.forEach(enemy => {
      if (enemy.hp <= 0) {
        enemy.state = 'die';
        enemy.animFrame++;
        return;
      }

      // Tick debuff statuses
      if (enemy.frozenTimer > 0) enemy.frozenTimer--;
      if (enemy.poisonTimer > 0) {
        enemy.poisonTimer--;
        if (enemy.poisonTimer % 45 === 0) {
          // poison tick!
          damageEnemy(enemy, enemy.poisonDamage, 'plague', true);
        }
      }
      if (enemy.burnedTimer > 0) {
        enemy.burnedTimer--;
        if (enemy.burnedTimer % 30 === 0) {
          damageEnemy(enemy, 8, 'magma', true);
        }
      }

      // Frozen halts all movement
      if (enemy.frozenTimer <= 0) {
        // Move toward player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 15) {
          enemy.vx = (dx / dist) * enemy.speed;
          enemy.vy = (dy / dist) * enemy.speed;
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;
          enemy.state = 'walk';
        } else {
          enemy.state = 'idle';
          // Damage Player close contact
          if (Date.now() - enemy.lastAttackTime > 1000) {
            damagePlayer(enemy.type === 'brute' ? 30 : 15);
            enemy.lastAttackTime = Date.now();
          }
        }
      } else {
        enemy.state = 'idle'; // Frozen
      }

      // Clamp to map boundaries
      enemy.x = Math.max(16, Math.min(3000 - 16, enemy.x));
      enemy.y = Math.max(16, Math.min(3000 - 16, enemy.y));

      // Boss special casting AI
      if (enemy.isBoss && enemy.frozenTimer <= 0) {
        if (!enemy.lastAbilityTime) enemy.lastAbilityTime = Date.now();
        if (Date.now() - enemy.lastAbilityTime > 3200) {
          enemy.lastAbilityTime = Date.now();
          
          // 50/50 Chance between Starburst and Earthquake
          const castFirst = Math.random() < 0.5;
          if (castFirst) {
            // Boss Ability 1: Starburst Void Missiles
            addFloatingText(enemy.x, enemy.y - 35, 'BOSS: STARBURST!', '#ff0055', 18);
            audio.playShoot('arcane');
            
            // Spawn 8 projectiles radially
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
              projectiles.current.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * 3.2,
                vy: Math.sin(angle) * 3.2,
                size: 8,
                color: '#ff0055',
                glowColor: '#ffeb3b',
                owner: 'enemy',
                damage: 15,
                life: 140,
                maxLife: 140,
                trailParticlesCount: 2,
                effectType: 'magma'
              });
            }
          } else {
            // Boss Ability 2: Earthquake Slam & Heal
            addFloatingText(enemy.x, enemy.y - 35, 'BOSS: EARTHQUAKE!', '#ffeb3b', 18);
            audio.playExplosion();
            screenShake.current = 14;
            
            spawnExpandingRing(enemy.x, enemy.y, 160, '#ffcc00');
            
            // Heal boss
            const healAmount = 150;
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
            addFloatingText(enemy.x, enemy.y - 50, `+${healAmount} Self-Heal`, '#4caf50', 16);
            audio.playHeal();
            
            // Stun and damage player if in range
            const dist = getDistance(enemy.x, enemy.y, player.x, player.y);
            if (dist < 160) {
              damagePlayer(30);
              addFloatingText(player.x, player.y - 30, 'STUNNED!', '#ffb703', 16);
            }
          }
        }
      }

      enemy.animFrame++;

      // Ranged enemies fire projectiles
      if (enemy.type === 'ranged' && Math.random() < 0.007 && enemy.frozenTimer <= 0) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        projectiles.current.push({
          id: Math.random(),
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * 4.5,
          vy: Math.sin(angle) * 4.5,
          size: 4,
          color: '#ff3b30',
          glowColor: '#ff9500',
          owner: 'enemy',
          damage: 12,
          life: 140,
          maxLife: 140,
          trailParticlesCount: 1,
          effectType: 'magma'
        });
      }
    });

    // Handle dead enemy decay, remove after death animations finish
    enemies.current = enemies.current.filter(e => {
      if (e.hp <= 0 && e.animFrame > 25) {
        // Add score and count kill
        gameStats.current.kills++;
        gameStats.current.score += e.type === 'brute' ? 100 : 30;
        setGameState(prev => ({
          ...prev,
          kills: gameStats.current.kills,
          score: gameStats.current.score
        }));
        if (onStatsUpdate) onStatsUpdate(gameStats.current.score, gameStats.current.kills, gameStats.current.wave);

        // Spawn gold/theme-colored death particles
        for (let i = 0; i < 12; i++) {
          particles.current.push({
            id: Math.random(),
            x: e.x,
            y: e.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: e.accentColor,
            size: Math.random() * 4 + 2,
            alpha: 1,
            life: 25 + Math.random() * 20,
            maxLife: 45
          });
        }
        return false;
      }
      return true;
    });

    // 7. Update Floating Texts
    floatingTexts.current.forEach(t => {
      t.x += (Math.random() - 0.5) * 0.4;
      t.y += t.vy;
      t.life--;
      t.alpha = t.life / 35;
    });
    floatingTexts.current = floatingTexts.current.filter(t => t.life > 0);

    // 8. Auto-spawn enemies in wave mode with Level Upgrades check
    if (spawnerMode === 'wave' && enemies.current.length === 0 && !showUpgradeChoice) {
      if (gameState.wave > 1) {
        setIsPlaying(false);
        setShowUpgradeChoice(true);
      } else {
        nextWave();
      }
    }

    // Decay screenshake
    if (screenShake.current > 0) {
      screenShake.current *= 0.9;
      if (screenShake.current < 0.1) screenShake.current = 0;
    }
  };

  // --- ACTIONS & COMBAT ENGINE ---

  const performBasicAttack = () => {
    if (isDeadState.current) return;
    const player = playerPos.current;
    const anim = playerAnim.current;

    // Trigger weapon swing animation
    anim.state = 'attack';
    anim.frame = 0;
    anim.isCasting = true;

    // Stop casting status after 18 frames
    setTimeout(() => {
      anim.isCasting = false;
    }, 300);

    audio.playSlash();

    // Damage checking in a cone/arc in front
    const range = 75;
    enemies.current.forEach(enemy => {
      const dist = getDistance(player.x, player.y, enemy.x, enemy.y);
      if (dist < range) {
        // Verify direction
        const isRight = enemy.x > player.x;
        if ((player.direction === 'right' && isRight) || (player.direction === 'left' && !isRight)) {
          // Double damage if Kargul is Bloodraging
          const baseAtk = selectedCharacter.baseAtk;
          const damage = selectedCharacter.id === 'kargul' ? baseAtk + 20 : baseAtk;
          damageEnemy(enemy, damage, selectedCharacter.id === 'kargul' ? 'magma' : 'void');
          
          // Lifesteal for Kargul Bloodrage
          if (selectedCharacter.id === 'kargul' && Math.random() < 0.5) {
            const heal = 15;
            playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + heal);
            addFloatingText(player.x, player.y - 20, `+${heal} Lifesteal`, '#4caf50');
            audio.playHeal();
          }
        }
      }
    });

    // Slash particles
    const dirSign = player.direction === 'right' ? 1 : -1;
    for (let i = 0; i < 15; i++) {
      particles.current.push({
        id: Math.random(),
        x: player.x + dirSign * 20 + (Math.random() - 0.5) * 20,
        y: player.y + (Math.random() - 0.5) * 30,
        vx: dirSign * (4 + Math.random() * 4),
        vy: (Math.random() - 0.5) * 3,
        color: selectedCharacter.palette.accent2,
        size: Math.random() * 4 + 1.5,
        alpha: 1,
        life: 15 + Math.random() * 10,
        maxLife: 25
      });
    }
  };

  const castAbility = (ability: Ability) => {
    if (isDeadState.current) return;
    const player = playerPos.current;

    // Check mana & cooldown
    const lastCast = gameState.cooldowns[ability.name] || 0;
    if (Date.now() - lastCast < ability.cooldown) {
      addFloatingText(player.x, player.y - 30, 'On Cooldown!', '#9e9e9e', 14);
      return;
    }

    const manaCost = ability.cooldown > 8000 ? 40 : 20;
    if (playerStats.current.mana < manaCost) {
      addFloatingText(player.x, player.y - 30, 'Out of Mana!', '#03a9f4', 14);
      return;
    }

    // Deduct mana
    playerStats.current.mana -= manaCost;
    playerStats.current.cooldowns = {
      ...playerStats.current.cooldowns,
      [ability.name]: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      playerMana: playerStats.current.mana,
      cooldowns: {
        ...prev.cooldowns,
        [ability.name]: Date.now()
      }
    }));

    // Trigger spell animation pose
    playerAnim.current.state = 'ability';
    playerAnim.current.frame = 0;
    playerAnim.current.isCasting = true;
    setTimeout(() => {
      playerAnim.current.isCasting = false;
    }, 400);

    // Play synthesised audio
    audio.playSpell(ability.name);

    // Speak bubble of the signature text!
    triggerSpeech(`${ability.name}! "${ability.sfxText}"`);

    // Screen shake
    screenShake.current = ability.cooldown > 8000 ? 12 : 5;

    // Trigger Spell visuals & logic based on Villain types
    executeAbilityLogic(ability);
  };

  const executeAbilityLogic = (ability: Ability) => {
    const player = playerPos.current;
    const dirSign = player.direction === 'right' ? 1 : -1;
    const charId = selectedCharacter.id;

    // VORGAN CORES
    if (charId === 'vorgan') {
      if (ability.name === 'Void Slash') {
        // High range wide radial slash
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 110) {
            damageEnemy(enemy, 150, 'void');
          }
        });
        spawnExpandingRing(player.x, player.y, 110, selectedCharacter.palette.accent2);
      } else if (ability.name === 'Soul Drain') {
        // Gravitational vortex pull & drain
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 180) {
            damageEnemy(enemy, 80, 'void');
            // Pull closer
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * 45;
            enemy.y += Math.sin(angle) * 45;
            // Heal player
            const heal = 15;
            playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + heal);
            addFloatingText(player.x, player.y - 20, `+${heal} Drain`, '#e91e63');
            audio.playHeal();
          }
        });
        spawnExpandingRing(player.x, player.y, 180, selectedCharacter.palette.accent1);
      } else if (ability.name === 'Dark Portal') {
        // Spawn active shooting void orb summmons
        for (let i = 0; i < 2; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + (i === 0 ? -40 : 40),
            y: player.y + (Math.random() - 0.5) * 30,
            type: 'orb',
            color: selectedCharacter.palette.accent2,
            life: 600, // 10s
            maxLife: 600,
            lastShootTime: 0,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
          });
        }
      } else if (ability.name === 'Annihilation') {
        // Complete flash screen wipe
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 500, 'void');
        });
        spawnExplosionSmoke(player.x, player.y, 400, selectedCharacter.palette.accent2);
      }
    }

    // KARGUL CORES
    else if (charId === 'kargul') {
      if (ability.name === 'Molten Strike') {
        // Fire 3 lava projectiles
        const baseAngle = player.direction === 'right' ? 0 : Math.PI;
        const angles = [baseAngle - 0.25, baseAngle, baseAngle + 0.25];
        angles.forEach(angle => {
          projectiles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            size: 8,
            color: selectedCharacter.palette.accent1,
            glowColor: selectedCharacter.palette.accent2,
            owner: 'player',
            damage: 120,
            life: 60,
            maxLife: 60,
            trailParticlesCount: 3,
            effectType: 'magma'
          });
        });
      } else if (ability.name === 'Blood Rage') {
        // Rage speed & power buff details
        addFloatingText(player.x, player.y - 30, 'RAGE MODE ACTIVATED!', '#f44336', 16);
        // Buff indicators
        for (let i = 0; i < 20; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 40,
            y: player.y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            color: '#f44336',
            size: Math.random() * 4 + 2,
            alpha: 1,
            life: 30,
            maxLife: 30
          });
        }
      } else if (ability.name === 'War Command') {
        // AOE stun shout
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 140) {
            damageEnemy(enemy, 75, 'magma');
            enemy.frozenTimer = 180; // immobilize
          }
        });
        spawnExpandingRing(player.x, player.y, 140, '#f39c12');
      } else if (ability.name === 'Inferno Crush') {
        // Massive shockwave
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 420, 'magma');
          // Add burning stacks
          enemy.burnedTimer = 240;
        });
        spawnExplosionSmoke(player.x, player.y, 250, '#e25822');
      }
    }

    // ZYRAEL CORES
    else if (charId === 'zyrael') {
      if (ability.name === 'Frost Spear') {
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 11,
          vy: Math.sin(angle) * 11,
          size: 7,
          color: selectedCharacter.palette.accent1,
          glowColor: '#ffffff',
          owner: 'player',
          damage: 130,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 2,
          effectType: 'frost'
        });
      } else if (ability.name === 'Glacial Prison') {
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 150) {
            damageEnemy(enemy, 85, 'frost');
            enemy.frozenTimer = 240; // freeze solid 4 seconds
          }
        });
        spawnExpandingRing(player.x, player.y, 150, '#a5ffd6');
      } else if (ability.name === 'Blizzard') {
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 110, 'frost');
          enemy.frozenTimer = 120; // slow
        });
        // Snow storm flakes
        for (let i = 0; i < 40; i++) {
          particles.current.push({
            id: Math.random(),
            x: Math.random() * 800,
            y: Math.random() * 400,
            vx: -3 - Math.random() * 3,
            vy: 2 + Math.random() * 2,
            color: '#e0f7fa',
            size: Math.random() * 4 + 1,
            alpha: 1,
            life: 60,
            maxLife: 60
          });
        }
      } else if (ability.name === 'Absolute Zero') {
        // Freeze everything and deal critical hit on already frozen foes
        enemies.current.forEach(enemy => {
          const isFrozen = enemy.frozenTimer > 0;
          const finalDmg = isFrozen ? 380 : 150;
          damageEnemy(enemy, finalDmg, 'frost');
          enemy.frozenTimer = 300; // freeze long time
          
          if (isFrozen) {
            // Ice burst graphics
            for (let i = 0; i < 15; i++) {
              particles.current.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#ffffff',
                size: Math.random() * 4 + 2,
                alpha: 1,
                life: 20,
                maxLife: 20
              });
            }
          }
        });
        spawnExpandingRing(player.x, player.y, 300, '#ffffff');
      }
    }

    // MALGOR CORES
    else if (charId === 'malgor') {
      if (ability.name === 'Toxic Cloud') {
        // Ticking gas cloud spots
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 130) {
            enemy.poisonTimer = 300;
            enemy.poisonDamage = 12;
            damageEnemy(enemy, 40, 'plague');
          }
        });
        spawnExpandingRing(player.x, player.y, 130, selectedCharacter.palette.accent2);
      } else if (ability.name === 'Plague Burst') {
        // Trigger explosion on poisoned targets
        enemies.current.forEach(enemy => {
          if (enemy.poisonTimer > 0) {
            damageEnemy(enemy, 240, 'plague');
            // spread to adjacent
            enemies.current.forEach(adj => {
              if (adj.id !== enemy.id && getDistance(enemy.x, enemy.y, adj.x, adj.y) < 100) {
                adj.poisonTimer = 240;
                adj.poisonDamage = 15;
              }
            });
            // gas particles
            spawnExplosionSmoke(enemy.x, enemy.y, 40, '#70e000');
          }
        });
      } else if (ability.name === 'Summon Pests') {
        // Spawn mini beetles helper pests
        for (let i = 0; i < 3; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 30,
            y: player.y + 20,
            type: 'pest',
            color: '#70e000',
            life: 400,
            maxLife: 400,
            lastShootTime: 0,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3
          });
        }
      } else if (ability.name === 'Death Contagion') {
        enemies.current.forEach(enemy => {
          if (enemy.poisonTimer > 0) {
            damageEnemy(enemy, 350, 'plague');
          } else {
            damageEnemy(enemy, 80, 'plague');
          }
          enemy.poisonTimer = 400; // infect with long poison
          enemy.poisonDamage = 20;
        });
        spawnExpandingRing(player.x, player.y, 250, '#2d6a4f');
      }
    }

    // XILTHAR CORES
    else if (charId === 'xilthar') {
      if (ability.name === 'Arcane Missiles') {
        // Fire 4 homing guided orbs
        for (let i = 0; i < 4; i++) {
          const closest = getClosestEnemy(player.x, player.y);
          const angle = (Math.PI * 2 / 4) * i;
          projectiles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            size: 6,
            color: selectedCharacter.palette.accent2,
            glowColor: '#ffffff',
            owner: 'player',
            damage: 65,
            life: 150,
            maxLife: 150,
            trailParticlesCount: 2,
            effectType: 'arcane',
            behavior: 'homing',
            targetId: closest?.id
          });
        }
      } else if (ability.name === 'Reality Warp') {
        // Blink teleport forward
        const warpDist = 120;
        const targetX = player.x + dirSign * warpDist;
        
        // Spawn warp trail
        spawnExplosionSmoke(player.x, player.y, 50, selectedCharacter.palette.accent1);
        player.x = targetX;
        
        // Boundaries
        const canvas = canvasRef.current;
        if (canvas) {
          player.x = Math.max(32, Math.min(canvas.width - 32, player.x));
        }

        spawnExplosionSmoke(player.x, player.y, 50, selectedCharacter.palette.accent2);
        
        // Stun adjacent warp spot
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 90) {
            damageEnemy(enemy, 75, 'arcane');
            enemy.frozenTimer = 120;
          }
        });
      } else if (ability.name === 'Summon Abyssal') {
        // Spawn massive floaty abyssal summon
        summons.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y - 50,
          type: 'abyssal',
          color: '#f72585',
          life: 720, // 12s
          maxLife: 720,
          lastShootTime: 0,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1
        });
      } else if (ability.name === 'Void Eruption') {
        // Singularity pull
        enemies.current.forEach(enemy => {
          enemy.x = player.x + (Math.random() - 0.5) * 10;
          enemy.y = player.y + (Math.random() - 0.5) * 10;
          damageEnemy(enemy, 330, 'arcane');
        });
        spawnExplosionSmoke(player.x, player.y, 200, selectedCharacter.palette.accent1);
      }
    }

    // AZRAKEL CORES
    else if (charId === 'azrakel') {
      if (ability.name === 'Divine Smite') {
        // Lightning columns at 3 random spots relative to the player
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 200;
            const ry = player.y + (Math.random() - 0.5) * 150;
            enemies.current.forEach(enemy => {
              if (getDistance(rx, ry, enemy.x, enemy.y) < 80) {
                damageEnemy(enemy, 160, 'holy');
              }
            });
            spawnExpandingRing(rx, ry, 80, selectedCharacter.palette.accent2);
            // vertical spark lines
            for (let k = 0; k < 12; k++) {
              particles.current.push({
                id: Math.random(),
                x: rx + (Math.random() - 0.5) * 20,
                y: ry - k * 30,
                vx: 0, vy: 5,
                color: '#ffffff',
                size: 3,
                alpha: 1,
                life: 15,
                maxLife: 15
              });
            }
          }, i * 150);
        }
      } else if (ability.name === 'Radiant Blade') {
        // Expanding bright gold blade wave
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 12,
          vy: Math.sin(angle) * 12,
          size: 14,
          color: '#ffea00',
          glowColor: '#ffffff',
          owner: 'player',
          damage: 180,
          life: 70,
          maxLife: 70,
          trailParticlesCount: 3,
          effectType: 'holy'
        });
      } else if (ability.name === 'Fallen Aura') {
        // Golden shield circles
        addFloatingText(player.x, player.y - 25, 'DIVINE SHIELD', '#ffea00', 15);
        for (let i = 0; i < 15; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: Math.cos(i) * 3,
            vy: Math.sin(i) * 3,
            color: '#ffd60a',
            size: 4,
            alpha: 1,
            life: 40,
            maxLife: 40
          });
        }
      } else if (ability.name === 'Apocalypse') {
        // Rain falling gold stars
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 400;
            const ry = player.y - 300;
            projectiles.current.push({
              id: Math.random(),
              x: rx,
              y: ry,
              vx: 2,
              vy: 7,
              size: 10,
              color: '#ffc300',
              glowColor: '#ff0054',
              owner: 'player',
              damage: 350,
              life: 100,
              maxLife: 100,
              trailParticlesCount: 3,
              effectType: 'holy'
            });
          }, i * 200);
        }
      }
    }

    // VELTHOR CORES
    else if (charId === 'velthor') {
      if (ability.name === 'Void Portal') {
        // Summons an active void vortex orb that pulls and shoots
        summons.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          type: 'orb',
          color: '#b300b3',
          life: 480, // 8s
          maxLife: 480,
          lastShootTime: 0,
          vx: 0,
          vy: 0
        });
        spawnExpandingRing(player.x, player.y, 80, '#b300b3');
      } else if (ability.name === 'Singularity Blast') {
        // Violet flames explosion that damages and pulls towards center
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 180) {
            damageEnemy(enemy, 160, 'void');
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * 35;
            enemy.y += Math.sin(angle) * 35;
          }
        });
        spawnExplosionSmoke(player.x, player.y, 180, '#ee82ee');
      } else if (ability.name === 'Gravity Warp') {
        // Warp player forward and release gravity wave
        const prevX = player.x;
        const prevY = player.y;
        player.x = Math.max(32, Math.min(3000 - 32, player.x + dirSign * 160));
        spawnExplosionSmoke(prevX, prevY, 60, '#4d1266');
        spawnExplosionSmoke(player.x, player.y, 60, '#b300b3');
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 120) {
            damageEnemy(enemy, 90, 'void');
            enemy.frozenTimer = 120; // Stun
          }
        });
      } else if (ability.name === 'Dark Star') {
        // Unleash extreme magenta gravity nova
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 380, 'void');
          enemy.frozenTimer = 180; // Long stun
        });
        spawnExpandingRing(player.x, player.y, 400, '#ff00ff');
        for (let i = 0; i < 30; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            color: '#ff00ff',
            size: Math.random() * 5 + 3,
            alpha: 1,
            life: 45,
            maxLife: 45
          });
        }
      }
    }

    // MORGRAV CORES
    else if (charId === 'morgrav') {
      if (ability.name === 'Spectral Wisps') {
        // Fire 3 green soul projectile wisps that home in on closest enemies
        for (let i = 0; i < 3; i++) {
          const angle = (player.direction === 'right' ? 0 : Math.PI) + (i - 1) * 0.25;
          const target = getClosestEnemy(player.x, player.y);
          projectiles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            size: 8,
            color: '#00ff80',
            glowColor: '#0e6636',
            owner: 'player',
            damage: 90,
            life: 120,
            maxLife: 120,
            trailParticlesCount: 2,
            effectType: 'plague',
            behavior: 'homing',
            targetId: target?.id
          });
        }
      } else if (ability.name === 'Ghastly Fire') {
        // Slam necrotic emerald ring
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 150) {
            damageEnemy(enemy, 130, 'plague');
            enemy.poisonTimer = 180;
            enemy.poisonDamage = 8;
          }
        });
        spawnExpandingRing(player.x, player.y, 150, '#0e6636');
      } else if (ability.name === 'Soul Siphon') {
        // Direct drain of surrounding targets
        let drainCount = 0;
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 160) {
            damageEnemy(enemy, 90, 'plague');
            drainCount++;
            particles.current.push({
              id: Math.random(),
              x: enemy.x,
              y: enemy.y,
              vx: (player.x - enemy.x) * 0.08,
              vy: (player.y - enemy.y) * 0.08,
              color: '#00ff80',
              size: 4,
              alpha: 1,
              life: 15,
              maxLife: 15
            });
          }
        });
        if (drainCount > 0) {
          const totalHeal = Math.min(100, drainCount * 12);
          playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + totalHeal);
          addFloatingText(player.x, player.y - 20, `+${totalHeal} Siphoned`, '#00ff80', 14);
          audio.playHeal();
        }
      } else if (ability.name === 'Crypt Burst') {
        // Summon 3 skeleton warriors as shield barriers
        for (let i = 0; i < 3; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + Math.cos(i * 2.09) * 45,
            y: player.y + Math.sin(i * 2.09) * 45,
            type: 'skeleton',
            color: '#cccccc',
            life: 600, // 10s
            maxLife: 600,
            lastShootTime: 0,
            vx: 0, vy: 0
          });
        }
        spawnExplosionSmoke(player.x, player.y, 80, '#0e6636');
      }
    }

    // RAVENOR CORES
    else if (charId === 'ravenor') {
      if (ability.name === 'Blood Cleave') {
        // Pierce arc wave of magma blood
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 12,
          vy: Math.sin(angle) * 12,
          size: 11,
          color: '#ff0000',
          glowColor: '#8c0d0d',
          owner: 'player',
          damage: 160,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 3,
          effectType: 'magma'
        });
      } else if (ability.name === 'Sanguine Vortex') {
        // Sanguine pulling vortex
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 200) {
            damageEnemy(enemy, 110, 'magma');
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * 40;
            enemy.y += Math.sin(angle) * 40;
          }
        });
        spawnExpandingRing(player.x, player.y, 200, '#8c0d0d');
      } else if (ability.name === 'Emperor Strike') {
        // Magma slam stunning nearby targets
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 140) {
            damageEnemy(enemy, 150, 'magma');
            enemy.frozenTimer = 150; // Stun
            enemy.burnedTimer = 180; // Burn
          }
        });
        spawnExplosionSmoke(player.x, player.y, 140, '#ff3300');
      } else if (ability.name === 'Blood Moon') {
        // Red blood-meteorites rain around player
        for (let i = 0; i < 9; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 500;
            const ry = player.y - 300;
            projectiles.current.push({
              id: Math.random(),
              x: rx,
              y: ry,
              vx: (Math.random() - 0.5) * 3,
              vy: 7 + Math.random() * 2,
              size: 12,
              color: '#ff0000',
              glowColor: '#8c0d0d',
              owner: 'player',
              damage: 280,
              life: 100,
              maxLife: 100,
              trailParticlesCount: 3,
              effectType: 'magma'
            });
          }, i * 160);
        }
      }
    }

    // THUNDREX CORES
    else if (charId === 'thundrex') {
      if (ability.name === 'Lightning Spear') {
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 16,
          vy: Math.sin(angle) * 16,
          size: 8,
          color: '#60a5fa',
          glowColor: '#3b82f6',
          owner: 'player',
          damage: 150,
          life: 70,
          maxLife: 70,
          trailParticlesCount: 3,
          effectType: 'holy'
        });
      } else if (ability.name === 'Storm Nova') {
        // Erupt massive lightning shock ring
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 180) {
            damageEnemy(enemy, 120, 'holy');
            // Knock back slightly
            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            enemy.x += Math.cos(angle) * 20;
            enemy.y += Math.sin(angle) * 20;
          }
        });
        spawnExpandingRing(player.x, player.y, 180, '#3b82f6');
      } else if (ability.name === 'Thunderous Roar') {
        // Stuns nearby
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 150) {
            damageEnemy(enemy, 80, 'holy');
            enemy.frozenTimer = 180; // stun
          }
        });
        spawnExpandingRing(player.x, player.y, 150, '#1e3a8a');
      } else if (ability.name === 'Storm Cataclysm') {
        // Spawns multiple persistent lighting columns
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 350;
            const ry = player.y + (Math.random() - 0.5) * 350;
            enemies.current.forEach(enemy => {
              if (getDistance(rx, ry, enemy.x, enemy.y) < 90) {
                damageEnemy(enemy, 190, 'holy');
              }
            });
            spawnExpandingRing(rx, ry, 90, '#ffffff');
            for (let j = 0; j < 10; j++) {
              particles.current.push({
                id: Math.random(),
                x: rx,
                y: ry - j * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: 4,
                color: '#60a5fa',
                size: 3,
                alpha: 1,
                life: 15,
                maxLife: 15
              });
            }
          }, i * 200);
        }
      }
    }

    // XERATHOS CORES
    else if (charId === 'xerathos') {
      if (ability.name === 'Dragon Breath') {
        // Shoots wide spread of gravity flame orbs
        const baseAngle = player.direction === 'right' ? 0 : Math.PI;
        for (let angleOffset of [-0.3, -0.15, 0, 0.15, 0.3]) {
          projectiles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: Math.cos(baseAngle + angleOffset) * 10,
            vy: Math.sin(baseAngle + angleOffset) * 10,
            size: 9,
            color: '#ff00cc',
            glowColor: '#5c13a8',
            owner: 'player',
            damage: 100,
            life: 65,
            maxLife: 65,
            trailParticlesCount: 2,
            effectType: 'void'
          });
        }
      } else if (ability.name === 'Void Pull') {
        // Deep dragon pulling force
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 250) {
            damageEnemy(enemy, 95, 'void');
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * 55;
            enemy.y += Math.sin(angle) * 55;
          }
        });
        spawnExpandingRing(player.x, player.y, 250, '#5c13a8');
      } else if (ability.name === 'Tail Sweep') {
        // Massive close sweep stun
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 130) {
            damageEnemy(enemy, 140, 'void');
            enemy.frozenTimer = 160;
          }
        });
        spawnExpandingRing(player.x, player.y, 130, '#ffcc00');
      } else if (ability.name === 'Nova Maw') {
        // Black hole heart explosion
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 360, 'void');
          enemy.frozenTimer = 120;
        });
        spawnExplosionSmoke(player.x, player.y, 320, '#ffffff');
        spawnExpandingRing(player.x, player.y, 320, '#ff00cc');
      }
    }

    // ZYGOR CORES
    else if (charId === 'zygor') {
      if (ability.name === 'Acid Puddle') {
        // Spawns poison cloud that leaves lasting toxic gas
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 160) {
            enemy.poisonTimer = 300;
            enemy.poisonDamage = 14;
            damageEnemy(enemy, 50, 'plague');
          }
        });
        spawnExpandingRing(player.x, player.y, 160, '#6aa84f');
      } else if (ability.name === 'Toxic Flask') {
        // Fires chemical bouncing green projectile
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 9,
          vy: -2,
          size: 10,
          color: '#38761d',
          glowColor: '#6aa84f',
          owner: 'player',
          damage: 130,
          life: 90,
          maxLife: 90,
          trailParticlesCount: 2,
          effectType: 'plague'
        });
      } else if (ability.name === 'Adrenaline Injection') {
        // Gain speed, instant heal and shield
        addFloatingText(player.x, player.y - 30, 'ADRENALINE BOOST!', '#6aa84f', 15);
        playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + 90);
        addFloatingText(player.x, player.y - 15, '+90 HP', '#4caf50');
        audio.playHeal();
        for (let i = 0; i < 20; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 30,
            y: player.y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#6aa84f',
            size: Math.random() * 3 + 2,
            alpha: 1,
            life: 30,
            maxLife: 30
          });
        }
      } else if (ability.name === 'Meltdown Catalyst') {
        // Absolute nuclear blast on all poisoned targets
        enemies.current.forEach(enemy => {
          const wasPoisoned = enemy.poisonTimer > 0;
          const dmg = wasPoisoned ? 390 : 150;
          damageEnemy(enemy, dmg, 'plague');
          if (wasPoisoned) {
            enemy.poisonTimer = 240;
            spawnExplosionSmoke(enemy.x, enemy.y, 50, '#274e13');
          }
        });
        spawnExplosionSmoke(player.x, player.y, 250, '#38761d');
      }
    }

    // NYXARIS CORES
    else if (charId === 'nyxaris') {
      if (ability.name === 'Empress Scepter') {
        // Shoots horizontal scepter streams
        const dir = player.direction === 'right' ? 1 : -1;
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            projectiles.current.push({
              id: Math.random(),
              x: player.x,
              y: player.y - 10 + i * 10,
              vx: dir * 12,
              vy: 0,
              size: 9,
              color: '#ee82ee',
              glowColor: '#8b008b',
              owner: 'player',
              damage: 110,
              life: 80,
              maxLife: 80,
              trailParticlesCount: 2,
              effectType: 'void'
            });
          }, i * 100);
        }
      } else if (ability.name === 'Shadow Cape') {
        // Buff speed and grants massive speed trail
        addFloatingText(player.x, player.y - 30, 'SHADOW STEALTH', '#ee82ee', 15);
        for (let i = 0; i < 15; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: '#4b0082',
            size: 4,
            alpha: 1,
            life: 30,
            maxLife: 30
          });
        }
        // Heal minor
        playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + 40);
        audio.playHeal();
      } else if (ability.name === 'Celestial Crack') {
        // Releases spatial crack lines (aoe)
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 160) {
            damageEnemy(enemy, 130, 'void');
            enemy.frozenTimer = 100; // Slow
          }
        });
        spawnExpandingRing(player.x, player.y, 160, '#8b008b');
      } else if (ability.name === 'Crown Singularity') {
        // Trigger complete planetary collapse
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 350, 'void');
          // Pull hard
          const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.x += Math.cos(angle) * 70;
          enemy.y += Math.sin(angle) * 70;
        });
        spawnExplosionSmoke(player.x, player.y, 300, '#ee82ee');
      }
    }

    // MORTIVAN CORES
    else if (charId === 'mortivan') {
      if (ability.name === 'Necro Blast') {
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 11,
          vy: 0,
          size: 10,
          color: '#39ff14',
          glowColor: '#00a86b',
          owner: 'player',
          damage: 140,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 2,
          effectType: 'plague'
        });
      } else if (ability.name === 'Jade Antlers') {
        // Spikes that erupt from ground
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 170) {
            damageEnemy(enemy, 140, 'plague');
            enemy.frozenTimer = 180; // Impale/stun
          }
        });
        spawnExpandingRing(player.x, player.y, 170, '#00a86b');
      } else if (ability.name === 'Royal Spirits') {
        // Summons skeleton guardians to fight beside him
        for (let i = 0; i < 2; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + (i === 0 ? -45 : 45),
            y: player.y + 15,
            type: 'skeleton',
            color: '#39ff14',
            life: 660,
            maxLife: 660,
            lastShootTime: 0,
            vx: 0, vy: 0
          });
        }
      } else if (ability.name === 'Soul Harvest') {
        // Surrounds player in spirit vacuum
        let totalHarvest = 0;
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 180) {
            damageEnemy(enemy, 100, 'plague');
            totalHarvest += 15;
            particles.current.push({
              id: Math.random(),
              x: enemy.x,
              y: enemy.y,
              vx: (player.x - enemy.x) * 0.1,
              vy: (player.y - enemy.y) * 0.1,
              color: '#39ff14',
              size: 4, alpha: 1, life: 12, maxLife: 12
            });
          }
        });
        if (totalHarvest > 0) {
          playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + totalHarvest);
          addFloatingText(player.x, player.y - 20, `+${totalHarvest} Harvested`, '#39ff14');
          audio.playHeal();
        }
      }
    }

    // INFERNUS CORES
    else if (charId === 'infernus') {
      if (ability.name === 'Molten Cleave') {
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 11,
          vy: Math.sin(angle) * 11,
          size: 10,
          color: '#ff4500',
          glowColor: '#ffd700',
          owner: 'player',
          damage: 130,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 3,
          effectType: 'magma'
        });
      } else if (ability.name === 'Molten Geyser') {
        // Erupt magma geysers under 4 random close spots
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 240;
            const ry = player.y + (Math.random() - 0.5) * 240;
            enemies.current.forEach(enemy => {
              if (getDistance(rx, ry, enemy.x, enemy.y) < 70) {
                damageEnemy(enemy, 160, 'magma');
                enemy.burnedTimer = 180;
              }
            });
            spawnExpandingRing(rx, ry, 70, '#ff4500');
          }, i * 150);
        }
      } else if (ability.name === 'Ash Wings') {
        // Speed up and burn all close enemies
        addFloatingText(player.x, player.y - 30, 'ASH WINGS ACTIVATED', '#ff4500', 14);
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 150) {
            enemy.burnedTimer = 240;
            damageEnemy(enemy, 60, 'magma');
          }
        });
        for (let i = 0; i < 20; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 40,
            y: player.y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: '#ffd700',
            size: Math.random() * 4 + 2,
            alpha: 1,
            life: 30,
            maxLife: 30
          });
        }
      } else if (ability.name === 'Tyrant Apocalypse') {
        // High-damage volcanic fire rain
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 500;
            const ry = player.y - 300;
            projectiles.current.push({
              id: Math.random(),
              x: rx,
              y: ry,
              vx: (Math.random() - 0.5) * 3,
              vy: 8,
              size: 11,
              color: '#ff4500',
              glowColor: '#ff0000',
              owner: 'player',
              damage: 260,
              life: 90,
              maxLife: 90,
              trailParticlesCount: 3,
              effectType: 'magma'
            });
          }, i * 150);
        }
      }
    }

    // THALASSOR CORES
    else if (charId === 'thalassor') {
      if (ability.name === 'Abyssal Trident') {
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 13,
          vy: Math.sin(angle) * 13,
          size: 9,
          color: '#40e0d0',
          glowColor: '#008080',
          owner: 'player',
          damage: 140,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 2,
          effectType: 'frost'
        });
      } else if (ability.name === 'Tsunami Wave') {
        // Knocks back and slows all targets on the screen
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 260) {
            damageEnemy(enemy, 100, 'frost');
            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            enemy.x += Math.cos(angle) * 60;
            enemy.y += Math.sin(angle) * 60;
            enemy.frozenTimer = 120; // slow
          }
        });
        spawnExpandingRing(player.x, player.y, 260, '#008080');
      } else if (ability.name === 'Coral Cage') {
        // Encase surrounding enemies in crystal prisms
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 140) {
            damageEnemy(enemy, 90, 'frost');
            enemy.frozenTimer = 240; // Freeze
          }
        });
        spawnExpandingRing(player.x, player.y, 140, '#4682b4');
      } else if (ability.name === 'Drowned Curse') {
        // Giant whirlpool dragging enemies to ocean depth
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 330, 'frost');
          const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.x += Math.cos(angle) * 80;
          enemy.y += Math.sin(angle) * 80;
        });
        spawnExplosionSmoke(player.x, player.y, 300, '#40e0d0');
      }
    }

    // ZARAKHOS CORES
    else if (charId === 'zarakhos') {
      if (ability.name === 'Celestial Lightning') {
        // Fires piercing golden bolt of shock
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 15,
          vy: 0,
          size: 9,
          color: '#ffff00',
          glowColor: '#ffd700',
          owner: 'player',
          damage: 130,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 3,
          effectType: 'holy'
        });
      } else if (ability.name === 'Invoker Spark') {
        // Spawns 2 circling spark orbs
        for (let i = 0; i < 2; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            type: 'orb',
            color: '#ffff00',
            life: 480, // 8s
            maxLife: 480,
            lastShootTime: 0,
            vx: 0, vy: 0
          });
        }
        spawnExpandingRing(player.x, player.y, 100, '#ffd700');
      } else if (ability.name === 'Lightning Dash') {
        // Teleports player forward and shock trail
        const prevX = player.x;
        const prevY = player.y;
        player.x = Math.max(32, Math.min(3000 - 32, player.x + dirSign * 180));
        spawnExplosionSmoke(prevX, prevY, 50, '#ffd700');
        spawnExplosionSmoke(player.x, player.y, 50, '#ffffff');
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 110) {
            damageEnemy(enemy, 100, 'holy');
            enemy.frozenTimer = 60; // short paralyze
          }
        });
      } else if (ability.name === 'Heavenly Storm') {
        // Huge lightning rain storms
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 500;
            const ry = player.y - 300;
            projectiles.current.push({
              id: Math.random(),
              x: rx,
              y: ry,
              vx: (Math.random() - 0.5) * 2,
              vy: 9,
              size: 11,
              color: '#ffff00',
              glowColor: '#ffd700',
              owner: 'player',
              damage: 270,
              life: 90,
              maxLife: 90,
              trailParticlesCount: 3,
              effectType: 'holy'
            });
          }, i * 150);
        }
      }
    }

    // VEXILIA CORES
    else if (charId === 'vexilia') {
      if (ability.name === 'Plague Stinger') {
        // Wide horizontal spread of stingers
        const dir = player.direction === 'right' ? 1 : -1;
        for (let angleOffset of [-0.3, -0.15, 0, 0.15, 0.3]) {
          projectiles.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            vx: dir * Math.cos(angleOffset) * 11,
            vy: Math.sin(angleOffset) * 11,
            size: 7,
            color: '#adff2f',
            glowColor: '#800080',
            owner: 'player',
            damage: 90,
            life: 80,
            maxLife: 80,
            trailParticlesCount: 2,
            effectType: 'plague'
          });
        }
      } else if (ability.name === 'Spore Cloud Nest') {
        // Toxic cloud areas
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 160) {
            enemy.poisonTimer = 300;
            enemy.poisonDamage = 15;
            damageEnemy(enemy, 50, 'plague');
          }
        });
        spawnExpandingRing(player.x, player.y, 160, '#800080');
      } else if (ability.name === 'Chitin Armor') {
        // Buff speed and armor + healing
        addFloatingText(player.x, player.y - 30, 'CHITIN DEFENSE ACTIVATED!', '#4b0082', 15);
        playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + 100);
        addFloatingText(player.x, player.y - 15, '+100 Healing', '#4caf50');
        audio.playHeal();
        for (let i = 0; i < 15; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 35,
            y: player.y + (Math.random() - 0.5) * 35,
            vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
            color: '#adff2f',
            size: 4, alpha: 1, life: 30, maxLife: 30
          });
        }
      } else if (ability.name === 'Matriarch Swarm') {
        // Spawn beetle helpers
        for (let i = 0; i < 3; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 40,
            y: player.y + (Math.random() - 0.5) * 40,
            type: 'pest',
            color: '#adff2f',
            life: 600,
            maxLife: 600,
            lastShootTime: 0,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5
          });
        }
        spawnExplosionSmoke(player.x, player.y, 80, '#228b22');
      }
    }

    // ZERAETH CORES
    else if (charId === 'zeraeth') {
      if (ability.name === 'Beyond Slash') {
        // High-damage circular spatial wave
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 170) {
            damageEnemy(enemy, 160, 'void');
            enemy.frozenTimer = 100; // slow
          }
        });
        spawnExpandingRing(player.x, player.y, 170, '#ff007f');
      } else if (ability.name === 'Cosmic Orbs') {
        // Orbits starry fragments
        for (let i = 0; i < 3; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + Math.cos(i * 2.09) * 50,
            y: player.y + Math.sin(i * 2.09) * 50,
            type: 'orb',
            color: '#6a0dad',
            life: 540,
            maxLife: 540,
            lastShootTime: 0,
            vx: 0, vy: 0
          });
        }
      } else if (ability.name === 'Dimensional Tear') {
        // Instantly warp and stun
        const prevX = player.x;
        const prevY = player.y;
        player.x = Math.max(32, Math.min(3000 - 32, player.x + dirSign * 190));
        spawnExplosionSmoke(prevX, prevY, 60, '#ff007f');
        spawnExplosionSmoke(player.x, player.y, 60, '#ffffff');
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 130) {
            damageEnemy(enemy, 110, 'void');
            enemy.frozenTimer = 150; // Stun
          }
        });
      } else if (ability.name === 'Galaxy Eater') {
        // Space collapse deal high dmg
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 380, 'void');
          enemy.frozenTimer = 180;
        });
        spawnExplosionSmoke(player.x, player.y, 340, '#ff007f');
        spawnExpandingRing(player.x, player.y, 340, '#ffffff');
      }
    }

    // MALGORATH CORES
    else if (charId === 'malgorath') {
      if (ability.name === 'World Slash') {
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 11,
          vy: Math.sin(angle) * 11,
          size: 11,
          color: '#ff7f50',
          glowColor: '#b22222',
          owner: 'player',
          damage: 150,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 3,
          effectType: 'magma'
        });
      } else if (ability.name === 'Core Eruption') {
        // Erupt magma debris under player
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 180) {
            damageEnemy(enemy, 150, 'magma');
            enemy.burnedTimer = 180;
          }
        });
        spawnExplosionSmoke(player.x, player.y, 180, '#b22222');
      } else if (ability.name === 'Meteor Rain') {
        // Rain of falling planetary chunks
        for (let i = 0; i < 9; i++) {
          setTimeout(() => {
            const rx = player.x + (Math.random() - 0.5) * 500;
            const ry = player.y - 300;
            projectiles.current.push({
              id: Math.random(),
              x: rx,
              y: ry,
              vx: (Math.random() - 0.5) * 2,
              vy: 7,
              size: 12,
              color: '#ff7f50',
              glowColor: '#b22222',
              owner: 'player',
              damage: 280,
              life: 90,
              maxLife: 90,
              trailParticlesCount: 3,
              effectType: 'magma'
            });
          }, i * 160);
        }
      } else if (ability.name === 'World Meltdown') {
        // Screen wide absolute meltdown
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 410, 'magma');
          enemy.burnedTimer = 240;
        });
        spawnExplosionSmoke(player.x, player.y, 350, '#ffffff');
        spawnExpandingRing(player.x, player.y, 350, '#ff7f50');
      }
    }

    // VYLEXOR CORES
    else if (charId === 'vylexor') {
      if (ability.name === 'Time Bolt') {
        // Fast light-blue chronological needle projectile
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 15,
          vy: 0,
          size: 8,
          color: '#7fdbff',
          glowColor: '#0074d9',
          owner: 'player',
          damage: 130,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 3,
          effectType: 'frost' // chronological slow
        });
      } else if (ability.name === 'Hourglass Circle') {
        // Freezes all enemies on screen in time
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 220) {
            damageEnemy(enemy, 90, 'frost');
            enemy.frozenTimer = 240; // Freeze
          }
        });
        spawnExpandingRing(player.x, player.y, 220, '#0074d9');
      } else if (ability.name === 'Chronoshift') {
        // Speed up + gain minor shield heal
        addFloatingText(player.x, player.y - 30, 'TIME ACCELERATED!', '#7fdbff', 15);
        playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + 70);
        audio.playHeal();
        for (let i = 0; i < 20; i++) {
          particles.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 35,
            y: player.y + (Math.random() - 0.5) * 35,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            color: '#7fdbff',
            size: 3, alpha: 1, life: 30, maxLife: 30
          });
        }
      } else if (ability.name === 'Temporal Collapse') {
        // Detonates temporal mirrors across the field
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 330, 'frost');
          enemy.frozenTimer = 150;
        });
        spawnExplosionSmoke(player.x, player.y, 280, '#ffffff');
        spawnExpandingRing(player.x, player.y, 280, '#0074d9');
      }
    }

    // NYSSUL CORES
    else if (charId === 'nyssul') {
      if (ability.name === 'Infected Laser') {
        // Rapid succession of green infection lasers (fire 3 in sequence)
        const dir = player.direction === 'right' ? 1 : -1;
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            projectiles.current.push({
              id: Math.random(),
              x: player.x,
              y: player.y,
              vx: dir * 14,
              vy: 0,
              size: 8,
              color: '#7cfc00',
              glowColor: '#2d5a27',
              owner: 'player',
              damage: 100,
              life: 80,
              maxLife: 80,
              trailParticlesCount: 2,
              effectType: 'plague'
            });
          }, i * 120);
        }
      } else if (ability.name === 'Spore Cloud Nest') {
        // Lime green gas bursts
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 160) {
            enemy.poisonTimer = 300;
            enemy.poisonDamage = 16;
            damageEnemy(enemy, 50, 'plague');
          }
        });
        spawnExpandingRing(player.x, player.y, 160, '#2d5a27');
      } else if (ability.name === 'Parasite Swarm') {
        // Spawn helper spiders
        for (let i = 0; i < 3; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 40,
            y: player.y + (Math.random() - 0.5) * 40,
            type: 'pest',
            color: '#adff2f',
            life: 600,
            maxLife: 600,
            lastShootTime: 0,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5
          });
        }
      } else if (ability.name === 'Plague Star Rising') {
        // Complete necrotic shockwave
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 340, 'plague');
          enemy.poisonTimer = 300;
          enemy.poisonDamage = 20;
        });
        spawnExplosionSmoke(player.x, player.y, 300, '#7cfc00');
      }
    }

    // LUXION CORES
    else if (charId === 'luxion') {
      if (ability.name === 'Dimension Rift') {
        // Launches forward golden space cracks
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 13,
          vy: 0,
          size: 10,
          color: '#ff00ff',
          glowColor: '#ffd700',
          owner: 'player',
          damage: 140,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 2,
          effectType: 'void'
        });
      } else if (ability.name === 'Golden Halos') {
        // Summons floating halos
        for (let i = 0; i < 2; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x,
            y: player.y,
            type: 'orb',
            color: '#ffd700',
            life: 540,
            maxLife: 540,
            lastShootTime: 0,
            vx: 0, vy: 0
          });
        }
      } else if (ability.name === 'Fracture Rift') {
        // Blink forward with blue lightning
        const prevX = player.x;
        const prevY = player.y;
        player.x = Math.max(32, Math.min(3000 - 32, player.x + dirSign * 170));
        spawnExplosionSmoke(prevX, prevY, 50, '#ffd700');
        spawnExplosionSmoke(player.x, player.y, 50, '#4169e1');
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 120) {
            damageEnemy(enemy, 100, 'holy');
            enemy.frozenTimer = 120; // Stun
          }
        });
      } else if (ability.name === 'Multiverse Rip') {
        // Complete screen wide rip
        enemies.current.forEach(enemy => {
          damageEnemy(enemy, 350, 'void');
          enemy.frozenTimer = 150;
        });
        spawnExplosionSmoke(player.x, player.y, 320, '#ffffff');
        spawnExpandingRing(player.x, player.y, 320, '#ffd700');
      }
    }

    // XALDRIS CORES
    else if (charId === 'xaldris') {
      if (ability.name === 'Sapphire Scythe') {
        // Throw spinning sapphire scythe wave
        const angle = player.direction === 'right' ? 0 : Math.PI;
        projectiles.current.push({
          id: Math.random(),
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 11,
          vy: Math.sin(angle) * 3,
          size: 11,
          color: '#00bfff',
          glowColor: '#104e8b',
          owner: 'player',
          damage: 150,
          life: 80,
          maxLife: 80,
          trailParticlesCount: 3,
          effectType: 'void'
        });
      } else if (ability.name === 'Ghostly Chains') {
        // Stun and damage surrounding
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 170) {
            damageEnemy(enemy, 100, 'void');
            enemy.frozenTimer = 200; // Chain down
          }
        });
        spawnExpandingRing(player.x, player.y, 170, '#104e8b');
      } else if (ability.name === 'Spectral Wisps') {
        // Spawn helper souls
        for (let i = 0; i < 3; i++) {
          summons.current.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 40,
            y: player.y + (Math.random() - 0.5) * 40,
            type: 'orb',
            color: '#00bfff',
            life: 600,
            maxLife: 600,
            lastShootTime: 0,
            vx: 0, vy: 0
          });
        }
      } else if (ability.name === 'Soul Feast') {
        // Blast dealing high dmg and heal player
        let count = 0;
        enemies.current.forEach(enemy => {
          if (getDistance(player.x, player.y, enemy.x, enemy.y) < 200) {
            damageEnemy(enemy, 320, 'void');
            count++;
            particles.current.push({
              id: Math.random(),
              x: enemy.x, y: enemy.y,
              vx: (player.x - enemy.x) * 0.1,
              vy: (player.y - enemy.y) * 0.1,
              color: '#00bfff',
              size: 4, alpha: 1, life: 12, maxLife: 12
            });
          }
        });
        if (count > 0) {
          const heal = Math.min(120, count * 15);
          playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + heal);
          addFloatingText(player.x, player.y - 20, `+${heal} Feast HP`, '#00bfff');
          audio.playHeal();
        }
        spawnExplosionSmoke(player.x, player.y, 200, '#104e8b');
      }
    }
  };

  // --- DAMAGING ENEMIES AND PLAYERS ---

  const damageEnemy = (enemy: Enemy, dmg: number, effectType: string, isTick = false) => {
    if (enemy.hp <= 0) return;

    // Critical strike chance check
    const isCrit = !isTick && (Math.random() < (playerStats.current.criticalChance || 0.1));
    const finalDmg = isCrit ? Math.floor(dmg * 2.0) : dmg;

    enemy.hp -= finalDmg;
    enemy.state = 'hit';
    
    // Play audio hit unless it's silent tick
    if (!isTick) {
      audio.playHit();
    }

    if (isCrit) {
      addFloatingText(enemy.x, enemy.y - 45, 'CRITICAL!', '#ff0055', 20);
      // Spawn sparkly gold particles
      for (let i = 0; i < 8; i++) {
        particles.current.push({
          id: Math.random(),
          x: enemy.x + (Math.random() - 0.5) * 16,
          y: enemy.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          color: '#ffea00',
          size: Math.random() * 4 + 2,
          alpha: 1,
          life: 18,
          maxLife: 18
        });
      }
    }

    // Bounce enemy backward
    const p = playerPos.current;
    const angle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
    if (!isTick) {
      enemy.x += Math.cos(angle) * 15;
      enemy.y += Math.sin(angle) * 15;
    }

    // Color floating texts
    let dmgColor = '#ffffff';
    if (effectType === 'void') dmgColor = '#d500f9';
    if (effectType === 'magma') dmgColor = '#ff3d00';
    if (effectType === 'frost') dmgColor = '#00e5ff';
    if (effectType === 'plague') dmgColor = '#00e676';
    if (effectType === 'arcane') dmgColor = '#651fff';
    if (effectType === 'holy') dmgColor = '#ffea00';

    addFloatingText(enemy.x, enemy.y - 20, `-${finalDmg}`, dmgColor, isTick ? 12 : 18);

    // Apply status icons
    if (effectType === 'frost' && !isTick) {
      enemy.frozenTimer = 180; // frozen 3s
      addFloatingText(enemy.x, enemy.y - 35, 'FROZEN!', '#4cc9f0', 12);
    }
    if (effectType === 'plague' && !isTick) {
      enemy.poisonTimer = 240; // poisoned 4s
      enemy.poisonDamage = 15;
      addFloatingText(enemy.x, enemy.y - 35, 'POISONED', '#70e000', 12);
    }
    if (effectType === 'magma' && !isTick && Math.random() < 0.4) {
      enemy.burnedTimer = 150;
      addFloatingText(enemy.x, enemy.y - 35, 'BURNING', '#ff3c00', 12);
    }
  };

  const damagePlayer = (dmg: number) => {
    if (isDeadState.current) return;
    
    // Shield reduction if Azrakel shield is up (cooldown remaining < 2s for ease of simulation)
    const activeAura = selectedCharacter.id === 'azrakel' && (Date.now() - (gameState.cooldowns['Fallen Aura'] || 0) < 4000);
    const finalDmg = activeAura ? Math.floor(dmg * 0.5) : dmg;

    playerStats.current.hp -= finalDmg;
    playerAnim.current.state = 'hit';
    playerAnim.current.frame = 0;
    audio.playHit();

    addFloatingText(playerPos.current.x, playerPos.current.y - 20, `-${finalDmg}`, '#f44336', 22);

    setGameState(prev => ({ ...prev, playerHp: playerStats.current.hp }));

    // Dead check
    if (playerStats.current.hp <= 0) {
      isDeadState.current = true;
      playerAnim.current.state = 'die';
      playerAnim.current.frame = 0;
      audio.playExplosion();
      triggerSpeech('I... cannot fall here...');
    }
  };

  // --- RENDERING CANVAS DRAWING ---

  const renderGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frame: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply Camera Screen Shake
    if (screenShake.current > 0) {
      const sx = (Math.random() - 0.5) * screenShake.current;
      const sy = (Math.random() - 0.5) * screenShake.current;
      ctx.translate(sx, sy);
    }

    // Camera Centering and Zoom on Player
    const player = playerPos.current;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomLevelRef.current, zoomLevelRef.current);
    ctx.translate(-player.x, -player.y);

    // 1. Draw Ground Texture for 3000x3000px map
    drawArenaFloor(ctx, 3000, 3000, selectedCharacter.id, frame);

    // Draw Map boundary walls
    ctx.strokeStyle = selectedCharacter.palette.accent1;
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, 3000, 3000);

    // Draw Corner pillars
    ctx.fillStyle = selectedCharacter.palette.accent2;
    ctx.fillRect(-16, -16, 32, 32);
    ctx.fillRect(3000 - 16, -16, 32, 32);
    ctx.fillRect(-16, 3000 - 16, 32, 32);
    ctx.fillRect(3000 - 16, 3000 - 16, 32, 32);

    // 2. Draw Summons
    summons.current.forEach(sum => {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = sum.color;
      // Draw custom summoned shape
      if (sum.type === 'orb') {
        // Void portal ring
        ctx.beginPath();
        ctx.arc(sum.x, sum.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
        // Inner swirl
        ctx.fillStyle = '#0a001a';
        ctx.beginPath();
        ctx.arc(sum.x, sum.y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (sum.type === 'pest') {
        // Poison beetle
        ctx.fillRect(sum.x - 6, sum.y - 4, 12, 8);
        ctx.fillStyle = '#0a3a00';
        ctx.fillRect(sum.x - 3, sum.y - 2, 6, 4);
      } else if (sum.type === 'abyssal') {
        // Abyssal floating Watcher
        ctx.beginPath();
        ctx.arc(sum.x, sum.y, 18, 0, Math.PI * 2);
        ctx.fill();
        // Big white eye center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sum.x, sum.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = '#0a000c';
        ctx.beginPath();
        ctx.arc(sum.x + Math.sin(frame*0.1)*3, sum.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 3. Draw Projectiles
    projectiles.current.forEach(proj => {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = proj.glowColor;
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Draw Particles
    particles.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      ctx.restore();
    });

    // 5. Draw Enemies
    enemies.current.forEach(enemy => {
      drawEnemySprite(
        ctx,
        enemy.x,
        enemy.y,
        enemy.type,
        enemy.state,
        enemy.animFrame,
        enemy.color,
        enemy.accentColor,
        enemy.frozenTimer > 0
      );

      // Draw Enemy Health Bars
      if (enemy.hp > 0) {
        const barW = 28;
        const barH = 3.5;
        const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.size - 14, barW, barH);
        ctx.fillStyle = enemy.poisonTimer > 0 ? '#4caf50' : '#ff3b30';
        ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.size - 14, barW * hpPct, barH);
      }
    });

    // 6. Draw Playable Character (Player)
    drawPixelSprite(
      ctx,
      player.x,
      player.y,
      selectedCharacter.id,
      playerAnim.current.state,
      playerAnim.current.frame,
      selectedCharacter.palette,
      1.7, // Custom scale up to match 64x64 design sizing
      player.direction
    );

    // Draw active buff overlays around player
    const activeAura = selectedCharacter.id === 'azrakel' && (Date.now() - (gameState.cooldowns['Fallen Aura'] || 0) < 4000);
    if (activeAura) {
      // Rotate golden shield orbits
      ctx.save();
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const isRaging = selectedCharacter.id === 'kargul' && (Date.now() - (gameState.cooldowns['Blood Rage'] || 0) < 4000);
    if (isRaging) {
      // Volcanic orange sparks
      ctx.fillStyle = '#ff5722';
      ctx.fillRect(player.x - 18 + Math.random()*36, player.y - 30 + Math.random()*20, 3, 3);
    }

    // 7. Draw Dialogue speech bubble if active
    const bubble = speechBubble.current;
    if (bubble) {
      ctx.save();
      const bx = player.x;
      const by = player.y - 48; // Position above head

      ctx.font = '11px monospace';
      const textW = ctx.measureText(bubble.text).width;
      const padX = 8;
      const padY = 6;
      const bW = textW + padX * 2;
      const bH = 22;

      // Draw bubble background with black pixel borders
      ctx.fillStyle = 'rgba(10, 10, 12, 0.9)';
      ctx.fillRect(bx - bW / 2, by - bH, bW, bH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - bW / 2, by - bH, bW, bH);

      // Triangle pointer down
      ctx.fillStyle = 'rgba(10, 10, 12, 0.9)';
      ctx.beginPath();
      ctx.moveTo(bx - 4, by);
      ctx.lineTo(bx + 4, by);
      ctx.lineTo(bx, by + 4);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(bubble.text, bx, by - 7);

      ctx.restore();
    }

    // 8. Draw Floating Texts
    floatingTexts.current.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    ctx.restore();

    // 9. Draw static crosshair / instructions helper
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px monospace';
    ctx.fillText('WASD / Arrows to Move | Space to Attack | Z, X, C, V for Spells', 16, canvas.height - 14);
  };

  // --- ENTITY HELPERS ---

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const getClosestEnemy = (x: number, y: number): Enemy | null => {
    let closest: Enemy | null = null;
    let minDist = Infinity;
    enemies.current.forEach(enemy => {
      if (enemy.hp > 0) {
        const dist = getDistance(x, y, enemy.x, enemy.y);
        if (dist < minDist) {
          minDist = dist;
          closest = enemy;
        }
      }
    });
    return closest;
  };

  const addFloatingText = (x: number, y: number, text: string, color: string, size = 16) => {
    floatingTexts.current.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      size,
      vy: -1.2,
      alpha: 1,
      life: 35
    });
  };

  const spawnExpandingRing = (x: number, y: number, maxRadius: number, color: string) => {
    for (let r = 10; r < maxRadius; r += 20) {
      setTimeout(() => {
        for (let a = 0; a < Math.PI * 2; a += 0.25) {
          particles.current.push({
            id: Math.random(),
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            vx: Math.cos(a) * 0.5,
            vy: Math.sin(a) * 0.5,
            color,
            size: Math.random() * 3 + 1,
            alpha: 1,
            life: 15,
            maxLife: 15
          });
        }
      }, r * 2);
    }
  };

  const spawnExplosionSmoke = (x: number, y: number, radius: number, color: string) => {
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      particles.current.push({
        id: Math.random(),
        x: x + Math.cos(angle) * dist * 0.1,
        y: y + Math.sin(angle) * dist * 0.1,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4),
        color,
        size: Math.random() * 6 + 2,
        alpha: 1,
        life: 20 + Math.random() * 25,
        maxLife: 45
      });
    }
  };

  // --- BUTTON CLICKS (SANDBOX & DEMO CONTROLS) ---

  const spawnTestDummy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Spawns a harmless training dummy that displays stats and absorbs damage cascades
    const rx = playerPos.current.x + (Math.random() - 0.5) * 150;
    const ry = playerPos.current.y + (Math.random() - 0.5) * 150;

    enemies.current.push({
      id: Math.random(),
      x: rx,
      y: ry,
      vx: 0,
      vy: 0,
      hp: 1000,
      maxHp: 1000,
      speed: 0, // Stand still
      size: 18,
      type: 'brute',
      color: '#475569',
      accentColor: '#ffd60a',
      name: 'Training Dummy',
      lastAttackTime: 0,
      frozenTimer: 0,
      poisonTimer: 0,
      poisonDamage: 0,
      burnedTimer: 0,
      state: 'idle',
      animFrame: 0
    });

    addFloatingText(rx, ry - 30, 'Dummy Spawned!', '#ffd60a');
    audio.playHeal();
  };

  const spawnHostileWave = () => {
    nextWave();
  };

  const nextWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wave = gameState.wave;
    const enemyTypes: ('crawler' | 'ranged' | 'brute' | 'swarm')[] = ['crawler', 'ranged', 'brute', 'swarm'];
    const names = {
      crawler: 'Void Lurker',
      ranged: 'Floating Eye',
      brute: 'Magma Golem',
      swarm: 'Plague Rat'
    };
    const colors = {
      crawler: '#6b21a8',
      ranged: '#b91c1c',
      brute: '#c2410c',
      swarm: '#15803d'
    };
    const accents = {
      crawler: '#c084fc',
      ranged: '#f87171',
      brute: '#f97316',
      swarm: '#4ade80'
    };

    // If wave is multiple of 10, spawn a massive OMEGA Boss with 1000 health and 2 abilities
    const isBossWave = (wave % 10 === 0);
    
    if (isBossWave) {
      const rx = Math.max(100, Math.min(3000 - 100, playerPos.current.x));
      const ry = Math.max(100, Math.min(3000 - 100, playerPos.current.y - 300));
      enemies.current.push({
        id: Math.random(),
        x: rx,
        y: ry,
        vx: 0,
        vy: 0,
        hp: 1000,
        maxHp: 1000,
        speed: 1.1,
        size: 38,
        type: 'brute',
        color: '#ff0055',
        accentColor: '#ffeb3b',
        name: `OMEGA RAID BOSS (WAVE ${wave})`,
        lastAttackTime: 0,
        frozenTimer: 0,
        poisonTimer: 0,
        poisonDamage: 0,
        burnedTimer: 0,
        state: 'walk',
        animFrame: 0,
        isBoss: true,
        lastAbilityTime: Date.now()
      });
      
      addFloatingText(rx, ry - 40, `WARNING: BOSS DETECTED!`, '#ff0055', 28);
    } else {
      // Spawn 3 + wave count enemies at random border points
      const count = 3 + wave;
      for (let i = 0; i < count; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        // Spawn around the player at a distance of 500 - 700 px, within 3000x3000px bounds
        const angle = Math.random() * Math.PI * 2;
        const distance = 500 + Math.random() * 200;
        let rx = playerPos.current.x + Math.cos(angle) * distance;
        let ry = playerPos.current.y + Math.sin(angle) * distance;
        rx = Math.max(50, Math.min(3000 - 50, rx));
        ry = Math.max(50, Math.min(3000 - 50, ry));

        enemies.current.push({
          id: Math.random(),
          x: rx,
          y: ry,
          vx: 0,
          vy: 0,
          hp: type === 'brute' ? 150 + wave * 25 : 60 + wave * 15,
          maxHp: type === 'brute' ? 150 + wave * 25 : 60 + wave * 15,
          speed: type === 'swarm' ? 2.2 : type === 'brute' ? 1.0 : 1.4,
          size: type === 'brute' ? 22 : 12,
          type,
          color: colors[type],
          accentColor: accents[type],
          name: names[type],
          lastAttackTime: 0,
          frozenTimer: 0,
          poisonTimer: 0,
          poisonDamage: 0,
          burnedTimer: 0,
          state: 'walk',
          animFrame: Math.floor(Math.random() * 20)
        });
      }
    }

    addFloatingText(playerPos.current.x, playerPos.current.y - 120, isBossWave ? 'BOSS SIEGE START!' : `WAVE ${wave} INCOMING!`, isBossWave ? '#ff0055' : '#ff5722', 24);
    audio.playSpell('Annihilation');
    
    setGameState(prev => ({ ...prev, wave: wave + 1 }));
  };

  const handleReset = () => {
    playerStats.current.hp = selectedCharacter.baseHp;
    playerStats.current.maxHp = selectedCharacter.baseHp;
    playerStats.current.mana = 100;
    playerStats.current.projectileCountBonus = 0;
    playerStats.current.projectileSizeMultiplier = 1.0;
    playerStats.current.criticalChance = 0.1;
    playerPos.current.x = 1500;
    playerPos.current.y = 1500;
    isDeadState.current = false;
    enemies.current = [];
    projectiles.current = [];
    summons.current = [];
    particles.current = [];
    
    setGameState({
      score: 0,
      kills: 0,
      wave: 1,
      playerHp: selectedCharacter.baseHp,
      playerMaxHp: selectedCharacter.baseHp,
      playerMana: 100,
      playerMaxMana: 100,
      cooldowns: {},
      gameTime: 0
    });
    
    addFloatingText(1500, 1470, 'Arena Reset!', '#ffffff');
    audio.playHeal();
  };

  const applyUpgrade = (choiceType: string) => {
    if (choiceType === 'health') {
      playerStats.current.maxHp += 150;
      playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + 150);
      addFloatingText(playerPos.current.x, playerPos.current.y - 40, 'MAX HEALTH +150', '#4caf50', 18);
    } else if (choiceType === 'heal') {
      playerStats.current.hp = Math.min(playerStats.current.maxHp, playerStats.current.hp + 500);
      addFloatingText(playerPos.current.x, playerPos.current.y - 40, 'HEALED +500 HP', '#2ecc71', 18);
      audio.playHeal();
    } else if (choiceType === 'projectile') {
      playerStats.current.projectileCountBonus += 3;
      addFloatingText(playerPos.current.x, playerPos.current.y - 40, 'PROJECTILE BURST +3', '#a855f7', 18);
    } else if (choiceType === 'size') {
      playerStats.current.projectileSizeMultiplier += 0.8;
      addFloatingText(playerPos.current.x, playerPos.current.y - 40, 'PROJECTILE SIZE +80%', '#f97316', 18);
    } else if (choiceType === 'critical') {
      playerStats.current.criticalChance += 0.30;
      addFloatingText(playerPos.current.x, playerPos.current.y - 40, 'CRIT CHANCE +30%', '#ffd60a', 18);
    }

    // Sync game state so HUD updates immediately
    setGameState(prev => ({
      ...prev,
      playerHp: playerStats.current.hp,
      playerMaxHp: playerStats.current.maxHp
    }));

    // Spawn lovely sparkle particles on the player to celebrate the upgrade!
    for (let i = 0; i < 25; i++) {
      particles.current.push({
        id: Math.random(),
        x: playerPos.current.x,
        y: playerPos.current.y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: '#ffea00',
        size: Math.random() * 5 + 3,
        alpha: 1,
        life: 40,
        maxLife: 40
      });
    }

    // Dismiss upgrade modal, resume game, and start the wave!
    setShowUpgradeChoice(false);
    setIsPlaying(true);
    nextWave();
  };

  // Progress Bar styling helper
  const hpPct = gameState.playerHp / gameState.playerMaxHp;
  const manaPct = gameState.playerMana / gameState.playerMaxMana;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* 1. HUD & TOP STATS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#111115] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded bg-gray-900 border flex items-center justify-center font-bold text-lg select-none"
            style={{ 
              borderColor: selectedCharacter.palette.accent1,
              color: selectedCharacter.palette.accent2,
              textShadow: `0 0 8px ${selectedCharacter.palette.accent2}`
            }}
          >
            {selectedCharacter.name[0]}
          </div>
          <div>
            <div className="text-xs font-mono text-gray-400">PLAYING AS</div>
            <div className="text-sm font-sans font-bold text-white tracking-tight">{selectedCharacter.name}</div>
          </div>
        </div>

        {/* HP, Mana Status indicators */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {/* HP Bar */}
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-red-400 flex items-center gap-1"><ShieldAlert size={11} /> HEALTH</span>
              <span className="text-white">{Math.max(0, gameState.playerHp)} / {gameState.playerMaxHp}</span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden border border-gray-900">
              <div 
                className="bg-red-500 h-full transition-all duration-100"
                style={{ width: `${Math.max(0, hpPct * 100)}%` }}
              />
            </div>
          </div>

          {/* Mana/Energy Bar */}
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-sky-400 flex items-center gap-1"><Zap size={11} /> ARCANE ENERGY</span>
              <span className="text-white">{gameState.playerMana} / 100</span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden border border-gray-900">
              <div 
                className="bg-sky-500 h-full transition-all duration-100"
                style={{ width: `${manaPct * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wave and Kill stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-gray-950 px-3 py-1.5 rounded border border-gray-800 text-center min-w-[70px]">
            <div className="text-gray-500 text-[10px]">WAVE</div>
            <div className="text-orange-400 font-bold text-sm">{gameState.wave - 1}</div>
          </div>
          <div className="bg-gray-950 px-3 py-1.5 rounded border border-gray-800 text-center min-w-[70px]">
            <div className="text-gray-500 text-[10px]">KILLS</div>
            <div className="text-red-400 font-bold text-sm">{gameState.kills}</div>
          </div>
          <div className="bg-gray-950 px-3 py-1.5 rounded border border-gray-800 text-center min-w-[80px]">
            <div className="text-gray-500 text-[10px]">SCORE</div>
            <div className="text-yellow-400 font-bold text-sm">{gameState.score}</div>
          </div>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE ARENA CANVAS VIEW */}
      <div 
        ref={containerRef} 
        className="relative flex-1 bg-gray-950 min-h-[400px] overflow-hidden group cursor-crosshair border-b border-gray-800"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full block"
          onClick={performBasicAttack}
        />

        {/* Dead Overlay Screen */}
        {isDeadState.current && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center animate-fade-in z-20">
            <Skull className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">THE VILLAIN HAS FALLEN</h2>
            <p className="text-gray-400 text-sm max-w-sm mb-6 font-mono">
              "Even immortal conquerors of light and void can crumble under endless siege."
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-mono rounded-lg border border-red-500 shadow-lg shadow-red-900/30 transition-all text-sm"
            >
              <RotateCcw size={16} /> RE-IGNITE SOUL
            </button>
          </div>
        )}

        {/* Level Upgrades Modal Overlay */}
        {showUpgradeChoice && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-30 select-none animate-fade-in">
            <div className="max-w-3xl w-full bg-[#111115] border border-yellow-500/40 rounded-xl p-5 shadow-2xl shadow-yellow-500/10">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-mono tracking-wider uppercase mb-2">
                  <Sparkles size={10} className="animate-pulse" /> WAVE CLEARED - EVOLUTION INITIATED
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-sans">
                  UNLEASH AWAKENED POWER
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Siphon ancient relics to mutate your playable character sprite.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                {/* Choice 1: Max Health */}
                <button
                  onClick={() => applyUpgrade('health')}
                  className="bg-gray-950/70 hover:bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-3 text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 group flex flex-col justify-between h-[180px]"
                >
                  <div>
                    <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                      <ShieldAlert size={16} />
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5 group-hover:text-emerald-400 transition-colors">Carapace</div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Suture your ancient cracked armor with void ore.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-emerald-400 mt-2 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded inline-block">
                    +150 MAX HP
                  </div>
                </button>

                {/* Choice 2: Instant Heal */}
                <button
                  onClick={() => applyUpgrade('heal')}
                  className="bg-gray-950/70 hover:bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-xl p-3 text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 group flex flex-col justify-between h-[180px]"
                >
                  <div>
                    <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                      <RefreshCw size={16} />
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">Soul Wells</div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Siphon lifeforce of vanquished foes.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-blue-400 mt-2 bg-blue-950/40 border border-blue-900/30 px-1.5 py-0.5 rounded inline-block">
                    +500 INSTANT HEAL
                  </div>
                </button>

                {/* Choice 3: Projectile Count */}
                <button
                  onClick={() => applyUpgrade('projectile')}
                  className="bg-gray-950/70 hover:bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-3 text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 group flex flex-col justify-between h-[180px]"
                >
                  <div>
                    <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                      <Sparkles size={16} />
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5 group-hover:text-purple-400 transition-colors">Split Shot</div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Fracture dimensional lines to multiply shots.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-purple-400 mt-2 bg-purple-950/40 border border-purple-900/30 px-1.5 py-0.5 rounded inline-block">
                    +3 PROJECTILES
                  </div>
                </button>

                {/* Choice 4: Projectile Size */}
                <button
                  onClick={() => applyUpgrade('size')}
                  className="bg-gray-950/70 hover:bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-xl p-3 text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 group flex flex-col justify-between h-[180px]"
                >
                  <div>
                    <div className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-2">
                      <Flame size={16} />
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5 group-hover:text-orange-400 transition-colors">Gigantism</div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Make your projectile vectors swell in size.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-orange-400 mt-2 bg-orange-950/40 border border-orange-900/30 px-1.5 py-0.5 rounded inline-block">
                    +80% SIZE
                  </div>
                </button>

                {/* Choice 5: Critical Strike Chance */}
                <button
                  onClick={() => applyUpgrade('critical')}
                  className="bg-gray-950/70 hover:bg-gray-900 border border-gray-800 hover:border-yellow-500/50 rounded-xl p-3 text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 group flex flex-col justify-between h-[180px]"
                >
                  <div>
                    <div className="w-8 h-8 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-2">
                      <Zap size={16} />
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5 group-hover:text-yellow-400 transition-colors">Overload</div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Saturate magic with unstable runes.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-yellow-400 mt-2 bg-yellow-950/40 border border-yellow-900/30 px-1.5 py-0.5 rounded inline-block">
                    +30% CRIT CHANCE
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Zoom & Canvas configuration overlay */}
        <div className="absolute top-3 left-3 bg-[#111115]/90 border border-gray-800 rounded-lg p-2 flex items-center gap-3 shadow-lg z-10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">ZOOM:</span>
            <input 
              type="range" 
              min="0.1" 
              max="10.0" 
              step="0.1" 
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-gray-300 w-8">{Math.floor(zoomLevel * 100)}%</span>
          </div>

          <div className="h-4 w-px bg-gray-800" />

          <button 
            onClick={() => setSpawnerMode(prev => prev === 'wave' ? 'sandbox' : 'wave')}
            className={`px-2 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${
              spawnerMode === 'wave' 
                ? 'bg-red-950 text-red-400 border-red-800' 
                : 'bg-blue-950 text-blue-400 border-blue-800'
            }`}
          >
            {spawnerMode === 'wave' ? 'Active Siege Wave' : 'Sandbox Playground'}
          </button>
        </div>

        {/* Audio control panel overlay */}
        <div className="absolute top-3 right-3 bg-[#111115]/90 border border-gray-800 rounded-lg p-2 flex items-center gap-2 shadow-lg z-10 text-xs font-mono">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gray-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="0.5" 
            step="0.05" 
            value={soundVolume} 
            onChange={(e) => {
              setSoundVolume(parseFloat(e.target.value));
              setSoundEnabled(true);
            }}
            className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Mobile Tactile Touch Controls Overlay */}
        <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between items-end pointer-events-none z-15 md:hidden select-none">
          {/* Virtual D-pad Movement Control */}
          <div className="flex flex-col items-center gap-1.5 p-2 bg-gray-950/80 border border-gray-800 rounded-2xl pointer-events-auto backdrop-blur-sm shadow-xl">
            <button
              onTouchStart={() => { keysPressed.current['w'] = true; }}
              onTouchEnd={() => { keysPressed.current['w'] = false; }}
              onMouseDown={() => { keysPressed.current['w'] = true; }}
              onMouseUp={() => { keysPressed.current['w'] = false; }}
              onMouseLeave={() => { keysPressed.current['w'] = false; }}
              className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 active:bg-gray-800 flex items-center justify-center text-gray-400 font-bold active:text-white"
            >
              ▲
            </button>
            <div className="flex gap-1.5">
              <button
                onTouchStart={() => { keysPressed.current['a'] = true; }}
                onTouchEnd={() => { keysPressed.current['a'] = false; }}
                onMouseDown={() => { keysPressed.current['a'] = true; }}
                onMouseUp={() => { keysPressed.current['a'] = false; }}
                onMouseLeave={() => { keysPressed.current['a'] = false; }}
                className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 active:bg-gray-800 flex items-center justify-center text-gray-400 font-bold active:text-white"
              >
                ◀
              </button>
              <button
                onTouchStart={() => { keysPressed.current['s'] = true; }}
                onTouchEnd={() => { keysPressed.current['s'] = false; }}
                onMouseDown={() => { keysPressed.current['s'] = true; }}
                onMouseUp={() => { keysPressed.current['s'] = false; }}
                onMouseLeave={() => { keysPressed.current['s'] = false; }}
                className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 active:bg-gray-800 flex items-center justify-center text-gray-400 font-bold active:text-white"
              >
                ▼
              </button>
              <button
                onTouchStart={() => { keysPressed.current['d'] = true; }}
                onTouchEnd={() => { keysPressed.current['d'] = false; }}
                onMouseDown={() => { keysPressed.current['d'] = true; }}
                onMouseUp={() => { keysPressed.current['d'] = false; }}
                onMouseLeave={() => { keysPressed.current['d'] = false; }}
                className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 active:bg-gray-800 flex items-center justify-center text-gray-400 font-bold active:text-white"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Spell & Attack Buttons */}
          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            {/* Spell skills row */}
            <div className="flex gap-2.5">
              {selectedCharacter.abilities.map((ability, idx) => {
                const cooldownLeft = getCooldownRemaining(ability.name);
                const manaCost = ability.cooldown > 8000 ? 40 : 20;
                const hasMana = gameState.playerMana >= manaCost;
                const hotkeyName = ['Z', 'X', 'C', 'V'][idx];

                return (
                  <button
                    key={ability.name}
                    onTouchStart={(e) => { e.preventDefault(); castAbility(ability); }}
                    onClick={(e) => { e.preventDefault(); castAbility(ability); }}
                    disabled={cooldownLeft > 0 || !hasMana || isDeadState.current}
                    className="w-10 h-10 rounded-full bg-gray-950 border border-gray-800 active:bg-gray-800 flex flex-col items-center justify-center text-xs font-mono font-bold select-none disabled:opacity-40 disabled:pointer-events-none relative"
                    style={{
                      borderColor: cooldownLeft === 0 && hasMana ? ability.color : '#374151',
                      color: cooldownLeft === 0 && hasMana ? '#ffffff' : '#6b7280'
                    }}
                  >
                    <span>{hotkeyName}</span>
                    {cooldownLeft > 0 && (
                      <span className="absolute inset-0 rounded-full bg-black/75 flex items-center justify-center text-[10px] text-orange-400 font-bold">
                        {cooldownLeft}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Huge Slash Attack Button */}
            <button
              onTouchStart={(e) => { e.preventDefault(); performBasicAttack(); }}
              onClick={(e) => { e.preventDefault(); performBasicAttack(); }}
              disabled={isDeadState.current}
              className="w-14 h-14 rounded-full bg-red-600 active:bg-red-700 border-2 border-red-500/80 active:scale-95 text-white font-mono font-black text-xs shadow-lg shadow-red-900/40 flex items-center justify-center uppercase select-none disabled:opacity-50"
            >
              SLASH
            </button>
          </div>
        </div>
      </div>

      {/* 3. LOWER CONTROLS & CASTING COMMAND DECKS */}
      <div className="p-4 bg-[#111115] flex flex-col md:flex-row gap-4 justify-between items-stretch">
        
        {/* CAST SIGNATURE ABILITIES */}
        <div className="flex-1">
          <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} className="text-yellow-500" /> CAST SIGNATURE SPELLS & ABILITIES
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {selectedCharacter.abilities.map((ability, idx) => {
              const cooldownLeft = getCooldownRemaining(ability.name);
              const manaCost = ability.cooldown > 8000 ? 40 : 20;
              const hasMana = gameState.playerMana >= manaCost;

              return (
                <button
                  key={ability.name}
                  onClick={() => castAbility(ability)}
                  disabled={cooldownLeft > 0 || !hasMana || isDeadState.current}
                  className="relative group bg-gray-900 hover:bg-gray-800 disabled:bg-gray-950/70 disabled:hover:bg-gray-950 border border-gray-800 text-left p-2 rounded-lg flex flex-col justify-between h-[80px] hover:border-gray-600 disabled:border-gray-900 active:scale-95 transition-all select-none"
                  style={{
                    boxShadow: cooldownLeft === 0 && hasMana ? `inset 0 0 10px ${ability.color}20` : 'none'
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span 
                      className="text-xs font-sans font-bold truncate pr-1"
                      style={{ color: cooldownLeft === 0 && hasMana ? '#ffffff' : '#9ca3af' }}
                    >
                      {ability.name}
                    </span>
                    <span className="text-[9px] font-mono bg-gray-950 px-1.5 py-0.5 rounded text-gray-400 uppercase">
                      KEY {['z', 'x', 'c', 'v'][idx]}
                    </span>
                  </div>

                  {/* Description mini-hint */}
                  <div className="text-[10px] text-gray-500 font-mono truncate w-full">
                    SFX: {ability.sfxText}
                  </div>

                  <div className="flex items-center justify-between w-full mt-1.5 pt-1 border-t border-gray-800/60">
                    <span className="text-[10px] font-mono text-sky-400">
                      {manaCost} MP
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">
                      CD {ability.cooldown / 1000}s
                    </span>
                  </div>

                  {/* Cooldown overlay */}
                  {cooldownLeft > 0 && (
                    <div className="absolute inset-0 bg-black/75 rounded-lg flex items-center justify-center text-sm font-mono font-bold text-orange-400">
                      {cooldownLeft}s
                    </div>
                  )}

                  {/* Out of mana overlay */}
                  {!hasMana && cooldownLeft === 0 && (
                    <div className="absolute inset-0 bg-sky-950/30 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-sky-400 uppercase pointer-events-none">
                      Low Energy
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SANDBOX SPAWNING UTILITIES */}
        <div className="w-full md:w-[280px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-4">
          <div>
            <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={12} className="text-orange-500" /> BATTLE LAB & SPAWNERS
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={spawnTestDummy}
                disabled={isDeadState.current}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 active:scale-95 text-gray-300 font-mono text-[11px] rounded border border-gray-800 hover:border-gray-700 transition-all"
              >
                <RefreshCw size={12} className="text-yellow-400" /> + TEST DUMMY
              </button>
              <button
                onClick={spawnHostileWave}
                disabled={isDeadState.current}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-950/60 active:scale-95 text-red-200 font-mono text-[11px] rounded border border-red-900/60 hover:border-red-800 transition-all"
              >
                <Skull size={12} className="text-red-400" /> + SPAWN BEASTS
              </button>
            </div>
          </div>

          {/* CHATTER DIALOGUE CUSTOM WRITER */}
          <form onSubmit={handleCustomSpeechSubmit} className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              <MessageSquare size={10} /> SPEAK CUSTOM DIALOGUE
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                maxLength={45}
                placeholder="Type and press Enter to Speak..."
                value={customSpeechText}
                onChange={(e) => setCustomSpeechText(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 font-mono"
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-700 text-white font-mono text-[11px] px-3.5 py-1 rounded"
              >
                SAY
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
