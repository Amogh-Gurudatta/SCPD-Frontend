'use client';

import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, Terminal } from 'lucide-react';

export default function GatewayPage() {
  const { theme, setTheme, setMafiaSession } = useTheme();
  const router = useRouter();
  const [fieldOne, setFieldOne] = useState('');
  const [fieldTwo, setFieldTwo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Backdoor states
  const [tapData, setTapData] = useState({ count: 0, lastTime: 0 });
  const [codeTriggered, setCodeTriggered] = useState(false);

  const isPolice = theme === 'police';

  // Force Police theme and reset session on mount
  useEffect(() => {
    setTheme('police');
    setMafiaSession(false);
  }, [setTheme, setMafiaSession]);

  // Monitor for dual-trigger activation
  useEffect(() => {
    if (isPolice && codeTriggered && tapData.count >= 3) {
      setTheme('mafia');
      setMafiaSession(true);
      setCodeTriggered(false);
      setTapData({ count: 0, lastTime: 0 });
    }
  }, [isPolice, codeTriggered, tapData.count, setTheme, setMafiaSession]);

  const handleIconClick = () => {
    // Failsafe: Mafia mode only needs 3 taps to return
    if (!isPolice) {
      const now = Date.now();
      if (now - tapData.lastTime > 2000) {
        setTapData({ count: 1, lastTime: now });
        return;
      }
      const newCount = tapData.count + 1;
      if (newCount >= 3) {
        setTheme('police');
        setTapData({ count: 0, lastTime: 0 });
      } else {
        setTapData({ count: newCount, lastTime: now });
      }
      return;
    }

    // Police mode: One half of the dual-trigger
    const now = Date.now();
    if (now - tapData.lastTime > 2000) {
      setTapData({ count: 1, lastTime: now });
      return;
    }
    const newCount = tapData.count + 1;
    setTapData({ count: newCount, lastTime: now });
  };

  const handleFieldOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === 'OVERRIDE_SYNDICATE') {
      setCodeTriggered(true);
      setFieldOne(''); // Clear backdoor text
    } else {
      setFieldOne(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldOne || !fieldTwo) return;

    setIsLoading(true);
    setErrorInfo(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiUrl}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: fieldOne,
          password: fieldTwo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        router.push('/map');
      } else if (response.status === 401) {
        setErrorInfo('ACCESS DENIED: Invalid credentials');
      } else {
        setErrorInfo(`ERROR: Unexpected server response (${response.status})`);
      }
    } catch (error) {
      setErrorInfo('ERROR: Network offline or backend unreachable');
    } finally {
      setIsLoading(false);
    }
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

          {/* Header */}
          <div className="mb-8 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <div onClick={handleIconClick} className="cursor-default" aria-hidden="true">
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
              </div>
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
                onChange={handleFieldOneChange}
                placeholder={isPolice ? 'Enter badge number' : 'Enter node address'}
                autoComplete="off"
                className="w-full bg-transparent text-sm font-mono py-2 px-0 outline-none transition-colors duration-200"
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
                className="w-full bg-transparent text-sm font-mono py-2 px-0 outline-none transition-colors duration-200"
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
              disabled={isLoading || (isMounted && (!fieldOne || !fieldTwo))}
              className="w-full py-3 text-xs font-mono font-bold uppercase tracking-[0.3em] cursor-pointer transition-opacity duration-150 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: isPolice ? '#020617' : '#000000',
                border: 'none',
              }}
            >
              {isLoading ? 'TRANSMITTING...' : 'Authenticate'}
            </button>
          </form>

          {/* Error Details */}
          {errorInfo && (
            <div className="mt-4 p-2 tracking-widest text-[10px] font-mono text-center uppercase border border-red-900/50 text-red-500 bg-red-900/10">
              {errorInfo}
            </div>
          )}

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
