import { 
  DatabaseInstance, 
  DatabaseAuditEvent, 
  VulnerabilityFinding, 
  SbomPackage, 
  AccessAuditRecord, 
  SecurityIncident, 
  AlertRule, 
  NotificationItem 
} from '../types';

export const INITIAL_DATABASES: DatabaseInstance[] = [
  {
    id: 'db-01',
    name: 'Apex-Core-Production-Postgres',
    cluster: 'Chakan Manufacturing VPC (Primary DC)',
    engine: 'PostgreSQL',
    version: '16.2 Enterprise',
    host: 'pg-prod-01.chakan.apex.internal',
    port: 5432,
    status: 'healthy',
    connectionsActive: 148,
    connectionLimit: 250,
    failedLoginCount24h: 3,
    piiTablesCount: 18,
    backupStatus: 'completed',
    lastBackupTimestamp: '2026-11-02 02:00 IST',
    dataIntegrityStatus: 'verified',
    privilegedUsersCount: 4,
    encryptionAtRest: 'AES-256 (Cloud KMS)',
    sslEnforced: true,
    notes: 'Hosts ERP Bill of Materials, production schedules, and dispatch manifest records.'
  },
  {
    id: 'db-02',
    name: 'Apex-SAP-Connector-Oracle',
    cluster: 'Hybrid Gateway Subnet (Manesar Bridge)',
    engine: 'Oracle Enterprise',
    version: '19c Release 4',
    host: 'ora-sap-gw.apex.internal',
    port: 1521,
    status: 'warning',
    connectionsActive: 88,
    connectionLimit: 120,
    failedLoginCount24h: 29,
    piiTablesCount: 32,
    backupStatus: 'completed',
    lastBackupTimestamp: '2026-11-02 01:15 IST',
    dataIntegrityStatus: 'anomalous_checksum',
    privilegedUsersCount: 6,
    encryptionAtRest: 'AES-256 (Cloud KMS)',
    sslEnforced: true,
    notes: 'Synchronizes financial ledgers, vendor invoices, and purchase commitments with SAP S/4HANA.'
  },
  {
    id: 'db-03',
    name: 'Apex-SCM-Analytics-Mongo',
    cluster: 'AWS ap-south-1 (Mumbai Region)',
    engine: 'MongoDB',
    version: '7.0 Enterprise',
    host: 'mongo-scm-cluster.ap-south-1.internal',
    port: 27017,
    status: 'healthy',
    connectionsActive: 62,
    connectionLimit: 300,
    failedLoginCount24h: 0,
    piiTablesCount: 5,
    backupStatus: 'completed',
    lastBackupTimestamp: '2026-11-02 03:30 IST',
    dataIntegrityStatus: 'verified',
    privilegedUsersCount: 3,
    encryptionAtRest: 'AES-256 (Cloud KMS)',
    sslEnforced: true,
    notes: 'Telemetry aggregation store for GPS FASTag toll records and supplier scorecard models.'
  },
  {
    id: 'db-04',
    name: 'Apex-FASTag-Cache-Redis',
    cluster: 'Edge Gateway (Bhosari / Chakan Plant)',
    engine: 'Redis',
    version: '7.2.4 Standalone',
    host: 'redis-edge-cache.chakan.internal',
    port: 6379,
    status: 'healthy',
    connectionsActive: 210,
    connectionLimit: 1000,
    failedLoginCount24h: 1,
    piiTablesCount: 0,
    backupStatus: 'completed',
    lastBackupTimestamp: '2026-11-02 05:00 IST',
    dataIntegrityStatus: 'verified',
    privilegedUsersCount: 2,
    encryptionAtRest: 'AES-256 (Cloud KMS)',
    sslEnforced: true,
    notes: 'In-memory fast ingestion store for live highway shipment coordinate feeds.'
  }
];

