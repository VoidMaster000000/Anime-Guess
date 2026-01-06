"use client";

import { useState, useRef, useEffect } from "react";
import { animate } from "@/lib/animejs";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/profileStore";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0, transform: 'scale(0.9)' }}>
      {children}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const register = useProfileStore((state) => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(username, password);
      if (success) {
        onClose();
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        // Get error from store
        const storeError = useProfileStore.getState().error;
        setError(storeError || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              <UserPlus className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Sign Up</h2>
          </div>
          <p className="text-text-secondary">Create an account to track your progress and compete!</p>
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-accent/20 text-text-primary focus:border-accent focus:outline-none transition-colors"
              placeholder="Choose a username"
              required
            />
          </div>

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
              placeholder="Choose a password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-accent/20 text-text-primary focus:border-accent focus:outline-none transition-colors"
              placeholder="Confirm your password"
              required
              minLength={6}
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
                <span className="font-medium text-white">Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 text-white" />
                <span className="font-medium text-white">Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        {onSwitchToLogin && (
          <p className="mt-4 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-accent hover:underline font-medium"
            >
              Login
            </button>
          </p>
        )}
      </AnimatedModal>
    </div>
  );
}
