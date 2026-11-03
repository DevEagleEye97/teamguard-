import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  ExternalLink,
  Flame,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { RiskAlert, SeverityLevel } from '../../types';

interface AlertsStreamProps {
  alerts: RiskAlert[];
  onSelectEntity: (entityId: string, entityType: 'shipment' | 'supplier' | 'inventory' | 'database' | 'cve') => void;
  onLaunchCopilot: (contextText: string) => void;
}

export const AlertsStream: React.FC<AlertsStreamProps> = ({
  alerts,
  onSelectEntity,
  onLaunchCopilot,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity === 'all') return true;
    return a.severity === selectedSeverity;
  });

  const getSeverityStyle = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return {
          border: 'border-red-500/40 bg-red-950/30',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
          iconColor: 'text-red-400',
        };
      case 'high':
        return {
          border: 'border-amber-500/40 bg-amber-950/20',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconColor: 'text-amber-400',
        };
      case 'medium':
        return {
          border: 'border-yellow-600/30 bg-yellow-950/15',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          iconColor: 'text-yellow-400',
        };
      default:
        return {
          border: 'border-slate-800 bg-slate-900/40',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          iconColor: 'text-slate-400',
        };
    }
  };

  return (
    <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-4 lg:p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Supply Chain Risk Pulse
          </h3>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
        </div>

        {/* Severity filter buttons */}
        <div className="flex items-center gap-1 text-[11px]">
          {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-300 border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Automated anomaly detector tracking highway landslides, e-Way checks, and line-stop risks
      </p>

      {/* Alerts Feed */}
      <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
        {filteredAlerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition-all hover:border-amber-500/50 ${style.border}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    {alert.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-slate-100 mt-1">
                {alert.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                {alert.message}
              </p>

              {/* Action bar */}
              <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectEntity(alert.entityId, alert.entityType)}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  <span>Inspect {alert.entityType}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onLaunchCopilot(alert.title + ': ' + alert.message)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 hover:border-amber-500/30 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>AI Advisor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
