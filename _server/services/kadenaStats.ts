const CHAIN_COUNT = 20;
const BASE =
  "https://api.chainweb.com/chainweb/0.0/mainnet01/chain";

type BlockHeader = {
  height: number;
  creationTime: number;
  txCount?: number;
};

/**
 * Fetch block headers with timeout + safe failure
 */
async function fetchHeaders(chainId: number, limit: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `${BASE}/${chainId}/pact/api/v1/block/headers?limit=${limit}`,
      { signal: controller.signal }
    );

    if (!res.ok) return null;
    return (await res.json()) as BlockHeader[];
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get Kadena network stats
 * Allows partial success across chains
 */
export async function getKadenaNetworkStats() {
  const WINDOW_SECONDS = 30;

  let totalTx = 0;
  let successfulChains = 0;

  const blockTimes: number[] = [];
  const heights: number[] = [];

  for (let chain = 0; chain < CHAIN_COUNT; chain++) {
    const blocks = await fetchHeaders(chain, 5);

    if (!blocks || blocks.length < 2) continue;

    successfulChains++;

    // Block time
    blockTimes.push(
      blocks[0].creationTime - blocks[1].creationTime
    );

    // Transactions
    blocks.forEach((b) => {
      if (typeof b.txCount === "number") {
        totalTx += b.txCount;
      }
    });

    // Height
    if (typeof blocks[0].height === "number") {
      heights.push(blocks[0].height);
    }
  }

  // No data at all
  if (successfulChains === 0) {
    return {
      tps: null,
      avgBlockTime: null,
      networkHeight: null,
      activeChains: 0,
      status: "OFFLINE",
    };
  }

  return {
    tps: Number((totalTx / WINDOW_SECONDS).toFixed(2)),
    avgBlockTime: Number(
      (
        blockTimes.reduce((a, b) => a + b, 0) /
        blockTimes.length
      ).toFixed(2)
    ),
    networkHeight: Math.max(...heights),
    activeChains: successfulChains,
    status: successfulChains === CHAIN_COUNT ? "LIVE" : "PARTIAL",
  };
}
