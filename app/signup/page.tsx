'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Lock, Eye, EyeOff, ArrowLeft, Sparkles, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence, fadeInUp, staggerContainer, staggerItem, modalVariants, scaleInBounce } from '@/lib/animations';
import { gsap, particleFloat, shake } from '@/lib/animations';

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
  const particlesRef = useRef<HTMLDivElement>(null);

  const { signup, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  // GSAP particle animations
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles: HTMLDivElement[] = [];
    const container = particlesRef.current;
    const colors = ['bg-purple-500/20', 'bg-pink-500/20', 'bg-blue-500/20'];

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement('div');
      particle.className = `absolute w-2 h-2 rounded-full ${colors[Math.floor(Math.random() * colors.length)]}`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      container.appendChild(particle);
      particles.push(particle);

      particleFloat(particle, {
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        scale: 0.5 + Math.random() * 1.5,
      });
    }

    return () => {
      particles.forEach(p => {
        gsap.killTweensOf(p);
        p.remove();
      });
    };
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
    if (cardRef.current) {
      shake(cardRef.current, { intensity: 10, duration: 0.4 });
    }
  };

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
        router.push('/');
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

      <div className="w-full max-w-md relative z-10 px-4 sm:px-6 md:px-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-5 md:mb-6 transition-colors group text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          ref={cardRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          className="card-dark p-5 sm:p-6 md:p-8"
        >
          {/* Logo */}
          <div className="text-center mb-4 sm:mb-5 md:mb-6">
            <motion.div
              variants={scaleInBounce}
              initial="hidden"
              animate="visible"
              className="inline-flex flex-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-pink-500/30"
            >
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
            >
              Create Account
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
              className="text-sm sm:text-base text-gray-400 flex-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              Join the ultimate anime guessing game
            </motion.p>
          </div>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4"
          >
            {/* Username */}
            <motion.div variants={staggerItem} className="form-element">
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
                <AnimatePresence>
                  {username && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="validation-icon"
                    >
                      {usernameValid ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {username && usernameError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="error-text text-xs sm:text-sm"
                  >
                    {usernameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email */}
            <motion.div variants={staggerItem} className="form-element">
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
                <AnimatePresence>
                  {email && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="validation-icon"
                    >
                      {emailValid ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {email && emailError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="error-text text-xs sm:text-sm"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div variants={staggerItem} className="form-element">
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
              <AnimatePresence>
                {password && passwordError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="error-text text-xs sm:text-sm"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={staggerItem} className="form-element">
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
              <AnimatePresence>
                {passwordsDontMatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="error-text text-xs sm:text-sm"
                  >
                    Passwords do not match
                  </motion.p>
                )}
                {passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="success-text flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Passwords match!
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="stat-red p-3 sm:p-4"
                >
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !!usernameError || !!emailError || !!passwordError || !passwordsMatch || !username || !email || !password}
              className="form-element w-full py-3 sm:py-4 btn btn-gradient rounded-xl text-sm sm:text-base"
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
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="form-element mt-4 sm:mt-5 md:mt-6 text-center text-gray-400 text-sm sm:text-base"
          >
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Login</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
