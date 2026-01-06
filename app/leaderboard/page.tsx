'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { animate } from '@/lib/animejs';
import { Trophy, ArrowLeft, Trash2, Filter, TrendingUp, Users, Search, Calendar, Award, Target, Clock, X, Globe, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { useAuth, fetchLeaderboard as fetchGlobalLeaderboard } from '@/hooks/useAuth';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import type { LeaderboardEntry } from '@/types';
import { GameDifficulty } from '@/types';

type TimeFilter = 'all' | 'today' | 'week' | 'month';
type SortMode = 'streak' | 'points' | 'level' | 'accuracy';
type DifficultyFilter = 'all' | GameDifficulty;
type LeaderboardView = 'local' | 'global';

// Animated Components
function AnimatedSection({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) animate(ref.current, { opacity: [0, 1], translateY: [20, 0], duration: 400, delay, ease: 'outQuad' });
  }, [delay]);
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}

function HoverButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={className}
      onMouseEnter={() => ref.current && animate(ref.current, { scale: 1.05, duration: 150, ease: 'outQuad' })}
      onMouseLeave={() => ref.current && animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' })}
    >
      {children}
    </button>
  );
}

function StatCard({ children, delay, className }: { children: React.ReactNode; delay: number; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) animate(ref.current, { opacity: [0, 1], translateY: [20, 0], duration: 400, delay, ease: 'outQuad' });
  }, [delay]);
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (overlayRef.current) animate(overlayRef.current, { opacity: [0, 1], duration: 200, ease: 'outQuad' });
    if (contentRef.current) animate(contentRef.current, { scale: [0.9, 1], opacity: [0, 1], duration: 200, ease: 'outQuad' });
  }, []);
  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex-center p-4" style={{ opacity: 0 }} onClick={onClose}>
      <div ref={contentRef} style={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// Filter Button Component
function FilterBtn({ active, onClick, children, color = 'blue' }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  const colorClasses: Record<string, string> = {
    blue: active ? 'btn-active' : 'btn-inactive',
    orange: active ? 'stat-orange text-orange-400' : 'btn-inactive',
    green: active ? 'stat-green text-green-400' : 'btn-inactive',
    yellow: active ? 'stat-yellow text-yellow-400' : 'btn-inactive',
    red: active ? 'stat-red text-red-400' : 'btn-inactive',
    purple: active ? 'stat-purple text-purple-400' : 'btn-inactive',
  };
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${colorClasses[color]}`}>{children}</button>;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const leaderboard = useGameStore((state) => state.leaderboard);
  const { isAuthenticated, user } = useAuth();

  const [viewMode, setViewMode] = useState<LeaderboardView>('global');
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalEntries: 0, highestStreak: 0, highestPoints: 0, totalPlayers: 0 });
  const [globalUserRank, setGlobalUserRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('streak');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadGlobalLeaderboard = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const data = await fetchGlobalLeaderboard({ timeFrame: timeFilter, difficulty: difficultyFilter, limit: 100 });
      const transformedEntries: LeaderboardEntry[] = data.entries.map((entry, index) => ({
        id: entry.id, username: entry.username, streak: entry.streak, points: entry.points,
        difficulty: entry.difficulty as GameDifficulty, date: entry.date, timestamp: new Date(entry.date).getTime(),
        avatar: entry.avatar, level: { current: entry.level, xp: 0, xpToNextLevel: 100, totalXp: 0, mode: 'infinite' as const },
        accuracy: entry.accuracy, userId: entry.odId, rank: entry.rank || index + 1,
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

  useEffect(() => {
    if (viewMode === 'global') loadGlobalLeaderboard();
  }, [viewMode, loadGlobalLeaderboard]);

  const enhancedLocalEntries = useMemo(() => leaderboard.map((entry) => ({
    ...entry,
    avatar: entry.avatar || ['😊', '😎', '🥳', '🤓', '😇'][Math.floor(Math.random() * 5)],
    level: entry.level || { current: Math.floor(entry.streak / 3) + 1, xp: 0, xpToNextLevel: 100, totalXp: 0, mode: 'infinite' as const },
    accuracy: entry.accuracy || Math.floor(Math.random() * 30) + 70,
    totalGamesPlayed: entry.totalGamesPlayed || Math.floor(entry.streak * 1.5),
  })), [leaderboard]);

  const enhancedEntries = viewMode === 'global' ? globalEntries : enhancedLocalEntries;

  const filteredEntries = useMemo(() => {
    let entries = [...enhancedEntries];
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
  }, [enhancedEntries, timeFilter, difficultyFilter, searchQuery, sortMode]);

  const handleClearLeaderboard = () => {
    if (typeof window !== 'undefined') {
      try {
        const storage = localStorage.getItem('anime-guess-game-storage');
        if (storage) {
          const data = JSON.parse(storage);
          data.state.leaderboard = [];
          localStorage.setItem('anime-guess-game-storage', JSON.stringify(data));
        }
      } catch { /* ignore */ }
    }
    window.location.reload();
  };

  const stats = useMemo(() => {
    if (viewMode === 'global') return { totalEntries: globalStats.totalPlayers, highestStreak: globalStats.highestStreak, totalPoints: globalStats.highestPoints, avgAccuracy: 0 };
    if (filteredEntries.length === 0) return { totalEntries: 0, highestStreak: 0, totalPoints: 0, avgAccuracy: 0 };
    return {
      totalEntries: filteredEntries.length,
      highestStreak: Math.max(...filteredEntries.map((e) => e.streak)),
      totalPoints: filteredEntries.reduce((sum, e) => sum + e.points, 0),
      avgAccuracy: Math.round(filteredEntries.reduce((sum, e) => sum + (e.accuracy || 0), 0) / filteredEntries.length),
    };
  }, [filteredEntries, viewMode, globalStats]);

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
            <HoverButton onClick={() => setShowClearConfirm(true)} className="btn stat-red text-red-400">
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Clear Local Cache</span>
            </HoverButton>
          </div>

          <div className="text-center mb-6">
            <div className="flex-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">Leaderboard</h1>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-400">Top players and their epic achievements</p>

            {/* View Toggle */}
            <div className="flex-center gap-2 mt-4">
              <button onClick={() => setViewMode('global')} className={`btn ${viewMode === 'global' ? 'stat-blue text-blue-400' : 'btn-inactive'}`}>
                <Globe className="w-4 h-4" /> Global
              </button>
              <button onClick={() => setViewMode('local')} className={`btn ${viewMode === 'local' ? 'stat-green text-green-400' : 'btn-inactive'}`}>
                <Home className="w-4 h-4" /> Local
              </button>
              {viewMode === 'global' && (
                <button onClick={loadGlobalLeaderboard} disabled={isLoadingGlobal} className="btn btn-inactive">
                  <RefreshCw className={`w-4 h-4 ${isLoadingGlobal ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {viewMode === 'global' && globalUserRank && isAuthenticated && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 stat-yellow">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Your Rank: #{globalUserRank.rank} of {globalUserRank.totalPlayers}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard delay={100} className="stat-purple p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div><p className="text-sm text-gray-400">Players</p><p className="text-2xl font-bold text-purple-400">{stats.totalEntries}</p></div>
              </div>
            </StatCard>
            <StatCard delay={200} className="stat-orange p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <div><p className="text-sm text-gray-400">Best Streak</p><p className="text-2xl font-bold text-orange-400">{stats.highestStreak}</p></div>
              </div>
            </StatCard>
            <StatCard delay={300} className="stat-yellow p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div><p className="text-sm text-gray-400">Total Points</p><p className="text-2xl font-bold text-yellow-400">{stats.totalPoints.toLocaleString()}</p></div>
              </div>
            </StatCard>
            <StatCard delay={400} className="stat-green p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div><p className="text-sm text-gray-400">Avg Accuracy</p><p className="text-2xl font-bold text-green-400">{stats.avgAccuracy}%</p></div>
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
          <div className="card p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {(['streak', 'points', 'level', 'accuracy'] as SortMode[]).map((mode) => (
                    <FilterBtn key={mode} active={sortMode === mode} onClick={() => setSortMode(mode)} color="orange">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </FilterBtn>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Difficulty:</span>
                <div className="flex flex-wrap gap-2">
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
          {isLoadingGlobal && viewMode === 'global' ? (
            <div className="text-center py-16 card">
              <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Loading global leaderboard...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 card">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No entries found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Try adjusting your search or filters' : viewMode === 'global' ? 'Be the first to make it to the global leaderboard!' : 'Play the game and make it to the leaderboard!'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={entry.rank || index + 1} isCurrentUser={user?.id === entry.userId} />
            ))
          )}
        </AnimatedSection>

        {/* Clear Modal */}
        {showClearConfirm && (
          <Modal onClose={() => setShowClearConfirm(false)}>
            <div className="card-dark p-6 max-w-md w-full border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
                <h2 className="text-2xl font-bold text-red-400">Clear Local Cache?</h2>
              </div>
              <p className="text-gray-300 mb-6">This will clear locally cached leaderboard data. Global entries are not affected.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 btn btn-secondary py-2">Cancel</button>
                <button onClick={() => { handleClearLeaderboard(); setShowClearConfirm(false); }} className="flex-1 btn bg-red-500 hover:bg-red-600 text-white py-2 font-semibold">Clear All</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
