"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Trophy,
  Coins,
  Zap,
  ChevronDown,
  Settings,
  Package,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence, fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

interface ProfileDropdownProps {
  onNavigate?: (page: 'profile' | 'inventory' | 'settings') => void;
  onLogout?: () => void;
}

export default function ProfileDropdown({ onNavigate, onLogout }: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const level = user?.profile?.level ?? 1;
  const xp = user?.profile?.xp ?? 0;
  const coins = user?.profile?.coins ?? 0;
  const stats = {
    highestStreak: user?.profile?.highestStreak ?? 0,
    gamesPlayed: user?.profile?.gamesPlayed ?? 0,
    correctGuesses: user?.profile?.correctGuesses ?? 0,
    wrongGuesses: (user?.profile?.totalGuesses ?? 0) - (user?.profile?.correctGuesses ?? 0),
  };

  // Calculate XP progress
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
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
    setIsOpen(false);
  };

  const handleNavigation = (page: 'profile' | 'inventory' | 'settings') => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      router.push(`/${page}`);
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button - Gaming Style */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="relative group"
      >
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 border border-zinc-700/50 hover:border-purple-500/30 transition-all duration-200">
          {/* Avatar with glow ring */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                {user.avatarImage ? (
                  <img
                    src={user.avatarImage}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-zinc-400" />
                )}
              </div>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
          </div>

          {/* User Info - Hidden on mobile */}
          <div className="hidden lg:flex flex-col items-start">
            <p className="text-sm font-semibold text-white leading-tight">{user.username}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Online</p>
          </div>

          {/* Chevron with rotation */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-zinc-500 group-hover:text-purple-400 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.button>

      {/* Dropdown Menu - Gaming Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden z-50"
          >
            {/* Profile Header - Gaming Style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="p-4 bg-gradient-to-br from-purple-500/10 via-zinc-800/50 to-cyan-500/10 border-b border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="relative"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px]">
                    <div className="w-full h-full rounded-[10px] bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {user.avatarImage ? (
                        <img
                          src={user.avatarImage}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-zinc-500" />
                      )}
                    </div>
                  </div>
                  {/* Level badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-md flex items-center justify-center">
                    <span className="text-[10px] font-black text-white">{level}</span>
                  </div>
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-white text-lg">{user.username}</p>
                  {user.email && (
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  )}
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 uppercase tracking-wider">Level {level}</span>
                  <span className="text-purple-400 font-semibold">{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
                </div>
                <div className="relative w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
            </motion.div>

            {/* Stats Grid - Gaming Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-3 grid grid-cols-2 gap-2 border-b border-zinc-700/50"
            >
              {/* Coins */}
              <motion.div
                variants={staggerItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-yellow-500/15 to-amber-500/5 border border-yellow-500/20"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase">Coins</p>
                  <p className="text-sm font-bold text-yellow-400 tabular-nums">{coins.toLocaleString()}</p>
                </div>
              </motion.div>

              {/* Highest Streak */}
              <motion.div
                variants={staggerItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-orange-500/15 to-red-500/5 border border-orange-500/20"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase">Best Streak</p>
                  <p className="text-sm font-bold text-orange-400">{stats.highestStreak}</p>
                </div>
              </motion.div>

              {/* Games Played */}
              <motion.div
                variants={staggerItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/5 border border-blue-500/20"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase">Games</p>
                  <p className="text-sm font-bold text-blue-400">{stats.gamesPlayed}</p>
                </div>
              </motion.div>

              {/* Accuracy */}
              <motion.div
                variants={staggerItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-green-500/15 to-emerald-500/5 border border-green-500/20"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase">Accuracy</p>
                  <p className="text-sm font-bold text-green-400">
                    {stats.gamesPlayed > 0
                      ? Math.round((stats.correctGuesses / (stats.correctGuesses + stats.wrongGuesses)) * 100)
                      : 0}%
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Menu Items - Gaming Style */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-2"
            >
              {[
                { page: 'profile' as const, icon: User, label: 'Profile', color: 'purple' },
                { page: 'inventory' as const, icon: Package, label: 'Inventory', color: 'cyan' },
                { page: 'settings' as const, icon: Settings, label: 'Settings', color: 'zinc' },
              ].map((item) => (
                <motion.button
                  key={item.page}
                  variants={staggerItem}
                  whileHover={{ x: 4 }}
                  onClick={() => handleNavigation(item.page)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group hover:bg-zinc-800/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                    <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </motion.button>
              ))}

              <div className="my-2 h-px bg-zinc-800" />

              <motion.button
                variants={staggerItem}
                whileHover={{ x: 4 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group hover:bg-red-500/10"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
                </div>
                <span className="text-sm text-zinc-300 group-hover:text-red-400 transition-colors">
                  Logout
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
