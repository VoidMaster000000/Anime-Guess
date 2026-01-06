'use client';

import { useState, useRef, useEffect } from 'react';
import { animate } from '@/lib/animejs';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useProfileStore } from '@/store/profileStore';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

function AnimatedFormContainer({
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
        translateY: [20, 0],
        duration: 300,
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

function AnimatedErrorMessage({
  message,
}: {
  message: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        height: [0, 'auto'],
        duration: 200,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg"
      style={{ opacity: 0, overflow: 'hidden' }}
    >
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}

function HoverButton({
  children,
  type,
  disabled,
  className,
}: {
  children: React.ReactNode;
  type: 'submit' | 'button';
  disabled?: boolean;
  className: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 1.02, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 0.98, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (!disabled && ref.current) {
      animate(ref.current, { scale: 1.02, duration: 100, ease: 'outQuad' });
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
}

function SpinningLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const runAnimation = () => {
      if (!ref.current) return;
      animate(ref.current, {
        rotate: [0, 360],
        duration: 1000,
        ease: 'linear',
        onComplete: runAnimation,
      });
    };
    runAnimation();
  }, []);

  return (
    <div
      ref={ref}
      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useProfileStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!username || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        setIsLoading(false);
        return;
      }

      // Attempt login using profileStore
      const success = await login(username, password);

      if (success) {
        onSuccess();
      } else {
        const storeError = useProfileStore.getState().error;
        setError(storeError || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedFormContainer className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-purple-200">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       hover:border-purple-500/50"
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-purple-200">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       hover:border-purple-500/50"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-400
                       hover:text-purple-300 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 bg-gray-800 border-purple-500/50 rounded
                     focus:ring-2 focus:ring-purple-500/20
                     text-purple-600 cursor-pointer"
            disabled={isLoading}
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300 cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Error Message */}
        {error && <AnimatedErrorMessage message={error} />}

        {/* Login Button */}
        <HoverButton
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600
                   text-white font-semibold rounded-lg shadow-lg
                   hover:from-purple-700 hover:to-pink-700
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300
                   flex items-center justify-center gap-2
                   relative overflow-hidden group"
        >
          {isLoading ? (
            <>
              <SpinningLoader />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Login</span>
              <div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0
                         group-hover:opacity-20 transition-opacity duration-300"
              />
            </>
          )}
        </HoverButton>

        {/* Switch to Register */}
        <div className="text-center pt-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              disabled={isLoading}
              className="text-purple-400 hover:text-purple-300 font-semibold
                       transition-colors duration-200 disabled:opacity-50"
            >
              Create Account
            </button>
          </p>
        </div>
      </form>
    </AnimatedFormContainer>
  );
}
