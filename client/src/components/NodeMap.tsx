import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { Node } from '@/data/mockData';
import { useEffect, useState } from 'react';

// Fix for Leaflet default icon issues if needed, but we use CircleMarker
// import 'leaflet/dist/leaflet.css'; 

interface NodeMapProps {
  nodes: Node[];
}

const TYPE_COLORS = {
  RPC: '#ed0976', // Primary Pink
  Full: '#00e1e1', // Cyan
  Miner: '#fbbf24', // Amber
};

export function NodeMap({ nodes }: NodeMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-card/50 animate-pulse rounded-lg" />;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border/50 relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#080808' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        {/* Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains='abcd'
          maxZoom={20}
        />

        {nodes.map((node) => (
          <CircleMarker 
            key={node.id}
            center={[node.lat, node.lng]}
            radius={4}
            pathOptions={{ 
              color: TYPE_COLORS[node.type], 
              fillColor: TYPE_COLORS[node.type], 
              fillOpacity: 0.6,
              weight: 0, // No border for cleaner look
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[160px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm text-foreground">{node.type} Node</span>
                  <div className={`w-2 h-2 rounded-full ${node.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="text-foreground">{node.city}, {node.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono text-foreground">{node.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="text-foreground">{node.uptime}%</span>
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
