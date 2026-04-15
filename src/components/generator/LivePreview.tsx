'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { motion } from 'framer-motion';

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
  const { profiles } = useData();
  const [refNumber] = useState(() =>
    Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  );
  const isPolice = theme === 'police';

  const selectedProfile = profiles.find((p) => p.id === targetId);

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
    <div className="w-full h-full flex items-start justify-center p-4">
      <div
        id="warrant-document"
        className="relative w-full max-w-[350px] sm:max-w-md md:max-w-lg shadow-2xl flex flex-col p-[5%] transition-all duration-200 overflow-hidden bg-(--bg-surface)"
        style={{
          aspectRatio: '1 / 1.414',
          border: '2px solid var(--border-color)',
          fontSize: 'clamp(7px, 2vw, 13px)',
        }}
      >
        {/* Dynamic Watermark / Background Styling */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center font-bold tracking-tighter mix-blend-overlay"
          style={{
            color: 'var(--text-primary)',
            fontSize: '12em'
          }}
        >
          {isPolice ? 'LVPD' : 'SYN'}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div
            className="pb-[4%] mb-[6%]"
            style={{ borderBottom: '2px solid var(--border-color)' }}
          >
            <h1
              className="font-mono font-bold tracking-widest uppercase text-center"
              style={{ color: 'var(--text-primary)', fontSize: '1.4em' }}
            >
              {isPolice ? 'LVPD Official Warrant' : 'Syndicate Burn Protocol'}
            </h1>
            <div className="flex justify-between mt-[4%] font-mono tracking-widest text-[#64748b]" style={{ fontSize: '0.8em' }}>
              <span>DATE: {currentDate}</span>
              <span>REF: {refNumber}</span>
            </div>
          </div>

          {/* Target Info Box */}
          <div
            className="p-[5%] mb-[6%] bg-black"
          >
            <div className="flex flex-col gap-[1em]">
              <div className="flex justify-between items-baseline">
                <span className="uppercase font-mono tracking-widest text-(--text-muted)" style={{ fontSize: '0.7em' }}>
                  {isPolice ? 'Subject Name:' : 'Target Alias:'}
                </span>
                <span
                  className="font-mono font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-primary)', fontSize: '1.1em' }}
                >
                  {name}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="uppercase font-mono tracking-widest text-(--text-muted)" style={{ fontSize: '0.7em' }}>
                  {isPolice ? 'Database ID:' : 'Node ID:'}
                </span>
                <span className="font-mono text-(--text-muted)" style={{ fontSize: '0.8em' }}>
                  {targetId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="uppercase font-mono tracking-widest text-(--text-muted)" style={{ fontSize: '0.7em' }}>
                  {isPolice ? 'Current Status:' : 'Uplink Status:'}
                </span>
                <span
                  className="font-mono uppercase"
                  style={{ color: 'var(--accent-primary)', fontSize: '0.8em' }}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Urgency Meter */}
          <div className="mb-[6%]">
            <span className="uppercase font-mono tracking-widest text-(--text-muted) block mb-[2%]" style={{ fontSize: '0.7em' }}>
              {isPolice ? 'Priority Level:' : 'Hazard Level:'} {urgency}/100
            </span>
            <div
              className="w-full h-[0.6em]"
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

          {/* Justification Text - SCROLLABLE DOSSIER STYLE */}
          <div className="flex-1 overflow-y-auto pr-[2%] custom-scrollbar">
            <span className="uppercase font-mono tracking-widest text-(--text-muted) block mb-[2%]" style={{ fontSize: '0.7em' }}>
              {isPolice ? 'Incident Justification:' : 'Rationale:'}
            </span>
            <motion.p
              key={justification}
              initial={{ opacity: 0.5, filter: 'blur(2px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="font-mono leading-relaxed text-(--text-primary) whitespace-pre-wrap"
              style={{ fontSize: '0.9em' }}
            >
              {justification || (isPolice ? '[Enter warrant justification notes here...]' : '[Enter operational rationale here...]')}
              <motion.span
                data-html2canvas-ignore="true"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="ml-1 inline-block w-2 h-4 align-middle bg-(--accent-primary)"
              />
            </motion.p>
          </div>

          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 2px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: var(--border-color);
            }
          `}</style>

          {/* Spacer to separate rationale and footer if text is short */}
          {!justification && <div className="h-[2em]" />}

          {/* Footer Warning */}
          <div
            className="pt-[2%] pb-[4%] text-center font-mono tracking-widest uppercase mt-auto"
            style={{
              borderTop: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.65em'
            }}
          >
            {isPolice
              ? 'Authorized personnel only. Misuse of this terminal is a Class A felony.'
              : 'End-to-end encrypted. Destroy context after execution.'}
          </div>

        </div>

        {/* Dynamic Rubber Stamp Overlay - SVG Implementation for html2canvas stability */}
        {urgency > 80 && (
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none z-20"
            style={{
              transform: 'translate(-50%, -50%) rotate(-12deg)',
              opacity: 0.8,
              width: '75%', // Covers ~3/4 of the document width
            }}
          >
            <svg
              width="100%"
              height="auto"
              viewBox="0 0 400 120"
              className="drop-shadow-2xl"
            >
              <rect
                x="5"
                y="5"
                width="390"
                height="110"
                fill="none"
                stroke={isPolice ? 'var(--accent-primary)' : '#991b1b'}
                strokeWidth="10"
              />
              <text
                x="50%"
                y="52%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill={isPolice ? 'var(--accent-primary)' : '#991b1b'}
                className="font-mono font-bold uppercase"
                style={{ fontSize: '32px', letterSpacing: '4px' }}
              >
                {isPolice ? 'APPROVED: ALPHA' : 'CRITICAL HIT'}
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
