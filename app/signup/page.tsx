'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { animate, stagger, utils } from '@/lib/animejs/anime.esm.js';
import { UserPlus, User, Lock, Eye, EyeOff, Gamepad2, ArrowLeft, Sparkles, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const { signup, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Anime.js animations on mount
  useEffect(() => {
    // Create floating particles
    if (particlesRef.current) {
      for (let i = 0; i < 35; i++) {
        const particle = document.createElement('div');
        const colors = ['bg-purple-500/20', 'bg-pink-500/20', 'bg-blue-500/20'];
        particle.className = `absolute w-2 h-2 rounded-full ${colors[Math.floor(Math.random() * colors.length)]}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particlesRef.current.appendChild(particle);

        animate(particle, {
          translateX: () => utils.random(-150, 150),
          translateY: () => utils.random(-150, 150),
          scale: [0, utils.random(0.5, 2), 0],
          opacity: [0, 0.7, 0],
          duration: utils.random(4000, 7000),
          delay: utils.random(0, 3000),
          loop: true,
          ease: 'inOutSine',
        });
      }
    }

    // Card entrance animation with bounce
    if (cardRef.current) {
      animate(cardRef.current, {
        translateY: [80, 0],
        opacity: [0, 1],
        duration: 1000,
        ease: 'outElastic(1, 0.8)',
      });
    }

    // Logo animation with rotation and scale
    if (logoRef.current) {
      animate(logoRef.current, {
        scale: [0, 1.1, 1],
        rotate: [270, 0],
        duration: 1200,
        delay: 300,
        ease: 'outElastic(1, 0.6)',
      });
    }

    // Title animation with typewriter effect feel
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 700,
        delay: 500,
        ease: 'outQuart',
      });
    }

    // Form elements stagger animation
    if (formRef.current) {
      animate(formRef.current.querySelectorAll('.form-element'), {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        delay: stagger(80, { start: 600 }),
        ease: 'outQuart',
      });
    }

    return () => {
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
    };
  }, []);

  // Validation helpers
  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores';
    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  };

  const usernameError = username ? validateUsername(username) : null;
  const usernameValid = username && !usernameError;
  const passwordError = password ? validatePassword(password) : null;
  const passwordValid = password && !passwordError;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;
  const emailError = email ? validateEmail(email) : null;
  const emailValid = email && !emailError;

  // Animations
  const shakeError = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        translateX: [-12, 12, -12, 12, -6, 6, 0],
        duration: 500,
        ease: 'inOutQuad',
      });
    }
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    animate(e.currentTarget, {
      scale: 1.03,
      duration: 200,
      ease: 'outQuad',
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    animate(e.currentTarget, {
      scale: 1,
      duration: 200,
      ease: 'outQuad',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (usernameError) {
      setError(usernameError);
      shakeError();
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      shakeError();
      return;
    }

    if (emailError) {
      setError(emailError);
      shakeError();
      return;
    }

    if (passwordError) {
      setError(passwordError);
      shakeError();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      shakeError();
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(username, email, password);

      if (result.success) {
        // Success animation
        if (cardRef.current) {
          animate(cardRef.current, {
            scale: [1, 1.05, 0.95],
            opacity: [1, 1, 0],
            duration: 500,
            ease: 'inOutQuad',
            onComplete: () => router.push('/'),
          });
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        shakeError();
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      shakeError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div ref={particlesRef} className="absolute inset-0" />
        <div className="absolute top-0 right-1/4 w-[900px] h-[900px] bg-pink-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Card */}
        <div
          ref={cardRef}
          className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl opacity-0"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div
              ref={logoRef}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-pink-500/30"
            >
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 ref={titleRef} className="text-3xl font-bold text-white mb-2 opacity-0">
              Create Account
            </h1>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Join the ultimate anime guessing game
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="form-element opacity-0">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    usernameError && username
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : usernameValid
                      ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Choose a username"
                  disabled={isLoading}
                />
                {username && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {username && usernameError && (
                <p className="text-xs text-red-400 mt-1.5">{usernameError}</p>
              )}
            </div>

            {/* Email (Required) */}
            <div className="form-element opacity-0">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    emailError && email
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : emailValid
                      ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
                {email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {emailValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {email && emailError && (
                <p className="text-xs text-red-400 mt-1.5">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-element opacity-0">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    passwordError && password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : passwordValid
                      ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Create a password (min 6 chars)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && passwordError && (
                <p className="text-xs text-red-400 mt-1.5">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-element opacity-0">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    passwordsDontMatch
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : passwordsMatch
                      ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordsDontMatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match!
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!usernameError || !!emailError || !!passwordError || !passwordsMatch || !username || !email || !password}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="form-element opacity-0 w-full py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-[length:200%_100%] hover:bg-right text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="form-element opacity-0 mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
