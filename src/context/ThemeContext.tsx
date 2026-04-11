'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'police' | 'mafia';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mafiaSession: boolean;
  setMafiaSession: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('police');
  const [mafiaSession, setMafiaSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('scpd-theme') as Theme | null;
    if (savedTheme === 'police' || savedTheme === 'mafia') {
      setTheme(savedTheme);
    }
    const savedSession = localStorage.getItem('scpd-mafia-session');
    if (savedSession === 'true') {
      setMafiaSession(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('scpd-theme', theme);
    document.documentElement.classList.remove('police', 'mafia');
    document.documentElement.classList.add(theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('scpd-mafia-session', String(mafiaSession));
  }, [mafiaSession, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'police' ? 'mafia' : 'police'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mafiaSession, setMafiaSession }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