export const INITIAL_DB_AUDIT_EVENTS: DatabaseAuditEvent[] = [
  {
    id: 'aud-01',
    timestamp: '2026-11-02 17:42:10 IST',
    databaseId: 'db-02',
    databaseName: 'Apex-SAP-Connector-Oracle',
    user: 'vendor_audit_svc',
    clientIp: '198.51.100.44 (External VPN)',
    eventType: 'failed_auth',
    querySnippet: 'AUTH REQUEST: ORA-01017 invalid username/password; logon denied (Attempt 29 of 30)',
    severity: 'high',
    riskScore: 84,
    status: 'flagged',
    anomalyFlag: true,
    anomalyReason: 'Brute force credential stuffing pattern detected from unlisted third-party IP address.'
  },
  {
    id: 'aud-02',
    timestamp: '2026-11-02 16:15:02 IST',
    databaseId: 'db-02',
    databaseName: 'Apex-SAP-Connector-Oracle',
    user: 'app_sync_worker',
    clientIp: '10.240.12.9 (Internal)',
    eventType: 'suspicious_query',
    querySnippet: 'SELECT supplier_tax_id, bank_account_no, swift_code FROM ap_supplier_master WHERE 1=1;',
    severity: 'critical',
    riskScore: 92,
    status: 'open',
    anomalyFlag: true,
    anomalyReason: 'Full unindexed table dump of supplier banking credentials without limit clause.'
  },
  {
    id: 'aud-03',
    timestamp: '2026-11-02 15:30:19 IST',
    databaseId: 'db-01',
    databaseName: 'Apex-Core-Production-Postgres',
    user: 'postgres_admin',
    clientIp: '10.240.4.15 (Bastion Host)',
    eventType: 'privilege_escalation',
    querySnippet: 'GRANT ALL PRIVILEGES ON SCHEMA manufacturing_ops TO role_mes_engineer;',
    severity: 'medium',
    riskScore: 58,
    status: 'reviewed',
    anomalyFlag: false,
    anomalyReason: 'Authorized role grant during scheduled change window #CHG-4910.'
  },
  {
    id: 'aud-04',
    timestamp: '2026-11-02 14:02:44 IST',
    databaseId: 'db-03',
    databaseName: 'Apex-SCM-Analytics-Mongo',
    user: 'analytics_ro',
    clientIp: '10.240.8.112 (Data Science Cluster)',
    eventType: 'connection_spike',
    querySnippet: 'db.shipment_telemetry.aggregate([{ $match: { delayHours: { $gt: 24 } } }])',
    severity: 'low',
    riskScore: 22,
    status: 'reviewed',
    anomalyFlag: false
  }
];

export const INITIAL_VULNERABILITIES: VulnerabilityFinding[] = [
  {
    id: 'vuln-01',
    cveId: 'CVE-2024-3094',
    title: 'XZ Utils Upstream Malicious Backdoor (liblzma)',
    affectedSoftware: 'liblzma (XZ Utils)',
    affectedComponent: 'Industrial Edge Linux Nodes (Chakan Plant)',
    packageVersion: '5.6.0',
    fixedInVersion: '5.6.1',
    severity: 'critical',
    cvssScore: 10.0,
    cisaKevStatus: true,
    epssScore: 0.892,
    publishedDate: '2024-03-29',
    affectedAssetType: 'scada_plc',
    remediationSteps: 'Downgrade or replace liblzma package to 5.4.x or verified 5.6.1; cycle SSH host certificates.',
    patchAvailable: true,
    vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    exploitedInWild: true
  },
  {
    id: 'vuln-02',
    cveId: 'CVE-2024-21626',
    title: 'runc Container Escape via Leaked File Descriptor',
    affectedSoftware: 'runc (containerd runtime)',
    affectedComponent: 'SCM Kubernetes Microservices Cluster',
    packageVersion: '1.1.11',
    fixedInVersion: '1.1.12',
    severity: 'high',
    cvssScore: 8.6,
    cisaKevStatus: true,
    epssScore: 0.620,
    publishedDate: '2024-01-31',
    affectedAssetType: 'api_gateway',
    remediationSteps: 'Upgrade container engine runc to >= 1.1.12 across all production worker nodes.',
    patchAvailable: true,
    vectorString: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H',
    exploitedInWild: true
  },
  {
    id: 'vuln-03',
    cveId: 'CVE-2023-38606',
    title: 'PostgreSQL Buffer Overread in Spatial Geometric Functions',
    affectedSoftware: 'PostgreSQL Server',
    affectedComponent: 'Apex-Core-Production-Postgres',
    packageVersion: '16.1',
    fixedInVersion: '16.2',
    severity: 'high',
    cvssScore: 8.8,
    cisaKevStatus: false,
    epssScore: 0.142,
    publishedDate: '2023-08-10',
    affectedAssetType: 'database',
    remediationSteps: 'Apply minor patch update PostgreSQL 16.2; restrict untrusted geometric function executions.',
    patchAvailable: true,
    vectorString: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
    exploitedInWild: false
  },
  {
    id: 'vuln-04',
    cveId: 'CVE-2023-48795',
    title: 'Terrapin SSH Protocol Prefix Truncation Attack',
    affectedSoftware: 'OpenSSH Server / Client',
    affectedComponent: 'SAP Connector Tunnel & EDI Gateway',
    packageVersion: 'OpenSSH 8.9p1',
    fixedInVersion: 'OpenSSH 9.6p1',
    severity: 'medium',
    cvssScore: 5.9,
    cisaKevStatus: false,
    epssScore: 0.082,
    publishedDate: '2023-12-18',
    affectedAssetType: 'erp_connector',
    remediationSteps: 'Disable ChaCha20-Poly1305 and CBC ciphers; upgrade OpenSSH to 9.6p1+ on gateway.',
    patchAvailable: true,
    vectorString: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N',
    exploitedInWild: false
  }
];

