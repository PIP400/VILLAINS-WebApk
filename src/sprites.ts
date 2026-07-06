import { CharacterId, CharacterPalette, AnimationState } from './types';

// Procedural Pixel Art Generator for 6 Deadly Power Villains
// It draws characters onto canvas using customizable color palettes

export function getBaseCharId(charId: CharacterId): string {
  const cid = charId.toLowerCase();
  if (cid === 'velthor' || cid === 'zeraeth' || cid === 'xaldris') return 'vorgan';
  if (cid === 'ravenor' || cid === 'infernus' || cid === 'malgorath') return 'kargul';
  if (cid === 'thundrex' || cid === 'thalassor' || cid === 'zarakhos' || cid === 'vylexor' || cid === 'luxion') return 'zyrael';
  if (cid === 'morgrav' || cid === 'zygor' || cid === 'mortivan' || cid === 'vexilia' || cid === 'nyssul') return 'malgor';
  if (cid === 'xerathos' || cid === 'nyxaris') return 'xilthar';
  return charId;
}

export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  x: number, // Target center X
  y: number, // Target center Y
  charId: CharacterId,
  animState: AnimationState,
  frame: number,
  palette: CharacterPalette,
  customScale = 1,
  direction: 'left' | 'right' = 'right'
) {
  charId = getBaseCharId(charId);
  ctx.save();
  ctx.translate(x, y);
  if (direction === 'left') {
    ctx.scale(-1, 1);
  }
  ctx.scale(customScale, customScale);

  // We operate on a virtual 32x32 coordinate grid centered at (0, 0)
  // Virtual pixel size = 2. Total width/height = 64x64.
  const pSize = 2; 

  // Compute animation offsets
  let bobY = 0;
  let limbSwing = 0;
  let weaponAngle = 0;
  let weaponOffset = { x: 0, y: 0 };
  let wingFlap = 0;
  let floatingHeight = 0;
  let isDead = animState === 'die';
  let isHit = animState === 'hit';

  if (animState === 'idle') {
    bobY = Math.sin(frame * 0.2) > 0 ? 1 : 0;
    wingFlap = Math.sin(frame * 0.15) * 2;
  } else if (animState === 'walk') {
    bobY = (frame % 2 === 0) ? 1 : 0;
    limbSwing = Math.sin(frame * 0.4) * 3;
    wingFlap = Math.sin(frame * 0.3) * 1.5;
  } else if (animState === 'attack') {
    // Attack swing frames (0 to 4)
    const phase = frame % 6;
    if (phase < 2) {
      weaponAngle = -0.5; // Wind up
      weaponOffset = { x: -2, y: -2 };
    } else if (phase < 4) {
      weaponAngle = 1.2; // Swing slash
      weaponOffset = { x: 4, y: 2 };
      bobY = 1;
    } else {
      weaponAngle = 0.5; // Recover
      weaponOffset = { x: 2, y: 1 };
    }
  } else if (animState === 'ability') {
    floatingHeight = Math.sin(frame * 0.25) * 2 - 2; // Floating off ground
    wingFlap = Math.sin(frame * 0.3) * 3 + 1;
    bobY = -1;
  }

  // Draw Hit shake and color flash
  if (isHit) {
    ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
  }

  // Draw Death falling and dissolving
  if (isDead) {
    ctx.rotate(Math.min(Math.PI / 2, frame * 0.2));
    ctx.translate(0, frame * 0.8);
    if (frame > 10) {
      ctx.globalAlpha = Math.max(0, 1 - (frame - 10) * 0.1);
    }
  }

  // Helpers to draw virtual pixels
  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, pSize, pSize);
  };

  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, w * pSize, h * pSize);
  };

  // Outline drawing helper to make pixel art stand out
  const drawBorder = (px: number, py: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect((px - 1) * pSize, py * pSize, pSize, h * pSize);
    ctx.fillRect((px + w) * pSize, py * pSize, pSize, h * pSize);
    ctx.fillRect(px * pSize, (py - 1) * pSize, w * pSize, pSize);
    ctx.fillRect(px * pSize, (py + h) * pSize, w * pSize, pSize);
  };

  // --- LAYER 1: FLOOR AURA / MAGIC CIRCLE ---
  if (!isDead) {
    drawAuraEffect(ctx, pSize, charId, frame, palette);
  }

  // --- LAYER 2: CAPE / WINGS / BACK FLOW ---
  drawBackLayer(ctx, pSize, charId, frame, palette, bobY, wingFlap);

  // --- LAYER 3: CORE BODY & LEGS ---
  // Leg 1 (Left)
  let legLOffset = animState === 'walk' ? limbSwing : 0;
  drawRect(-3, 10 + bobY, 2, 4 + (legLOffset > 0 ? -1 : 0), palette.primary); // thigh
  drawRect(-3, 13 + bobY + (legLOffset > 0 ? -1 : 0), 2, 2, palette.accent1); // boot
  // Leg 2 (Right)
  let legROffset = animState === 'walk' ? -limbSwing : 0;
  drawRect(1, 10 + bobY, 2, 4 + (legROffset > 0 ? -1 : 0), palette.primary);
  drawRect(1, 13 + bobY + (legROffset > 0 ? -1 : 0), 2, 2, palette.accent1);

  // --- LAYER 4: TORSO / ARMOR / ROBES ---
  // Draw chest area (-5 to +5 x-range, -2 to +10 y-range)
  drawBorder(-5, -2 + bobY, 10, 12);
  drawRect(-5, -2 + bobY, 10, 12, palette.primary); // Base chest plate

  // Armor Cracks & Glowing Accents
  if (charId === 'kargul') {
    // Magma cracks on torso
    drawPixel(-2, 2 + bobY, palette.accent1);
    drawPixel(-1, 3 + bobY, palette.accent2);
    drawPixel(1, 1 + bobY, palette.accent1);
    drawPixel(2, 4 + bobY, palette.accent2);
    // Heavy chains
    drawRect(-4, 7 + bobY, 8, 1, '#7f8c8d');
    drawRect(-3, 8 + bobY, 6, 1, '#95a5a6');
  } else if (charId === 'vorgan') {
    // Skeletal bones / Violet runes
    drawPixel(-2, 1 + bobY, palette.accent1);
    drawPixel(2, 1 + bobY, palette.accent1);
    drawRect(-1, 4 + bobY, 3, 1, palette.body); // rib bone look
    drawRect(-2, 6 + bobY, 5, 1, palette.body);
    drawPixel(0, 8 + bobY, palette.accent2);
  } else if (charId === 'zyrael') {
    // Ice crystals & Silver plates
    drawRect(-3, 0 + bobY, 6, 2, '#bdc3c7'); // silver shoulder guard
    drawPixel(-1, 3 + bobY, palette.accent1);
    drawPixel(1, 4 + bobY, palette.accent1);
    drawPixel(0, 6 + bobY, '#ffffff'); // shining crystal center
  } else if (charId === 'malgor') {
    // Poisonous ribcage / Skulls on chest
    drawRect(-3, 1 + bobY, 6, 1, palette.accent1); // rot olive
    drawPixel(-2, 3 + bobY, palette.body); // white skull tooth
    drawPixel(2, 3 + bobY, palette.body);
    drawPixel(0, 5 + bobY, palette.accent2); // toxic core
  } else if (charId === 'xilthar') {
    // Runic wizard details
    drawRect(-4, 1 + bobY, 8, 1, palette.accent1); // gold/violet belt line
    drawPixel(-2, 4 + bobY, palette.accent2);
    drawPixel(2, 4 + bobY, palette.accent2);
    drawPixel(0, 7 + bobY, '#ffffff');
  } else if (charId === 'azrakel') {
    // Holy gold accents
    drawRect(-4, 0 + bobY, 8, 2, palette.accent2); // Golden plate
    drawPixel(-2, 4 + bobY, palette.accent1);
    drawPixel(2, 4 + bobY, palette.accent1);
    drawPixel(0, 3 + bobY, '#ffffff'); // bright light
  }

  // --- LAYER 5: HEAD / HELMET / FACE ---
  const headY = -9 + bobY + floatingHeight;
  drawBorder(-4, headY, 8, 8);
  drawRect(-4, headY, 8, 8, palette.primary); // Helmet/Hood base

  // Face / Eye glow and Head accessories
  if (charId === 'vorgan') {
    // Shadow face with glowing purple eyes inside hood
    drawRect(-3, headY + 3, 6, 5, '#110222'); // shadow
    drawPixel(-2, headY + 4, palette.accent2); // Left eye
    drawPixel(1, headY + 4, palette.accent2);  // Right eye
    // Cracked hood look
    drawPixel(-3, headY + 1, palette.accent1);
  } else if (charId === 'kargul') {
    // Big curved demonic horns emerging from helmet
    drawRect(-6, headY - 3, 2, 4, palette.primary);
    drawRect(-5, headY - 5, 2, 2, palette.accent1);
    drawPixel(-4, headY - 6, palette.accent2); // Horn left tips

    drawRect(4, headY - 3, 2, 4, palette.primary);
    drawRect(3, headY - 5, 2, 2, palette.accent1);
    drawPixel(2, headY - 6, palette.accent2); // Horn right tips

    // Glowing orange eyes
    drawPixel(-2, headY + 3, palette.accent2);
    drawPixel(1, headY + 3, palette.accent2);
    drawRect(-1, headY + 5, 3, 1, palette.accent1); // volcanic mouth crack
  } else if (charId === 'zyrael') {
    // Jagged crown & frozen spires
    drawPixel(-3, headY - 2, palette.accent1);
    drawPixel(0, headY - 3, palette.accent2); // tall central crystal crown
    drawPixel(3, headY - 2, palette.accent1);

    // Glowing icy eyes beneath frosty helmet
    drawPixel(-2, headY + 3, palette.accent2);
    drawPixel(1, headY + 3, palette.accent2);
  } else if (charId === 'malgor') {
    // Rotting wizard hood with skeletal skull face
    drawRect(-3, headY + 2, 6, 6, palette.body); // white skull face
    drawPixel(-2, headY + 4, '#0a3d1d'); // dark socket
    drawPixel(1, headY + 4, '#0a3d1d');
    drawPixel(-1, headY + 4, palette.accent2); // burning green pupil
    drawPixel(1, headY + 4, palette.accent2);
    drawPixel(0, headY + 6, '#000000'); // nose gap
  } else if (charId === 'xilthar') {
    // Demonic wizard mask
    drawRect(-3, headY + 1, 6, 7, '#1b002c');
    drawPixel(-2, headY + 3, palette.accent2);
    drawPixel(1, headY + 3, palette.accent2);
    // Curved horn elements
    drawPixel(-4, headY - 1, palette.primary);
    drawPixel(-5, headY - 2, palette.accent1);
    drawPixel(3, headY - 1, palette.primary);
    drawPixel(4, headY - 2, palette.accent1);
  } else if (charId === 'azrakel') {
    // Golden helmet + Broken halo floating above
    drawRect(-2, headY, 5, 2, palette.accent2); // gold band
    drawPixel(-2, headY + 3, palette.accent1); // glowing eyes
    drawPixel(1, headY + 3, palette.accent1);

    // Broken golden halo orbiting above helmet
    const haloBob = Math.sin(frame * 0.1) * 1.5 - 4;
    drawRect(-4, headY + haloBob, 3, 1, palette.accent2); // left fragment
    drawRect(2, headY + haloBob, 2, 1, palette.accent2);  // right fragment (broken halo)
  }

  // --- LAYER 6: WEAPONS & HANDS ---
  // Arms & Weapon swing animation
  ctx.save();
  // Weapon hand position
  let armX = 5;
  let armY = 3 + bobY;
  ctx.translate(armX * pSize, armY * pSize);
  ctx.rotate(weaponAngle);
  ctx.translate(weaponOffset.x * pSize, weaponOffset.y * pSize);

  // Draw Arm
  drawRect(-1, -1, 3, 3, palette.primary); // shoulder gauntlet
  drawRect(-1, 2, 2, 2, palette.accent1);  // hand glove

  // Draw Weapon Details
  drawWeaponComponent(ctx, pSize, charId, frame, palette, animState);

  ctx.restore();

  // --- LAYER 7: FLOATING MAGIC ORBS & PARTICLES ---
  if (!isDead && (charId === 'xilthar' || charId === 'vorgan' || charId === 'malgor')) {
    drawOrbitingMagic(ctx, pSize, charId, frame, palette);
  }

  ctx.restore();
}

