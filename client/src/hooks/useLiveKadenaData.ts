import { useEffect, useState } from "react";

const CHAIN_COUNT = 20;
const API_BASE = "https://api.chainweb-community.org";

interface CutResponse {
  hashes: Record<string, { height: number }>;
}

interface BlockHeader {
  creationTime: number;
}

export function useLiveKadenaData() {
  const [networkHeight, setNetworkHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    activeChains: CHAIN_COUNT,
    avgBlockTime: null as number | null,
    status: "LIVE" as "LIVE" | "OFFLINE"
  });

  const fetchKadenaData = async () => {
    try {
      // Network height (authoritative)
      const cutRes = await fetch(`${API_BASE}/chainweb/0.0/mainnet01/cut`);
      if (!cutRes.ok) throw new Error("Cut fetch failed");

      const cut: CutResponse = await cutRes.json();
      const heights = Object.values(cut.hashes).map(h => h.height);
      setNetworkHeight(Math.max(...heights));

      // Avg block time (chain 0 sample)
      const blockRes = await fetch(
        `${API_BASE}/chainweb/0.0/mainnet01/chain/0/pact/api/v1/block/headers?limit=2`
      );

      let avgBlockTime: number | null = null;

      if (blockRes.ok) {
        const blocks: BlockHeader[] = await blockRes.json();
        if (blocks.length === 2) {
          avgBlockTime = Math.abs(
            blocks[0].creationTime - blocks[1].creationTime
          );
        }
      }

      setStats({
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
    networkHeight,
    stats,
    isLoading
  };
}
