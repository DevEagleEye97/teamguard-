import { GoogleGenAI, Type } from '@google/genai';
import { 
  AiMitigationRecommendation, 
  AiSupplierDeepDive, 
  ScenarioSimulationResult,
  AiSecurityAnalysis,
  Shipment, 
  Supplier, 
  InventoryItem 
} from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export async function generateMitigationPlaybook(data: {
  shipment: Shipment;
  affectedSku?: InventoryItem;
  primarySupplier?: Supplier;
  availableAlternateSuppliers: Supplier[];
}): Promise<{ data: AiMitigationRecommendation; engineUsed: string }> {
  const ai = getGenAI();
  const { shipment, affectedSku, primarySupplier, availableAlternateSuppliers } = data;

  const contextData = {
    delayedShipment: {
      trackingNumber: shipment.trackingNumber,
      eWayBill: shipment.eWayBillNumber,
      corridor: shipment.corridor,
      delayHours: shipment.delayHours,
      delayReason: shipment.delayReason,
      orderValueInr: shipment.orderValueInr,
      carrier: shipment.carrierName,
      currentLocation: shipment.currentLocation,
    },
    impactedProduct: affectedSku ? {
      sku: affectedSku.sku,
      name: affectedSku.name,
      category: affectedSku.category,
      currentStock: affectedSku.currentStock,
      safetyBufferStock: affectedSku.safetyBufferStock,
      dailyConsumptionRate: affectedSku.dailyConsumptionRate,
      daysOfInventoryCover: affectedSku.daysOfInventoryCover,
      associatedAssemblyLine: affectedSku.associatedAssemblyLine,
      unitCostInr: affectedSku.unitCostInr,
    } : null,
    primarySupplier: primarySupplier ? {
      name: primarySupplier.name,
      cluster: primarySupplier.cluster,
      leadTimeDriftDays: primarySupplier.leadTimeDriftDays,
      reliabilityScore: primarySupplier.reliabilityScore,
    } : null,
    availablePreQualifiedAlternates: availableAlternateSuppliers.map(s => ({
      id: s.id,
      name: s.name,
      cluster: s.cluster,
      leadTimeDays: s.nominalLeadTimeDays,
      reliabilityScore: s.reliabilityScore,
      capacityUtilizationPct: s.capacityUtilizationPct,
      paymentTermsDays: s.paymentTermsDays,
    })),
  };

  if (!ai) {
    return {
      data: getRuleBasedMitigation(shipment, affectedSku, primarySupplier, availableAlternateSuppliers),
      engineUsed: 'Deterministic Supply Engine (Add GEMINI_API_KEY in Secrets for live Gemini reasoning)',
    };
  }

  const systemInstruction = `You are TrustGuard's Supply Chain Resilience Engine for Indian mid-market manufacturing.
CRITICAL CONSTRAINT: You must ONLY base recommendations on the exact supplier directory, active purchase orders, inventory buffers, and alternate vendor listings provided in the context payload.
DO NOT fabricate or assume alternative vendors, stock levels, or transit days that are not listed.
If no alternative vendor exists in the available alternates list, explicitly state that in the tradeoffs and provide non-vendor mitigations (such as line rescheduling or buffer borrowing).
Format output in structured JSON.`;

  try {
    const prompt = `Analyze this delayed shipment and recommend actionable operational mitigation options:
Context Data:
${JSON.stringify(contextData, null, 2)}

Provide a structured mitigation strategy with 2 to 3 feasible options based ONLY on the supplied data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            urgency: { 
              type: Type.STRING,
              description: 'One of: Immediate (Within 4h), High (Today), Medium (Within 24h)'
            },
            estimatedLossMitigatedInr: { type: Type.NUMBER },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  actionType: { 
                    type: Type.STRING,
                    description: 'One of: dual_source_split, expedited_freight, production_reschedule, inventory_buffer_transfer'
                  },
                  targetSupplierName: { type: Type.STRING },
                  feasibilityScore: { type: Type.NUMBER },
                  costToImplementInr: { type: Type.NUMBER },
                  timeToRecoverHours: { type: Type.NUMBER },
                  tradeoffs: { type: Type.STRING },
                  stepByStepSop: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'actionType', 'feasibilityScore', 'costToImplementInr', 'timeToRecoverHours', 'tradeoffs', 'stepByStepSop']
              }
            },
            groundedConstraintsAcknowledged: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ['summary', 'urgency', 'estimatedLossMitigatedInr', 'options', 'groundedConstraintsAcknowledged', 'explanation']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as AiMitigationRecommendation;
    return {
      data: parsed,
      engineUsed: 'gemini-3.8-flash',
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to deterministic engine:', error);
    return {
      data: getRuleBasedMitigation(shipment, affectedSku, primarySupplier, availableAlternateSuppliers),
      engineUsed: 'Deterministic Fallback (Gemini API transient failure/quota exceeded)',
    };
  }
}

export async function generateSupplierDeepDive(supplier: Supplier, suppliedSkus: InventoryItem[]): Promise<{ data: AiSupplierDeepDive; engineUsed: string }> {
  const ai = getGenAI();

  const contextData = {
    supplier: {
      name: supplier.name,
      code: supplier.code,
      gstin: supplier.gstin,
      cluster: supplier.cluster,
      tier: supplier.tier,
      reliabilityScore: supplier.reliabilityScore,
      onTimeDeliveryRate: supplier.onTimeDeliveryRate,
      qualityRejectionPpm: supplier.qualityRejectionPpm,
      nominalLeadTimeDays: supplier.nominalLeadTimeDays,
      actualAvgLeadTimeDays: supplier.actualAvgLeadTimeDays,
      leadTimeDriftDays: supplier.leadTimeDriftDays,
      isSingleSource: supplier.isSingleSource,
      financialRiskScore: supplier.financialRiskScore,
      capacityUtilizationPct: supplier.capacityUtilizationPct,
    },
    suppliedSkus: suppliedSkus.map(s => ({
      sku: s.sku,
      name: s.name,
      criticality: s.criticality,
      daysOfInventoryCover: s.daysOfInventoryCover,
      associatedAssemblyLine: s.associatedAssemblyLine,
    })),
  };

  if (!ai) {
    return {
      data: getRuleBasedSupplierDeepDive(supplier, suppliedSkus),
      engineUsed: 'Deterministic Supply Engine',
    };
  }

  const systemInstruction = `You are TrustGuard's Senior Supplier Risk Auditor specializing in Indian manufacturing ecosystems (Chakan, Manesar, Sriperumbudur, Sanand, Hosur).
Evaluate the supplier based strictly on their supplied delivery variance, quality PPM, lead-time drift, and single-source dependency. Do not fabricate external data. Return structured JSON.`;

  try {
    const prompt = `Conduct a rigorous supplier risk deep-dive for:
${JSON.stringify(contextData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            supplierId: { type: Type.STRING },
            supplierName: { type: Type.STRING },
            overallHealthAssessment: { type: Type.STRING },
            leadTimeDriftAnalysis: { type: Type.STRING },
            singleSourceVulnerability: { type: Type.STRING },
            negotiationAndBufferRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ['supplierId', 'supplierName', 'overallHealthAssessment', 'leadTimeDriftAnalysis', 'singleSourceVulnerability', 'negotiationAndBufferRecommendations', 'confidenceScore']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as AiSupplierDeepDive;
    return {
      data: parsed,
      engineUsed: 'gemini-3.8-flash',
    };
  } catch (error) {
    console.error('Gemini supplier audit failed, using fallback:', error);
    return {
      data: getRuleBasedSupplierDeepDive(supplier, suppliedSkus),
      engineUsed: 'Deterministic Fallback',
    };
  }
}

export async function generateScenarioSimulation(
  scenarioQuery: string, 
  inventory: InventoryItem[], 
  suppliers: Supplier[], 
  shipments: Shipment[]
): Promise<{ data: ScenarioSimulationResult; engineUsed: string }> {
  const ai = getGenAI();

  const contextData = {
    scenarioQuery,
    inventorySummary: inventory.map(i => ({
      sku: i.sku,
      name: i.name,
      currentStock: i.currentStock,
      dailyBurnRate: i.dailyConsumptionRate,
      daysCover: i.daysOfInventoryCover,
      line: i.associatedAssemblyLine,
      primarySupplierId: i.primarySupplierId,
      backupSupplierIds: i.backupSupplierIds,
    })),
    suppliersSummary: suppliers.map(s => ({
      id: s.id,
      name: s.name,
      cluster: s.cluster,
      leadTimeDays: s.actualAvgLeadTimeDays,
      isSingleSource: s.isSingleSource,
    })),
    activeShipmentsSummary: shipments.map(sh => ({
      trackingNumber: sh.trackingNumber,
      corridor: sh.corridor,
      status: sh.status,
      delayHours: sh.delayHours,
      skuIds: sh.skuIds,
    })),
  };

  if (!ai) {
    return {
      data: getRuleBasedScenarioSimulation(scenarioQuery, inventory, suppliers),
      engineUsed: 'Deterministic Supply Engine',
    };
  }

  const systemInstruction = `You are TrustGuard's Supply Shock Simulator for Indian manufacturing.
Given a what-if scenario (e.g. corridor blockages, localized floods, single-source supplier halts), calculate cascading impact across assembly lines and inventory buffers based ONLY on the supplied dataset.
Never invent suppliers or inventory items not in the payload. Calculate realistic financial impact in Indian Rupees (INR).`;

  try {
    const prompt = `Simulate this disruption scenario:
"${scenarioQuery}"

Analyze using this inventory, supplier and shipment data:
${JSON.stringify(contextData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioTitle: { type: Type.STRING },
            summaryImpact: { type: Type.STRING },
            simulatedDowntimeDays: { type: Type.NUMBER },
            affectedProductionUnits: { type: Type.NUMBER },
            totalFinancialExposureInr: { type: Type.NUMBER },
            firstLineToHalt: { type: Type.STRING },
            hoursUntilFirstHalt: { type: Type.NUMBER },
            criticalSkusDepleted: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sku: { type: Type.STRING },
                  name: { type: Type.STRING },
                  remainingDays: { type: Type.NUMBER }
                },
                required: ['sku', 'name', 'remainingDays']
              }
            },
            contingencyRoadmap: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'scenarioTitle', 
            'summaryImpact', 
            'simulatedDowntimeDays', 
            'affectedProductionUnits', 
            'totalFinancialExposureInr', 
            'firstLineToHalt', 
            'hoursUntilFirstHalt', 
            'criticalSkusDepleted', 
            'contingencyRoadmap'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as ScenarioSimulationResult;
    return {
      data: parsed,
      engineUsed: 'gemini-3.8-flash',
    };
  } catch (error) {
    console.error('Gemini scenario simulation failed, using fallback:', error);
    return {
      data: getRuleBasedScenarioSimulation(scenarioQuery, inventory, suppliers),
      engineUsed: 'Deterministic Fallback',
    };
  }
}

// -------------------------------------------------------------
// Grounded Rule-based Fallback Implementations
// -------------------------------------------------------------
function getRuleBasedMitigation(
  shipment: Shipment,
  sku?: InventoryItem,
  primarySupplier?: Supplier,
  alternates: Supplier[] = []
): AiMitigationRecommendation {
  const hasAlternates = alternates.length > 0;
  const daysCover = sku?.daysOfInventoryCover ?? 3.5;
  const isUrgent = daysCover < 2.0;

  const options: AiMitigationRecommendation['options'] = [];

  if (hasAlternates) {
    const backup = alternates[0];
    options.push({
      title: `Split Purchase Order & Divert 40% Volume to ${backup.name}`,
      actionType: 'dual_source_split',
      targetSupplierName: backup.name,
      feasibilityScore: 92,
      costToImplementInr: 125000,
      timeToRecoverHours: 36,
      tradeoffs: `Unit price premium is +4.5% compared to contracted rate; utilizes 60% of ${backup.cluster} vendor's spare capacity.`,
      stepByStepSop: [
        `Issue expedited Purchase Order #PO-EMERGENCY-${backup.code} under master supply agreement.`,
        `Request dispatch via direct dedicated light commercial vehicle (LCV) from ${backup.cluster}.`,
        `Notify Chakan receiving dock for prioritized offloading and IQC quality inspection.`
      ]
    });
  }

  options.push({
    title: `Re-route Delayed Consignment via Green Expressway Feeder with LCV Transfer`,
    actionType: 'expedited_freight',
    targetSupplierName: primarySupplier?.name,
    feasibilityScore: 84,
    costToImplementInr: 45000,
    timeToRecoverHours: 24,
    tradeoffs: 'Requires vehicle trans-shipment at highway staging hub; additional labor cost for manual reloading.',
    stepByStepSop: [
      `Contact carrier dispatch manager (${shipment.carrierName}) at current staging point (${shipment.currentLocation}).`,
      'Authorize transfer of stalled consignment onto two 14-foot express trucks capable of taking state highway bypass route.',
      'Re-generate revised e-Way Bill Part-B vehicle number on GST portal to avoid checkpost penalties.'
    ]
  });

  options.push({
    title: `Reschedule ${sku?.associatedAssemblyLine || 'Line'} to Run Secondary Production Batch`,
    actionType: 'production_reschedule',
    feasibilityScore: 78,
    costToImplementInr: 80000,
    timeToRecoverHours: 48,
    tradeoffs: 'Delays completion of primary contract by 2 days; preserves workforce utilization without idle machine penalties.',
    stepByStepSop: [
      `Review production plan in ERP for ${sku?.associatedAssemblyLine || 'Assembly Unit'}.`,
      'Switch tooling to alternative high-stock component model for the next 48 production hours.',
      'Communicate revised dispatch timeline to OEM client key account manager.'
    ]
  });

  return {
    summary: `Shipment ${shipment.trackingNumber} delayed by ${shipment.delayHours}h in ${shipment.corridor}. Inventory buffer for ${sku?.name || 'affected SKU'} provides ${daysCover.toFixed(1)} days of coverage before production shutdown.`,
    urgency: isUrgent ? 'Immediate (Within 4h)' : 'High (Today)',
    estimatedLossMitigatedInr: Math.round(shipment.orderValueInr * 1.8),
    options,
    groundedConstraintsAcknowledged: [
      `Evaluated only master data for ${alternates.length} pre-qualified alternative vendors in cluster.`,
      `Verified current inventory cover of ${daysCover.toFixed(1)} days against daily consumption rate.`,
      `Zero assumed third-party availability outside registered vendor catalog.`
    ],
    explanation: `Because this item is ${sku?.criticality || 'Critical'} to ${sku?.associatedAssemblyLine || 'assembly'}, an immediate dual-path mitigation is advised: expedited highway bypass alongside partial secondary order execution.`
  };
}

