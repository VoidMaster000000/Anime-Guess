'use client';

import { Heart, Eye, TrendingUp, Clock, Zap, Shield, Flame, Trophy } from 'lucide-react';
import { GameDifficulty } from '@/types';
import { motion, fadeInUp, staggerContainer, staggerItem, cardHover } from '@/lib/animations';

interface DifficultyOption {
  id: GameDifficulty;
  name: string;
  description: string;
  lives: number;
  hints: number;  // Number of hints available
  pointsMultiplier: number;
  timeLimit?: number;
  icon: typeof Heart;
  color: string;
  gradient: string;
}

interface DifficultySelectProps {
  onSelect: (difficulty: GameDifficulty) => void;
}

const difficulties: DifficultyOption[] = [
  {
    id: GameDifficulty.EASY,
    name: 'Easy',
    description: 'Perfect for beginners',
    lives: 5,
    hints: 4,
    pointsMultiplier: 0.5,
    icon: Shield,
    color: 'green',
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    id: GameDifficulty.MEDIUM,
    name: 'Medium',
    description: 'Balanced challenge',
    lives: 3,
    hints: 4,
    pointsMultiplier: 1,
    icon: Zap,
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: GameDifficulty.HARD,
    name: 'Hard',
    description: 'For true anime fans',
    lives: 2,
    hints: 4,
    pointsMultiplier: 2,
    icon: Flame,
    color: 'orange',
    gradient: 'from-orange-600 to-red-600',
  },
  {
    id: GameDifficulty.TIMED,
    name: 'Timed',
    description: 'Race against the clock',
    lives: 3,
    hints: 4,
    pointsMultiplier: 1.5,
    timeLimit: 30,
    icon: Clock,
    color: 'purple',
    gradient: 'from-purple-600 to-pink-600',
  },
];

export default function DifficultySelect({ onSelect }: DifficultySelectProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <Trophy className="w-10 h-10 text-purple-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Challenge
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Select a difficulty level to begin your anime guessing adventure
        </p>
      </motion.div>

      {/* Difficulty Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {difficulties.map((difficulty) => (
          <DifficultyCard
            key={difficulty.id}
            difficulty={difficulty}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
    </div>
  );
}

function DifficultyCard({
  difficulty,
  onSelect,
}: {
  difficulty: DifficultyOption;
  onSelect: (difficulty: GameDifficulty) => void;
}) {
  const Icon = difficulty.icon;

  return (
    <motion.div
      variants={staggerItem}
      className="relative group cursor-pointer"
    >
      <motion.div
        onClick={() => onSelect(difficulty.id)}
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Gradient border container */}
        <div className={`relative bg-gradient-to-br ${difficulty.gradient} p-[2px] rounded-2xl h-full`}>
          <div className="bg-gray-900 rounded-2xl p-6 h-full flex flex-col">
            {/* Icon */}
            <div className="mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-${difficulty.color}-500/10 border border-${difficulty.color}-500/30`}>
                <Icon className={`w-8 h-8 text-${difficulty.color}-500`} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-2">{difficulty.name}</h3>
            <p className="text-gray-400 text-sm mb-6 flex-grow">{difficulty.description}</p>

            {/* Stats */}
            <div className="space-y-3">
              {/* Lives */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span>Lives</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: difficulty.lives }).map((_, i) => (
                    <Heart key={i} className="w-3 h-3 fill-red-500 text-red-500" />
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>Hints</span>
                </div>
                <div className="font-semibold text-white">{difficulty.hints}</div>
              </div>

              {/* Points Multiplier */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Multiplier</span>
                </div>
                <div className="font-semibold text-yellow-500">{difficulty.pointsMultiplier}x</div>
              </div>

              {/* Time Limit (if applicable) */}
              {difficulty.timeLimit && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Time Limit</span>
                  </div>
                  <div className="font-semibold text-purple-400">{difficulty.timeLimit}s</div>
                </div>
              )}
            </div>

            {/* Select Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${difficulty.gradient}`}
            >
              Select
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${difficulty.gradient} opacity-0 group-hover:opacity-50 blur-xl -z-10 transition-opacity`}
      />
    </motion.div>
  );
}
