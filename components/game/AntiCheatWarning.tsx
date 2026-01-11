'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Eye, EyeOff } from 'lucide-react';

interface AntiCheatWarningProps {
  isVisible: boolean;
  tabSwitchCount: number;
  maxSwitches: number;
  onDismiss: () => void;
  isSuspicious: boolean;
}

export default function AntiCheatWarning({
  isVisible,
  tabSwitchCount,
  maxSwitches,
  onDismiss,
  isSuspicious,
}: AntiCheatWarningProps) {
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
  const [iconPulse, setIconPulse] = useState(false);

  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(() => setIsAnimatedIn(true));
      // Pulse icon 3 times
      setIconPulse(true);
      const timer = setTimeout(() => setIconPulse(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatedIn(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const severity = isSuspicious ? 'high' : tabSwitchCount >= maxSwitches - 1 ? 'medium' : 'low';

  const bgColor = {
    low: 'bg-yellow-500/20 border-yellow-500/50',
    medium: 'bg-orange-500/20 border-orange-500/50',
    high: 'bg-red-500/20 border-red-500/50',
  }[severity];

  const textColor = {
    low: 'text-yellow-400',
    medium: 'text-orange-400',
    high: 'text-red-400',
  }[severity];

  const iconColor = {
    low: 'text-yellow-500',
    medium: 'text-orange-500',
    high: 'text-red-500',
  }[severity];

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${bgColor} border rounded-xl px-6 py-4 backdrop-blur-md shadow-2xl max-w-md w-full mx-4 transition-all duration-400 ${
        isAnimatedIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div
          className={`${iconColor} flex-shrink-0 mt-0.5 ${iconPulse ? 'animate-wiggle' : ''}`}
          style={{
            animation: iconPulse ? 'wiggle 500ms ease-in-out 3' : 'none',
          }}
          aria-hidden="true"
        >
          {isSuspicious ? (
            <EyeOff className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.2) rotate(-10deg); }
            75% { transform: scale(1.2) rotate(10deg); }
          }
        `}</style>

        <div className="flex-1">
          <h3 className={`font-bold ${textColor} text-lg`}>
            {isSuspicious ? 'Suspicious Activity Detected!' : 'Tab Switch Detected'}
          </h3>
          <p className="text-gray-300 text-sm mt-1">
            {isSuspicious ? (
              <>
                You have switched tabs too many times. This may affect your score integrity.
                Play fair to earn legitimate rewards!
              </>
            ) : (
              <>
                You switched away from the game.{' '}
                <span className={textColor}>
                  ({tabSwitchCount}/{maxSwitches} warnings)
                </span>
              </>
            )}
          </p>

          {!isSuspicious && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={tabSwitchCount}
                aria-valuemin={0}
                aria-valuemax={maxSwitches}
                aria-label={`Tab switches: ${tabSwitchCount} of ${maxSwitches} warnings`}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    severity === 'low'
                      ? 'bg-yellow-500'
                      : severity === 'medium'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(tabSwitchCount / maxSwitches) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{maxSwitches - tabSwitchCount} left</span>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss warning"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {isSuspicious && (
        <div className="mt-4 pt-4 border-t border-red-500/30">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>Your gameplay is being monitored for fairness</span>
          </div>
        </div>
      )}
    </div>
  );
}
