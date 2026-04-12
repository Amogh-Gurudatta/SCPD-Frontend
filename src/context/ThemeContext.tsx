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
    if (!mounted) return;
    setThemeState(prev => {
      if (newTheme === prev) return prev;
      setGlitchTheme(newTheme);
      setGlitching(true);
      setTimeout(() => {
        setGlitching(false);
      }, 750); // Slightly longer for more nuance
      return newTheme;
    });
  }, [mounted]);

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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 pointer-events-none z-9999 bg-black overflow-hidden"
          >
            {/* 1. RGB Ghosting / Channel Split Effect */}
            <motion.div
              className="absolute inset-0 opacity-40 mix-blend-screen"
              animate={{
                x: [-10, 10, -5, 5, 0],
                y: [5, -5, 2, -2, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              style={{ backgroundColor: glitchTheme === 'police' ? '#1e40af' : '#b91c1c' }}
            />

            {/* 2. Scanlines layer */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 4px, 3px 100%'
              }}
            />

            {/* 3. Static / Noise layer */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{ opacity: [0.1, 0.3, 0.1, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.05 }}
              style={{
                backgroundImage: 'url("https://media.giphy.com/media/oEI9uWUicf160/giphy.gif")',
                backgroundSize: 'cover'
              }}
            />

            {/* 4. Center Tactical Alert */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-8 py-4 border-2 font-mono font-bold tracking-[0.3em] bg-black/80"
                style={{
                  borderColor: glitchTheme === 'police' ? '#2563eb' : '#dc2626',
                  color: glitchTheme === 'police' ? '#2563eb' : '#dc2626'
                }}
              >
                {glitchTheme === 'police' ? 'RESTORING SYSTEM DEFAULTS...' : 'OVERRIDING SECURITY PROTOCOLS...'}
                <motion.div
                  className="mt-2 h-1 bg-current"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </div>

            {/* 5. Horizontal Glitch Strips */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full bg-white/10"
                style={{ height: Math.random() * 50 + 'px', top: Math.random() * 100 + '%' }}
                animate={{ x: [-100, 100, -50, 0] }}
                transition={{ duration: 0.2, repeat: 2 }}
              />
            ))}
          </motion.div>
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
