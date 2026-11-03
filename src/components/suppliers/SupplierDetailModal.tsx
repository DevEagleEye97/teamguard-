import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Mail, 
  FileText,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Supplier, InventoryItem, AiSupplierDeepDive } from '../../types';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  allInventory: InventoryItem[];
  allSuppliers: Supplier[];
  onSelectSku: (skuId: string) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  onClose,
  allInventory,
  allSuppliers,
  onSelectSku,
}) => {
  const [aiAudit, setAiAudit] = useState<AiSupplierDeepDive | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string>('');

  if (!supplier) return null;

  const suppliedSkus = allInventory.filter(i => supplier.suppliedSkuIds.includes(i.id));
  const alternateSuppliers = allSuppliers.filter(s => supplier.alternateSupplierIds.includes(s.id));

  const runAiAudit = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/supplier-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier,
          suppliedSkus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch supplier risk analysis');
      }

      const data = await res.json();
      setAiAudit(data.data);
      setEngineUsed(data.engineUsed || 'Gemini 3.8 Flash');
    } catch (err) {
      console.error('Error running supplier AI audit:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1321] border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden gold-glow">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#121826] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mt-0.5">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {supplier.name}
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {supplier.code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                  {supplier.tier}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  MSME: {supplier.msmeCategory}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>Cluster: <strong className="text-slate-300">{supplier.cluster} ({supplier.state})</strong></span>
                <span>GSTIN: <code className="text-amber-400/90 font-mono">{supplier.gstin}</code></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">Reliability Score</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                {supplier.reliabilityScore} / 100
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Weighted performance</div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">On-Time Delivery (OTD)</div>
              <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {supplier.onTimeDeliveryRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Last 90 days delivery</div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">Quality Defect Rate</div>
              <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {supplier.qualityRejectionPpm} PPM
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Incoming QC rejection</div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">Financial Risk</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${
                supplier.financialRiskScore === 'High' 
                  ? 'text-red-400' 
                  : supplier.financialRiskScore === 'Medium' 
                  ? 'text-amber-400' 
                  : 'text-emerald-400'
              }`}>
                {supplier.financialRiskScore}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Terms: {supplier.paymentTermsDays} days</div>
            </div>
          </div>

          {/* Lead Time Drift Analysis Bar */}
          <div className="bg-[#141B29] rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200">
                  Lead Time Performance & Drift Analysis
                </h4>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                supplier.leadTimeDriftDays > 2 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Drift: +{supplier.leadTimeDriftDays} Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Nominal Stated Lead Time</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                  {supplier.nominalLeadTimeDays} Days
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Contractual agreement</div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Actual Historical Lead Time</div>
                <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                  {supplier.actualAvgLeadTimeDays} Days
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Observed freight & processing</div>
              </div>
            </div>

            {supplier.leadTimeDriftDays > 2 && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-[11px] text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  High lead time drift (+{supplier.leadTimeDriftDays}d) creates hidden buffer erosion in assembly lines.
                </span>
              </div>
            )}
          </div>

          {/* Single Source & Alternate Vendors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141B29] rounded-xl p-4 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Supplied Critical SKUs ({suppliedSkus.length})</span>
              </h4>
              <div className="space-y-2 mt-2">
                {suppliedSkus.map(sku => (
                  <div 
                    key={sku.id}
                    onClick={() => {
                      onClose();
                      onSelectSku(sku.id);
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-semibold text-slate-200">{sku.sku}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{sku.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-amber-300">{sku.daysOfInventoryCover.toFixed(1)}d Cover</div>
                      <span className="text-[10px] text-slate-500">{sku.criticality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-4 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Pre-Qualified Backup Suppliers</span>
              </h4>
              {supplier.isSingleSource ? (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-xs text-red-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Single-Source Vulnerability</span>
                  </div>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Zero secondary suppliers qualified for this vendor's components. Any regional downtime immediately halts production lines.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {alternateSuppliers.map(alt => (
                    <div key={alt.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">{alt.name}</div>
                        <div className="text-[11px] text-slate-400">{alt.cluster} • {alt.tier}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400">{alt.reliabilityScore}%</span>
                        <div className="text-[10px] text-slate-500">{alt.nominalLeadTimeDays}d lead</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Risk Deep-Dive Section */}
          <div className="bg-[#121927] rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Gemini AI Supplier Risk Audit
                </h4>
              </div>
              {!aiAudit && (
                <button
                  onClick={runAiAudit}
                  disabled={isLoadingAi}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoadingAi ? 'Auditing Supplier...' : 'Generate AI Risk Audit'}</span>
                </button>
              )}
            </div>

            {isLoadingAi && (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="inline-block animate-spin text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Evaluating lead time variance, PPM defect trends, and cluster geography via Gemini...
                </div>
              </div>
            )}

            {aiAudit && (
              <div className="space-y-3 animate-in fade-in text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px] font-semibold mb-1 uppercase tracking-wide">
                    Executive Health Summary
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {aiAudit.overallHealthAssessment}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px] font-semibold mb-1 uppercase tracking-wide">
                    Lead Time Drift & Safety Stock Impact
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {aiAudit.leadTimeDriftAnalysis}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-amber-400 text-[11px] font-semibold mb-1 uppercase tracking-wide">
                    Negotiation & Resilience Action Items
                  </div>
                  <ul className="space-y-1.5 mt-1">
                    {aiAudit.negotiationAndBufferRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Engine: {engineUsed}</span>
                  <span>Confidence: {aiAudit.confidenceScore}% (Grounded on master supplier telemetry)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#121826] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{supplier.phone}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{supplier.email}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
