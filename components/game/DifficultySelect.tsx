'use client';

import { Heart, Eye, TrendingUp, Clock, Zap, Shield, Flame, Trophy, Sparkles, Star, Target } from 'lucide-react';
import { GameDifficulty } from '@/types';
import { motion, AnimatePresence } from '@/lib/animations';

interface DifficultyOption {
  id: GameDifficulty;
  name: string;
  description: string;
  tagline: string;
  lives: number;
  hints: number;
  pointsMultiplier: number;
  timeLimit?: number;
  icon: typeof Heart;
  color: string;
  gradient: string;
  bgGradient: string;
  shadowColor: string;
  recommended?: boolean;
}

interface DifficultySelectProps {
  onSelect: (difficulty: GameDifficulty) => void;
}

const difficulties: DifficultyOption[] = [
  {
    id: GameDifficulty.EASY,
    name: 'Easy',
    description: 'Perfect for beginners',
    tagline: 'Learn the ropes',
    lives: 5,
    hints: 4,
    pointsMultiplier: 0.5,
    icon: Shield,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    shadowColor: 'shadow-emerald-500/30',
  },
  {
    id: GameDifficulty.MEDIUM,
    name: 'Medium',
    description: 'Balanced challenge',
    tagline: 'The sweet spot',
    lives: 3,
    hints: 4,
    pointsMultiplier: 1,
    icon: Zap,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    shadowColor: 'shadow-blue-500/30',
    recommended: true,
  },
  {
    id: GameDifficulty.HARD,
    name: 'Hard',
    description: 'For true anime fans',
    tagline: 'No pain, no gain',
    lives: 2,
    hints: 4,
    pointsMultiplier: 2,
    icon: Flame,
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-500/20 via-red-500/10 to-transparent',
    shadowColor: 'shadow-orange-500/30',
  },
  {
    id: GameDifficulty.TIMED,
    name: 'Timed',
    description: 'Race against the clock',
    tagline: 'Beat the timer',
    lives: 3,
    hints: 4,
    pointsMultiplier: 1.5,
    timeLimit: 30,
    icon: Clock,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    shadowColor: 'shadow-purple-500/30',
  },
];

export default function DifficultySelect({ onSelect }: DifficultySelectProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
          </motion.div>
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Choose Your Challenge
              </span>
            </h1>
          </div>
        </div>
        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
          Select a difficulty level to begin your anime guessing adventure
        </p>
      </motion.div>

      {/* Difficulty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {difficulties.map((difficulty, index) => (
          <DifficultyCard
            key={difficulty.id}
            difficulty={difficulty}
            onSelect={onSelect}
            index={index}
          />
        ))}
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-center mt-8 sm:mt-10"
      >
        <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Click a card to start playing
          <Sparkles className="w-4 h-4" />
        </p>
      </motion.div>
    </div>
  );
}

function DifficultyCard({
  difficulty,
  onSelect,
  index,
}: {
  difficulty: DifficultyOption;
  onSelect: (difficulty: GameDifficulty) => void;
  index: number;
}) {
  const Icon = difficulty.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.2,
        delay: index * 0.04,
        type: 'spring',
        stiffness: 200,
      }}
      className="relative group"
    >
      <motion.div
        onClick={() => onSelect(difficulty.id)}
        whileHover={{ scale: 1.03, y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer h-full"
      >
        {/* Recommended badge */}
        {difficulty.recommended && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + index * 0.04, type: 'spring' }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-xs font-bold text-black flex items-center gap-1 shadow-lg shadow-yellow-500/30">
              <Star className="w-3 h-3 fill-black" />
              RECOMMENDED
            </div>
          </motion.div>
        )}

        {/* Card container */}
        <div className={`relative overflow-hidden rounded-2xl h-full transition-shadow duration-150 ${difficulty.shadowColor} group-hover:shadow-2xl`}>
          {/* Animated gradient border */}
          <div className={`absolute inset-0 bg-gradient-to-br ${difficulty.gradient} opacity-100`} />
          <div className="absolute inset-[2px] bg-zinc-900 rounded-2xl" />

          {/* Background glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${difficulty.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

          {/* Content */}
          <div className="relative p-5 sm:p-6 h-full flex flex-col">
            {/* Icon with glow */}
            <div className="mb-5">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.2 }}
                className="relative inline-block"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${difficulty.gradient} blur-xl opacity-50 rounded-2xl scale-150`} />
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${difficulty.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Title and description */}
            <div className="mb-5 flex-grow">
              <h3 className="text-2xl font-bold text-white mb-1">{difficulty.name}</h3>
              <p className={`text-sm font-medium bg-gradient-to-r ${difficulty.gradient} bg-clip-text text-transparent mb-2`}>
                {difficulty.tagline}
              </p>
              <p className="text-zinc-400 text-sm">{difficulty.description}</p>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-5">
              {/* Lives */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-sm">Lives</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 transition-colors ${
                        i < difficulty.lives
                          ? 'fill-red-500 text-red-500'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">Hints</span>
                </div>
                <span className="font-bold text-white">{difficulty.hints}</span>
              </div>

              {/* Multiplier */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Multiplier</span>
                </div>
                <span className="font-bold text-yellow-400">{difficulty.pointsMultiplier}x</span>
              </div>

              {/* Time Limit */}
              {difficulty.timeLimit && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Time</span>
                  </div>
                  <span className="font-bold text-purple-400">{difficulty.timeLimit}s</span>
                </div>
              )}
            </div>

            {/* Select Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r ${difficulty.gradient} shadow-lg ${difficulty.shadowColor} transition-all duration-150 group-hover:shadow-xl flex items-center justify-center gap-2`}
            >
              <span>Select</span>
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                className="text-lg"
              >
                →
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* Outer glow on hover */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${difficulty.gradient} opacity-0 group-hover:opacity-30 blur-2xl -z-10 transition-opacity duration-200`} />
      </motion.div>
    </motion.div>
  );
}
