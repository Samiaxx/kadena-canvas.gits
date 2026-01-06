import { Hash, Zap, Activity, Clock, Server } from "lucide-react";
import { motion } from "framer-motion";
import { useLiveKadenaData } from "@/hooks/useLiveKadenaData";

export function StatsBar() {
  const {
    networkHeight,
    activeChains,
    avgBlockTime,
    tps,
    tx24h,
    isLoading,
    live,
    stale,
  } = useLiveKadenaData();

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          label="Network Height"
          value={networkHeight ? networkHeight.toLocaleString() : "—"}
          icon={<Hash className="w-4 h-4 text-purple-400" />}
          isLoading={isLoading}
        />

        <StatCard
          label="Active Chains"
          value={activeChains ? activeChains.toString() : "—"}
          icon={<Server className="w-4 h-4 text-pink-400" />}
          isLoading={isLoading}
        />

        <StatCard
          label="Current TPS"
          value={tps ? tps.toLocaleString() : "—"}
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          isLoading={isLoading}
        />

        <StatCard
          label="24h Transactions"
          value={tx24h ? tx24h.toLocaleString() : "—"}
          icon={<Activity className="w-4 h-4 text-blue-400" />}
          isLoading={isLoading}
        />

        <StatCard
          label="Avg Block Time"
          value={avgBlockTime ? `${avgBlockTime}s` : "—"}
          icon={<Clock className="w-4 h-4 text-green-400" />}
          isLoading={isLoading}
        />

        <StatCard
          label="Network Status"
          value={live ? "LIVE" : stale ? "STALE" : "OFFLINE"}
          icon={<Server className="w-4 h-4 text-primary" />}
          badge={live ? "live" : "stale"}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  isLoading,
  badge,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  badge?: "live" | "stale";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 rounded-lg flex flex-col relative overflow-hidden border border-border/50"
    >
      <div className="absolute top-0 right-0 p-3 opacity-50">{icon}</div>

      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
        {label}
      </span>

      {isLoading ? (
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
      ) : (
        <span className="text-xl font-display font-bold text-foreground">
          {value}
        </span>
      )}

      {badge && (
        <span
          className={`mt-1 text-[10px] font-mono ${
            badge === "live" ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {badge.toUpperCase()}
        </span>
      )}
    </motion.div>
  );
}
