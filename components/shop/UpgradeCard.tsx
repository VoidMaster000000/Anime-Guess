'use client';

import { Coins, Eye, SkipForward, Heart, HelpCircle } from 'lucide-react';
import type { ShopItem } from '@/types';
import { motion, cardHover } from '@/lib/animations';

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

export default function UpgradeCard({ item, onPurchase, disabled, owned }: UpgradeCardProps) {
  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || HelpCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      variants={!disabled ? cardHover : undefined}
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      className="relative"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-sm" aria-hidden="true" />

      <div className={`
        relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800
        transition-all duration-300
        ${!disabled ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20' : 'opacity-60'}
      `}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className={`
            w-16 h-16 rounded-xl flex items-center justify-center mb-4
            bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20
          `}
          aria-hidden="true"
        >
          <IconComponent className="w-8 h-8 text-purple-400" />
        </motion.div>

        {/* Content */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">{item.name}</h3>
            {owned !== undefined && owned > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300"
              >
                Owned: {owned}
              </motion.span>
            )}
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
        </div>

        {/* Cost and Purchase Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" aria-hidden="true" />
            <span className="text-2xl font-bold text-yellow-500">{item.cost}</span>
          </div>

          <button
            onClick={onPurchase}
            disabled={disabled}
            className={`
              px-6 py-2.5 rounded-lg font-semibold text-sm
              transition-all duration-150 flex items-center gap-2
              ${disabled
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95'
              }
            `}
            aria-label={`Purchase ${item.name} for ${item.cost} coins${owned !== undefined && owned > 0 ? `, currently owned: ${owned}` : ''}`}
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
            <div
              className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={owned}
              aria-valuemin={0}
              aria-valuemax={item.maxOwned}
              aria-label={`Owned ${owned} of ${item.maxOwned}`}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(owned / item.maxOwned) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
