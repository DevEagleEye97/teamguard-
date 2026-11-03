import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';
import { AiSecurityAnalysis } from '../../types';

interface AiSecurityAssistantViewProps {
  initialTopic?: {
    title: string;
    details: string;
    asset: string;
  };
}

const PRESET_TOPICS = [
  {
    title: 'Analyze Credential Stuffing Surge on SAP Connector Oracle DB',
    category: 'Database Threat',
    severity: 'high',
    asset: 'Apex-SAP-Connector-Oracle',
    details: '29 failed authentication attempts logged in 24 hours from external VPN IP 198.51.100.44 targeting account vendor_audit_svc.',
    evidence: ['Target: Apex-SAP-Connector-Oracle', 'Client IP: 198.51.100.44', 'Failed Count: 29', 'Port: 1521']
  },
  {
    title: 'Evaluate Operational Stoppage Risk of Upstream XZ Backdoor (CVE-2024-3094)',
    category: 'Vulnerability Impact',
    severity: 'critical',
    asset: 'Industrial Edge Linux Nodes (Chakan Plant)',
    details: 'CISA KEV listed backdoor in liblzma 5.6.0 with CVSS 10.0 and EPSS 89.2% detected on edge SCADA gateway.',
    evidence: ['CVE-2024-3094', 'CVSS: 10.0 Critical', 'CISA KEV: True', 'Asset: Chakan Edge Gateway']
  },
  {
    title: 'Connect Suntech Braking Lead Time Drift (+4.8d) to Assembly Shutdown',
    category: 'Supplier Continuity',
    severity: 'high',
    asset: 'Line 3 - Chassis & Braking Unit (Hosur)',
    details: 'Suntech Hydraulic in Sriperumbudur has lead time drift of +4.8 days due to monsoon flood; safety buffer down to 2.8 days.',
    evidence: ['Supplier: Suntech Hydraulics (SHB-CHN)', 'Current Stock: 195 units', 'DOI: 2.8 days', 'Alternate: Coimbatore Hydraulics']
  },
  {
    title: 'Audit Anomaly: SELECT * on AP_SUPPLIER_MASTER Banking Records',
    category: 'Privilege Escalation',
    severity: 'critical',
    asset: 'Oracle ERP Schema: AP_SUPPLIER_MASTER',
    details: 'Service account app_sync_worker executed unbounded SELECT query dumping bank accounts, SWIFT codes, and GSTINs of all vendors.',
    evidence: ['Query: SELECT * FROM ap_supplier_master', 'PII Columns: 32', 'Session PID: 8912', 'Asset: Oracle DB']
  }
];

