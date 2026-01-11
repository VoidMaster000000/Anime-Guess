"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Trophy, ShoppingBag, Menu, X, Coins, LogIn, UserPlus, User, Package, Settings, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { motion, iconSpin, buttonHover } from "@/lib/animations";
import { getXpProgress } from "@/lib/xpCalculations";

const navLinks = [
  { href: "/", label: "Play", icon: Gamepad2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Get auth state and user data from useAuth hook
  const { isAuthenticated, user, logout } = useAuth();
  const coins = user?.profile?.coins ?? 0;

  // Calculate XP progress using shared utility (handles old data format)
  const xpData = getXpProgress(user?.profile);
  const level = xpData.level;
  const xpProgress = xpData.progress;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Don't show header on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-card/50 bg-bg-primary/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <motion.div
              variants={iconSpin}
              initial="rest"
              whileHover="hover"
            >
              <Gamepad2 className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
            </motion.div>
            <span className="text-lg sm:text-2xl font-logo tracking-wide bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent">
              Anime Guess
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-text-secondary group-hover:text-accent"}`} />
                    <span className={`font-nav tracking-wide ${isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                      {link.label}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent-purple"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Info / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Coins Display - Gaming Chip Style */}
                <Link href="/shop" aria-label={`${coins.toLocaleString()} coins. Go to shop`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-full hover:border-yellow-400/50 transition-all">
                      <div className="relative">
                        <Coins className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                        <motion.div
                          className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="font-bold text-sm text-yellow-400 tabular-nums">{coins.toLocaleString()}</span>
                      <Sparkles className="h-3 w-3 text-yellow-500/50 group-hover:text-yellow-400 transition-colors" aria-hidden="true" />
                    </div>
                  </motion.div>
                </Link>

                {/* Level Display - Gaming Badge with XP Bar */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="relative group"
                  role="status"
                  aria-label={`Level ${level}, ${Math.round(xpProgress)}% progress to next level`}
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border border-purple-500/30 rounded-full hover:border-purple-400/50 transition-all">
                    <div className="relative flex items-center justify-center w-6 h-6 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full" aria-hidden="true">
                      <span className="text-[10px] font-black text-white">{level}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 leading-none" aria-hidden="true">LEVEL</span>
                      <div
                        className="w-12 h-1.5 bg-zinc-700/50 rounded-full overflow-hidden mt-0.5"
                        role="progressbar"
                        aria-valuenow={Math.round(xpProgress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="XP progress"
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Profile Dropdown */}
                <ProfileDropdown />
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link href="/login">
                  <motion.div
                    variants={buttonHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    className="btn btn-secondary cursor-pointer"
                  >
                    <LogIn className="h-4 w-4 text-accent" />
                    <span className="font-nav tracking-wide text-text-primary">Login</span>
                  </motion.div>
                </Link>

                {/* Sign Up Button */}
                <Link href="/signup">
                  <motion.div
                    variants={buttonHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    className="btn btn-gradient cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 text-white" />
                    <span className="font-nav tracking-wide text-white">Sign Up</span>
                  </motion.div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile User Info - Compact display for authenticated users */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <>
                {/* Mobile Coins - Compact */}
                <Link
                  href="/shop"
                  className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
                  aria-label={`${coins.toLocaleString()} coins`}
                >
                  <Coins className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400 tabular-nums">{coins >= 1000 ? `${(coins/1000).toFixed(1)}k` : coins}</span>
                </Link>

                {/* Mobile Level Badge - Compact */}
                <div
                  className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full"
                  aria-label={`Level ${level}`}
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-black text-white">{level}</span>
                  </div>
                  <Sparkles className="h-3 w-3 text-purple-400" />
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-bg-card transition-all duration-100 hover:scale-105 active:scale-95"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-text-primary" />
              ) : (
                <Menu className="h-6 w-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Simple Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-zinc-800 bg-zinc-900"
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-3">
            {/* Navigation Links */}
            <div className="grid grid-cols-3 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                        : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 active:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <>
                {/* Account Links */}
                <div className="flex gap-2">
                  {[
                    { href: "/profile", icon: User, label: "Profile" },
                    { href: "/inventory", icon: Package, label: "Inventory" },
                    { href: "/settings", icon: Settings, label: "Settings" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-purple-500/15 text-purple-400"
                          : "bg-zinc-800/30 text-zinc-400 active:bg-zinc-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-red-400 bg-red-500/10 active:bg-red-500/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg transition-colors active:bg-zinc-700"
                >
                  <LogIn className="h-4 w-4 text-purple-400" />
                  <span className="font-medium text-white text-sm">Login</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-white" />
                  <span className="font-medium text-white text-sm">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
