'use client';

import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, Terminal } from 'lucide-react';

export default function GatewayPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [fieldOne, setFieldOne] = useState('');
  const [fieldTwo, setFieldTwo] = useState('');

  const isPolice = theme === 'police';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/map');
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Login Card */}
      <div
        className="w-full max-w-md relative"
        style={{
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Top Accent Bar */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        />

        <div className="p-8 pt-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-end gap-3 mb-8">
            <span
              className="text-[10px] font-mono uppercase tracking-[0.2em]"
              style={{
                color: isPolice ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              LVPD
            </span>

            <button
              id="theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="relative w-10 h-5 cursor-pointer"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
              }}
              aria-label="Toggle theme"
            >
              <div
                className="absolute top-[2px] h-3 w-4 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  left: isPolice ? '2px' : 'calc(100% - 18px)',
                }}
              />
            </button>

            <span
              className="text-[10px] font-mono uppercase tracking-[0.2em]"
              style={{
                color: !isPolice ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              SYNDICATE
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              {isPolice ? (
                <Shield
                  size={20}
                  style={{ color: 'var(--accent-primary)' }}
                  strokeWidth={2}
                />
              ) : (
                <Terminal
                  size={20}
                  style={{ color: 'var(--accent-primary)' }}
                  strokeWidth={2}
                />
              )}
              <h1
                className="text-sm font-mono font-bold uppercase tracking-[0.25em]"
                style={{ color: 'var(--text-primary)' }}
              >
                {isPolice ? 'LVPD Tactical Terminal' : 'Syndicate Node Access'}
              </h1>
            </div>
            <p
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {isPolice
                ? 'Authorized personnel only. All activity is monitored.'
                : 'Encrypted channel. No logging. No trace.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field One */}
            <div>
              <label
                htmlFor="field-one"
                className="block text-[10px] font-mono uppercase tracking-[0.2em] mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {isPolice ? 'Badge ID' : 'Node ID'}
              </label>
              <input
                id="field-one"
                type="text"
                value={fieldOne}
                onChange={(e) => setFieldOne(e.target.value)}
                placeholder={isPolice ? 'Enter badge number' : 'Enter node address'}
                autoComplete="off"
                className="w-full bg-transparent text-sm font-mono py-2 px-0 outline-none"
                style={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid var(--accent-primary)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: 0,
                }}
              />
            </div>

            {/* Field Two */}
            <div>
              <label
                htmlFor="field-two"
                className="block text-[10px] font-mono uppercase tracking-[0.2em] mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {isPolice ? 'Password' : 'Decryption Key'}
              </label>
              <input
                id="field-two"
                type="password"
                value={fieldTwo}
                onChange={(e) => setFieldTwo(e.target.value)}
                placeholder={isPolice ? '••••••••••' : 'Key sequence'}
                autoComplete="off"
                className="w-full bg-transparent text-sm font-mono py-2 px-0 outline-none"
                style={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid var(--accent-primary)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: 0,
                }}
              />
            </div>

            {/* Submit */}
            <button
              id="auth-submit"
              type="submit"
              className="w-full py-3 text-xs font-mono font-bold uppercase tracking-[0.3em] cursor-pointer transition-opacity duration-150 hover:opacity-80"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: isPolice ? '#020617' : '#ffffff',
                border: 'none',
              }}
            >
              Authenticate
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p
              className="text-[9px] font-mono uppercase tracking-[0.15em]"
              style={{ color: 'var(--text-muted)', opacity: 0.6 }}
            >
              {isPolice
                ? 'Coordinate: 36.1716° N, 115.1391° W — Secure Channel'
                : 'Connection routed through 14 nodes — Untraceable'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
