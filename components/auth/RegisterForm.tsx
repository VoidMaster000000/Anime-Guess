'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Mail, UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
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

function AnimatedMessage({
  message,
  type,
}: {
  message: string;
  type: 'error' | 'success';
}) {
  const bgColor = type === 'error' ? 'bg-red-500/10' : 'bg-green-500/10';
  const borderColor = type === 'error' ? 'border-red-500/50' : 'border-green-500/50';
  const textColor = type === 'error' ? 'text-red-400' : 'text-green-400';
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`p-3 ${bgColor} border ${borderColor} rounded-lg flex items-start gap-2 animate-fade-in`}
    >
      <Icon className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${textColor}`}>{message}</p>
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

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();

  // Username validation
  const validateUsername = (value: string): string | null => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 20) {
      return 'Username must be 20 characters or less';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  // Email validation
  const validateEmail = (value: string): string | null => {
    if (!value.includes('@') || !value.includes('.')) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  // Password validation
  const validatePassword = (value: string): string | null => {
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate username
      const usernameError = validateUsername(username);
      if (usernameError) {
        setError(usernameError);
        setIsLoading(false);
        return;
      }

      // Validate email
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        setIsLoading(false);
        return;
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setIsLoading(false);
        return;
      }

      // Check password confirmation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Attempt registration using useAuth hook (MongoDB)
      const result = await signup(username, email, password);

      if (result.success) {
        setSuccess('Account created successfully! Redirecting...');

        // Redirect after success
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Real-time username validation feedback
  const usernameError = username ? validateUsername(username) : null;
  const usernameValid = username && !usernameError;

  // Real-time password validation feedback
  const passwordError = password ? validatePassword(password) : null;
  const passwordValid = password && !passwordError;

  // Password match feedback
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  return (
    <AnimatedFormContainer className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div className="space-y-2">
          <label htmlFor="register-username" className="block text-sm font-medium text-purple-200">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 border-2 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       ${usernameError && username ? 'border-red-500/50 hover:border-red-500/70' :
                         usernameValid ? 'border-green-500/50 hover:border-green-500/70' :
                         'border-purple-500/30 hover:border-purple-500/50'}
                       ${usernameValid ? 'focus:border-green-500' : 'focus:border-purple-500'}`}
              placeholder="Choose a username (3-20 chars)"
              disabled={isLoading}
            />
            {username && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {usernameValid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {username && usernameError && (
            <p className="text-xs text-red-400 mt-1">{usernameError}</p>
          )}
          {usernameValid && (
            <p className="text-xs text-green-400 mt-1">Username is available!</p>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="register-email" className="block text-sm font-medium text-purple-200">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 border-2 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       ${email && validateEmail(email) ? 'border-red-500/50 hover:border-red-500/70' :
                         email && !validateEmail(email) ? 'border-green-500/50 hover:border-green-500/70' :
                         'border-purple-500/30 hover:border-purple-500/50'}
                       ${email && !validateEmail(email) ? 'focus:border-green-500' : 'focus:border-purple-500'}`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {email && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {!validateEmail(email) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {email && validateEmail(email) && (
            <p className="text-xs text-red-400 mt-1">{validateEmail(email)}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="register-password" className="block text-sm font-medium text-purple-200">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border-2 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       ${passwordError && password ? 'border-red-500/50 hover:border-red-500/70' :
                         passwordValid ? 'border-green-500/50 hover:border-green-500/70' :
                         'border-purple-500/30 hover:border-purple-500/50'}
                       ${passwordValid ? 'focus:border-green-500' : 'focus:border-purple-500'}`}
              placeholder="Create a password (min 6 chars)"
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
          {password && passwordError && (
            <p className="text-xs text-red-400 mt-1">{passwordError}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-purple-200">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border-2 rounded-lg
                       text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-purple-500/20
                       transition-all duration-300 backdrop-blur-sm
                       ${passwordsDontMatch ? 'border-red-500/50 hover:border-red-500/70' :
                         passwordsMatch ? 'border-green-500/50 hover:border-green-500/70' :
                         'border-purple-500/30 hover:border-purple-500/50'}
                       ${passwordsMatch ? 'focus:border-green-500' : 'focus:border-purple-500'}`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-400
                       hover:text-purple-300 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwordsDontMatch && (
            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
          )}
          {passwordsMatch && (
            <p className="text-xs text-green-400 mt-1">Passwords match!</p>
          )}
        </div>

        {/* Error Message */}
        {error && <AnimatedMessage message={error} type="error" />}

        {/* Success Message */}
        {success && <AnimatedMessage message={success} type="success" />}

        {/* Register Button */}
        <HoverButton
          type="submit"
          disabled={isLoading || !!usernameError || !!passwordError || !passwordsMatch || !username || !email || !!validateEmail(email) || !password}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
              <div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0
                         group-hover:opacity-20 transition-opacity duration-300"
              />
            </>
          )}
        </HoverButton>

        {/* Switch to Login */}
        <div className="text-center pt-4">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              className="text-purple-400 hover:text-purple-300 font-semibold
                       transition-colors duration-200 disabled:opacity-50"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </AnimatedFormContainer>
  );
}
