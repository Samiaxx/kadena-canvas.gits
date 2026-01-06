import type { VercelRequest, VercelResponse } from "@vercel/node";

const CHAIN_COUNT = 20;
const BASE =
  "https://api.chainweb.com/chainweb/0.0/mainnet01/chain";

type BlockHeader = {
  height: number;
  creationTime: number;
  txCount?: number;
};

async function fetchHeaders(chainId: number, limit: number) {
  const res = await fetch(
    `${BASE}/${chainId}/pact/api/v1/block/headers?limit=${limit}`,
    { signal: AbortSignal.timeout(8000) }
  );

  if (!res.ok) throw new Error("fetch failed");
  return (await res.json()) as BlockHeader[];
}

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  let totalTx = 0;
  const blockTimes: number[] = [];
  const heights: number[] = [];

  for (let chain = 0; chain < CHAIN_COUNT; chain++) {
    try {
      const blocks = await fetchHeaders(chain, 10);

      if (blocks.length >= 2) {
        blockTimes.push(
          blocks[0].creationTime - blocks[1].creationTime
        );
      }

      blocks.forEach((b) => {
        if (b.txCount) totalTx += b.txCount;
      });

      if (blocks[0]?.height) heights.push(blocks[0].height);
    } catch {
      // skip dead chain
    }
  }

  if (!heights.length) {
    return res.status(200).json({
      status: "OFFLINE",
      activeChains: 0,
      tps: 0,
      avgBlockTime: 0,
      networkHeight: 0
    });
  }

  res.status(200).json({
    status: "LIVE",
    activeChains: heights.length,
    tps: Number((totalTx / 30).toFixed(2)),
    avgBlockTime: Number(
      (
        blockTimes.reduce((a, b) => a + b, 0) /
        blockTimes.length
      ).toFixed(2)
    ),
    networkHeight: Math.max(...heights)
  });
}