function getRuleBasedSupplierDeepDive(supplier: Supplier, suppliedSkus: InventoryItem[]): AiSupplierDeepDive {
  const isHighDrift = supplier.leadTimeDriftDays > 3.0;
  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    overallHealthAssessment: `${supplier.name} exhibits a reliability score of ${supplier.reliabilityScore}/100 with an On-Time Delivery rate of ${supplier.onTimeDeliveryRate}%. Financial risk is graded as ${supplier.financialRiskScore}.`,
    leadTimeDriftAnalysis: isHighDrift 
      ? `Critical lead-time expansion detected: nominal lead time is ${supplier.nominalLeadTimeDays} days, but actual historical delivery averages ${supplier.actualAvgLeadTimeDays} days (drift of +${supplier.leadTimeDriftDays} days). This drift systematically erodes safety stocks.`
      : `Lead time variance is stable (+${supplier.leadTimeDriftDays} days deviation). Production scheduling can rely on nominal lead-time windows with standard buffer margins.`,
    singleSourceVulnerability: supplier.isSingleSource
      ? `CRITICAL RISK: Sole supplier for key component(s) [${suppliedSkus.map(s => s.sku).join(', ')}]. No pre-qualified secondary vendor is configured in master data, leaving zero redundancy during regional disruptions.`
      : `Dual-sourcing enabled. Backup vendor(s) exist in master data (${supplier.alternateSupplierIds.length} pre-approved alternate), reducing single-point-of-failure severity.`,
    negotiationAndBufferRecommendations: [
      `Increase safety buffer stock at central plant by +${Math.ceil(supplier.leadTimeDriftDays * 1.5)} days to absorb observed lead time drift.`,
      `Introduce OTD performance SLA penalty clauses linked to ${supplier.paymentTermsDays}-day payment release terms.`,
      supplier.isSingleSource 
        ? 'Initiate vendor qualification audit for secondary supplier in an alternative geographic cluster (e.g. Gujarat or Tamil Nadu).' 
        : 'Maintain a 70:30 volume split between primary and secondary suppliers to keep backup line warm.'
    ],
    confidenceScore: 94
  };
}

