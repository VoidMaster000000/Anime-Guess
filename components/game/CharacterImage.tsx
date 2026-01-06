'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { animate } from '@/lib/animejs';

interface CharacterImageProps {
  imageUrl: string;
  revealedQuadrants: number;
  antiCheatEnabled?: boolean;
}

// ============================================================================
// LAZY LOADING - Preload image with blur-up effect
// ============================================================================

function useImagePreload(src: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setError(false);

    const img = new Image();
    img.src = src;

    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { isLoaded, error };
}

function LoadingOverlay() {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinnerRef.current) {
      animate(spinnerRef.current, {
        rotate: 360,
        duration: 1000,
        ease: 'linear',
        loop: true,
      });
    }
    if (pulseRef.current) {
      animate(pulseRef.current, {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
        duration: 1500,
        ease: 'inOutSine',
        loop: true,
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
      <div className="relative">
        <div
          ref={pulseRef}
          className="absolute inset-0 w-20 h-20 bg-purple-500/30 rounded-full blur-xl"
          style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
        />
        <div
          ref={spinnerRef}
          className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
      <p className="absolute bottom-8 text-sm text-zinc-400">Loading character...</p>
    </div>
  );
}

// ============================================================================
// IMAGE DISTORTION - Anti reverse image search
// ============================================================================

interface ImageDistortion {
  hueRotate: number;
  saturation: number;
  brightness: number;
  contrast: number;
  flipX: boolean;
  offsetX: number;
  offsetY: number;
  rotation: number;
  noiseOpacity: number;
  patternType: number;
}

function generateDistortion(): ImageDistortion {
  return {
    hueRotate: Math.random() * 40 - 20, // -20 to +20 degrees
    saturation: 85 + Math.random() * 30, // 85-115%
    brightness: 92 + Math.random() * 16, // 92-108%
    contrast: 92 + Math.random() * 16, // 92-108%
    flipX: Math.random() > 0.5,
    offsetX: Math.random() * 10 - 5, // -5 to +5 pixels
    offsetY: Math.random() * 10 - 5, // -5 to +5 pixels
    rotation: Math.random() * 4 - 2, // -2 to +2 degrees
    noiseOpacity: 0.03 + Math.random() * 0.04, // 3-7% noise
    patternType: Math.floor(Math.random() * 4), // 0-3 pattern types
  };
}

// Noise overlay pattern component
function NoiseOverlay({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Subtle pattern overlay to confuse image recognition
function PatternOverlay({ type }: { type: number }) {
  const patterns = [
    // Diagonal lines
    `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6L6 0' stroke='%23ffffff' stroke-width='0.3' opacity='0.03'/%3E%3C/svg%3E")`,
    // Dots
    `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4' cy='4' r='0.5' fill='%23ffffff' opacity='0.03'/%3E%3C/svg%3E")`,
    // Crosshatch
    `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L8 8M8 0L0 8' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`,
    // Grid
    `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5H10M5 0V10' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`,
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: patterns[type] || patterns[0],
        backgroundRepeat: 'repeat',
      }}
    />
  );
}

// Watermark overlay
function WatermarkOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle diagonal watermark text */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-[0.015]"
        style={{
          transform: 'rotate(-30deg) scale(2)',
        }}
      >
        <div className="text-white text-2xl font-bold whitespace-nowrap tracking-[0.5em]">
          ANIME GUESS GAME
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ANIMATED QUADRANT
// ============================================================================

function AnimatedQuadrant({
  imageUrl,
  row,
  col,
  isRevealed,
  distortion,
  antiCheatEnabled,
}: {
  imageUrl: string;
  row: number;
  col: number;
  isRevealed: boolean;
  distortion: ImageDistortion;
  antiCheatEnabled: boolean;
}) {
  const blurRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blurRef.current) {
      animate(blurRef.current, {
        opacity: isRevealed ? [1, 0] : 1,
        duration: 600,
        ease: 'inOutQuad',
      });
    }

    if (revealRef.current) {
      animate(revealRef.current, {
        opacity: isRevealed ? [0, 1] : 0,
        scale: isRevealed ? [1.1, 1] : 1.1,
        duration: 600,
        ease: 'outQuad',
      });
    }
  }, [isRevealed]);

  // Calculate background position with distortion offset
  const baseOffsetX = col * -200;
  const baseOffsetY = row * -200;
  const offsetX = antiCheatEnabled ? baseOffsetX + distortion.offsetX : baseOffsetX;
  const offsetY = antiCheatEnabled ? baseOffsetY + distortion.offsetY : baseOffsetY;

  // Build filter string
  const getFilter = () => {
    if (!antiCheatEnabled) return undefined;
    const filters = [
      `hue-rotate(${distortion.hueRotate}deg)`,
      `saturate(${distortion.saturation}%)`,
      `brightness(${distortion.brightness}%)`,
      `contrast(${distortion.contrast}%)`,
    ];
    return filters.join(' ');
  };

  // Transform for flip
  const getTransform = (baseTransform?: string) => {
    if (!antiCheatEnabled) return baseTransform;
    const flip = distortion.flipX ? 'scaleX(-1)' : '';
    const rotate = `rotate(${distortion.rotation}deg)`;
    return [baseTransform, flip, rotate].filter(Boolean).join(' ');
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          backgroundSize: '400px 400px',
          filter: getFilter(),
          transform: getTransform(),
        }}
      />

      {/* Blur overlay */}
      <div
        ref={blurRef}
        className="absolute inset-0 backdrop-blur-[20px] bg-black/30"
        style={{ opacity: isRevealed ? 0 : 1 }}
      />

      {/* Revealed image */}
      <div
        ref={revealRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          backgroundSize: '400px 400px',
          opacity: isRevealed ? 1 : 0,
          transform: getTransform(isRevealed ? 'scale(1)' : 'scale(1.1)'),
          filter: getFilter(),
        }}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CharacterImage({
  imageUrl,
  revealedQuadrants,
  antiCheatEnabled = true,
}: CharacterImageProps) {
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy load the image
  const { isLoaded, error } = useImagePreload(imageUrl);

  // Generate distortion once per image URL to keep it consistent
  const distortion = useMemo(() => generateDistortion(), [imageUrl]);

  // Animate container when image loads
  useEffect(() => {
    if (isLoaded && containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    // Reveal quadrants based on the count (0-4+)
    const newRevealed = [false, false, false, false];
    for (let i = 0; i < Math.min(revealedQuadrants, 4); i++) {
      newRevealed[i] = true;
    }
    setRevealed(newRevealed);
  }, [revealedQuadrants]);

  const quadrants = [
    { row: 0, col: 0, index: 0 }, // top-left
    { row: 0, col: 1, index: 1 }, // top-right
    { row: 1, col: 0, index: 2 }, // bottom-left
    { row: 1, col: 1, index: 3 }, // bottom-right
  ];

  return (
    <div className="relative w-[400px] h-[400px] rounded-2xl overflow-hidden">
      {/* Loading overlay */}
      {!isLoaded && !error && <LoadingOverlay />}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
          <div className="text-zinc-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Gradient glowing border */}
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-[2px]"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
          {/* Image grid */}
          <div
            className="grid grid-cols-2 grid-rows-2 w-full h-full"
            style={{
              transform: antiCheatEnabled ? `rotate(${distortion.rotation}deg)` : undefined,
            }}
          >
            {quadrants.map(({ row, col, index }) => (
              <AnimatedQuadrant
                key={index}
                imageUrl={imageUrl}
                row={row}
                col={col}
                isRevealed={revealed[index]}
                distortion={distortion}
                antiCheatEnabled={antiCheatEnabled}
              />
            ))}
          </div>

          {/* Anti-cheat overlays */}
          {antiCheatEnabled && (
            <>
              <NoiseOverlay opacity={distortion.noiseOpacity} />
              <PatternOverlay type={distortion.patternType} />
              <WatermarkOverlay />
            </>
          )}
        </div>
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-purple-500/20 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-purple-500/20 -translate-x-1/2" />
      </div>

      {/* Anti-cheat badge */}
      {antiCheatEnabled && (
        <div className="absolute top-2 right-2 bg-green-500/20 border border-green-500/40 rounded-full px-2 py-0.5 text-[10px] text-green-400 font-medium backdrop-blur-sm">
          Protected
        </div>
      )}
    </div>
  );
}
