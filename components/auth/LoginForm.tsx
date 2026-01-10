'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

// ============================================================================
// ANIMATED COMPONENTS (CSS-based)
// ============================================================================

function AnimatedFormContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`${className} transition-all duration-150 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {children}
    </div>
  );
}

function AnimatedErrorMessage({ message }: { message: string }) {
  return (
    <div
      className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg animate-fade-in"
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
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${className} transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}

function SpinningLoader() {
  return (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Basic email validation
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Attempt login using useAuth hook (MongoDB)
      const result = await login(email, password);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedFormContainer className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-purple-200">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       hover:border-purple-500/50"
              placeholder="Enter your email"
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
