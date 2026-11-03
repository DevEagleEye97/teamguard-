import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  Bug, 
  Building2, 
  Truck, 
  Flame, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers
} from 'lucide-react';
import { 
  DatabaseInstance, 
  DatabaseAuditEvent, 
  VulnerabilityFinding, 
  SecurityIncident, 
  Supplier, 
  Shipment, 
  NotificationItem 
} from '../../types';

interface OverviewDashboardViewProps {
  databases: DatabaseInstance[];
  auditEvents: DatabaseAuditEvent[];
  vulnerabilities: VulnerabilityFinding[];
  incidents: SecurityIncident[];
  suppliers: Supplier[];
  shipments: Shipment[];
  notifications: NotificationItem[];
  onNavigateTab: (tab: any) => void;
  onOpenEmailPreview: (notif: NotificationItem) => void;
}

export const OverviewDashboardView: React.FC<OverviewDashboardViewProps> = ({
  databases,
  auditEvents,
  vulnerabilities,
  incidents,
  suppliers,
  shipments,
  notifications,
  onNavigateTab,
  onOpenEmailPreview,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Metrics
  const criticalVulnerabilities = vulnerabilities.filter(v => v.severity === 'critical');
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating');
  const delayedShipments = shipments.filter(s => s.status === 'delayed' || s.status === 'critical_risk');
  const singleSourceSuppliers = suppliers.filter(s => s.isSingleSource);
  const totalFailedLogins = databases.reduce((sum, d) => sum + d.failedLoginCount24h, 0);

  // Security Posture Score
  const postureScore = 82; // 0-100 composite

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Seeded Data Notice Banner (Subtle & Restrained) */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs">
        <div className="flex items-center gap-2 text-[#A5ADB5]">
          <span className="w-2 h-2 rounded-full bg-[#C6A85E]"></span>
          <span className="font-medium text-[#F4F0E7]">Operational Environment:</span>
          <span>Seeded demonstration dataset (Apex Precision Manufacturing & Data Vault).</span>
        </div>
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]'
                  : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Posture Score */}
        <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940]">
          <div className="flex items-center justify-between text-xs text-[#A5ADB5]">
            <span>Security Posture Index</span>
            <ShieldCheck className="w-4 h-4 text-[#C6A85E]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[#F4F0E7]">{postureScore}</span>
            <span className="text-xs text-[#A5ADB5]">/ 100</span>
            <span className="text-[11px] text-[#3D8255] font-mono ml-auto">Good Posture</span>
          </div>
          <div className="w-full bg-[#101418] h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-[#C6A85E] h-full rounded-full" style={{ width: `${postureScore}%` }}></div>
          </div>
          <div className="text-[10px] text-[#A5ADB5] mt-2 flex items-center justify-between">
            <span>Audit Baseline: CIS v8</span>
            <span>2 Active Advisories</span>
          </div>
        </div>

        {/* Database Health */}
        <div 
          onClick={() => onNavigateTab('database_security')}
          className="p-4 rounded-xl bg-[#1A2228] border border-[#303940] hover:border-[#C6A85E]/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#A5ADB5]">
            <span>Protected Databases</span>
            <Database className="w-4 h-4 text-[#A5ADB5] group-hover:text-[#C6A85E]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[#F4F0E7]">{databases.length}</span>
            <span className="text-xs text-[#A5ADB5]">instances</span>
            <span className="text-[11px] text-[#C98A2C] font-mono ml-auto">1 Warning</span>
          </div>
          <div className="text-[11px] text-[#A5ADB5] mt-3 flex items-center justify-between border-t border-[#303940]/60 pt-2">
            <span>Failed Logins (24h):</span>
            <span className="font-mono text-[#C98A2C] font-semibold">{totalFailedLogins}</span>
          </div>
        </div>

        {/* Vulnerabilities & CVEs */}
        <div 
          onClick={() => onNavigateTab('threat_intelligence')}
          className="p-4 rounded-xl bg-[#1A2228] border border-[#303940] hover:border-[#C6A85E]/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#A5ADB5]">
            <span>Threat Intelligence</span>
            <Bug className="w-4 h-4 text-[#A5ADB5] group-hover:text-[#C6A85E]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[#B83A3A]">{criticalVulnerabilities.length}</span>
            <span className="text-xs text-[#A5ADB5]">critical CVEs</span>
            <span className="text-[11px] text-[#B83A3A] font-mono ml-auto">2 CISA KEV</span>
          </div>
          <div className="text-[11px] text-[#A5ADB5] mt-3 flex items-center justify-between border-t border-[#303940]/60 pt-2">
            <span>Total Tracked Findings:</span>
            <span className="font-mono text-[#F4F0E7]">{vulnerabilities.length} CVEs</span>
          </div>
        </div>

        {/* Operational Supply Chain Risk */}
        <div 
          onClick={() => onNavigateTab('supply_chain')}
          className="p-4 rounded-xl bg-[#1A2228] border border-[#303940] hover:border-[#C6A85E]/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#A5ADB5]">
            <span>Supply Chain Corridors</span>
            <Truck className="w-4 h-4 text-[#A5ADB5] group-hover:text-[#C6A85E]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[#C98A2C]">{delayedShipments.length}</span>
            <span className="text-xs text-[#A5ADB5]">delayed freights</span>
            <span className="text-[11px] text-[#A5ADB5] font-mono ml-auto">NH-48 Ghat</span>
          </div>
          <div className="text-[11px] text-[#A5ADB5] mt-3 flex items-center justify-between border-t border-[#303940]/60 pt-2">
            <span>Single-Source Vendors:</span>
            <span className="font-mono text-[#C98A2C] font-semibold">{singleSourceSuppliers.length}</span>
          </div>
        </div>
      </div>

      {/* Main Operational Split: Threat Timeline & Security Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Security Incidents & Threat Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Security Incidents Table */}
          <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#B83A3A]" />
                <h3 className="text-xs font-semibold text-[#F4F0E7]">
                  Active Security Incidents
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101418] text-[#A5ADB5] border border-[#303940]">
                  {openIncidents.length} Pending Resolution
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('incident_center')}
                className="text-xs text-[#C6A85E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Incident Center</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {incidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onNavigateTab('incident_center')}
                  className="p-3 rounded-lg bg-[#151B20] border border-[#303940] hover:border-[#C6A85E]/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#C6A85E]">
                        {inc.incidentCode}
                      </span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                        inc.severity === 'critical' ? 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40' : 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] text-[#A5ADB5] font-mono">
                        Status: <strong className="text-[#F4F0E7] capitalize">{inc.status}</strong>
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[#F4F0E7] mt-1">
                      {inc.title}
                    </div>
                    <div className="text-[11px] text-[#A5ADB5] mt-0.5 truncate max-w-md">
                      Asset: {inc.affectedSystem}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#A5ADB5] font-mono">Opened {inc.openedAt}</span>
                    <div className="text-[11px] text-[#C6A85E] mt-0.5">Assignee: {inc.assignedInvestigator.split(' ')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database & Access Audit Timeline */}
          <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C6A85E]" />
                <h3 className="text-xs font-semibold text-[#F4F0E7]">
                  Database Audit & Threat Activity Log
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('database_security')}
                className="text-xs text-[#C6A85E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All DB Events</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {auditEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-[#151B20] border border-[#303940] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                        event.severity === 'critical' ? 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40' : 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40'
                      }`}>
                        {event.eventType.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-[#F4F0E7] truncate">{event.databaseName}</span>
                      {event.anomalyFlag && (
                        <span className="text-[9px] font-mono text-[#B83A3A] bg-[#B83A3A]/10 px-1.5 py-0.2 rounded border border-[#B83A3A]/30">
                          Anomaly Flag
                        </span>
                      )}
                    </div>
                    {event.querySnippet && (
                      <div className="font-mono text-[10px] text-[#A5ADB5] mt-1 bg-[#101418] p-1.5 rounded truncate max-w-lg border border-[#303940]/40">
                        {event.querySnippet}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[#A5ADB5] font-mono">{event.timestamp.split(' ')[1]} IST</div>
                    <div className="text-[10px] text-[#A5ADB5] mt-0.5">User: {event.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Notification Feed & Supplier Risk Distribution */}
        <div className="space-y-4">
          {/* Notification Feed & Simulated Email Dispatches */}
          <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#F4F0E7] flex items-center gap-1.5">
                <span>Recent System Alerts</span>
                <span className="text-[10px] font-mono text-[#A5ADB5]">({notifications.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-xs text-[#C6A85E] hover:underline cursor-pointer"
              >
                Rules
              </button>
            </div>

            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className="p-2.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#C6A85E]">{notif.category}</span>
                    <span className="text-[10px] text-[#A5ADB5] font-mono">{notif.timestamp.split('(')[0]}</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#F4F0E7] leading-snug">
                    {notif.title}
                  </div>
                  {notif.emailSimulated && (
                    <div className="pt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-[#3D8255] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Email Simulated</span>
                      </span>
                      <button
                        onClick={() => onOpenEmailPreview(notif)}
                        className="text-[#C6A85E] hover:underline font-mono cursor-pointer"
                      >
                        Preview Dispatched Email
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Risk Distribution */}
          <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#F4F0E7] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C6A85E]" />
                <span>Supplier Risk Distribution</span>
              </h3>
              <button
                onClick={() => onNavigateTab('supplier_security')}
                className="text-xs text-[#C6A85E] hover:underline cursor-pointer"
              >
                Directory
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#A5ADB5]">
                <span>Low Risk (&gt;85 OTD & Security)</span>
                <span className="font-mono text-[#3D8255] font-bold">4 Vendors (50%)</span>
              </div>
              <div className="w-full bg-[#101418] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#3D8255] h-full" style={{ width: '50%' }}></div>
              </div>

              <div className="flex items-center justify-between text-[#A5ADB5] pt-1">
                <span>Moderate Risk (70-85 Score)</span>
                <span className="font-mono text-[#C98A2C] font-bold">2 Vendors (25%)</span>
              </div>
              <div className="w-full bg-[#101418] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#C98A2C] h-full" style={{ width: '25%' }}></div>
              </div>

              <div className="flex items-center justify-between text-[#A5ADB5] pt-1">
                <span>High Exposure (&lt;70 or Single Source)</span>
                <span className="font-mono text-[#B83A3A] font-bold">2 Vendors (25%)</span>
              </div>
              <div className="w-full bg-[#101418] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#B83A3A] h-full" style={{ width: '25%' }}></div>
              </div>

              <div className="p-2 rounded bg-[#151B20] border border-[#303940] mt-3 text-[11px] text-[#A5ADB5]">
                Suntech Braking (Chennai) and Bharat Electro-Sensors (BLR) flagged for single-source operational exposure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
