import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar, MainNavTab } from './components/layout/AppSidebar';
import { WorkspaceFooter } from './components/layout/WorkspaceFooter';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicLandingView } from './components/public/PublicLandingView';
import { PublicFooter } from './components/public/PublicFooter';
import { AuthModals, AuthModalType } from './components/auth/AuthModals';
import { ErrorPagesView, ErrorCode } from './components/error/ErrorPagesView';

import { EmailNotificationModal } from './components/alerts/EmailNotificationModal';
import { MitigationModal } from './components/disruptions/MitigationModal';

// Views
import { OverviewDashboardView } from './components/views/OverviewDashboardView';
import { DatabaseSecurityView } from './components/views/DatabaseSecurityView';
import { ThreatIntelligenceView } from './components/views/ThreatIntelligenceView';
import { SupplierSecurityView } from './components/views/SupplierSecurityView';
import { SupplyChainView } from './components/views/SupplyChainView';
import { AccessManagementView } from './components/views/AccessManagementView';
import { IncidentCenterView } from './components/views/IncidentCenterView';
import { AiSecurityAssistantView } from './components/views/AiSecurityAssistantView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { AccountSettingsView } from './components/views/AccountSettingsView';

// Seeded Data
import { 
  INITIAL_SUPPLIERS, 
  INITIAL_INVENTORY, 
  INITIAL_SHIPMENTS, 
  INITIAL_DISRUPTIONS, 
  INITIAL_RISK_ALERTS 
} from './data/mockData';

import { 
  INITIAL_DATABASES, 
  INITIAL_DB_AUDIT_EVENTS, 
  INITIAL_VULNERABILITIES, 
  INITIAL_SBOM_PACKAGES, 
  INITIAL_ACCESS_LOGS, 
  INITIAL_SECURITY_INCIDENTS, 
  INITIAL_ALERT_RULES, 
  INITIAL_NOTIFICATIONS 
} from './data/securityData';

import { 
  Supplier, 
  InventoryItem, 
  Shipment, 
  DisruptionIncident, 
  RiskAlert, 
  ClusterRegion,
  DatabaseInstance,
  DatabaseAuditEvent,
  VulnerabilityFinding,
  SbomPackage,
  AccessAuditRecord,
  SecurityIncident,
  AlertRule,
  NotificationItem,
  IncidentStatus
} from './types';

export type ExtendedNavTab = MainNavTab | 'error_preview';

const TAB_LABELS: Record<ExtendedNavTab, string> = {
  overview: 'Security Overview',
  database_security: 'Database Security',
  threat_intelligence: 'Threat Intelligence',
  supplier_security: 'Supplier Security',
  supply_chain: 'Supply Chain Operations',
  access_management: 'Access Management',
  incident_center: 'Incident Center',
  ai_assistant: 'AI Security Assistant',
  audit_logs: 'Audit Logs',
  settings: 'Account & Security Settings',
  error_preview: 'Error & Fallback Diagnostics',
};

