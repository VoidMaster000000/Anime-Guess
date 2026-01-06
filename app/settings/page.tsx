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
import { useAuth, updateSettings as updateUserSettings } from '@/hooks/useAuth';

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
  const { isAuthenticated, user, refreshUser } = useAuth();

  // Local state for settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from MongoDB user data
  useEffect(() => {
    if (user?.settings) {
      setSoundEnabled(user.settings.soundEnabled ?? true);
      setMusicEnabled(user.settings.musicEnabled ?? true);
      setAnimationsEnabled(user.settings.animationsEnabled ?? true);
      setTheme(user.settings.theme ?? 'dark');
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!isAuthenticated || !user) {
      setSaveMessage('Please login to save settings.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      // Save to MongoDB via API
      const result = await updateUserSettings({
        soundEnabled,
        musicEnabled,
        animationsEnabled,
        theme,
      });

      if (result.success) {
        await refreshUser();
        setSaveMessage('Settings saved successfully!');
      } else {
        setSaveMessage(result.error || 'Failed to save settings.');
      }
    } catch {
      setSaveMessage('Network error. Please try again.');
    } finally {
      setIsSaving(false);
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
      {/* Background decoration */}
      <div className="page-bg">
        <div className="bg-glow-purple top-0 left-1/4" />
        <div className="bg-glow-pink bottom-0 right-1/4" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-secondary mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 stat-purple">
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
          <AnimatedSection className="mb-6 p-4 stat-green flex items-center gap-3">
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
              className="card-glass overflow-hidden"
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
              className="card-glass overflow-hidden"
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
                    className="btn btn-secondary"
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
            <div className="px-6 py-4 border-b border-zinc-700 flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Data & Privacy</h2>
            </div>

            {/* Privacy Options */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Clear Cache</p>
                  <p className="text-sm text-zinc-400">
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
                  className="btn stat-red text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cache</span>
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Save Button */}
        <AnimatedSection delay={500} className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || !isAuthenticated}
            className="btn btn-gradient px-6 py-3"
          >
            <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>Save Settings</span>
          </button>
        </AnimatedSection>
      </div>
    </div>
  );
}
