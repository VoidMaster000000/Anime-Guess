'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Settings,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Moon,
  Sun,
  User,
  Shield,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, updateSettings as updateUserSettings } from '@/hooks/useAuth';

// CSS-based animated section wrapper
function AnimatedSection({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={`animate-fade-in-up ${className || ''}`}
      style={{ animationDelay: `${delay * 0.5}ms` }}
    >
      {children}
    </div>
  );
}

// CSS-based toggle switch (no JS blocking)
function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
        value
          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
          : 'bg-zinc-700'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md
          transition-transform duration-150 ease-out
          ${value ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useAuth();

  // Local state for settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [saveMessage, setSaveMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track the last saved settings to prevent unnecessary saves
  const lastSavedRef = useRef<string>('');

  // Load settings from MongoDB user data
  useEffect(() => {
    if (user?.settings) {
      const sound = user.settings.soundEnabled ?? true;
      const music = user.settings.musicEnabled ?? true;
      const animations = user.settings.animationsEnabled ?? true;
      const userTheme = user.settings.theme ?? 'dark';

      setSoundEnabled(sound);
      setMusicEnabled(music);
      setAnimationsEnabled(animations);
      setTheme(userTheme);

      // Initialize lastSavedRef so we don't immediately re-save
      lastSavedRef.current = JSON.stringify({
        soundEnabled: sound,
        musicEnabled: music,
        animationsEnabled: animations,
        theme: userTheme,
      });

      setHasLoaded(true);
    }
  }, [user]);

  // Auto-save function
  const saveSettings = useCallback(async (settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    animationsEnabled: boolean;
    theme: 'dark' | 'light' | 'system';
  }) => {
    if (!isAuthenticated || !user) {
      return; // Silent fail for non-authenticated users
    }

    // Create a hash of current settings to compare
    const settingsHash = JSON.stringify(settings);
    if (settingsHash === lastSavedRef.current) {
      return; // No changes, don't save
    }

    setIsSaving(true);
    try {
      const result = await updateUserSettings(settings);

      if (result.success) {
        lastSavedRef.current = settingsHash; // Update last saved
        setSaveMessage('Settings saved!');
        setIsError(false);
      } else {
        setSaveMessage(result.error || 'Failed to save settings.');
        setIsError(true);
      }
    } catch {
      setSaveMessage('Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 2000);
    }
  }, [isAuthenticated, user]);

  // Debounced auto-save when settings change
  useEffect(() => {
    if (!hasLoaded) return; // Don't save on initial load

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 800ms
    saveTimeoutRef.current = setTimeout(() => {
      saveSettings({ soundEnabled, musicEnabled, animationsEnabled, theme });
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [soundEnabled, musicEnabled, animationsEnabled, theme, hasLoaded, saveSettings]);

  const settingsSections = [
    {
      title: 'Audio',
      icon: soundEnabled ? Volume2 : VolumeX,
      items: [
        {
          id: 'sound',
          label: 'Sound Effects',
          description: 'Enable or disable game sound effects',
          value: soundEnabled,
          onChange: () => setSoundEnabled(!soundEnabled),
        },
        {
          id: 'music',
          label: 'Background Music',
          description: 'Enable or disable background music',
          value: musicEnabled,
          onChange: () => setMusicEnabled(!musicEnabled),
        },
      ],
    },
    {
      title: 'Display',
      icon: animationsEnabled ? Bell : BellOff,
      items: [
        {
          id: 'animations',
          label: 'Animations',
          description: 'Enable or disable UI animations',
          value: animationsEnabled,
          onChange: () => setAnimationsEnabled(!animationsEnabled),
        },
      ],
    },
    {
      title: 'Appearance',
      icon: theme === 'dark' ? Moon : Sun,
      items: [
        {
          id: 'theme',
          label: 'Dark Mode',
          description: 'Use dark theme for the interface',
          value: theme === 'dark',
          onChange: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <AnimatedSection className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-secondary mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 stat-purple">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Settings</h1>
              <p className="text-xs sm:text-base text-zinc-400 mt-0.5 sm:mt-1">
                Customize your game experience
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Status Message */}
        {(saveMessage || isSaving) && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 rounded-lg border ${
            isSaving
              ? 'stat-purple border-purple-500/30'
              : isError
                ? 'stat-red border-red-500/30'
                : 'stat-green border-green-500/30'
          }`}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 animate-spin" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            ) : (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            )}
            <span className={`text-sm sm:text-base ${
              isSaving ? 'text-purple-400' : isError ? 'text-red-400' : 'text-green-400'
            }`}>
              {isSaving ? 'Saving...' : saveMessage}
            </span>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-4 sm:space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <AnimatedSection
              key={section.title}
              delay={sectionIndex * 100}
              className="card-glass overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-700 flex items-center gap-2 sm:gap-3">
                <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <h2 className="text-base sm:text-lg font-semibold text-white">{section.title}</h2>
              </div>

              {/* Section Items */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-white font-medium">{item.label}</p>
                      <p className="text-xs sm:text-sm text-zinc-400">{item.description}</p>
                    </div>
                    <ToggleSwitch value={item.value} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </AnimatedSection>
          ))}

          {/* Account Section */}
          {isAuthenticated && user && (
            <AnimatedSection
              delay={300}
              className="card-glass overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-700 flex items-center gap-2 sm:gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <h2 className="text-base sm:text-lg font-semibold text-white">Account</h2>
              </div>

              {/* Account Info */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base text-white font-medium">Username</p>
                    <p className="text-xs sm:text-sm text-zinc-400">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base text-white font-medium">Member Since</p>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-zinc-700">
                  <button
                    onClick={() => router.push('/profile')}
                    className="btn btn-secondary text-sm sm:text-base"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Privacy Section */}
          <AnimatedSection
            delay={400}
            className="card-glass overflow-hidden"
          >
            {/* Section Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-700 flex items-center gap-2 sm:gap-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <h2 className="text-base sm:text-lg font-semibold text-white">Data & Privacy</h2>
            </div>

            {/* Privacy Options */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-white font-medium">Clear Cache</p>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Clear locally cached game data. Your account data is stored securely on our servers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Clear local cache? This will reset any cached game state.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="btn stat-red text-red-400 hover:text-red-300 text-sm sm:text-base flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Clear Cache</span>
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Auto-save indicator */}
        <AnimatedSection delay={500} className="mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-zinc-500 text-center">
            Settings are saved automatically when you make changes
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
