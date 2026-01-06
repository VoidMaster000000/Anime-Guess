'use client';

import { useRef, useEffect } from 'react';
import { animate } from '@/lib/animejs';
import { Crown, Medal, Flame, Star, TrendingUp, Infinity, User } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { GameDifficulty } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser?: boolean;
}

/**
 * Get difficulty-specific colors
 */
const getDifficultyColor = (difficulty: GameDifficulty): string => {
  switch (difficulty) {
    case GameDifficulty.EASY:
      return 'text-green-400';
    case GameDifficulty.MEDIUM:
      return 'text-yellow-400';
    case GameDifficulty.HARD:
      return 'text-red-400';
    case GameDifficulty.TIMED:
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
};

/**
 * Get difficulty badge styling
 */
const getDifficultyBadge = (difficulty: GameDifficulty): string => {
  switch (difficulty) {
    case GameDifficulty.EASY:
      return 'bg-green-500/10 border-green-500/30';
    case GameDifficulty.MEDIUM:
      return 'bg-yellow-500/10 border-yellow-500/30';
    case GameDifficulty.HARD:
      return 'bg-red-500/10 border-red-500/30';
    case GameDifficulty.TIMED:
      return 'bg-purple-500/10 border-purple-500/30';
    default:
      return 'bg-gray-500/10 border-gray-500/30';
  }
};

/**
 * Get rank medal icon
 */
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-7 h-7 text-yellow-400 fill-yellow-400 drop-shadow-lg" />;
    case 2:
      return <Medal className="w-7 h-7 text-gray-300 fill-gray-300 drop-shadow-lg" />;
    case 3:
      return <Medal className="w-7 h-7 text-amber-600 fill-amber-600 drop-shadow-lg" />;
    default:
      return null;
  }
};

/**
 * Get rank styling for background
 */
const getRankStyle = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 shadow-yellow-500/20';
    case 2:
      return 'bg-gradient-to-r from-gray-300/15 to-gray-400/15 border-gray-300/50 shadow-gray-300/20';
    case 3:
      return 'bg-gradient-to-r from-amber-600/15 to-amber-700/15 border-amber-600/50 shadow-amber-600/20';
    default:
      return 'bg-gray-800/40 border-gray-700/30';
  }
};

/**
 * Get level color based on level number
 */
const getLevelColor = (level: number): string => {
  if (level >= 100) return 'from-purple-500 to-pink-500';
  if (level >= 50) return 'from-red-500 to-orange-500';
  if (level >= 25) return 'from-yellow-500 to-orange-500';
  if (level >= 10) return 'from-green-500 to-blue-500';
  return 'from-blue-500 to-cyan-500';
};

/**
 * Format date to relative time
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function AnimatedRow({
  children,
  rank,
  className,
}: {
  children: React.ReactNode;
  rank: number;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 300,
        delay: rank * 30,
        ease: 'outQuad',
      });
    }
  }, [rank]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export default function LeaderboardRow({ entry, rank, isCurrentUser = false }: LeaderboardRowProps) {
  const rankIcon = getRankIcon(rank);
  const level = entry.level?.current || 1;
  const isInfinite = entry.level?.mode === 'infinite';
  const avatarImage = entry.avatarImage;
  const avatarEmoji = entry.avatar;
  const accuracy = entry.accuracy || 0;

  return (
    <AnimatedRow
      rank={rank}
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all duration-300
        ${getRankStyle(rank)}
        ${isCurrentUser ? 'ring-2 ring-blue-500/60 scale-[1.02]' : 'hover:scale-[1.01]'}
        hover:shadow-xl
        ${rank <= 3 ? 'shadow-lg' : ''}
      `}
    >
      {/* Background gradient for current user */}
      {isCurrentUser && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
      )}

      <div className="relative px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-12 md:w-14 text-center">
            {rankIcon ? (
              <div className="flex items-center justify-center">
                {rankIcon}
              </div>
            ) : (
              <div className="text-2xl md:text-3xl font-bold text-gray-400">
                {rank}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 flex items-center justify-center text-2xl md:text-3xl shadow-lg overflow-hidden">
              {avatarImage ? (
                <img src={avatarImage} alt={entry.username} className="w-full h-full object-cover" />
              ) : avatarEmoji ? (
                avatarEmoji
              ) : (
                <User className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-base md:text-lg font-bold truncate ${isCurrentUser ? 'text-blue-400' : 'text-gray-100'}`}>
                {entry.username}
              </h3>
              {isCurrentUser && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                  YOU
                </span>
              )}
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${getLevelColor(level)} text-white text-xs font-bold shadow-sm flex items-center gap-1`}>
                <span>LVL {level}</span>
                {isInfinite && level >= 100 && (
                  <Infinity className="w-3 h-3" />
                )}
              </div>

              {/* Difficulty Badge */}
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getDifficultyBadge(entry.difficulty)} ${getDifficultyColor(entry.difficulty)}`}
              >
                {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="hidden md:grid grid-cols-3 gap-4 lg:gap-6">
            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-400 font-medium">Streak</span>
              </div>
              <div className="text-xl font-bold text-orange-500">
                {entry.streak}
              </div>
            </div>

            {/* Points */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-400 font-medium">Points</span>
              </div>
              <div className="text-xl font-bold text-yellow-500">
                {entry.points.toLocaleString()}
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-400 font-medium">Accuracy</span>
              </div>
              <div className="text-xl font-bold text-green-500">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Mobile Stats (Compact) */}
          <div className="md:hidden flex flex-col gap-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-lg font-bold text-orange-500">{entry.streak}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-500">
                {entry.points.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="hidden lg:block text-right flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">Achieved</div>
            <div className="text-sm text-gray-400 font-medium">
              {formatDate(entry.date)}
            </div>
          </div>
        </div>

        {/* Mobile Accuracy */}
        <div className="md:hidden mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-gray-400">Accuracy:</span>
            <span className="font-bold text-green-500">{accuracy}%</span>
          </div>
          <div className="text-gray-500 text-xs">
            {formatDate(entry.date)}
          </div>
        </div>
      </div>
    </AnimatedRow>
  );
}
