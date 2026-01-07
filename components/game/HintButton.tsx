'use client';

import { Eye, Coins } from 'lucide-react';

interface HintButtonProps {
  hintsRevealed: number;
  maxHints: number;
  onReveal: () => void;
  cost: number;
}

// ============================================================================
// SIMPLE HELPER COMPONENTS (CSS-based for mobile performance)
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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} transition-transform duration-150 ${!disabled ? 'hover:scale-105 active:scale-95' : ''}`}
    >
      {children}
    </button>
  );
}

function AnimatedGlow({ isEnabled }: { isEnabled: boolean }) {
  if (!isEnabled) return null;

  // Use CSS animation instead of JS for better mobile performance
  return (
    <div
      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 blur-xl -z-10 animate-pulse"
    />
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
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
        <ProgressBar progress={(hintsRemaining / maxHints) * 100} />
      </div>
    </HoverButton>
  );
}
