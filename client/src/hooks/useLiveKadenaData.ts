import { Node } from "@/data/mockData";
import { useEffect, useState } from "react";

const CHAIN_COUNT = 20;
const API_BASE = "https://api.chainweb-community.org";

interface CutResponse {
  hashes: Record<string, { height: number }>;
}

interface BlockHeader {
  creationTime: number;
}

export function useLiveKadenaData(mockNodes: Node[]) {
  const [nodes, setNodes] = useState<Node[]>(mockNodes || []);
  const [networkHeight, setNetworkHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    tps: null as number | null,
    tx24h: null as number | null,
    activeChains: CHAIN_COUNT,
    avgBlockTime: null as number | null,
    status: "LIVE" as "LIVE" | "OFFLINE"
  });

  const fetchKadenaData = async () => {
    try {
      // --- NETWORK HEIGHT ---
      const cutRes = await fetch(`${API_BASE}/chainweb/0.0/mainnet01/cut`);
      if (!cutRes.ok) throw new Error("Cut fetch failed");

      const cut: CutResponse = await cutRes.json();
      const heights = Object.values(cut.hashes).map(h => h.height);
      const maxHeight = Math.max(...heights);
      setNetworkHeight(maxHeight);

      // --- AVG BLOCK TIME (chain 0 sample) ---
      const blocksRes = await fetch(
        `${API_BASE}/chainweb/0.0/mainnet01/chain/0/pact/api/v1/block/headers?limit=2`
      );

      let avgBlockTime: number | null = null;

      if (blocksRes.ok) {
        const blocks: BlockHeader[] = await blocksRes.json();
        if (blocks.length === 2) {
          avgBlockTime = Math.abs(
            blocks[0].creationTime - blocks[1].creationTime
          );
        }
      }

      setStats({
        tps: null,            // not faked
        tx24h: null,          // not faked
        activeChains: CHAIN_COUNT,
        avgBlockTime,
        status: "LIVE"
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Kadena API unreachable:", err);
      setStats(prev => ({
        ...prev,
        status: "OFFLINE"
      }));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKadenaData();
    const interval = setInterval(fetchKadenaData, 15000);
    return () => clearInterval(interval);
  }, []);

  return {
    nodes,
    networkHeight,
    stats,
    isLoading
  };
}
