'use client';

import { Trophy, Medal, Crown } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { GameDifficulty } from '@/types';
import { motion } from '@/lib/animations';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

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

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" aria-hidden="true" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300 fill-gray-300" aria-hidden="true" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" aria-hidden="true" />;
    default:
      return null;
  }
};

const getRankStyle = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40';
    case 2:
      return 'bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-300/40';
    case 3:
      return 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-600/40';
    default:
      return 'bg-gray-800/40 border-gray-700/30';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

// ============================================================================
// ANIMATED TABLE ROW
// ============================================================================

function AnimatedTableRow({
  entry,
  rank,
  isCurrentUser,
  delay,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  delay: number;
}) {
  const rankIcon = getRankIcon(rank);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000, ease: "easeOut" }}
      whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.3)" }}
      className={`
        ${getRankStyle(rank)}
        ${isCurrentUser ? 'ring-2 ring-blue-500/50' : ''}
        border-l-4
      `}
    >
      {/* Rank */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {rankIcon ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: delay / 1000 + 0.1 }}
            >
              {rankIcon}
            </motion.div>
          ) : (
            <span className="text-gray-400 font-semibold text-lg w-6 text-center">
              {rank}
            </span>
          )}
        </div>
      </td>

      {/* Player */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span
            className={`text-base font-medium ${
              isCurrentUser ? 'text-blue-400' : 'text-gray-200'
            }`}
          >
            {entry.username}
            {isCurrentUser && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="ml-2 text-xs text-blue-400"
              >
                (You)
              </motion.span>
            )}
          </span>
        </div>
      </td>

      {/* Difficulty */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadge(
            entry.difficulty
          )} ${getDifficultyColor(entry.difficulty)}`}
        >
          {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
        </span>
      </td>

      {/* Streak */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: delay / 1000 + 0.15 }}
            className="text-2xl font-bold text-orange-500"
          >
            {entry.streak}
          </motion.span>
        </div>
      </td>

      {/* Points */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: delay / 1000 + 0.2 }}
          className="text-lg font-semibold text-yellow-500"
        >
          {entry.points.toLocaleString()}
        </motion.span>
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="text-sm text-gray-400">{formatDate(entry.date)}</span>
      </td>
    </motion.tr>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16" role="status" aria-label="Empty leaderboard">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-400 text-lg">No entries yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Play the game and make it to the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <table className="min-w-full divide-y divide-gray-800" aria-label="Leaderboard rankings">
            {/* Header */}
            <thead className="bg-gray-900/80">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Player
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Difficulty
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Streak
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Points
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-800 bg-gray-900/40">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = currentUserId && entry.id === currentUserId;

                return (
                  <AnimatedTableRow
                    key={entry.id}
                    entry={entry}
                    rank={rank}
                    isCurrentUser={!!isCurrentUser}
                    delay={index * 50}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
