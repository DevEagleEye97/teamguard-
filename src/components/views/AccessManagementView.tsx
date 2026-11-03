import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Search, 
  Filter, 
  CheckCircle2, 
  User, 
  MapPin,
  Clock
} from 'lucide-react';
import { AccessAuditRecord } from '../../types';

interface AccessManagementViewProps {
  accessLogs: AccessAuditRecord[];
}

export const AccessManagementView: React.FC<AccessManagementViewProps> = ({
  accessLogs,
}) => {
  const [search, setSearch] = useState('');
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);

  const filtered = accessLogs.filter(log => {
    if (anomaliesOnly && !log.anomalyFlag) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.principal.toLowerCase().includes(q) ||
        log.targetAsset.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#C6A85E]" />
            <span>Access Management & Privileged Credential Governance</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Audit trail for administrative database roles, ERP service accounts, and third-party supplier access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnomaliesOnly(!anomaliesOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              anomaliesOnly
                ? 'bg-[#B83A3A]/20 text-[#B83A3A] border-[#B83A3A] font-semibold'
                : 'bg-[#101418] text-[#A5ADB5] border-[#303940] hover:text-[#F4F0E7]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Show Anomalies Only</span>
          </button>
        </div>
      </div>

      {/* Access Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-[#303940] bg-[#1A2228]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#151B20] border-b border-[#303940] text-[10px] font-semibold text-[#A5ADB5] uppercase tracking-wider font-mono">
              <th className="py-2.5 px-3">Timestamp (IST)</th>
              <th className="py-2.5 px-3">Principal (Account)</th>
              <th className="py-2.5 px-3">Role Assigned</th>
              <th className="py-2.5 px-3">Target Asset</th>
              <th className="py-2.5 px-3">Operation / Action</th>
              <th className="py-2.5 px-3">Client IP & Location</th>
              <th className="py-2.5 px-3">Authentication Method</th>
              <th className="py-2.5 px-3 text-right">Anomaly Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#303940]/60 bg-[#101418]/60">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-[#151B20] transition-colors">
                <td className="py-3 px-3 font-mono text-[10px] text-[#A5ADB5]">
                  {log.timestamp}
                </td>
                <td className="py-3 px-3">
                  <div className="font-mono font-semibold text-[#F4F0E7]">{log.principal}</div>
                </td>
                <td className="py-3 px-3 text-[11px] text-[#A5ADB5]">
                  {log.role}
                </td>
                <td className="py-3 px-3 font-semibold text-[#F4F0E7]">
                  {log.targetAsset}
                </td>
                <td className="py-3 px-3 font-mono text-[#C6A85E]">
                  {log.action}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-[#A5ADB5]">
                  <div>{log.ipAddress}</div>
                  <div className="text-[10px] text-[#A5ADB5]">{log.location}</div>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    log.authMethod === 'MFA_FIDO2' 
                      ? 'text-[#3D8255] bg-[#3D8255]/15 border-[#3D8255]/30' 
                      : log.authMethod === 'MUTUAL_TLS'
                      ? 'text-[#C6A85E] bg-[#C6A85E]/15 border-[#C6A85E]/30'
                      : 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/30'
                  }`}>
                    {log.authMethod}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {log.anomalyFlag ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#B83A3A] bg-[#B83A3A]/15 px-2 py-0.5 rounded border border-[#B83A3A]/40">
                      <AlertTriangle className="w-3 h-3" />
                      Anomaly Flag
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#3D8255] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Authorized
                    </span>
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
