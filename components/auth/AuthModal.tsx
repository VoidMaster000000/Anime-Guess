'use client';

import { useState, useEffect, useRef } from 'react';
import { animate } from '@/lib/animejs';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register';

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

function AnimatedBackdrop({
  onClose,
  className,
}: {
  onClose: () => void;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        duration: 200,
        ease: 'outQuad',
      });
    }
  }, []);

  return <div ref={ref} onClick={onClose} className={className} style={{ opacity: 0 }} />;
}

function AnimatedModal({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [20, 0],
        duration: 150,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div ref={ref} onClick={onClick} className={className} style={{ opacity: 0, transform: 'scale(0.9) translateY(20px)' }}>
      {children}
    </div>
  );
}

function AnimatedHeader({
  children,
  viewKey,
}: {
  children: React.ReactNode;
  viewKey: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 150,
        ease: 'outQuad',
      });
    }
  }, [viewKey]);

  return (
    <h2
      ref={ref}
      className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
      style={{ opacity: 0 }}
    >
      {children}
    </h2>
  );
}

function AnimatedSubtitle({
  children,
  viewKey,
}: {
  children: React.ReactNode;
  viewKey: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        duration: 150,
        delay: 50,
        ease: 'outQuad',
      });
    }
  }, [viewKey]);

  return (
    <p ref={ref} className="mt-2 text-gray-400 text-sm" style={{ opacity: 0 }}>
      {children}
    </p>
  );
}

function AnimatedTabIndicator({
  isActive,
}: {
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && isActive) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 150,
        ease: 'outQuad',
      });
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md"
      style={{ opacity: 0 }}
    />
  );
}

function AnimatedGradientBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const gradients = [
    'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
    'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
    'radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
    'radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
  ];

  useEffect(() => {
    if (!ref.current) return;

    let currentIndex = 0;
    const runAnimation = () => {
      if (!ref.current) return;
      currentIndex = (currentIndex + 1) % gradients.length;
      ref.current.style.background = gradients[currentIndex];
    };

    const interval = setInterval(runAnimation, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="w-full h-full transition-all duration-1000"
      style={{ background: gradients[0] }}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  // Reset to login view when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView('login');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSuccess = () => {
    onClose();
    // Additional success logic can be added here
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatedBackdrop
        onClose={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <AnimatedModal
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900
                   border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 opacity-30">
            <AnimatedGradientBackground />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-800/50 hover:bg-gray-700/50
                     border border-purple-500/30 rounded-lg transition-all duration-200
                     hover:border-purple-500/50 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>

          {/* Content */}
          <div className="relative p-8 pt-12">
            {/* Header */}
            <div className="text-center mb-8">
              <AnimatedHeader viewKey={currentView}>
                {currentView === 'login' ? 'Welcome Back!' : 'Create Account'}
              </AnimatedHeader>
              <AnimatedSubtitle viewKey={`${currentView}-subtitle`}>
                {currentView === 'login'
                  ? 'Login to continue your anime journey'
                  : 'Join the ultimate anime guessing game'}
              </AnimatedSubtitle>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg">
              <button
                onClick={() => setCurrentView('login')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300
                         relative overflow-hidden ${
                           currentView === 'login'
                             ? 'text-white'
                             : 'text-gray-400 hover:text-gray-300'
                         }`}
              >
                <AnimatedTabIndicator isActive={currentView === 'login'} />
                <span className="relative z-10">Login</span>
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300
                         relative overflow-hidden ${
                           currentView === 'register'
                             ? 'text-white'
                             : 'text-gray-400 hover:text-gray-300'
                         }`}
              >
                <AnimatedTabIndicator isActive={currentView === 'register'} />
                <span className="relative z-10">Register</span>
              </button>
            </div>

            {/* Forms */}
            {currentView === 'login' ? (
              <LoginForm
                key="login"
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setCurrentView('register')}
              />
            ) : (
              <RegisterForm
                key="register"
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setCurrentView('login')}
              />
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </AnimatedModal>
      </div>
    </>
  );
}