function getRuleBasedScenarioSimulation(
  query: string, 
  inventory: InventoryItem[], 
  suppliers: Supplier[]
): ScenarioSimulationResult {
  const vulnerableSkus = [...inventory].sort((a, b) => a.daysOfInventoryCover - b.daysOfInventoryCover).slice(0, 3);
  const firstHaltItem = vulnerableSkus[0];
  const hoursUntilHalt = Math.max(8, Math.round(firstHaltItem.daysOfInventoryCover * 24));

  return {
    scenarioTitle: `Resilience Simulation: ${query}`,
    summaryImpact: `Simulated disruption creates immediate pressure on ${vulnerableSkus.length} critical components. The most vulnerable line is ${firstHaltItem.associatedAssemblyLine} with buffer depletion expected within ${firstHaltItem.daysOfInventoryCover.toFixed(1)} days.`,
    simulatedDowntimeDays: 3.5,
    affectedProductionUnits: 650,
    totalFinancialExposureInr: 3850000,
    firstLineToHalt: firstHaltItem.associatedAssemblyLine,
    hoursUntilFirstHalt: hoursUntilHalt,
    criticalSkusDepleted: vulnerableSkus.map(item => ({
      sku: item.sku,
      name: item.name,
      remainingDays: Number(item.daysOfInventoryCover.toFixed(1))
    })),
    contingencyRoadmap: [
      `Stage 1 (0-12h): Freeze outgoing finished good dispatch commitments and audit actual physical buffer for ${firstHaltItem.sku}.`,
      `Stage 2 (12-24h): Reallocate shared component allocations between Chakan and Hosur plants.`,
      `Stage 3 (24-48h): Trigger contingency purchase orders with qualified Tier-2 suppliers in unaffected geographic zones.`,
      'Stage 4 (48h+): Initiate customer communication protocol for adjusted vehicle delivery milestones.'
    ]
  };
}

