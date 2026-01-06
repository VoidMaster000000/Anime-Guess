'use client';

import { useState, useRef, useEffect } from 'react';
import { animate } from '@/lib/animejs';
import {
  ArrowLeft,
  Package,
  Eye,
  SkipForward,
  Heart,
  Zap,
  Sparkles,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchInventory, InventoryItem } from '@/hooks/useAuth';
import CoinDisplay from '@/components/profile/CoinDisplay';

// ============================================================================
// TYPES
// ============================================================================

type ItemCategory = 'all' | 'hints' | 'skips' | 'lives' | 'boosters' | 'cosmetics';

interface InventoryItemDisplay {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  icon: any; // Lucide icon component
  isUsable: boolean;
  effect?: string;
}

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

function AnimatedSection({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: delay,
        ease: 'outQuad',
      });
    }
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

function HoverScaleButton({
  children,
  onClick,
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 1.02, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 0.98, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 1.02, duration: 100, ease: 'outQuad' });
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

function HoverCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: delay,
        ease: 'outQuad',
      });
    }
  }, [delay]);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.03, translateY: -4, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, translateY: 0, duration: 200, ease: 'outQuad' });
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 200,
        ease: 'outQuad',
      });
    }
    if (contentRef.current) {
      animate(contentRef.current, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 200,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      style={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: { id: ItemCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'All Items', icon: Package },
  { id: 'hints', label: 'Hints', icon: Eye },
  { id: 'skips', label: 'Skips', icon: SkipForward },
  { id: 'lives', label: 'Lives', icon: Heart },
  { id: 'boosters', label: 'Boosters', icon: Zap },
  { id: 'cosmetics', label: 'Cosmetics', icon: Sparkles },
];

const RARITY_COLORS = {
  common: {
    gradient: 'from-zinc-500/20 to-zinc-600/20',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    glow: 'shadow-zinc-500/20',
  },
  uncommon: {
    gradient: 'from-green-500/20 to-green-600/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  rare: {
    gradient: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  epic: {
    gradient: 'from-purple-500/20 to-purple-600/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  legendary: {
    gradient: 'from-yellow-500/20 to-orange-600/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItemDisplay | null>(null);
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);

  // Fetch inventory from MongoDB API
  useEffect(() => {
    fetchInventory().then(setInventory);
  }, []);

  // Convert API inventory to display format
  const displayInventory: InventoryItemDisplay[] = inventory.map((item) => {
    // Map to display format with icons
    const iconMap: Record<string, any> = {
      eye: Eye,
      'skip-forward': SkipForward,
      heart: Heart,
      zap: Zap,
      sparkles: Sparkles,
    };

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      category: (item.type === 'hint' ? 'hints' : item.type === 'skip' ? 'skips' : item.type === 'life' ? 'lives' : item.type === 'booster' ? 'boosters' : 'cosmetics') as ItemCategory,
      rarity: 'common' as const,
      quantity: item.quantity,
      icon: iconMap[item.icon] || Package,
      isUsable: item.type !== 'cosmetic',
      effect: item.effect ? `${item.effect.type}: ${item.effect.value}` : 'Use this item in-game',
    };
  });

  // Use actual inventory only - no mock data fallback
  const items = displayInventory;

  // Filter items by category
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const handleUseItem = (item: InventoryItemDisplay) => {
    setSelectedItem(item);
    setIsUseModalOpen(true);
  };

  const confirmUseItem = () => {
    if (selectedItem) {
      // TODO: Implement actual item usage logic
      console.log('Using item:', selectedItem.id);
      setIsUseModalOpen(false);
      setSelectedItem(null);
    }
  };

  const cancelUseItem = () => {
    setIsUseModalOpen(false);
    setSelectedItem(null);
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
        <AnimatedSection className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            {/* Coins Display */}
            <CoinDisplay showAddButton size="md" />
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <Package className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Inventory</h1>
              <p className="text-zinc-400 mt-1">
                Manage and use your collected items
              </p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <HoverScaleButton
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-500'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </HoverScaleButton>
            ))}
          </div>
        </AnimatedSection>

        {/* Inventory Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => {
              const rarityStyle = RARITY_COLORS[item.rarity];
              const Icon = item.icon;

              return (
                <HoverCard
                  key={item.id}
                  delay={index * 50}
                  className={`group relative bg-gradient-to-br ${rarityStyle.gradient} backdrop-blur-sm rounded-xl border ${rarityStyle.border} p-6 hover:shadow-xl ${rarityStyle.glow} transition-all duration-300`}
                >
                  {/* Quantity Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 bg-zinc-900/80 backdrop-blur-sm rounded-full border ${rarityStyle.border}`}>
                    <span className={`text-sm font-bold ${rarityStyle.text}`}>
                      x{item.quantity}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 mb-4 bg-zinc-900/50 rounded-xl border ${rarityStyle.border} flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${rarityStyle.text}`} />
                  </div>

                  {/* Item Info */}
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.name}
                  </h3>
                  <p className={`text-xs font-semibold uppercase mb-2 ${rarityStyle.text}`}>
                    {item.rarity}
                  </p>
                  <p className="text-sm text-zinc-400 mb-4">
                    {item.description}
                  </p>

                  {/* Effect on hover */}
                  {item.effect && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-3">
                      <div className="flex items-start gap-2 text-xs text-zinc-500">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{item.effect}</span>
                      </div>
                    </div>
                  )}

                  {/* Use Button */}
                  {item.isUsable && (
                    <HoverScaleButton
                      onClick={() => handleUseItem(item)}
                      className={`w-full px-4 py-2 bg-gradient-to-r ${rarityStyle.gradient} border ${rarityStyle.border} rounded-lg ${rarityStyle.text} font-medium hover:brightness-125 transition-all`}
                    >
                      Use Item
                    </HoverScaleButton>
                  )}
                </HoverCard>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <AnimatedSection className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-700 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Items Found</h2>
            <p className="text-zinc-400 mb-6">
              {selectedCategory === 'all'
                ? "Your inventory is empty. Visit the shop to purchase items!"
                : `You don't have any ${selectedCategory} items yet.`}
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all"
            >
              Visit Shop
            </button>
          </AnimatedSection>
        )}
      </div>

      {/* Use Item Confirmation Modal */}
      {isUseModalOpen && selectedItem && (
        <ModalOverlay onClose={cancelUseItem}>
          <div className={`bg-gradient-to-br ${RARITY_COLORS[selectedItem.rarity].gradient} border ${RARITY_COLORS[selectedItem.rarity].border} rounded-2xl p-8 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-zinc-900/50 rounded-lg border ${RARITY_COLORS[selectedItem.rarity].border}`}>
                  <selectedItem.icon className={`w-6 h-6 ${RARITY_COLORS[selectedItem.rarity].text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
                  <p className={`text-sm font-semibold uppercase ${RARITY_COLORS[selectedItem.rarity].text}`}>
                    {selectedItem.rarity}
                  </p>
                </div>
              </div>
              <button
                onClick={cancelUseItem}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-zinc-300 mb-4">{selectedItem.description}</p>
              {selectedItem.effect && (
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                  <p className="text-sm text-zinc-400">
                    <span className="font-semibold text-white">Effect:</span> {selectedItem.effect}
                  </p>
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                <Package className="w-4 h-4" />
                <span>Quantity remaining: <span className="font-bold text-white">{selectedItem.quantity}</span></span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  This action will consume one {selectedItem.name}. Make sure you're in an active game to use it!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelUseItem}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors border border-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmUseItem}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${RARITY_COLORS[selectedItem.rarity].gradient} border ${RARITY_COLORS[selectedItem.rarity].border} hover:brightness-125 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2`}
              >
                <Check className="w-5 h-5" />
                Use Item
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
