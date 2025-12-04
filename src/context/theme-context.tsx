
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = "light" | "dark" | "midnight" | "infrared" | "forest" | "ocean" | "nord";
type SidebarTheme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const storedSidebarTheme = localStorage.getItem("sidebarTheme") as SidebarTheme | null;

    if (storedTheme) {
      setThemeState(storedTheme);
    }
    if (storedSidebarTheme) {
        setSidebarThemeState(storedSidebarTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };
  
  const setSidebarTheme = (newSidebarTheme: SidebarTheme) => {
    setSidebarThemeState(newSidebarTheme);
    localStorage.setItem("sidebarTheme", newSidebarTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, sidebarTheme, setSidebarTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
