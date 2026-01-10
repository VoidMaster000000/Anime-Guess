'use client';

import { Eye, Coins } from 'lucide-react';
import { motion } from '@/lib/animations';

interface HintButtonProps {
  hintsRevealed: number;
  maxHints: number;
  onReveal: () => void;
  cost: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HintButton({ hintsRevealed, maxHints, onReveal, cost }: HintButtonProps) {
  const hintsRemaining = maxHints - hintsRevealed;
  const isDisabled = hintsRemaining <= 0;

  return (
    <motion.button
      onClick={onReveal}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-lg
        transition-colors duration-300 flex items-center gap-3
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
      {!isDisabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 blur-xl -z-10 animate-pulse" />
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 rounded-b-xl overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: '100%' }}
          animate={{ width: `${(hintsRemaining / maxHints) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.button>
  );
}
