const CHAIN_COUNT = 20;
const BASE =
  "https://us-e1.chainweb.com/chainweb/0.0/mainnet01/chain";

type BlockHeader = {
  height: number;
  creationTime: number;
};

async function fetchHeaders(chainId: number, limit: number) {
  const res = await fetch(
    `${BASE}/${chainId}/pact/api/v1/block/headers?limit=${limit}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Chain ${chainId} failed`);
  }

  return (await res.json()) as BlockHeader[];
}

export default async function handler(_req: Request) {
  try {
    const WINDOW_SECONDS = 30;

    let totalBlocks = 0;
    const blockTimes: number[] = [];
    const heights: number[] = [];

    for (let chain = 0; chain < CHAIN_COUNT; chain++) {
      try {
        const blocks = await fetchHeaders(chain, 5);

        if (blocks.length >= 2) {
          blockTimes.push(
            blocks[0].creationTime - blocks[1].creationTime
          );
        }

        totalBlocks += blocks.length;
        heights.push(blocks[0].height);
      } catch {
        continue;
      }
    }

    if (blockTimes.length === 0) {
      return new Response(
        JSON.stringify({ error: "No chain data available" }),
        { status: 503 }
      );
    }

    const EST_TX_PER_BLOCK = 10;
    const tps =
      (totalBlocks * EST_TX_PER_BLOCK) / WINDOW_SECONDS;

    return new Response(
      JSON.stringify({
        tps: Number(tps.toFixed(2)),
        avgBlockTime: Number(
          (
            blockTimes.reduce((a, b) => a + b, 0) /
            blockTimes.length
          ).toFixed(2)
        ),
        networkHeight: Math.max(...heights),
        activeChains: blockTimes.length,
        status: "LIVE"
      }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to fetch Kadena stats" }),
      { status: 500 }
    );
  }
}
