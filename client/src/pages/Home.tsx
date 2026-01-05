import { useState, useMemo, useEffect } from "react";
import { StatsBar } from "@/components/StatsBar";
import { NodeMap } from "@/components/NodeMap";
import { GlobeView } from "@/components/GlobeView";
import { FilterBar } from "@/components/FilterBar";
import { MOCK_NODES } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveKadenaData } from "@/hooks/useLiveKadenaData";

export default function Home() {
  const [viewMode, setViewMode] = useState<'map' | 'globe'>('map');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['RPC', 'Full', 'Miner']);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Use simulated live data hook
  const liveNodes = useLiveKadenaData(MOCK_NODES);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const filteredNodes = useMemo(() => {
    return liveNodes.filter(node => selectedTypes.includes(node.type));
  }, [liveNodes, selectedTypes]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto transition-colors duration-300">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            KADENA NEXUS
          </h1>
          <p className="text-muted-foreground mt-1">Real-time Network Explorer</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <div className="text-right hidden md:block border-l border-border/50 pl-4">
            <div className="text-xs text-muted-foreground font-mono">NETWORK STATUS</div>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-500">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </header>

      <StatsBar />

      <main className="flex-1 flex flex-col">
        <FilterBar 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
          selectedTypes={selectedTypes}
          toggleType={toggleType}
        />

        <div className="flex-1 relative min-h-[600px] glass-panel rounded-xl p-1 overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <NodeMap nodes={filteredNodes} theme={theme} />
              </motion.div>
            ) : (
              <motion.div 
                key="globe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <GlobeView nodes={filteredNodes} theme={theme} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-8 text-center text-xs text-muted-foreground border-t border-border/30 pt-4">
        <p>© 2026 Kadena Nexus. Simulated Real-time Network Feed.</p>
      </footer>
    </div>
  );
}
