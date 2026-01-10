'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Lock, Eye, EyeOff, Gamepad2, ArrowLeft, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence, fadeInUp, staggerContainer, staggerItem, modalVariants, scaleInBounce } from '@/lib/animations';
import { gsap, particleFloat, shake } from '@/lib/animations';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // GSAP particle animations
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles: HTMLDivElement[] = [];
    const container = particlesRef.current;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full bg-purple-500/20';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      container.appendChild(particle);
      particles.push(particle);

      particleFloat(particle);
    }

    return () => {
      particles.forEach(p => {
        gsap.killTweensOf(p);
        p.remove();
      });
    };
  }, []);

  const shakeError = () => {
    if (cardRef.current) {
      shake(cardRef.current, { intensity: 10, duration: 0.4 });
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
        router.push('/');
      } else {
        setError(result.error || 'Invalid credentials');
        shakeError();
      }
    } catch {
      setError('Login failed. Please try again.');
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
        <div className="bg-glow-purple top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] blur-[120px]" />
        <div className="bg-glow-pink bottom-0 left-0 w-[600px] h-[600px] blur-[100px]" />
        <div className="bg-glow-blue top-1/2 right-0 w-[500px] h-[500px] blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4 sm:px-0">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors group text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          ref={cardRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          className="card-dark p-5 sm:p-8"
        >
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              variants={scaleInBounce}
              initial="hidden"
              animate="visible"
              className="inline-flex flex-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-purple-500/30"
            >
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
            >
              Welcome Back!
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
              className="text-sm sm:text-base text-gray-400 flex-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Login to continue your anime journey
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
          >
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
                  className="input-base pr-4 text-sm sm:text-base py-3 sm:py-3.5"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
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
                  className="input-base text-sm sm:text-base py-3 sm:py-3.5"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="validation-icon text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
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
                  <p className="text-xs sm:text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="form-element w-full py-3 sm:py-4 btn btn-gradient rounded-xl text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Login</span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="form-element my-4 sm:my-6 flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="text-xs sm:text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </motion.div>

          {/* Guest Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Link href="/" className="form-element w-full py-2.5 sm:py-3 btn btn-secondary rounded-xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
              Continue as Guest
            </Link>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="form-element mt-4 sm:mt-6 text-center text-gray-400 text-sm sm:text-base"
          >
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign Up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