function drawAuraEffect(
  ctx: CanvasRenderingContext2D,
  pSize: number,
  charId: CharacterId,
  frame: number,
  palette: CharacterPalette
) {
  charId = getBaseCharId(charId);
  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, pSize, pSize);
  };
  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, w * pSize, h * pSize);
  };

  const t = frame * 0.15;
  const pulse = Math.sin(t) * 1.5;

  ctx.save();
  ctx.globalAlpha = 0.55;

  if (charId === 'vorgan') {
    // Swirling void pool
    drawRect(-6, 14, 12, 2, palette.primary);
    drawRect(-8, 15, 16, 1, palette.accent1);
    drawPixel(-10 + Math.floor(frame % 20), 14, palette.accent2);
    drawPixel(8 - Math.floor(frame % 16), 15, palette.body);
  } else if (charId === 'kargul') {
    // Volcanic embers, cracks under feet
    drawRect(-7, 14, 14, 2, '#4a1e12');
    drawRect(-5, 15, 10, 1, palette.accent1); // glowing lava
    drawPixel(-4 + Math.floor(frame % 10), 13, palette.accent2); // rising spark
    drawPixel(3 - Math.floor(frame % 8), 13, '#f39c12');
  } else if (charId === 'zyrael') {
    // Frosty cold ring
    drawRect(-6, 14, 12, 1, palette.accent1);
    drawRect(-4, 15, 8, 1, '#ffffff');
    drawPixel(-6 + Math.sin(t) * 4, 13, palette.accent2);
  } else if (charId === 'malgor') {
    // Slime puddles and green spores
    drawRect(-7, 14, 14, 2, '#1e3810');
    drawPixel(-5 + Math.floor(frame % 12), 14, palette.accent2);
    drawPixel(4 - Math.floor(frame % 10), 13, palette.accent1);
  } else if (charId === 'xilthar') {
    // Runic portal sigil
    drawRect(-8, 14, 16, 2, '#341547');
    drawPixel(-6, 14, palette.accent2);
    drawPixel(5, 14, palette.accent2);
    drawPixel(0, 15, '#ffffff');
  } else if (charId === 'azrakel') {
    // Glowing golden cracked ground / dark rays
    drawRect(-7, 14, 14, 1, palette.primary);
    drawRect(-5, 15, 10, 1, palette.accent2);
    drawPixel(-2, 13, palette.accent1);
    drawPixel(2, 13, palette.accent2);
  }

  ctx.restore();
}

