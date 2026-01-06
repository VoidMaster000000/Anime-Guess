'use client';

import { useState, useEffect, useRef } from 'react';
import { Animated, AnimatePresence } from '@/lib/animejs';
import { animate } from '@/lib/animejs';
import { ArrowLeft, ShoppingBag, Coins, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameStore, SHOP_ITEMS } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
import { useAuth, purchaseItem as purchaseItemApi } from '@/hooks/useAuth';
import { ShopItemType } from '@/types';
import UpgradeCard from '@/components/shop/UpgradeCard';

const MAX_EXTRA_HINTS = 5;

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function ShopPage() {
  const router = useRouter();

  // Use auth hook for MongoDB-backed authentication
  const { isAuthenticated, user, refreshUser } = useAuth();

  // Use coins from profile store instead of points from game store
  const localIsAuthenticated = useProfileStore((state) => state.isAuthenticated);
  const coins = useProfileStore((state) => state.coins);
  const spendCoins = useProfileStore((state) => state.spendCoins);
  const addItem = useProfileStore((state) => state.addItem);

  // Use MongoDB coins if authenticated, otherwise local coins
  const displayCoins = isAuthenticated && user ? user.profile.coins : coins;

  // Still need some game store values for item availability
  const extraHintsOwned = useGameStore((state) => state.extraHintsOwned);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);
  const lives = useGameStore((state) => state.lives);
  const maxLives = useGameStore((state) => state.maxLives);
  const hintsRevealed = useGameStore((state) => state.hintsRevealed);

  const [notification, setNotification] = useState<Notification | null>(null);
  const [animatedCoins, setAnimatedCoins] = useState(displayCoins);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Animate coins counter
  useEffect(() => {
    const diff = displayCoins - animatedCoins;
    if (diff !== 0) {
      const increment = diff / 10;
      const timer = setInterval(() => {
        setAnimatedCoins((prev) => {
          const next = prev + increment;
          if ((increment > 0 && next >= displayCoins) || (increment < 0 && next <= displayCoins)) {
            clearInterval(timer);
            return displayCoins;
          }
          return next;
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [displayCoins, animatedCoins]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePurchase = async (item: typeof SHOP_ITEMS[0]) => {
    // Check if user is authenticated (either MongoDB or local)
    const effectivelyAuthenticated = isAuthenticated || localIsAuthenticated;

    if (!effectivelyAuthenticated) {
      setNotification({
        type: 'error',
        message: 'Please login to purchase items.',
      });
      return;
    }

    // Check if user has enough coins
    if (displayCoins < item.cost) {
      setNotification({
        type: 'error',
        message: 'Not enough coins.',
      });
      return;
    }

    // Determine item type for inventory
    const getInventoryType = (shopType: ShopItemType): 'hint' | 'skip' | 'life' | 'booster' => {
      switch (shopType) {
        case ShopItemType.HINT_REVEAL:
        case ShopItemType.EXTRA_HINT:
        case ShopItemType.TEXT_HINT:
          return 'hint';
        case ShopItemType.SKIP:
          return 'skip';
        case ShopItemType.EXTRA_LIFE:
          return 'life';
        default:
          return 'booster';
      }
    };

    setIsPurchasing(true);

    try {
      // If authenticated with MongoDB, use the API
      if (isAuthenticated) {
        const result = await purchaseItemApi(item.id, 1);

        if (result.success) {
          // Also add to local inventory for immediate use
          addItem({
            id: item.id,
            name: item.name,
            description: item.description,
            type: getInventoryType(item.type),
            icon: item.icon,
          }, 1);

          // Refresh user data to get updated coins
          await refreshUser();

          setNotification({
            type: 'success',
            message: `${item.name} added to inventory! Use it during gameplay.`,
          });
        } else {
          setNotification({
            type: 'error',
            message: result.error || 'Purchase failed. Please try again.',
          });
        }
      } else {
        // Fall back to local purchase for non-MongoDB users
        // For consumables, add directly to inventory (can be used during gameplay)
        if (item.type === ShopItemType.HINT_REVEAL ||
            item.type === ShopItemType.SKIP ||
            item.type === ShopItemType.EXTRA_LIFE ||
            item.type === ShopItemType.TEXT_HINT) {

          // Deduct coins
          const coinsSpent = spendCoins(item.cost);

          if (coinsSpent) {
            // Add to inventory for later use
            addItem({
              id: item.id,
              name: item.name,
              description: item.description,
              type: getInventoryType(item.type),
              icon: item.icon,
            }, 1);

            setNotification({
              type: 'success',
              message: `${item.name} added to inventory! Use it during gameplay.`,
            });
          } else {
            setNotification({
              type: 'error',
              message: 'Failed to deduct coins. Please try again.',
            });
          }
        } else {
          // For permanent upgrades (like extra hint slots), use game store
          const success = purchaseUpgrade(item);

          if (success) {
            const coinsSpent = spendCoins(item.cost);

            if (coinsSpent) {
              setNotification({
                type: 'success',
                message: `Successfully purchased ${item.name}!`,
              });
            } else {
              setNotification({
                type: 'error',
                message: 'Failed to deduct coins. Please try again.',
              });
            }
          } else {
            let errorMessage = 'Purchase failed. ';

            if (item.type === ShopItemType.EXTRA_HINT && extraHintsOwned >= MAX_EXTRA_HINTS) {
              errorMessage += 'Maximum hint slots owned.';
            } else {
              errorMessage += 'Unknown error.';
            }

            setNotification({
              type: 'error',
              message: errorMessage,
            });
          }
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setNotification({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const isItemDisabled = (item: typeof SHOP_ITEMS[0]): boolean => {
    // Check if user is authenticated (either MongoDB or local)
    const effectivelyAuthenticated = isAuthenticated || localIsAuthenticated;
    if (!effectivelyAuthenticated) return true;

    // Check if currently purchasing
    if (isPurchasing) return true;

    // Check coins
    if (displayCoins < item.cost) return true;

    // Check specific item limits for permanent upgrades
    switch (item.type) {
      case ShopItemType.EXTRA_HINT:
        if (extraHintsOwned >= MAX_EXTRA_HINTS) return true;
        break;
    }

    // Consumables can always be purchased and stored in inventory
    return false;
  };

  const getOwnedCount = (item: typeof SHOP_ITEMS[0]): number | undefined => {
    if (item.type === ShopItemType.HINT_REVEAL && item.maxOwned) {
      return extraHintsOwned;
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Animated
          initial={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Game</span>
            </button>

            {/* Coins Display */}
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl border border-yellow-500/20">
              <Coins className="w-6 h-6 text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400">Your Coins</span>
                <span className="text-2xl font-bold text-yellow-500 tabular-nums">
                  {Math.round(animatedCoins)}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <ShoppingBag className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Shop</h1>
              <p className="text-zinc-400 mt-1">
                Purchase upgrades and power-ups to enhance your gameplay
              </p>
            </div>
          </div>

          {/* Auth and game status indicators */}
          {!(isAuthenticated || localIsAuthenticated) && (
            <div className="mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-orange-400 text-sm">
                Please login to purchase items from the shop.
              </p>
            </div>
          )}
          {(isAuthenticated || localIsAuthenticated) && (
            <div className="mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-400 text-sm">
                {isAuthenticated
                  ? 'Items are synced to your account! Use them during gameplay from the Quick Use panel.'
                  : 'Items are added to your inventory. Use them during gameplay from the Quick Use panel!'}
              </p>
            </div>
          )}
        </Animated>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {SHOP_ITEMS.map((item, index) => (
            <Animated
              key={item.id}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <UpgradeCard
                item={item}
                onPurchase={() => handlePurchase(item)}
                disabled={isItemDisabled(item)}
                owned={getOwnedCount(item)}
              />
            </Animated>
          ))}
        </div>

        {/* Info Section */}
        <Animated
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 400 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-3">How to Earn Coins</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
            <div>
              <div className="font-semibold text-purple-400 mb-1">Correct Guesses</div>
              <p>Earn coins by correctly guessing characters. Use fewer hints for more coins!</p>
            </div>
            <div>
              <div className="font-semibold text-purple-400 mb-1">Difficulty Bonuses</div>
              <p>Higher difficulty levels provide coin bonuses for greater rewards.</p>
            </div>
            <div>
              <div className="font-semibold text-purple-400 mb-1">Build Streaks</div>
              <p>Maintain winning streaks to earn XP and level up for bonus coins!</p>
            </div>
          </div>
        </Animated>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <NotificationToast notification={notification} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Component
function NotificationToast({ notification }: { notification: { type: 'success' | 'error'; message: string } }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [-50, 0],
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-8 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl border max-w-md"
      style={{
        opacity: 0,
        transform: 'translateX(-50%)',
        background: notification.type === 'success'
          ? 'linear-gradient(to right, rgb(16 185 129 / 0.1), rgb(5 150 105 / 0.1))'
          : 'linear-gradient(to right, rgb(239 68 68 / 0.1), rgb(220 38 38 / 0.1))',
        borderColor: notification.type === 'success'
          ? 'rgb(16 185 129 / 0.3)'
          : 'rgb(239 68 68 / 0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        {notification.type === 'success' ? (
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        )}
        <p className={notification.type === 'success' ? 'text-green-300' : 'text-red-300'}>
          {notification.message}
        </p>
      </div>
    </div>
  );
}
