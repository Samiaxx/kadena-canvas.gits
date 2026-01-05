import { motion } from "framer-motion";
import { Activity, Server, Zap, Clock, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { NetworkStats, MOCK_STATS } from "@/data/mockData";
import { useLiveKadenaData } from "@/hooks/useLiveKadenaData";

export function StatsBar() {
  const { cut, latestBlock, isLoading } = useLiveKadenaData([]);
  const [stats, setStats] = useState<NetworkStats>(MOCK_STATS);

  useEffect(() => {
    if (cut) {
      setStats(prev => ({
        ...prev,
        activeNodes: 843 + (Math.floor(Math.random() * 10)), // Base + drift
      }));
    }
  }, [cut]);

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard 
        label="Network Height" 
        value={cut ? cut.height.toLocaleString() : "..."} 
        icon={<Hash className="w-4 h-4 text-purple-400" />}
        isLoading={isLoading}
      />
      <StatCard 
        label="Current TPS" 
        value={stats.tps.toLocaleString()} 
        icon={<Zap className="w-4 h-4 text-yellow-400" />}
        trend="+2.4%"
      />
      <StatCard 
        label="24h Transactions" 
        value={stats.transactions24h.toLocaleString()} 
        icon={<Activity className="w-4 h-4 text-blue-400" />}
      />
      <StatCard 
        label="Avg Block Time" 
        value={`${stats.avgBlockTime}s`} 
        icon={<Clock className="w-4 h-4 text-green-400" />}
      />
      <StatCard 
        label="Active Nodes" 
        value={stats.activeNodes.toLocaleString()} 
        icon={<Server className="w-4 h-4 text-primary" />}
      />
    </div>
  );
}

function StatCard({ label, value, icon, trend, isLoading }: { label: string, value: string, icon: React.ReactNode, trend?: string, isLoading?: boolean }) {
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
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <span className="text-2xl font-display font-bold text-foreground">{value}</span>
        )}
        {trend && <span className="text-xs text-green-500 font-mono">{trend}</span>}
      </div>
    </motion.div>
  );
}