function drawBackLayer(
  ctx: CanvasRenderingContext2D,
  pSize: number,
  charId: CharacterId,
  frame: number,
  palette: CharacterPalette,
  bobY: number,
  wingFlap: number
) {
  charId = getBaseCharId(charId);
  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, w * pSize, h * pSize);
  };

  if (charId === 'vorgan') {
    // Torn shadow cloak flowing behind
    ctx.save();
    const wave = Math.sin(frame * 0.2) * 1.5;
    drawRect(-8 + Math.floor(wave), -2 + bobY, 4, 12, palette.primary); // Dark cloak body
    drawRect(-7 + Math.floor(wave), 10 + bobY, 3, 3, palette.accent1);  // Ragged cloak fringe
    drawRect(-9 + Math.floor(wave), 2 + bobY, 2, 7, '#1b0230');        // Deeper shadow backing
    ctx.restore();
  } else if (charId === 'azrakel') {
    // Large damaged black feathered wings spreading behind
    ctx.save();
    // Left Wing
    ctx.translate(-4 * pSize, (-1 + bobY) * pSize);
    ctx.rotate((-wingFlap * Math.PI) / 180);
    drawRect(-12, -8, 12, 10, palette.primary); // Main dark wing structure
    // Damaged feathers gaps / cracks
    drawRect(-10, -6, 2, 2, '#000000'); // Damaged void spot
    drawRect(-14, -2, 4, 1, palette.accent1); // divine gold cracks
    drawRect(-15, 0, 3, 2, palette.accent1);  // lower feather tips
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.translate(4 * pSize, (-1 + bobY) * pSize);
    ctx.rotate((wingFlap * Math.PI) / 180);
    drawRect(0, -8, 12, 10, palette.primary); // Main wing
    drawRect(8, -6, 2, 2, '#000000');
    drawRect(10, -2, 4, 1, palette.accent1);
    drawRect(12, 0, 3, 2, palette.accent1);
    ctx.restore();
  } else if (charId === 'xilthar') {
    // Elegant wizard cape
    const capeWave = Math.sin(frame * 0.15) * 2;
    drawRect(-6 + Math.floor(capeWave), -1 + bobY, 3, 13, palette.primary);
    drawRect(-5 + Math.floor(capeWave), 2 + bobY, 2, 11, palette.accent1);
  } else if (charId === 'malgor') {
    // Tattered rotted robes extending down
    drawRect(-6, 4 + bobY, 12, 9, palette.primary);
    drawRect(-5, 12 + bobY, 10, 2, palette.accent1); // dragged ground cloth
  }
}

