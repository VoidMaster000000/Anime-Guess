'use client';

import { useEffect, useState, useRef } from 'react';
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from '@/lib/animations';

// ============================================================================
// TYPES
// ============================================================================

interface CoinDisplayProps {
  amount?: number; // Override the store amount if provided
  showAddButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    container: 'px-3 py-2',
    coinIcon: 'w-5 h-5',
    plusIcon: 'w-4 h-4',
    amountText: 'text-lg',
    labelText: 'text-xs',
    buttonPadding: 'p-1',
  },
  md: {
    container: 'px-4 py-3',
    coinIcon: 'w-6 h-6',
    plusIcon: 'w-5 h-5',
    amountText: 'text-2xl',
    labelText: 'text-sm',
    buttonPadding: 'p-2',
  },
  lg: {
    container: 'px-6 py-4',
    coinIcon: 'w-8 h-8',
    plusIcon: 'w-6 h-6',
    amountText: 'text-3xl',
    labelText: 'text-base',
    buttonPadding: 'p-3',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function CoinDisplay({
  amount: propAmount,
  showAddButton = false,
  size = 'md',
  animated = true,
}: CoinDisplayProps) {
  const router = useRouter();
  const { user } = useAuth();
  const storeCoins = user?.profile?.coins ?? 0;
  const coins = propAmount !== undefined ? propAmount : storeCoins;

  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isIncreasing, setIsIncreasing] = useState(false);

  const coinIconRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  const config = SIZE_CONFIG[size];

  // Animate coin counter when amount changes
  useEffect(() => {
    if (!animated) {
      setDisplayCoins(coins);
      return;
    }

    const diff = coins - displayCoins;

    if (diff === 0) return;

    // Trigger increase animation
    if (diff > 0) {
      setIsIncreasing(true);

      // Animate coin icon with CSS
      if (coinIconRef.current) {
        coinIconRef.current.style.transition = 'transform 600ms ease-out';
        coinIconRef.current.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => {
          if (coinIconRef.current) {
            coinIconRef.current.style.transform = 'scale(1) rotate(0deg)';
          }
        }, 300);
      }

      // Animate amount with CSS
      if (amountRef.current) {
        amountRef.current.style.transition = 'transform 300ms ease-out';
        amountRef.current.style.transform = 'scale(1.1)';
        setTimeout(() => {
          if (amountRef.current) {
            amountRef.current.style.transform = 'scale(1)';
          }
        }, 150);
      }

      // Animate pulse with CSS
      if (pulseRef.current) {
        pulseRef.current.style.transition = 'transform 600ms ease-out, opacity 600ms ease-out';
        pulseRef.current.style.transform = 'scale(2)';
        pulseRef.current.style.opacity = '0';
      }

      setTimeout(() => setIsIncreasing(false), 600);
    }

    // Animate the counter
    const duration = Math.min(1000, Math.abs(diff) * 10);
    const steps = 20;
    const increment = diff / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;

      if (currentStep >= steps) {
        setDisplayCoins(coins);
        clearInterval(interval);
      } else {
        setDisplayCoins((prev) => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [coins, animated]);

  const handleAddClick = () => {
    router.push('/shop');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/20 ${config.container} flex items-center gap-3`}
    >
      {/* Coin Icon with shine effect */}
      <div className="relative">
        <motion.div
          ref={coinIconRef}
          animate={isIncreasing ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Coins className={`${config.coinIcon} text-yellow-500`} />
        </motion.div>

        {/* Pulse effect on increase */}
        <AnimatePresence>
          {isIncreasing && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-yellow-500"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Coin Amount */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`${config.labelText} text-zinc-400 leading-tight`}>
          Coins
        </span>
        <motion.span
          ref={amountRef}
          animate={isIncreasing ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`${config.amountText} font-bold text-yellow-500 tabular-nums leading-tight`}
        >
          {Math.floor(displayCoins).toLocaleString()}
        </motion.span>
      </div>

      {/* Add Button */}
      {showAddButton && (
        <motion.button
          onClick={handleAddClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${config.buttonPadding} bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-colors duration-200 flex-shrink-0`}
        >
          <Plus className={`${config.plusIcon} text-yellow-500`} />
        </motion.button>
      )}

      {/* Floating coins animation on increase */}
      <AnimatePresence>
        {isIncreasing && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: (i - 1) * 20, scale: 1 }}
                animate={{ opacity: 0, y: -50 - i * 10, x: (i - 1) * 20, scale: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className="absolute left-4 top-1/2 pointer-events-none"
              >
                <TrendingUp className="w-4 h-4 text-yellow-500" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// COIN TRANSACTION COMPONENT (Shows change in coins)
// ============================================================================

interface CoinTransactionProps {
  amount: number;
  type: 'gain' | 'loss';
  onComplete?: () => void;
}

export function CoinTransaction({ amount, type, onComplete }: CoinTransactionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 ${
        type === 'gain'
          ? 'bg-green-500/20 border-green-500/50'
          : 'bg-red-500/20 border-red-500/50'
      }`}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: type === 'gain' ? 360 : -360 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Coins className={`w-6 h-6 ${type === 'gain' ? 'text-green-400' : 'text-red-400'}`} />
      </motion.div>
      <span className={`text-xl font-bold ${type === 'gain' ? 'text-green-400' : 'text-red-400'}`}>
        {type === 'gain' ? '+' : '-'}{amount.toLocaleString()}
      </span>
    </motion.div>
  );
}
