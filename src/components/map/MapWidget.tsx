'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_NODES, type MapNode } from '@/lib/mockData';

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
  accentColor: string; // Passed from parent since we can't easily read CSS vars in Leaflet canvas
}

export default function MapWidget({
  activeNode,
  onSelectNode,
  accentColor,
}: MapWidgetProps) {
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

        {MOCK_NODES.map((node) => {
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
                click: () => onSelectNode(node),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
