'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GSAPModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function GSAPModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
}: GSAPModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const animateIn = useCallback(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
    tl.fromTo(
      modalRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' },
      '-=0.1'
    );
  }, []);

  const animateOut = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });
    tl.to(modalRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.2,
      ease: 'power3.in',
    });
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.15, ease: 'power2.in' },
      '-=0.1'
    );
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      animateIn();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, animateIn]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        animateOut();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, animateOut]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) animateOut();
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full border-2 border-foreground bg-background',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-foreground p-4">
          {title && (
            <h2 className="font-serif text-xl font-bold uppercase tracking-wider">
              {title}
            </h2>
          )}
          <button
            onClick={() => animateOut()}
            className="ml-auto p-1 transition-opacity hover:opacity-60"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
