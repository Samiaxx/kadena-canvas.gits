import { Node } from "@/data/mockData";
import { useEffect, useRef, useState } from "react";

interface ChainwebCut {
  hashes: Record<string, { height: number; hash: string }>;
}

const CHAINWEB_API = "https://api.chainweb-community.org";

export function useLiveKadenaData(initialNodes: Node[]) {
  /** -----------------------------
   * REAL NETWORK DATA
   * ----------------------------- */
  const [networkHeight, setNetworkHeight] = useState<number | null>(null);
  const [latestBlockHeight, setLatestBlockHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    tps: null as number | null,
    tx24h: null as number | null,
    activeChains: 20,
    avgBlockTime: null as number | null,
  });

  /** -----------------------------
   * NODE DATA (STATIC, REAL)
   * ----------------------------- */
  const [nodes, setNodes] = useState<Node[]>(initialNodes);

  /** -----------------------------
   * ANIMATION TICK (KEY FIX)
   * ----------------------------- */
  const [pulseTick, setPulseTick] = useState(0);
  const lastFetchRef = useRef<number>(0);

  /** -----------------------------
   * FETCH LIVE CHAINWEB DATA
   * ----------------------------- */
  const fetchNetworkData = async () => {
    try {
      const cutRes = await fetch(`${CHAINWEB_API}/chainweb/0.0/mainnet01/cut`);
      if (!cutRes.ok) throw new Error("Cut fetch failed");

      const cut: ChainwebCut = await cutRes.json();
      const heights = Object.values(cut.hashes).map((h) => h.height);
      const maxHeight = Math.max(...heights);

      setNetworkHeight(maxHeight);
      setLatestBlockHeight(maxHeight);
      lastFetchRef.current = Date.now();

      setIsLoading(false);
    } catch (err) {
      console.error("Chainweb fetch error:", err);
      setIsLoading(false);
    }
  };

  /** -----------------------------
   * INITIAL + POLLING
   * ----------------------------- */
  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 15_000);
    return () => clearInterval(interval);
  }, []);

  /** -----------------------------
   * PURE VISUAL NODE ANIMATION
   * (NO FAKE DATA)
   * ----------------------------- */
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseTick((t) => t + 1);
    }, 1200);

    return () => clearInterval(pulseInterval);
  }, []);

  /** -----------------------------
   * DERIVED STATUS (HONEST)
   * ----------------------------- */
  const isLive =
    lastFetchRef.current !== 0 &&
    Date.now() - lastFetchRef.current < 60_000;

  return {
    nodes,
    networkHeight,
    latestBlockHeight,
    stats,
    isLive,
    pulseTick, // 👈 THIS DRIVES ANIMATION
    isLoading,
  };
}
