'use client';

import { useEffect, useState } from 'react';
import { Eye, Heart, SkipForward, HelpCircle, Package, Sparkles } from 'lucide-react';
import { useAuth, fetchInventory, useInventoryItem, InventoryItem } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';

interface ItemUsagePanelProps {
  onItemUse?: (itemId: string) => void;
}

// Simple panel wrapper - no animation to prevent flickering on mobile
function AnimatedPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Hover scale button - uses CSS for better mobile performance
function HoverButton({
  children,
  onClick,
  disabled,
  className,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  className: string;
  'aria-label'?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} transition-transform duration-100 ${!disabled ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// Used animation overlay (CSS-based)
function UsedOverlay({ show }: { show: boolean }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show && !isAnimating) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center rounded-lg bg-green-500/20 border border-green-500/50 transition-all duration-500 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
    >
      <span className="text-green-400 font-bold">Used!</span>
    </div>
  );
}

export default function ItemUsagePanel({ onItemUse }: ItemUsagePanelProps) {
  const { isAuthenticated } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const gameStatus = useGameStore((state) => state.gameStatus);
  const revealHint = useGameStore((state) => state.revealHint);
  const hintsRevealed = useGameStore((state) => state.hintsRevealed);
  const maxHints = useGameStore((state) => state.maxHints);
  const lives = useGameStore((state) => state.lives);
  const maxLives = useGameStore((state) => state.maxLives);
  const fetchNewCharacter = useGameStore((state) => state.fetchNewCharacter);

  const [usedItemAnimation, setUsedItemAnimation] = useState<string | null>(null);

  // Fetch inventory from MongoDB API
  useEffect(() => {
    if (isAuthenticated && gameStatus === 'playing') {
      fetchInventory().then(setInventory);
    }
  }, [isAuthenticated, gameStatus]);

  // Filter items that can be used during gameplay
  const usableItems = inventory.filter(
    (item) => item.type === 'hint' || item.type === 'skip' || item.type === 'life'
  );

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hint':
        return <Eye className="w-5 h-5" />;
      case 'life':
        return <Heart className="w-5 h-5" />;
      case 'skip':
        return <SkipForward className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'hint':
        return 'from-purple-500 to-pink-500';
      case 'life':
        return 'from-red-500 to-pink-500';
      case 'skip':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const canUseItem = (item: { id: string; type: string }) => {
    if (gameStatus !== 'playing') return false;

    switch (item.type) {
      case 'hint':
        // Respect maxHints (which accounts for difficulty + extra hints owned)
        return hintsRevealed < maxHints;
      case 'life':
        return lives < maxLives;
      case 'skip':
        return true;
      default:
        return false;
    }
  };

  const handleUseItem = async (item: { id: string; itemId: string; type: string; name: string }) => {
    if (!canUseItem(item)) return;

    // Use the item via MongoDB API
    const result = await useInventoryItem(item.itemId, 1);

    if (result.success) {
      // Update local inventory state
      setInventory(prev => prev.map(i =>
        i.itemId === item.itemId
          ? { ...i, quantity: result.remainingQuantity ?? i.quantity - 1 }
          : i
      ).filter(i => i.quantity > 0));

      // Trigger animation
      setUsedItemAnimation(item.id);
      setTimeout(() => setUsedItemAnimation(null), 1000);

      // Apply the item effect
      switch (item.type) {
        case 'hint':
          revealHint();
          break;
        case 'life':
          // Directly increment lives in game store
          useGameStore.setState((state) => ({
            lives: Math.min(state.lives + 1, state.maxLives),
          }));
          break;
        case 'skip':
          await fetchNewCharacter();
          break;
      }

      // Callback for parent component
      if (onItemUse) {
        onItemUse(item.id);
      }
    }
  };

  // Don't show if not authenticated or not playing
  if (!isAuthenticated || gameStatus !== 'playing') {
    return null;
  }

  // Don't show if no usable items
  if (usableItems.length === 0) {
    return (
      <AnimatedPanel className="bg-zinc-800/30 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/30">
        <div className="flex items-center gap-2 text-zinc-500">
          <Package className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm">No items in inventory</span>
        </div>
        <p className="text-xs text-zinc-600 mt-1">
          Purchase items from the shop to use during gameplay
        </p>
      </AnimatedPanel>
    );
  }

  return (
    <AnimatedPanel className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-white" id="quick-use-items-heading">Quick Use Items</h3>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="quick-use-items-heading">
        {usableItems.map((item) => {
          const isDisabled = !canUseItem(item);
          const isAnimating = usedItemAnimation === item.id;

          return (
            <HoverButton
              key={item.id}
              onClick={() => handleUseItem(item)}
              disabled={isDisabled}
              className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                isDisabled
                  ? 'bg-zinc-800/30 border-zinc-700/30 cursor-not-allowed opacity-50'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700/50 cursor-pointer'
              }`}
              aria-label={`Use ${item.name}. ${item.quantity} remaining. ${item.type === 'hint' ? `Reveal hint (${hintsRevealed}/${maxHints} revealed)` : item.type === 'life' ? `Add life (${lives}/${maxLives} lives)` : 'Skip character'}`}
            >
              {/* Item Icon */}
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${getItemColor(item.type)} ${
                  isDisabled ? 'opacity-50' : ''
                }`}
                aria-hidden="true"
              >
                {getItemIcon(item.type)}
              </div>

              {/* Item Info */}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-zinc-400">
                  {item.type === 'hint' && `Reveal hint (${hintsRevealed}/${maxHints} revealed)`}
                  {item.type === 'life' && `Add life (${lives}/${maxLives} lives)`}
                  {item.type === 'skip' && 'Skip character'}
                </p>
              </div>

              {/* Quantity Badge */}
              <div className="flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-zinc-700 text-white text-sm font-bold">
                {item.quantity}
              </div>

              {/* Used Animation */}
              <UsedOverlay show={isAnimating} />
            </HoverButton>
          );
        })}
      </div>

      {/* Disabled Info */}
      {usableItems.some((item) => !canUseItem(item)) && (
        <p className="text-xs text-zinc-500 mt-3">
          Some items cannot be used (hints maxed or lives full)
        </p>
      )}
    </AnimatedPanel>
  );
}
