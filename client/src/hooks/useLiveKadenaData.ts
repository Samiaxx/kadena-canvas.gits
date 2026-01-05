import { Node } from '@/data/mockData';
import { useEffect, useState } from 'react';

export interface ChainwebCut {
  instance: string;
  hashes: Record<string, { height: number; hash: string }>;
  origin: null;
  weight: string;
  height: number;
}

export function useLiveKadenaData(mockNodes: Node[]) {
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [cut, setCut] = useState<ChainwebCut | null>(null);
  const [latestBlock, setLatestBlock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKadenaData = async () => {
      try {
        // 1. Fetch Cut (Network Height)
        const cutRes = await fetch('https://api.chainweb.com/chainweb/0.0/mainnet01/cut');
        if (cutRes.ok) {
          const cutData = await cutRes.json();
          setCut(cutData);
        }

        // 2. Fetch Latest Block from Chain 0
        const blockRes = await fetch('https://api.chainweb.com/chainweb/0.0/mainnet01/chain/0/block?limit=1');
        if (blockRes.ok) {
          const blockData = await blockRes.json();
          // The endpoint returns an array or object depending on headers, 
          // usually a payload with 'items' or similar in production APIs.
          setLatestBlock(blockData?.items?.[0] || blockData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Kadena data:', error);
        setIsLoading(false);
      }
    };

    fetchKadenaData();
    const interval = setInterval(fetchKadenaData, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate node flickering but based on real timing intervals
    const nodeInterval = setInterval(() => {
      setNodes(currentNodes => 
        currentNodes.map(node => {
          if (Math.random() > 0.98) {
            return {
              ...node,
              status: Math.random() > 0.02 ? 'Online' : 'Offline',
              uptime: Math.min(100, node.uptime + (Math.random() > 0.5 ? 0.01 : -0.01))
            };
          }
          return node;
        })
      );
    }, 10000);

    return () => clearInterval(nodeInterval);
  }, []);

  return { nodes, cut, latestBlock, isLoading };
}
