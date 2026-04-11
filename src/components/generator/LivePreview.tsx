'use client';

import { useTheme } from '@/context/ThemeContext';
import { MOCK_PROFILES } from '@/lib/profileData';

interface LivePreviewProps {
  targetId: string;
  urgency: number;
  justification: string;
}

export default function LivePreview({
  targetId,
  urgency,
  justification,
}: LivePreviewProps) {
  const { theme } = useTheme();
  const isPolice = theme === 'police';

  const selectedProfile = MOCK_PROFILES.find((p) => p.id === targetId);

  const name =
    selectedProfile && isPolice
      ? selectedProfile.policeName
      : selectedProfile?.mafiaName || 'UNKNOWN';
  const status =
    selectedProfile && isPolice
      ? selectedProfile.policeStatus
      : selectedProfile?.mafiaStatus || 'UNKNOWN';

  // Format date nicely
  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full flex justify-center p-4">
      <div
        className="relative w-full max-w-lg aspect-[1/1.4] overflow-hidden flex flex-col p-8 transition-colors duration-200"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 95%, transparent)',
          border: '2px solid var(--border-color)',
        }}
      >
        {/* Dynamic Watermark / Background Styling */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center font-bold text-9xl tracking-tighter mix-blend-overlay"
          style={{ color: 'var(--text-primary)' }}
        >
          {isPolice ? 'LVPD' : 'SYN'}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div
            className="pb-4 mb-6"
            style={{ borderBottom: '2px solid var(--border-color)' }}
          >
            <h1
              className="text-lg font-mono font-bold tracking-widest uppercase text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              {isPolice ? 'LVPD Official Warrant' : 'Syndicate Burn Protocol'}
            </h1>
            <div className="flex justify-between mt-4 text-[10px] font-mono tracking-widest text-[#64748b]">
              <span>DATE: {currentDate}</span>
              <span>REF: {Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</span>
            </div>
          </div>

          {/* Target Info Box */}
          <div
            className="p-4 mb-6"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-base) 50%, #000)' }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">
                  {isPolice ? 'Subject Name:' : 'Target Alias:'}
                </span>
                <span
                  className="font-mono font-bold uppercase tracking-wider text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {name}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">
                  {isPolice ? 'Database ID:' : 'Node ID:'}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {targetId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">
                  {isPolice ? 'Current Status:' : 'Uplink Status:'}
                </span>
                <span
                  className="font-mono text-xs uppercase"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Urgency Meter */}
          <div className="mb-6">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] block mb-2">
              {isPolice ? 'Priority Level:' : 'Hazard Level:'} {urgency}/100
            </span>
            <div
              className="w-full h-2"
              style={{ backgroundColor: 'var(--border-color)' }}
            >
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${urgency}%`,
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            </div>
          </div>

          {/* Justification Text */}
          <div className="flex-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] block mb-2">
              {isPolice ? 'Incident Justification:' : 'Rationale:'}
            </span>
            <p
              className="font-mono text-xs leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap"
            >
              {justification || (isPolice ? '[Enter warrant justification notes here...]' : '[Enter operational rationale here...]')}
            </p>
          </div>

          {/* Footer Warning */}
          <div
            className="pt-4 mt-6 text-center text-[8px] font-mono tracking-widest uppercase"
            style={{ 
              borderTop: '1px solid var(--border-color)',
              color: 'var(--text-muted)' 
            }}
          >
            {isPolice
              ? 'Authorized personnel only. Misuse of this terminal is a Class A felony.'
              : 'End-to-end encrypted. Destroy context after execution.'}
          </div>
          
        </div>

        {/* Dynamic Rubber Stamp Overlay */}
        {urgency > 80 && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none z-20 flex items-center justify-center p-3"
            style={{
              border: '6px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              opacity: 0.8,
            }}
          >
            <span
              className="font-bold font-mono tracking-[0.3em] uppercase text-4xl whitespace-nowrap"
            >
              {isPolice ? 'APPROVED: ALPHA' : 'CRITICAL HIT'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
