import React, { useState } from 'react';
import { 
  Truck, 
  AlertCircle, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  Filter,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Shipment, ShipmentStatus, Supplier } from '../../types';

interface ShipmentTrackerProps {
  shipments: Shipment[];
  suppliers: Supplier[];
  onSelectShipment: (shipment: Shipment) => void;
  onOpenMitigation: (shipment: Shipment) => void;
  selectedShipmentId?: string;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({
  shipments,
  suppliers,
  onSelectShipment,
  onOpenMitigation,
  selectedShipmentId,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = shipments.filter(s => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'delayed') return s.status === 'delayed' || s.status === 'critical_risk';
    return s.status === filterStatus;
  });

  const getSupplierName = (id: string) => {
    return suppliers.find(s => s.id === id)?.name || 'Unknown Supplier';
  };

  const getStatusBadge = (status: ShipmentStatus, delayHours: number) => {
    switch (status) {
      case 'critical_risk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            Critical Risk (+{delayHours}h)
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Delayed (+{delayHours}h)
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            In Transit
          </span>
        );
      case 'on_schedule':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            On Schedule
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} L`;
  };

  return (
    <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4 lg:p-5">
      {/* Table Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Shipment Telemetry & e-Way Bill Ledger
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded">
              {filtered.length} Shipments Monitored
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-state transit monitoring synced with simulated GST e-Way bills and FASTag logs
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Shipments' },
            { id: 'delayed', label: 'Delayed / At Risk', highlight: true },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'on_schedule', label: 'On Schedule' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-[#121824] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#121824] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Shipment & e-Way Bill</th>
              <th className="py-3 px-4">Origin & Carrier</th>
              <th className="py-3 px-4">Destination Facility</th>
              <th className="py-3 px-4">Order Value</th>
              <th className="py-3 px-4">Status & Delay</th>
              <th className="py-3 px-4">Current Staging Point</th>
              <th className="py-3 px-4 text-right">Resilience Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#0A0E17]/60">
            {filtered.map((shipment) => {
              const isSelected = selectedShipmentId === shipment.id;
              const hasCriticalDelay = shipment.delayHours > 24;

              return (
                <tr
                  key={shipment.id}
                  onClick={() => onSelectShipment(shipment)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-amber-500/10 border-l-4 border-l-amber-400'
                      : 'hover:bg-[#121824]/80'
                  }`}
                >
                  {/* Tracking info */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{shipment.trackingNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>e-Way: {shipment.eWayBillNumber}</span>
                    </div>
                    <div className="text-[10px] text-amber-400/80 mt-1 truncate max-w-[160px]">
                      {getSupplierName(shipment.supplierId)}
                    </div>
                  </td>

                  {/* Origin */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium truncate max-w-[170px]" title={shipment.originHub}>
                      {shipment.originHub}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {shipment.carrierName}
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium truncate max-w-[170px]">
                      {shipment.destinationFacility}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ETA: {shipment.estimatedDeliveryDate.split(' ')[0]}
                    </div>
                  </td>

                  {/* Order Value */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-slate-100 font-semibold">
                      {formatInr(shipment.orderValueInr)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {shipment.quantityTotal} units
                    </div>
                  </td>

                  {/* Status & Delay reason */}
                  <td className="py-3.5 px-4">
                    <div>{getStatusBadge(shipment.status, shipment.delayHours)}</div>
                    {shipment.delayReason && (
                      <div className="text-[11px] text-red-300/90 mt-1.5 max-w-[200px] leading-tight line-clamp-2" title={shipment.delayReason}>
                        {shipment.delayReason}
                      </div>
                    )}
                  </td>

                  {/* Current Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{shipment.currentLocation}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {shipment.corridor}
                    </div>
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    {hasCriticalDelay ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMitigation(shipment);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>Mitigate</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectShipment(shipment);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <span>Telemetry</span>
                        <ArrowRight className="w-3 h-3" />
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
  );
};
