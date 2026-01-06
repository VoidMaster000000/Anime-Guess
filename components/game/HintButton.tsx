'use client';

import { useRef, useEffect } from 'react';
import { Eye, Coins } from 'lucide-react';
import { animate } from '@/lib/animejs';

interface HintButtonProps {
  hintsRevealed: number;
  maxHints: number;
  onReveal: () => void;
  cost: number;
}

// ============================================================================
// ANIMATED HELPER COMPONENTS
// ============================================================================

function HoverButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  className: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 1.05, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 0.95, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 1.05, duration: 100, ease: 'outQuad' });
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
}

function AnimatedGlow({ isEnabled }: { isEnabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !isEnabled) return;

    const runPulse = () => {
      if (!ref.current) return;
      animate(ref.current, {
        opacity: [0.3, 0.6, 0.3],
        duration: 2000,
        ease: 'inOutQuad',
        onComplete: runPulse,
      });
    };

    runPulse();
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 blur-xl -z-10"
    />
  );
}

function AnimatedProgressBar({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        width: [`${progress}%`],
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, [progress]);

  return (
    <div
      ref={ref}
      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
      style={{ width: `${progress}%` }}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HintButton({ hintsRevealed, maxHints, onReveal, cost }: HintButtonProps) {
  const hintsRemaining = maxHints - hintsRevealed;
  const isDisabled = hintsRemaining <= 0;

  return (
    <HoverButton
      onClick={onReveal}
      disabled={isDisabled}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-lg
        transition-all duration-300 flex items-center gap-3
        ${
          isDisabled
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-700'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
        }
      `}
    >
      {/* Icon */}
      <Eye className={`w-6 h-6 ${isDisabled ? 'opacity-50' : ''}`} />

      {/* Text content */}
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">
          Reveal Hint
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className={isDisabled ? 'text-gray-600' : 'text-purple-200'}>
            {hintsRemaining} remaining
          </span>
          {cost > 0 && !isDisabled && (
            <>
              <span className="text-purple-300">•</span>
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                <span>{cost} pts</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Glow effect when enabled */}
      <AnimatedGlow isEnabled={!isDisabled} />

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 rounded-b-xl overflow-hidden">
        <AnimatedProgressBar progress={(hintsRemaining / maxHints) * 100} />
      </div>
    </HoverButton>
  );
}
