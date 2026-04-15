'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import IncidentFeed from '@/components/map/IncidentFeed';
import { type IncidentData } from '@/context/DataContext';

// Dynamically import the map widget with ssr: false to prevent Leaflet from crashing the server
const MapWidget = dynamic(() => import('@/components/map/MapWidget'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
      <div className="text-xs font-mono tracking-widest text-[#64748b] animate-pulse uppercase">
        Initializing Spatial Uplink...
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [activeNode, setActiveNode] = useState<IncidentData | null>(null);
  const { theme } = useTheme();

  // Because Leaflet canvas renders outside standard DOM hierarchy for SVG paths,
  // it struggles to read CSS variables directly. We derive the hex directly from theme.
  const accentColor = theme === 'police' ? '#0891b2' : '#9b2226';

  const handleSelectNode = (node: IncidentData) => {
    setActiveNode((prev) => (prev?.id === node.id ? null : node));
  };

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] md:h-screen overflow-hidden">
      {/* Absolute floating UI */}
      <IncidentFeed onSelectNode={handleSelectNode} activeId={activeNode?.id} />

      {/* Underlying Map */}
      <MapWidget
        activeNode={activeNode}
        onSelectNode={handleSelectNode}
        accentColor={accentColor}
      />

      {/* Decorative reticle overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-30">
        <div style={{ border: `1px solid ${accentColor}`, width: '40vh', height: '40vh', borderRadius: '50%' }} />
        <div className="absolute w-[80vh] h-px" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
        <div className="absolute h-[80vh] w-px" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
      </div>
    </div>
  );
}