function drawWeaponComponent(
  ctx: CanvasRenderingContext2D,
  pSize: number,
  charId: CharacterId,
  frame: number,
  palette: CharacterPalette,
  animState: AnimationState
) {
  charId = getBaseCharId(charId);
  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, pSize, pSize);
  };
  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, w * pSize, h * pSize);
  };

  if (charId === 'vorgan') {
    // Gigantic double-bladed scythe of void crystal
    // Shaft: gray/black
    drawRect(0, -18, 1, 30, '#34495e'); // Long pole

    // Double scythe blades (top blade, bottom backup blade)
    ctx.save();
    // Top Blade
    ctx.translate(0, -18 * pSize);
    drawRect(1, -1, 10, 2, palette.weapon); // blade back
    drawRect(2, 1, 7, 1, palette.accent1);  // blade edge
    drawRect(4, 2, 4, 1, palette.accent2);  // glowing magenta core
    drawPixel(10, -1, palette.accent2);     // sharp tip
    // Bottom smaller blade
    drawRect(-6, 24 * pSize, 6, 2, palette.weapon);
    drawPixel(-7, 24 * pSize, palette.accent1);
    ctx.restore();
  } else if (charId === 'kargul') {
    // Oversized molten battle axe dripping lava
    drawRect(0, -10, 1, 24, '#2c3e50'); // heavy shaft

    // Axe head (dual bladed, molten glowing)
    ctx.save();
    ctx.translate(0, -7 * pSize);
    // Left Blade
    drawRect(-5, -3, 5, 8, palette.weapon); // dark core
    drawRect(-7, -2, 2, 6, palette.accent1); // burning red edge
    drawRect(-8, 0, 1, 3, palette.accent2);  // bright yellow highlight
    // Right Blade
    drawRect(1, -3, 5, 8, palette.weapon);
    drawRect(6, -2, 2, 6, palette.accent1);
    drawRect(8, 0, 1, 3, palette.accent2);
    // Center magma core spike
    drawRect(-1, -6, 3, 3, palette.accent2);
    ctx.restore();
  } else if (charId === 'zyrael') {
    // Gigantic glowing ice greatsword emitting frost
    ctx.save();
    ctx.translate(0, -6 * pSize);
    ctx.rotate((-20 * Math.PI) / 180); // tilt forward slightly
    // Guard
    drawRect(-4, 4, 9, 2, '#95a5a6'); // Silver steel guard
    drawPixel(0, 3, palette.accent1); // central gem
    // Blade
    drawRect(-2, -18, 5, 22, palette.weapon); // crystalline icy body
    drawRect(-1, -17, 3, 21, '#ffffff');      // bright white ice reflection
    drawRect(-3, -14, 1, 16, palette.accent1); // ice details
    drawRect(3, -14, 1, 16, palette.accent1);
    // Tip
    drawPixel(0, -19, '#ffffff');
    ctx.restore();
  } else if (charId === 'malgor') {
    // Plague staff topped with skulls and toxic crystals
    drawRect(0, -14, 1, 26, '#3e2723'); // gnarled wooden staff

    ctx.save();
    ctx.translate(0, -14 * pSize);
    // Rotted staff crown skull shape
    drawRect(-3, -3, 7, 5, palette.body); // bone skull head
    drawPixel(-2, -1, '#1b3a1a'); // green eye socket
    drawPixel(1, -1, '#1b3a1a');
    // Toxic glowing crystal orbiting above staff
    const crystalBob = Math.floor(Math.sin(frame * 0.2) * 2) - 6;
    drawRect(-2, crystalBob, 4, 3, palette.accent2); // green crystal
    drawPixel(-1, crystalBob - 1, '#ffffff');
    ctx.restore();
  } else if (charId === 'xilthar') {
    // Mage hand casting pose / floating void scroll or orb
    const spellBob = Math.sin(frame * 0.3) * 2;
    // Magic energy sphere floating above open hand
    drawRect(-2, -8 + Math.floor(spellBob), 5, 5, palette.weapon);
    drawRect(-1, -7 + Math.floor(spellBob), 3, 3, palette.accent1);
    drawPixel(0, -6 + Math.floor(spellBob), '#ffffff'); // bright core
  } else if (charId === 'azrakel') {
    // Enormous radiant holy sword glowing with golden light
    ctx.save();
    ctx.translate(0, -8 * pSize);
    ctx.rotate((15 * Math.PI) / 180);
    // Crossguard
    drawRect(-4, 6, 9, 2, '#d4af37'); // Gold guard
    // Glowing Blade
    drawRect(-2, -16, 5, 22, palette.weapon); // radiant gold blade
    drawRect(-1, -15, 3, 21, '#ffffff');      // blinding white core
    drawRect(-3, -12, 1, 14, palette.accent1); // dark energy lightning crackles
    drawRect(3, -12, 1, 14, palette.accent1);
    ctx.restore();
  }
}

