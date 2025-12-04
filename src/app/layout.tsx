
'use client';

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Providers } from './providers';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsentBanner } from '@/components/layout/cookie-consent-banner';
import { useTheme } from '@/context/theme-context';

function AppBody({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Set a default theme if none is set
    const storedTheme = localStorage.getItem("theme");
    if (!storedTheme) {
      setTheme("infrared");
    }
    document.documentElement.className = theme;
  }, [theme, setTheme]);

  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppBody>
            <AppLayout>{children}</AppLayout>
            <Toaster />
            <CookieConsentBanner />
          </AppBody>
        </Providers>
      </body>
    </html>
  );
}
