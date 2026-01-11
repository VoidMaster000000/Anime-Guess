'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Coins, CheckCircle2, XCircle, Sparkles, Star, Zap, Gift, TrendingUp, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SHOP_ITEMS } from '@/store/gameStore';
import { useAuth, purchaseItem as purchaseItemApi } from '@/hooks/useAuth';
import { motion, AnimatePresence, staggerContainer, staggerItem, scaleInBounce } from '@/lib/animations';
import UpgradeCard from '@/components/shop/UpgradeCard';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

// Floating Coin Animation
function FloatingCoins() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '100%', x: `${15 + i * 15}%`, opacity: 0, rotate: 0 }}
          animate={{
            y: [null, '-20%'],
            opacity: [0, 0.6, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'linear',
          }}
          className="absolute"
        >
          <Coins className="w-6 h-6 text-yellow-500/30" />
        </motion.div>
      ))}
    </div>
  );
}

// Notification Toast with Animation
function NotificationToast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl max-w-md
        ${notification.type === 'success'
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/30'
          : 'bg-gradient-to-r from-red-500/20 to-rose-500/10 border-red-500/30'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
        </motion.div>
        <p className={notification.type === 'success' ? 'text-green-200' : 'text-red-200'}>
          {notification.message}
        </p>
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useAuth();

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

  const handlePurchase = async (item: typeof SHOP_ITEMS[0]) => {
    if (!isAuthenticated || !user) {
      setNotification({ type: 'error', message: 'Please login to purchase items.' });
      return;
    }

    if (displayCoins < item.cost) {
      setNotification({ type: 'error', message: 'Not enough coins!' });
      return;
    }

    setIsPurchasing(true);

    try {
      const result = await purchaseItemApi(item.id, 1);

      if (result.success) {
        await refreshUser();
        setNotification({ type: 'success', message: `${item.name} added to inventory!` });
      } else {
        setNotification({ type: 'error', message: result.error || 'Purchase failed. Please try again.' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setNotification({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const isItemDisabled = (item: typeof SHOP_ITEMS[0]): boolean => {
    if (!isAuthenticated || !user) return true;
    if (isPurchasing) return true;
    if (displayCoins < item.cost) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white relative overflow-hidden">
      {/* Floating Coins Background */}
      <FloatingCoins />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Header Navigation */}
          <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:border-purple-500/30 hover:text-white transition-all duration-150 hover:scale-105 hover:-translate-x-0.5 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Back to Game</span>
              <span className="sm:hidden font-medium">Back</span>
            </button>

            {/* Coins Display - Hero Style */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-2xl" />
              <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Coins className="w-7 h-7 text-yellow-400" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Your Balance</span>
                  <span className="text-2xl font-black text-yellow-400 tabular-nums">
                    {Math.round(animatedCoins).toLocaleString()}
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-yellow-500/50" />
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={staggerItem} className="text-center mb-8">
            <div className="flex-center gap-3 mb-3">
              <motion.div variants={scaleInBounce} className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
              </motion.div>
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Power-Up Shop
                  </span>
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base mt-1">
                  Boost your gameplay with special items
                </p>
              </div>
            </div>
          </motion.div>

          {/* Auth Status */}
          <motion.div variants={staggerItem} className="mb-6">
            {!isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-orange-300 font-medium">Login Required</p>
                    <p className="text-orange-400/70 text-sm">Sign in to purchase items from the shop</p>
                  </div>
                  <Link href="/login" className="ml-auto px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium hover:bg-orange-500/30 transition-all">
                    Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-purple-300 font-medium">Items Synced to Your Account</p>
                    <p className="text-purple-400/70 text-sm">Use them during gameplay from the Quick Use panel</p>
                  </div>
                  <Link href="/inventory" className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Inventory
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={staggerItem} className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Gift, label: 'Items Available', value: SHOP_ITEMS.length, color: 'purple' },
              { icon: Star, label: 'Special Offers', value: '0', color: 'yellow' },
              { icon: TrendingUp, label: 'Best Value', value: 'Hints', color: 'green' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10 border border-${stat.color}-500/30 text-center`}
              >
                <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
                <p className={`text-lg sm:text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Shop Items Grid */}
          <motion.div variants={staggerItem} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Available Items</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {SHOP_ITEMS.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <UpgradeCard
                    item={item}
                    onPurchase={() => handlePurchase(item)}
                    disabled={isItemDisabled(item)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How to Earn Coins Section */}
          <motion.div
            variants={staggerItem}
            className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-gradient-to-r from-yellow-500/10 to-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">How to Earn Coins</h2>
                  <p className="text-zinc-400 text-sm">Multiple ways to grow your balance</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {[
                {
                  icon: '🎯',
                  title: 'Correct Guesses',
                  description: 'Earn coins by correctly guessing characters. Use fewer hints for more coins!',
                  color: 'purple',
                },
                {
                  icon: '⚡',
                  title: 'Difficulty Bonuses',
                  description: 'Higher difficulty levels provide coin bonuses for greater rewards.',
                  color: 'orange',
                },
                {
                  icon: '🔥',
                  title: 'Build Streaks',
                  description: 'Maintain winning streaks to earn XP and level up for bonus coins!',
                  color: 'cyan',
                },
              ].map((tip, i) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`p-4 rounded-xl bg-gradient-to-br from-${tip.color}-500/10 to-${tip.color}-600/5 border border-${tip.color}-500/20 hover:border-${tip.color}-500/40 transition-all`}
                >
                  <span className="text-2xl mb-2 block">{tip.icon}</span>
                  <h3 className={`font-bold text-${tip.color}-400 mb-1`}>{tip.title}</h3>
                  <p className="text-zinc-400 text-sm">{tip.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <NotificationToast
            notification={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
