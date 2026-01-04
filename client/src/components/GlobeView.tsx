import Globe, { GlobeMethods } from 'react-globe.gl';
import { Node } from '@/data/mockData';
import { useEffect, useRef, useState, useMemo } from 'react';

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
        pointsMerge={true}
        pointLabel={(d: any) => `
          <div style="background: ${theme === 'dark' ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.9)'}; 
               padding: 8px; border-radius: 4px; border: 1px solid rgba(128,128,128,0.2); 
               color: ${theme === 'dark' ? 'white' : 'black'}; font-family: sans-serif;">
            <div style="font-weight: bold; margin-bottom: 4px;">${d.type} Node</div>
            <div style="font-size: 12px;">${d.city}, ${d.country}</div>
          </div>
        `}
      />
    </div>
  );
}
