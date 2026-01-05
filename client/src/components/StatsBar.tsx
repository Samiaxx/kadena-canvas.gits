import { useState, useEffect } from "react";
import { Hash, Zap, Activity, Clock, Server, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useLiveKadenaData } from "@/hooks/useLiveKadenaData";
import { MOCK_NODES } from "@/data/mockData";

export function StatsBar() {
  const { networkHeight, latestBlockHeight, isLoading } = useLiveKadenaData(MOCK_NODES);
  
  // Real-time calculated metrics or derived from live data
  // For the others without direct API endpoints yet, we use small drifts to feel "live"
  const [liveStats, setLiveStats] = useState({
    tps: 12540,
    tx24h: 4529302,
    blockTime: 1.5,
    nodes: 843
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        tps: prev.tps + Math.floor((Math.random() - 0.5) * 50),
        tx24h: prev.tx24h + Math.floor(Math.random() * 10),
        nodes: prev.nodes + (Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard 
          label="Network Height" 
          value={networkHeight ? networkHeight.toLocaleString() : "..."} 
          icon={<Hash className="w-4 h-4 text-purple-400" />}
          isLoading={isLoading && !networkHeight}
        />
        <StatCard 
          label="Latest Block (Ch0)" 
          value={latestBlockHeight ? latestBlockHeight.toLocaleString() : "..."} 
          icon={<Layers className="w-4 h-4 text-pink-400" />}
          isLoading={isLoading && !latestBlockHeight}
        />
        <StatCard 
          label="Current TPS" 
          value={liveStats.tps.toLocaleString()} 
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          trend="+2.4%"
        />
        <StatCard 
          label="24h Transactions" 
          value={liveStats.tx24h.toLocaleString()} 
          icon={<Activity className="w-4 h-4 text-blue-400" />}
        />
        <StatCard 
          label="Avg Block Time" 
          value={`${liveStats.blockTime}s`} 
          icon={<Clock className="w-4 h-4 text-green-400" />}
        />
        <StatCard 
          label="Active Nodes" 
          value={liveStats.nodes.toLocaleString()} 
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
      className="glass-panel p-4 rounded-lg flex flex-col relative overflow-hidden group border border-border/50"
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
