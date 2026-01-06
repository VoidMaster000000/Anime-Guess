'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { animate } from '@/lib/animejs';
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

export default function CustomContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, logout } = useAuth();
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  const closeMenu = useCallback(() => {
    if (menuRef.current) {
      animate(menuRef.current, {
        opacity: [1, 0],
        scale: [1, 0.95],
        duration: 100,
        ease: 'outQuad',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();

    // Calculate position, ensuring menu stays within viewport
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 400);

    setPosition({ x, y });
    setIsOpen(true);
  }, []);

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

  // Animate menu on open
  useEffect(() => {
    if (isOpen && menuRef.current) {
      animate(menuRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 100,
        ease: 'outQuad',
      });
    }
  }, [isOpen]);

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
      ref={menuRef}
      className="fixed z-[100] min-w-[200px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        opacity: 0,
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
            <button
              onClick={() => !item.disabled && handleMenuClick(item.onClick)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                item.disabled
                  ? 'text-zinc-600 cursor-not-allowed'
                  : item.highlight
                  ? 'text-purple-400 hover:bg-purple-500/20'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span className={item.disabled ? 'opacity-50' : ''}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
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