function TrustGuardMain() {
  const { isAuthenticated, login } = useAuth();

  // Mode: 'workspace' or 'public'
  const [viewMode, setViewMode] = useState<'workspace' | 'public'>('workspace');
  const [publicSection, setPublicSection] = useState('hero');

  // Auth Modals state
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  // Navigation
  const [currentTab, setCurrentTab] = useState<ExtendedNavTab>('overview');
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('Apex-Chakan');
  const [errorInitialCode, setErrorInitialCode] = useState<ErrorCode>('404');

  // Supply Chain State
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [disruptions, setDisruptions] = useState<DisruptionIncident[]>(INITIAL_DISRUPTIONS);
  const [alerts, setAlerts] = useState<RiskAlert[]>(INITIAL_RISK_ALERTS);
  const [selectedCluster, setSelectedCluster] = useState<ClusterRegion | 'All'>('All');

  // Security & Threat State
  const [databases, setDatabases] = useState<DatabaseInstance[]>(INITIAL_DATABASES);
  const [auditEvents, setAuditEvents] = useState<DatabaseAuditEvent[]>(INITIAL_DB_AUDIT_EVENTS);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityFinding[]>(INITIAL_VULNERABILITIES);
  const [sbomPackages, setSbomPackages] = useState<SbomPackage[]>(INITIAL_SBOM_PACKAGES);
  const [accessLogs, setAccessLogs] = useState<AccessAuditRecord[]>(INITIAL_ACCESS_LOGS);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_SECURITY_INCIDENTS);

  // Custom Alert Rules & Notifications State
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modals & Context Carriers
  const [activeEmailPreview, setActiveEmailPreview] = useState<NotificationItem | null>(null);
  const [activeMitigationShipment, setActiveMitigationShipment] = useState<Shipment | null>(null);
  const [aiAssistantTopic, setAiAssistantTopic] = useState<{ title: string; details: string; asset: string } | undefined>(undefined);

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Inspect notification item
  const handleSelectNotification = (notif: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setViewMode('workspace');
    if (notif.entityType === 'shipment') {
      setCurrentTab('supply_chain');
    } else if (notif.entityType === 'database') {
      setCurrentTab('database_security');
    } else if (notif.entityType === 'vulnerability') {
      setCurrentTab('threat_intelligence');
    } else if (notif.entityType === 'supplier') {
      setCurrentTab('supplier_security');
    } else if (notif.entityType === 'incident') {
      setCurrentTab('incident_center');
    }
  };

  // Incident status update
  const handleUpdateIncidentStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: newStatus,
          timelineEvents: [
            ...inc.timelineEvents,
            {
              timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST',
              note: `Investigation status changed to ${newStatus.toUpperCase()}`,
              actor: 'SecOps Analyst (R. Deshmukh)'
            }
          ]
        };
      }
      return inc;
    }));
  };

  // Custom Alert Rule Management
  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(r => r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const handleDeleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleAddNewRule = (newRule: AlertRule) => {
    setAlertRules(prev => [newRule, ...prev]);
  };

  // Immediate Test Trigger for Alert Rule with In-App & Simulated Email
  const handleTestTriggerRule = (rule: AlertRule) => {
    const timestampStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST (Simulated Trigger)';
    
    // Increment trigger count
    setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: timestampStr } : r));

    const emailRecipient = rule.channels.emailRecipients[0] || 'secops-oncall@apex.co.in';

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      ruleId: rule.id,
      title: `[Alert Triggered] ${rule.name}`,
      message: `Threshold criterion met: ${rule.metric} is ${rule.operator} ${rule.threshold}. Alert dispatched to configured notification channels.`,
      severity: rule.severity,
      category: rule.category.replace('_', ' ').toUpperCase(),
      timestamp: timestampStr,
      read: false,
      emailSimulated: rule.channels.email,
      emailRecipient,
      entityType: rule.category === 'shipment_delay' ? 'shipment' : rule.category === 'database_threat' ? 'database' : rule.category === 'cve_vulnerability' ? 'vulnerability' : 'supplier',
      entityId: rule.category === 'shipment_delay' ? 'shp-101' : rule.category === 'database_threat' ? 'db-02' : 'vuln-01',
      emailDetails: rule.channels.email ? {
        subject: `[ALERT TRIGGERED] TrustGuard: ${rule.name}`,
        recipient: emailRecipient,
        sentAt: timestampStr,
        body: `TrustGuard Intelligent Alerting Engine

Trigger Event: Custom Rule Condition Met
Rule Name: ${rule.name}
Condition: ${rule.metric} ${rule.operator} ${rule.threshold}
Severity: ${rule.severity.toUpperCase()}
Dispatch Channels: In-App Notification Center, Simulated SMTP Email

Asset Under Observation:
- Target Subsystem: Apex Operational Gateway
- Status: Dispatched to on-call recipient ${emailRecipient}
- Incident correlation: Automated telemetry record created in TrustGuard Audit Ledger.

Next Steps:
Open TrustGuard Security Operations Console to review live telemetry and execute mitigation.`
      } : undefined
    };

    setNotifications(prev => [newNotification, ...prev]);

    // If email simulation was enabled, open email preview immediately
    if (newNotification.emailDetails) {
      setActiveEmailPreview(newNotification);
    }
  };

  // Mitigation execution handler
  const handleExecuteMitigation = (shipmentId: string, actionTitle: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          mitigationInitiated: true,
          mitigationActionTaken: actionTitle,
          status: 'in_transit',
          delayHours: Math.max(4, Math.round(s.delayHours / 3)),
          delayReason: `[Mitigated]: ${actionTitle} authorized and actively executing.`,
        };
      }
      return s;
    }));

    const newAlert: RiskAlert = {
      id: `alt-${Date.now()}`,
      timestamp: 'Just now',
      severity: 'low',
      category: 'Corridor Congestion',
      title: `Mitigation Applied: ${actionTitle}`,
      message: `Shipment ${shipmentId} bypass authorization applied. Safe buffer restored.`,
      entityId: shipmentId,
      entityType: 'shipment',
      actionable: false,
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  // Quick navigation to AI Assistant with context
  const handleTriggerAiAnalysis = (title: string, details: string, asset: string) => {
    setAiAssistantTopic({ title, details, asset });
    setViewMode('workspace');
    setCurrentTab('ai_assistant');
  };

  const criticalIncidentCount = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const openAlertCount = alertRules.filter(r => r.isEnabled).length;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#C6A85E]/30 selection:text-[#F4F0E7]">
      {/* PUBLIC VIEW MODE */}
      {viewMode === 'public' && (
        <div className="flex-1 flex flex-col">
          <PublicHeader
            onOpenSignIn={() => setAuthModal('signin')}
            onOpenRegister={() => setAuthModal('register')}
            onSelectPublicSection={(sec) => setPublicSection(sec)}
            activePublicSection={publicSection}
          />

          <main className="flex-1">
            <PublicLandingView
              onEnterWorkspace={() => {
                if (!isAuthenticated) {
                  login('r.deshmukh@apex.co.in', 'ApexSecOps2025!').catch(console.error);
                }
                setViewMode('workspace');
              }}
              onOpenSignIn={() => setAuthModal('signin')}
              onOpenRegister={() => setAuthModal('register')}
              activeSection={publicSection}
            />
          </main>

          <PublicFooter
            onSelectPublicSection={(sec) => setPublicSection(sec)}
            onOpenSignIn={() => setAuthModal('signin')}
          />
        </div>
      )}

      {/* AUTHENTICATED WORKSPACE VIEW MODE */}
      {viewMode === 'workspace' && (
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Application Header */}
          <AppHeader
            currentTab={currentTab}
            tabLabel={TAB_LABELS[currentTab]}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onSelectNotification={handleSelectNotification}
            onOpenEmailPreview={(n) => setActiveEmailPreview(n)}
            onOpenSettings={(sec) => setCurrentTab('settings')}
            onOpenErrorSimulator={() => {
              setErrorInitialCode('404');
              setCurrentTab('error_preview');
            }}
            onOpenPublicSite={() => setViewMode('public')}
            selectedWorkspace={selectedWorkspace}
            onSelectWorkspace={setSelectedWorkspace}
            onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          />

          {/* Main Layout Body with Sidebar and Main Content */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Sidebar */}
            <AppSidebar
              currentTab={currentTab === 'error_preview' ? 'overview' : currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              isCompact={isCompactSidebar}
              onToggleCompact={() => setIsCompactSidebar(!isCompactSidebar)}
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              criticalIncidentCount={criticalIncidentCount}
              openAlertCount={openAlertCount}
            />

            {/* View Content Area */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--bg-main)]">
              <div className="max-w-[1550px] mx-auto space-y-6">
                {currentTab === 'overview' && (
                  <OverviewDashboardView
                    databases={databases}
                    auditEvents={auditEvents}
                    vulnerabilities={vulnerabilities}
                    incidents={incidents}
                    suppliers={suppliers}
                    shipments={shipments}
                    notifications={notifications}
                    onNavigateTab={setCurrentTab}
                    onOpenEmailPreview={(n) => setActiveEmailPreview(n)}
                  />
                )}

                {currentTab === 'database_security' && (
                  <DatabaseSecurityView
                    databases={databases}
                    auditEvents={auditEvents}
                    onTriggerInspection={(db) => {
                      handleTriggerAiAnalysis(`Audit Anomaly on ${db.name}`, `Connections: ${db.connectionsActive}, Failed Logins: ${db.failedLoginCount24h}`, db.name);
                    }}
                  />
                )}

                {currentTab === 'threat_intelligence' && (
                  <ThreatIntelligenceView
                    vulnerabilities={vulnerabilities}
                    sbomPackages={sbomPackages}
                    onTriggerAiAnalysis={handleTriggerAiAnalysis}
                  />
                )}

                {currentTab === 'supplier_security' && (
                  <SupplierSecurityView
                    suppliers={suppliers}
                    inventory={inventory}
                    shipments={shipments}
                    onTriggerSupplierAudit={(sup) => {
                      handleTriggerAiAnalysis(`Supplier Vulnerability: ${sup.name}`, `Reliability: ${sup.reliabilityScore}%, Lead Drift: +${sup.leadTimeDriftDays}d`, sup.name);
                    }}
                    onNavigateTab={setCurrentTab}
                  />
                )}

                {currentTab === 'supply_chain' && (
                  <SupplyChainView
                    shipments={shipments}
                    suppliers={suppliers}
                    inventory={inventory}
                    disruptions={disruptions}
                    alerts={alerts}
                    selectedCluster={selectedCluster}
                    onOpenMitigation={(shp) => setActiveMitigationShipment(shp)}
                    onSelectEntity={(entityId, type) => {
                      if (type === 'supplier') setCurrentTab('supplier_security');
                      else if (type === 'database') setCurrentTab('database_security');
                      else if (type === 'cve') setCurrentTab('threat_intelligence');
                    }}
                    onLaunchCopilot={(q) => {
                      handleTriggerAiAnalysis('Supply Chain Shock Simulation', q, 'Corridor Logistics');
                    }}
                    onExecuteMitigation={handleExecuteMitigation}
                  />
                )}

                {currentTab === 'access_management' && (
                  <AccessManagementView
                    accessLogs={accessLogs}
                  />
                )}

                {currentTab === 'incident_center' && (
                  <IncidentCenterView
                    incidents={incidents}
                    onUpdateStatus={handleUpdateIncidentStatus}
                    onTriggerAiAnalysis={handleTriggerAiAnalysis}
                  />
                )}

                {currentTab === 'ai_assistant' && (
                  <AiSecurityAssistantView
                    initialTopic={aiAssistantTopic}
                  />
                )}

                {currentTab === 'audit_logs' && (
                  <AuditLogsView
                    dbEvents={auditEvents}
                    accessLogs={accessLogs}
                  />
                )}

                {currentTab === 'settings' && (
                  <AccountSettingsView
                    alertRules={alertRules}
                    onToggleRule={handleToggleRule}
                    onDeleteRule={handleDeleteRule}
                    onAddNewRule={handleAddNewRule}
                    onTestTriggerRule={handleTestTriggerRule}
                    notifications={notifications}
                    onOpenEmailPreview={(n) => setActiveEmailPreview(n)}
                  />
                )}

                {currentTab === 'error_preview' && (
                  <ErrorPagesView
                    initialCode={errorInitialCode}
                    onNavigateHome={() => setCurrentTab('overview')}
                    onRetry={() => {
                      alert('Retry triggered successfully. Diagnostic pipeline active.');
                    }}
                  />
                )}
              </div>
            </main>
          </div>

          {/* Minimal Authenticated Workspace Footer */}
          <WorkspaceFooter
            onOpenHelpOrError={() => {
              setErrorInitialCode('500');
              setCurrentTab('error_preview');
            }}
          />
        </div>
      )}

      {/* Auth Modals (Sign In, Register, Forgot Password, Reset Password) */}
      <AuthModals
        modalType={authModal}
        onClose={() => setAuthModal(null)}
        onSwitchModal={(type) => setAuthModal(type)}
        onSuccessAuthenticated={() => {
          setAuthModal(null);
          setViewMode('workspace');
        }}
      />

      {/* Simulated Email Notification Inspector Modal */}
      {activeEmailPreview && (
        <EmailNotificationModal
          notification={activeEmailPreview}
          onClose={() => setActiveEmailPreview(null)}
        />
      )}

      {/* Supply Chain Mitigation Playbook Modal */}
      {activeMitigationShipment && (
        <MitigationModal
          shipment={activeMitigationShipment}
          sku={inventory.find(i => activeMitigationShipment.skuIds.includes(i.id))}
          primarySupplier={suppliers.find(s => s.id === activeMitigationShipment.supplierId)}
          availableAlternateSuppliers={
            suppliers.find(s => s.id === activeMitigationShipment.supplierId)?.alternateSupplierIds
              ? suppliers.filter(s => 
                  suppliers.find(sp => sp.id === activeMitigationShipment.supplierId)?.alternateSupplierIds.includes(s.id)
                )
              : []
          }
          onClose={() => setActiveMitigationShipment(null)}
          onExecuteAction={handleExecuteMitigation}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TrustGuardMain />
      </AuthProvider>
    </ThemeProvider>
  );
}
