'use client';

import { useState, useEffect } from 'react';
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
// ANIMATED COMPONENTS (CSS-based)
// ============================================================================

function AnimatedSection({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 0.5);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
      }`}
    >
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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} transition-transform duration-100 ${!disabled ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 0.4);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
      } hover:scale-[1.03] hover:-translate-y-1`}
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-120 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`transition-all duration-150 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
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
      {/* Gaming Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="bg-hex-pattern" />
        <div className="orb-gaming orb-purple -top-32 left-1/4" />
        <div className="orb-gaming orb-cyan bottom-20 -right-20" />
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
              <span className="font-medium">Back</span>
            </button>

            {/* Coins Display */}
            <CoinDisplay showAddButton size="md" />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 stat-purple">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Inventory</h1>
              <p className="text-xs sm:text-base text-zinc-400 mt-0.5 sm:mt-1">
                Manage and use your collected items
              </p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CATEGORIES.map((category) => (
              <HoverScaleButton
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`btn text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 ${selectedCategory === category.id ? 'btn-gradient' : 'btn-secondary'}`}
              >
                <category.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.id === 'all' ? 'All' : category.label.split(' ')[0]}</span>
              </HoverScaleButton>
            ))}
          </div>
        </AnimatedSection>

        {/* Inventory Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {filteredItems.map((item, index) => {
              const rarityStyle = RARITY_COLORS[item.rarity];
              const Icon = item.icon;

              return (
                <HoverCard
                  key={item.id}
                  delay={index * 50}
                  className={`group relative bg-gradient-to-br ${rarityStyle.gradient} backdrop-blur-sm rounded-xl border ${rarityStyle.border} p-4 sm:p-6 hover:shadow-xl ${rarityStyle.glow} transition-all duration-300`}
                >
                  {/* Quantity Badge */}
                  <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-zinc-900/80 backdrop-blur-sm rounded-full border ${rarityStyle.border}`}>
                    <span className={`text-xs sm:text-sm font-bold ${rarityStyle.text}`}>
                      x{item.quantity}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-zinc-900/50 rounded-xl border ${rarityStyle.border} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${rarityStyle.text}`} />
                  </div>

                  {/* Item Info */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">
                    {item.name}
                  </h3>
                  <p className={`text-[10px] sm:text-xs font-semibold uppercase mb-1.5 sm:mb-2 ${rarityStyle.text}`}>
                    {item.rarity}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Effect on hover - visible on mobile */}
                  {item.effect && (
                    <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mb-2 sm:mb-3">
                      <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-zinc-500">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{item.effect}</span>
                      </div>
                    </div>
                  )}

                  {/* Use Button */}
                  {item.isUsable && (
                    <HoverScaleButton
                      onClick={() => handleUseItem(item)}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-gradient-to-r ${rarityStyle.gradient} border ${rarityStyle.border} rounded-lg ${rarityStyle.text} font-medium hover:brightness-125 transition-all`}
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
          <AnimatedSection className="card-glass p-6 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Items Found</h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6">
              {selectedCategory === 'all'
                ? "Your inventory is empty. Visit the shop to purchase items!"
                : `You don't have any ${selectedCategory} items yet.`}
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="btn btn-gradient px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              Visit Shop
            </button>
          </AnimatedSection>
        )}
      </div>

      {/* Use Item Confirmation Modal */}
      {isUseModalOpen && selectedItem && (
        <ModalOverlay onClose={cancelUseItem}>
          <div className={`bg-gradient-to-br ${RARITY_COLORS[selectedItem.rarity].gradient} border ${RARITY_COLORS[selectedItem.rarity].border} rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 bg-zinc-900/50 rounded-lg border ${RARITY_COLORS[selectedItem.rarity].border}`}>
                  <selectedItem.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${RARITY_COLORS[selectedItem.rarity].text}`} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">{selectedItem.name}</h2>
                  <p className={`text-xs sm:text-sm font-semibold uppercase ${RARITY_COLORS[selectedItem.rarity].text}`}>
                    {selectedItem.rarity}
                  </p>
                </div>
              </div>
              <button
                onClick={cancelUseItem}
                className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-zinc-300 mb-3 sm:mb-4">{selectedItem.description}</p>
              {selectedItem.effect && (
                <div className="p-3 sm:p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                  <p className="text-xs sm:text-sm text-zinc-400">
                    <span className="font-semibold text-white">Effect:</span> {selectedItem.effect}
                  </p>
                </div>
              )}
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Quantity remaining: <span className="font-bold text-white">{selectedItem.quantity}</span></span>
              </div>
            </div>

            <div className="stat-yellow p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-yellow-200">
                  This action will consume one {selectedItem.name}. Make sure you're in an active game to use it!
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={cancelUseItem}
                className="flex-1 btn btn-secondary py-2 sm:py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmUseItem}
                className="flex-1 btn btn-gradient py-2 sm:py-3 text-sm"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Use Item
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
