import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Lock, 
  Unlock, 
  HardDrive, 
  FileCode, 
  Key, 
  ExternalLink,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { DatabaseInstance, DatabaseAuditEvent, SeverityLevel } from '../../types';

interface DatabaseSecurityViewProps {
  databases: DatabaseInstance[];
  auditEvents: DatabaseAuditEvent[];
  onTriggerInspection: (db: DatabaseInstance) => void;
}

export const DatabaseSecurityView: React.FC<DatabaseSecurityViewProps> = ({
  databases,
  auditEvents,
  onTriggerInspection,
}) => {
  const [selectedDbFilter, setSelectedDbFilter] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeDbModal, setActiveDbModal] = useState<DatabaseInstance | null>(null);

  // Filtered audit events
  const filteredEvents = auditEvents.filter(event => {
    if (selectedDbFilter !== 'all' && event.databaseId !== selectedDbFilter) return false;
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false;
    if (selectedEventType !== 'all' && event.eventType !== selectedEventType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        event.databaseName.toLowerCase().includes(q) ||
        event.user.toLowerCase().includes(q) ||
        event.clientIp.toLowerCase().includes(q) ||
        (event.querySnippet && event.querySnippet.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: DatabaseInstance['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[#3D8255] bg-[#3D8255]/15 border border-[#3D8255]/30">
            <CheckCircle2 className="w-3 h-3" />
            Healthy
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[#C98A2C] bg-[#C98A2C]/15 border border-[#C98A2C]/30">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[#B83A3A] bg-[#B83A3A]/15 border border-[#B83A3A]/30">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </span>
        );
    }
  };

  const getIntegrityBadge = (status: DatabaseInstance['dataIntegrityStatus']) => {
    switch (status) {
      case 'verified':
        return <span className="text-[#3D8255] font-mono text-[11px]">Checksum Verified</span>;
      case 'anomalous_checksum':
        return <span className="text-[#B83A3A] font-mono text-[11px] font-semibold">Anomalous Checksum</span>;
      case 'scanning':
        return <span className="text-[#C6A85E] font-mono text-[11px]">Integrity Scan Active</span>;
    }
  };

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Notice Banner */}
      <div className="p-3 rounded-lg bg-[#151B20] border border-[#303940] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#A5ADB5]">
          <Info className="w-4 h-4 text-[#C6A85E] shrink-0" />
          <span>
            Database monitoring daemon inspecting connection limits, TLS enforcement, failed authentication surges, and suspicious SELECT/GRANT queries.
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#A5ADB5] bg-[#101418] px-2 py-0.5 rounded border border-[#303940] shrink-0">
          Simulated Agent Feeds Active
        </span>
      </div>

      {/* Database Inventory Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C6A85E]" />
            <span>Monitored Database Inventory ({databases.length} Instances)</span>
          </h3>
          <span className="text-[11px] font-mono text-[#A5ADB5]">
            Total Active Connections: {databases.reduce((sum, d) => sum + d.connectionsActive, 0)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {databases.map((db) => {
            const utilizationPct = Math.round((db.connectionsActive / db.connectionLimit) * 100);

            return (
              <div
                key={db.id}
                onClick={() => setActiveDbModal(db)}
                className="p-4 rounded-xl bg-[#1A2228] border border-[#303940] hover:border-[#C6A85E]/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] text-[#A5ADB5] bg-[#101418] px-1.5 py-0.5 rounded border border-[#303940]">
                      {db.engine}
                    </span>
                    {getStatusBadge(db.status)}
                  </div>

                  <h4 className="text-xs font-bold text-[#F4F0E7] mt-1 leading-snug">
                    {db.name}
                  </h4>
                  <div className="text-[10px] font-mono text-[#A5ADB5] mt-0.5 truncate">
                    {db.host}:{db.port}
                  </div>

                  {/* Utilization & Metrics */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#A5ADB5]">
                    <div className="flex justify-between text-[11px]">
                      <span>Connections:</span>
                      <span className="font-mono text-[#F4F0E7]">
                        {db.connectionsActive} / {db.connectionLimit} ({utilizationPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#101418] h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${utilizationPct > 80 ? 'bg-[#B83A3A]' : utilizationPct > 60 ? 'bg-[#C98A2C]' : 'bg-[#3D8255]'}`} 
                        style={{ width: `${utilizationPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] pt-1">
                      <span>Failed Logins (24h):</span>
                      <span className={`font-mono font-semibold ${db.failedLoginCount24h > 10 ? 'text-[#B83A3A]' : 'text-[#F4F0E7]'}`}>
                        {db.failedLoginCount24h}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span>Data Integrity:</span>
                      {getIntegrityBadge(db.dataIntegrityStatus)}
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span>Last Backup:</span>
                      <span className="font-mono text-[#A5ADB5] text-[10px]">{db.lastBackupTimestamp.split(' ')[1]} IST</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#303940]/60 flex items-center justify-between text-[10px] text-[#A5ADB5]">
                  <span className="flex items-center gap-1 text-[#3D8255]">
                    <Lock className="w-3 h-3" />
                    <span>{db.encryptionAtRest.split(' ')[0]}</span>
                  </span>
                  <span className="text-[#C6A85E] font-medium">Inspect Telemetry &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Audit Events & Query Anomaly Ledger */}
      <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940] space-y-4">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-[#F4F0E7] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#C6A85E]" />
              <span>Database Audit Events & Query Anomaly Ledger</span>
            </h3>
            <p className="text-[11px] text-[#A5ADB5] mt-0.5">
              Live audit events captured via database proxy triggers and TNS/pg_stat activity
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Database selector filter */}
            <select
              value={selectedDbFilter}
              onChange={(e) => setSelectedDbFilter(e.target.value)}
              className="bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1 text-[#F4F0E7] focus:outline-none"
            >
              <option value="all">All Databases</option>
              {databases.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Severity filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1 text-[#F4F0E7] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Event type filter */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1 text-[#F4F0E7] focus:outline-none"
            >
              <option value="all">All Event Types</option>
              <option value="failed_auth">Failed Auth</option>
              <option value="suspicious_query">Suspicious Query</option>
              <option value="privilege_escalation">Privilege Escalation</option>
              <option value="bulk_export">Bulk Export</option>
            </select>
          </div>
        </div>

        {/* Audit Events Table */}
        <div className="overflow-x-auto rounded-lg border border-[#303940]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#151B20] border-b border-[#303940] text-[10px] font-semibold text-[#A5ADB5] uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Timestamp (IST)</th>
                <th className="py-2.5 px-3">Target Database</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Principal & Client IP</th>
                <th className="py-2.5 px-3">Query Snippet / Anomaly Detail</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303940]/60 bg-[#101418]/50">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#151B20] transition-colors">
                  <td className="py-3 px-3 font-mono text-[10px] text-[#A5ADB5]">
                    {evt.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#F4F0E7]">
                    {evt.databaseName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono text-[#C6A85E] bg-[#151B20] px-1.5 py-0.5 rounded border border-[#303940]">
                      {evt.eventType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono font-medium text-[#F4F0E7]">{evt.user}</div>
                    <div className="text-[10px] text-[#A5ADB5] font-mono mt-0.5">{evt.clientIp}</div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    {evt.querySnippet && (
                      <div className="font-mono text-[10px] text-[#A5ADB5] bg-[#151B20] p-1 rounded truncate border border-[#303940]/50" title={evt.querySnippet}>
                        {evt.querySnippet}
                      </div>
                    )}
                    {evt.anomalyReason && (
                      <div className="text-[10px] text-[#B83A3A] mt-1 font-medium">
                        ⚠️ {evt.anomalyReason}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                      evt.severity === 'critical' 
                        ? 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40' 
                        : evt.severity === 'high' 
                        ? 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40' 
                        : 'text-[#C6A85E] bg-[#C6A85E]/15 border-[#C6A85E]/40'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#F4F0E7]">
                    <span className={evt.riskScore > 80 ? 'text-[#B83A3A]' : evt.riskScore > 50 ? 'text-[#C98A2C]' : 'text-[#3D8255]'}>
                      {evt.riskScore}
                    </span>
                    <span className="text-[10px] text-[#A5ADB5]">/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Detail Modal */}
      {activeDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#151B20] border border-[#303940] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C6A85E]" />
                <h3 className="text-sm font-semibold text-[#F4F0E7]">
                  {activeDbModal.name} Dossier
                </h3>
                {getStatusBadge(activeDbModal.status)}
              </div>
              <button
                onClick={() => setActiveDbModal(null)}
                className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#101418] p-3 rounded-lg border border-[#303940]">
                <div>
                  <span className="text-[#A5ADB5]">Cluster Subnet:</span>
                  <div className="font-semibold text-[#F4F0E7] mt-0.5">{activeDbModal.cluster}</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Engine / Version:</span>
                  <div className="font-mono text-[#F4F0E7] mt-0.5">{activeDbModal.engine} {activeDbModal.version}</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">PII Tables Monitored:</span>
                  <div className="font-mono text-[#C6A85E] font-bold mt-0.5">{activeDbModal.piiTablesCount} Tables</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Privileged Users:</span>
                  <div className="font-mono text-[#F4F0E7] mt-0.5">{activeDbModal.privilegedUsersCount} Accounts</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101418] border border-[#303940] space-y-1">
                <span className="text-[#A5ADB5]">Security & Operational Notes:</span>
                <p className="text-[#F4F0E7] leading-relaxed text-[11px]">
                  {activeDbModal.notes}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveDbModal(null)}
                  className="px-4 py-2 rounded-lg bg-[#303940] text-[#F4F0E7] hover:bg-[#46535D] transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
