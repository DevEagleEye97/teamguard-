import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Boxes, 
  Building2, 
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  Shipment, 
  InventoryItem, 
  Supplier, 
  AiMitigationRecommendation 
} from '../../types';

interface MitigationModalProps {
  shipment: Shipment | null;
  sku?: InventoryItem;
  primarySupplier?: Supplier;
  availableAlternateSuppliers: Supplier[];
  onClose: () => void;
  onExecuteAction: (shipmentId: string, actionTitle: string) => void;
}

export const MitigationModal: React.FC<MitigationModalProps> = ({
  shipment,
  sku,
  primarySupplier,
  availableAlternateSuppliers,
  onClose,
  onExecuteAction,
}) => {
  const [playbook, setPlaybook] = useState<AiMitigationRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string>('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [executedTitle, setExecutedTitle] = useState<string | null>(null);

  useEffect(() => {
    if (shipment) {
      loadPlaybook();
    }
  }, [shipment?.id]);

  const loadPlaybook = async () => {
    if (!shipment) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/mitigation-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment,
          affectedSku: sku,
          primarySupplier,
          availableAlternateSuppliers,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate mitigation playbook');
      }

      const data = await res.json();
      setPlaybook(data.data);
      setEngineUsed(data.engineUsed || 'Gemini 3.8 Flash');
    } catch (err) {
      console.error('Error generating mitigation playbook:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!shipment) return null;

  const handleApply = (title: string) => {
    setExecutedTitle(title);
    onExecuteAction(shipment.id, title);
  };

  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1321] border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden gold-glow">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#121826] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mt-0.5">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Gemini AI Mitigation Playbook
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                  Delay: +{shipment.delayHours} Hours
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {shipment.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Grounded resolution engine evaluating live buffer stock, alternate vendors, and transit re-routing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Context Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Shipment card */}
            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800 text-xs">
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Delayed Consignment</span>
              </div>
              <div className="font-mono text-slate-200 font-bold">{shipment.trackingNumber}</div>
              <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{shipment.carrierName}</div>
              <div className="text-red-300 text-[11px] mt-1 line-clamp-2">
                Reason: {shipment.delayReason || 'Highway congestion'}
              </div>
            </div>

            {/* Impacted SKU card */}
            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800 text-xs">
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Affected Component</span>
              </div>
              <div className="font-mono text-slate-200 font-bold">{sku?.sku || 'Direct Sub-assembly'}</div>
              <div className="text-slate-300 text-[11px] mt-0.5 truncate">{sku?.name || 'Critical SKU'}</div>
              <div className="text-amber-300 font-mono text-[11px] mt-1">
                Remaining Cover: {sku?.daysOfInventoryCover.toFixed(1) || '2.8'} Days ({sku?.currentStock || 0} units)
              </div>
            </div>

            {/* Vendor card */}
            <div className="bg-[#141B29] rounded-xl p-3 border border-slate-800 text-xs">
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Supplier & Backups</span>
              </div>
              <div className="text-slate-200 font-bold truncate">{primarySupplier?.name || 'Primary Supplier'}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{primarySupplier?.cluster || 'Cluster Hub'}</div>
              <div className="text-emerald-400 text-[11px] mt-1">
                {availableAlternateSuppliers.length > 0 
                  ? `${availableAlternateSuppliers.length} Pre-Qualified Backup(s) in BOM` 
                  : '⚠️ No Qualified Alternate (Single Source)'}
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="inline-block animate-spin text-amber-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Gemini 3.8 Flash is calculating optimal mitigation scenarios...
              </div>
              <div className="text-xs text-slate-500 max-w-md mx-auto">
                Auditing pre-approved vendor master data, transit bypass routes, and production line buffer tolerances.
              </div>
            </div>
          )}

          {/* Loaded Playbook */}
          {!loading && playbook && (
            <div className="space-y-4 animate-in fade-in">
              {/* Executive Summary & Urgency */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Operational Assessment
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      Urgency: {playbook.urgency}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Est. Financial Loss Preventable:{' '}
                    <strong className="text-emerald-400 font-mono font-bold">
                      {formatInr(playbook.estimatedLossMitigatedInr)}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {playbook.summary}
                </p>

                <p className="text-[11px] text-slate-400 mt-2 italic">
                  "{playbook.explanation}"
                </p>
              </div>

              {/* Mitigation Options Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Mitigation Strategy to Execute ({playbook.options.length} Grounded Options)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {playbook.options.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedOptionIndex === idx
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-[#141B29] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {opt.actionType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {opt.feasibilityScore}% Feasibility
                          </span>
                        </div>
                        <h5 className="text-xs font-bold mt-1 line-clamp-2">
                          {opt.title}
                        </h5>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-400">
                        <div className="flex justify-between">
                          <span>Cost:</span>
                          <span className="font-mono text-slate-200">{formatInr(opt.costToImplementInr)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time to Recover:</span>
                          <span className="font-mono text-slate-200">{opt.timeToRecoverHours}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Option Deep-Dive SOP */}
              {playbook.options[selectedOptionIndex] && (
                <div className="bg-[#141B29] rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Execution Standard Operating Procedure (SOP)</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {playbook.options[selectedOptionIndex].title}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(playbook.options[selectedOptionIndex].title)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        executedTitle === playbook.options[selectedOptionIndex].title
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {executedTitle === playbook.options[selectedOptionIndex].title ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Action Initiated & Dispatched</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Authorize & Execute Action</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* SOP steps */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Sequential Action Steps:
                    </div>
                    {playbook.options[selectedOptionIndex].stepByStepSop.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-amber-400 shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tradeoffs */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-amber-300">Operational Trade-off: </strong>
                    {playbook.options[selectedOptionIndex].tradeoffs}
                  </div>
                </div>
              )}

              {/* Grounded Constraints Check */}
              <div className="p-3 bg-[#0A0E17] rounded-xl border border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Grounding Guardrails Enforced:</span>
                </div>
                {playbook.groundedConstraintsAcknowledged.map((gc, gcIdx) => (
                  <div key={gcIdx} className="text-slate-400 pl-5">
                    • {gc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#121826] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Intelligence Engine: {engineUsed || 'Gemini 3.8 Flash'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Playbook
          </button>
        </div>
      </div>
    </div>
  );
};
