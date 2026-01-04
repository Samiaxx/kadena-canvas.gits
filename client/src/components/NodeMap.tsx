import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { Node } from '@/data/mockData';
import { useEffect, useState } from 'react';

interface NodeMapProps {
  nodes: Node[];
  theme?: 'dark' | 'light';
}

const TYPE_COLORS = {
  RPC: '#ed0976',
  Full: '#00e1e1',
  Miner: '#fbbf24',
};

export function NodeMap({ nodes, theme = 'dark' }: NodeMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-card/50 animate-pulse rounded-lg" />;

  const tileUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer url={tileUrl} />

        {nodes.map((node) => (
          <CircleMarker 
            key={node.id}
            center={[node.lat, node.lng]}
            radius={4}
            pathOptions={{ 
              color: TYPE_COLORS[node.type], 
              fillColor: TYPE_COLORS[node.type], 
              fillOpacity: 0.6,
              weight: 0,
            }}
          >
            <Popup>
              <div className="p-1 min-w-[160px] text-foreground">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm">{node.type} Node</span>
                  <div className={`w-2 h-2 rounded-full ${node.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="space-y-1 text-xs opacity-80">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{node.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono">{node.id}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
