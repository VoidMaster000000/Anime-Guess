'use client';

import { useRef, useEffect } from 'react';
import { animate } from '@/lib/animejs';
import { Coins, Eye, SkipForward, Heart, HelpCircle } from 'lucide-react';
import type { ShopItem } from '@/types';

interface UpgradeCardProps {
  item: ShopItem;
  onPurchase: () => void;
  disabled: boolean;
  owned?: number;
}

const iconMap = {
  'eye': Eye,
  'skip-forward': SkipForward,
  'heart': Heart,
  'help-circle': HelpCircle,
  'coins': Coins,
};

function HoverCard({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className: string;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 1.02, translateY: -4, duration: 200, ease: 'outQuad' });
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

export default function UpgradeCard({ item, onPurchase, disabled, owned }: UpgradeCardProps) {
  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || HelpCircle;

  return (
    <HoverCard disabled={disabled} className="relative">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-sm" />

      <div className={`
        relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800
        transition-all duration-300
        ${!disabled ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20' : 'opacity-60'}
      `}>
        {/* Icon */}
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center mb-4
          bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20
        `}>
          <IconComponent className="w-8 h-8 text-purple-400" />
        </div>

        {/* Content */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">{item.name}</h3>
            {owned !== undefined && owned > 0 && (
              <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                Owned: {owned}
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
        </div>

        {/* Cost and Purchase Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-500">{item.cost}</span>
          </div>

          <button
            onClick={onPurchase}
            disabled={disabled}
            className={`
              px-6 py-2.5 rounded-lg font-semibold text-sm
              transition-all duration-200 flex items-center gap-2
              ${disabled
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/30'
              }
            `}
          >
            Purchase
          </button>
        </div>

        {/* Max owned indicator */}
        {item.maxOwned && owned !== undefined && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Progress</span>
              <span>{owned} / {item.maxOwned}</span>
            </div>
            <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${(owned / item.maxOwned) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </HoverCard>
  );
}
