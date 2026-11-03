import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Supplier, InventoryItem, ClusterRegion } from '../../types';
import { SupplierDetailModal } from './SupplierDetailModal';

interface SupplierDirectoryViewProps {
  suppliers: Supplier[];
  inventory: InventoryItem[];
  selectedCluster: ClusterRegion | 'All';
  onSelectSku: (skuId: string) => void;
}

export const SupplierDirectoryView: React.FC<SupplierDirectoryViewProps> = ({
  suppliers,
  inventory,
  selectedCluster,
  onSelectSku,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [singleSourceOnly, setSingleSourceOnly] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => {
    if (selectedCluster !== 'All' && s.cluster !== selectedCluster) return false;
    if (selectedTier !== 'all' && s.tier !== selectedTier) return false;
    if (singleSourceOnly && !s.isSingleSource) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.gstin.toLowerCase().includes(q) ||
        s.cluster.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const singleSourceCount = suppliers.filter(s => s.isSingleSource).length;
  const avgReliability = suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / (suppliers.length || 1);

  return (
    <div className="space-y-6">
      {/* Top Supplier KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Suppliers</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {suppliers.length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Automotive & Engineering OEM base
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-red-900/30 p-4">
          <div className="text-xs font-medium text-red-300 uppercase tracking-wider">Single-Source Vulnerabilities</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {singleSourceCount} Vendors
          </div>
          <div className="text-[11px] text-red-400/80 mt-2">
            Zero approved secondary vendors in BOM
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Reliability</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {avgReliability.toFixed(1)} / 100
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Based on OTD & PPM quality scorecards
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Lead Time Drift</div>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            +3.0 Days
          </div>
          <div className="text-[11px] text-amber-400 mt-2">
            Historical deviation vs contractual SLA
          </div>
        </div>
      </div>

      {/* Directory Search & Filters */}
      <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by supplier name, code, GSTIN, cluster..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121824] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Tier filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#121824] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Tier-1">Tier-1 Direct</option>
              <option value="Tier-2">Tier-2 Sub-vendor</option>
            </select>

            {/* Single source toggle */}
            <button
              onClick={() => setSingleSourceOnly(!singleSourceOnly)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                singleSourceOnly
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 font-semibold'
                  : 'bg-[#121824] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Single-Source Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          const isHighDrift = supplier.leadTimeDriftDays > 2;

          return (
            <div
              key={supplier.id}
              onClick={() => setActiveSupplier(supplier)}
              className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-5 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {supplier.code}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {supplier.tier}
                      </span>
                      {supplier.isSingleSource && (
                        <span className="text-[10px] font-semibold text-red-300 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Single Source
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-1.5">
                      {supplier.name}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {supplier.reliabilityScore}
                    </div>
                    <div className="text-[10px] text-slate-500">Score</div>
                  </div>
                </div>

                {/* Sub details */}
                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Cluster Hub:</span>
                    <span className="text-slate-200 font-medium">{supplier.cluster}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>On-Time Delivery:</span>
                    <span className="font-mono text-slate-200">{supplier.onTimeDeliveryRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Quality Defect Rate:</span>
                    <span className="font-mono text-slate-200">{supplier.qualityRejectionPpm} PPM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lead Time (Nominal / Actual):</span>
                    <span className="font-mono text-slate-200">
                      {supplier.nominalLeadTimeDays}d / <strong className={isHighDrift ? 'text-red-400' : 'text-slate-200'}>{supplier.actualAvgLeadTimeDays}d</strong>
                    </span>
                  </div>
                </div>

                {/* Lead time drift badge */}
                {isHighDrift && (
                  <div className="mb-4 p-2 rounded-lg bg-red-950/30 border border-red-800/40 text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>Lead time drift +{supplier.leadTimeDriftDays}d erodes safety stock</span>
                  </div>
                )}
              </div>

              {/* Card Footer action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Risk Audit</span>
                </span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier In-Depth Dossier Modal */}
      {activeSupplier && (
        <SupplierDetailModal
          supplier={activeSupplier}
          onClose={() => setActiveSupplier(null)}
          allInventory={inventory}
          allSuppliers={suppliers}
          onSelectSku={onSelectSku}
        />
      )}
    </div>
  );
};
