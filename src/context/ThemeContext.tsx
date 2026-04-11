'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [theme, setThemeState] = useState<Theme>('police');
  const [mafiaSession, setMafiaSession] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [glitchTheme, setGlitchTheme] = useState<Theme>('police');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('scpd-theme') as Theme | null;
    if (savedTheme === 'police' || savedTheme === 'mafia') {
      setThemeState(savedTheme);
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

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(prev => {
      if (newTheme === prev) return prev;
      setGlitchTheme(newTheme);
      setGlitching(true);
      setTimeout(() => {
        setGlitching(false);
      }, 200);
      return newTheme;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'police' ? 'mafia' : 'police');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mafiaSession, setMafiaSession }}>
      {children}
      <AnimatePresence>
        {glitching && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{
              backgroundColor: glitchTheme === 'police' ? '#ffffff' : '#ff0000',
              mixBlendMode: glitchTheme === 'police' ? 'overlay' : 'exclusion',
            }}
          />
        )}
      </AnimatePresence>
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
