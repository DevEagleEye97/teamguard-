export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ShipmentStatus = 
  | 'on_schedule' 
  | 'delayed' 
  | 'customs_hold' 
  | 'in_transit' 
  | 'delivered' 
  | 'critical_risk';

export type ClusterRegion = 
  | 'Pune-Chakan' 
  | 'NCR-Manesar' 
  | 'Gujarat-Sanand' 
  | 'Chennai-Sriperumbudur' 
  | 'Bengaluru-Hosur' 
  | 'Mumbai-JNPT' 
  | 'Hyderabad-Pashamylaram';

// -------------------------------------------------------------
// Supply Chain & Manufacturing Domain
// -------------------------------------------------------------
export interface Supplier {
  id: string;
  name: string;
  code: string;
  gstin: string;
  msmeCategory: 'Micro' | 'Small' | 'Medium' | 'Large Enterprise';
  cluster: ClusterRegion;
  state: string;
  tier: 'Tier-1' | 'Tier-2' | 'Tier-3';
  contactPerson: string;
  phone: string;
  email: string;
  reliabilityScore: number; // 0-100
  onTimeDeliveryRate: number; // Percentage, e.g., 91.5
  qualityRejectionPpm: number; // Parts per million defects, e.g. 180
  nominalLeadTimeDays: number;
  actualAvgLeadTimeDays: number;
  leadTimeDriftDays: number;
  isSingleSource: boolean;
  financialRiskScore: 'Low' | 'Medium' | 'High';
  suppliedSkuIds: string[];
  capacityUtilizationPct: number;
  paymentTermsDays: number;
  alternateSupplierIds: string[];
  notes?: string;
  // Cybersecurity extensions
  securityRating?: number; // 0-100 (e.g. BitSight/SecurityScorecard equivalent)
  thirdPartySoftwareRisk?: 'Low' | 'Moderate' | 'Severe';
  iso27001Certified?: boolean;
  dataAccessScope?: 'Zero Direct DB Access' | 'Restricted API Only' | 'Direct EDI / FTP';
  activeSoftwareVulnerabilities?: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Raw Material' | 'Electronic Component' | 'Mechanical Sub-assembly' | 'Packaging' | 'Fasteners';
  unit: string;
  currentStock: number;
  safetyBufferStock: number;
  reorderPoint: number;
  maxWarehouseCapacity: number;
  dailyConsumptionRate: number;
  daysOfInventoryCover: number;
  unitCostInr: number;
  totalValuationInr: number;
  primarySupplierId: string;
  backupSupplierIds: string[];
  criticality: 'Critical (A)' | 'Important (B)' | 'Standard (C)';
  associatedAssemblyLine: string;
  stockoutRiskStatus: 'healthy' | 'caution' | 'critical_stockout';
  estimatedDaysToStockout: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  eWayBillNumber: string;
  originHub: string;
  destinationFacility: string;
  carrierName: string;
  supplierId: string;
  skuIds: string[];
  quantityTotal: number;
  orderValueInr: number;
  status: ShipmentStatus;
  currentLocation: string;
  originCoordinates: [number, number];
  currentCoordinates: [number, number];
  destinationCoordinates: [number, number];
  dispatchedDate: string;
  scheduledDeliveryDate: string;
  estimatedDeliveryDate: string;
  delayHours: number;
  delayReason?: string;
  corridor: string;
  temperatureControlled: boolean;
  severity: SeverityLevel;
  mitigationInitiated: boolean;
  mitigationActionTaken?: string;
}

export interface DisruptionIncident {
  id: string;
  incidentCode: string;
  title: string;
  type: 'logistics_corridor' | 'weather_monsoon' | 'supplier_downtime' | 'port_congestion' | 'regulatory_gst' | 'cyber_incident';
  corridorOrLocation: string;
  detectedAt: string;
  severity: SeverityLevel;
  status: 'active' | 'mitigating' | 'resolved';
  affectedShipmentIds: string[];
  affectedSupplierIds: string[];
  affectedSkuIds: string[];
  projectedLineStoppageHours: number;
  potentialFinancialLossInr: number;
  description: string;
  recommendedActions: string[];
}

