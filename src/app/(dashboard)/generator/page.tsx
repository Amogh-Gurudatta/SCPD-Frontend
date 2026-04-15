'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import DocumentForm from '@/components/generator/DocumentForm';
import LivePreview from '@/components/generator/LivePreview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function GeneratorPage() {
  const [targetId, setTargetId] = useState('');
  const [urgency, setUrgency] = useState(50);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { theme } = useTheme();
  const { updateProfileStatus, addWarrant } = useData();
  const isPolice = theme === 'police';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || isSubmitting) return;

    // Trigger the Juiced Progress State
    setIsSubmitting(true);

    // Global State Update
    updateProfileStatus(targetId, isPolice ? 'WANTED' : 'ACTIVE', isPolice ? 'ONLINE' : 'BURNED');
    addWarrant({
      id: `W-${Math.floor(Math.random() * 10000)}`,
      targetId,
      timestamp: new Date().toISOString(),
      urgency,
      justification,
      type: isPolice ? 'WARRANT' : 'BURN',
    });

    toast.success(isPolice ? 'TRANSMISSION SUCCESSFUL' : 'BURN ORDER PROTOCOL ACTIVE', {
      description: `Target ID ${targetId} has been flagged globally.`,
      className: 'font-mono uppercase text-xs',
    });

    // Audio cue "juice" using Web Audio API (so no external assets needed)
    try {
      const AudioCtx = (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)!;
      const audioCtx = new AudioCtx();
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
    } catch {
      // Ignore if Audio API blocked by browser without interaction
    }

    // PDF Generation
    try {
      const docElement = document.getElementById('warrant-document');
      if (docElement) {
        // Snapshot the element
        const canvas = await html2canvas(docElement, {
          scale: 2, // High resolution
          useCORS: true,
          backgroundColor: '#050505', // Force black background
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 format: 210mm x 297mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Add 10mm margin for clean look
        const margin = 10;
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);

        let finalWidth = maxWidth;
        let finalHeight = (canvas.height * maxWidth) / canvas.width;

        // If height is still too much, scale down based on height
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = (canvas.width * maxHeight) / canvas.height;
        }

        // Center it
        const xOffset = (pageWidth - finalWidth) / 2;
        const yOffset = (pageHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        
        // Download document
        const filename = isPolice ? `LVPD_Warrant_${targetId}.pdf` : `SYN_Burn_Order_${targetId}.pdf`;
        pdf.save(filename);
      }
    } catch (error) {
      console.error('PDF Generation failed', error);
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
    <div className="min-h-screen relative p-6 pt-20 lg:p-12 lg:pt-12 pb-24 overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
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
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start mt-8">
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
          <div className="flex flex-col w-full items-center lg:justify-center pt-2 lg:pt-0 lg:sticky lg:top-24 relative z-0">
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
