import Globe, { GlobeMethods } from 'react-globe.gl';
import { Node } from '@/data/mockData';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GlobeViewProps {
  nodes: Node[];
  theme?: 'dark' | 'light';
}

const TYPE_COLORS = {
  RPC: '#ed0976',
  Full: '#00e1e1',
  Miner: '#fbbf24',
};

export function GlobeView({ nodes, theme = 'dark' }: GlobeViewProps) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const globeData = useMemo(() => nodes.map(node => ({
    size: 0.5,
    color: TYPE_COLORS[node.type],
    ...node
  })), [nodes]);

  return (
    <div ref={containerRef} className="w-full h-[600px] rounded-xl overflow-hidden relative bg-transparent">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={theme === 'dark' 
          ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
          : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        }
        pointsData={globeData}
        pointAltitude={0.05}
        pointColor="color"
        pointRadius={0.5}
        pointsMerge={false}
        onPointClick={(point: any) => {
          setSelectedNode(point);
        }}
        ringColor={(d: any) => d.color}
        ringMaxRadius={2.5}
        ringPropagationSpeed={1}
        ringRepeatPeriod={1500}
        ringsData={globeData}
        pointLabel={(d: any) => `
          <div style="background: ${theme === 'dark' ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.9)'}; 
               padding: 8px; border-radius: 4px; border: 1px solid rgba(128,128,128,0.2); 
               color: ${theme === 'dark' ? 'white' : 'black'}; font-family: sans-serif; pointer-events: none;">
            <div style="font-weight: bold; margin-bottom: 2px;">${d.type} Node</div>
            <div style="font-size: 11px; opacity: 0.8;">Click for details</div>
          </div>
        `}
      />

      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${selectedNode?.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
              {selectedNode?.type} Node Details
            </DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="grid gap-4 py-4">
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
