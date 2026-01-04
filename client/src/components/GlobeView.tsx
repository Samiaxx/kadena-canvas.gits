import Globe, { GlobeMethods } from 'react-globe.gl';
import { Node } from '@/data/mockData';
import { useEffect, useRef, useState, useMemo } from 'react';

interface GlobeViewProps {
  nodes: Node[];
}

const TYPE_COLORS = {
  RPC: '#ed0976',
  Full: '#00e1e1',
  Miner: '#fbbf24',
};

export function GlobeView({ nodes }: GlobeViewProps) {
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
    // Auto-rotate
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
    <div ref={containerRef} className="w-full h-[600px] rounded-xl overflow-hidden border border-border/50 relative bg-[#080808]">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={globeData}
        pointAltitude={0.05}
        pointColor="color"
        pointRadius={0.5}
        pointsMerge={true}
        pointLabel={(d: any) => `
          <div style="background: rgba(10,10,10,0.9); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); color: white; font-family: sans-serif;">
            <div style="font-weight: bold; margin-bottom: 4px;">${d.type} Node</div>
            <div style="font-size: 12px; color: #aaa;">${d.city}, ${d.country}</div>
            <div style="font-size: 12px; color: #aaa;">Status: ${d.status}</div>
          </div>
        `}
      />
    </div>
  );
}
