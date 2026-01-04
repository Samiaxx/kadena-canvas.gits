import { Filter, Globe as GlobeIcon, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface FilterBarProps {
  viewMode: 'map' | 'globe';
  setViewMode: (mode: 'map' | 'globe') => void;
  selectedTypes: string[];
  toggleType: (type: string) => void;
}

export function FilterBar({ viewMode, setViewMode, selectedTypes, toggleType }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
      <div className="flex gap-2 bg-card/50 p-1 rounded-lg border border-border/50">
        <Button 
          variant={viewMode === 'map' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => setViewMode('map')}
          className="text-xs"
        >
          <MapIcon className="w-3 h-3 mr-2" />
          2D Map
        </Button>
        <Button 
          variant={viewMode === 'globe' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => setViewMode('globe')}
          className="text-xs"
        >
          <GlobeIcon className="w-3 h-3 mr-2" />
          3D Globe
        </Button>
      </div>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-card/30 border-border/50">
              <Filter className="w-3 h-3 mr-2" />
              Filter Nodes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel>Node Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['RPC', 'Full', 'Miner'].map((type) => (
              <DropdownMenuCheckboxItem 
                key={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    type === 'RPC' ? 'bg-[#ed0976]' : 
                    type === 'Full' ? 'bg-[#00e1e1]' : 
                    'bg-[#fbbf24]'
                  }`} />
                  {type} Nodes
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
