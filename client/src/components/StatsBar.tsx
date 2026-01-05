import { useState, useEffect } from "react";
import { NetworkStats, MOCK_STATS } from "@/data/mockData";
import { Hash, Zap, Activity, Clock, Server, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function StatsBar() {
  const [networkHeight, setNetworkHeight] = useState<number | null>(null);
  const [latestBlock, setLatestBlock] = useState<{ height: number; hash: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchKadenaData = async () => {
    try {
      // 1. Fetch Cut (Network Height)
      const cutRes = await fetch("https://api.chainweb.com/chainweb/0.0/mainnet01/cut");
      if (cutRes.ok) {
        const cutData = await cutRes.json();
        setNetworkHeight(cutData.height);
      }

      // 2. Fetch Latest Block from Chain 0 (Example chain)
      const blockRes = await fetch("https://api.chainweb.com/chainweb/0.0/mainnet01/chain/0/block?limit=1");
      if (blockRes.ok) {
        const blockData = await blockRes.json();
        // The block endpoint usually returns an items array or a block object
        const block = blockData?.items?.[0] || blockData?.[0] || blockData;
        if (block) {
          setLatestBlock({
            height: block.header?.height || block.height,
            hash: (block.header?.hash || block.hash || "").substring(0, 12) + "..."
          });
        }
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch Kadena data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKadenaData();
    const interval = setInterval(fetchKadenaData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard 
          label="Network Height" 
          value={networkHeight ? networkHeight.toLocaleString() : "..."} 
          icon={<Hash className="w-4 h-4 text-purple-400" />}
          isLoading={isLoading}
          subtext={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
        />
        <StatCard 
          label="Latest Block (Ch0)" 
          value={latestBlock ? latestBlock.height.toLocaleString() : "..."} 
          icon={<Layers className="w-4 h-4 text-pink-400" />}
          isLoading={isLoading}
          subtext={latestBlock?.hash || "Fetching hash..."}
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
    </div>
  );
}

function StatCard({ label, value, icon, trend, isLoading, subtext }: { 
  label: string, 
  value: string, 
  icon: React.ReactNode, 
  trend?: string, 
  isLoading?: boolean,
  subtext?: string
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 rounded-lg flex flex-col relative overflow-hidden group"
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
            <span className="text-xl font-display font-bold text-foreground">{value}</span>
          )}
          {trend && <span className="text-[10px] text-green-500 font-mono">{trend}</span>}
        </div>
        {subtext && <span className="text-[9px] text-muted-foreground font-mono truncate">{subtext}</span>}
      </div>
    </motion.div>
  );
}
