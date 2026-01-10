'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Trophy, ArrowLeft, Filter, TrendingUp, Users, Search, Calendar, Award, Target, Clock, X, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, fetchLeaderboard as fetchGlobalLeaderboard } from '@/hooks/useAuth';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import type { LeaderboardEntry } from '@/types';
import { GameDifficulty } from '@/types';

type TimeFilter = 'all' | 'today' | 'week' | 'month';
type SortMode = 'streak' | 'points' | 'level' | 'accuracy';
type DifficultyFilter = 'all' | GameDifficulty;

// Animated Components (CSS-based)
function AnimatedSection({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 0.5);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div className={`${className} transition-all duration-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
      {children}
    </div>
  );
}

function HoverButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className: string }) {
  return (
    <button onClick={onClick} className={`${className} transition-transform duration-100 hover:scale-105 active:scale-95`}>
      {children}
    </button>
  );
}

function StatCard({ children, delay, className }: { children: React.ReactNode; delay: number; className: string }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 0.5);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div className={`${className} transition-all duration-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
      {children}
    </div>
  );
}

// Filter Button Component
function FilterBtn({ active, onClick, children, color = 'blue' }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  const activeColors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'rgba(168, 85, 247, 0.3)', text: '#c4b5fd', border: 'rgba(168, 85, 247, 0.5)' },
    orange: { bg: 'rgba(249, 115, 22, 0.3)', text: '#fdba74', border: 'rgba(249, 115, 22, 0.5)' },
    green: { bg: 'rgba(34, 197, 94, 0.3)', text: '#86efac', border: 'rgba(34, 197, 94, 0.5)' },
    yellow: { bg: 'rgba(234, 179, 8, 0.3)', text: '#fde047', border: 'rgba(234, 179, 8, 0.5)' },
    red: { bg: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.5)' },
    purple: { bg: 'rgba(168, 85, 247, 0.3)', text: '#c4b5fd', border: 'rgba(168, 85, 247, 0.5)' },
  };

  const colorSet = activeColors[color] || activeColors.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? {
        backgroundColor: colorSet.bg,
        color: colorSet.text,
        borderColor: colorSet.border,
      } : {
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        color: '#9ca3af',
        borderColor: '#4b5563',
      }}
      className="px-3 py-1.5 rounded-md text-sm font-medium transition-all border cursor-pointer"
    >
      {children}
    </button>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalEntries: 0, highestStreak: 0, highestPoints: 0, totalPlayers: 0 });
  const [globalUserRank, setGlobalUserRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        difficulty: entry.difficulty as GameDifficulty, date: entry.date, timestamp: new Date(entry.date).getTime(),
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

  const filteredEntries = useMemo(() => {
    let entries = [...globalEntries];
    if (timeFilter !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      entries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        if (timeFilter === 'today') return entryDate >= todayStart;
        if (timeFilter === 'week') return entryDate >= weekStart;
        if (timeFilter === 'month') return entryDate >= monthStart;
        return true;
      });
    }
    if (difficultyFilter !== 'all') entries = entries.filter((e) => e.difficulty === difficultyFilter);
    if (searchQuery.trim()) entries = entries.filter((e) => e.username.toLowerCase().includes(searchQuery.toLowerCase()));
    entries.sort((a, b) => {
      if (sortMode === 'streak') return b.streak !== a.streak ? b.streak - a.streak : b.points - a.points;
      if (sortMode === 'points') return b.points !== a.points ? b.points - a.points : b.streak - a.streak;
      if (sortMode === 'level') return (b.level?.current || 0) !== (a.level?.current || 0) ? (b.level?.current || 0) - (a.level?.current || 0) : b.points - a.points;
      if (sortMode === 'accuracy') return (b.accuracy || 0) !== (a.accuracy || 0) ? (b.accuracy || 0) - (a.accuracy || 0) : b.points - a.points;
      return 0;
    });
    return entries;
  }, [globalEntries, timeFilter, difficultyFilter, searchQuery, sortMode]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background */}
      <div className="page-bg">
        <div className="bg-glow-purple top-0 left-1/4" />
        <div className="bg-glow-blue bottom-0 right-1/4" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/')} className="btn btn-secondary">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-gray-300">Back to Game</span>
            </button>
            <button onClick={loadLeaderboard} disabled={isLoading} className="btn btn-secondary">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="flex-center gap-2 sm:gap-3 mb-2">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">Leaderboard</h1>
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
            </div>
            <p className="text-sm sm:text-base text-gray-400">Top players and their epic achievements</p>

            {globalUserRank && isAuthenticated && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 stat-yellow">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Your Rank: #{globalUserRank.rank} of {globalUserRank.totalPlayers}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
            <StatCard delay={100} className="stat-purple p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-gray-400">Players</p><p className="text-lg sm:text-2xl font-bold text-purple-400">{stats.totalEntries}</p></div>
              </div>
            </StatCard>
            <StatCard delay={200} className="stat-orange p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-gray-400">Best Streak</p><p className="text-lg sm:text-2xl font-bold text-orange-400">{stats.highestStreak}</p></div>
              </div>
            </StatCard>
            <StatCard delay={300} className="stat-yellow p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-gray-400">Total Points</p><p className="text-lg sm:text-2xl font-bold text-yellow-400 truncate">{stats.totalPoints.toLocaleString()}</p></div>
              </div>
            </StatCard>
            <StatCard delay={400} className="stat-green p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-gray-400">Avg Accuracy</p><p className="text-lg sm:text-2xl font-bold text-green-400">{stats.avgAccuracy}%</p></div>
              </div>
            </StatCard>
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="icon-input" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="validation-icon text-gray-400 hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Time Filters */}
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm font-medium">Time Period:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((filter) => (
                <FilterBtn key={filter} active={timeFilter === filter} onClick={() => setTimeFilter(filter)}>
                  {filter === 'all' && 'All Time'}
                  {filter === 'today' && <span className="flex items-center gap-2"><Clock className="w-4 h-4" />Today</span>}
                  {filter === 'week' && 'This Week'}
                  {filter === 'month' && 'This Month'}
                </FilterBtn>
              ))}
            </div>
          </div>

          {/* Sort & Difficulty */}
          <div className="card p-3 sm:p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-400 text-xs sm:text-sm font-medium">Sort by:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(['streak', 'points', 'level', 'accuracy'] as SortMode[]).map((mode) => (
                    <FilterBtn key={mode} active={sortMode === mode} onClick={() => setSortMode(mode)} color="orange">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </FilterBtn>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-400 text-xs sm:text-sm font-medium">Difficulty:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <FilterBtn active={difficultyFilter === 'all'} onClick={() => setDifficultyFilter('all')}>All</FilterBtn>
                  {Object.values(GameDifficulty).map((d) => (
                    <FilterBtn
                      key={d}
                      active={difficultyFilter === d}
                      onClick={() => setDifficultyFilter(d)}
                      color={d === GameDifficulty.EASY ? 'green' : d === GameDifficulty.MEDIUM ? 'yellow' : d === GameDifficulty.HARD ? 'red' : 'purple'}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </FilterBtn>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* List */}
        <AnimatedSection delay={200} className="space-y-3">
          {isLoading ? (
            <div className="text-center py-16 card">
              <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Loading leaderboard...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 card">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No entries found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to make it to the leaderboard!'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} isCurrentUser={user?.id === entry.userId} />
            ))
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}
