'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useData } from '@/context/DataContext';
import { type MapNode } from '@/lib/mockData';

// Custom controller to handle smooth panning when activeNode changes
function MapController({ activeNode }: { activeNode: MapNode | null }) {
  const map = useMap();

  useEffect(() => {
    if (activeNode) {
      map.flyTo([activeNode.lat, activeNode.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [activeNode, map]);

  return null;
}

interface MapWidgetProps {
  activeNode: MapNode | null;
  onSelectNode: (node: MapNode) => void;
  accentColor: string;
}

export default function MapWidget({
  activeNode,
  onSelectNode,
  accentColor,
}: MapWidgetProps) {
  const { incidents } = useData();
  
  // Las Vegas center
  const initialCenter: [number, number] = [36.1716, -115.1391];
  const policeHQ: [number, number] = [36.1699, -115.1420];

  // Derive the 3 most recent incidents for tactical dispatch lines
  const activeDispatches = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }, [incidents]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0">
      <MapContainer
        center={initialCenter}
        zoom={13}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController activeNode={activeNode} />

        {/* Tactical Dispatch Lines (HQ to Targets) */}
        {activeDispatches.map((dest) => (
          <Polyline
            key={`dispatch-${dest.id}`}
            positions={[policeHQ, [dest.lat, dest.lng]]}
            pathOptions={{
              color: accentColor,
              weight: 1.5,
              dashArray: '10, 10',
              opacity: 0.6,
              className: 'animate-pulse' // Adding pulsed effect via CSS if possible, or standard opacity shift
            }}
          />
        ))}

        {incidents.map((node) => {
          const isActive = activeNode?.id === node.id;
          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={isActive ? 12 : 6}
              pathOptions={{
                color: accentColor,
                fillColor: accentColor,
                fillOpacity: isActive ? 0.8 : 0.4,
                weight: isActive ? 2 : 1,
              }}
              eventHandlers={{
                click: () => onSelectNode(node as unknown as MapNode),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={isActive}>
                <span className="font-mono text-[9px] uppercase font-bold tracking-tighter">
                  {node.id}
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
