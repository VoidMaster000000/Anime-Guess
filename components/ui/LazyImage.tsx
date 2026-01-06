'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { animate } from '@/lib/animejs';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  containerClassName = '',
  priority = false,
  sizes,
  objectFit = 'cover',
  placeholderColor = 'rgba(168, 85, 247, 0.1)',
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Animate on load
  useEffect(() => {
    if (isLoaded && imageRef.current) {
      animate(imageRef.current, {
        opacity: [0, 1],
        scale: [1.05, 1],
        filter: ['blur(10px)', 'blur(0px)'],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, [isLoaded]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: placeholderColor }}
        >
          {/* Animated loading skeleton */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }}
            />
          </div>
          {/* Loading spinner */}
          <LoadingSpinner />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-800"
        >
          <div className="text-center text-zinc-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <div
          ref={imageRef}
          className="absolute inset-0"
          style={{ opacity: 0 }}
        >
          {fill ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              className={className}
              style={{ objectFit }}
              onLoad={handleLoad}
              onError={handleError}
              priority={priority}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={className}
              style={{ objectFit }}
              onLoad={handleLoad}
              onError={handleError}
              priority={priority}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Loading spinner component
function LoadingSpinner() {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinnerRef.current) {
      animate(spinnerRef.current, {
        rotate: 360,
        duration: 1000,
        ease: 'linear',
        loop: true,
      });
    }
  }, []);

  return (
    <div
      ref={spinnerRef}
      className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
    />
  );
}
