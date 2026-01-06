export const config = {
  runtime: "edge"
};

const CHAIN_COUNT = 20;
const BASE =
  "https://api.chainweb-community.org/chainweb/0.0/mainnet01/chain";

type BlockHeader = {
  height: number;
  creationTime: number;
  txCount?: number;
};

async function fetchHeaders(chainId: number, limit: number) {
  const res = await fetch(
    `${BASE}/${chainId}/pact/api/v1/block/headers?limit=${limit}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch chain ${chainId}`);
  }

  return (await res.json()) as BlockHeader[];
}

export default async function handler() {
  try {
    const WINDOW_SECONDS = 30;

    let totalTx = 0;
    const blockTimes: number[] = [];
    const heights: number[] = [];

    await Promise.all(
      Array.from({ length: CHAIN_COUNT }, async (_, chain) => {
        const blocks = await fetchHeaders(chain, 10);

        if (blocks.length >= 2) {
          blockTimes.push(
            blocks[0].creationTime - blocks[1].creationTime
          );
        }

        blocks.forEach((b) => {
          if (b.txCount) totalTx += b.txCount;
        });

        if (blocks[0]?.height) {
          heights.push(blocks[0].height);
        }
      })
    );

    return new Response(
      JSON.stringify({
        tps: Number((totalTx / WINDOW_SECONDS).toFixed(2)),
        avgBlockTime: Number(
          (
            blockTimes.reduce((a, b) => a + b, 0) /
            blockTimes.length
          ).toFixed(2)
        ),
        networkHeight: Math.max(...heights),
        activeChains: CHAIN_COUNT,
        status: "LIVE"
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch Kadena network stats"
      }),
      { status: 500 }
    );
  }
}
