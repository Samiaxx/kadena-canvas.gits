export interface Node {
  id: string;
  lat: number;
  lng: number;
  type: 'RPC' | 'Full' | 'Miner';
  city: string;
  country: string;
  status: 'Online' | 'Offline' | 'Syncing';
  ip: string;
  uptime: number;
}

export interface NetworkStats {
  tps: number;
  transactions24h: number;
  avgBlockTime: number;
  activeNodes: number;
  hashrate: string;
}

const CITIES = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821 },
  { city: 'Sao Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
];

function generateNodes(count: number): Node[] {
  return Array.from({ length: count }).map((_, i) => {
    const location = CITIES[Math.floor(Math.random() * CITIES.length)];
    // Add some jitter to location so they don't stack perfectly
    const lat = location.lat + (Math.random() - 0.5) * 5;
    const lng = location.lng + (Math.random() - 0.5) * 5;
    
    const types: ('RPC' | 'Full' | 'Miner')[] = ['RPC', 'Full', 'Miner'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      lat,
      lng,
      type,
      city: location.city,
      country: location.country,
      status: Math.random() > 0.1 ? 'Online' : 'Offline',
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      uptime: Math.floor(Math.random() * 100),
    };
  });
}

export const MOCK_NODES = generateNodes(150);

export const MOCK_STATS: NetworkStats = {
  tps: 12540,
  transactions24h: 4529302,
  avgBlockTime: 1.5,
  activeNodes: 843,
  hashrate: '245 PH/s'
};
