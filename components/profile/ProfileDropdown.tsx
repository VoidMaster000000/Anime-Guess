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
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-bg-card border border-accent/20 hover:border-accent/40 transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center overflow-hidden">
            {user.avatarImage ? (
              <img
                src={user.avatarImage}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>

          {/* User Info - Hidden on mobile */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-text-primary">{user.username}</p>
            <p className="text-xs text-text-secondary">Level {level}</p>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-bg-card border border-bg-card/50 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="p-4 bg-gradient-to-br from-accent/10 to-accent-purple/10 border-b border-accent/20"
            >
              <div className="flex items-center space-x-3 mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center overflow-hidden"
                >
                  {user.avatarImage ? (
                    <img
                      src={user.avatarImage}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary">{user.username}</p>
                  {user.email && (
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Level {level}</span>
                  <span className="text-accent font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-accent-purple"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-4 grid grid-cols-2 gap-3 border-b border-bg-card/50"
            >
              {/* Coins */}
              <motion.div
                variants={staggerItem}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
              >
                <Coins className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-text-secondary">Coins</p>
                  <p className="text-sm font-bold text-yellow-500">{coins}</p>
                </div>
              </motion.div>

              {/* Highest Streak */}
              <motion.div
                variants={staggerItem}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20"
              >
                <Zap className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-text-secondary">Best Streak</p>
                  <p className="text-sm font-bold text-orange-500">{stats.highestStreak}</p>
                </div>
              </motion.div>

              {/* Games Played */}
              <motion.div
                variants={staggerItem}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
              >
                <Trophy className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-text-secondary">Games</p>
                  <p className="text-sm font-bold text-blue-500">{stats.gamesPlayed}</p>
                </div>
              </motion.div>

              {/* Accuracy */}
              <motion.div
                variants={staggerItem}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <BarChart3 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-text-secondary">Accuracy</p>
                  <p className="text-sm font-bold text-green-500">
                    {stats.gamesPlayed > 0
                      ? Math.round((stats.correctGuesses / (stats.correctGuesses + stats.wrongGuesses)) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Menu Items */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-2"
            >
              {[
                { page: 'profile' as const, icon: User, label: 'Profile' },
                { page: 'inventory' as const, icon: Package, label: 'Inventory' },
                { page: 'settings' as const, icon: Settings, label: 'Settings' },
              ].map((item) => (
                <motion.button
                  key={item.page}
                  variants={staggerItem}
                  whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.2)" }}
                  onClick={() => handleNavigation(item.page)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group"
                >
                  <item.icon className="w-4 h-4 text-text-secondary group-hover:text-accent" />
                  <span className="text-sm text-text-primary group-hover:text-accent">
                    {item.label}
                  </span>
                </motion.button>
              ))}

              <motion.button
                variants={staggerItem}
                whileHover={{ x: 4, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group"
              >
                <LogOut className="w-4 h-4 text-text-secondary group-hover:text-red-500" />
                <span className="text-sm text-text-primary group-hover:text-red-500">
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
