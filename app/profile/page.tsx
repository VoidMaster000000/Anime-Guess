'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Award,
  Star,
  Edit2,
  X,
  Check,
  Camera,
  Trash2,
  Coins,
  Flame,
  Crown,
  Shield,
  Gamepad2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from '@/lib/animations';

// ============================================================================
// XP CALCULATION HELPERS
// ============================================================================

const BASE_XP = 100;
const XP_MULTIPLIER = 1.5;

const getXpForCurrentLevel = (lvl: number): number => {
  if (lvl <= 1) return 0;
  return Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, lvl - 1));
};

const calculateXpForNextLevel = (lvl: number): number => {
  return Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, lvl));
};

// ============================================================================
// LEVEL TIER SYSTEM
// ============================================================================

interface LevelTier {
  name: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
}

const LEVEL_TIERS: Record<number, LevelTier> = {
  0: { name: 'Bronze', gradient: 'from-amber-700 to-yellow-700', glowColor: 'rgba(217, 119, 6, 0.5)', borderColor: 'border-amber-500/30' },
  1: { name: 'Silver', gradient: 'from-slate-400 to-zinc-400', glowColor: 'rgba(148, 163, 184, 0.6)', borderColor: 'border-slate-400/30' },
  2: { name: 'Gold', gradient: 'from-yellow-500 to-amber-500', glowColor: 'rgba(234, 179, 8, 0.6)', borderColor: 'border-yellow-500/30' },
  3: { name: 'Platinum', gradient: 'from-cyan-300 to-teal-400', glowColor: 'rgba(34, 211, 238, 0.6)', borderColor: 'border-cyan-400/30' },
  4: { name: 'Diamond', gradient: 'from-blue-400 to-purple-500', glowColor: 'rgba(147, 51, 234, 0.6)', borderColor: 'border-purple-500/30' },
  5: { name: 'Master', gradient: 'from-rose-500 to-fuchsia-500', glowColor: 'rgba(236, 72, 153, 0.7)', borderColor: 'border-pink-500/30' },
  6: { name: 'Grandmaster', gradient: 'from-orange-500 to-red-500', glowColor: 'rgba(239, 68, 68, 0.7)', borderColor: 'border-red-500/30' },
  7: { name: 'Legend', gradient: 'from-violet-600 to-indigo-600', glowColor: 'rgba(139, 92, 246, 0.8)', borderColor: 'border-violet-500/30' },
  8: { name: 'Mythic', gradient: 'from-emerald-400 to-cyan-500', glowColor: 'rgba(52, 211, 153, 0.8)', borderColor: 'border-emerald-500/30' },
  9: { name: 'Immortal', gradient: 'from-yellow-300 to-orange-500', glowColor: 'rgba(251, 191, 36, 0.9)', borderColor: 'border-yellow-400/30' },
  10: { name: 'Transcendent', gradient: 'from-white to-pink-200', glowColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'border-white/30' },
};

