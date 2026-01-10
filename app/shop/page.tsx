'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShoppingBag, Coins, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SHOP_ITEMS } from '@/store/gameStore';
import { useAuth, purchaseItem as purchaseItemApi } from '@/hooks/useAuth';
import { ShopItemType } from '@/types';
import UpgradeCard from '@/components/shop/UpgradeCard';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

// CSS-based animated wrapper
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {children}
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();

  // Use auth hook for MongoDB-backed authentication
  const { isAuthenticated, user, refreshUser } = useAuth();

  // Use MongoDB coins only
  const displayCoins = user ? user.profile.coins : 0;

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
    // Check if user is authenticated with MongoDB
    if (!isAuthenticated || !user) {
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

    setIsPurchasing(true);

    try {
      // Use MongoDB API for purchase
      const result = await purchaseItemApi(item.id, 1);

      if (result.success) {
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
    // Check if user is authenticated with MongoDB
    if (!isAuthenticated || !user) return true;

    // Check if currently purchasing
    if (isPurchasing) return true;

    // Check coins
    if (displayCoins < item.cost) return true;

    // All items are consumables and can be purchased
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Gaming Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="bg-hex-pattern" />
        <div className="orb-gaming orb-purple -top-32 left-1/3" />
        <div className="orb-gaming orb-cyan bottom-0 -right-20" />
        <div className="orb-gaming orb-pink top-1/3 -left-20" />
        <div className="scan-line" />
        <div className="tech-lines" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <AnimatedSection className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-3">
            <button
              onClick={() => router.back()}
              className="btn btn-secondary text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium hidden sm:inline">Back to Game</span>
              <span className="font-medium sm:hidden">Back</span>
            </button>

            {/* Coins Display */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 stat-yellow">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-zinc-400">Your Coins</span>
                <span className="text-lg sm:text-2xl font-bold text-yellow-500 tabular-nums">
                  {Math.round(animatedCoins)}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-3 stat-purple">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Shop</h1>
              <p className="text-xs sm:text-base text-zinc-400 mt-0.5 sm:mt-1">
                Purchase upgrades and power-ups to enhance your gameplay
              </p>
            </div>
          </div>

          {/* Auth status indicator */}
          {!isAuthenticated && (
            <div className="mt-4 px-4 py-2 stat-orange">
              <p className="text-orange-400 text-sm">
                Please login to purchase items from the shop.
              </p>
            </div>
          )}
          {isAuthenticated && (
            <div className="mt-4 px-4 py-2 stat-purple">
              <p className="text-purple-400 text-sm">
                Items are synced to your account! Use them during gameplay from the Quick Use panel.
              </p>
            </div>
          )}
        </AnimatedSection>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
          {SHOP_ITEMS.map((item, index) => (
            <AnimatedSection
              key={item.id}
              delay={index * 100}
            >
              <UpgradeCard
                item={item}
                onPurchase={() => handlePurchase(item)}
                disabled={isItemDisabled(item)}
              />
            </AnimatedSection>
          ))}
        </div>

        {/* Info Section */}
        <AnimatedSection delay={400} className="card card-padding">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">How to Earn Coins</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm text-zinc-400">
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
        </AnimatedSection>
      </div>

      {/* Notification Toast */}
      {notification && (
        <NotificationToast notification={notification} />
      )}
    </div>
  );
}

// Helper Component
function NotificationToast({ notification }: { notification: { type: 'success' | 'error'; message: string } }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on next frame
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`fixed top-8 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl border max-w-md transition-all duration-150 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
      style={{
        transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(-20px)'}`,
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
