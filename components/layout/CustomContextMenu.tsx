'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import {
  Gamepad2,
  Trophy,
  ShoppingBag,
  User,
  Settings,
  LogIn,
  LogOut,
  Home,
  Package,
  RefreshCw,
  Sparkles,
  Crown,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/animations';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  highlight?: boolean;
  badge?: string;
}

// ============================================================================
// ANIMATED MENU ITEM
// ============================================================================

function AnimatedMenuItem({
  item,
  onClick,
  index,
}: {
  item: MenuItem;
  onClick: () => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={!item.disabled ? { scale: 1.02 } : undefined}
      whileTap={!item.disabled ? { scale: 0.98 } : undefined}
      transition={{ delay: index * 0.015, duration: 0.08 }}
      onClick={onClick}
      disabled={item.disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg mx-1 overflow-hidden
        ${item.disabled
          ? 'text-zinc-600 cursor-not-allowed'
          : item.highlight
            ? 'text-purple-400'
            : 'text-zinc-300'
        }`}
      style={{ width: 'calc(100% - 8px)' }}
      role="menuitem"
      aria-disabled={item.disabled}
    >
      {/* Hover background effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !item.disabled ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className={`absolute inset-0 z-0 ${
          item.highlight
            ? 'bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-transparent'
            : 'bg-gradient-to-r from-zinc-600/50 via-zinc-700/40 to-transparent'
        }`}
      />

      {/* Left accent line on hover */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isHovered && !item.disabled ? 28 : 0 }}
        transition={{ duration: 0.15 }}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[3px] rounded-full ${
          item.highlight
            ? 'bg-gradient-to-b from-purple-400 to-pink-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
            : 'bg-zinc-300'
        }`}
      />

      {/* Icon */}
      <motion.span
        animate={{
          scale: isHovered && !item.disabled ? 1.15 : 1,
          x: isHovered && !item.disabled ? 2 : 0,
        }}
        transition={{ duration: 0.15 }}
        className={`relative z-10 inline-flex ${
          item.disabled ? 'opacity-40' : ''
        } ${isHovered && !item.disabled && item.highlight ? 'text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]' : ''}
        ${isHovered && !item.disabled && !item.highlight ? 'text-white' : ''}`}
      >
        {item.icon}
      </motion.span>

      {/* Label */}
      <motion.span
        animate={{
          color: isHovered && !item.disabled
            ? item.highlight ? '#d8b4fe' : '#ffffff'
            : undefined,
        }}
        transition={{ duration: 0.15 }}
        className="relative z-10 flex-1 text-sm font-medium"
      >
        {item.label}
      </motion.span>

      {/* Badge */}
      {item.badge && (
        <span className={`relative z-10 px-1.5 py-0.5 text-[10px] font-bold rounded ${
          item.highlight
            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
            : 'bg-zinc-700 text-zinc-400'
        }`}>
          {item.badge}
        </span>
      )}

      {/* Arrow indicator */}
      {!item.disabled && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{
            opacity: isHovered ? 0.7 : 0,
            x: isHovered ? 0 : -8,
          }}
          transition={{ duration: 0.15 }}
          className="relative z-10"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 ${item.highlight ? 'text-purple-300' : 'text-zinc-400'}`}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </motion.button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CustomContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isUsingTouch, setIsUsingTouch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, logout } = useAuth();
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  // Detect actual touch usage
  useEffect(() => {
    let lastInputWasTouch = false;

    const handleTouchStart = () => {
      lastInputWasTouch = true;
      setIsUsingTouch(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!lastInputWasTouch && (e.movementX !== 0 || e.movementY !== 0)) {
        setIsUsingTouch(false);
      }
      lastInputWasTouch = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (isUsingTouch) return;

    e.preventDefault();

    // Calculate menu dimensions (approximate)
    const menuWidth = 240;
    const menuHeight = 420;

    // Calculate position, ensuring menu stays within viewport
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setPosition({ x: Math.max(10, x), y: Math.max(10, y) });
    setIsOpen(true);
    requestAnimationFrame(() => setIsVisible(true));
  }, [isUsingTouch]);

  const handleClick = useCallback(() => {
    if (isOpen) closeMenu();
  }, [isOpen, closeMenu]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  }, [isOpen, closeMenu]);

  const handleDragStart = useCallback((e: DragEvent) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [handleContextMenu, handleClick, handleKeyDown, handleDragStart]);

  const handleMenuClick = (action: () => void) => {
    action();
    closeMenu();
  };

  // Build menu items based on context
  const menuItems: MenuItem[] = [];

  // Navigation section
  if (pathname !== '/') {
    menuItems.push({
      label: 'Play Game',
      icon: <Gamepad2 className="w-4 h-4" />,
      onClick: () => router.push('/'),
      highlight: true,
      badge: 'GO',
    });
  } else if (gameStatus === 'menu') {
    menuItems.push({
      label: 'Start Game',
      icon: <Gamepad2 className="w-4 h-4" />,
      onClick: () => {},
      highlight: true,
      disabled: true,
    });
  }

  // Game actions (only when playing)
  if (gameStatus === 'playing' && pathname === '/') {
    menuItems.push({
      label: 'Quit Game',
      icon: <Home className="w-4 h-4" />,
      onClick: () => resetGame(),
      divider: true,
    });
  }

  // Navigation links
  menuItems.push({
    label: 'Leaderboard',
    icon: <Trophy className="w-4 h-4" />,
    onClick: () => router.push('/leaderboard'),
    disabled: pathname === '/leaderboard',
  });
  menuItems.push({
    label: 'Shop',
    icon: <ShoppingBag className="w-4 h-4" />,
    onClick: () => router.push('/shop'),
    disabled: pathname === '/shop',
  });

  // Authenticated user options
  if (isAuthenticated) {
    menuItems.push({
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => router.push('/profile'),
      disabled: pathname === '/profile',
      divider: true,
    });
    menuItems.push({
      label: 'Inventory',
      icon: <Package className="w-4 h-4" />,
      onClick: () => router.push('/inventory'),
      disabled: pathname === '/inventory',
    });
    menuItems.push({
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => router.push('/settings'),
      disabled: pathname === '/settings',
    });
    menuItems.push({
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => logout(),
      divider: true,
    });
  } else {
    menuItems.push({
      label: 'Login',
      icon: <LogIn className="w-4 h-4" />,
      onClick: () => router.push('/login'),
      disabled: pathname === '/login',
      divider: true,
    });
  }

  // Utility actions
  menuItems.push({
    label: 'Refresh Page',
    icon: <RefreshCw className="w-4 h-4" />,
    onClick: () => window.location.reload(),
  });

  // Get user level for display
  const userLevel = user?.profile?.level || 1;
  const getLevelColor = () => {
    if (userLevel >= 50) return 'from-yellow-400 to-amber-500';
    if (userLevel >= 30) return 'from-purple-400 to-pink-500';
    if (userLevel >= 15) return 'from-cyan-400 to-blue-500';
    if (userLevel >= 5) return 'from-green-400 to-emerald-500';
    return 'from-zinc-400 to-zinc-500';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.9,
          y: isVisible ? 0 : -10
        }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="fixed z-[100] min-w-[220px]"
        style={{
          left: position.x,
          top: position.y,
          transformOrigin: 'top left',
        }}
      >
        {/* Outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-60" />

        {/* Main container */}
        <div className="relative overflow-hidden rounded-xl">
          {/* Gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-pink-500/50 to-cyan-500/50 rounded-xl" />
          <div className="absolute inset-[1px] bg-zinc-900/98 backdrop-blur-xl rounded-xl" />

          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="relative px-4 py-3 overflow-hidden">
              {/* Header background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-transparent" />

              {/* Animated sparkles */}
              <div className="absolute top-2 right-3 opacity-50" aria-hidden="true">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>

              <div className="relative flex items-center gap-3">
                {/* Logo icon with glow */}
                <div className="relative" aria-hidden="true">
                  <div className="absolute inset-0 bg-purple-500/40 blur-lg rounded-lg" />
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Title and user info */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Anime Guess
                  </h3>
                  {isAuthenticated && user ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-400">{user.username}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r ${getLevelColor()} text-black flex items-center gap-0.5`}>
                        {userLevel >= 30 && <Crown className="w-2.5 h-2.5" aria-hidden="true" />}
                        Lv.{userLevel}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 mt-0.5">Guest Mode</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

            {/* Menu Items */}
            <div className="py-2" role="menu" aria-label="Navigation menu">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.divider && index > 0 && (
                    <div className="my-1.5 mx-3 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" role="separator" aria-hidden="true" />
                  )}
                  <AnimatedMenuItem
                    item={item}
                    onClick={() => !item.disabled && handleMenuClick(item.onClick)}
                    index={index}
                  />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

            {/* Footer */}
            <div className="px-4 py-2 bg-zinc-900/50" aria-hidden="true">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] text-zinc-600 font-medium">ESC to close</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
