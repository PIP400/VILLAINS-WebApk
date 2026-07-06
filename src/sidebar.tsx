import React from 'react';
import { Character, CharacterId } from './types';
import { CHARACTERS } from './data';
import { drawPixelSprite } from './sprites';
import { audio } from './audio';
import { Sparkles, Swords, Heart, Shield, Zap, Volume2, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  selectedCharacter: Character;
  onSelectCharacter: (char: Character) => void;
  gameScore: number;
  gameKills: number;
}

export default function Sidebar({ selectedCharacter, onSelectCharacter, gameScore, gameKills }: SidebarProps) {

  // Play sound clip manual trigger
  const handlePlaySFX = (abilityName: string) => {
    audio.playSpell(abilityName);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d12] border border-gray-800 rounded-xl overflow-hidden shadow-2xl p-4 gap-4">
      
      {/* 1. APP / GAME HEADING */}
      <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-sans uppercase">
            6 DEADLY POWER VILLAINS
          </h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">
            Pixel RPG Combat & Sandbox Playground
          </p>
        </div>
      </div>

      {/* 2. VILLAIN SELECTOR GRID */}
      <div>
        <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">
          SELECT YOUR VILLAIN ({CHARACTERS.length})
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selectedCharacter.id;
            return (
              <button
                key={char.id}
                onClick={() => {
                  onSelectCharacter(char);
                  audio.playHeal();
                }}
                className={`relative p-2 rounded-lg border bg-gray-950 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  isSelected 
                    ? 'border-purple-500 bg-[#160d23]/80 shadow-lg shadow-purple-950/20' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Micro avatar canvas */}
                <div 
                  className="w-10 h-10 flex items-center justify-center rounded overflow-hidden bg-[#0a0a0d] border border-gray-900"
                  style={{
                    boxShadow: isSelected ? `0 0 10px ${char.palette.accent1}30` : 'none'
                  }}
                >
                  <span 
                    className="font-bold text-lg select-none"
                    style={{ color: char.palette.accent2 }}
                  >
                    {char.name[0]}
                  </span>
                </div>
                
                {/* Short identifier name */}
                <div className="text-[10px] font-sans font-bold text-white truncate max-w-full">
                  {char.name.split(',')[0]}
                </div>

                {/* Selected active glow indicator */}
                {isSelected && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CORE STATISTICS PANEL */}
      <div className="bg-[#121217] border border-gray-800/80 rounded-lg p-3.5">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <h2 className="text-sm font-sans font-black text-white tracking-tight">{selectedCharacter.name}</h2>
            <p className="text-[10px] font-mono text-purple-400 font-semibold">{selectedCharacter.title}</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-950 text-yellow-400 border border-yellow-900/40 rounded uppercase font-bold">
            {selectedCharacter.magicType.split(' / ')[0]}
          </span>
        </div>

        {/* Cursive Quote banner */}
        <div className="border-l-2 border-purple-500/50 pl-2 py-1 mb-3 bg-purple-950/10 rounded-r">
          <p className="text-[11px] text-gray-300 italic font-sans leading-relaxed">
            "{selectedCharacter.quote}"
          </p>
        </div>

        {/* Stats Bars */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Base HP */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-0.5">
              <span className="flex items-center gap-1"><Heart size={10} className="text-red-500" /> BASE HEALTH (HP)</span>
              <span className="text-white font-bold">{selectedCharacter.baseHp}</span>
            </div>
            <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-900">
              <div 
                className="bg-red-500 h-full rounded-full"
                style={{ width: `${(selectedCharacter.baseHp / 1000) * 100}%` }}
              />
            </div>
          </div>

          {/* Base Attack */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-0.5">
              <span className="flex items-center gap-1"><Swords size={10} className="text-orange-500" /> DESTRUCTIVE ATTACK (ATK)</span>
              <span className="text-white font-bold">{selectedCharacter.baseAtk}</span>
            </div>
            <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-900">
              <div 
                className="bg-orange-500 h-full rounded-full"
                style={{ width: `${(selectedCharacter.baseAtk / 150) * 100}%` }}
              />
            </div>
          </div>

          {/* Base Speed */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-0.5">
              <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-500" /> MOVEMENT VELOCITY</span>
              <span className="text-white font-bold">{selectedCharacter.baseSpeed} units</span>
            </div>
            <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-900">
              <div 
                className="bg-yellow-500 h-full rounded-full"
                style={{ width: `${(selectedCharacter.baseSpeed / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weapons description info */}
        <div className="mt-3.5 pt-2.5 border-t border-gray-800 flex justify-between text-[10px] font-mono text-gray-400">
          <span>SIGNATURE WEAPON:</span>
          <span className="text-white font-bold uppercase tracking-wide">{selectedCharacter.weaponName}</span>
        </div>
      </div>

      {/* 4. MANUAL SYNTH SOUNDBOARD PANEL */}
      <div>
        <h3 className="text-xs font-mono text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
          <Volume2 size={13} /> SYNTHESIZED SOUND EFFECTS TEST
        </h3>
        <p className="text-[10px] text-gray-600 font-mono mb-2 leading-tight">
          Click below to test live generated synth sounds:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {selectedCharacter.abilities.map((ability) => {
            return (
              <button
                key={ability.name + '-sfx'}
                onClick={() => handlePlaySFX(ability.name)}
                className="p-1.5 bg-gray-950 hover:bg-gray-900 active:scale-95 border border-gray-800 rounded flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="text-[10px] font-sans font-bold text-gray-300 group-hover:text-white truncate max-w-full">
                  {ability.name}
                </div>
                <div className="text-[9px] font-mono text-purple-400 font-semibold uppercase">
                  "{ability.sfxText}"
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. BRIEF BACKGROUND LORE STORY */}
      <div className="bg-[#121217] border border-gray-800/60 rounded-lg p-3 text-[11px] font-mono text-gray-400 mt-auto leading-normal">
        <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">
          COGNITIVE DESCRIPTION:
        </p>
        {selectedCharacter.description}
      </div>

    </div>
  );
}
