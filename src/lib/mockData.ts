export interface MapNode {
  id: string;
  latitude: number;
  longitude: number;
  policeTitle: string;
  mafiaTitle: string;
  status: 'CRITICAL' | 'ACTIVE' | 'STANDBY';
}

export const MOCK_NODES: MapNode[] = [
  {
    id: 'node-01',
    latitude: 36.1699,
    longitude: -115.1398,
    policeTitle: '10-30: Robbery in Progress',
    mafiaTitle: 'Asset Extraction (Fremont)',
    status: 'CRITICAL',
  },
  {
    id: 'node-02',
    latitude: 36.1553,
    longitude: -115.1523,
    policeTitle: 'Surveillance Target Alpha',
    mafiaTitle: 'Uplink Established (Strip)',
    status: 'ACTIVE',
  },
  {
    id: 'node-03',
    latitude: 36.1822,
    longitude: -115.1764,
    policeTitle: 'Unregistered Aerial Activity',
    mafiaTitle: 'Drone Route Kilo',
    status: 'ACTIVE',
  },
  {
    id: 'node-04',
    latitude: 36.1425,
    longitude: -115.1364,
    policeTitle: 'Perimeter Breach',
    mafiaTitle: 'Data Drop (Nexus)',
    status: 'STANDBY',
  },
];
