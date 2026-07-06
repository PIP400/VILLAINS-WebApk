import { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'vorgan',
    name: 'Vorgan, The Void Reaper',
    title: 'Ruler of the Endless Void',
    quote: 'He harvests souls and drags worlds into eternal darkness.',
    description: 'An ancient skeletal reaper wearing broken black armor covered with glowing violet runes. A torn shadow cloak flows behind him. His face is hidden beneath a cracked hood with glowing purple eyes.',
    baseHp: 650,
    baseSpeed: 3.2,
    baseAtk: 78,
    magicType: 'Void Magic / Darkness',
    weaponName: 'Void Crystal Scythe',
    palette: {
      primary: '#110222',
      accent1: '#7b2cbf',
      accent2: '#f72585',
      body: '#d9d9d9',
      weapon: '#4a0e4e'
    },
    abilities: [
      {
        name: 'Void Slash',
        description: 'Slashes in a wide arc around the Reaper, dealing heavy Void damage to all nearby enemies.',
        cooldown: 1000,
        sfxName: 'Void Slash',
        sfxText: 'SHHRAAK!',
        type: 'aoe',
        color: '#9b5de5'
      },
      {
        name: 'Soul Drain',
        description: 'Creates a magical gravity well that drains HP from all enemies in range, transferring it back to Vorgan.',
        cooldown: 4000,
        sfxName: 'Soul Drain',
        sfxText: 'VYOOOOORP...',
        type: 'aoe',
        color: '#f15bb5'
      },
      {
        name: 'Dark Portal',
        description: 'Summons static Void Orbs in the arena that automatically lock on and fire dark magic missiles at incoming enemies.',
        cooldown: 6000,
        sfxName: 'Dark Portal',
        sfxText: 'VWOOOOOM...',
        type: 'summon',
        color: '#3f37c9'
      },
      {
        name: 'Annihilation',
        description: 'Unleashes a massive, full-screen cosmic explosion of pure void energy, obliterating weaker foes instantly.',
        cooldown: 10000,
        sfxName: 'Annihilation',
        sfxText: 'KRA-THOOOOM!',
        type: 'aoe',
        color: '#b5179e'
      }
    ]
  },
  {
    id: 'kargul',
    name: 'Kargul, The Bloodforge',
    title: 'Warlord of Flames and Steel',
    quote: 'He forges chaos in rivers of blood and magma.',
    description: 'A massive demonic warrior covered in volcanic black steel armor with glowing magma cracks. Huge curved horns emerge from his helmet, emitting sparks, embers and burning ash.',
    baseHp: 900,
    baseSpeed: 2.6,
    baseAtk: 95,
    magicType: 'Volcanic Fire / Bloodforge',
    weaponName: 'Molten Battle Axe',
    palette: {
      primary: '#1a0d0d',
      accent1: '#e25822',
      accent2: '#f39c12',
      body: '#ff3300',
      weapon: '#581845'
    },
    abilities: [
      {
        name: 'Molten Strike',
        description: 'Smashes the Molten Battle Axe into the ground, launching active magma fireballs in multiple directions.',
        cooldown: 1500,
        sfxName: 'Molten Strike',
        sfxText: 'GRAAAAGH!',
        type: 'projectile',
        color: '#e65f05'
      },
      {
        name: 'Blood Rage',
        description: 'Enters an unbridled fury, instantly boosting movement speed, double attack output, and granting lifesteal for 4 seconds.',
        cooldown: 5000,
        sfxName: 'Blood Rage',
        sfxText: 'RAAAAGE!',
        type: 'buff',
        color: '#d90429'
      },
      {
        name: 'War Command',
        description: 'Roars with thunderous demonic energy, creating a shockwave that stuns all nearby enemies and reduces their defenses.',
        cooldown: 6000,
        sfxName: 'War Command',
        sfxText: 'KWEEL!',
        type: 'aoe',
        color: '#f39c12'
      },
      {
        name: 'Inferno Crush',
        description: 'Leaps high into the air and slams down, spawning massive magma fissures across the battlefield.',
        cooldown: 10000,
        sfxName: 'Inferno Crush',
        sfxText: 'BOOOOM!',
        type: 'aoe',
        color: '#ff0000'
      }
    ]
  },
  {
    id: 'zyrael',
    name: 'Zyrael, The Frost Tyrant',
    title: 'Emperor of Eternal Winter',
    quote: 'He freezes hope and buries the world in ice.',
    description: 'A frozen emperor covered in jagged, crystalline ice armor. Sharp frost spikes grow from his shoulders and crown. Carries a glowing ice greatsword emitting freezing mist.',
    baseHp: 750,
    baseSpeed: 2.8,
    baseAtk: 82,
    magicType: 'Cryomancy / Eternal Ice',
    weaponName: 'Glowing Ice Greatsword',
    palette: {
      primary: '#0c1a30',
      accent1: '#4361ee',
      accent2: '#4cc9f0',
      body: '#e0f7fa',
      weapon: '#48cae4'
    },
    abilities: [
      {
        name: 'Frost Spear',
        description: 'Launches a piercing, crystalline ice spear that travels through multiple enemies, freezing them in place.',
        cooldown: 1200,
        sfxName: 'Frost Spear',
        sfxText: 'SHWIING!',
        type: 'projectile',
        color: '#6ab0de'
      },
      {
        name: 'Glacial Prison',
        description: 'Target-encases nearby enemies inside solid frost prisms, rendering them fully immobilized and taking ticking damage.',
        cooldown: 5000,
        sfxName: 'Glacial Prison',
        sfxText: 'KRRRACK!',
        type: 'aoe',
        color: '#4ba3e3'
      },
      {
        name: 'Blizzard',
        description: 'Summons a freezing blizzard storm on the field that continuously damages, slows, and weakens all enemies.',
        cooldown: 8000,
        sfxName: 'Blizzard',
        sfxText: 'WOOOOOOSH!',
        type: 'aoe',
        color: '#a5ffd6'
      },
      {
        name: 'Absolute Zero',
        description: 'Unleashes a sub-zero shockwave. Frozen targets explode, dealing critical cascade damage to nearby enemies.',
        cooldown: 12000,
        sfxName: 'Absolute Zero',
        sfxText: 'FREEEEZE!',
        type: 'aoe',
        color: '#ffffff'
      }
    ]
  },
  {
    id: 'malgor',
    name: 'Malgor, The Plague Lord',
    title: 'Bringer of Decay and Pestilence',
    quote: 'His touch is disease. His breath is death.',
    description: 'An undead shaman wearing rotting green robes decorated with skulls and bones. His skeletal face glows with poisonous green light, surrounded by insects and poison spores.',
    baseHp: 600,
    baseSpeed: 3.0,
    baseAtk: 72,
    magicType: 'Plague / Necrotic Spores',
    weaponName: 'Plague Skull Staff',
    palette: {
      primary: '#0c1a05',
      accent1: '#2d6a4f',
      accent2: '#70e000',
      body: '#eaebed',
      weapon: '#1b4332'
    },
    abilities: [
      {
        name: 'Toxic Cloud',
        description: 'Releases a lingering gas cloud that inflicts a stack of deadly Poison on all enemies who step inside it.',
        cooldown: 2000,
        sfxName: 'Toxic Cloud',
        sfxText: 'PSSSHH...',
        type: 'aoe',
        color: '#4ea8de'
      },
      {
        name: 'Plague Burst',
        description: 'Explodes a toxic spore bomb. Enemies currently poisoned explode, spreading poison to all adjacent foes.',
        cooldown: 4000,
        sfxName: 'Plague Burst',
        sfxText: 'BLAAARRGH!',
        type: 'aoe',
        color: '#2ec4b6'
      },
      {
        name: 'Summon Pests',
        description: 'Summons an active swarm of plague beetles that rush forward and devour enemies, returning health to Malgor.',
        cooldown: 7000,
        sfxName: 'Summon Pests',
        sfxText: 'SKREEEEE!',
        type: 'summon',
        color: '#70e000'
      },
      {
        name: 'Death Contagion',
        description: 'Casts a dark hex that instantly amplifies all active poison ticks by 3x and silences targets.',
        cooldown: 11000,
        sfxName: 'Death Contagion',
        sfxText: 'COUGH... DIE!',
        type: 'aoe',
        color: '#38b000'
      }
    ]
  },
  {
    id: 'xilthar',
    name: 'Xilthar, The Void Archmage',
    title: 'Master of Forbidden Magic',
    quote: 'Reality bends to his will. Mortals break in his presence.',
    description: 'A mysterious sorcerer wearing elegant dark robes covered in glowing purple symbols. Floating magical circles orbit his body, and violet energy radiates from his hands.',
    baseHp: 550,
    baseSpeed: 3.4,
    baseAtk: 88,
    magicType: 'Chrono-Void / Arcane Magic',
    weaponName: 'Arcane Floating Orbs',
    palette: {
      primary: '#1a052e',
      accent1: '#7209b7',
      accent2: '#f72585',
      body: '#ffffff',
      weapon: '#7209b7'
    },
    abilities: [
      {
        name: 'Arcane Missiles',
        description: 'Launches a barrage of homing void missiles that automatically lock onto, pursue, and shred enemy targets.',
        cooldown: 1000,
        sfxName: 'Arcane Missiles',
        sfxText: 'ZWIP! ZWIP!',
        type: 'projectile',
        color: '#8338ec'
      },
      {
        name: 'Reality Warp',
        description: 'Warp-teleports forward a short distance, releasing a gravity shockwave that stuns and displaces enemies.',
        cooldown: 5000,
        sfxName: 'Reality Warp',
        sfxText: 'WRAAAARP!',
        type: 'aoe',
        color: '#b5179e'
      },
      {
        name: 'Summon Abyssal',
        description: 'Opens a dimensional tear to summon a massive Abyssal Watcher that floats and blasts lasers at foes.',
        cooldown: 8000,
        sfxName: 'Summon Abyssal',
        sfxText: 'RROOAAAR!',
        type: 'summon',
        color: '#3a0ca3'
      },
      {
        name: 'Void Eruption',
        description: 'Creates a cataclysmic singularity that pulls all enemies to the center, then erupts for devastating cosmic damage.',
        cooldown: 11000,
        sfxName: 'Void Eruption',
        sfxText: 'AAAAAAAH!',
        type: 'aoe',
        color: '#f72585'
      }
    ]
  },
  {
    id: 'azrakel',
    name: 'Azrakel, The Fallen Seraph',
    title: 'Harbinger of Judgment',
    quote: 'He was once light. Now he brings only ruin.',
    description: 'A corrupted celestial warrior wearing black and gold holy armor with glowing divine cracks. Large damaged black feathered wings spread behind him beneath a broken golden halo.',
    baseHp: 800,
    baseSpeed: 3.1,
    baseAtk: 90,
    magicType: 'Fallen Divine / Holy Lightning',
    weaponName: 'Radiant Holy Sword',
    palette: {
      primary: '#151318',
      accent1: '#ffc300',
      accent2: '#ffd60a',
      body: '#8d99ae',
      weapon: '#ffea00'
    },
    abilities: [
      {
        name: 'Divine Smite',
        description: 'Strikes targeted spots with giant columns of blinding holy lightning from the heavens, dealing massive AOE damage.',
        cooldown: 1500,
        sfxName: 'Divine Smite',
        sfxText: 'BEGONE!',
        type: 'aoe',
        color: '#ffb703'
      },
      {
        name: 'Radiant Blade',
        description: 'Slashes his radiant sword in a straight line, throwing a gold energy wave that pierces enemy defenses.',
        cooldown: 3000,
        sfxName: 'Radiant Blade',
        sfxText: 'SHRAAAAAH!',
        type: 'projectile',
        color: '#fb8500'
      },
      {
        name: 'Fallen Aura',
        description: 'Activates a dark sacred shield. While active, Azrakel takes 40% reduced damage and reflects dark sparks back at attackers.',
        cooldown: 6000,
        sfxName: 'Fallen Aura',
        sfxText: 'ALL WILL FALL.',
        type: 'buff',
        color: '#e0aaff'
      },
      {
        name: 'Apocalypse',
        description: 'Calls down a storm of golden meteorites that strike random locations in the arena, creating fiery chain explosions.',
        cooldown: 12000,
        sfxName: 'Apocalypse',
        sfxText: 'JUDGMENT!',
        type: 'aoe',
        color: '#ff0054'
      }
    ]
  },
  // 18 NEW VILLAINS
  {
    id: 'velthor',
    name: 'Velthor, The Void Harbinger',
    title: 'Legendary Void Warlock',
    quote: 'Ancient skeletal sorcerer wearing black obsidian robes with violet runes.',
    description: 'His face is hidden beneath a hood, revealing only blazing purple eyes. He carries an ornate staff crowned with a floating black hole surrounded by rotating rings and sigils.',
    baseHp: 600,
    baseSpeed: 3.1,
    baseAtk: 84,
    magicType: 'Cosmic Void / Violet Light',
    weaponName: 'Black Hole Staff',
    palette: {
      primary: '#080010',
      accent1: '#4d1266',
      accent2: '#b300b3',
      body: '#cccccc',
      weapon: '#7a0099'
    },
    abilities: [
      {
        name: 'Void Portal',
        description: 'Summons gravity wells to pull and crush enemies.',
        cooldown: 1500,
        sfxName: 'Void Portal',
        sfxText: 'VWOOOM!',
        type: 'summon',
        color: '#b300b3'
      },
      {
        name: 'Singularity Blast',
        description: 'Erupts space around Velthor in violet flames.',
        cooldown: 4000,
        sfxName: 'Singularity Blast',
        sfxText: 'KABOOM!',
        type: 'aoe',
        color: '#ee82ee'
      },
      {
        name: 'Gravity Warp',
        description: 'Warp and stun nearby targets.',
        cooldown: 6000,
        sfxName: 'Gravity Warp',
        sfxText: 'WARP!',
        type: 'aoe',
        color: '#4d1266'
      },
      {
        name: 'Dark Star',
        description: 'Explodes all space in a heavy magenta nova.',
        cooldown: 10000,
        sfxName: 'Dark Star',
        sfxText: 'DARKNESS!',
        type: 'aoe',
        color: '#ff00ff'
      }
    ]
  },
  {
    id: 'morgrav',
    name: 'Morgrav, The Soul Devourer',
    title: 'Terrifying Undead Necromancer',
    quote: 'He wields a staff topped with a cursed floating skull engulfed in ghostly flames.',
    description: 'Skeletal lich wearing plague robes decorated with skulls and green crystals. Ghostly green flames and soul wisps orbit him, rising from the cursed soil.',
    baseHp: 680,
    baseSpeed: 2.9,
    baseAtk: 76,
    magicType: 'Necromancy / Emerald Fire',
    weaponName: 'Cursed Skull Staff',
    palette: {
      primary: '#051009',
      accent1: '#0e6636',
      accent2: '#00ff80',
      body: '#e6e6e6',
      weapon: '#1f402c'
    },
    abilities: [
      {
        name: 'Spectral Wisps',
        description: 'Release home-seeking green souls to digest target HP.',
        cooldown: 1200,
        sfxName: 'Spectral Wisps',
        sfxText: 'SHHHH...',
        type: 'projectile',
        color: '#00ff80'
      },
      {
        name: 'Ghastly Fire',
        description: 'Slam staff to ignite targets in a necrotic emerald ring.',
        cooldown: 3500,
        sfxName: 'Ghastly Fire',
        sfxText: 'FWOOOSH!',
        type: 'aoe',
        color: '#0e6636'
      },
      {
        name: 'Soul Siphon',
        description: 'Direct drain of surrounding targets.',
        cooldown: 6500,
        sfxName: 'Soul Siphon',
        sfxText: 'GULP!',
        type: 'aoe',
        color: '#00ff80'
      },
      {
        name: 'Crypt Burst',
        description: 'Surge skeletons that act as reactive wall barriers.',
        cooldown: 9000,
        sfxName: 'Crypt Burst',
        sfxText: 'RATTLE!',
        type: 'summon',
        color: '#cccccc'
      }
    ]
  },
  {
    id: 'ravenor',
    name: 'Ravenor, The Blood Emperor',
    title: 'Brutal Demon Warlord',
    quote: 'Behind him rises a giant blood moon, reflecting endless battlefield gore.',
    description: 'Encased in massive red-black spiked armor with glowing blood moon designs. He swings a colossal crimson greatsword while fire and ash surround his feet.',
    baseHp: 950,
    baseSpeed: 2.7,
    baseAtk: 99,
    magicType: 'Blood Magic / Crimson Fire',
    weaponName: 'Magma Greatsword',
    palette: {
      primary: '#150202',
      accent1: '#8c0d0d',
      accent2: '#ff0000',
      body: '#333333',
      weapon: '#4c0303'
    },
    abilities: [
      {
        name: 'Blood Cleave',
        description: 'Launches a piercing arc blade of pure magma blood.',
        cooldown: 1500,
        sfxName: 'Blood Cleave',
        sfxText: 'SLAASH!',
        type: 'projectile',
        color: '#ff0000'
      },
      {
        name: 'Sanguine Vortex',
        description: 'Creates a massive vortex that shreds and pulls enemies.',
        cooldown: 4500,
        sfxName: 'Sanguine Vortex',
        sfxText: 'VORTEX!',
        type: 'aoe',
        color: '#8c0d0d'
      },
      {
        name: 'Emperor Strike',
        description: 'Fissure burst stunning nearby targets.',
        cooldown: 6000,
        sfxName: 'Emperor Strike',
        sfxText: 'CRUSH!',
        type: 'aoe',
        color: '#ff3300'
      },
      {
        name: 'Blood Moon',
        description: 'Summons a rain of destructive crimson meteorites.',
        cooldown: 11000,
        sfxName: 'Blood Moon',
        sfxText: 'APOCALYPSE!',
        type: 'aoe',
        color: '#ff0000'
      }
    ]
  },
  {
    id: 'thundrex',
    name: 'Thundrex, The Storm Overlord',
    title: 'Lightning Steel King',
    quote: 'A frozen cobalt armored king crackling with infinite blue electricity.',
    description: 'Armed with a massive lightning spear. Storm clouds and lightning arcs trail his heavy footsteps. Rain and blue energy wrap around him.',
    baseHp: 850,
    baseSpeed: 3.0,
    baseAtk: 88,
    magicType: 'Thunder / Cobalt Lightning',
    weaponName: 'Lightning Spear',
    palette: {
      primary: '#0b0f1a',
      accent1: '#1e3a8a',
      accent2: '#3b82f6',
      body: '#e2e8f0',
      weapon: '#60a5fa'
    },
    abilities: [
      {
        name: 'Lightning Spear',
        description: 'Throws a fast-piercing cobalt spear.',
        cooldown: 1100,
        sfxName: 'Lightning Spear',
        sfxText: 'ZAP!',
        type: 'projectile',
        color: '#60a5fa'
      },
      {
        name: 'Storm Nova',
        description: 'Erupts radial lightning arcs in a massive zone.',
        cooldown: 4000,
        sfxName: 'Storm Nova',
        sfxText: 'SHOCK!',
        type: 'aoe',
        color: '#3b82f6'
      },
      {
        name: 'Thunderous Roar',
        description: 'Deafening shout that stuns nearby targets.',
        cooldown: 6000,
        sfxName: 'Thunderous Roar',
        sfxText: 'BOOM!',
        type: 'aoe',
        color: '#1e3a8a'
      },
      {
        name: 'Storm Cataclysm',
        description: 'Triggers persistent celestial lightning strikes.',
        cooldown: 11000,
        sfxName: 'Storm Cataclysm',
        sfxText: 'TEMPEST!',
        type: 'aoe',
        color: '#ffffff'
      }
    ]
  },
  {
    id: 'xerathos',
    name: 'Xerathos, The Void Dragon',
    title: 'Ancient Cosmic Void Dragon',
    quote: 'A massive dragon with black obsidian scales infused with violet crystals.',
    description: 'His chest contains an exposed black hole heart. Massive wings spread cosmic tears and violet mist. Asteroids and gravitational fields orbit his skull.',
    baseHp: 1000,
    baseSpeed: 2.8,
    baseAtk: 92,
    magicType: 'Gravity / Celestial Dragon',
    weaponName: 'Cosmic Claws',
    palette: {
      primary: '#0a0114',
      accent1: '#5c13a8',
      accent2: '#ff00cc',
      body: '#180024',
      weapon: '#ffcc00'
    },
    abilities: [
      {
        name: 'Dragon Breath',
        description: 'Spews gravity flames in forward direction.',
        cooldown: 1300,
        sfxName: 'Dragon Breath',
        sfxText: 'FWOOSH!',
        type: 'projectile',
        color: '#ff00cc'
      },
      {
        name: 'Void Pull',
        description: 'Gravitational field pulls enemies close.',
        cooldown: 4500,
        sfxName: 'Void Pull',
        sfxText: 'GRAVITY!',
        type: 'aoe',
        color: '#5c13a8'
      },
      {
        name: 'Tail Sweep',
        description: 'Sweeps in circle to stun and crush.',
        cooldown: 6000,
        sfxName: 'Tail Sweep',
        sfxText: 'SWIPE!',
        type: 'aoe',
        color: '#ffcc00'
      },
      {
        name: 'Nova Maw',
        description: 'Detonates the black hole heart, disintegrating waves.',
        cooldown: 12000,
        sfxName: 'Nova Maw',
        sfxText: 'EXPLODE!',
        type: 'aoe',
        color: '#ffffff'
      }
    ]
  },
  {
    id: 'zygor',
    name: 'Zygor, The Toxic Alchemist',
    title: 'Mad Plague Scientist',
    quote: 'Bubbling toxic chemical flasks and a glowing green gas mask.',
    description: 'Alchemist wearing a dark hooded plague doctor robe with heavy leather armor. Green poisonous smoke constantly leaks from his canisters and backpack.',
    baseHp: 720,
    baseSpeed: 3.2,
    baseAtk: 80,
    magicType: 'Acid / Bio-Chemical',
    weaponName: 'Poison Staff',
    palette: {
      primary: '#0d140e',
      accent1: '#274e13',
      accent2: '#6aa84f',
      body: '#b7b7b7',
      weapon: '#38761d'
    },
    abilities: [
      {
        name: 'Acid Puddle',
        description: 'Throws a flask that breaks into a poison sludge puddle.',
        cooldown: 1800,
        sfxName: 'Acid Puddle',
        sfxText: 'SPLASH!',
        type: 'aoe',
        color: '#6aa84f'
      },
      {
        name: 'Toxic Flask',
        description: 'Launches chemical projectile bouncing through targets.',
        cooldown: 4000,
        sfxName: 'Toxic Flask',
        sfxText: 'BOUNCING!',
        type: 'projectile',
        color: '#38761d'
      },
      {
        name: 'Adrenaline Injection',
        description: 'Gain double speed and rapid healing for 3 seconds.',
        cooldown: 6000,
        sfxName: 'Adrenaline Injection',
        sfxText: 'INJECT!',
        type: 'buff',
        color: '#6aa84f'
      },
      {
        name: 'Meltdown Catalyst',
        description: 'Explodes all surrounding acid zones into toxic fumes.',
        cooldown: 10000,
        sfxName: 'Meltdown Catalyst',
        sfxText: 'MELTDOWN!',
        type: 'aoe',
        color: '#274e13'
      }
    ]
  },
  {
    id: 'nyxaris',
    name: 'Nyxaris, The Void Empress',
    title: 'Regal Empress of Stars',
    quote: 'She wears a jagged crown with crystal horns and flowing robes.',
    description: 'A divine empress floating in elegant obsidian armor decorated with cosmic runes. She wields a void scepter crowned with a miniature singularity.',
    baseHp: 650,
    baseSpeed: 3.3,
    baseAtk: 86,
    magicType: 'Cosmic / Singularity',
    weaponName: 'Void Scepter',
    palette: {
      primary: '#0c0214',
      accent1: '#4b0082',
      accent2: '#ee82ee',
      body: '#ffffff',
      weapon: '#8b008b'
    },
    abilities: [
      {
        name: 'Empress Scepter',
        description: 'Throws orbital dark planets in horizontal streams.',
        cooldown: 1200,
        sfxName: 'Empress Scepter',
        sfxText: 'PLANET!',
        type: 'projectile',
        color: '#ee82ee'
      },
      {
        name: 'Shadow Cape',
        description: 'Enters shadow stealth, gaining major speed.',
        cooldown: 5000,
        sfxName: 'Shadow Cape',
        sfxText: 'STEALTH!',
        type: 'buff',
        color: '#4b0082'
      },
      {
        name: 'Celestial Crack',
        description: 'Slashes space, leaving dimensional freeze fields.',
        cooldown: 7000,
        sfxName: 'Celestial Crack',
        sfxText: 'RIP!',
        type: 'aoe',
        color: '#8b008b'
      },
      {
        name: 'Crown Singularity',
        description: 'Triggers complete planetary system collapse.',
        cooldown: 11000,
        sfxName: 'Crown Singularity',
        sfxText: 'COLLAPSE!',
        type: 'aoe',
        color: '#ee82ee'
      }
    ]
  },
  {
    id: 'mortivan',
    name: 'Mortivan, The Necro King',
    title: 'Undead Antler Monarch',
    quote: 'Green necrotic energy leaks from every gap in his bone plates.',
    description: 'Skeletal king clad in ancient plate armor with antlers. Surrounded by dozens of spirits and ghost antlers. Crowned in cursed jade.',
    baseHp: 800,
    baseSpeed: 2.9,
    baseAtk: 84,
    magicType: 'Necro-Jade / Antler Spikes',
    weaponName: 'Jade Staff',
    palette: {
      primary: '#111a14',
      accent1: '#00a86b',
      accent2: '#39ff14',
      body: '#f5f5dc',
      weapon: '#023020'
    },
    abilities: [
      {
        name: 'Necro Blast',
        description: 'Jade skull projectile that explodes on impact.',
        cooldown: 1400,
        sfxName: 'Necro Blast',
        sfxText: 'Jade!',
        type: 'projectile',
        color: '#39ff14'
      },
      {
        name: 'Jade Antlers',
        description: 'Erupt antler bone spikes to impale and stun.',
        cooldown: 4000,
        sfxName: 'Jade Antlers',
        sfxText: 'SPIKE!',
        type: 'aoe',
        color: '#00a86b'
      },
      {
        name: 'Royal Spirits',
        description: 'Summons undead royal guardians to fight beside him.',
        cooldown: 7000,
        sfxName: 'Royal Spirits',
        sfxText: 'GUARD!',
        type: 'summon',
        color: '#ffffff'
      },
      {
        name: 'Soul Harvest',
        description: 'Extract health points from all nearby enemies.',
        cooldown: 10000,
        sfxName: 'Soul Harvest',
        sfxText: 'HARVEST!',
        type: 'aoe',
        color: '#39ff14'
      }
    ]
  },
  {
    id: 'infernus',
    name: 'Infernus, The Flame Tyrant',
    title: 'Molten Lava Demon Lord',
    quote: 'A massive horned demon encased in molten obsidian plate armor.',
    description: 'Features blazing magma wings. He swings a massive magma greatsword that triggers cascading volcanic fissures under his targets.',
    baseHp: 900,
    baseSpeed: 2.8,
    baseAtk: 96,
    magicType: 'Molten Core / Lava Wings',
    weaponName: 'Magma Blade',
    palette: {
      primary: '#1a0505',
      accent1: '#ff4500',
      accent2: '#ffd700',
      body: '#ff0000',
      weapon: '#8b0000'
    },
    abilities: [
      {
        name: 'Molten Cleave',
        description: 'A heavy fiery blade strike throwing fire wave.',
        cooldown: 1200,
        sfxName: 'Molten Cleave',
        sfxText: 'FIRE!',
        type: 'projectile',
        color: '#ff4500'
      },
      {
        name: 'Molten Geyser',
        description: 'Summons eruptive lava pillars across the map.',
        cooldown: 4500,
        sfxName: 'Molten Geyser',
        sfxText: 'GEYSER!',
        type: 'aoe',
        color: '#ffd700'
      },
      {
        name: 'Ash Wings',
        description: 'Buff speed and burn all nearby enemies.',
        cooldown: 6000,
        sfxName: 'Ash Wings',
        sfxText: 'BURN!',
        type: 'buff',
        color: '#ff0000'
      },
      {
        name: 'Tyrant Apocalypse',
        description: 'Unleashes endless rain of volcanic ashes.',
        cooldown: 11000,
        sfxName: 'Tyrant Apocalypse',
        sfxText: 'APOCALYPSE!',
        type: 'aoe',
        color: '#ff4500'
      }
    ]
  },
  {
    id: 'thalassor',
    name: 'Thalassor, The Drowned God',
    title: 'Forgotten Ancient Sea Deity',
    quote: 'Long tentacles emerge from his cloak as water crashes at his feet.',
    description: 'Sea king wearing coral armor. Wields a giant crystal sea trident. Bioluminescent deep ocean lights glow under his coral shoulder plates.',
    baseHp: 880,
    baseSpeed: 2.9,
    baseAtk: 84,
    magicType: 'Ocean Current / Coral Spike',
    weaponName: 'Sea Trident',
    palette: {
      primary: '#021422',
      accent1: '#008080',
      accent2: '#40e0d0',
      body: '#4682b4',
      weapon: '#191970'
    },
    abilities: [
      {
        name: 'Abyssal Trident',
        description: 'Throws a freezing, piercing ocean trident.',
        cooldown: 1300,
        sfxName: 'Abyssal Trident',
        sfxText: 'TRIDENT!',
        type: 'projectile',
        color: '#40e0d0'
      },
      {
        name: 'Tsunami Wave',
        description: 'Summons rapid waves that knock back enemies.',
        cooldown: 4000,
        sfxName: 'Tsunami Wave',
        sfxText: 'TSUNAMI!',
        type: 'aoe',
        color: '#008080'
      },
      {
        name: 'Coral Cage',
        description: 'Freezes and cages enemies inside coral prisms.',
        cooldown: 6000,
        sfxName: 'Coral Cage',
        sfxText: 'FREEZE!',
        type: 'aoe',
        color: '#4682b4'
      },
      {
        name: 'Drowned Curse',
        description: 'Unleashes full ocean depths to drown waves.',
        cooldown: 11000,
        sfxName: 'Drowned Curse',
        sfxText: 'OCEAN!',
        type: 'aoe',
        color: '#40e0d0'
      }
    ]
  },
  {
    id: 'zarakhos',
    name: 'Zarakhos, The Storm Invoker',
    title: 'Golden Celestial Storm Invoker',
    quote: 'Gold and black storm armor crackling with high-voltage electricity.',
    description: 'A divine lightning king wielding a golden rod topped with thunder crystals. Cape whips violently in supernatural heavy winds.',
    baseHp: 780,
    baseSpeed: 3.2,
    baseAtk: 90,
    magicType: 'Thunder / Golden Lightning',
    weaponName: 'Storm Rod',
    palette: {
      primary: '#1a1a1a',
      accent1: '#ffd700',
      accent2: '#ffff00',
      body: '#708090',
      weapon: '#b8860b'
    },
    abilities: [
      {
        name: 'Celestial Lightning',
        description: 'Fires vertical bolts of golden shock.',
        cooldown: 1200,
        sfxName: 'Celestial Lightning',
        sfxText: 'SHOCK!',
        type: 'projectile',
        color: '#ffff00'
      },
      {
        name: 'Invoker Spark',
        description: 'Surges plasma electric spheres around him.',
        cooldown: 3800,
        sfxName: 'Invoker Spark',
        sfxText: 'SPARK!',
        type: 'aoe',
        color: '#ffd700'
      },
      {
        name: 'Lightning Dash',
        description: 'Teleport forward leaving spark damage trail.',
        cooldown: 5500,
        sfxName: 'Lightning Dash',
        sfxText: 'ZIP!',
        type: 'aoe',
        color: '#ffffff'
      },
      {
        name: 'Heavenly Storm',
        description: 'Massive golden meteor cascade on battleground.',
        cooldown: 12000,
        sfxName: 'Heavenly Storm',
        sfxText: 'HEAVEN!',
        type: 'aoe',
        color: '#ffd700'
      }
    ]
  },
  {
    id: 'vexilia',
    name: 'Vexilia, The Toxic Matriarch',
    title: 'Horrifying Bug Queen',
    quote: 'Corrupted organic armor with chitin scales and spider legs.',
    description: 'An insectoid queen wearing dark chitin and carrying a gnarled staff. Toxic eggs and infected swarms float around her steps.',
    baseHp: 820,
    baseSpeed: 2.8,
    baseAtk: 80,
    magicType: 'Insect / Corrosive Fluid',
    weaponName: 'Bug Staff',
    palette: {
      primary: '#0d0d0d',
      accent1: '#800080',
      accent2: '#adff2f',
      body: '#4b0082',
      weapon: '#228b22'
    },
    abilities: [
      {
        name: 'Plague Stinger',
        description: 'Throws multiple piercing poison stingers.',
        cooldown: 1500,
        sfxName: 'Plague Stinger',
        sfxText: 'PEW!',
        type: 'projectile',
        color: '#adff2f'
      },
      {
        name: 'Spore Cloud Nest',
        description: 'Spawns poison spore cloud zones.',
        cooldown: 4500,
        sfxName: 'Spore Cloud Nest',
        sfxText: 'CLOUD!',
        type: 'aoe',
        color: '#800080'
      },
      {
        name: 'Chitin Armor',
        description: 'Absorbs 50% damage and heals rapidly.',
        cooldown: 6000,
        sfxName: 'Chitin Armor',
        sfxText: 'ARMOR!',
        type: 'buff',
        color: '#4b0082'
      },
      {
        name: 'Matriarch Swarm',
        description: 'Release complete swarm of toxic pests.',
        cooldown: 10500,
        sfxName: 'Matriarch Swarm',
        sfxText: 'SWARM!',
        type: 'summon',
        color: '#adff2f'
      }
    ]
  },
  {
    id: 'zeraeth',
    name: 'Zeraeth, The Void Beyond',
    title: 'Eldritch Final Boss',
    quote: 'He wears layered robes fused with celestial armor and black singularities.',
    description: 'Living embodiment of the Void. End-game boss featuring rotating rings, gravitational anomalies, and space-bending visual tears under his feet.',
    baseHp: 1100,
    baseSpeed: 3.1,
    baseAtk: 98,
    magicType: 'Singularity / Spatial Rift',
    weaponName: 'Cosmic Rod',
    palette: {
      primary: '#0c061a',
      accent1: '#6a0dad',
      accent2: '#ff007f',
      body: '#000033',
      weapon: '#4b0082'
    },
    abilities: [
      {
        name: 'Beyond Slash',
        description: 'Massive circular dimensional wave.',
        cooldown: 1400,
        sfxName: 'Beyond Slash',
        sfxText: 'RIFT!',
        type: 'aoe',
        color: '#ff007f'
      },
      {
        name: 'Cosmic Orbs',
        description: 'Summons orbiting purple stellar fragments.',
        cooldown: 4000,
        sfxName: 'Cosmic Orbs',
        sfxText: 'PLANET!',
        type: 'summon',
        color: '#6a0dad'
      },
      {
        name: 'Dimensional Tear',
        description: 'Tear space to warp and stun waves.',
        cooldown: 6000,
        sfxName: 'Dimensional Tear',
        sfxText: 'TEAR!',
        type: 'aoe',
        color: '#ffffff'
      },
      {
        name: 'Galaxy Eater',
        description: 'Shatters the fabric of space for extreme damage.',
        cooldown: 12000,
        sfxName: 'Galaxy Eater',
        sfxText: 'COLLAPSE!',
        type: 'aoe',
        color: '#ff007f'
      }
    ]
  },
  {
    id: 'malgorath',
    name: 'Malgorath, The World Devourer',
    title: 'Colossal Magma Raid Boss',
    quote: 'Molten armor with glowing planetary cores in his chest.',
    description: 'Massive wings shedding flames and ash. He carries a giant sword forged from destroyed worlds. Red volcanic fire trails his steps.',
    baseHp: 1200,
    baseSpeed: 2.7,
    baseAtk: 100,
    magicType: 'Volcanic Core / Ashes',
    weaponName: 'Cosmic Edge',
    palette: {
      primary: '#120202',
      accent1: '#b22222',
      accent2: '#ff7f50',
      body: '#8b0000',
      weapon: '#d2691e'
    },
    abilities: [
      {
        name: 'World Slash',
        description: 'Devastating molten swipe leaving lava.',
        cooldown: 1600,
        sfxName: 'World Slash',
        sfxText: 'MELT!',
        type: 'projectile',
        color: '#ff7f50'
      },
      {
        name: 'Core Eruption',
        description: 'Erupts the battlefield in molten debris.',
        cooldown: 4500,
        sfxName: 'Core Eruption',
        sfxText: 'EXPLODE!',
        type: 'aoe',
        color: '#b22222'
      },
      {
        name: 'Meteor Rain',
        description: 'Rain of falling planetary chunks.',
        cooldown: 7000,
        sfxName: 'Meteor Rain',
        sfxText: 'RAIN!',
        type: 'aoe',
        color: '#ff7f50'
      },
      {
        name: 'World Meltdown',
        description: 'Absolute core melt destroying all.',
        cooldown: 11000,
        sfxName: 'World Meltdown',
        sfxText: 'MELTDOWN!',
        type: 'aoe',
        color: '#ffffff'
      }
    ]
  },
  {
    id: 'vylexor',
    name: 'Vylexor, The Time Fracturer',
    title: 'Master Chronomancer',
    quote: 'Floating clock faces and clockwork mechanisms orbit his body.',
    description: 'Hooded sorcerer carrying a time crystal staff. Blue rewinding particles and temporal mirrors surround his graceful posture.',
    baseHp: 700,
    baseSpeed: 3.3,
    baseAtk: 84,
    magicType: 'Chronomancy / Temporal Mirror',
    weaponName: 'Time Staff',
    palette: {
      primary: '#001f3f',
      accent1: '#0074d9',
      accent2: '#7fdbff',
      body: '#aaaaaa',
      weapon: '#001f3f'
    },
    abilities: [
      {
        name: 'Time Bolt',
        description: 'Fires chronological shards that slow targets.',
        cooldown: 1100,
        sfxName: 'Time Bolt',
        sfxText: 'TICK!',
        type: 'projectile',
        color: '#7fdbff'
      },
      {
        name: 'Hourglass Circle',
        description: 'Freezes all target velocities in place.',
        cooldown: 4000,
        sfxName: 'Hourglass Circle',
        sfxText: 'FREEZE!',
        type: 'aoe',
        color: '#0074d9'
      },
      {
        name: 'Chronoshift',
        description: 'Warp and trigger double casting speed.',
        cooldown: 6000,
        sfxName: 'Chronoshift',
        sfxText: 'REWIND!',
        type: 'buff',
        color: '#7fdbff'
      },
      {
        name: 'Temporal Collapse',
        description: 'Detonates timeline mirrors across the arena.',
        cooldown: 10000,
        sfxName: 'Temporal Collapse',
        sfxText: 'COLLAPSE!',
        type: 'aoe',
        color: '#ffffff'
      }
    ]
  },
  {
    id: 'nyssul',
    name: 'Nyssul, The Plague Star',
    title: 'Eldritch Infection Deity',
    quote: 'Humanoid combined with insect tentacles and parasitic vines.',
    description: 'Eldritch god covered with green corruption crystals and plague sacs. One massive eye glows at the center of its body, dripping acidic slime.',
    baseHp: 900,
    baseSpeed: 2.8,
    baseAtk: 82,
    magicType: 'Parasitic / Lime Gas',
    weaponName: 'Eldritch Claw',
    palette: {
      primary: '#1c281f',
      accent1: '#2d5a27',
      accent2: '#7cfc00',
      body: '#556b2f',
      weapon: '#adff2f'
    },
    abilities: [
      {
        name: 'Infected Laser',
        description: 'Glows its eye to fire a lime green laser stream.',
        cooldown: 1400,
        sfxName: 'Infected Laser',
        sfxText: 'BEAM!',
        type: 'projectile',
        color: '#7cfc00'
      },
      {
        name: 'Spore Cloud Nest',
        description: 'Pulsates corrosive gas pockets.',
        cooldown: 4500,
        sfxName: 'Spore Cloud Nest',
        sfxText: 'CORRUPT!',
        type: 'aoe',
        color: '#2d5a27'
      },
      {
        name: 'Parasite Swarm',
        description: 'Summons toxic spiders to bite and drain targets.',
        cooldown: 7000,
        sfxName: 'Parasite Swarm',
        sfxText: 'SKREEE!',
        type: 'summon',
        color: '#adff2f'
      },
      {
        name: 'Plague Star Rising',
        description: 'Absolute epidemic shockwave clearing the wave.',
        cooldown: 11000,
        sfxName: 'Plague Star Rising',
        sfxText: 'CONTAGION!',
        type: 'aoe',
        color: '#7cfc00'
      }
    ]
  },
  {
    id: 'luxion',
    name: 'Luxion, The Dimension Breaker',
    title: 'Divine Dimension Overlord',
    quote: 'Ancient cosmic emperor clad in magnificent gold armor.',
    description: 'Surrounded by floating golden halos, shattered portals, and space tears. His lightning sparks and dimensional staves crack the space fabric.',
    baseHp: 850,
    baseSpeed: 3.3,
    baseAtk: 92,
    magicType: 'Dimension / Celestial Lightning',
    weaponName: 'Dimension Staff',
    palette: {
      primary: '#1b1b1b',
      accent1: '#ffd700',
      accent2: '#4169e1',
      body: '#ffffff',
      weapon: '#ff00ff'
    },
    abilities: [
      {
        name: 'Dimension Rift',
        description: 'Launches celestial cracks forward.',
        cooldown: 1200,
        sfxName: 'Dimension Rift',
        sfxText: 'TEAR!',
        type: 'projectile',
        color: '#ff00ff'
      },
      {
        name: 'Golden Halos',
        description: 'Orbits golden high-voltage halos.',
        cooldown: 4000,
        sfxName: 'Golden Halos',
        sfxText: 'HALO!',
        type: 'summon',
        color: '#ffd700'
      },
      {
        name: 'Fracture Rift',
        description: 'Blink forward releasing gold lightning shock.',
        cooldown: 6000,
        sfxName: 'Fracture Rift',
        sfxText: 'FLASH!',
        type: 'aoe',
        color: '#4169e1'
      },
      {
        name: 'Multiverse Rip',
        description: 'Shakes space to tear open multiple dimensions.',
        cooldown: 11500,
        sfxName: 'Multiverse Rip',
        sfxText: 'SHATTER!',
        type: 'aoe',
        color: '#ffffff'
      }
    ]
  },
  {
    id: 'xaldris',
    name: 'Xaldris, The Soul Collector',
    title: 'Death Incarnate Soul Reaper',
    quote: 'Skeletal emperor with dark blue armor and glowing sapphire runes.',
    description: 'He carries an enormous scythe of cursed metal. Blue soul flames, chains, and wandering ghosts rise from under his ragged shadow cloak.',
    baseHp: 880,
    baseSpeed: 3.0,
    baseAtk: 88,
    magicType: 'Cursed Soul / Sapphire Flame',
    weaponName: 'Reaper Scythe',
    palette: {
      primary: '#050e1e',
      accent1: '#104e8b',
      accent2: '#00bfff',
      body: '#c0c0c0',
      weapon: '#2f4f4f'
    },
    abilities: [
      {
        name: 'Sapphire Scythe',
        description: 'Throws spinning soul flame scythes.',
        cooldown: 1300,
        sfxName: 'Sapphire Scythe',
        sfxText: 'SLASH!',
        type: 'projectile',
        color: '#00bfff'
      },
      {
        name: 'Ghostly Chains',
        description: 'Summons icy chains to lock targets down.',
        cooldown: 4000,
        sfxName: 'Ghostly Chains',
        sfxText: 'CHAIN!',
        type: 'aoe',
        color: '#104e8b'
      },
      {
        name: 'Spectral Wisps',
        description: 'Calls direct ghost spirits to block and shoot.',
        cooldown: 6500,
        sfxName: 'Spectral Wisps',
        sfxText: 'WISP!',
        type: 'summon',
        color: '#ffffff'
      },
      {
        name: 'Soul Feast',
        description: 'Explodes all sapphire circles for critical damage.',
        cooldown: 11000,
        sfxName: 'Soul Feast',
        sfxText: 'FEAST!',
        type: 'aoe',
        color: '#00bfff'
      }
    ]
  }
];
