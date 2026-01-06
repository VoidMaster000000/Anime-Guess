'use client';

import { useState, useEffect, useRef } from 'react';
import { animate } from '@/lib/animejs';
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
  Save,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/store/profileStore';

// Animated section wrapper
function AnimatedSection({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: delay,
        ease: 'outQuad',
      });
    }
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

// Animated toggle switch
function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  const knobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (knobRef.current) {
      animate(knobRef.current, {
        translateX: value ? 24 : 0,
        duration: 200,
        ease: 'outQuad',
      });
    }
  }, [value]);

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
        ref={knobRef}
        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useProfileStore((state) => state.user);
  const isAuthenticated = useProfileStore((state) => state.isAuthenticated);

  // Local state for settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings from user preferences
  useEffect(() => {
    if (user?.preferences) {
      setSoundEnabled(user.preferences.soundEnabled ?? true);
      setNotificationsEnabled(user.preferences.notificationsEnabled ?? true);
      setTheme(user.preferences.theme ?? 'dark');
    }
  }, [user]);

  const handleSaveSettings = () => {
    if (user) {
      // Update profile with new preferences
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          soundEnabled,
          notificationsEnabled,
          theme,
        },
      };

      // Save to localStorage
      const storedUsers = localStorage.getItem('anime-game-users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        if (users[user.username.toLowerCase()]) {
          users[user.username.toLowerCase()].profile = updatedUser;
          localStorage.setItem('anime-game-users', JSON.stringify(users));
        }
      }

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

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
      ],
    },
    {
      title: 'Notifications',
      icon: notificationsEnabled ? Bell : BellOff,
      items: [
        {
          id: 'notifications',
          label: 'Push Notifications',
          description: 'Receive notifications about game updates and rewards',
          value: notificationsEnabled,
          onChange: () => setNotificationsEnabled(!notificationsEnabled),
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
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all duration-200 border border-zinc-700 hover:border-zinc-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              <p className="text-zinc-400 mt-1">
                Customize your game experience
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Success Message */}
        {saveMessage && (
          <AnimatedSection className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-400">{saveMessage}</span>
          </AnimatedSection>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <AnimatedSection
              key={section.title}
              delay={sectionIndex * 100}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-700 overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-zinc-700 flex items-center gap-3">
                <section.icon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>

              {/* Section Items */}
              <div className="p-6 space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-zinc-400">{item.description}</p>
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
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-700 overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-zinc-700 flex items-center gap-3">
                <User className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Account</h2>
              </div>

              {/* Account Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Username</p>
                    <p className="text-sm text-zinc-400">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Member Since</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-700">
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
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
            className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-700 overflow-hidden"
          >
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-zinc-700 flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Data & Privacy</h2>
            </div>

            {/* Privacy Options */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Clear Local Data</p>
                  <p className="text-sm text-zinc-400">
                    Remove all locally stored game data (this cannot be undone)
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Data</span>
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Save Button */}
        <AnimatedSection delay={500} className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </AnimatedSection>
      </div>
    </div>
  );
}