export const AiSecurityAssistantView: React.FC<AiSecurityAssistantViewProps> = ({
  initialTopic,
}) => {
  const [topicTitle, setTopicTitle] = useState(initialTopic?.title || PRESET_TOPICS[0].title);
  const [topicDetails, setTopicDetails] = useState(initialTopic?.details || PRESET_TOPICS[0].details);
  const [affectedAsset, setAffectedAsset] = useState(initialTopic?.asset || PRESET_TOPICS[0].asset);
  
  const [analysis, setAnalysis] = useState<AiSecurityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string>('');

  const handleRunAnalysis = async (title: string, details: string, asset: string, evidence: string[] = []) => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/security-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: title,
          category: 'Security & SCM Threat Analysis',
          severity: 'high',
          details,
          affectedAsset: asset,
          evidenceItems: evidence,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setAnalysis(data.data);
      setEngineUsed(data.engineUsed || 'Gemini 3.8 Flash');
    } catch (err) {
      console.error('Error generating AI security analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#C6A85E]/15 border border-[#C6A85E]/30 text-[#C6A85E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#F4F0E7]">
                  Gemini AI Security & Operational Continuity Assistant
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101418] text-[#C6A85E] border border-[#303940]">
                  Grounded Evidence Model
                </span>
              </div>
              <p className="text-[11px] text-[#A5ADB5] mt-0.5 max-w-2xl">
                Synthesizes database access anomalies, CVE findings, and supplier delivery delays into defensible root-cause insights and remediation SOPs.
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#A5ADB5] bg-[#101418] px-3 py-1 rounded-lg border border-[#303940] shrink-0">
            Model: <strong className="text-[#C6A85E]">gemini-3.8-flash</strong>
          </div>
        </div>

        {/* Preset Selector Grid */}
        <div className="mt-4 pt-3 border-t border-[#303940]">
          <div className="text-[11px] font-semibold text-[#A5ADB5] uppercase tracking-wider mb-2">
            Select Security Incident or Finding to Inspect:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopicTitle(preset.title);
                  setTopicDetails(preset.details);
                  setAffectedAsset(preset.asset);
                  handleRunAnalysis(preset.title, preset.details, preset.asset, preset.evidence);
                }}
                className="text-left p-2.5 rounded-lg bg-[#151B20] border border-[#303940] hover:border-[#C6A85E]/50 transition-colors cursor-pointer group text-xs"
              >
                <div className="flex items-center justify-between font-medium text-[#F4F0E7] group-hover:text-[#C6A85E]">
                  <span className="truncate">{preset.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#303940] group-hover:text-[#C6A85E] shrink-0" />
                </div>
                <div className="text-[10px] text-[#A5ADB5] mt-0.5">Asset: {preset.asset}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Inquiry Box */}
      <div className="p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAnalysis(topicTitle, topicDetails, affectedAsset, [`Asset: ${affectedAsset}`, `Query: ${topicDetails}`]);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-[#A5ADB5] mb-1">Security Event Title</label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-1.5 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#A5ADB5] mb-1">Target Asset / Subsystem</label>
              <input
                type="text"
                value={affectedAsset}
                onChange={(e) => setAffectedAsset(e.target.value)}
                className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-1.5 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#A5ADB5] mb-1">Incident Telemetry & Observation</label>
            <textarea
              rows={2}
              value={topicDetails}
              onChange={(e) => setTopicDetails(e.target.value)}
              className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-1.5 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Evaluating Telemetry...' : 'Generate AI Root-Cause Analysis'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center text-[#A5ADB5] space-y-2 rounded-xl bg-[#1A2228] border border-[#303940]">
          <div className="inline-block animate-spin text-[#C6A85E]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-xs font-medium text-[#F4F0E7]">
            Correlating database access logs, CVE catalogs, and manufacturing line buffers via Gemini...
          </div>
        </div>
      )}

      {/* Structured Analysis Results */}
      {!loading && analysis && (
        <div className="p-5 rounded-xl bg-[#1A2228] border border-[#C6A85E]/40 space-y-4 animate-in fade-in">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#303940] pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#C6A85E]/15 text-[#C6A85E] border border-[#C6A85E]/30">
                Risk Severity: {analysis.riskSeverity.toUpperCase()}
              </span>
              <h3 className="text-sm font-bold text-[#F4F0E7] mt-1.5">
                Executive Security Finding
              </h3>
            </div>
            <div className="text-xs font-mono text-[#A5ADB5]">
              Engine: <strong className="text-[#F4F0E7]">{engineUsed}</strong> • Confidence: {analysis.confidenceScore}%
            </div>
          </div>

          {/* Summary */}
          <div className="p-3.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs leading-relaxed text-[#F4F0E7]">
            {analysis.summary}
          </div>

          {/* Root cause and operational impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#C6A85E] uppercase tracking-wider block">
                Technical Root Cause:
              </span>
              <p className="text-[#A5ADB5] leading-relaxed text-[11px]">
                {analysis.rootCauseAnalysis}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#151B20] border border-[#303940] text-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#C6A85E] uppercase tracking-wider block">
                Supply Chain & Factory Impact:
              </span>
              <p className="text-[#A5ADB5] leading-relaxed text-[11px]">
                {analysis.operationalConsequences}
              </p>
            </div>
          </div>

          {/* Defensive Remediation Steps */}
          <div className="p-4 rounded-lg bg-[#151B20] border border-[#303940] space-y-2">
            <span className="text-xs font-semibold text-[#F4F0E7] flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#3D8255]" />
              <span>Recommended Defensive Remediation Plan</span>
            </span>

            <div className="space-y-1.5 pt-1">
              {analysis.defensiveRemediationSteps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2.5 text-xs text-[#F4F0E7]">
                  <span className="w-4 h-4 rounded-full bg-[#101418] border border-[#303940] flex items-center justify-center font-mono text-[9px] text-[#C6A85E] shrink-0 mt-0.5">
                    {sIdx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Referenced */}
          <div className="p-3 rounded-lg bg-[#101418] border border-[#303940] text-[11px] text-[#A5ADB5] space-y-1 font-mono">
            <div className="text-[#F4F0E7] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3D8255]" />
              <span>Evidence Items Verified in Master Data:</span>
            </div>
            {analysis.evidenceReferenced.map((ev, eIdx) => (
              <div key={eIdx} className="pl-4">
                • {ev}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