function drawOrbitingMagic(
  ctx: CanvasRenderingContext2D,
  pSize: number,
  charId: CharacterId,
  frame: number,
  palette: CharacterPalette
) {
  charId = getBaseCharId(charId);
  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px * pSize, py * pSize, pSize, pSize);
  };

  const t = frame * 0.12;

  if (charId === 'xilthar') {
    // Floating magical circles and void orbs
    const r = 12;
    const ox1 = Math.floor(Math.cos(t) * r);
    const oy1 = Math.floor(Math.sin(t) * r * 0.4) - 2;

    const ox2 = Math.floor(Math.cos(t + Math.PI) * r);
    const oy2 = Math.floor(Math.sin(t + Math.PI) * r * 0.4) - 2;

    drawPixel(ox1, oy1, palette.accent2);
    drawPixel(ox1 + 1, oy1, '#ffffff');
    drawPixel(ox2, oy2, palette.accent1);
  } else if (charId === 'vorgan') {
    // Small black holes orbiting him
    const ox = Math.floor(Math.cos(t + 1) * 11);
    const oy = Math.floor(Math.sin(t + 1) * 11 * 0.4) + 4;
    drawPixel(ox, oy, '#000000');
    drawPixel(ox + 1, oy, palette.accent1);
    drawPixel(ox - 1, oy, palette.accent2);
  } else if (charId === 'malgor') {
    // Floating skull spirits or insects
    const ox = Math.floor(Math.sin(t * 1.5) * 9);
    const oy = Math.floor(Math.cos(t * 1.5) * 8) - 10;
    drawPixel(ox, oy, palette.body); // white insect/skull dot
    drawPixel(ox + (ox > 0 ? -1 : 1), oy, palette.accent2); // green spore trail
  }
}

