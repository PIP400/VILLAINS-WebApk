import React, { useState, useEffect } from 'react';
import { CHARACTERS } from './data';
import { Character, CharacterPalette } from './types';
import Sidebar from './sidebar';
import ArenaGame from './components/ArenaGame';
import SpriteStudio from './components/SpriteStudio';
import { audio } from './audio';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Sliders, Shield, Swords, Gamepad2, Info, Skull, Zap, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [activeTab, setActiveTab] = useState<'play' | 'studio'>('play');
  const [gameStage, setGameStage] = useState<'splash' | 'menu' | 'playing'>('splash');
  
  // Custom color palette state synchronized between studio and playable arena
  const [customPalette, setCustomPalette] = useState<CharacterPalette>(CHARACTERS[0].palette);

  // Persistent session stats
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionKills, setSessionKills] = useState(0);
  const [sessionWave, setSessionWave] = useState(0);

  // Update palette whenever character selection changes
  useEffect(() => {
    setCustomPalette(selectedCharacter.palette);
  }, [selectedCharacter]);

  // Handle stat feedback from game arena to outer header hud
  const handleStatsUpdate = (score: number, kills: number, wave: number) => {
    setSessionScore(score);
    setSessionKills(kills);
    setSessionWave(wave - 1);
  };

  const handlePaletteChange = (newPalette: CharacterPalette) => {
    setCustomPalette(newPalette);
  };

  const handleResetPalette = () => {
    setCustomPalette(selectedCharacter.palette);
    audio.playHeal();
  };

  // Synchronized select character wrapper to keep custom colors aligned
  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
  };

  const startSystem = () => {
    audio.playHeal();
    setGameStage('menu');
  };

  const deployToBattle = () => {
    audio.playSpell('Annihilation');
    setGameStage('playing');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans selection:bg-purple-600/30 overflow-x-hidden relative">
      
      {/* RETRO BACKGROUND SCANLINES */}
      <div className="absolute inset-0 bg-[radial-gradient(#0c0a12_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

      <AnimatePresence mode="wait">
        
        {/* STAGE 1: ENTRANCE SPLASHART "MINU_DOAPPS" */}
        {gameStage === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 min-h-screen relative bg-black"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 text-[11px] font-mono tracking-[0.4em] text-purple-500 uppercase"
            >
              RETRO DIGITAL SYSTEMS PRESENTS
            </motion.div>

            {/* Giant Glowing "MINU_DOAPPS" logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
              className="relative py-4 px-8 mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.4)] font-mono uppercase">
                MINU_DOAPPS
              </h1>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-500/20 blur-xl opacity-70" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-gray-500 font-mono max-w-sm mb-12 uppercase leading-relaxed tracking-wider"
            >
              Establishing connection with neural core...
              <br />
              All terminal modules fully synthesized.
            </motion.p>

            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.9 }}
              onClick={startSystem}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-mono text-sm rounded-lg border border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer tracking-wider uppercase font-black"
            >
              <Gamepad2 size={16} /> INITIALIZE SOUL CORE
            </motion.button>
          </motion.div>
        )}

        {/* STAGE 2: MAIN MENU WITH GAME TITLE */}
        {gameStage === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 min-h-screen relative max-w-4xl mx-auto w-full"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-950/10 blur-[120px] pointer-events-none" />

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-pink-500 tracking-[0.3em] uppercase mb-3 flex items-center gap-2 justify-center"
            >
              <Skull size={14} /> PLAYABLE DEMONIC RPG ARENA
            </motion.div>

            {/* Game Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans text-white uppercase mb-4 leading-none"
            >
              24 DEADLY <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">SOUL VILLAINS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-400 max-w-lg mb-8 font-mono leading-relaxed"
            >
              Command ancient skeletal conquerors, void dragons, and storm overlords. Customize their color sheets and unleash signature spell barrages in a high-octane procedural siege arena.
            </motion.p>

            {/* Selection quick showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-6 gap-3 max-w-2xl w-full mb-10 bg-gray-950/80 p-4 rounded-xl border border-gray-900 shadow-xl"
            >
              {CHARACTERS.slice(0, 6).map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedCharacter(char);
                    audio.playHit();
                  }}
                  className={`flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all ${
                    selectedCharacter.id === char.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-850 bg-gray-900/40 hover:border-gray-800'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded border flex items-center justify-center font-bold text-sm"
                    style={{ 
                      borderColor: char.palette.accent1,
                      color: char.palette.accent2,
                      textShadow: `0 0 6px ${char.palette.accent2}`
                    }}
                  >
                    {char.name[0]}
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 truncate w-full text-center">
                    {char.name.split(',')[0]}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md"
            >
              <button
                onClick={deployToBattle}
                className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-mono text-sm font-black uppercase rounded-lg border border-red-500 shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Swords size={16} /> ENTER BATTLEFIELD
              </button>
              
              <button
                onClick={() => {
                  setGameStage('splash');
                  audio.playSlash();
                }}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 active:scale-95 text-gray-300 font-mono text-sm rounded-lg border border-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                BACK TO LOADER
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 3: FULL CORE GAME DASHBOARD */}
        {gameStage === 'playing' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col z-10 w-full"
          >
            {/* 1. APP TOP BAR */}
            <header className="bg-[#0b0b0e]/95 border-b border-gray-900 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md sticky top-0 z-50 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => {
                    audio.playHeal();
                    setGameStage('menu');
                  }}
                  className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/20 hover:scale-105 active:scale-95 transition-all"
                  title="Main Menu"
                >
                  <Gamepad2 className="w-5 h-5 text-white animate-pulse" />
                </button>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-sans uppercase">
                      COSMIC SECTOR
                    </span>
                    <span className="text-[9px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-800 uppercase font-bold">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">
                    Procedural Pixel RPG Core (24 Playable Heroes)
                  </p>
                </div>
              </div>

              {/* Global Tab Controls */}
              <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-900 shadow-inner">
                <button
                  onClick={() => {
                    setActiveTab('play');
                    audio.playHeal();
                  }}
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
                    activeTab === 'play'
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Play size={13} /> Playable Arena
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('studio');
                    audio.playHeal();
                  }}
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
                    activeTab === 'studio'
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sliders size={13} /> Sprite Sheet Studio
                </button>
              </div>

              {/* PERSISTENT RECORD HUD */}
              <div className="flex items-center gap-4 text-xs font-mono bg-gray-950 px-4 py-2 rounded-xl border border-gray-900">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[9px] uppercase">Record Score</span>
                  <span className="text-yellow-400 font-black text-sm">{sessionScore}</span>
                </div>
                <div className="h-6 w-px bg-gray-800" />
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[9px] uppercase">Record Kills</span>
                  <span className="text-red-400 font-black text-sm">{sessionKills}</span>
                </div>
              </div>
            </header>

            {/* 2. CORE DASHBOARD SPLIT VIEW */}
            <main className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-5 max-w-7xl mx-auto w-full items-stretch">
              
              {/* Left Sidebar Profile Selector (Sizing: 1/3 layout) */}
              <div className="w-full lg:w-[320px] shrink-0">
                <Sidebar
                  selectedCharacter={selectedCharacter}
                  onSelectCharacter={handleSelectCharacter}
                  gameScore={sessionScore}
                  gameKills={sessionKills}
                />
              </div>

              {/* Right Active Panel (Sizing: 2/3 layout) */}
              <div className="flex-1 min-w-0">
                {activeTab === 'play' ? (
                  <ArenaGame
                    selectedCharacter={{
                      ...selectedCharacter,
                      palette: customPalette // Pass dynamic palette customized in the studio
                    }}
                    onStatsUpdate={handleStatsUpdate}
                  />
                ) : (
                  <SpriteStudio
                    selectedCharacter={selectedCharacter}
                    customPalette={customPalette}
                    onPaletteChange={handlePaletteChange}
                    onResetPalette={handleResetPalette}
                  />
                )}
              </div>

            </main>

            {/* 3. FOOTER */}
            <footer className="bg-[#0b0b0e] border-t border-gray-900 px-6 py-4 text-center text-xs font-mono text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-3 mt-auto">
              <div className="flex items-center gap-2 justify-center">
                <Info size={14} className="text-gray-600" />
                <span>Move with <b className="text-gray-300">WASD / Arrow Keys</b>. Action slash with <b className="text-gray-300">Spacebar / Canvas Click</b>. Abilities with <b className="text-gray-300">Z, X, C, V</b>.</span>
              </div>
              <span>Synthesized audio via <b className="text-purple-500">Web Audio API</b></span>
            </footer>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
