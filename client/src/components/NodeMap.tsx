import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { Node } from '@/data/mockData';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
          <div key={node.id}>
            {/* The Animated Signal (Stays in place, just expands stroke) */}
            <CircleMarker 
              center={[node.lat, node.lng]}
              radius={1}
              className="node-beacon"
              pathOptions={{ 
                color: TYPE_COLORS[node.type], 
                fillColor: 'transparent',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0
              }}
              interactive={false}
            />
            {/* The Solid Core Node (Stable) */}
            <CircleMarker 
              center={[node.lat, node.lng]}
              radius={4}
              className="node-core-glow"
              pathOptions={{ 
                color: TYPE_COLORS[node.type], 
                fillColor: TYPE_COLORS[node.type], 
                fillOpacity: 1,
                weight: 1,
                opacity: 1
              }}
              eventHandlers={{
                click: () => setSelectedNode(node)
              }}
            >
              <Popup className="md:hidden">
                <div className="p-1 min-w-[120px] text-foreground">
                  <div className="font-bold">{node.type}</div>
                  <div className="text-xs opacity-80">{node.city}</div>
                </div>
              </Popup>
            </CircleMarker>
          </div>
        ))}
      </MapContainer>

      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className={`w-3 h-3 rounded-full ${selectedNode?.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
              {selectedNode?.type} Node Details
            </DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="grid gap-4 py-4 text-foreground">
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-sm font-medium opacity-70">Node ID:</span>
                <span className="text-sm font-mono">{selectedNode.id}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-sm font-medium opacity-70">Location:</span>
                <span className="text-sm">{selectedNode.city}, {selectedNode.country}</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-sm font-medium opacity-70">Status:</span>
                <span className={`text-sm font-bold ${selectedNode.status === 'Online' ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedNode.status}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-sm font-medium opacity-70">Uptime:</span>
                <span className="text-sm">{selectedNode.uptime}%</span>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-sm font-medium opacity-70">IP Address:</span>
                <span className="text-sm font-mono">{selectedNode.ip}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
