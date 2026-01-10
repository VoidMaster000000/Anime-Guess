'use client';

import { useEffect, useState, useRef } from 'react';
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
// ANIMATED COMPONENTS (CSS-based)
// ============================================================================

function AnimatedContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`${className} transition-all duration-400 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {children}
    </div>
  );
}

function HoverButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`${className} transition-transform duration-150 hover:scale-105 active:scale-95`}
    >
      {children}
    </button>
  );
}

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
    <AnimatedContainer className={`relative bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/20 ${config.container} flex items-center gap-3`}>
      {/* Coin Icon with shine effect */}
      <div className="relative">
        <div ref={coinIconRef}>
          <Coins className={`${config.coinIcon} text-yellow-500`} />
        </div>

        {/* Pulse effect on increase */}
        {isIncreasing && (
          <div
            ref={pulseRef}
            className="absolute inset-0 rounded-full border-2 border-yellow-500"
            style={{ opacity: 0 }}
          />
        )}
      </div>

      {/* Coin Amount */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`${config.labelText} text-zinc-400 leading-tight`}>
          Coins
        </span>
        <span
          ref={amountRef}
          className={`${config.amountText} font-bold text-yellow-500 tabular-nums leading-tight`}
        >
          {Math.floor(displayCoins).toLocaleString()}
        </span>
      </div>

      {/* Add Button */}
      {showAddButton && (
        <HoverButton
          onClick={handleAddClick}
          className={`${config.buttonPadding} bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-200 flex-shrink-0`}
        >
          <Plus className={`${config.plusIcon} text-yellow-500`} />
        </HoverButton>
      )}

      {/* Floating coins animation on increase */}
      {isIncreasing && (
        <FloatingCoins count={3} />
      )}
    </AnimatedContainer>
  );
}

// Floating coins component (CSS-based)
function FloatingCoins({ count }: { count: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <FloatingCoin key={i} index={i} />
      ))}
    </>
  );
}

function FloatingCoin({ index }: { index: number }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="absolute left-4 top-1/2 pointer-events-none transition-all duration-[800ms] ease-out"
      style={{
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating
          ? `translateY(${-50 - index * 10}px) translateX(${(index - 1) * 20}px) scale(0.5)`
          : `translateY(0) translateX(${(index - 1) * 20}px) scale(1)`,
      }}
    >
      <TrendingUp className="w-4 h-4 text-yellow-500" />
    </div>
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
  const [isVisible, setIsVisible] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
      setIsSpinning(true);
    });

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 transition-all duration-300 ease-out ${
        type === 'gain'
          ? 'bg-green-500/20 border-green-500/50'
          : 'bg-red-500/20 border-red-500/50'
      } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-80'}`}
    >
      <div
        className="transition-transform duration-600 ease-out"
        style={{ transform: isSpinning ? `rotate(${type === 'gain' ? 360 : -360}deg)` : 'rotate(0deg)' }}
      >
        <Coins className={`w-6 h-6 ${type === 'gain' ? 'text-green-400' : 'text-red-400'}`} />
      </div>
      <span className={`text-xl font-bold ${type === 'gain' ? 'text-green-400' : 'text-red-400'}`}>
        {type === 'gain' ? '+' : '-'}{amount.toLocaleString()}
      </span>
    </div>
  );
}
