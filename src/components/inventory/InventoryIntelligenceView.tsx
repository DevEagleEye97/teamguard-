import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  TrendingDown, 
  Sliders, 
  Layers,
  Factory,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { InventoryItem, Supplier, Shipment } from '../../types';

interface InventoryIntelligenceViewProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  shipments: Shipment[];
  onOpenMitigationForSku: (sku: InventoryItem) => void;
  onSelectSupplier: (supplierId: string) => void;
}

export const InventoryIntelligenceView: React.FC<InventoryIntelligenceViewProps> = ({
  inventory,
  suppliers,
  shipments,
  onOpenMitigationForSku,
  onSelectSupplier,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [simulatedDelayDays, setSimulatedDelayDays] = useState<number>(0);

  const filteredInventory = inventory.filter(item => {
    if (filterStatus === 'critical' && item.stockoutRiskStatus !== 'critical_stockout') return false;
    if (filterStatus === 'caution' && item.stockoutRiskStatus !== 'caution') return false;
    if (filterStatus === 'healthy' && item.stockoutRiskStatus !== 'healthy') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.associatedAssemblyLine.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSupplierName = (id: string) => {
    return suppliers.find(s => s.id === id)?.name || 'Direct Procurement';
  };

  const getBackupSupplierNames = (ids: string[]) => {
    return ids.map(id => suppliers.find(s => s.id === id)?.name).filter(Boolean);
  };

  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} L`;
  };

  // Calculations
  const totalValuation = inventory.reduce((sum, item) => sum + item.totalValuationInr, 0);
  const criticalItems = inventory.filter(item => item.stockoutRiskStatus === 'critical_stockout');

  return (
    <div className="space-y-6">
      {/* Inventory KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Warehouse Valuation</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatInr(totalValuation)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Across Chakan & Hosur plant stores
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-red-900/30 p-4">
          <div className="text-xs font-medium text-red-300 uppercase tracking-wider">Imminent Stockouts</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {criticalItems.length} SKUs (&lt; 48h Cover)
          </div>
          <div className="text-[11px] text-red-400/80 mt-2">
            Powertrain & Braking lines vulnerable
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Days of Cover (DOI)</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {(inventory.reduce((sum, i) => sum + i.daysOfInventoryCover, 0) / inventory.length).toFixed(1)} Days
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Daily burn vs on-hand physical stock
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Single-Source SKUs</div>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {inventory.filter(i => i.backupSupplierIds.length === 0).length} Critical Parts
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Zero approved secondary supplier in BOM
          </div>
        </div>
      </div>

      {/* Interactive Stockout Delay Stress-Tester */}
      <div className="bg-[#101625] rounded-2xl border border-amber-500/30 p-4 lg:p-5 gold-border-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Dynamic Supply Chain Stress-Tester (What-If In-Transit Delay)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate cascading buffer depletion if regional highway or border bottlenecks add extra delay days:
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#090D16] px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300">Simulate Added Delay:</span>
            <input
              type="range"
              min="0"
              max="7"
              step="1"
              value={simulatedDelayDays}
              onChange={(e) => setSimulatedDelayDays(Number(e.target.value))}
              className="w-28 accent-amber-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              +{simulatedDelayDays} Days
            </span>
            {simulatedDelayDays > 0 && (
              <button
                onClick={() => setSimulatedDelayDays(0)}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {simulatedDelayDays > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong>Stress Test Assessment (+{simulatedDelayDays} Days Transit Shock):</strong>{' '}
              {inventory.filter(i => (i.daysOfInventoryCover - simulatedDelayDays) <= 0).length > 0 ? (
                <span>
                  Immediate production halt!{' '}
                  <strong className="underline text-red-100">
                    {inventory.filter(i => (i.daysOfInventoryCover - simulatedDelayDays) <= 0).map(i => i.name).join(', ')}
                  </strong>{' '}
                  will completely run out of buffer stock before incoming replenishment arrives.
                </span>
              ) : (
                <span>
                  Safety buffers will compress by {simulatedDelayDays} days, leaving critical assemblies operating in emergency JIT mode.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inventory Search & Filters */}
      <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU code, component name, assembly line..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121824] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'critical', label: 'Critical Stockout (< 3d)' },
              { id: 'caution', label: 'Caution (3-7d)' },
              { id: 'healthy', label: 'Healthy (> 7d)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-[#121824] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#121824] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">SKU & Component</th>
                <th className="py-3 px-4">Current Stock / Buffer</th>
                <th className="py-3 px-4">Daily Burn Rate</th>
                <th className="py-3 px-4">Days of Cover (DOI)</th>
                <th className="py-3 px-4">Primary Supplier (BOM)</th>
                <th className="py-3 px-4">Associated Assembly Line</th>
                <th className="py-3 px-4 text-right">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0A0E17]/60">
              {filteredInventory.map(item => {
                const effectiveCover = Math.max(0, item.daysOfInventoryCover - simulatedDelayDays);
                const isCritical = effectiveCover < 2.5;
                const isCaution = effectiveCover >= 2.5 && effectiveCover < 6.0;

                return (
                  <tr key={item.id} className="hover:bg-[#121824]/80 transition-colors">
                    {/* SKU info */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{item.sku}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.criticality.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-slate-300 font-medium mt-0.5">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                    </td>

                    {/* Stock levels */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-200 font-bold">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Safety: {item.safetyBufferStock} | Reorder: {item.reorderPoint}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Unit Cost: ₹{item.unitCostInr.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Burn rate */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-200 font-medium">
                        {item.dailyConsumptionRate} {item.unit}/day
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Total Val: {formatInr(item.totalValuationInr)}
                      </div>
                    </td>

                    {/* Days of Cover */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          isCritical ? 'text-red-400' : isCaution ? 'text-amber-300' : 'text-emerald-400'
                        }`}>
                          {effectiveCover.toFixed(1)} Days
                        </span>
                        {simulatedDelayDays > 0 && (
                          <span className="text-[10px] text-red-400">
                            (-{simulatedDelayDays}d)
                          </span>
                        )}
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-red-500' : isCaution ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (effectiveCover / 15) * 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Primary Supplier */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onSelectSupplier(item.primarySupplierId)}
                        className="text-left font-medium text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
                      >
                        {getSupplierName(item.primarySupplierId)}
                      </button>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.backupSupplierIds.length > 0 ? (
                          <span className="text-emerald-400/90">
                            {item.backupSupplierIds.length} backup vendor(s) in BOM
                          </span>
                        ) : (
                          <span className="text-red-400 font-semibold">
                            ⚠️ Single-source dependency
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assembly line */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium truncate max-w-[180px]">
                        {item.associatedAssemblyLine}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Factory className="w-3 h-3" />
                        <span>Chakan / Hosur Plant</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {isCritical ? (
                        <button
                          onClick={() => onOpenMitigationForSku(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-red-300" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenMitigationForSku(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <span>Simulate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
