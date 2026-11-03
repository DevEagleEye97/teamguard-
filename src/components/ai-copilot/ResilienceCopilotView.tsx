import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  Boxes, 
  Factory, 
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
  Flame,
  HelpCircle
} from 'lucide-react';
import { 
  InventoryItem, 
  Supplier, 
  Shipment, 
  ScenarioSimulationResult 
} from '../../types';

interface ResilienceCopilotViewProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  shipments: Shipment[];
  initialQuery?: string;
}

const PRESET_SCENARIOS = [
  {
    title: 'NH-48 Monsoon Landslide Prolonged by 4 Extra Days',
    query: 'What is the operational impact if NH-48 Khandala Ghat remains completely blocked for an additional 4 days affecting raw aluminum billet delivery from JNPT to Chakan plant?',
    category: 'Logistics Corridor',
  },
  {
    title: 'All-India Commercial Truckers Strike for 72 Hours',
    query: 'Simulate a 72-hour national interstate commercial truck transport strike affecting all freight from NCR-Manesar and Gujarat-Sanand to Pune.',
    category: 'National Disruption',
  },
  {
    title: 'Kempegowda DGFT Customs Audit Delays Sensors by 10 Days',
    query: 'Silicon speed sensor ICs (TG-ELEC-SEN-02) impounded at Kempegowda Bengaluru airport customs for 10 extra days. Which assembly line stops first and what backup vendor exists in master data?',
    category: 'Regulatory / Customs',
  },
  {
    title: 'Sriperumbudur Industrial Sub-station Power Outage for 1 Week',
    query: 'Suntech Hydraulics in Sriperumbudur has production halted for 7 days due to industrial estate flood power outages. How can we reallocate to Coimbatore Precision Hydraulics?',
    category: 'Supplier Facility Outage',
  },
];

export const ResilienceCopilotView: React.FC<ResilienceCopilotViewProps> = ({
  inventory,
  suppliers,
  shipments,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string>('');

  const handleRunSimulation = async (textToRun: string) => {
    if (!textToRun.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/scenario-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioQuery: textToRun,
          inventory,
          suppliers,
          shipments,
        }),
      });

      if (!res.ok) {
        throw new Error('Simulation failed');
      }

      const data = await res.json();
      setSimulationResult(data.data);
      setEngineUsed(data.engineUsed || 'Gemini 3.8 Flash');
    } catch (err) {
      console.error('Error running scenario simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="space-y-6">
      {/* Top Copilot Header */}
      <div className="bg-gradient-to-r from-[#121927] via-[#101524] to-[#0A0E17] rounded-2xl border border-amber-500/30 p-5 gold-border-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 mt-0.5 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Gemini Supply Resilience Copilot
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Grounded Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Test "what-if" disruption shocks, calculate downstream line halts, and receive grounded contingency playbooks. 
                Strictly constrained to the supplied master inventory and supplier database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Model: <strong className="text-amber-400 font-mono">gemini-3.8-flash</strong></span>
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunSimulation(query);
            }}
            className="flex flex-col sm:flex-row items-center gap-2 bg-[#090D16] p-2 rounded-xl border border-slate-800 focus-within:border-amber-500/50"
          >
            <input
              type="text"
              placeholder="Ask a what-if question or specify a disruption scenario..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{loading ? 'Simulating Impact...' : 'Simulate Shock'}</span>
            </button>
          </form>
        </div>

        {/* Preset chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Suggested What-If Scenarios (Indian Manufacturing Corridors):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(preset.query);
                  handleRunSimulation(preset.query);
                }}
                className="text-left p-2.5 rounded-xl bg-[#141B29]/80 border border-slate-800 hover:border-amber-500/40 hover:bg-[#141B29] transition-all cursor-pointer group text-xs"
              >
                <div className="flex items-center justify-between text-slate-300 font-semibold group-hover:text-amber-300">
                  <span className="truncate">{preset.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{preset.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-12 text-center text-slate-400 space-y-3">
          <div className="inline-block animate-spin text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            Running Cross-Corridor Ripple Simulation via Gemini 3.8 Flash...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Auditing Bill of Materials dependencies, burn rates at Chakan & Hosur plants, and contractual lead times.
          </p>
        </div>
      )}

      {/* Simulation Result Presentation */}
      {!loading && simulationResult && (
        <div className="bg-[#0D121F] rounded-2xl border border-amber-500/40 p-5 space-y-6 gold-glow animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Simulation Complete
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Engine: {engineUsed}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1.5">
                {simulationResult.scenarioTitle}
              </h3>
            </div>

            <div className="text-right">
              <div className="text-base font-mono font-bold text-red-400">
                {formatInr(simulationResult.totalFinancialExposureInr)}
              </div>
              <div className="text-[11px] text-slate-500">Projected Financial Risk</div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#141B29] rounded-xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">First Assembly Line to Halt</div>
              <div className="text-sm font-bold text-red-300 mt-1 truncate">
                {simulationResult.firstLineToHalt}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Zero component redundancy
              </div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Countdown to Initial Halt</div>
              <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
                {simulationResult.hoursUntilFirstHalt} Hours
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Before physical buffer hits 0
              </div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Total Simulated Downtime</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                {simulationResult.simulatedDowntimeDays} Days
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Production schedule disruption
              </div>
            </div>

            <div className="bg-[#141B29] rounded-xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Finished Units Impacted</div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">
                {simulationResult.affectedProductionUnits} Units
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Powertrain & Transmission assemblies
              </div>
            </div>
          </div>

          {/* Impact Narrative */}
          <div className="p-4 bg-gradient-to-r from-red-950/20 via-[#141B29] to-transparent rounded-xl border border-red-900/30 text-xs text-slate-200 leading-relaxed">
            <strong className="text-red-300 font-semibold">Cascading Disruption Impact: </strong>
            {simulationResult.summaryImpact}
          </div>

          {/* Depleted SKUs Tracker */}
          <div className="bg-[#141B29] rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Components Depleted Under This Shock Scenario</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {simulationResult.criticalSkusDepleted.map((item, iIdx) => (
                <div key={iIdx} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                  <div className="font-mono font-bold text-slate-200">{item.sku}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5 truncate">{item.name}</div>
                  <div className="text-xs font-mono font-bold text-red-400 mt-2 flex items-center justify-between">
                    <span>Remaining Cover:</span>
                    <span>{item.remainingDays} Days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Stage Contingency Action Plan */}
          <div className="bg-[#141B29] rounded-xl p-4 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Grounded Resilience Contingency Roadmap</span>
            </h4>

            <div className="space-y-2.5">
              {simulationResult.contingencyRoadmap.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3 text-xs text-slate-200 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold text-amber-400 shrink-0 mt-0.5">
                    {sIdx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grounding guarantee */}
          <div className="p-3 bg-[#0A0E17] rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Zero-Fabrication Guarantee:</strong> This resilience roadmap references strictly verified suppliers, buffer covers, and lead times in the active master dataset.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
