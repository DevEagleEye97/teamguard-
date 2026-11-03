import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  User, 
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  FileText
} from 'lucide-react';
import { SecurityIncident, IncidentStatus, SeverityLevel } from '../../types';

interface IncidentCenterViewProps {
  incidents: SecurityIncident[];
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onTriggerAiAnalysis: (title: string, details: string, asset: string) => void;
}

export const IncidentCenterView: React.FC<IncidentCenterViewProps> = ({
  incidents,
  onUpdateStatus,
  onTriggerAiAnalysis,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(incidents[0] || null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = incidents.filter(inc => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inc.incidentCode.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.affectedSystem.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40';
      case 'investigating':
        return 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40';
      case 'contained':
        return 'text-[#C6A85E] bg-[#C6A85E]/15 border-[#C6A85E]/40';
      case 'resolved':
        return 'text-[#3D8255] bg-[#3D8255]/15 border-[#3D8255]/40';
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40';
      case 'high':
        return 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40';
      default:
        return 'text-[#A5ADB5] bg-[#303940]/20 border-[#303940]';
    }
  };

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#B83A3A]" />
            <span>Security Incident Center & Triage Room</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Operational triage across Open, Investigating, Contained, and Resolved states with timeline forensics
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['all', 'open', 'investigating', 'contained', 'resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#101418] text-[#C6A85E] border border-[#303940] font-semibold'
                  : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Incident List & Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident List */}
        <div className="lg:col-span-1 space-y-2.5">
          {filtered.map(inc => {
            const isSelected = selectedIncident?.id === inc.id;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A2228] border-[#C6A85E] shadow-md'
                    : 'bg-[#151B20] border-[#303940] hover:border-[#46535D]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#C6A85E]">
                    {inc.incidentCode}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-[#F4F0E7] mt-1 line-clamp-2 leading-snug">
                  {inc.title}
                </h4>

                <div className="text-[11px] text-[#A5ADB5] mt-2 flex items-center justify-between font-mono border-t border-[#303940]/60 pt-2">
                  <span className="truncate max-w-[140px]">{inc.affectedSystem}</span>
                  <span>{inc.openedAt.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Incident Detail / Investigation Workspace */}
        {selectedIncident && (
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#303940] pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#C6A85E] bg-[#101418] px-2 py-0.5 rounded border border-[#303940]">
                      {selectedIncident.incidentCode}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge(selectedIncident.status)}`}>
                      Status: {selectedIncident.status}
                    </span>
                    <span className="text-[11px] text-[#A5ADB5] font-mono">
                      Opened: {selectedIncident.openedAt}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F4F0E7] mt-2">
                    {selectedIncident.title}
                  </h3>
                  <div className="text-xs text-[#A5ADB5] mt-1 font-mono">
                    Target: {selectedIncident.affectedSystem} • Source: {selectedIncident.detectionSource}
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1 bg-[#101418] p-1 rounded-lg border border-[#303940] shrink-0 text-xs">
                  {(['investigating', 'contained', 'resolved'] as IncidentStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(selectedIncident.id, st)}
                      className={`px-2 py-1 rounded text-[10px] font-mono capitalize transition-colors cursor-pointer ${
                        selectedIncident.status === st
                          ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940] font-bold'
                          : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Impact Card */}
              <div className="p-3 rounded-lg bg-[#151B20] border border-[#303940] text-xs">
                <span className="text-[#C6A85E] font-semibold text-[11px] uppercase tracking-wider block mb-1">
                  Operational & Business Impact:
                </span>
                <p className="text-[#F4F0E7] leading-relaxed">
                  {selectedIncident.businessImpact}
                </p>
              </div>

              {/* Mitigation Steps */}
              <div className="p-3.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs space-y-2">
                <span className="text-[#F4F0E7] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3D8255]" />
                  <span>Mandated Defensive Remediation Steps</span>
                </span>
                <ul className="space-y-1.5">
                  {selectedIncident.mitigationSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#F4F0E7]">
                      <span className="w-4 h-4 rounded-full bg-[#101418] border border-[#303940] flex items-center justify-center font-mono text-[9px] text-[#C6A85E] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Forensic Timeline */}
              <div className="p-3.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs space-y-2.5">
                <span className="text-[#F4F0E7] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C6A85E]" />
                  <span>Incident Forensics Timeline</span>
                </span>

                <div className="space-y-2 border-l border-[#303940] ml-2 pl-3">
                  {selectedIncident.timelineEvents.map((evt, eIdx) => (
                    <div key={eIdx} className="text-xs space-y-0.5 relative">
                      <div className="w-2 h-2 rounded-full bg-[#C6A85E] absolute -left-[17px] top-1"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#A5ADB5]">{evt.timestamp}</span>
                        <span className="text-[10px] text-[#C6A85E] font-medium">({evt.actor})</span>
                      </div>
                      <div className="text-[#F4F0E7] text-[11px]">
                        {evt.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#303940] flex items-center justify-between text-xs">
              <div className="text-[11px] text-[#A5ADB5] font-mono">
                Assigned: <strong className="text-[#F4F0E7]">{selectedIncident.assignedInvestigator}</strong>
              </div>

              <button
                onClick={() => onTriggerAiAnalysis(
                  selectedIncident.title,
                  selectedIncident.businessImpact,
                  selectedIncident.affectedSystem
                )}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C6A85E]/15 text-[#C6A85E] border border-[#C6A85E]/30 hover:bg-[#C6A85E]/25 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Root-Cause Explanation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
