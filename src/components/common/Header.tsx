import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Search, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle,
  Building,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ClusterRegion } from '../../types';

interface HeaderProps {
  selectedCluster: ClusterRegion | 'All';
  onSelectCluster: (cluster: ClusterRegion | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetData: () => void;
  aiStatus: {
    status: string;
    hasKey: boolean;
    model: string;
  };
  totalDelayedShipments: number;
  totalFinancialRiskInr: number;
  onOpenAiCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCluster,
  onSelectCluster,
  searchQuery,
  onSearchChange,
  onResetData,
  aiStatus,
  totalDelayedShipments,
  totalFinancialRiskInr,
  onOpenAiCopilot,
}) => {
  const [istTime, setIstTime] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as IST time
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setIstTime(`${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onResetData();
      setIsRefreshing(false);
    }, 600);
  };

  const formatLakhsCrores = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <header className="bg-[#0E131F]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Trust<span className="text-amber-400">Guard</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Resilience Tower
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Indian Manufacturing Hub (Chakan & Hosur Plants)</span>
            </p>
          </div>
        </div>

        {/* Center / Search bar & filters */}
        <div className="flex-1 max-w-md mx-0 md:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKUs, e-Way bills, suppliers, or corridors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#141B29] border border-slate-800 focus:border-amber-500/50 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right tools and telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cluster filter selector */}
          <div className="flex items-center gap-1.5 bg-[#141B29] border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Building className="w-3.5 h-3.5 text-amber-400/80" />
            <select
              value={selectedCluster}
              onChange={(e) => onSelectCluster(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="All" className="bg-[#141B29] text-white">All Industrial Corridors</option>
              <option value="Pune-Chakan" className="bg-[#141B29] text-white">Pune-Chakan Auto Cluster</option>
              <option value="NCR-Manesar" className="bg-[#141B29] text-white">NCR-Manesar Industrial</option>
              <option value="Gujarat-Sanand" className="bg-[#141B29] text-white">Gujarat-Sanand Engineering</option>
              <option value="Chennai-Sriperumbudur" className="bg-[#141B29] text-white">Chennai-Sriperumbudur</option>
              <option value="Bengaluru-Hosur" className="bg-[#141B29] text-white">Bengaluru-Hosur Precision</option>
              <option value="Mumbai-JNPT" className="bg-[#141B29] text-white">Mumbai-JNPT Port Hub</option>
            </select>
          </div>

          {/* Clock badge */}
          <div className="hidden xl:flex items-center gap-1.5 bg-[#141B29] border border-slate-800/80 px-2.5 py-1 rounded-lg text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{istTime || '18:45:00 IST'}</span>
          </div>

          {/* AI Resilience Engine status button */}
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-500/25 transition-all text-xs font-medium cursor-pointer"
            title="Open Gemini Supply Resilience Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Copilot</span>
          </button>

          {/* Quick Risk Indicator */}
          {totalDelayedShipments > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>{totalDelayedShipments} Delayed ({formatLakhsCrores(totalFinancialRiskInr)} at risk)</span>
            </div>
          )}

          {/* Reset / Refresh Data */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-[#141B29] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors cursor-pointer"
            title="Reload Master Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