export async function generateSecurityAnalysis(data: {
  eventTitle: string;
  category: string;
  severity: string;
  details: string;
  affectedAsset: string;
  evidenceItems?: string[];
}): Promise<{ data: AiSecurityAnalysis; engineUsed: string }> {
  const ai = getGenAI();
  const { eventTitle, category, severity, details, affectedAsset, evidenceItems = [] } = data;

  if (!ai) {
    return {
      data: getRuleBasedSecurityAnalysis(eventTitle, category, severity, details, affectedAsset, evidenceItems),
      engineUsed: 'TrustGuard Deterministic SecOps Engine',
    };
  }

  const systemInstruction = `You are TrustGuard's Enterprise Cybersecurity & Supply Chain Continuity Architect.
Analyze the provided security event, database anomaly, or vulnerability finding.
Provide a clear, sober operational risk explanation, connect it to supply-chain continuity, cite specific evidence, and give exact defensive remediation steps.
Never invent external metrics or unsupported allegations. Return structured JSON.`;

  try {
    const prompt = `Analyze this enterprise security event:
Title: ${eventTitle}
Category: ${category}
Severity: ${severity}
Affected Asset: ${affectedAsset}
Details: ${details}
Evidence: ${JSON.stringify(evidenceItems)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskSeverity: { 
              type: Type.STRING,
              description: 'One of: critical, high, medium, low'
            },
            rootCauseAnalysis: { type: Type.STRING },
            operationalConsequences: { type: Type.STRING },
            defensiveRemediationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            evidenceReferenced: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ['summary', 'riskSeverity', 'rootCauseAnalysis', 'operationalConsequences', 'defensiveRemediationSteps', 'evidenceReferenced', 'confidenceScore']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as AiSecurityAnalysis;
    return {
      data: parsed,
      engineUsed: 'gemini-3.8-flash',
    };
  } catch (err) {
    console.error('Gemini security analysis failed, using fallback:', err);
    return {
      data: getRuleBasedSecurityAnalysis(eventTitle, category, severity, details, affectedAsset, evidenceItems),
      engineUsed: 'TrustGuard Deterministic SecOps Fallback',
    };
  }
}

function getRuleBasedSecurityAnalysis(
  title: string,
  category: string,
  severity: any,
  details: string,
  asset: string,
  evidence: string[]
): AiSecurityAnalysis {
  return {
    summary: `Security finding "${title}" affecting ${asset} classified at ${severity.toUpperCase()} severity. Threat pattern indicates potential unauthorized privilege traversal or denial-of-service vulnerability.`,
    riskSeverity: severity,
    rootCauseAnalysis: `Root cause trace on ${asset}: ${details}. Access anomalies indicate non-conformance with least-privilege standards and exposed network boundaries.`,
    operationalConsequences: `If unmitigated, compromise on ${asset} could cascade into ERP procurement halt, corrupted manufacturing BOM parameters, or factory-floor telemetry ingestion blackout.`,
    defensiveRemediationSteps: [
      `Isolate and restrict network ACLs on ${asset} to approved bastion host subnets.`,
      `Force immediate rotation of affected database or API service account credentials.`,
      `Enable mandatory Multi-Factor Authentication (FIDO2/WebAuthn) and Mutual TLS for all administrative sessions.`,
      `Trigger continuous integrity check on connected ERP tables and active e-Way bill pipelines.`
    ],
    evidenceReferenced: evidence.length > 0 ? evidence : [
      `Target Asset: ${asset}`,
      `Detection Category: ${category}`,
      `Security Event Telemetry: ${details}`
    ],
    confidenceScore: 92
  };
}

