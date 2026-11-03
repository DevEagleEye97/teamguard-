import React, { useState } from 'react';
import { 
  Truck, 
  Boxes, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sliders 
} from 'lucide-react';
import { ControlTowerView } from '../control-tower/ControlTowerView';
import { InventoryIntelligenceView } from '../inventory/InventoryIntelligenceView';
import { DisruptionIntelligenceView } from '../disruptions/DisruptionIntelligenceView';
import { 
  Shipment, 
  Supplier, 
  InventoryItem, 
  DisruptionIncident, 
  RiskAlert, 
  ClusterRegion 
} from '../../types';

interface SupplyChainViewProps {
  shipments: Shipment[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  disruptions: DisruptionIncident[];
  alerts: RiskAlert[];
  selectedCluster: ClusterRegion | 'All';
  onOpenMitigation: (shipment: Shipment) => void;
  onSelectEntity: (entityId: string, type: 'shipment' | 'supplier' | 'inventory' | 'database' | 'cve') => void;
  onLaunchCopilot: (query: string) => void;
  onExecuteMitigation: (shipmentId: string, actionTitle: string) => void;
}

export const SupplyChainView: React.FC<SupplyChainViewProps> = ({
  shipments,
  suppliers,
  inventory,
  disruptions,
  alerts,
  selectedCluster,
  onOpenMitigation,
  onSelectEntity,
  onLaunchCopilot,
  onExecuteMitigation,
}) => {
  const [subTab, setSubTab] = useState<'control_tower' | 'inventory' | 'disruptions'>('control_tower');

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C6A85E]" />
            <span>Industrial Supply Chain & Manufacturing Continuity</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Active highway corridor telemetry, Golden Quadrilateral tracking, and assembly buffer health
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#101418] p-1 rounded-lg border border-[#303940] text-xs">
          <button
            onClick={() => setSubTab('control_tower')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'control_tower' ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
            }`}
          >
            Control Tower & Map
          </button>
          <button
            onClick={() => setSubTab('inventory')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'inventory' ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
            }`}
          >
            Inventory & DOI Cover
          </button>
          <button
            onClick={() => setSubTab('disruptions')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'disruptions' ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
            }`}
          >
            Disruption Intelligence
          </button>
        </div>
      </div>

      {/* Sub views */}
      {subTab === 'control_tower' && (
        <ControlTowerView
          shipments={shipments}
          suppliers={suppliers}
          inventory={inventory}
          alerts={alerts}
          selectedCluster={selectedCluster}
          onOpenMitigation={onOpenMitigation}
          onSelectEntity={onSelectEntity}
          onLaunchCopilot={onLaunchCopilot}
        />
      )}

      {subTab === 'inventory' && (
        <InventoryIntelligenceView
          inventory={inventory}
          suppliers={suppliers}
          shipments={shipments}
          onOpenMitigationForSku={(sku) => {
            const relShp = shipments.find(s => s.skuIds.includes(sku.id)) || shipments[0];
            onOpenMitigation(relShp);
          }}
          onSelectSupplier={() => {}}
        />
      )}

      {subTab === 'disruptions' && (
        <DisruptionIntelligenceView
          disruptions={disruptions}
          shipments={shipments}
          suppliers={suppliers}
          inventory={inventory}
          onExecuteMitigation={onExecuteMitigation}
          onOpenCopilotWithQuery={onLaunchCopilot}
        />
      )}
    </div>
  );
};
