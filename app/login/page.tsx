'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { animate, stagger, utils } from '@/lib/animejs/anime.esm.js';
import { LogIn, Lock, Eye, EyeOff, Gamepad2, ArrowLeft, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const { login, isAuthenticated } = useAuth();

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
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full bg-purple-500/20';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particlesRef.current.appendChild(particle);

        animate(particle, {
          translateX: () => utils.random(-100, 100),
          translateY: () => utils.random(-100, 100),
          scale: [0, utils.random(0.5, 1.5), 0],
          opacity: [0, 0.6, 0],
          duration: utils.random(3000, 6000),
          delay: utils.random(0, 2000),
          loop: true,
          ease: 'inOutQuad',
        });
      }
    }

    // Card entrance animation
    if (cardRef.current) {
      animate(cardRef.current, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        ease: 'outExpo',
      });
    }

    // Logo animation
    if (logoRef.current) {
      animate(logoRef.current, {
        scale: [0, 1],
        rotate: [180, 0],
        duration: 1000,
        delay: 200,
        ease: 'outElastic(1, 0.5)',
      });
    }

    // Title animation
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 400,
        ease: 'outQuad',
      });
    }

    // Form elements stagger animation
    if (formRef.current) {
      animate(formRef.current.querySelectorAll('.form-element'), {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 500,
        delay: stagger(100, { start: 500 }),
        ease: 'outQuad',
      });
    }

    return () => {
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
    };
  }, []);

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    animate(e.currentTarget, { scale: 1.02, duration: 200, ease: 'outQuad' });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    animate(e.currentTarget, { scale: 1, duration: 200, ease: 'outQuad' });
  };

  const shakeError = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
        ease: 'inOutQuad',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError('Please fill in all fields');
        shakeError();
        setIsLoading(false);
        return;
      }

      const result = await login(email, password);

      if (result.success) {
        if (cardRef.current) {
          animate(cardRef.current, {
            scale: [1, 0.95, 1.02],
            duration: 300,
            ease: 'outQuad',
            onComplete: () => router.push('/'),
          });
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Invalid credentials');
        shakeError();
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      shakeError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="page-container flex-center">
      {/* Background */}
      <div className="page-bg">
        <div ref={particlesRef} className="absolute inset-0" />
        <div className="bg-glow-purple top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] blur-[120px]" />
        <div className="bg-glow-pink bottom-0 left-0 w-[600px] h-[600px] blur-[100px]" />
        <div className="bg-glow-blue top-1/2 right-0 w-[500px] h-[500px] blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Card */}
        <div ref={cardRef} className="card-dark p-8 opacity-0">
          {/* Logo */}
          <div className="text-center mb-8">
            <div ref={logoRef} className="inline-flex flex-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 ref={titleRef} className="text-3xl font-bold text-white mb-2 opacity-0">
              Welcome Back!
            </h1>
            <p className="text-gray-400 flex-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Login to continue your anime journey
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="form-element opacity-0">
              <label htmlFor="email" className="label">Email</label>
              <div className="relative group">
                <Mail className="icon-input" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pr-4"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-element opacity-0">
              <label htmlFor="password" className="label">Password</label>
              <div className="relative group">
                <Lock className="icon-input" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="validation-icon text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="stat-red p-4 animate-pulse">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="form-element opacity-0 w-full py-4 btn btn-gradient rounded-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="form-element opacity-0 my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          {/* Guest Button */}
          <Link href="/" className="form-element opacity-0 w-full py-3 btn btn-secondary rounded-xl">
            Continue as Guest
          </Link>

          {/* Sign Up Link */}
          <p className="form-element opacity-0 mt-6 text-center text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
