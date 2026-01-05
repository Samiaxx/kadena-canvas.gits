import { useState, useEffect } from "react";
import { MOCK_STATS } from "@/data/mockData";
import { Hash, Zap, Activity, Clock, Server, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function StatsBar() {
  const [networkHeight, setNetworkHeight] = useState<number | null>(null);
  const [latestBlock, setLatestBlock] = useState<{ height: number; hash: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchKadenaData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching live Chainweb data from: https://api.chainweb.com/chainweb/0.0/mainnet01/cut");
      
      const cutRes = await fetch("https://api.chainweb.com/chainweb/0.0/mainnet01/cut", {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (!cutRes.ok) {
        throw new Error(`HTTP error! status: ${cutRes.status}`);
      }

      const data = await cutRes.json();
      console.log("Live Chainweb /cut response:", data);

      if (data && data.hashes) {
        // Correctly compute max height across all chains
        const heights = Object.values(data.hashes).map((c: any) => c.height);
        const maxHeight = Math.max(...heights);
        setNetworkHeight(maxHeight);
      } else {
        throw new Error("Invalid data structure received from /cut");
      }

      // Fetch Latest Block from Chain 0 for more detail
      const blockRes = await fetch("https://api.chainweb.com/chainweb/0.0/mainnet01/chain/0/block?limit=1", {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      
      if (blockRes.ok) {
        const blockData = await blockRes.json();
        console.log("Live Chainweb /block response:", blockData);
        // Extract block from response structure
        const block = blockData?.items?.[0] || blockData?.[0] || blockData;
        if (block) {
          const header = block.header || block;
          setLatestBlock({
            height: header.height,
            hash: (header.hash || "").substring(0, 12) + "..."
          });
        }
      }
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Chainweb API Error:", err);
      setError(err.message || "Failed to connect to Kadena network");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKadenaData();
    const interval = setInterval(fetchKadenaData, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard 
          label="Network Height" 
          value={networkHeight !== null ? networkHeight.toLocaleString() : (error ? "Error" : "...")} 
          icon={<Hash className="w-4 h-4 text-purple-400" />}
          isLoading={isLoading && networkHeight === null}
          subtext={error ? "Connection Failed" : (networkHeight ? `Live: ${lastUpdated.toLocaleTimeString()}` : "Syncing...")}
          error={!!error}
        />
        <StatCard 
          label="Latest Block (Ch0)" 
          value={latestBlock ? latestBlock.height.toLocaleString() : (error ? "Error" : "...")} 
          icon={<Layers className="w-4 h-4 text-pink-400" />}
          isLoading={isLoading && !latestBlock}
          subtext={latestBlock?.hash || "mainnet01/chain/0"}
          error={!!error}
        />
        <StatCard 
          label="Current TPS" 
          value={MOCK_STATS.tps.toLocaleString()} 
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          trend="+2.4%"
        />
        <StatCard 
          label="24h Transactions" 
          value={MOCK_STATS.transactions24h.toLocaleString()} 
          icon={<Activity className="w-4 h-4 text-blue-400" />}
        />
        <StatCard 
          label="Avg Block Time" 
          value={`${MOCK_STATS.avgBlockTime}s`} 
          icon={<Clock className="w-4 h-4 text-green-400" />}
        />
        <StatCard 
          label="Active Nodes" 
          value={MOCK_STATS.activeNodes.toLocaleString()} 
          icon={<Server className="w-4 h-4 text-primary" />}
        />
      </div>
      {error && (
        <div className="text-[10px] text-destructive font-mono mt-1 px-4">
          CORS/Network Error: {error}. Check browser console for full Chainweb response logs.
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, trend, isLoading, subtext, error }: { 
  label: string, 
  value: string, 
  icon: React.ReactNode, 
  trend?: string, 
  isLoading?: boolean,
  subtext?: string,
  error?: boolean
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel p-4 rounded-lg flex flex-col relative overflow-hidden group border transition-all ${error ? 'border-destructive/50 bg-destructive/5' : 'border-border/50 hover:border-primary/50'}`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</span>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <span className={`text-xl font-display font-bold ${error ? 'text-destructive' : 'text-foreground'}`}>{value}</span>
          )}
          {trend && <span className="text-[10px] text-green-500 font-mono">{trend}</span>}
        </div>
        {subtext && <span className={`text-[9px] font-mono truncate ${error ? 'text-destructive/80' : 'text-muted-foreground'}`}>{subtext}</span>}
      </div>
    </motion.div>
  );
}