function getLevelTier(level: number): LevelTier {
  const tierIndex = Math.min(Math.floor(level / 5), 10);
  return LEVEL_TIERS[tierIndex];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const level = user?.profile?.level ?? 1;
  const xp = user?.profile?.xp ?? 0;
  const tier = getLevelTier(level);

  // XP Progress calculation
  const currentLevelXp = getXpForCurrentLevel(level);
  const nextLevelXp = calculateXpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const xpProgress = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Profile stats from MongoDB
  const stats = {
    gamesPlayed: user?.profile?.gamesPlayed ?? 0,
    correctGuesses: user?.profile?.correctGuesses ?? 0,
    totalGuesses: user?.profile?.totalGuesses ?? 0,
    highestStreak: user?.profile?.highestStreak ?? 0,
    totalXp: user?.profile?.totalXp ?? 0,
    coins: user?.profile?.coins ?? 0,
  };

  const accuracy = stats.totalGuesses > 0
    ? (stats.correctGuesses / stats.totalGuesses) * 100
    : 0;

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || 'Player');
  const [editAvatarImage, setEditAvatarImage] = useState<string | undefined>(user?.avatarImage);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated counters
  const [animatedStats, setAnimatedStats] = useState(stats);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        gamesPlayed: Math.floor(stats.gamesPlayed * progress),
        correctGuesses: Math.floor(stats.correctGuesses * progress),
        totalGuesses: Math.floor(stats.totalGuesses * progress),
        highestStreak: Math.floor(stats.highestStreak * progress),
        totalXp: Math.floor(stats.totalXp * progress),
        coins: Math.floor(stats.coins * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats.gamesPlayed, stats.correctGuesses, stats.totalGuesses, stats.highestStreak, stats.totalXp, stats.coins]);

  const handleSaveProfile = async () => {
    setEditError(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername, avatarImage: editAvatarImage }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        setIsEditModalOpen(false);
      } else {
        setEditError(data.error || 'Failed to update profile');
      }
    } catch {
      setEditError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 2 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = (e) => setEditAvatarImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* ============================================ */}
        {/* HERO SECTION - Profile Card */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8 overflow-hidden"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${tier.gradient} opacity-10 rounded-2xl`} />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent rounded-2xl" />

          <div className="relative p-6 sm:p-8 rounded-2xl border border-zinc-700/50 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

              {/* Left: Avatar & Level Badge */}
              <div className="flex flex-col items-center lg:items-start">
                {/* Avatar with Ring */}
                <div className="relative mb-4">
                  <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br ${tier.gradient} p-[3px]`}>
                    <div className="w-full h-full rounded-[13px] bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {user?.avatarImage ? (
                        <img src={user.avatarImage} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-600" />
                      )}
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className={`absolute -bottom-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 0 20px ${tier.glowColor}` }}
                  >
                    <span className="text-lg sm:text-xl font-black text-white">{level}</span>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                  >
                    <Edit2 className="w-4 h-4 text-zinc-400 hover:text-purple-400" />
                  </button>
                </div>

                {/* Tier Badge */}
                <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${tier.gradient} bg-opacity-20 border ${tier.borderColor}`}>
                  <span className="text-sm font-semibold text-white">{tier.name} Tier</span>
                </div>
              </div>

              {/* Right: User Info */}
              <div className="flex-1 text-center lg:text-left">
                {/* Username */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {user?.username || 'Player'}
                </h1>

                {/* Member Since */}
                <div className="flex items-center justify-center lg:justify-start gap-2 text-zinc-500 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>

                {/* XP Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-zinc-400">Level Progress</span>
                    </div>
                    <span className="text-sm text-purple-400 font-semibold">{Math.round(xpProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-zinc-500">{xpInCurrentLevel.toLocaleString()} XP</span>
                    <span className="text-xs text-zinc-500">{xpNeededForNextLevel.toLocaleString()} XP</span>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-zinc-500">Coins</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-400 tabular-nums">{animatedStats.coins.toLocaleString()}</span>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-zinc-500">Best Streak</span>
                    </div>
                    <span className="text-xl font-bold text-orange-400 tabular-nums">{animatedStats.highestStreak}</span>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-zinc-500">Accuracy</span>
                    </div>
                    <span className="text-xl font-bold text-green-400">{accuracy.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* STATS GRID */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Statistics</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Games Played */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl border border-blue-500/20 p-4 sm:p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <Gamepad2 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums">
                {animatedStats.gamesPlayed.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-500">Games Played</div>
            </motion.div>

            {/* Correct Guesses */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20 p-4 sm:p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums">
                {animatedStats.correctGuesses.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-500">Correct Guesses</div>
            </motion.div>

            {/* Total XP */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl border border-purple-500/20 p-4 sm:p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums">
                {animatedStats.totalXp.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-500">Total XP Earned</div>
            </motion.div>

            {/* Win Rate */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-xl border border-yellow-500/20 p-4 sm:p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-3">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-zinc-500">Win Rate</div>
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* ACHIEVEMENTS & QUICK ACTIONS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Achievements</h2>
            </div>

            <div className="bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-6 min-h-[200px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-yellow-500/50" />
              </div>
              <p className="text-zinc-400 text-center mb-2">Achievements coming soon!</p>
              <p className="text-zinc-600 text-sm text-center">Complete challenges to unlock special badges</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border border-purple-500/20 p-4 cursor-pointer hover:border-purple-500/40 transition-colors"
                >
                  <Gamepad2 className="w-6 h-6 text-purple-400 mb-2" />
                  <div className="font-semibold text-white mb-1">Play Game</div>
                  <div className="text-xs text-zinc-500">Start a new round</div>
                </motion.div>
              </Link>

              <Link href="/shop">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl border border-yellow-500/20 p-4 cursor-pointer hover:border-yellow-500/40 transition-colors"
                >
                  <Coins className="w-6 h-6 text-yellow-400 mb-2" />
                  <div className="font-semibold text-white mb-1">Shop</div>
                  <div className="text-xs text-zinc-500">Buy power-ups</div>
                </motion.div>
              </Link>

              <Link href="/leaderboard">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl border border-cyan-500/20 p-4 cursor-pointer hover:border-cyan-500/40 transition-colors"
                >
                  <Trophy className="w-6 h-6 text-cyan-400 mb-2" />
                  <div className="font-semibold text-white mb-1">Leaderboard</div>
                  <div className="text-xs text-zinc-500">View rankings</div>
                </motion.div>
              </Link>

              <Link href="/inventory">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/20 p-4 cursor-pointer hover:border-green-500/40 transition-colors"
                >
                  <Star className="w-6 h-6 text-green-400 mb-2" />
                  <div className="font-semibold text-white mb-1">Inventory</div>
                  <div className="text-xs text-zinc-500">View items</div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ============================================ */}
      {/* EDIT PROFILE MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-700/50 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px]">
                      <div className="w-full h-full rounded-[10px] bg-zinc-900 flex items-center justify-center overflow-hidden">
                        {editAvatarImage ? (
                          <img src={editAvatarImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-zinc-600" />
                        )}
                      </div>
                    </div>
                    {editAvatarImage && (
                      <button
                        onClick={() => { setEditAvatarImage(undefined); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{editAvatarImage ? 'Change' : 'Upload'} Image</span>
                    </label>
                    <p className="text-xs text-zinc-600 mt-2">Max 2MB • JPG, PNG, GIF</p>
                  </div>
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="Enter username"
                  />
                </div>

                {/* Error Message */}
                {editError && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">{editError}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-zinc-800/50 border-t border-zinc-700/50 flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
