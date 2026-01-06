'use client';

import { useRef, useEffect } from 'react';
import { animate } from '@/lib/animejs';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      animate(containerRef.current, {
        translateY: [-100, 0],
        opacity: [0, 1],
        duration: 400,
        ease: 'outBack',
      });
    }

    if (isVisible && iconRef.current) {
      animate(iconRef.current, {
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0],
        duration: 500,
        loop: 3,
        ease: 'inOutQuad',
      });
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
      ref={containerRef}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${bgColor} border rounded-xl px-6 py-4 backdrop-blur-md shadow-2xl max-w-md w-full mx-4`}
      style={{ opacity: 0 }}
    >
      <div className="flex items-start gap-4">
        <div ref={iconRef} className={`${iconColor} flex-shrink-0 mt-0.5`}>
          {isSuspicious ? (
            <EyeOff className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

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
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
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
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isSuspicious && (
        <div className="mt-4 pt-4 border-t border-red-500/30">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            <span>Your gameplay is being monitored for fairness</span>
          </div>
        </div>
      )}
    </div>
  );
}