export const INITIAL_SBOM_PACKAGES: SbomPackage[] = [
  {
    id: 'pkg-01',
    name: 'express',
    version: '4.21.2',
    license: 'MIT',
    vulnerabilityCount: 0,
    directDependency: true,
    ecosystem: 'npm'
  },
  {
    id: 'pkg-02',
    name: '@google/genai',
    version: '2.25.0',
    license: 'Apache-2.0',
    vulnerabilityCount: 0,
    directDependency: true,
    ecosystem: 'npm'
  },
  {
    id: 'pkg-03',
    name: 'liblzma',
    version: '5.6.0',
    license: 'Public Domain',
    supplierAssociated: 'Industrial Gateway Firmware Vendor',
    vulnerabilityCount: 1,
    directDependency: false,
    ecosystem: 'debian'
  },
  {
    id: 'pkg-04',
    name: 'pg',
    version: '8.11.3',
    license: 'MIT',
    vulnerabilityCount: 0,
    directDependency: true,
    ecosystem: 'npm'
  },
  {
    id: 'pkg-05',
    name: 'runc',
    version: '1.1.11',
    license: 'Apache-2.0',
    supplierAssociated: 'Container Engine Subsystem',
    vulnerabilityCount: 1,
    directDependency: false,
    ecosystem: 'golang'
  }
];

export const INITIAL_ACCESS_LOGS: AccessAuditRecord[] = [
  {
    id: 'acc-01',
    timestamp: '2026-11-02 18:22:45 IST',
    principal: 'r.deshmukh@mfc-castings.co.in',
    role: 'Third-Party Vendor Auditor',
    targetAsset: 'Supplier Portal / PO Manifests',
    action: 'SELECT',
    ipAddress: '103.24.120.18',
    location: 'Pune, Maharashtra',
    authMethod: 'MFA_FIDO2',
    anomalyFlag: false
  },
  {
    id: 'acc-02',
    timestamp: '2026-11-02 17:42:10 IST',
    principal: 'vendor_audit_svc',
    role: 'Third-Party Vendor Auditor',
    targetAsset: 'Apex-SAP-Connector-Oracle',
    action: 'FAILED LOGIN',
    ipAddress: '198.51.100.44',
    location: 'Unknown (External Proxy)',
    authMethod: 'PASSWORD_ONLY',
    anomalyFlag: true,
    anomalyReason: 'Multiple rapid password failures from unauthorized subnet.'
  },
  {
    id: 'acc-03',
    timestamp: '2026-11-02 16:45:00 IST',
    principal: 'secops_lead@apex.co.in',
    role: 'SecOps Analyst',
    targetAsset: 'Database Audit Vault',
    action: 'CONFIG UPDATE',
    ipAddress: '10.240.2.14',
    location: 'Chakan HQ',
    authMethod: 'MFA_FIDO2',
    anomalyFlag: false
  },
  {
    id: 'acc-04',
    timestamp: '2026-11-02 16:15:02 IST',
    principal: 'app_sync_worker',
    role: 'ERP Service Account',
    targetAsset: 'Apex-SAP-Connector-Oracle',
    action: 'SELECT',
    ipAddress: '10.240.12.9',
    location: 'Internal App Subnet',
    authMethod: 'MUTUAL_TLS',
    anomalyFlag: true,
    anomalyReason: 'Unbounded SELECT query on PII supplier banking records.'
  }
];

