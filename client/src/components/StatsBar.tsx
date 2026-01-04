import { motion } from "framer-motion";
import { Activity, Server, Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { NetworkStats, MOCK_STATS } from "@/data/mockData";

export function StatsBar() {
  const [stats, setStats] = useState<NetworkStats>(MOCK_STATS);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tps: prev.tps + Math.floor((Math.random() - 0.5) * 50),
        transactions24h: prev.transactions24h + Math.floor(Math.random() * 10),
        activeNodes: prev.activeNodes + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend?: string }) {
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
        <span className="text-2xl font-display font-bold text-foreground">{value}</span>
        {trend && <span className="text-xs text-green-500 font-mono">{trend}</span>}
      </div>
    </motion.div>
  );
}
