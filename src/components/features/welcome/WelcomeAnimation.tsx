
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WelcomeAnimation() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('welcomeAnimationShown');
    if (!hasBeenShown) {
      setShowAnimation(true);
      sessionStorage.setItem('welcomeAnimationShown', 'true');
    }
  }, []);

  useEffect(() => {
    if (showAnimation) {
      // Mount and make visible
      const initialTimer = setTimeout(() => {
        setIsVisible(true);
      }, 100); // Short delay to ensure transition triggers

      // Set timers for fade-out and unmount
      const fadeOutTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // Total visible time including fade-in

      const unmountTimer = setTimeout(() => {
        setShowAnimation(false);
      }, 2500); // Unmount after fade-out transition

      return () => {
        clearTimeout(initialTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [showAnimation]);

  if (!showAnimation) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm p-2 transition-transform duration-500 ease-in-out',
        isVisible ? 'translate-y-4' : '-translate-y-full'
      )}
    >
      <div className="flex items-center gap-3 rounded-full bg-background p-2 pr-4 shadow-2xl ring-1 ring-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">Success! Welcome Back</p>
      </div>
    </div>
  );
}
