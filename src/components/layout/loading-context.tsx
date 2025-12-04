
'use client';

import { Feather } from 'lucide-react';
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

export const LoadingContext = createContext<LoadingContextType>({
  showLoader: () => {},
  hideLoader: () => {},
});

function LoadingOverlay({ message, isVisible, hideLoader }: { message: string; isVisible: boolean; hideLoader: () => void; }) {
  const [dots, setDots] = useState('');
  const pathname = usePathname();

  // This effect will run whenever the page route changes, automatically hiding the loader.
  useEffect(() => {
    hideLoader();
  }, [pathname, hideLoader]);
  
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return '.';
          return prev + '.';
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-full items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-white">
        <Feather className="h-10 w-10 animate-pulse" />
        <p className="font-logo tracking-widest text-lg">
          {message}
          <span className="w-6 inline-block text-left">{dots}</span>
        </p>
      </div>
    </div>
  );
}

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Performing...');

  const showLoader = (msg = 'Performing...') => {
    setMessage(msg);
    setIsLoading(true);
  };

  const hideLoader = React.useCallback(() => {
    setIsLoading(false);
  }, []);
  
  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <LoadingOverlay isVisible={isLoading} message={message} hideLoader={hideLoader} />
    </LoadingContext.Provider>
  );
};
