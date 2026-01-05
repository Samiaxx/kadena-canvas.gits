import { Node } from '@/data/mockData';
import { useEffect, useState } from 'react';

// Live node simulation for frontend-only mode
export function useLiveKadenaData(mockNodes: Node[]) {
  const [nodes, setNodes] = useState<Node[]>(mockNodes);

  useEffect(() => {
    // Simulate live updates for nodes
    const interval = setInterval(() => {
      setNodes(currentNodes => 
        currentNodes.map(node => {
          // 5% chance for a node to "flicker" or update status
          if (Math.random() > 0.95) {
            return {
              ...node,
              status: Math.random() > 0.05 ? 'Online' : 'Offline',
              uptime: Math.min(100, node.uptime + (Math.random() > 0.5 ? 0.1 : -0.1))
            };
          }
          return node;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return nodes;
}
