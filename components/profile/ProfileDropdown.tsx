"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { animate } from "@/lib/animejs";
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

interface ProfileDropdownProps {
  onNavigate?: (page: 'profile' | 'inventory' | 'settings') => void;
  onLogout?: () => void;
}

// Animated dropdown panel
function DropdownPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [-5, 0],
        scale: [0.97, 1],
        duration: 100,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-72 bg-bg-card border border-bg-card/50 rounded-xl shadow-2xl overflow-hidden z-50"
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  );
}

// Animated progress bar
function AnimatedProgress({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        width: [0, `${progress}%`],
        duration: 250,
        ease: 'outQuad',
      });
    }
  }, [progress]);

  return (
    <div
      ref={ref}
      className="h-full bg-gradient-to-r from-accent to-accent-purple"
      style={{ width: 0 }}
    />
  );
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
      // Default navigation using router
      router.push(`/${page}`);
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <ChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <DropdownPanel onClose={() => setIsOpen(false)}>
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent-purple/10 border-b border-accent/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center overflow-hidden">
                {user.avatarImage ? (
                  <img
                    src={user.avatarImage}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
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
                <AnimatedProgress progress={progress} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 border-b border-bg-card/50">
            {/* Coins */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Coins className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs text-text-secondary">Coins</p>
                <p className="text-sm font-bold text-yellow-500">{coins}</p>
              </div>
            </div>

            {/* Highest Streak */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Zap className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-text-secondary">Best Streak</p>
                <p className="text-sm font-bold text-orange-500">{stats.highestStreak}</p>
              </div>
            </div>

            {/* Games Played */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Trophy className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-text-secondary">Games</p>
                <p className="text-sm font-bold text-blue-500">{stats.gamesPlayed}</p>
              </div>
            </div>

            {/* Accuracy */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
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
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => handleNavigation('profile')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-bg-primary transition-colors group"
            >
              <User className="w-4 h-4 text-text-secondary group-hover:text-accent" />
              <span className="text-sm text-text-primary group-hover:text-accent">
                Profile
              </span>
            </button>

            <button
              onClick={() => handleNavigation('inventory')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-bg-primary transition-colors group"
            >
              <Package className="w-4 h-4 text-text-secondary group-hover:text-accent" />
              <span className="text-sm text-text-primary group-hover:text-accent">
                Inventory
              </span>
            </button>

            <button
              onClick={() => handleNavigation('settings')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-bg-primary transition-colors group"
            >
              <Settings className="w-4 h-4 text-text-secondary group-hover:text-accent" />
              <span className="text-sm text-text-primary group-hover:text-accent">
                Settings
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-text-secondary group-hover:text-red-500" />
              <span className="text-sm text-text-primary group-hover:text-red-500">
                Logout
              </span>
            </button>
          </div>
        </DropdownPanel>
      )}
    </div>
  );
}
