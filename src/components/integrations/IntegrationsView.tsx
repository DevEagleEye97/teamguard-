import React, { useState } from 'react';
import { 
  Network, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { DEMO_METADATA } from '../../data/mockData';

interface IntegrationsViewProps {
  onResetDemoData: () => void;
  onInjectDisruption: () => void;
  isDisruptionInjected: boolean;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  onResetDemoData,
  onInjectDisruption,
  isDisruptionInjected,
}) => {
  const [lastSync, setLastSync] = useState(DEMO_METADATA.lastSyncedTimestamp);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST (Simulated)');
      setIsSyncing(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3 gold-border-glow">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-300 text-sm">
            Simulated Integration Architecture Notice
          </h4>
          <p className="mt-1 leading-relaxed text-slate-300">
            In compliance with enterprise prototype evaluation guidelines, all external data streams 
            (including <strong>SAP S/4HANA</strong>, <strong>TallyPrime</strong>, and the Government of India's <strong>ULIP (Unified Logistics Interface Platform)</strong>) 
            are powered by realistic, high-fidelity mock data pipes. They are <strong>not</strong> live enterprise credentials.
          </p>
        </div>
      </div>

      {/* Integration Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connector 1: SAP S/4HANA */}
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">SAP S/4HANA ERP</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Simulated Sandbox
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Provides Purchase Order commitments, Bill of Materials (BOM) hierarchy, and central warehouse safety stock rules.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Protocol:</span>
                <span className="font-mono text-slate-200">OData v4 REST (Mock)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sync Interval:</span>
                <span className="font-mono text-slate-200">15 mins (Simulated)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mock Pipe Active
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500">
              Mock Target: https://sap-mock.internal/api/s4/procurement
            </span>
          </div>
        </div>

        {/* Connector 2: TallyPrime */}
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">TallyPrime Connector</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Simulated XML Gateway
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Synchronizes vendor payment terms (30/45/60 days), outstanding MSME invoices, and local raw material purchase ledgers.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Protocol:</span>
                <span className="font-mono text-slate-200">XML ODBC Interface (Mock)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MSME Audits:</span>
                <span className="font-mono text-slate-200">Enabled (45-day rule)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mock Pipe Active
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500">
              Mock Target: localhost:9000/tally-xml-proxy (Simulated)
            </span>
          </div>
        </div>

        {/* Connector 3: ULIP & e-Way Bill */}
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">ULIP / FASTag & e-Way</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Simulated Telemetry
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unified Logistics Interface Platform (ULIP) simulator: synthesizes NHAI FASTag toll records and GST e-Way bill Part-B movements.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Gateway:</span>
                <span className="font-mono text-slate-200">NIC Logistics API (Mock)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>FASTag Toll Pings:</span>
                <span className="font-mono text-slate-200">12 Plazas Tracked</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Telemetry Synced
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500">
              Mock Target: api.ulip.gov.in/v1.0/toll-tracking (Simulated)
            </span>
          </div>
        </div>
      </div>

      {/* Demonstration Controls & Data Management */}
      <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-5">
        <h3 className="text-sm font-bold text-white tracking-wide mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-amber-400" />
          <span>Demo Data Management & Disruption Injection</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Control the simulated environment to test how TrustGuard detects sudden supply shocks and evaluates risk.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#141B29] border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 transition-colors cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Connectors...' : 'Simulate ERP Sync'}</span>
          </button>

          <button
            onClick={onResetDemoData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Restore Default Master Data
          </button>

          <div className="text-xs text-slate-500 font-mono ml-auto">
            Last Sync: {lastSync}
          </div>
        </div>
      </div>
    </div>
  );
};
