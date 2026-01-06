'use client';

import { useEffect, useState, useRef } from 'react';
import { animate } from '@/lib/animejs';
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/store/profileStore';

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
// ANIMATED COMPONENTS
// ============================================================================

function AnimatedContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
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
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (ref.current) {
      animate(ref.current, { scale: 0.95, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 100, ease: 'outQuad' });
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
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
  const storeCoins = useProfileStore((state) => state.coins);
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

      // Animate coin icon
      if (coinIconRef.current) {
        animate(coinIconRef.current, {
          scale: [1, 1.3, 1],
          rotate: [0, 15, -15, 0],
          duration: 600,
          ease: 'outQuad',
        });
      }

      // Animate amount
      if (amountRef.current) {
        animate(amountRef.current, {
          scale: [1, 1.1, 1],
          duration: 300,
          ease: 'outQuad',
        });
      }

      // Animate pulse
      if (pulseRef.current) {
        animate(pulseRef.current, {
          scale: [1, 2],
          opacity: [0.5, 0],
          duration: 600,
          ease: 'outQuad',
        });
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

// Floating coins component
function FloatingCoins({ count }: { count: number }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    refs.current.forEach((ref, i) => {
      if (ref) {
        animate(ref, {
          opacity: [1, 0],
          translateY: [0, -50 - (i * 10)],
          translateX: [(i - 1) * 20, (i - 1) * 20],
          scale: [1, 0.5],
          duration: 800,
          delay: i * 100,
          ease: 'outQuad',
        });
      }
    });
  }, []);

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="absolute left-4 top-1/2 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <TrendingUp className="w-4 h-4 text-yellow-500" />
        </div>
      ))}
    </>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.8, 1],
        duration: 300,
        ease: 'outQuad',
      });
    }
    if (coinRef.current) {
      animate(coinRef.current, {
        rotate: type === 'gain' ? [0, 360] : [0, -360],
        duration: 600,
        ease: 'outQuad',
      });
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete, type]);

  return (
    <div
      ref={containerRef}
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 ${
        type === 'gain'
          ? 'bg-green-500/20 border-green-500/50'
          : 'bg-red-500/20 border-red-500/50'
      }`}
      style={{ opacity: 0 }}
    >
      <div ref={coinRef}>
        <Coins className={`w-6 h-6 ${type === 'gain' ? 'text-green-400' : 'text-red-400'}`} />
      </div>
      <span className={`text-xl font-bold ${type === 'gain' ? 'text-green-400' : 'text-red-400'}`}>
        {type === 'gain' ? '+' : '-'}{amount.toLocaleString()}
      </span>
    </div>
  );
}
