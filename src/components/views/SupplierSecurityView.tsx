import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles, 
  Lock, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Supplier, InventoryItem, Shipment } from '../../types';

interface SupplierSecurityViewProps {
  suppliers: Supplier[];
  inventory: InventoryItem[];
  shipments: Shipment[];
  onTriggerSupplierAudit: (supplier: Supplier) => void;
  onNavigateTab: (tab: any) => void;
}

export const SupplierSecurityView: React.FC<SupplierSecurityViewProps> = ({
  suppliers,
  inventory,
  shipments,
  onTriggerSupplierAudit,
  onNavigateTab,
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => {
    if (tierFilter !== 'all' && s.tier !== tierFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.cluster.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSecurityScoreBadge = (score: number = 80) => {
    if (score >= 85) return 'text-[#3D8255] border-[#3D8255]/40 bg-[#3D8255]/15';
    if (score >= 70) return 'text-[#C98A2C] border-[#C98A2C]/40 bg-[#C98A2C]/15';
    return 'text-[#B83A3A] border-[#B83A3A]/40 bg-[#B83A3A]/15';
  };

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Header explanation banner */}
      <div className="p-3.5 rounded-xl bg-[#1A2228] border border-[#303940] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C6A85E]" />
            <span>Third-Party Supplier Cybersecurity & Supply-Chain Continuity</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Connecting supplier security rating, software exposure, and ISO compliance to direct factory assembly disruption risks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-[#A5ADB5]">
            Monitored Base: <strong className="text-[#C6A85E] font-mono">{suppliers.length} Vendors</strong>
          </div>
        </div>
      </div>

      {/* Directory & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#151B20] border border-[#303940]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier, GSTIN, cluster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1.5 text-[#F4F0E7] focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="Tier-1">Tier-1 Direct</option>
            <option value="Tier-2">Tier-2 Sub-vendor</option>
          </select>
        </div>
      </div>

      {/* Supplier Grid with Cybersecurity & Continuity overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSuppliers.map(supplier => {
          const securityRating = supplier.securityRating || (supplier.reliabilityScore - 5);
          const isSingleSource = supplier.isSingleSource;

          return (
            <div
              key={supplier.id}
              onClick={() => setSelectedSupplier(supplier)}
              className="p-4 rounded-xl bg-[#1A2228] border border-[#303940] hover:border-[#C6A85E]/50 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] text-[#C6A85E] bg-[#101418] px-2 py-0.5 rounded border border-[#303940]">
                    {supplier.code}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSecurityScoreBadge(securityRating)}`}>
                    Security Score: {securityRating} / 100
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#F4F0E7] mt-1">
                  {supplier.name}
                </h4>
                <div className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Cluster: {supplier.cluster} • {supplier.tier}
                </div>

                {/* Cyber & Operational Matrix */}
                <div className="mt-3.5 space-y-1.5 text-xs text-[#A5ADB5] border-t border-[#303940]/60 pt-2.5">
                  <div className="flex justify-between text-[11px]">
                    <span>Data Integration Scope:</span>
                    <span className="font-mono text-[#F4F0E7]">
                      {supplier.dataAccessScope || 'Restricted API Only'}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span>ISO 27001 Certified:</span>
                    <span className={`font-mono ${supplier.iso27001Certified ?? true ? 'text-[#3D8255]' : 'text-[#B83A3A]'}`}>
                      {supplier.iso27001Certified ?? true ? 'Verified Compliance' : 'Pending Audit'}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span>Delivery Reliability:</span>
                    <span className="font-mono text-[#F4F0E7]">{supplier.onTimeDeliveryRate}% OTD</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span>Supply Chain Dependency:</span>
                    {isSingleSource ? (
                      <span className="text-[#B83A3A] font-semibold font-mono">Single-Source (High Exposure)</span>
                    ) : (
                      <span className="text-[#3D8255] font-mono">Dual-Sourced</span>
                    )}
                  </div>
                </div>

                {isSingleSource && (
                  <div className="p-2 rounded bg-[#101418] border border-[#B83A3A]/40 mt-3 text-[10px] text-[#B83A3A]">
                    Critical continuity risk: A cybersecurity downtime or ransomware event on this vendor halts Line 2 assembly immediately.
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#303940]/60 flex items-center justify-between text-[11px] text-[#A5ADB5]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerSupplierAudit(supplier);
                  }}
                  className="text-[#C6A85E] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Risk Audit</span>
                </button>
                <span>Details &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#151B20] border border-[#303940] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C6A85E]" />
                <h3 className="text-sm font-semibold text-[#F4F0E7]">
                  {selectedSupplier.name} Security Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#101418] p-3 rounded-lg border border-[#303940]">
                <div>
                  <span className="text-[#A5ADB5]">GSTIN:</span>
                  <div className="font-mono text-[#F4F0E7] mt-0.5">{selectedSupplier.gstin}</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Cluster:</span>
                  <div className="text-[#F4F0E7] mt-0.5">{selectedSupplier.cluster} ({selectedSupplier.state})</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Nominal Lead Time:</span>
                  <div className="font-mono text-[#F4F0E7] mt-0.5">{selectedSupplier.nominalLeadTimeDays} Days</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Observed Historical Lead Time:</span>
                  <div className="font-mono text-[#C98A2C] mt-0.5 font-bold">{selectedSupplier.actualAvgLeadTimeDays} Days</div>
                </div>
              </div>

              <div className="p-3 bg-[#101418] rounded-lg border border-[#303940] space-y-1">
                <span className="text-[#C6A85E] font-semibold text-[11px] uppercase tracking-wider">
                  Cybersecurity to Supply-Chain Correlation:
                </span>
                <p className="text-[#F4F0E7] leading-relaxed text-[11px]">
                  {selectedSupplier.notes || 'Third-party vendor with direct integration into TrustGuard simulated SCM ledger.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="px-4 py-2 rounded-lg bg-[#303940] text-[#F4F0E7] hover:bg-[#46535D] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
