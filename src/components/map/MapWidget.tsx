'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useData, type IncidentData } from '@/context/DataContext';

// Custom controller to handle smooth panning when activeNode changes
function MapController({ activeNode }: { activeNode: IncidentData | null }) {
  const map = useMap();

  useEffect(() => {
    if (activeNode) {
      map.flyTo([activeNode.latitude, activeNode.longitude], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [activeNode, map]);

  return null;
}

interface MapWidgetProps {
  activeNode: IncidentData | null;
  onSelectNode: (node: IncidentData) => void;
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

        {incidents.map((node) => {
          const isActive = activeNode?.id === node.id;
          return (
            <CircleMarker
              key={node.id}
              center={[node.latitude, node.longitude]}
              radius={isActive ? 12 : 6}
              pathOptions={{
                color: accentColor,
                fillColor: accentColor,
                fillOpacity: isActive ? 0.8 : 0.4,
                weight: isActive ? 2 : 1,
              }}
              eventHandlers={{
                click: () => onSelectNode(node),
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
