'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Shield, Eye, Sparkles } from 'lucide-react';
import { motion } from '@/lib/animations';

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
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm z-10">
      <div className="relative flex flex-col items-center">
        {/* Animated loading spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
        <p className="mt-4 text-sm text-zinc-400 font-medium">Loading character...</p>
      </div>
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
    hueRotate: Math.random() * 40 - 20,
    saturation: 85 + Math.random() * 30,
    brightness: 92 + Math.random() * 16,
    contrast: 92 + Math.random() * 16,
    flipX: Math.random() > 0.5,
    offsetX: Math.random() * 10 - 5,
    offsetY: Math.random() * 10 - 5,
    rotation: Math.random() * 4 - 2,
    noiseOpacity: 0.03 + Math.random() * 0.04,
    patternType: Math.floor(Math.random() * 4),
  };
}

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

function PatternOverlay({ type }: { type: number }) {
  const patterns = [
    `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6L6 0' stroke='%23ffffff' stroke-width='0.3' opacity='0.03'/%3E%3C/svg%3E")`,
    `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4' cy='4' r='0.5' fill='%23ffffff' opacity='0.03'/%3E%3C/svg%3E")`,
    `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L8 8M8 0L0 8' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`,
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

function WatermarkOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center opacity-[0.015]"
        style={{ transform: 'rotate(-30deg) scale(2)' }}
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
  quadrantIndex,
}: {
  imageUrl: string;
  row: number;
  col: number;
  isRevealed: boolean;
  distortion: ImageDistortion;
  antiCheatEnabled: boolean;
  quadrantIndex: number;
}) {
  const bgPositionX = col === 0 ? '0%' : '100%';
  const bgPositionY = row === 0 ? '0%' : '100%';

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

  const getTransform = (baseTransform?: string) => {
    if (!antiCheatEnabled) return baseTransform;
    const flip = distortion.flipX ? 'scaleX(-1)' : '';
    const rotate = `rotate(${distortion.rotation}deg)`;
    return [baseTransform, flip, rotate].filter(Boolean).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: quadrantIndex * 0.02, duration: 0.12 }}
      className="relative overflow-hidden"
    >
      {/* Background image (blurred version) */}
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${bgPositionX} ${bgPositionY}`,
          backgroundSize: '200% 200%',
          filter: getFilter(),
          transform: getTransform(),
        }}
      />

      {/* Blur overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-[24px] bg-zinc-900/40 transition-all duration-200 ease-out ${isRevealed ? 'opacity-0 scale-110' : 'opacity-100'}`}
      />

      {/* Revealed image */}
      <div
        className={`absolute inset-0 bg-cover transition-all duration-200 ease-out ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${bgPositionX} ${bgPositionY}`,
          backgroundSize: '200% 200%',
          filter: getFilter(),
          transform: getTransform(),
        }}
      />

      {/* Quadrant number indicator (when not revealed) */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-600/50 flex items-center justify-center backdrop-blur-sm">
            <Eye className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      )}

      {/* Reveal shine effect */}
      {isRevealed && (
        <motion.div
          initial={{ x: '-100%', opacity: 0.8 }}
          animate={{ x: '200%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
      )}
    </motion.div>
  );
}

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

function ProgressIndicator({ revealed, total }: { revealed: number; total: number }) {
  return (
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
            i < revealed
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
              : 'bg-zinc-700'
          }`}
        />
      ))}
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
  const [isContainerVisible, setIsContainerVisible] = useState(false);
  const prevImageRef = useRef<string>('');

  const { isLoaded, error } = useImagePreload(imageUrl);
  const distortion = useMemo(() => generateDistortion(), [imageUrl]);

  useEffect(() => {
    if (prevImageRef.current !== imageUrl) {
      setRevealed([false, false, false, false]);
      setIsContainerVisible(false);
      prevImageRef.current = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (isLoaded) {
      requestAnimationFrame(() => {
        setIsContainerVisible(true);
      });
    }
  }, [isLoaded, imageUrl]);

  useEffect(() => {
    if (prevImageRef.current === imageUrl) {
      const newRevealed = [false, false, false, false];
      for (let i = 0; i < Math.min(revealedQuadrants, 4); i++) {
        newRevealed[i] = true;
      }
      setRevealed(newRevealed);
    }
  }, [revealedQuadrants, imageUrl]);

  const quadrants = [
    { row: 0, col: 0, index: 0 },
    { row: 0, col: 1, index: 1 },
    { row: 1, col: 0, index: 2 },
    { row: 1, col: 1, index: 3 },
  ];

  return (
    <div className="relative w-full max-w-[420px] mx-auto" role="img" aria-label={`Mystery character image. ${revealedQuadrants} of 4 sections revealed`}>
      {/* Main container with premium frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isContainerVisible ? 1 : 0, scale: isContainerVisible ? 1 : 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative aspect-square"
      >
        {/* Outer glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60 animate-pulse" aria-hidden="true" />

        {/* Gaming frame border */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" aria-hidden="true">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 p-[3px] rounded-2xl">
            <div className="absolute inset-[3px] bg-zinc-900 rounded-xl" />
          </div>

          {/* Corner accents */}
          <div className="absolute top-1 left-1 w-6 h-6 border-l-2 border-t-2 border-cyan-400/60 rounded-tl-lg" />
          <div className="absolute top-1 right-1 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg" />
          <div className="absolute bottom-1 left-1 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg" />
          <div className="absolute bottom-1 right-1 w-6 h-6 border-r-2 border-b-2 border-cyan-400/60 rounded-br-lg" />
        </div>

        {/* Main content area */}
        <div className="absolute inset-[3px] rounded-xl overflow-hidden bg-zinc-900">
          {/* Loading overlay */}
          {!isLoaded && !error && <LoadingOverlay />}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
              <div className="text-zinc-500 text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-400">Failed to load image</p>
                <p className="text-xs text-zinc-600 mt-1">Please try again</p>
              </div>
            </div>
          )}

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
                quadrantIndex={index}
              />
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-purple-500/40 to-transparent -translate-x-1/2" />
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

        {/* Top badges */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-2" aria-hidden="true">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="px-3 py-1 bg-zinc-900/90 border border-purple-500/30 rounded-full flex items-center gap-1.5 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-purple-300 font-medium uppercase tracking-wider">Mystery Character</span>
          </motion.div>
        </div>

        {/* Anti-cheat badge */}
        {antiCheatEnabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', duration: 0.2 }}
            className="absolute top-3 right-3 z-20"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full backdrop-blur-sm">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-300 font-medium">Protected</span>
            </div>
          </motion.div>
        )}

        {/* Reveal progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-zinc-700/50 rounded-full backdrop-blur-sm">
            <span className="text-xs text-zinc-400">Revealed:</span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.03 }}
                  className={`w-3 h-3 rounded-sm transition-all duration-150 ${
                    i < revealedQuadrants
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm shadow-purple-500/50'
                      : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-purple-400">{revealedQuadrants}/4</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
