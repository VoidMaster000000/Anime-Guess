'use client';

import { useState, useEffect, useRef } from 'react';
import { animate } from '@/lib/animejs';
import {
  ArrowLeft,
  User,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Award,
  Star,
  Edit2,
  X,
  Check,
  Camera,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import LevelProgress from '@/components/profile/LevelProgress';
import CoinDisplay from '@/components/profile/CoinDisplay';

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

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

function HoverCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
}) {
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

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.02, translateY: -2, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, translateY: 0, duration: 200, ease: 'outQuad' });
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

function ScaleCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

function HoverAvatar({ children, className }: { children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1.05, rotate: 5, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, rotate: 0, duration: 200, ease: 'outQuad' });
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

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 200,
        ease: 'outQuad',
      });
    }
    if (contentRef.current) {
      animate(contentRef.current, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 200,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      style={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfilePage() {
  const router = useRouter();

  // Auth hook for user data
  const { user, refreshUser } = useAuth();
  const level = user?.profile?.level ?? 1;
  const profileStats = {
    gamesPlayed: user?.profile?.gamesPlayed ?? 0,
    correctGuesses: user?.profile?.correctGuesses ?? 0,
    wrongGuesses: (user?.profile?.totalGuesses ?? 0) - (user?.profile?.correctGuesses ?? 0),
    highestStreak: user?.profile?.highestStreak ?? 0,
    totalPoints: user?.profile?.coins ?? 0,
    perfectGames: 0,
  };

  // Game store (for total points and high streak)
  const totalPoints = useGameStore((state) => state.totalPoints);
  const highStreak = useGameStore((state) => state.highStreak);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || 'Player');
  const [editAvatarImage, setEditAvatarImage] = useState<string | undefined>(user?.avatarImage);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated counters
  const [animatedStats, setAnimatedStats] = useState({
    gamesPlayed: 0,
    correctGuesses: 0,
    accuracy: 0,
    highestStreak: 0,
    totalPoints: 0,
    perfectGames: 0,
  });

  // Calculate accuracy from game store stats
  const totalGuesses = profileStats.correctGuesses + profileStats.wrongGuesses;
  const accuracy = totalGuesses > 0
    ? (profileStats.correctGuesses / totalGuesses) * 100
    : 0;

  // Perfect games (tracked separately, for now showing 0 as placeholder)
  const perfectGames = 0;

  // Animate stats on mount
  useEffect(() => {
    const stats = {
      gamesPlayed: profileStats.gamesPlayed,
      correctGuesses: profileStats.correctGuesses,
      accuracy: accuracy,
      highestStreak: profileStats.highestStreak || highStreak,
      totalPoints: totalPoints,
      perfectGames: perfectGames,
    };

    const animationDuration = 1000;
    const steps = 30;
    const stepDuration = animationDuration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        gamesPlayed: Math.floor(stats.gamesPlayed * progress),
        correctGuesses: Math.floor(stats.correctGuesses * progress),
        accuracy: stats.accuracy * progress,
        highestStreak: Math.floor(stats.highestStreak * progress),
        totalPoints: Math.floor(stats.totalPoints * progress),
        perfectGames: Math.floor(stats.perfectGames * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [profileStats, totalPoints, highStreak, accuracy, perfectGames]);

  const handleSaveProfile = async () => {
    setEditError(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          avatarImage: editAvatarImage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        setIsEditModalOpen(false);
      } else {
        setEditError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setEditError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditUsername(user?.username || 'Player');
    setEditAvatarImage(user?.avatarImage);
    setEditError(null);
    setIsEditModalOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditAvatarImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEditAvatarImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const statsGrid = [
    {
      label: 'Games Played',
      value: animatedStats.gamesPlayed,
      icon: Trophy,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Correct Guesses',
      value: animatedStats.correctGuesses,
      icon: Target,
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Accuracy',
      value: animatedStats.accuracy,
      icon: Zap,
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      label: 'Highest Streak',
      value: animatedStats.highestStreak,
      icon: TrendingUp,
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Total Points',
      value: animatedStats.totalPoints,
      icon: Award,
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Perfect Games',
      value: animatedStats.perfectGames,
      icon: Star,
      color: 'from-pink-500/20 to-pink-600/20',
      borderColor: 'border-pink-500/30',
      iconColor: 'text-pink-400',
      format: (v: number) => v.toLocaleString(),
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
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-secondary mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Profile Header Card */}
          <ScaleCard className="card-glass p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <HoverAvatar className="w-24 h-24 stat-purple flex-center text-5xl flex-shrink-0 overflow-hidden rounded-2xl">
                {user?.avatarImage ? (
                  <img
                    src={user.avatarImage}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-purple-400" />
                )}
              </HoverAvatar>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {user?.username || 'Player'}
                  </h1>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn btn-secondary text-sm mx-auto md:mx-0"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
                <p className="text-zinc-400 mb-4">
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </p>

                {/* Level and Coins */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <LevelProgress showDetails size="lg" />
                  <CoinDisplay showAddButton size="lg" />
                </div>
              </div>
            </div>
          </ScaleCard>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection delay={100} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-400" />
            Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsGrid.map((stat, index) => (
              <HoverCard
                key={stat.label}
                delay={100 + index * 50}
                className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-xl border ${stat.borderColor} p-6`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 bg-zinc-900/50 rounded-lg ${stat.iconColor}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1 tabular-nums">
                  {stat.format(stat.value)}
                </div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </HoverCard>
            ))}
          </div>
        </AnimatedSection>

        {/* Achievements Section */}
        <AnimatedSection delay={200} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            Recent Achievements
          </h2>

          <div className="card-glass p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-zinc-400 text-lg">
              Achievements coming soon!
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Complete challenges to unlock special badges and rewards
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <ModalOverlay onClose={handleCancelEdit}>
          <div className="card-glass p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <User className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Username */}
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="input-base pl-4"
                  placeholder="Enter username"
                />
              </div>

              {/* Avatar Image Upload */}
              <div>
                <label className="label">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="relative">
                    <div className="w-20 h-20 stat-purple flex-center text-3xl overflow-hidden rounded-xl">
                      {editAvatarImage ? (
                        <img
                          src={editAvatarImage}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-purple-400" />
                      )}
                    </div>
                    {editAvatarImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="btn btn-secondary cursor-pointer py-3"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{editAvatarImage ? 'Change Image' : 'Upload Image'}</span>
                    </label>
                    <p className="text-xs text-zinc-500 mt-2">
                      Max 2MB • JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{editError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex-1 btn btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 btn btn-gradient py-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
