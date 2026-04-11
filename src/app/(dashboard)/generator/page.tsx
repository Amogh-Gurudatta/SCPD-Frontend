'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import DocumentForm from '@/components/generator/DocumentForm';
import LivePreview from '@/components/generator/LivePreview';

export default function GeneratorPage() {
  const [targetId, setTargetId] = useState('');
  const [urgency, setUrgency] = useState(50);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { theme } = useTheme();
  const isPolice = theme === 'police';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || isSubmitting) return;

    // Trigger the Juiced Progress State
    setIsSubmitting(true);

    // Audio cue "juice" using Web Audio API (so no external assets needed)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (isPolice) {
        // Mechanical click/beep
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else {
        // Digital glitch thud
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.2);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      // Ignore if Audio API blocked by browser without interaction
    }

    // Reset after 2 seconds
    setTimeout(() => {
      setIsSubmitting(false);
      setTargetId('');
      setUrgency(50);
      setJustification('');
    }, 2000);
  };

  return (
    <div className="min-h-screen relative p-6 lg:p-12 overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
           <h1 className="text-xl font-mono tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--text-primary)' }}>
             {isPolice ? 'Tactical Generator' : 'Burn Protocol'}
           </h1>
           <p className="text-xs font-mono tracking-widest uppercase opacity-70" style={{ color: 'var(--text-muted)' }}>
             {isPolice ? 'Draft an active arrest warrant.' : 'Initialize target destruction context.'}
           </p>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mt-8">
          {/* Left Column: Form */}
          <div className="flex flex-col h-full w-full">
            <DocumentForm 
              targetId={targetId}
              setTargetId={setTargetId}
              urgency={urgency}
              setUrgency={setUrgency}
              justification={justification}
              setJustification={setJustification}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Right Column: Live Document Preview */}
          <div className="flex flex-col h-full w-full items-center justify-center pt-8 lg:pt-0 sticky top-12">
            <LivePreview 
               targetId={targetId}
               urgency={urgency}
               justification={justification}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
