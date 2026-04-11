'use client';

import { useTheme } from '@/context/ThemeContext';
import { MOCK_NODES, type MapNode } from '@/lib/mockData';
import { Crosshair } from 'lucide-react';

interface IncidentFeedProps {
  onSelectNode: (node: MapNode) => void;
  activeId?: string | null;
}

export default function IncidentFeed({
  onSelectNode,
  activeId,
}: IncidentFeedProps) {
  const { theme } = useTheme();
  const isPolice = theme === 'police';

  return (
    <div
      className="absolute top-6 right-6 w-80 z-[1000] flex flex-col"
      style={{
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border-color)',
        maxHeight: 'calc(100vh - 48px)',
      }}
    >
      <div
        className="px-4 py-3 sticky top-0"
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        }}
      >
        <h2
          className="text-xs font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Crosshair size={14} style={{ color: 'var(--accent-primary)' }} />
          {isPolice ? 'Active Dispatches' : 'Node Uplinks'}
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {MOCK_NODES.map((node) => {
          const isActive = activeId === node.id;

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node)}
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
                  {node.id.toUpperCase()}
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
