import React, { useState } from 'react';
import { 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  Boxes, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Sparkles,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { CorridorMap } from './CorridorMap';
import { ShipmentTracker } from './ShipmentTracker';
import { AlertsStream } from './AlertsStream';
import { 
  Shipment, 
  Supplier, 
  InventoryItem, 
  RiskAlert, 
  ClusterRegion 
} from '../../types';

interface ControlTowerViewProps {
  shipments: Shipment[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  alerts: RiskAlert[];
  selectedCluster: ClusterRegion | 'All';
  onOpenMitigation: (shipment: Shipment) => void;
  onSelectEntity: (entityId: string, type: 'shipment' | 'supplier' | 'inventory' | 'database' | 'cve') => void;
  onLaunchCopilot: (query: string) => void;
}

export const ControlTowerView: React.FC<ControlTowerViewProps> = ({
  shipments,
  suppliers,
  inventory,
  alerts,
  selectedCluster,
  onOpenMitigation,
  onSelectEntity,
  onLaunchCopilot,
}) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null);

  // Filtered dataset according to cluster
  const activeShipments = shipments.filter(s => {
    if (selectedCluster === 'All') return true;
    const sup = suppliers.find(sp => sp.id === s.supplierId);
    return sup?.cluster === selectedCluster || s.corridor.includes(selectedCluster.split('-')[0]);
  });

  // Calculate Executive KPIs
  const totalShipments = activeShipments.length;
  const delayedShipments = activeShipments.filter(s => s.status === 'delayed' || s.status === 'critical_risk');
  const delayedCount = delayedShipments.length;
  const delayedRate = totalShipments > 0 ? ((delayedCount / totalShipments) * 100).toFixed(1) : '0';
  
  const totalValueAtRisk = delayedShipments.reduce((sum, s) => sum + s.orderValueInr, 0);

  // Supplier risk composite index (average reliability inverted or average risk)
  const avgSupplierReliability = suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / (suppliers.length || 1);
  const singleSourceCount = suppliers.filter(s => s.isSingleSource).length;

  // Inventory health
  const criticalStockouts = inventory.filter(i => i.stockoutRiskStatus === 'critical_stockout');
  const averageDaysCover = inventory.reduce((sum, i) => sum + i.daysOfInventoryCover, 0) / (inventory.length || 1);

  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="space-y-6">
      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Shipments */}
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4 transition-all hover:border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Shipments</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{totalShipments}</span>
            <span className="text-xs text-slate-400">consignments</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-xs">
            <span className="text-slate-400">Total In-Transit Goods</span>
            <span className="font-mono font-medium text-slate-200">
              {formatInr(activeShipments.reduce((acc, s) => acc + s.orderValueInr, 0))}
            </span>
          </div>
        </div>

        {/* KPI 2: Delayed / Disruptions */}
        <div className="bg-[#0D121F] rounded-2xl border border-red-900/30 p-4 transition-all hover:border-red-500/50 bg-gradient-to-br from-red-950/20 via-transparent to-transparent">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-red-300">Delayed Shipments</span>
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-400">{delayedCount}</span>
            <span className="text-xs text-red-300/80 font-mono">({delayedRate}% of freight)</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-xs">
            <span className="text-slate-400">Direct Value at Risk</span>
            <span className="font-mono font-bold text-red-400">{formatInr(totalValueAtRisk)}</span>
          </div>
        </div>

        {/* KPI 3: Supplier Reliability Index */}
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4 transition-all hover:border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Supplier Reliability</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {avgSupplierReliability.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">weighted score</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-xs">
            <span className="text-slate-400">Single-Source Exposure</span>
            <span className="font-mono font-medium text-amber-400">{singleSourceCount} critical vendors</span>
          </div>
        </div>

        {/* KPI 4: Inventory Health */}
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4 transition-all hover:border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inventory Health</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {averageDaysCover.toFixed(1)} Days
            </span>
            <span className="text-xs text-slate-400">avg buffer cover</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-xs">
            <span className="text-slate-400">Critical Stockout Alerts</span>
            <span className={`font-mono font-bold ${criticalStockouts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {criticalStockouts.length} SKUs (&lt; 48h)
            </span>
          </div>
        </div>
      </div>

      {/* Corridor Map and Live Risk Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CorridorMap
            shipments={activeShipments}
            selectedShipmentId={selectedShipment?.id}
            onSelectShipment={(shp) => setSelectedShipment(shp)}
            selectedCluster={selectedCluster}
          />
        </div>

        <div className="lg:col-span-1">
          <AlertsStream
            alerts={alerts}
            onSelectEntity={onSelectEntity}
            onLaunchCopilot={onLaunchCopilot}
          />
        </div>
      </div>

      {/* Shipment Tracker Table */}
      <ShipmentTracker
        shipments={activeShipments}
        suppliers={suppliers}
        selectedShipmentId={selectedShipment?.id}
        onSelectShipment={(shp) => setSelectedShipment(shp)}
        onOpenMitigation={onOpenMitigation}
      />
    </div>
  );
};
