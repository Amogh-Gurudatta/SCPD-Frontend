'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { type MapNode } from '@/lib/mockData';
import { Crosshair, ChevronDown, ChevronUp } from 'lucide-react';

interface IncidentFeedProps {
  onSelectNode: (node: MapNode) => void;
  activeId?: string | null;
}

export default function IncidentFeed({
  onSelectNode,
  activeId,
}: IncidentFeedProps) {
  const { theme } = useTheme();
  const { incidents } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const isPolice = theme === 'police';

  return (
    <div
      className={`absolute top-4 md:top-6 right-4 md:right-6 w-[calc(100%-2rem)] md:w-80 z-1000 flex flex-col transition-all duration-300 ${isExpanded ? 'max-h-[80vh]' : 'max-h-[48px] md:max-h-[calc(100vh-48px)]'}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div
        className={`px-4 py-3 sticky top-0 flex justify-between items-center cursor-pointer md:cursor-default ${isExpanded ? 'border-b border-(--border-color)' : 'md:border-b md:border-(--border-color)'}`}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        }}
        onClick={() => {
          if (window && window.innerWidth < 768) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <h2
          className="text-xs font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Crosshair size={14} style={{ color: 'var(--accent-primary)' }} />
          {isPolice ? 'Active Dispatches' : 'Node Uplinks'}
        </h2>

        {/* Mobile Toggle Icon */}
        <div className="md:hidden">
          {isExpanded ? (
            <ChevronUp size={16} style={{ color: 'var(--text-primary)' }} />
          ) : (
            <ChevronDown size={16} style={{ color: 'var(--text-primary)' }} />
          )}
        </div>
      </div>

      <div className={`overflow-y-auto flex-1 p-2 space-y-2 md:block ${isExpanded ? 'block' : 'hidden'}`}>
        {incidents.map((node) => {
          const isActive = activeId === node.id;

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node as unknown as MapNode)}
              className="w-full text-left p-3 cursor-pointer transition-all duration-200"
              style={{
                border: isActive
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                backgroundColor: isActive
                  ? 'color-mix(in srgb, var(--accent-primary) 8%, transparent)'
                  : 'transparent',
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className="text-[10px] font-mono tracking-widest font-bold"
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  {String(node.id).toUpperCase()}
                </span>
                <span
                  className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5"
                  style={{
                    backgroundColor:
                      node.status === 'CRITICAL'
                        ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)'
                        : 'transparent',
                    color: node.status === 'CRITICAL' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    border: node.status === 'CRITICAL' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  }}
                >
                  {node.status}
                </span>
              </div>
              <p
                className="text-xs font-mono uppercase tracking-wide leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {isPolice ? node.policeTitle : node.mafiaTitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
