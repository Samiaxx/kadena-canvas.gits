export const runtime = "nodejs";

const CHAIN_COUNT = 20;
const BASES = [
  "https://api.chainweb.com",
  "https://nodes.kadena.ws"
];

async function fetchWithFallback(url: string) {
  for (const base of BASES) {
    try {
      const res = await fetch(url.replace("{BASE}", base), {
        headers: { "accept": "application/json" },
        cache: "no-store"
      });
      if (res.ok) return res.json();
    } catch (_) {}
  }
  throw new Error("All RPC endpoints failed");
}

export default async function handler(_: Request) {
  try {
    let totalTx = 0;
    let blockTimes: number[] = [];
    let heights: number[] = [];

    for (let chain = 0; chain < CHAIN_COUNT; chain++) {
      const blocks = await fetchWithFallback(
        "{BASE}/chainweb/0.0/mainnet01/chain/" +
          chain +
          "/pact/api/v1/block/headers?limit=2"
      );

      if (blocks.length >= 2) {
        blockTimes.push(
          blocks[0].creationTime - blocks[1].creationTime
        );
      }

      for (const b of blocks) {
        if (b.txCount) totalTx += b.txCount;
      }

      if (blocks[0]?.height) heights.push(blocks[0].height);
    }

    return new Response(
      JSON.stringify({
        tps: Number((totalTx / 30).toFixed(2)),
        avgBlockTime: Number(
          (blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length).toFixed(2)
        ),
        networkHeight: Math.max(...heights),
        activeChains: CHAIN_COUNT,
        status: "LIVE"
      }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  }
}
