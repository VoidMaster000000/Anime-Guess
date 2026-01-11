'use client';

import { User, Edit, LogOut, Trophy, Flame, Target, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion, staggerContainer, staggerItem } from '@/lib/animations';

interface ProfileCardProps {
  onEditProfile?: () => void;
  onLogout?: () => void;
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

  // Calculate XP progress - matches backend: 100 + (level-1) * 50
  // profile.xp is already XP within current level (not total)
  const xp = user?.profile?.xp ?? 0;
  const requiredXp = 100 + (level - 1) * 50;
  const progress = Math.min((xp / requiredXp) * 100, 100);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900
               border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden relative"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        aria-hidden="true"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Header Section with Avatar */}
      <div className="relative pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6 bg-gradient-to-b from-purple-600/20 to-transparent">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                          p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.username}'s avatar`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-purple-400" aria-hidden="true" />
                )}
              </div>
            </div>
            {/* Level Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              aria-label={`Level ${level}`}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
                       bg-gradient-to-br from-yellow-500 to-orange-500
                       border-2 border-gray-900 flex items-center justify-center
                       text-xs font-bold text-white shadow-lg"
            >
              <span aria-hidden="true">{level}</span>
            </motion.div>
          </motion.div>

          {/* Username and Title */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-sm text-purple-300">Anime Master</p>
          </motion.div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4 relative">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Level {level}</span>
          <span>{currentXp} / {requiredXp} XP</span>
        </div>
        <div
          className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentXp}
          aria-valuemin={0}
          aria-valuemax={requiredXp}
          aria-label={`Experience progress: ${currentXp} of ${requiredXp} XP`}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
                     shadow-lg shadow-purple-500/50"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>

      {/* Coins Display */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4 relative">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="stat-yellow p-3 flex items-center gap-3"
          role="status"
          aria-label={`Coins: ${coins.toLocaleString()}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500
                        flex items-center justify-center shadow-lg" aria-hidden="true">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Coins</p>
            <p className="text-xl font-bold text-yellow-400" aria-hidden="true">{coins.toLocaleString()}</p>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative">
        <h3 id="quick-stats-heading" className="text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">
          Quick Stats
        </h3>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-2 sm:gap-3"
          role="group"
          aria-labelledby="quick-stats-heading"
        >
          {/* Games Played */}
          <motion.div
            variants={staggerItem}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="stat-purple p-3 text-center"
            role="status"
            aria-label={`Games played: ${stats.gamesPlayed}`}
          >
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xl font-bold text-white" aria-hidden="true">{stats.gamesPlayed}</p>
            <p className="text-xs text-gray-400">Games</p>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            variants={staggerItem}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="stat-green p-3 text-center"
            role="status"
            aria-label={`Accuracy: ${stats.gamesPlayed > 0 ? Math.round((stats.correctGuesses / (stats.correctGuesses + stats.wrongGuesses)) * 100) : 0}%`}
          >
            <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xl font-bold text-white" aria-hidden="true">
              {stats.gamesPlayed > 0
                ? Math.round((stats.correctGuesses / (stats.correctGuesses + stats.wrongGuesses)) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-400">Accuracy</p>
          </motion.div>

          {/* Streak */}
          <motion.div
            variants={staggerItem}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="stat-orange p-3 text-center"
            role="status"
            aria-label={`Best streak: ${stats.highestStreak}`}
          >
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xl font-bold text-white" aria-hidden="true">{stats.highestStreak}</p>
            <p className="text-xs text-gray-400">Best Streak</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2 sm:gap-3 relative">
        <motion.button
          onClick={onEditProfile}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600
                   text-white font-semibold rounded-lg shadow-lg
                   hover:from-purple-700 hover:to-pink-700
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50
                   transition-colors duration-300
                   flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" aria-hidden="true" />
          <span>Edit Profile</span>
        </motion.button>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Log out"
          className="py-3 px-4 bg-gray-800 border-2 border-gray-700
                   text-gray-300 font-semibold rounded-lg
                   hover:bg-gray-700 hover:border-red-500/50 hover:text-white
                   focus:outline-none focus:ring-2 focus:ring-red-500/50
                   transition-colors duration-300
                   flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Additional Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-purple-500/20 pt-3 sm:pt-4 relative"
      >
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
      </motion.div>
    </motion.div>
  );
}