// Draw static backgrounds or floor textures based on character origins
export function drawArenaFloor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  charId: CharacterId,
  gameTime: number
) {
  charId = getBaseCharId(charId);
  ctx.save();
  // Clear with base arena background
  let baseColor = '#131316';
  let gridColor = '#1c1c24';

  switch (charId) {
    case 'vorgan':
      baseColor = '#0f0b18'; // Void chamber
      gridColor = '#181227';
      break;
    case 'kargul':
      baseColor = '#160907'; // Volcanic forge
      gridColor = '#270f0b';
      break;
    case 'zyrael':
      baseColor = '#0b141d'; // Frozen castle floor
      gridColor = '#132130';
      break;
    case 'malgor':
      baseColor = '#091007'; // Toxic sewer
      gridColor = '#121f0f';
      break;
    case 'xilthar':
      baseColor = '#120b1d'; // Arcane observatory
      gridColor = '#211333';
      break;
    case 'azrakel':
      baseColor = '#131114'; // Ruined celestial temple
      gridColor = '#221e25';
      break;
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Draw grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const gridSize = 48;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw environmental ambient details
  ctx.globalAlpha = 0.4;
  if (charId === 'kargul') {
    // Volcanic cracks emitting heat
    ctx.fillStyle = '#ff3c00';
    // Draw some static random magma cells
    for (let i = 0; i < 6; i++) {
      const rx = (Math.sin(i * 1234) * 0.5 + 0.5) * width;
      const ry = (Math.cos(i * 5678) * 0.5 + 0.5) * height;
      const size = 16 + Math.sin(gameTime * 0.05 + i) * 6;
      ctx.beginPath();
      ctx.arc(rx, ry, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (charId === 'zyrael') {
    // Drifting light ice paths
    ctx.fillStyle = '#6ab0de';
    for (let i = 0; i < 5; i++) {
      const rx = (Math.sin(i * 777) * 0.5 + 0.5) * width;
      const ry = (Math.cos(i * 999) * 0.5 + 0.5) * height;
      ctx.fillRect(rx, ry, 64, 8);
      ctx.fillRect(rx + 24, ry - 8, 16, 24);
    }
  } else if (charId === 'malgor') {
    // Toxic sludge pools
    ctx.fillStyle = '#2d6a12';
    for (let i = 0; i < 4; i++) {
      const rx = (Math.sin(i * 444) * 0.5 + 0.5) * width;
      const ry = (Math.cos(i * 888) * 0.5 + 0.5) * height;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 48, 24, Math.PI/6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Draw enemies
export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  enemyType: string,
  state: string,
  frame: number,
  color: string,
  accentColor: string,
  frozen: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const pSize = 1.5; // Slightly smaller pixel size for regular enemies

  const drawRect = (px: number, py: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(px * pSize, py * pSize, w * pSize, h * pSize);
  };

  const bobY = state === 'walk' ? (frame % 2 === 0 ? 1 : 0) : Math.sin(frame * 0.2) > 0 ? 1 : 0;

  if (frozen) {
    ctx.fillStyle = 'rgba(106, 176, 222, 0.4)';
    ctx.fillRect(-14 * pSize, -14 * pSize, 28 * pSize, 28 * pSize);
  }

  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-8 * pSize, 8 * pSize, 16 * pSize, 3 * pSize);

  // Red outline border
  ctx.fillStyle = '#0f0505';

  if (enemyType === 'crawler') {
    // Bug / Void Spider creature
    // Legs
    const swing = Math.sin(frame * 0.5) * 3;
    drawRect(-10, 4 + swing, 3, 4, color);
    drawRect(-5, 4 - swing, 3, 4, color);
    drawRect(2, 4 + swing, 3, 4, color);
    drawRect(7, 4 - swing, 3, 4, color);

    // Body carapace
    drawRect(-8, -6 + bobY, 16, 10, color);
    drawRect(-6, -4 + bobY, 12, 6, accentColor); // glowing core
    // Glowing eyes
    drawRect(-4, -2 + bobY, 2, 2, '#ff3b30');
    drawRect(2, -2 + bobY, 2, 2, '#ff3b30');
  } else if (enemyType === 'ranged') {
    // Floating magic eye / bat
    // Small wings
    const wingY = Math.sin(frame * 0.4) * 4;
    drawRect(-12, -8 + wingY, 6, 4, color);
    drawRect(6, -8 + wingY, 6, 4, color);

    // Sphere eye body
    drawRect(-6, -6 + bobY, 12, 12, color);
    drawRect(-4, -4 + bobY, 8, 8, '#ffffff'); // Sclera
    drawRect(-1, -1 + bobY, 3, 3, accentColor); // iris
  } else if (enemyType === 'brute') {
    // Massive volcanic golem/ogre
    // Big bulky shoulders
    drawRect(-12, -14 + bobY, 24, 12, color);
    drawRect(-9, -11 + bobY, 18, 8, accentColor); // burning molten chest
    // Head nested down
    drawRect(-4, -18 + bobY, 8, 6, color);
    drawRect(-2, -15 + bobY, 4, 2, '#ff9f0a'); // burning eyes
    // Big heavy arms
    drawRect(-14, -6 + bobY, 4, 12, color);
    drawRect(10, -6 + bobY, 4, 12, color);
    // Stubby legs
    drawRect(-6, -2, 4, 10, color);
    drawRect(2, -2, 4, 10, color);
  } else {
    // Swarm / slime vermin
    drawRect(-5, -2 + bobY, 10, 8, color);
    drawRect(-3, 0 + bobY, 6, 5, accentColor);
    drawRect(-2, 1 + bobY, 1, 1, '#ffffff');
    drawRect(1, 1 + bobY, 1, 1, '#ffffff');
  }

  ctx.restore();
}
