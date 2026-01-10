"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Trophy, ShoppingBag, Menu, X, Coins, Zap, LogIn, UserPlus, User, Package, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { motion, AnimatePresence, iconSpin, buttonHover } from "@/lib/animations";

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
  const level = user?.profile?.level ?? 1;

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
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              variants={iconSpin}
              initial="rest"
              whileHover="hover"
            >
              <Gamepad2 className="h-7 w-7 text-accent" />
            </motion.div>
            <span className="text-2xl font-logo tracking-wide bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent">
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
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Coins Display */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 px-4 py-2 stat-yellow"
                >
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                </motion.div>

                {/* Level Display */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 px-4 py-2 stat-purple"
                >
                  <Zap className="h-5 w-5 text-accent" />
                  <span className="font-bold text-accent">Lv {level}</span>
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

          {/* Mobile Menu Button */}
          <motion.button
            onClick={toggleMobileMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-lg hover:bg-bg-card transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-6 w-6 text-text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-6 w-6 text-text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-bg-card/50 bg-bg-primary/95 backdrop-blur-xl overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              className="container mx-auto px-4 py-4 space-y-2"
            >
              {isAuthenticated ? (
                <>
                  {/* Mobile User Info Display */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center justify-between px-4 py-3 stat-yellow"
                    >
                      <div className="flex items-center space-x-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span className="text-text-secondary text-sm">Coins</span>
                      </div>
                      <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center justify-between px-4 py-3 stat-purple"
                    >
                      <div className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-accent" />
                        <span className="text-text-secondary text-sm">Level</span>
                      </div>
                      <span className="font-bold text-accent">{level}</span>
                    </motion.div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Auth Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn btn-secondary flex-center py-3 w-full"
                      >
                        <LogIn className="h-4 w-4 text-accent" />
                        <span className="font-nav tracking-wide text-text-primary">Login</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn btn-gradient flex-center py-3 w-full"
                      >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span className="font-nav tracking-wide text-white">Sign Up</span>
                      </Link>
                    </motion.div>
                  </div>
                </>
              )}

              {/* Mobile Navigation Links */}
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-nav tracking-wide">{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile Profile Links (Authenticated Users) */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-bg-card/50 my-2" />
                  {[
                    { href: "/profile", icon: User, label: "Profile" },
                    { href: "/inventory", icon: Package, label: "Inventory" },
                    { href: "/settings", icon: Settings, label: "Settings" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          pathname === item.href
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-nav tracking-wide">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-nav tracking-wide">Logout</span>
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
