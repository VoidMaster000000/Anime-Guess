'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { animate, stagger, utils } from '@/lib/animejs/anime.esm.js';
import { UserPlus, User, Lock, Eye, EyeOff, ArrowLeft, Sparkles, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  useEffect(() => {
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

    if (cardRef.current) {
      animate(cardRef.current, { translateY: [80, 0], opacity: [0, 1], duration: 1000, ease: 'outElastic(1, 0.8)' });
    }
    if (logoRef.current) {
      animate(logoRef.current, { scale: [0, 1.1, 1], rotate: [270, 0], duration: 1200, delay: 300, ease: 'outElastic(1, 0.6)' });
    }
    if (titleRef.current) {
      animate(titleRef.current, { translateY: [30, 0], opacity: [0, 1], duration: 700, delay: 500, ease: 'outQuart' });
    }
    if (formRef.current) {
      animate(formRef.current.querySelectorAll('.form-element'), {
        translateX: [-50, 0], opacity: [0, 1], duration: 600, delay: stagger(80, { start: 600 }), ease: 'outQuart',
      });
    }

    return () => { if (particlesRef.current) particlesRef.current.innerHTML = ''; };
  }, []);

  // Validation
  const validateUsername = (v: string) => {
    if (v.length < 3) return 'Username must be at least 3 characters';
    if (v.length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores';
    return null;
  };
  const validatePassword = (v: string) => v.length < 6 ? 'Password must be at least 6 characters' : null;
  const validateEmail = (v: string) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address';
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

  const shakeError = () => {
    if (cardRef.current) animate(cardRef.current, { translateX: [-12, 12, -12, 12, -6, 6, 0], duration: 500, ease: 'inOutQuad' });
  };
  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => animate(e.currentTarget, { scale: 1.03, duration: 200, ease: 'outQuad' });
  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => animate(e.currentTarget, { scale: 1, duration: 200, ease: 'outQuad' });

  const getInputClass = (hasError: boolean, isValid: boolean) => {
    if (hasError) return 'input-base input-error';
    if (isValid) return 'input-base input-valid';
    return 'input-base';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (usernameError) { setError(usernameError); shakeError(); return; }
    if (!email.trim()) { setError('Email is required'); shakeError(); return; }
    if (emailError) { setError(emailError); shakeError(); return; }
    if (passwordError) { setError(passwordError); shakeError(); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); shakeError(); return; }

    setIsLoading(true);
    try {
      const result = await signup(username, email, password);
      if (result.success) {
        if (cardRef.current) {
          animate(cardRef.current, { scale: [1, 1.05, 0.95], opacity: [1, 1, 0], duration: 500, ease: 'inOutQuad', onComplete: () => router.push('/') });
        } else router.push('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        shakeError();
      }
    } catch {
      setError('Registration failed. Please try again.');
      shakeError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container flex-center">
      {/* Background */}
      <div className="page-bg">
        <div ref={particlesRef} className="absolute inset-0" />
        <div className="bg-glow-pink top-0 right-1/4 w-[900px] h-[900px] blur-[150px]" />
        <div className="bg-glow-purple bottom-0 left-1/4 w-[700px] h-[700px] blur-[120px]" />
        <div className="bg-glow-cyan top-1/3 left-0 w-[400px] h-[400px] blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4 sm:px-0">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors group text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div ref={cardRef} className="card-dark p-5 sm:p-8 opacity-0">
          {/* Logo */}
          <div className="text-center mb-4 sm:mb-6">
            <div ref={logoRef} className="inline-flex flex-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-pink-500/30">
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 ref={titleRef} className="text-2xl sm:text-3xl font-bold text-white mb-2 opacity-0">Create Account</h1>
            <p className="text-sm sm:text-base text-gray-400 flex-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Join the ultimate anime guessing game
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Username */}
            <div className="form-element opacity-0">
              <label htmlFor="username" className="label text-sm sm:text-base">Username</label>
              <div className="relative group">
                <User className="icon-input" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${getInputClass(!!usernameError && !!username, !!usernameValid)} text-sm sm:text-base py-2.5 sm:py-3`}
                  placeholder="Choose a username"
                  disabled={isLoading}
                />
                {username && (
                  <div className="validation-icon">
                    {usernameValid ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                  </div>
                )}
              </div>
              {username && usernameError && <p className="error-text text-xs sm:text-sm">{usernameError}</p>}
            </div>

            {/* Email */}
            <div className="form-element opacity-0">
              <label htmlFor="email" className="label text-sm sm:text-base">Email</label>
              <div className="relative group">
                <Mail className="icon-input" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${getInputClass(!!emailError && !!email, !!emailValid)} text-sm sm:text-base py-2.5 sm:py-3`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
                {email && (
                  <div className="validation-icon">
                    {emailValid ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                  </div>
                )}
              </div>
              {email && emailError && <p className="error-text text-xs sm:text-sm">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="form-element opacity-0">
              <label htmlFor="password" className="label text-sm sm:text-base">Password</label>
              <div className="relative group">
                <Lock className="icon-input" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${getInputClass(!!passwordError && !!password, !!passwordValid)} text-sm sm:text-base py-2.5 sm:py-3`}
                  placeholder="Create a password (min 6 chars)"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="validation-icon text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {password && passwordError && <p className="error-text text-xs sm:text-sm">{passwordError}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-element opacity-0">
              <label htmlFor="confirmPassword" className="label text-sm sm:text-base">Confirm Password</label>
              <div className="relative group">
                <Lock className="icon-input" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${getInputClass(!!passwordsDontMatch, !!passwordsMatch)} text-sm sm:text-base py-2.5 sm:py-3`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="validation-icon text-gray-500 hover:text-gray-300 transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {passwordsDontMatch && <p className="error-text text-xs sm:text-sm">Passwords do not match</p>}
              {passwordsMatch && <p className="success-text flex items-center gap-1 text-xs sm:text-sm"><CheckCircle2 className="w-3 h-3" /> Passwords match!</p>}
            </div>

            {/* Error */}
            {error && (
              <div className="stat-red p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !!usernameError || !!emailError || !!passwordError || !passwordsMatch || !username || !email || !password}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="form-element opacity-0 w-full py-3 sm:py-4 btn btn-gradient rounded-xl text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="form-element opacity-0 mt-4 sm:mt-6 text-center text-gray-400 text-sm sm:text-base">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
