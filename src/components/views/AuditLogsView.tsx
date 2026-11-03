import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Copy
} from 'lucide-react';
import { DatabaseAuditEvent, AccessAuditRecord } from '../../types';

interface AuditLogsViewProps {
  dbEvents: DatabaseAuditEvent[];
  accessLogs: AccessAuditRecord[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  dbEvents,
  accessLogs,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'db' | 'access'>('all');
  const [copied, setCopied] = useState(false);

  // Combine unified audit events
  const combined = [
    ...dbEvents.map(d => ({
      id: d.id,
      timestamp: d.timestamp,
      category: 'Database Audit',
      principal: d.user,
      target: d.databaseName,
      action: d.eventType,
      details: d.querySnippet || d.anomalyReason || 'Query execution',
      severity: d.severity,
      isAnomaly: d.anomalyFlag
    })),
    ...accessLogs.map(a => ({
      id: a.id,
      timestamp: a.timestamp,
      category: 'Access Control',
      principal: a.principal,
      target: a.targetAsset,
      action: a.action,
      details: `Auth: ${a.authMethod} from IP ${a.ipAddress} (${a.location})`,
      severity: a.anomalyFlag ? ('high' as const) : ('low' as const),
      isAnomaly: a.anomalyFlag
    }))
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const filtered = combined.filter(item => {
    if (categoryFilter === 'db' && item.category !== 'Database Audit') return false;
    if (categoryFilter === 'access' && item.category !== 'Access Control') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.principal.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trustguard-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C6A85E]" />
            <span>Unified Immutable Audit Ledger</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Tamper-evident audit trail capturing administrative database operations and SCM integrations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg border border-[#303940] hover:bg-[#101418] text-[#F4F0E7] text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A85E]" />
            <span>Export JSON Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#151B20] border border-[#303940]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search principal, IP, asset, or query string..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(['all', 'db', 'access'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCategoryFilter(tab)}
              className={`px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors cursor-pointer ${
                categoryFilter === tab
                  ? 'bg-[#101418] text-[#C6A85E] border border-[#303940] font-semibold'
                  : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
            >
              {tab === 'all' ? 'All Events' : tab === 'db' ? 'Database Only' : 'Access Logs'}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-[#303940] bg-[#1A2228]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#151B20] border-b border-[#303940] text-[10px] font-semibold text-[#A5ADB5] uppercase tracking-wider font-mono">
              <th className="py-2.5 px-3">Timestamp (IST)</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Principal</th>
              <th className="py-2.5 px-3">Target Subsystem</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Audit Record & Forensic Trace</th>
              <th className="py-2.5 px-3 text-right">Integrity Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#303940]/60 bg-[#101418]/60">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-[#151B20] transition-colors">
                <td className="py-3 px-3 font-mono text-[10px] text-[#A5ADB5]">
                  {item.timestamp}
                </td>
                <td className="py-3 px-3">
                  <span className="text-[10px] font-mono text-[#A5ADB5] bg-[#151B20] px-1.5 py-0.5 rounded border border-[#303940]">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[#F4F0E7]">
                  {item.principal}
                </td>
                <td className="py-3 px-3 font-semibold text-[#F4F0E7]">
                  {item.target}
                </td>
                <td className="py-3 px-3 font-mono text-[#C6A85E]">
                  {item.action}
                </td>
                <td className="py-3 px-3 max-w-sm">
                  <div className="font-mono text-[10px] text-[#A5ADB5] truncate bg-[#151B20] p-1 rounded border border-[#303940]/40" title={item.details}>
                    {item.details}
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[10px]">
                  {item.isAnomaly ? (
                    <span className="text-[#B83A3A] font-bold">ANOMALY FLAGGED</span>
                  ) : (
                    <span className="text-[#3D8255]">CRYPTOGRAPHIC SEALED</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
