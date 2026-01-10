'use client';

import { useState, useEffect } from 'react';
import { User, Edit, LogOut, Trophy, Flame, Target, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileCardProps {
  onEditProfile?: () => void;
  onLogout?: () => void;
}

// ============================================================================
// ANIMATED HELPER COMPONENTS (CSS-based)
// ============================================================================

function AnimatedCard({ children, className }: { children: React.ReactNode; className: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`${className} transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
      }`}
    >
      {children}
    </div>
  );
}

function HoverScaleElement({
  children,
  className,
  onClick,
  as = 'div',
}: {
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  as?: 'div' | 'button';
}) {
  const hoverClass = 'transition-transform duration-100 hover:scale-[1.03] active:scale-[0.98]';

  if (as === 'button') {
    return (
      <button className={`${className} ${hoverClass}`} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <div className={`${className} ${hoverClass}`}>
      {children}
    </div>
  );
}

function AnimatedLevelBadge({ level }: { level: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full
               bg-gradient-to-br from-yellow-500 to-orange-500
               border-2 border-gray-900 flex items-center justify-center
               text-xs font-bold text-white shadow-lg
               transition-transform duration-200 ${isVisible ? 'scale-100' : 'scale-0'}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      {level}
    </div>
  );
}

function AnimatedProgressBar({ progress }: { progress: number }) {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setCurrentProgress(progress));
  }, [progress]);

  return (
    <div
      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
               shadow-lg shadow-purple-500/50 transition-all duration-400 ease-out"
      style={{ width: `${currentProgress}%` }}
    />
  );
}

function AnimatedBackground() {
  const [bgIndex, setBgIndex] = useState(0);
  const backgrounds = [
    'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
    'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
    'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 8000 / 3);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full h-full transition-all duration-[2000ms]"
      style={{ background: backgrounds[bgIndex] }}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileCard({ onEditProfile, onLogout }: ProfileCardProps) {
  const { user, logout } = useAuth();
  const level = user?.profile?.level ?? 1;
  const coins = user?.profile?.coins ?? 0;
  const stats = {
    gamesPlayed: user?.profile?.gamesPlayed ?? 0,
    correctGuesses: user?.profile?.correctGuesses ?? 0,
    wrongGuesses: (user?.profile?.totalGuesses ?? 0) - (user?.profile?.correctGuesses ?? 0),
    highestStreak: user?.profile?.highestStreak ?? 0,
    totalPoints: user?.profile?.coins ?? 0,
    perfectGames: 0,
  };

  // Calculate XP progress
  const xp = user?.profile?.xp ?? 0;
  const BASE_XP = 100;
  const XP_MULTIPLIER = 1.5;
  const getXpForCurrentLevel = (lvl: number): number => {
    if (lvl <= 1) return 0;
    return Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, lvl - 1));
  };
  const calculateXpForNextLevel = (lvl: number): number => {
    return Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, lvl));
  };
  const currentLevelXp = getXpForCurrentLevel(level);
  const nextLevelXp = calculateXpForNextLevel(level);
  const currentXp = xp - currentLevelXp;
  const requiredXp = nextLevelXp - currentLevelXp;
  const progress = requiredXp > 0 ? (currentXp / requiredXp) * 100 : 0;

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  return (
    <AnimatedCard
      className="w-full max-w-md bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900
               border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden relative"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <AnimatedBackground />
      </div>

      {/* Header Section with Avatar */}
      <div className="relative pt-8 pb-4 px-6 bg-gradient-to-b from-purple-600/20 to-transparent">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <HoverScaleElement className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                          p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-purple-400" />
                )}
              </div>
            </div>
            {/* Level Badge */}
            <AnimatedLevelBadge level={level} />
          </HoverScaleElement>

          {/* Username and Title */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-sm text-purple-300">Anime Master</p>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="px-6 pb-4 relative">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Level {level}</span>
          <span>{currentXp} / {requiredXp} XP</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <AnimatedProgressBar progress={progress} />
        </div>
      </div>

      {/* Coins Display */}
      <div className="px-6 pb-4 relative">
        <HoverScaleElement
          className="stat-yellow p-3 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500
                        flex items-center justify-center shadow-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Coins</p>
            <p className="text-xl font-bold text-yellow-400">{coins.toLocaleString()}</p>
          </div>
        </HoverScaleElement>
      </div>

      {/* Stats Grid */}
      <div className="px-6 pb-6 relative">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Quick Stats
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Games Played */}
          <HoverScaleElement className="stat-purple p-3 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{stats.gamesPlayed}</p>
            <p className="text-xs text-gray-400">Games</p>
          </HoverScaleElement>

          {/* Accuracy */}
          <HoverScaleElement className="stat-green p-3 text-center">
            <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {stats.gamesPlayed > 0
                ? Math.round((stats.correctGuesses / (stats.correctGuesses + stats.wrongGuesses)) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-400">Accuracy</p>
          </HoverScaleElement>

          {/* Streak */}
          <HoverScaleElement className="stat-orange p-3 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{stats.highestStreak}</p>
            <p className="text-xs text-gray-400">Best Streak</p>
          </HoverScaleElement>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex gap-3 relative">
        <HoverScaleElement
          as="button"
          onClick={onEditProfile}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600
                   text-white font-semibold rounded-lg shadow-lg
                   hover:from-purple-700 hover:to-pink-700
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50
                   transition-all duration-300
                   flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </HoverScaleElement>

        <HoverScaleElement
          as="button"
          onClick={handleLogout}
          className="py-3 px-4 bg-gray-800 border-2 border-gray-700
                   text-gray-300 font-semibold rounded-lg
                   hover:bg-gray-700 hover:border-red-500/50 hover:text-white
                   focus:outline-none focus:ring-2 focus:ring-red-500/50
                   transition-all duration-300
                   flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
        </HoverScaleElement>
      </div>

      {/* Additional Stats Section */}
      <div className="px-6 pb-6 border-t border-purple-500/20 pt-4 relative">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Points:</span>
            <span className="text-white font-semibold">{stats.totalPoints.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Correct:</span>
            <span className="text-green-400 font-semibold">{stats.correctGuesses}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Best Streak:</span>
            <span className="text-orange-400 font-semibold">{stats.highestStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Perfect Games:</span>
            <span className="text-purple-400 font-semibold">{stats.perfectGames}</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
