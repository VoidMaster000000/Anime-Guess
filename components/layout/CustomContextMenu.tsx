'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  highlight?: boolean;
}

// Animated menu item with CSS hover effects
function AnimatedMenuItem({
  item,
  onClick,
}: {
  item: MenuItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={item.disabled}
      className={`group w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg mx-1
        transition-all duration-100
        ${item.disabled
          ? 'text-zinc-600 cursor-not-allowed'
          : 'active:scale-[0.98] hover:translate-x-1.5 hover:scale-[1.02]'
        }
        ${item.disabled
          ? ''
          : item.highlight
            ? 'text-purple-400 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'
        }`}
      style={{ width: 'calc(100% - 8px)' }}
    >
      <span
        className={`inline-flex transition-transform duration-150 ${item.disabled ? 'opacity-50' : 'group-hover:scale-110'}`}
      >
        {item.icon}
      </span>
      <span className="text-sm group-hover:tracking-wide transition-all duration-150">
        {item.label}
      </span>
      {/* Hover indicator line */}
      {!item.disabled && (
        <span className={`ml-auto w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-3
          ${item.highlight ? 'bg-purple-400' : 'bg-zinc-500'}`}
        />
      )}
    </button>
  );
}

export default function CustomContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isUsingTouch, setIsUsingTouch] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, logout } = useAuth();
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  // Detect actual touch usage (not just capability)
  // Many Windows devices report touch capability but use mouse
  useEffect(() => {
    let lastInputWasTouch = false;

    const handleTouchStart = () => {
      lastInputWasTouch = true;
      setIsUsingTouch(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Only count as mouse if it's not from a touch event
      // Touch events also trigger mouse events, but with movementX/Y = 0
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
    // Wait for CSS transition to complete before unmounting
    setTimeout(() => setIsOpen(false), 100);
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    // On touch devices, allow native context menu (long-press behavior)
    // But on Windows with mouse, show custom menu
    if (isUsingTouch) return;

    e.preventDefault();

    // Calculate position, ensuring menu stays within viewport
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 400);

    setPosition({ x, y });
    setIsOpen(true);
    // Trigger animation on next frame
    requestAnimationFrame(() => setIsVisible(true));
  }, [isUsingTouch]);

  const handleClick = useCallback(() => {
    if (isOpen) closeMenu();
  }, [isOpen, closeMenu]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  }, [isOpen, closeMenu]);

  // Disable image dragging
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

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-[100] min-w-[200px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden transition-all duration-100 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transformOrigin: 'top left',
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Anime Guess</span>
        </div>
        {isAuthenticated && user && (
          <p className="text-xs text-zinc-400 mt-0.5">
            {user.username} • Lv {user.profile?.level || 1}
          </p>
        )}
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.divider && index > 0 && (
              <div className="my-1 border-t border-zinc-700/50" />
            )}
            <AnimatedMenuItem
              item={item}
              onClick={() => !item.disabled && handleMenuClick(item.onClick)}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-zinc-800/50 border-t border-zinc-700/50">
        <p className="text-[10px] text-zinc-500 text-center">
          Press ESC or click to close
        </p>
      </div>
    </div>
  );
}