export interface RiskAlert {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  category: 'Corridor Congestion' | 'Buffer Depletion' | 'Supplier Variance' | 'Customs Hold' | 'Database Security' | 'Vulnerability Alert';
  title: string;
  message: string;
  entityId: string;
  entityType: 'shipment' | 'supplier' | 'inventory' | 'database' | 'cve';
  actionable: boolean;
}

// -------------------------------------------------------------
// Database Security Domain
// -------------------------------------------------------------
export type DatabaseEngine = 'PostgreSQL' | 'MongoDB' | 'Oracle Enterprise' | 'MySQL' | 'Redis';

export interface DatabaseInstance {
  id: string;
  name: string;
  cluster: string;
  engine: DatabaseEngine;
  version: string;
  host: string;
  port: number;
  status: 'healthy' | 'warning' | 'critical';
  connectionsActive: number;
  connectionLimit: number;
  failedLoginCount24h: number;
  piiTablesCount: number;
  backupStatus: 'completed' | 'in_progress' | 'failed';
  lastBackupTimestamp: string;
  dataIntegrityStatus: 'verified' | 'anomalous_checksum' | 'scanning';
  privilegedUsersCount: number;
  encryptionAtRest: 'AES-256 (Cloud KMS)' | 'Disabled';
  sslEnforced: boolean;
  notes?: string;
}

export interface DatabaseAuditEvent {
  id: string;
  timestamp: string;
  databaseId: string;
  databaseName: string;
  user: string;
  clientIp: string;
  eventType: 'failed_auth' | 'privilege_escalation' | 'suspicious_query' | 'schema_alteration' | 'bulk_export' | 'connection_spike';
  querySnippet?: string;
  severity: SeverityLevel;
  riskScore: number; // 0-100
  status: 'open' | 'reviewed' | 'flagged';
  anomalyFlag: boolean;
  anomalyReason?: string;
}

// -------------------------------------------------------------
// Threat Intelligence & Vulnerability Management Domain
// -------------------------------------------------------------
export interface VulnerabilityFinding {
  id: string;
  cveId: string;
  title: string;
  affectedSoftware: string;
  affectedComponent: string;
  packageVersion: string;
  fixedInVersion?: string;
  severity: SeverityLevel;
  cvssScore: number; // 0.0 - 10.0
  cisaKevStatus: boolean; // Known Exploited Vulnerability catalog
  epssScore: number; // 0.0 - 1.0 (Exploit Prediction Scoring System)
  publishedDate: string;
  affectedAssetType: 'database' | 'supplier_portal' | 'scada_plc' | 'erp_connector' | 'api_gateway';
  remediationSteps: string;
  patchAvailable: boolean;
  vectorString?: string;
  exploitedInWild: boolean;
}

export interface SbomPackage {
  id: string;
  name: string;
  version: string;
  license: string;
  supplierAssociated?: string;
  vulnerabilityCount: number;
  directDependency: boolean;
  ecosystem: 'npm' | 'pypi' | 'maven' | 'golang' | 'debian';
}

// -------------------------------------------------------------
// Access Management Domain
// -------------------------------------------------------------
export interface AccessAuditRecord {
  id: string;
  timestamp: string;
  principal: string;
  role: 'DB Admin' | 'SecOps Analyst' | 'SCM Director' | 'ERP Service Account' | 'Third-Party Vendor Auditor';
  targetAsset: string;
  action: 'SELECT' | 'GRANT ROLE' | 'DROP TABLE' | 'CONFIG UPDATE' | 'TOKEN ROTATION' | 'FAILED LOGIN';
  ipAddress: string;
  location: string;
  authMethod: 'MFA_FIDO2' | 'PASSWORD_ONLY' | 'MUTUAL_TLS' | 'API_KEY';
  anomalyFlag: boolean;
  anomalyReason?: string;
}

// -------------------------------------------------------------
// Incident Center Domain
// -------------------------------------------------------------
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved';

export interface SecurityIncident {
  id: string;
  incidentCode: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  detectionSource: 'db_audit_agent' | 'scada_anomaly_detector' | 'ulip_api_integrity' | 'supplier_soc' | 'cve_monitor';
  affectedSystem: string;
  businessImpact: string;
  openedAt: string;
  assignedInvestigator: string;
  mitigationSteps: string[];
  timelineEvents: {
    timestamp: string;
    note: string;
    actor: string;
  }[];
  resolutionNotes?: string;
}

