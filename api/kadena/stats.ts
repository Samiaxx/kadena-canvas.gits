export const runtime = "nodejs";

const CHAIN_COUNT = 20;
const BASE = "https://api.chainweb-community.org";

type BlockHeader = {
  height: number;
  creationTime: number;
  txCount?: number;
};

async function fetchHeaders(chainId: number, limit = 2): Promise<BlockHeader[]> {
  const res = await fetch(
    `${BASE}/chainweb/0.0/mainnet01/chain/${chainId}/pact/api/v1/block/headers?limit=${limit}`,
    {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Chain ${chainId} failed`);
  }

  return res.json();
}

export default async function handler() {
  try {
    let totalTx = 0;
    let blockTimes: number[] = [];
    let heights: number[] = [];

    for (let chain = 0; chain < CHAIN_COUNT; chain++) {
      try {
        const blocks = await fetchHeaders(chain, 2);

        if (blocks.length >= 2) {
          blockTimes.push(
            blocks[0].creationTime - blocks[1].creationTime
          );
        }

        for (const b of blocks) {
          if (typeof b.txCount === "number") {
            totalTx += b.txCount;
          }
        }

        if (blocks[0]?.height) {
          heights.push(blocks[0].height);
        }
      } catch {
        // Skip unreachable chains
      }
    }

    if (!heights.length) {
      throw new Error("No chain data available");
    }

    return new Response(
      JSON.stringify({
        networkHeight: Math.max(...heights),
        activeChains: CHAIN_COUNT,
        tps: Number((totalTx / 30).toFixed(2)),
        avgBlockTime: Number(
          (blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length).toFixed(2)
        ),
        status: "LIVE",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  }
}
