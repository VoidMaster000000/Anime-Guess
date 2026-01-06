'use client';

import { Animated } from '@/lib/animejs';
import { useHoverAnimation } from '@/lib/animejs';
import { Heart, Eye, TrendingUp, Clock, Zap, Shield, Flame, Trophy } from 'lucide-react';
import { GameDifficulty } from '@/types';

interface DifficultyOption {
  id: GameDifficulty;
  name: string;
  description: string;
  lives: number;
  hints: number;
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
    pointsMultiplier: 1,
    icon: Shield,
    color: 'green',
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    id: GameDifficulty.MEDIUM,
    name: 'Medium',
    description: 'Balanced challenge',
    lives: 3,
    hints: 3,
    pointsMultiplier: 1.5,
    icon: Zap,
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: GameDifficulty.HARD,
    name: 'Hard',
    description: 'For true anime fans',
    lives: 2,
    hints: 2,
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
    hints: 2,
    pointsMultiplier: 2.5,
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
      <Animated
        initial={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
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
      </Animated>

      {/* Difficulty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {difficulties.map((difficulty, index) => (
          <DifficultyCard
            key={difficulty.id}
            difficulty={difficulty}
            onSelect={onSelect}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}

function DifficultyCard({
  difficulty,
  onSelect,
  delay,
}: {
  difficulty: DifficultyOption;
  onSelect: (difficulty: GameDifficulty) => void;
  delay: number;
}) {
  const Icon = difficulty.icon;
  const hoverRef = useHoverAnimation<HTMLDivElement>(
    { translateY: -8, duration: 200, ease: 'outQuad' },
    { translateY: 0, duration: 200, ease: 'outQuad' }
  );

  return (
    <Animated
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: delay * 100 }}
      className="relative group cursor-pointer"
    >
      <div
        ref={hoverRef}
        onClick={() => onSelect(difficulty.id)}
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
          <HoverButton gradient={difficulty.gradient}>
            Select
          </HoverButton>
        </div>
      </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${difficulty.gradient} opacity-0 group-hover:opacity-50 blur-xl -z-10 transition-opacity`}
      />
    </Animated>
  );
}

// Helper component for hover button
function HoverButton({ children, gradient }: { children: React.ReactNode; gradient: string }) {
  const ref = useHoverAnimation<HTMLButtonElement>(
    { scale: 1.05, duration: 200, ease: 'outQuad' },
    { scale: 1, duration: 200, ease: 'outQuad' }
  );

  return (
    <button
      ref={ref}
      className={`w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${gradient} transition-all`}
    >
      {children}
    </button>
  );
}
