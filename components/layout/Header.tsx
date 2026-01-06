"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Trophy, ShoppingBag, Menu, X, Coins, Zap, LogIn, UserPlus } from "lucide-react";
import { animate } from "@/lib/animejs";
import { useAuth } from "@/hooks/useAuth";
import ProfileDropdown from "@/components/profile/ProfileDropdown";

const navLinks = [
  { href: "/", label: "Play", icon: Gamepad2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
];

// Hover animation component
function HoverScale({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, duration: 200, ease: 'outQuad' });
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// Hover scale with tap animation
function HoverScaleTap({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (ref.current) {
      animate(ref.current, { scale: 0.95, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, duration: 100, ease: 'outQuad' });
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </div>
  );
}

// Spin on hover component
function SpinOnHover({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { rotate: 360, duration: 600, ease: 'inOutQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      // Reset rotation without animation
      ref.current.style.transform = 'rotate(0deg)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
  const { isAuthenticated, user } = useAuth();
  const coins = user?.profile?.coins ?? 0;
  const level = user?.profile?.level ?? 1;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Animate mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        mobileMenuRef.current.style.display = 'block';
        animate(mobileMenuRef.current, {
          opacity: [0, 1],
          height: [0, mobileMenuRef.current.scrollHeight],
          duration: 200,
          ease: 'outQuad',
        });
      } else {
        animate(mobileMenuRef.current, {
          opacity: [1, 0],
          height: [mobileMenuRef.current.scrollHeight, 0],
          duration: 200,
          ease: 'inQuad',
          onComplete: () => {
            if (mobileMenuRef.current) {
              mobileMenuRef.current.style.display = 'none';
            }
          },
        });
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
                <HoverScale className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-bg-card border border-yellow-500/20">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                </HoverScale>

                {/* Level Display */}
                <HoverScale className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-bg-card border border-accent/20">
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
                  <HoverScaleTap className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-bg-card border border-accent/20 hover:border-accent/40 transition-all duration-200 cursor-pointer">
                    <LogIn className="h-4 w-4 text-accent" />
                    <span className="font-nav tracking-wide text-text-primary">Login</span>
                  </HoverScaleTap>
                </Link>

                {/* Sign Up Button */}
                <Link href="/signup">
                  <HoverScaleTap className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-purple hover:from-accent/90 hover:to-accent-purple/90 transition-all duration-200 cursor-pointer">
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
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-card border border-yellow-500/20">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="text-text-secondary text-sm">Coins</span>
                  </div>
                  <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-card border border-accent/20">
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
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-bg-card border border-accent/20 hover:border-accent/40 transition-colors"
                >
                  <LogIn className="h-4 w-4 text-accent" />
                  <span className="font-nav tracking-wide text-text-primary">Login</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-accent to-accent-purple"
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
        </div>
      </div>
    </header>
  );
}
