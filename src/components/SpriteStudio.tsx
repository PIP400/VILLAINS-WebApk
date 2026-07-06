import React, { useEffect, useRef, useState } from 'react';
import { Character, CharacterPalette, AnimationState } from '../types';
import { drawPixelSprite } from '../sprites';
import { audio } from '../audio';
import { Sliders, Download, Eye, Sparkles, Paintbrush, Undo, Check } from 'lucide-react';

interface SpriteStudioProps {
  selectedCharacter: Character;
  customPalette: CharacterPalette;
  onPaletteChange: (newPalette: CharacterPalette) => void;
  onResetPalette: () => void;
}

interface FrameDetail {
  state: AnimationState;
  frame: number;
  label: string;
}

export default function SpriteStudio({
  selectedCharacter,
  customPalette,
  onPaletteChange,
  onResetPalette
}: SpriteStudioProps) {
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#121216');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [exportSuccess, setExportSuccess] = useState(false);

  // List of distinct frames to display in the grid
  const framesToRender: FrameDetail[] = [
    { state: 'idle', frame: 0, label: 'Idle Frame 1' },
    { state: 'idle', frame: 2, label: 'Idle Frame 2' },
    { state: 'walk', frame: 0, label: 'Walk Frame 1' },
    { state: 'walk', frame: 2, label: 'Walk Frame 2' },
    { state: 'attack', frame: 1, label: 'Wind-up Swing' },
    { state: 'attack', frame: 3, label: 'Slash Release' },
    { state: 'ability', frame: 2, label: 'Spell Channel' },
    { state: 'ability', frame: 4, label: 'Spell Burst' },
    { state: 'hit', frame: 0, label: 'Take Hit' },
    { state: 'die', frame: 4, label: 'Death State' }
  ];

  // Handle individual color picker changes
  const handleColorChange = (key: keyof CharacterPalette, value: string) => {
    onPaletteChange({
      ...customPalette,
      [key]: value
    });
  };

  // Compile and export all 10 frames side-by-side as a single game-ready 640x64 sprite sheet download!
  const handleExportSpriteSheet = () => {
    const canvas = document.createElement('canvas');
    const cellW = 64;
    const cellH = 64;
    canvas.width = cellW * framesToRender.length;
    canvas.height = cellH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw dark transparent background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    framesToRender.forEach((fd, index) => {
      const cx = index * cellW + cellW / 2;
      const cy = cellH / 2;
      
      // Draw frame centered
      drawPixelSprite(
        ctx,
        cx,
        cy,
        selectedCharacter.id,
        fd.state,
        fd.frame,
        customPalette,
        1.2, // scale factor for 64x64 cell fitting
        'right'
      );

      // Draw faint vertical separation lines
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo((index + 1) * cellW, 0);
      ctx.lineTo((index + 1) * cellW, cellH);
      ctx.stroke();
    });

    // Create download link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${selectedCharacter.id}_spritesheet.png`;
    link.href = dataUrl;
    link.click();

    audio.playHeal();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5 h-full">
      
      {/* 1. COLOR TUNING STUDIO PANEL */}
      <div className="flex-1 max-w-full xl:max-w-xs bg-[#0d0d12] border border-gray-800 rounded-xl p-4 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-xs font-mono text-gray-400 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
            <Paintbrush size={14} className="text-purple-400" /> PALETTE SWAP CUSTOMIZER
          </h3>
          <p className="text-[10px] text-gray-500 font-mono mb-3.5 leading-normal">
            Modify any color node. This updates both the sprite studio and the active battle game immediately.
          </p>

          <div className="flex flex-col gap-3.5">
            {/* Primary color */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-950 border border-gray-900 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-white uppercase">Primary Plate</span>
                <span className="text-[9px] font-mono text-gray-500">{customPalette.primary}</span>
              </div>
              <input
                type="color"
                value={customPalette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-10 h-8 rounded border border-gray-800 cursor-pointer bg-transparent"
              />
            </div>

            {/* Accent 1 */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-950 border border-gray-900 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-white uppercase">Core Highlights</span>
                <span className="text-[9px] font-mono text-gray-500">{customPalette.accent1}</span>
              </div>
              <input
                type="color"
                value={customPalette.accent1}
                onChange={(e) => handleColorChange('accent1', e.target.value)}
                className="w-10 h-8 rounded border border-gray-800 cursor-pointer bg-transparent"
              />
            </div>

            {/* Accent 2 */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-950 border border-gray-900 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-white uppercase">Glow Highlights</span>
                <span className="text-[9px] font-mono text-gray-500">{customPalette.accent2}</span>
              </div>
              <input
                type="color"
                value={customPalette.accent2}
                onChange={(e) => handleColorChange('accent2', e.target.value)}
                className="w-10 h-8 rounded border border-gray-800 cursor-pointer bg-transparent"
              />
            </div>

            {/* Body */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-950 border border-gray-900 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-white uppercase">Core Body/Bones</span>
                <span className="text-[9px] font-mono text-gray-500">{customPalette.body}</span>
              </div>
              <input
                type="color"
                value={customPalette.body}
                onChange={(e) => handleColorChange('body', e.target.value)}
                className="w-10 h-8 rounded border border-gray-800 cursor-pointer bg-transparent"
              />
            </div>

            {/* Weapon */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-950 border border-gray-900 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-white uppercase">Weapon / Magic</span>
                <span className="text-[9px] font-mono text-gray-500">{customPalette.weapon}</span>
              </div>
              <input
                type="color"
                value={customPalette.weapon}
                onChange={(e) => handleColorChange('weapon', e.target.value)}
                className="w-10 h-8 rounded border border-gray-800 cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onResetPalette}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 active:scale-95 text-xs text-gray-300 font-mono border border-gray-800 rounded-lg hover:border-gray-700 transition-all cursor-pointer"
          >
            <Undo size={14} /> RESET FACTORY PALETTE
          </button>

          <button
            onClick={handleExportSpriteSheet}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-xs text-white font-mono font-bold rounded-lg shadow-md shadow-purple-900/30 border border-purple-500 transition-all cursor-pointer"
          >
            {exportSuccess ? <Check size={14} /> : <Download size={14} />}
            {exportSuccess ? 'SPRITES EXPORTED!' : 'EXPORT SPRITE SHEET'}
          </button>
        </div>
      </div>

      {/* 2. SPRITE SHEET FRAMES RENDER GRID */}
      <div className="flex-1 bg-[#0d0d12] border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-2.5">
          <div>
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} className="text-purple-400" /> INDIVIDUAL ANIMATION FRAMES (64x64 SPRITE SIZE)
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">
              Inspect each individual animation stance and posture drawn cleanly.
            </p>
          </div>

          {/* Background grid color setup */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">STAGE COLOR:</span>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-6 h-6 border border-gray-800 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>

        {/* Frames mapping grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {framesToRender.map((fd, index) => {
            return (
              <FrameCard
                key={`${fd.state}-${fd.frame}-${index}`}
                selectedCharacter={selectedCharacter}
                frameDetail={fd}
                palette={customPalette}
                backgroundColor={backgroundColor}
              />
            );
          })}
        </div>

        {/* Informative outline banner */}
        <div className="bg-gray-950 p-3 rounded-lg border border-gray-900 flex items-start gap-2 text-[11px] font-mono text-gray-400 leading-relaxed mt-auto">
          <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <span className="text-white font-bold uppercase">Pixel Art Spec:</span> All frames are compiled as true mathematical coordinate structures on HTML5 canvas, completely bypasses jagged pixel blur artifacts, rendering crisp outlines at any resolution scaling, ideal for modern retro indie game project integrations!
          </div>
        </div>
      </div>

    </div>
  );
}

// Sub-component card representing a single isolated frame canvas
interface FrameCardProps {
  key?: string;
  selectedCharacter: Character;
  frameDetail: FrameDetail;
  palette: CharacterPalette;
  backgroundColor: string;
}

function FrameCard({ selectedCharacter, frameDetail, palette, backgroundColor }: FrameCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid checkerboard background to see transparency details
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    const gSize = 8;
    for (let x = 0; x < canvas.width; x += gSize * 2) {
      for (let y = 0; y < canvas.height; y += gSize * 2) {
        ctx.fillRect(x, y, gSize, gSize);
        ctx.fillRect(x + gSize, y + gSize, gSize, gSize);
      }
    }

    // Draw frame centered at (45, 55) within a 90x90 canvas frame
    drawPixelSprite(
      ctx,
      canvas.width / 2,
      canvas.height / 2 + 5, // slightly down to fit floating elements / halos
      selectedCharacter.id,
      frameDetail.state,
      frameDetail.frame,
      palette,
      1.5, // nice visible zoom
      'right'
    );
  }, [selectedCharacter, frameDetail, palette, backgroundColor]);

  return (
    <div className="bg-[#111116] border border-gray-900 rounded-lg p-2.5 flex flex-col items-center text-center gap-2">
      <div className="w-full aspect-square rounded overflow-hidden border border-gray-950">
        <canvas
          ref={canvasRef}
          width={90}
          height={90}
          className="w-full h-full block"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-sans font-black text-white">{frameDetail.label}</span>
        <span className="text-[9px] font-mono text-purple-400 uppercase font-semibold">
          {frameDetail.state} f:{frameDetail.frame}
        </span>
      </div>
    </div>
  );
}
