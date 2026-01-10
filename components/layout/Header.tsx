"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Trophy, ShoppingBag, Menu, X, Coins, Zap, LogIn, UserPlus, User, Package, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileDropdown from "@/components/profile/ProfileDropdown";

const navLinks = [
  { href: "/", label: "Play", icon: Gamepad2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
];

// CSS-based hover scale (no JS blocking)
function HoverScale({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-transform duration-100 hover:scale-[1.03] ${className || ''}`}>
      {children}
    </div>
  );
}

// CSS-based hover scale with active state
function HoverScaleTap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-transform duration-100 hover:scale-[1.03] active:scale-[0.97] ${className || ''}`}>
      {children}
    </div>
  );
}

// Animated spin on hover for logo (CSS-based)
function SpinOnHover({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`${className || ''} transition-transform duration-300 hover:rotate-[360deg]`}>
      {children}
    </div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Get auth state and user data from useAuth hook
  const { isAuthenticated, user, logout } = useAuth();
  const coins = user?.profile?.coins ?? 0;
  const level = user?.profile?.level ?? 1;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Animate mobile menu with CSS
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        mobileMenuRef.current.style.display = 'block';
        mobileMenuRef.current.style.transition = 'opacity 120ms ease-out, max-height 120ms ease-out';
        mobileMenuRef.current.style.maxHeight = '0px';
        mobileMenuRef.current.style.opacity = '0';
        requestAnimationFrame(() => {
          if (mobileMenuRef.current) {
            mobileMenuRef.current.style.maxHeight = `${mobileMenuRef.current.scrollHeight}px`;
            mobileMenuRef.current.style.opacity = '1';
          }
        });
      } else {
        mobileMenuRef.current.style.transition = 'opacity 120ms ease-in, max-height 120ms ease-in';
        mobileMenuRef.current.style.maxHeight = '0px';
        mobileMenuRef.current.style.opacity = '0';
        setTimeout(() => {
          if (mobileMenuRef.current) {
            mobileMenuRef.current.style.display = 'none';
          }
        }, 120);
      }
    }
  }, [mobileMenuOpen]);

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
            <SpinOnHover>
              <Gamepad2 className="h-7 w-7 text-accent" />
            </SpinOnHover>
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
                    <div
                      ref={indicatorRef}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent-purple"
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
                <HoverScale className="flex items-center space-x-2 px-4 py-2 stat-yellow">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                </HoverScale>

                {/* Level Display */}
                <HoverScale className="flex items-center space-x-2 px-4 py-2 stat-purple">
                  <Zap className="h-5 w-5 text-accent" />
                  <span className="font-bold text-accent">Lv {level}</span>
                </HoverScale>

                {/* Profile Dropdown */}
                <ProfileDropdown />
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link href="/login">
                  <HoverScaleTap className="btn btn-secondary cursor-pointer">
                    <LogIn className="h-4 w-4 text-accent" />
                    <span className="font-nav tracking-wide text-text-primary">Login</span>
                  </HoverScaleTap>
                </Link>

                {/* Sign Up Button */}
                <Link href="/signup">
                  <HoverScaleTap className="btn btn-gradient cursor-pointer">
                    <UserPlus className="h-4 w-4 text-white" />
                    <span className="font-nav tracking-wide text-white">Sign Up</span>
                  </HoverScaleTap>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-bg-card transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-text-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="md:hidden border-t border-bg-card/50 bg-bg-primary/95 backdrop-blur-xl overflow-hidden"
        style={{ display: 'none', opacity: 0 }}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {isAuthenticated ? (
            <>
              {/* Mobile User Info Display */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center justify-between px-4 py-3 stat-yellow">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="text-text-secondary text-sm">Coins</span>
                  </div>
                  <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 stat-purple">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-accent" />
                    <span className="text-text-secondary text-sm">Level</span>
                  </div>
                  <span className="font-bold text-accent">{level}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Mobile Auth Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary flex-center py-3"
                >
                  <LogIn className="h-4 w-4 text-accent" />
                  <span className="font-nav tracking-wide text-text-primary">Login</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-gradient flex-center py-3"
                >
                  <UserPlus className="h-4 w-4 text-white" />
                  <span className="font-nav tracking-wide text-white">Sign Up</span>
                </Link>
              </div>
            </>
          )}

          {/* Mobile Navigation Links */}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
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
            );
          })}

          {/* Mobile Profile Links (Authenticated Users) */}
          {isAuthenticated && (
            <>
              <div className="border-t border-bg-card/50 my-2" />
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === "/profile"
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-nav tracking-wide">Profile</span>
              </Link>
              <Link
                href="/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === "/inventory"
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="font-nav tracking-wide">Inventory</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === "/settings"
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="font-nav tracking-wide">Settings</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-nav tracking-wide">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
