'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Trophy, ArrowLeft, Filter, TrendingUp, Users, Search, Calendar, Award, Target, Clock, X, RefreshCw, Crown, Medal, Flame, Star, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, fetchLeaderboard as fetchGlobalLeaderboard } from '@/hooks/useAuth';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import type { LeaderboardEntry } from '@/types';
import { GameDifficulty } from '@/types';
import { motion, AnimatePresence } from '@/lib/animations';

type TimeFilter = 'all' | 'today' | 'week' | 'month';
type SortMode = 'streak' | 'points' | 'level' | 'accuracy';
type DifficultyFilter = 'all' | GameDifficulty;

// Filter Button Component - Gaming Style (CSS transitions for better INP)
function FilterBtn({
  active,
  onClick,
  children,
  color = 'purple'
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: 'purple' | 'orange' | 'green' | 'yellow' | 'red' | 'cyan';
}) {
  const colorStyles = {
    purple: { active: 'from-purple-500/30 to-purple-600/20 border-purple-500/50 text-purple-300', hover: 'hover:border-purple-500/30' },
    orange: { active: 'from-orange-500/30 to-orange-600/20 border-orange-500/50 text-orange-300', hover: 'hover:border-orange-500/30' },
    green: { active: 'from-green-500/30 to-green-600/20 border-green-500/50 text-green-300', hover: 'hover:border-green-500/30' },
    yellow: { active: 'from-yellow-500/30 to-yellow-600/20 border-yellow-500/50 text-yellow-300', hover: 'hover:border-yellow-500/30' },
    red: { active: 'from-red-500/30 to-red-600/20 border-red-500/50 text-red-300', hover: 'hover:border-red-500/30' },
    cyan: { active: 'from-cyan-500/30 to-cyan-600/20 border-cyan-500/50 text-cyan-300', hover: 'hover:border-cyan-500/30' },
  };

  const style = colorStyles[color];

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 border cursor-pointer
        hover:scale-105 active:scale-95
        ${active
          ? `bg-gradient-to-r ${style.active}`
          : `bg-zinc-800/50 text-zinc-400 border-zinc-700/50 ${style.hover} hover:text-zinc-200`
        }
      `}
    >
      {children}
    </button>
  );
}

// Podium Card for Top 3
function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const config = {
    1: {
      gradient: 'from-yellow-500 to-amber-600',
      glow: 'shadow-yellow-500/30',
      bgGlow: 'from-yellow-500/20 to-amber-500/10',
      icon: Crown,
      label: '1st Place',
      size: 'w-20 h-20 sm:w-24 sm:h-24',
      height: 'h-32 sm:h-40',
    },
    2: {
      gradient: 'from-slate-300 to-zinc-400',
      glow: 'shadow-slate-400/30',
      bgGlow: 'from-slate-400/20 to-zinc-400/10',
      icon: Medal,
      label: '2nd Place',
      size: 'w-16 h-16 sm:w-20 sm:h-20',
      height: 'h-24 sm:h-32',
    },
    3: {
      gradient: 'from-amber-600 to-orange-700',
      glow: 'shadow-amber-600/30',
      bgGlow: 'from-amber-600/20 to-orange-600/10',
      icon: Medal,
      label: '3rd Place',
      size: 'w-16 h-16 sm:w-20 sm:h-20',
      height: 'h-20 sm:h-28',
    },
  };

  const c = config[rank];
  const IconComponent = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank === 1 ? 0.2 : rank === 2 ? 0.1 : 0.3, type: 'spring', stiffness: 200 }}
      className={`flex flex-col items-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}
    >
      {/* Avatar with Glow */}
      <div className="relative mb-2">
        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} rounded-full blur-xl opacity-50`} />
        <div className={`relative ${c.size} rounded-full bg-gradient-to-br ${c.gradient} p-[3px]`}>
          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
            {entry.avatarImage ? (
              <img src={entry.avatarImage} alt={entry.username} className="w-full h-full object-cover" />
            ) : entry.avatar ? (
              <span className="text-2xl sm:text-3xl">{entry.avatar}</span>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-zinc-500">{entry.username[0]}</span>
            )}
          </div>
        </div>
        {/* Rank Badge */}
        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg ${c.glow}`}>
          <IconComponent className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Username */}
      <p className="font-bold text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-[120px]">{entry.username}</p>
      <p className="text-xs text-zinc-500">{c.label}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-sm font-bold text-orange-400">{entry.streak}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">{entry.points.toLocaleString()}</span>
        </div>
      </div>

      {/* Podium Base */}
      <div className={`mt-3 w-24 sm:w-32 ${c.height} bg-gradient-to-t ${c.bgGlow} border border-white/10 rounded-t-xl flex items-start justify-center pt-4`}>
        <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-br ${c.gradient} bg-clip-text text-transparent`}>
          #{rank}
        </span>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalEntries: 0, highestStreak: 0, highestPoints: 0, totalPlayers: 0 });
  const [globalUserRank, setGlobalUserRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('streak');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchGlobalLeaderboard({ timeFrame: timeFilter, difficulty: difficultyFilter, limit: 100 });
      const transformedEntries: LeaderboardEntry[] = data.entries.map((entry, index) => ({
        id: entry.id, username: entry.username, streak: entry.streak, points: entry.points,
        difficulty: entry.difficulty as GameDifficulty,
        date: entry.lastPlayedAt || entry.date, // Use lastPlayedAt for display (when they last played)
        timestamp: new Date(entry.lastPlayedAt || entry.date).getTime(),
        avatar: entry.avatar, avatarImage: entry.avatarImage,
        level: { current: entry.level, xp: 0, xpToNextLevel: 100, totalXp: 0, mode: 'infinite' as const },
        accuracy: entry.accuracy, userId: entry.odId, rank: entry.rank || index + 1,
      }));
      setGlobalEntries(transformedEntries);
      setGlobalStats(data.stats);
      setGlobalUserRank(data.userRank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, difficultyFilter]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Server already filters by timeFilter and difficultyFilter
  // Client only handles search and sorting
  const filteredEntries = useMemo(() => {
    let entries = [...globalEntries];
    // Search filter (client-side only)
    if (searchQuery.trim()) entries = entries.filter((e) => e.username.toLowerCase().includes(searchQuery.toLowerCase()));
    // Sort entries
    entries.sort((a, b) => {
      if (sortMode === 'streak') return b.streak !== a.streak ? b.streak - a.streak : b.points - a.points;
      if (sortMode === 'points') return b.points !== a.points ? b.points - a.points : b.streak - a.streak;
      if (sortMode === 'level') return (b.level?.current || 0) !== (a.level?.current || 0) ? (b.level?.current || 0) - (a.level?.current || 0) : b.points - a.points;
      if (sortMode === 'accuracy') return (b.accuracy || 0) !== (a.accuracy || 0) ? (b.accuracy || 0) - (a.accuracy || 0) : b.points - a.points;
      return 0;
    });
    return entries;
  }, [globalEntries, searchQuery, sortMode]);

  const stats = useMemo(() => {
    return {
      totalEntries: globalStats.totalPlayers,
      highestStreak: globalStats.highestStreak,
      totalPoints: globalStats.highestPoints,
      avgAccuracy: filteredEntries.length > 0
        ? Math.round(filteredEntries.reduce((sum, e) => sum + (e.accuracy || 0), 0) / filteredEntries.length)
        : 0,
    };
  }, [filteredEntries, globalStats]);

  // Get top 3 for podium
  const topThree = filteredEntries.slice(0, 3);
  const restEntries = filteredEntries.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:border-purple-500/30 hover:text-white transition-all duration-150 hover:scale-105 hover:-translate-x-0.5 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Game</span>
            </button>
            <button
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:border-cyan-500/30 hover:text-white transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </motion.div>

          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="flex-center gap-3 mb-3">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full" />
                <Trophy className="relative w-10 h-10 sm:w-14 sm:h-14 text-yellow-400" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  Leaderboard
                </span>
              </h1>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full" />
                <Trophy className="relative w-10 h-10 sm:w-14 sm:h-14 text-yellow-400" />
              </motion.div>
            </div>
            <p className="text-zinc-400 text-sm sm:text-base flex-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Top players and their epic achievements
              <Sparkles className="w-4 h-4 text-purple-400" />
            </p>

            {/* User Rank Badge */}
            {globalUserRank && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30"
              >
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">Your Rank: #{globalUserRank.rank}</span>
                <span className="text-zinc-500">of {globalUserRank.totalPlayers}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
          >
            {[
              { icon: Users, label: 'Players', value: stats.totalEntries, bgIcon: 'bg-purple-500/20', textIcon: 'text-purple-400', textValue: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30' },
              { icon: TrendingUp, label: 'Best Streak', value: stats.highestStreak, bgIcon: 'bg-orange-500/20', textIcon: 'text-orange-400', textValue: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30' },
              { icon: Trophy, label: 'Top Points', value: stats.totalPoints.toLocaleString(), bgIcon: 'bg-yellow-500/20', textIcon: 'text-yellow-400', textValue: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30' },
              { icon: Target, label: 'Avg Accuracy', value: `${stats.avgAccuracy}%`, bgIcon: 'bg-green-500/20', textIcon: 'text-green-400', textValue: 'text-green-400', gradient: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} border ${stat.border} backdrop-blur-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgIcon} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.textIcon}`} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${stat.textValue}`}>{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-4 relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-all duration-100 hover:scale-110 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="space-y-3"
          >
            {/* Time Filter */}
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400 text-sm font-medium">Time Period</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterBtn active={timeFilter === 'all'} onClick={() => setTimeFilter('all')}>All Time</FilterBtn>
                <FilterBtn active={timeFilter === 'today'} onClick={() => setTimeFilter('today')}>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Today</span>
                </FilterBtn>
                <FilterBtn active={timeFilter === 'week'} onClick={() => setTimeFilter('week')}>This Week</FilterBtn>
                <FilterBtn active={timeFilter === 'month'} onClick={() => setTimeFilter('month')}>This Month</FilterBtn>
              </div>
            </div>

            {/* Sort & Difficulty */}
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Sort By */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400 text-sm font-medium">Sort By</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['streak', 'points', 'level', 'accuracy'] as SortMode[]).map((mode) => (
                      <FilterBtn key={mode} active={sortMode === mode} onClick={() => setSortMode(mode)} color="orange">
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </FilterBtn>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400 text-sm font-medium">Difficulty</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterBtn active={difficultyFilter === 'all'} onClick={() => setDifficultyFilter('all')} color="cyan">All</FilterBtn>
                    <FilterBtn active={difficultyFilter === GameDifficulty.EASY} onClick={() => setDifficultyFilter(GameDifficulty.EASY)} color="green">Easy</FilterBtn>
                    <FilterBtn active={difficultyFilter === GameDifficulty.MEDIUM} onClick={() => setDifficultyFilter(GameDifficulty.MEDIUM)} color="yellow">Medium</FilterBtn>
                    <FilterBtn active={difficultyFilter === GameDifficulty.HARD} onClick={() => setDifficultyFilter(GameDifficulty.HARD)} color="red">Hard</FilterBtn>
                    <FilterBtn active={difficultyFilter === GameDifficulty.TIMED} onClick={() => setDifficultyFilter(GameDifficulty.TIMED)} color="purple">Timed</FilterBtn>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Podium Section - Top 3 */}
        {!isLoading && topThree.length >= 3 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-6">
              {topThree.map((entry, index) => (
                <PodiumCard key={entry.id} entry={entry} rank={(index + 1) as 1 | 2 | 3} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2 sm:space-y-3"
        >
          {isLoading ? (
            <div className="text-center py-16 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Loader2 className="w-16 h-16 text-purple-400" />
              </motion.div>
              <p className="text-zinc-400 text-lg">Loading leaderboard...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg mb-2">No entries found</p>
              <p className="text-zinc-500 text-sm">
                {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to make it to the leaderboard!'}
              </p>
            </div>
          ) : (
            (() => {
              // If podium is showing (3+ entries, no search), show entries starting from rank 4
              // Otherwise, show all entries starting from rank 1
              const showPodium = topThree.length >= 3 && !searchQuery;
              const entriesToShow = showPodium ? restEntries : filteredEntries;
              const startRank = showPodium ? 4 : 1;

              return entriesToShow.map((entry, index) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  rank={startRank + index}
                  isCurrentUser={user?.id === entry.userId}
                />
              ));
            })()
          )}
        </motion.div>
      </div>
    </div>
  );
}
