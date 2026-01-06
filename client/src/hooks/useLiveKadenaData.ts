import { Node } from "@/data/mockData";
import { useEffect, useState } from "react";

interface ChainwebCut {
  hashes: Record<string, { height: number; hash: string }>;
}

const CHAIN_COUNT = 20;
const BASE = "https://api.chainweb-community.org";

export function useLiveKadenaData(initialNodes: Node[]) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes || []);
  const [networkHeight, setNetworkHeight] = useState<number | null>(null);
  const [latestBlockHeight, setLatestBlockHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    tps: null as number | null,
    tx24h: null as number | null,
    activeNodes: CHAIN_COUNT,
    avgBlockTime: null as number | null,
    hashrate: null as string | null,
    status: "STALE" as "LIVE" | "STALE",
  });

  async function fetchKadenaData() {
    try {
      // 1️⃣ Fetch CUT (authoritative network state)
      const cutRes = await fetch(`${BASE}/chainweb/0.0/mainnet01/cut`);
      if (!cutRes.ok) throw new Error("CUT fetch failed");

      const cut: ChainwebCut = await cutRes.json();
      const heights = Object.values(cut.hashes).map(h => h.height);
      const maxHeight = Math.max(...heights);

      setNetworkHeight(maxHeight);
      setLatestBlockHeight(maxHeight);

      // 2️⃣ Fetch recent headers to estimate block time
      const headerTimes: number[] = [];

      for (let chain = 0; chain < CHAIN_COUNT; chain++) {
        const res = await fetch(
          `${BASE}/chainweb/0.0/mainnet01/chain/${chain}/pact/api/v1/block/headers?limit=2`
        );
        if (!res.ok) continue;

        const blocks = await res.json();
        if (blocks.length >= 2) {
          headerTimes.push(
            blocks[0].creationTime - blocks[1].creationTime
          );
        }
      }

      const avgBlockTime =
        headerTimes.length > 0
          ? Number(
              (
                headerTimes.reduce((a, b) => a + b, 0) /
                headerTimes.length
              ).toFixed(2)
            )
          : null;

      setStats({
        tps: null,           // ⚠️ needs mempool or tx aggregation service
        tx24h: null,         // ⚠️ same reason
        activeNodes: CHAIN_COUNT,
        avgBlockTime,
        hashrate: null,      // ⚠️ not exposed via Chainweb API
        status: "LIVE",
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Kadena LIVE fetch failed:", err);

      setStats(prev => ({
        ...prev,
        status: "STALE",
      }));

      setIsLoading(false);
    }
  }

  // 🔁 Main polling loop
  useEffect(() => {
    fetchKadenaData();
    const interval = setInterval(fetchKadenaData, 15_000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Node animation (visual only – safe to keep)
  useEffect(() => {
    if (!nodes.length) return;

    const nodeInterval = setInterval(() => {
      setNodes(current =>
        current.map(node =>
          Math.random() > 0.98
            ? {
                ...node,
                status: Math.random() > 0.02 ? "Online" : "Offline",
                uptime: Math.min(
                  100,
                  Math.max(0, node.uptime + (Math.random() > 0.5 ? 0.01 : -0.01))
                ),
              }
            : node
        )
      );
    }, 5000);

    return () => clearInterval(nodeInterval);
  }, [nodes.length]);

  return {
    nodes,
    networkHeight,
    latestBlockHeight,
    stats,
    isLoading,
  };
}
