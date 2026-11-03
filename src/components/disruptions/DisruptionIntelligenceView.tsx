import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  ShieldCheck, 
  Truck, 
  Building2, 
  Boxes, 
  Sparkles, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { 
  DisruptionIncident, 
  Shipment, 
  Supplier, 
  InventoryItem 
} from '../../types';
import { MitigationModal } from './MitigationModal';

interface DisruptionIntelligenceViewProps {
  disruptions: DisruptionIncident[];
  shipments: Shipment[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  onExecuteMitigation: (shipmentId: string, actionTitle: string) => void;
  onOpenCopilotWithQuery: (query: string) => void;
}

export const DisruptionIntelligenceView: React.FC<DisruptionIntelligenceViewProps> = ({
  disruptions,
  shipments,
  suppliers,
  inventory,
  onExecuteMitigation,
  onOpenCopilotWithQuery,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<DisruptionIncident | null>(disruptions[0] || null);
  const [activeMitigationShipment, setActiveMitigationShipment] = useState<Shipment | null>(null);

  const totalFinancialRisk = disruptions.reduce((sum, d) => sum + d.potentialFinancialLossInr, 0);
  const totalStoppageHours = disruptions.reduce((sum, d) => sum + d.projectedLineStoppageHours, 0);
  const activeCount = disruptions.filter(d => d.status === 'active').length;

  const getSupplier = (id: string) => suppliers.find(s => s.id === id);
  const getSku = (id: string) => inventory.find(i => i.id === id);
  const getShipment = (id: string) => shipments.find(s => s.id === id);

  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  const handleLaunchMitigation = (shipmentId: string) => {
    const shp = getShipment(shipmentId);
    if (shp) {
      setActiveMitigationShipment(shp);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Impact Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] rounded-2xl border border-red-900/40 p-4 bg-gradient-to-br from-red-950/20 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold text-red-300 uppercase tracking-wider">
            <span>Active Disruptions</span>
            <Flame className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {activeCount} Incidents
          </div>
          <div className="text-[11px] text-red-400/80 mt-2">
            Highway closures & border hold-ups
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Potential Financial Exposure</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {formatInr(totalFinancialRisk)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Idle assembly penalties & contract clauses
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Projected Line Stoppage</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {totalStoppageHours} Hours
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Cumulative across Chakan & Hosur lines
          </div>
        </div>

        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Most Imminent Assembly Halt</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            Line 2 Powertrain
          </div>
          <div className="text-[11px] text-red-300 mt-2">
            Countdown: ~28 hours until silicon sensor depletion
          </div>
        </div>
      </div>

      {/* Disruption Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Detected Disruption Events</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {disruptions.length} Total
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[620px] pr-1">
            {disruptions.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              const isCritical = incident.severity === 'critical';

              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                      : isCritical
                      ? 'bg-red-950/20 border-red-900/40 hover:border-red-700/60'
                      : 'bg-[#0D121F] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {incident.incidentCode}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      incident.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mt-1 leading-snug">
                    {incident.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{incident.corridorOrLocation}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
                    <span className="text-red-400 font-mono font-semibold">
                      +{incident.projectedLineStoppageHours}h Stoppage
                    </span>
                    <span className="font-mono text-slate-300">
                      {formatInr(incident.potentialFinancialLossInr)} Risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Incident Deep-Dive */}
        {selectedIncident && (
          <div className="lg:col-span-2 bg-[#0D121F] rounded-2xl border border-slate-800/80 p-5 space-y-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {selectedIncident.incidentCode}
                    </span>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Type: {selectedIncident.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      Detected: {selectedIncident.detectedAt}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2">
                    {selectedIncident.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{selectedIncident.corridorOrLocation}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-red-400">
                    {formatInr(selectedIncident.potentialFinancialLossInr)}
                  </div>
                  <div className="text-[11px] text-slate-500">Estimated Financial Exposure</div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#141B29] border border-slate-800 text-xs text-slate-200 leading-relaxed">
                <strong className="text-amber-300">Root Cause Telemetry: </strong>
                {selectedIncident.description}
              </div>

              {/* Impact Mapping (Direct Shipments, Suppliers, and SKUs) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {/* Affected Shipments */}
                <div className="p-3 bg-[#141B29] rounded-xl border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Affected Shipments</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedIncident.affectedShipmentIds.map(shpId => {
                      const shp = getShipment(shpId);
                      return (
                        <div key={shpId} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                          <div className="font-mono font-bold text-slate-200">{shp?.trackingNumber || shpId}</div>
                          <div className="text-[11px] text-red-300 font-mono mt-0.5">+{shp?.delayHours || 48}h Delay</div>
                          <button
                            onClick={() => handleLaunchMitigation(shpId)}
                            className="mt-2 w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Launch AI Playbook</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Affected Suppliers */}
                <div className="p-3 bg-[#141B29] rounded-xl border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Affected Suppliers</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedIncident.affectedSupplierIds.map(supId => {
                      const sup = getSupplier(supId);
                      return (
                        <div key={supId} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                          <div className="font-bold text-slate-200 truncate">{sup?.name || supId}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{sup?.cluster}</div>
                          <div className="text-[10px] text-amber-400 mt-1">Reliability: {sup?.reliabilityScore}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Affected SKUs / Lines */}
                <div className="p-3 bg-[#141B29] rounded-xl border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-amber-400" />
                    <span>Impacted SKUs</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedIncident.affectedSkuIds.map(skuId => {
                      const sku = getSku(skuId);
                      return (
                        <div key={skuId} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                          <div className="font-mono font-bold text-slate-200">{sku?.sku || skuId}</div>
                          <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                            Buffer Cover: {sku?.daysOfInventoryCover.toFixed(1) || 2.5} Days
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {sku?.associatedAssemblyLine}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Standard Disruption Action Plan */}
              <div className="mt-4 p-4 rounded-xl bg-[#141B29] border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Immediate Tactical Actions Logged</span>
                </h4>
                <div className="space-y-2">
                  {selectedIncident.recommendedActions.map((act, aIdx) => (
                    <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => onOpenCopilotWithQuery(`Analyze cascading supply shock from ${selectedIncident.title} on assembly lines`)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Cascading Ripple in AI Copilot</span>
              </button>

              {selectedIncident.affectedShipmentIds[0] && (
                <button
                  onClick={() => handleLaunchMitigation(selectedIncident.affectedShipmentIds[0])}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Execute Gemini Mitigation Playbook</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mitigation Modal when triggered */}
      {activeMitigationShipment && (
        <MitigationModal
          shipment={activeMitigationShipment}
          sku={inventory.find(i => activeMitigationShipment.skuIds.includes(i.id))}
          primarySupplier={suppliers.find(s => s.id === activeMitigationShipment.supplierId)}
          availableAlternateSuppliers={
            suppliers.find(s => s.id === activeMitigationShipment.supplierId)?.alternateSupplierIds
              ? suppliers.filter(s => 
                  suppliers.find(sp => sp.id === activeMitigationShipment.supplierId)?.alternateSupplierIds.includes(s.id)
                )
              : []
          }
          onClose={() => setActiveMitigationShipment(null)}
          onExecuteAction={onExecuteMitigation}
        />
      )}
    </div>
  );
};
