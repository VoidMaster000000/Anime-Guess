"use client";

import { useState, useEffect } from "react";
import { X, LogIn, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
}

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

function AnimatedModal({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div className={`${className} transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      {children}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onClose();
        setEmail("");
        setPassword("");
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Close modal and allow playing as guest (not authenticated)
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AnimatedModal className="w-full max-w-md bg-bg-card border border-accent/20 rounded-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-bg-primary transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <LogIn className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Login</h2>
          </div>
          <p className="text-text-secondary">Welcome back! Enter your credentials to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-accent/20 text-text-primary focus:border-accent focus:outline-none transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-accent/20 text-text-primary focus:border-accent focus:outline-none transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-accent to-accent-purple hover:from-accent/90 hover:to-accent-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 text-white animate-spin" />
                <span className="font-medium text-white">Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-white" />
                <span className="font-medium text-white">Login</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-accent/20"></div>
          <span className="px-3 text-sm text-text-secondary">or</span>
          <div className="flex-1 h-px bg-accent/20"></div>
        </div>

        {/* Guest Login */}
        <button
          onClick={handleGuestLogin}
          className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-accent/20 hover:border-accent/40 text-text-primary hover:text-accent transition-all duration-200"
        >
          <span className="font-medium">Continue as Guest</span>
        </button>

        {/* Sign Up Link */}
        {onSwitchToSignup && (
          <p className="mt-4 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="text-accent hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        )}
      </AnimatedModal>
    </div>
  );
}
