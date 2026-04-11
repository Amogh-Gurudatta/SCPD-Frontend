'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Shield, Terminal } from 'lucide-react';

export default function CustomCursor() {
  const { theme } = useTheme();
  const isPolice = theme === 'police';
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);

      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === 'pointer' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A'
      );
    };

    window.addEventListener('mousemove', moveMouse);
    return () => window.removeEventListener('mousemove', moveMouse);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-difference hidden lg:block"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    >
      <motion.div
        animate={{
          scale: isHovering ? 1.5 : 1,
          rotate: isHovering ? [0, -10, 10, 0] : 0,
        }}
        className="flex items-center justify-center p-1"
        style={{
          color: isPolice ? '#2563eb' : '#dc2626',
        }}
      >
        {isPolice ? <Shield size={20} fill="currentColor" fillOpacity={isHovering ? 0.2 : 0} /> : <Terminal size={20} />}
      </motion.div>
      
      {/* Trailing Dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current"
        style={{ color: isPolice ? '#2563eb' : '#dc2626' }}
      />
    </motion.div>
  );
}
