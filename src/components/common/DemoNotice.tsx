import React from 'react';
import { Info, ShieldAlert, Sparkles } from 'lucide-react';

export const DemoNotice: React.FC = () => {
  return (
    <div className="bg-[#121824] border-b border-amber-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="font-semibold text-amber-300 tracking-wide uppercase text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
          Prototype Mode
        </span>
        <span className="text-slate-400">
          Realistic simulated dataset for Indian mid-market manufacturing. 
          <span className="hidden md:inline text-slate-500 ml-1">
            (SAP S/4HANA, TallyPrime, and ULIP Logistics Gateways are simulated demo feeds).
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800 text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Gemini 3.8 Flash AI Engine Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
          <Info className="w-3 h-3" />
          <span>Zero Hallucination Protocol Enforced</span>
        </div>
      </div>
    </div>
  );
};