export const INITIAL_SECURITY_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-01',
    incidentCode: 'SEC-2026-091',
    title: 'Credential Stuffing Anomaly on SAP Connector Oracle Database',
    severity: 'high',
    status: 'investigating',
    detectionSource: 'db_audit_agent',
    affectedSystem: 'Apex-SAP-Connector-Oracle (Port 1521)',
    businessImpact: 'Threat to ERP purchase commitments and banking confidentiality; risk of database denial-of-service.',
    openedAt: '2026-11-02 17:45 IST',
    assignedInvestigator: 'K. Sunder (Principal SecOps Analyst)',
    mitigationSteps: [
      'Quarantine IP 198.51.100.44 at perimeter firewall gateway.',
      'Temporarily disable account vendor_audit_svc pending password rotation.',
      'Enforce Mutual TLS certificates on Oracle TNS listener port.'
    ],
    timelineEvents: [
      {
        timestamp: '17:42 IST',
        note: 'Threshold of 25 failed authentications breached within 5-minute rolling window.',
        actor: 'TrustGuard Audit Daemon'
      },
      {
        timestamp: '17:45 IST',
        note: 'Automated high-priority alert dispatched to SecOps on-call via In-App and Email.',
        actor: 'Notification Engine'
      },
      {
        timestamp: '17:52 IST',
        note: 'Investigator initiated live packet inspection on Manesar gateway.',
        actor: 'K. Sunder'
      }
    ],
    resolutionNotes: 'Investigation active. Perimeter firewall block rule applied.'
  },
  {
    id: 'inc-02',
    incidentCode: 'SEC-2026-088',
    title: 'Unbounded Supplier Banking Data Query Detected on ERP Worker Account',
    severity: 'critical',
    status: 'contained',
    detectionSource: 'db_audit_agent',
    affectedSystem: 'Oracle ERP Schema: AP_SUPPLIER_MASTER',
    businessImpact: 'Potential exfiltration of GSTIN and bank details for 8 contracted MSME suppliers.',
    openedAt: '2026-11-02 16:18 IST',
    assignedInvestigator: 'A. Kulkarni (Database Security Lead)',
    mitigationSteps: [
      'Revoked SELECT ANY TABLE privilege from role_sync_worker.',
      'Restricted queries to parameterized views with mandatory LIMIT 100.',
      'Verified zero external outbound egress data transfers during query execution window.'
    ],
    timelineEvents: [
      {
        timestamp: '16:15 IST',
        note: 'Anomaly engine flagged SELECT * on table with 32 PII columns.',
        actor: 'TrustGuard Query Analyzer'
      },
      {
        timestamp: '16:20 IST',
        note: 'Containment script killed active session PID #8912.',
        actor: 'A. Kulkarni'
      }
    ],
    resolutionNotes: 'Database session terminated. Service account credentials refreshed.'
  },
  {
    id: 'inc-03',
    incidentCode: 'SEC-2026-074',
    title: 'CISA KEV Vulnerability Flag: Upstream XZ Backdoor (CVE-2024-3094)',
    severity: 'critical',
    status: 'resolved',
    detectionSource: 'cve_monitor',
    affectedSystem: 'Chakan Industrial Edge Gateways (Firmware build v4.2)',
    businessImpact: 'Prevented remote pre-auth code execution risk across plant automation floor.',
    openedAt: '2026-11-01 10:00 IST',
    assignedInvestigator: 'V. Sharma (Embedded Systems SecOps)',
    mitigationSteps: [
      'Pushed emergency firmware patch replacing vulnerable liblzma with verified build v5.6.1.',
      'Regenerated plant TLS device certificates and audited binary checksums.'
    ],
    timelineEvents: [
      {
        timestamp: '10:00 IST',
        note: 'SBOM scanner detected liblzma 5.6.0 in firmware container image.',
        actor: 'SBOM Scanner'
      },
      {
        timestamp: '11:30 IST',
        note: 'Hotfix verified in staging test harness and deployed across all 12 edge nodes.',
        actor: 'V. Sharma'
      },
      {
        timestamp: '12:15 IST',
        note: 'Incident marked Resolved following clean integrity scan.',
        actor: 'V. Sharma'
      }
    ],
    resolutionNotes: 'Successfully patched and verified clean across all Chakan factory nodes.'
  }
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-01',
    name: 'Critical Shipment Delay Alert',
    category: 'shipment_delay',
    description: 'Trigger notification when in-transit delay on any commercial highway corridor exceeds set hours.',
    metric: 'shipment_delay_hours',
    operator: '>',
    threshold: 24,
    severity: 'critical',
    channels: {
      inApp: true,
      email: true,
      emailRecipients: ['logistics-control@apex.co.in', 'ciso-alerts@apex.co.in']
    },
    isEnabled: true,
    lastTriggered: '2026-11-02 16:45 IST',
    triggerCount: 3
  },
  {
    id: 'rule-02',
    name: 'Supplier Reliability Degradation',
    category: 'supplier_risk',
    description: 'Alert procurement leadership if any Tier-1 supplier composite reliability index drops below threshold.',
    metric: 'supplier_risk_score',
    operator: '<',
    threshold: 75,
    severity: 'high',
    channels: {
      inApp: true,
      email: true,
      emailRecipients: ['procurement-audit@apex.co.in']
    },
    isEnabled: true,
    lastTriggered: '2026-11-02 14:10 IST',
    triggerCount: 2
  },
  {
    id: 'rule-03',
    name: 'Critical Assembly Buffer Stockout Warning',
    category: 'inventory_stockout',
    description: 'Alert plant manager when Days of Inventory Cover (DOI) on assembly critical path falls under safe threshold.',
    metric: 'inventory_days_cover',
    operator: '<',
    threshold: 3,
    severity: 'critical',
    channels: {
      inApp: true,
      email: true,
      emailRecipients: ['plant-manager.chakan@apex.co.in', 'assembly-leads@apex.co.in']
    },
    isEnabled: true,
    lastTriggered: '2026-11-02 18:00 IST',
    triggerCount: 2
  },
  {
    id: 'rule-04',
    name: 'Database Failed Authentication Surge',
    category: 'database_threat',
    description: 'Alert SecOps immediately when failed login attempts in 24 hours breach threshold on production databases.',
    metric: 'db_failed_logins_24h',
    operator: '>=',
    threshold: 20,
    severity: 'high',
    channels: {
      inApp: true,
      email: true,
      emailRecipients: ['secops-oncall@apex.co.in']
    },
    isEnabled: true,
    lastTriggered: '2026-11-02 17:45 IST',
    triggerCount: 1
  },
  {
    id: 'rule-05',
    name: 'Critical CVE in Production Dependency / CISA KEV',
    category: 'cve_vulnerability',
    description: 'Trigger immediate emergency advisory if newly identified vulnerability has CVSS >= threshold or active exploit.',
    metric: 'cve_cvss_threshold',
    operator: '>=',
    threshold: 9.0,
    severity: 'critical',
    channels: {
      inApp: true,
      email: true,
      emailRecipients: ['ciso-office@apex.co.in', 'secops-oncall@apex.co.in']
    },
    isEnabled: true,
    lastTriggered: '2026-11-01 10:05 IST',
    triggerCount: 1
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    ruleId: 'rule-01',
    title: 'Shipment #TG-IN-8841 Delay Exceeded 24h Threshold (72h Current)',
    message: 'Raw aluminum billet consignment from Nhava Sheva (JNPT) stalled at NH-48 Khandala Ghat due to monsoon rockfall.',
    severity: 'critical',
    category: 'Shipment Delay',
    timestamp: '18:45 IST (15 mins ago)',
    read: false,
    emailSimulated: true,
    emailRecipient: 'logistics-control@apex.co.in',
    entityType: 'shipment',
    entityId: 'shp-101',
    emailDetails: {
      subject: '[CRITICAL ALERT] TrustGuard: Shipment #TG-IN-8841 Delay Threshold Breached',
      recipient: 'logistics-control@apex.co.in',
      sentAt: '2026-11-02 18:45 IST',
      body: `TrustGuard Intelligent Alerting System

Event: Shipment Delay Threshold Exceeded
Rule: Critical Shipment Delay Alert (> 24 Hours)
Current Delay: 72 Hours
Carrier: VRL Logistics Heavy Freight
Tracking No: TG-IN-8841-EXP
e-Way Bill: 5310 9924 8104
Location: Khopoli Toll Plaza (NH-48 Khandala Ghat)
Affected Product: Al-Si-Mg Structural Alloy Billets (TG-RAW-ALU-06)
Remaining Buffer Cover: 3.9 Days at Chakan Foundry

Recommended Action:
Launch Gemini Mitigation Playbook to authorize express LCV feeder re-routing or activate Gujarat-Sanand backup supplier.`
    }
  },
  {
    id: 'notif-02',
    ruleId: 'rule-04',
    title: 'Database Failed Login Surge on Oracle SAP Connector (29 Attempts)',
    message: 'Breached threshold of 20 failed logins in 24 hours. Client IP 198.51.100.44 flagged for potential credential stuffing.',
    severity: 'high',
    category: 'Database Security',
    timestamp: '17:45 IST (1 hour ago)',
    read: false,
    emailSimulated: true,
    emailRecipient: 'secops-oncall@apex.co.in',
    entityType: 'database',
    entityId: 'db-02',
    emailDetails: {
      subject: '[SECURITY ALERT] TrustGuard: Database Authentication Anomaly Breached',
      recipient: 'secops-oncall@apex.co.in',
      sentAt: '2026-11-02 17:45 IST',
      body: `TrustGuard Database Security Daemon

Target Database: Apex-SAP-Connector-Oracle
Host: ora-sap-gw.apex.internal:1521
Breached Metric: db_failed_logins_24h (Count: 29, Threshold: 20)
Offending Client IP: 198.51.100.44
Target Account: vendor_audit_svc

Investigation Status:
Incident #SEC-2026-091 created automatically. Perimeter firewall quarantine initiated.`
    }
  },
  {
    id: 'notif-03',
    ruleId: 'rule-03',
    title: 'Imminent Stockout Warning: Speed Sensor IC (1.5 Days Cover Left)',
    message: 'Silicon sensor inventory at Chakan plant is down to 140 units. Buffer cover fell below threshold of 3.0 days.',
    severity: 'critical',
    category: 'Inventory Intelligence',
    timestamp: '18:00 IST (1 hour ago)',
    read: false,
    emailSimulated: true,
    emailRecipient: 'plant-manager.chakan@apex.co.in',
    entityType: 'inventory',
    entityId: 'sku-02',
    emailDetails: {
      subject: '[INVENTORY ALERT] TrustGuard: Buffer Stockout Threshold Breached',
      recipient: 'plant-manager.chakan@apex.co.in',
      sentAt: '2026-11-02 18:00 IST',
      body: `TrustGuard Inventory Intelligence

Component: Hall-Effect High-Temp Speed Sensor IC (TG-ELEC-SEN-02)
Associated Line: Line 2 - Powertrain Electronics (Chakan Plant)
Current Stock: 140 Units
Daily Burn Rate: 90 Units/day
Days of Cover: 1.55 Days (Threshold: < 3.0 Days)

Vulnerability Context:
Primary supplier Bharat Electro-Sensors is single-sourced. Replacement shipment #TG-IN-7430-AIR is currently held at Bengaluru airport customs.`
    }
  },
  {
    id: 'notif-04',
    ruleId: 'rule-02',
    title: 'Supplier Risk Score Dropped: Suntech Hydraulic & Brake (64/100)',
    message: 'Reliability score fell below threshold of 75/100 due to Sriperumbudur facility inundation and lead time drift of +4.8 days.',
    severity: 'high',
    category: 'Supplier Risk',
    timestamp: '14:10 IST (4 hours ago)',
    read: true,
    emailSimulated: true,
    emailRecipient: 'procurement-audit@apex.co.in',
    entityType: 'supplier',
    entityId: 'sup-03',
    emailDetails: {
      subject: '[SUPPLIER ALERT] TrustGuard: Supplier Reliability Score Degradation',
      recipient: 'procurement-audit@apex.co.in',
      sentAt: '2026-11-02 14:10 IST',
      body: `TrustGuard Supplier Governance

Supplier: Suntech Hydraulic & Brake Calipers Ltd (SHB-CHN)
Cluster: Chennai-Sriperumbudur, Tamil Nadu
Current Reliability Score: 64 / 100 (Threshold: < 75)
On-Time Delivery: 72.8%
Lead Time Drift: +4.8 Days (Nominal 7d vs Actual 11.8d)
Financial Risk: High

Mitigation Option:
Activate pre-qualified secondary vendor Coimbatore Precision Hydraulics Works (CPH-CBE) to absorb 150 units.`
    }
  }
];
