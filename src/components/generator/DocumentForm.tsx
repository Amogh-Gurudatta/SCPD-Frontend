'use client';

import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';

interface DocumentFormProps {
  targetId: string;
  setTargetId: (val: string) => void;
  urgency: number;
  setUrgency: (val: number) => void;
  justification: string;
  setJustification: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DocumentForm({
  targetId,
  setTargetId,
  urgency,
  setUrgency,
  justification,
  setJustification,
  isSubmitting,
  onSubmit,
}: DocumentFormProps) {
  const { theme } = useTheme();
  const { profiles } = useData();
  const isPolice = theme === 'police';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-md">
      {/* Target Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase font-mono tracking-widest text-(--text-muted)">
          {isPolice ? 'Select Suspect Target:' : 'Select Syndicate Target:'}
        </label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 text-sm font-mono outline-none cursor-pointer appearance-none transition-colors duration-200"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            opacity: isSubmitting ? 0.5 : 1,
          }}
          onFocus={(e) => !isSubmitting && (e.target.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => !isSubmitting && (e.target.style.borderColor = 'var(--border-color)')}
        >
          <option value="" disabled className="bg-black text-white">
            -- Select Identity --
          </option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id} className="bg-black text-white">
              {isPolice ? profile.policeName : profile.mafiaName}
            </option>
          ))}
        </select>
      </div>

      {/* Urgency Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <label className="text-[10px] uppercase font-mono tracking-widest text-(--text-muted)">
            {isPolice ? 'Warrant Priority:' : 'Urgency/Threat Level:'}
          </label>
          <span className="text-[10px] font-mono tracking-widest text-(--accent-primary)">
            {urgency} / 100
          </span>
        </div>
        
        {/* Brutalist Custom Slider Approach using styled range input */}
        <input
          type="range"
          min="1"
          max="100"
          value={urgency}
          onChange={(e) => setUrgency(Number(e.target.value))}
          disabled={isSubmitting}
          className="w-full h-8 appearance-none cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            opacity: isSubmitting ? 0.5 : 1,
          }}
        />
        <style>{`
          /* Brutalist Range thumb override */
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 30px;
            width: 16px;
            background: var(--accent-primary);
            cursor: pointer;
            border: none;
            border-radius: 0;
          }
          input[type=range]::-moz-range-thumb {
            height: 30px;
            width: 16px;
            background: var(--accent-primary);
            cursor: pointer;
            border: none;
            border-radius: 0;
          }
        `}</style>
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-2 h-48">
        <label className="text-[10px] uppercase font-mono tracking-widest text-(--text-muted)">
          {isPolice ? 'Incident Justification:' : 'Burn Order Rationale:'}
        </label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          disabled={isSubmitting}
          className="w-full h-full px-4 py-3 text-sm font-mono outline-none resize-none transition-colors duration-200"
          placeholder={isPolice ? 'Detail probable cause...' : 'Detail logic for extraction...'}
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            opacity: isSubmitting ? 0.5 : 1,
          }}
          onFocus={(e) => !isSubmitting && (e.target.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => !isSubmitting && (e.target.style.borderColor = 'var(--border-color)')}
        />
      </div>

      {/* Submit Button with Juice */}
      <button
        type="submit"
        disabled={isSubmitting || !targetId}
        className="relative w-full h-14 overflow-hidden mt-4 group cursor-pointer disabled:cursor-not-allowed"
        style={{
          border: '1px solid var(--accent-primary)',
          backgroundColor: isSubmitting ? 'var(--bg-surface)' : 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting && targetId) {
            e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-primary) 10%, transparent)';
          }
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center z-10 transition-colors duration-200 group-hover:text-black">
          <span 
            className="text-xs font-mono font-bold uppercase tracking-[0.3em]"
            style={{ 
              color: isSubmitting || !targetId 
                ? 'var(--text-muted)' 
                : 'var(--accent-primary)' 
            }}
          >
            {isSubmitting 
              ? 'TRANSMITTING...' 
              : (isPolice ? 'Issue Warrant' : 'Execute Order')}
          </span>
        </div>

        {/* The Transmitting Progress Juice */}
        {isSubmitting && (
          <div 
            className="absolute top-0 left-0 h-full transition-all duration-2000 ease-linear"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 40%, transparent)',
              width: '100%',
              animation: 'fillProgress 2s linear forwards'
            }}
          />
        )}
      </button>

      {/* Internal Animation for progress bar */}
      <style>{`
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </form>
  );
}