// -------------------------------------------------------------
// Advanced Alerting & Notification Configurator Domain
// -------------------------------------------------------------
export type AlertMetricType = 
  | 'shipment_delay_hours'
  | 'supplier_risk_score'
  | 'inventory_days_cover'
  | 'db_failed_logins_24h'
  | 'cve_cvss_threshold';

export interface AlertRule {
  id: string;
  name: string;
  category: 'shipment_delay' | 'supplier_risk' | 'inventory_stockout' | 'database_threat' | 'cve_vulnerability';
  description: string;
  metric: AlertMetricType;
  operator: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
  severity: SeverityLevel;
  channels: {
    inApp: boolean;
    email: boolean;
    emailRecipients: string[];
  };
  isEnabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface NotificationItem {
  id: string;
  ruleId?: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  category: string;
  timestamp: string;
  read: boolean;
  emailSimulated: boolean;
  emailRecipient?: string;
  entityType: 'shipment' | 'supplier' | 'inventory' | 'database' | 'vulnerability' | 'incident';
  entityId: string;
  emailDetails?: {
    subject: string;
    body: string;
    sentAt: string;
    recipient: string;
  };
}

// -------------------------------------------------------------
// AI Intelligence Response Models
// -------------------------------------------------------------
export interface AiMitigationRecommendation {
  summary: string;
  urgency: 'Immediate (Within 4h)' | 'High (Today)' | 'Medium (Within 24h)';
  estimatedLossMitigatedInr: number;
  options: {
    title: string;
    actionType: 'dual_source_split' | 'expedited_freight' | 'production_reschedule' | 'inventory_buffer_transfer';
    targetSupplierName?: string;
    feasibilityScore: number;
    costToImplementInr: number;
    timeToRecoverHours: number;
    tradeoffs: string;
    stepByStepSop: string[];
  }[];
  groundedConstraintsAcknowledged: string[];
  explanation: string;
}

export interface AiSupplierDeepDive {
  supplierId: string;
  supplierName: string;
  overallHealthAssessment: string;
  leadTimeDriftAnalysis: string;
  singleSourceVulnerability: string;
  negotiationAndBufferRecommendations: string[];
  confidenceScore: number;
}

export interface ScenarioSimulationResult {
  scenarioTitle: string;
  summaryImpact: string;
  simulatedDowntimeDays: number;
  affectedProductionUnits: number;
  totalFinancialExposureInr: number;
  firstLineToHalt: string;
  hoursUntilFirstHalt: number;
  criticalSkusDepleted: {
    sku: string;
    name: string;
    remainingDays: number;
  }[];
  contingencyRoadmap: string[];
}

export interface AiSecurityAnalysis {
  summary: string;
  riskSeverity: SeverityLevel;
  rootCauseAnalysis: string;
  operationalConsequences: string;
  defensiveRemediationSteps: string[];
  evidenceReferenced: string[];
  confidenceScore: number;
}

// -------------------------------------------------------------
// Authentication, Identity & Tenancy Domain
// -------------------------------------------------------------
export interface UserAccount {
  id: string; // Immutable UUID (e.g. usr_...)
  organizationId: string; // Immutable UUID (e.g. org_...)
  email: string;
  passwordHash: string;
  passwordSalt: string;
  firstName: string;
  lastName: string;
  role: 'Owner' | 'Admin' | 'Security Analyst' | 'Auditor';
  title: string;
  phone: string;
  avatarUrl?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: number;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string; // Immutable UUID (e.g. org_...)
  name: string;
  industryCluster: string;
  tier: 'Enterprise' | 'Mid-Market Dedicated';
  domainWhitelist: string[];
  createdAt: string;
}

export interface UserSession {
  id: string; // Immutable UUID
  userId: string;
  organizationId: string;
  token: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

export interface AuthAuditEntry {
  id: string;
  timestamp: string;
  userId?: string;
  organizationId?: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  ipAddress: string;
  details: string;
}

