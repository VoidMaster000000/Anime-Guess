'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { animate } from '@/lib/animejs';
import {
  Trophy,
  ArrowLeft,
  Trash2,
  Filter,
  TrendingUp,
  Users,
  Search,
  Calendar,
  Award,
  Target,
  Clock,
  X,
  Globe,
  Home,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
import { useAuth, fetchLeaderboard as fetchGlobalLeaderboard } from '@/hooks/useAuth';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import type { LeaderboardEntry } from '@/types';
import { GameDifficulty } from '@/types';

type TimeFilter = 'all' | 'today' | 'week' | 'month';
type SortMode = 'streak' | 'points' | 'level' | 'accuracy';
type DifficultyFilter = 'all' | GameDifficulty;
type LeaderboardView = 'local' | 'global';

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
}: {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (ref.current) {
      animate(ref.current, { scale: 0.95, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 100, ease: 'outQuad' });
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
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

function StatCard({ children, delay, className }: { children: React.ReactNode; delay: number; className: string }) {
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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

export default function LeaderboardPage() {
  const router = useRouter();
  const leaderboard = useGameStore((state) => state.leaderboard);
  const currentProfile = useProfileStore((state) => state.user);
  const { isAuthenticated, user } = useAuth();

  // View mode: local or global
  const [viewMode, setViewMode] = useState<LeaderboardView>('global');

  // Global leaderboard data
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalEntries: 0,
    highestStreak: 0,
    highestPoints: 0,
    totalPlayers: 0,
  });
  const [globalUserRank, setGlobalUserRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Filters and sorting
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('streak');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch global leaderboard
  const loadGlobalLeaderboard = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const data = await fetchGlobalLeaderboard({
        timeFrame: timeFilter,
        difficulty: difficultyFilter,
        limit: 100,
      });

      // Transform global entries to match local format
      const transformedEntries: LeaderboardEntry[] = data.entries.map((entry, index) => ({
        id: entry.id,
        username: entry.username,
        streak: entry.streak,
        points: entry.points,
        difficulty: entry.difficulty as GameDifficulty,
        date: entry.date,
        timestamp: new Date(entry.date).getTime(),
        avatar: entry.avatar,
        level: {
          current: entry.level,
          xp: 0,
          xpToNextLevel: 100,
          totalXp: 0,
          mode: 'infinite' as const,
        },
        accuracy: entry.accuracy,
        userId: entry.odId,
        rank: entry.rank || index + 1,
      }));

      setGlobalEntries(transformedEntries);
      setGlobalStats(data.stats);
      setGlobalUserRank(data.userRank);
    } catch (error) {
      console.error('Failed to fetch global leaderboard:', error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [timeFilter, difficultyFilter]);

  // Load global leaderboard on mount and when filters change
  useEffect(() => {
    if (viewMode === 'global') {
      loadGlobalLeaderboard();
    }
  }, [viewMode, loadGlobalLeaderboard]);

  // Enhanced leaderboard entries with profile data (for local)
  const enhancedLocalEntries = useMemo(() => {
    return leaderboard.map((entry) => {
      // If entry has userId, try to get profile data
      // For now, generate mock profile data based on entry stats
      const accuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
      const level = {
        current: Math.floor(entry.streak / 3) + 1,
        xp: 0,
        xpToNextLevel: 100,
        totalXp: 0,
        mode: 'infinite' as const,
      };

      return {
        ...entry,
        avatar: entry.avatar || ['😊', '😎', '🥳', '🤓', '😇'][Math.floor(Math.random() * 5)],
        level: entry.level || level,
        accuracy: entry.accuracy || accuracy,
        totalGamesPlayed: entry.totalGamesPlayed || Math.floor(entry.streak * 1.5),
      };
    });
  }, [leaderboard]);

  // Choose between local and global entries
  const enhancedEntries = viewMode === 'global' ? globalEntries : enhancedLocalEntries;

  // Apply filters
  const filteredEntries = useMemo(() => {
    let entries = [...enhancedEntries];

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      entries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        switch (timeFilter) {
          case 'today':
            return entryDate >= todayStart;
          case 'week':
            return entryDate >= weekStart;
          case 'month':
            return entryDate >= monthStart;
          default:
            return true;
        }
      });
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      entries = entries.filter((entry) => entry.difficulty === difficultyFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter((entry) =>
        entry.username.toLowerCase().includes(query)
      );
    }

    // Sort entries
    entries.sort((a, b) => {
      switch (sortMode) {
        case 'streak':
          if (b.streak !== a.streak) return b.streak - a.streak;
          return b.points - a.points;

        case 'points':
          if (b.points !== a.points) return b.points - a.points;
          return b.streak - a.streak;

        case 'level':
          const levelA = a.level?.current || 0;
          const levelB = b.level?.current || 0;
          if (levelB !== levelA) return levelB - levelA;
          return b.points - a.points;

        case 'accuracy':
          const accA = a.accuracy || 0;
          const accB = b.accuracy || 0;
          if (accB !== accA) return accB - accA;
          return b.points - a.points;

        default:
          return 0;
      }
    });

    return entries;
  }, [enhancedEntries, timeFilter, difficultyFilter, searchQuery, sortMode]);

  const handleClearLeaderboard = () => {
    if (typeof window !== 'undefined') {
      const storage = localStorage.getItem('anime-guess-game-storage');
      if (storage) {
        const data = JSON.parse(storage);
        data.state.leaderboard = [];
        localStorage.setItem('anime-guess-game-storage', JSON.stringify(data));
      }
    }
    window.location.reload();
  };

  const stats = useMemo(() => {
    // For global view, use server stats
    if (viewMode === 'global') {
      return {
        totalEntries: globalStats.totalPlayers,
        highestStreak: globalStats.highestStreak,
        totalPoints: globalStats.highestPoints,
        avgAccuracy: 0, // Not tracked globally
      };
    }

    // For local view, calculate from entries
    if (filteredEntries.length === 0) {
      return { totalEntries: 0, highestStreak: 0, totalPoints: 0, avgAccuracy: 0 };
    }

    const avgAccuracy = Math.round(
      filteredEntries.reduce((sum, e) => sum + (e.accuracy || 0), 0) / filteredEntries.length
    );

    return {
      totalEntries: filteredEntries.length,
      highestStreak: Math.max(...filteredEntries.map((e) => e.streak)),
      totalPoints: filteredEntries.reduce((sum, e) => sum + e.points, 0),
      avgAccuracy,
    };
  }, [filteredEntries, viewMode, globalStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">Back to Game</span>
            </button>

            <HoverScaleButton
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors duration-200 text-red-400"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Clear Leaderboard</span>
            </HoverScaleButton>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500">
                Leaderboard
              </h1>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-400">Top players and their epic achievements</p>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setViewMode('global')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'global'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                Global
              </button>
              <button
                onClick={() => setViewMode('local')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'local'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                <Home className="w-4 h-4" />
                Local
              </button>
              {viewMode === 'global' && (
                <button
                  onClick={loadGlobalLeaderboard}
                  disabled={isLoadingGlobal}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingGlobal ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* User Rank Display */}
            {viewMode === 'global' && globalUserRank && isAuthenticated && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Your Rank: #{globalUserRank.rank} of {globalUserRank.totalPlayers}
                </span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              delay={100}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Players</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalEntries}</p>
                </div>
              </div>
            </StatCard>

            <StatCard
              delay={200}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">Best Streak</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.highestStreak}</p>
                </div>
              </div>
            </StatCard>

            <StatCard
              delay={300}
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Points</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.totalPoints.toLocaleString()}
                  </p>
                </div>
              </div>
            </StatCard>

            <StatCard
              delay={400}
              className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-green-400">{stats.avgAccuracy}%</p>
                </div>
              </div>
            </StatCard>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Time Filters */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm font-medium">Time Period:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeFilter === filter
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  {filter === 'all' && 'All Time'}
                  {filter === 'today' && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Today
                    </span>
                  )}
                  {filter === 'week' && 'This Week'}
                  {filter === 'month' && 'This Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Sort and Difficulty Filters */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Sort Mode */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {(['streak', 'points', 'level', 'accuracy'] as SortMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSortMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        sortMode === mode
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600'
                      }`}
                    >
                      {mode === 'streak' && 'Streak'}
                      {mode === 'points' && 'Points'}
                      {mode === 'level' && 'Level'}
                      {mode === 'accuracy' && 'Accuracy'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Difficulty:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDifficultyFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      difficultyFilter === 'all'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {Object.values(GameDifficulty).map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setDifficultyFilter(difficulty)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        difficultyFilter === difficulty
                          ? difficulty === GameDifficulty.EASY
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : difficulty === GameDifficulty.MEDIUM
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : difficulty === GameDifficulty.HARD
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600'
                      }`}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Leaderboard List */}
        <AnimatedSection delay={200} className="space-y-3">
          {isLoadingGlobal && viewMode === 'global' ? (
            <div className="text-center py-16 bg-gray-800/40 border border-gray-700 rounded-lg">
              <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg mb-2">Loading global leaderboard...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/40 border border-gray-700 rounded-lg">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No entries found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : viewMode === 'global'
                  ? 'Be the first to make it to the global leaderboard!'
                  : 'Play the game and make it to the leaderboard!'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={entry.rank || index + 1}
                isCurrentUser={
                  viewMode === 'global'
                    ? user?.id === entry.userId
                    : currentProfile?.id === entry.userId
                }
              />
            ))
          )}
        </AnimatedSection>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <ModalOverlay onClose={() => setShowClearConfirm(false)}>
            <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
                <h2 className="text-2xl font-bold text-red-400">Clear Leaderboard?</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to clear all leaderboard entries? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleClearLeaderboard();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </div>
    </div>
  );
}
