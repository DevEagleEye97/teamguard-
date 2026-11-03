import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Database, 
  AlertTriangle, 
  Cpu, 
  Truck, 
  Server, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Key, 
  Activity, 
  FileCode, 
  ExternalLink,
  ChevronRight,
  Fingerprint,
  RefreshCw,
  Terminal,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PublicLandingViewProps {
  onEnterWorkspace: () => void;
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
  activeSection: string;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onEnterWorkspace,
  onOpenSignIn,
  onOpenRegister,
  activeSection,
}) => {
  const { isAuthenticated } = useAuth();
  const [interactiveTab, setInteractiveTab] = useState<'control_tower' | 'database_sec' | 'threat_intel' | 'gemini_copilot'>('control_tower');

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-16 pb-8 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2228] border border-[#C6A85E]/40 text-[#C6A85E] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Supply Chain & Data Security for Indian Manufacturers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F0E7] leading-tight">
            Resilient Operations.<br />
            <span className="text-[#C6A85E]">Zero-Trust Security.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#A5ADB5] leading-relaxed max-w-2xl mx-auto">
            TrustGuard bridges critical operational technology, database isolation, corridor telemetry, and AI mitigation to protect mid-market manufacturing enterprises against supply shocks and data breaches.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterWorkspace}
              className="px-6 py-3 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#C6A85E]/10"
            >
              <span>{isAuthenticated ? 'Return to Security Console' : 'Launch Enterprise Console (Demo)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSignIn}
              className="px-5 py-3 rounded-lg text-xs font-medium bg-[#1A2228] border border-[#303940] text-[#F4F0E7] hover:border-[#C6A85E]/50 transition-colors cursor-pointer"
            >
              Sign In to Tenant
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-[#303940]/60 max-w-4xl mx-auto text-left">
            <div className="p-3 bg-[#151B20] rounded-xl border border-[#303940]">
              <div className="text-[11px] text-[#A5ADB5]">Corridor Coverage</div>
              <div className="text-lg font-bold font-mono text-[#F4F0E7] mt-0.5">8 Major Hubs</div>
              <div className="text-[10px] text-[#3D8255]">Pune • Hosur • NCR • Gujarat</div>
            </div>
            <div className="p-3 bg-[#151B20] rounded-xl border border-[#303940]">
              <div className="text-[11px] text-[#A5ADB5]">DB Protection</div>
              <div className="text-lg font-bold font-mono text-[#C6A85E] mt-0.5">AES-256-GCM</div>
              <div className="text-[10px] text-[#A5ADB5]">Hardware Key MFA & Row Isolation</div>
            </div>
            <div className="p-3 bg-[#151B20] rounded-xl border border-[#303940]">
              <div className="text-[11px] text-[#A5ADB5]">Predictive AI</div>
              <div className="text-lg font-bold font-mono text-[#F4F0E7] mt-0.5">Gemini 2.5</div>
              <div className="text-[10px] text-[#A5ADB5]">Grounded Structured Response</div>
            </div>
            <div className="p-3 bg-[#151B20] rounded-xl border border-[#303940]">
              <div className="text-[11px] text-[#A5ADB5]">Data Identity</div>
              <div className="text-lg font-bold font-mono text-[#3D8255] mt-0.5">Immutable UUIDs</div>
              <div className="text-[10px] text-[#A5ADB5]">Zero Email Foreign Keys</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Product Feature Demonstration */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#151B20] border border-[#303940] rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#303940] gap-4">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#C6A85E]">
                Architecture & Live Subsystems
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F4F0E7] mt-1">
                Explore the TrustGuard Defense Stack
              </h2>
            </div>
            {/* Interactive Feature Selectors */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInteractiveTab('control_tower')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  interactiveTab === 'control_tower'
                    ? 'bg-[#1A2228] text-[#C6A85E] border border-[#C6A85E]/50'
                    : 'bg-[#101418] text-[#A5ADB5] border border-[#303940] hover:text-[#F4F0E7]'
                }`}
              >
                Control Tower & Map
              </button>
              <button
                onClick={() => setInteractiveTab('database_sec')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  interactiveTab === 'database_sec'
                    ? 'bg-[#1A2228] text-[#C6A85E] border border-[#C6A85E]/50'
                    : 'bg-[#101418] text-[#A5ADB5] border border-[#303940] hover:text-[#F4F0E7]'
                }`}
              >
                Database Security Vault
              </button>
              <button
                onClick={() => setInteractiveTab('threat_intel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  interactiveTab === 'threat_intel'
                    ? 'bg-[#1A2228] text-[#C6A85E] border border-[#C6A85E]/50'
                    : 'bg-[#101418] text-[#A5ADB5] border border-[#303940] hover:text-[#F4F0E7]'
                }`}
              >
                Threat Intelligence & CVEs
              </button>
              <button
                onClick={() => setInteractiveTab('gemini_copilot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  interactiveTab === 'gemini_copilot'
                    ? 'bg-[#1A2228] text-[#C6A85E] border border-[#C6A85E]/50'
                    : 'bg-[#101418] text-[#A5ADB5] border border-[#303940] hover:text-[#F4F0E7]'
                }`}
              >
                Gemini Copilot
              </button>
            </div>
          </div>

          {/* Interactive Feature Panel Details */}
          <div className="pt-6">
            {interactiveTab === 'control_tower' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 bg-[#101418] border border-[#303940] rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#303940] pb-2 text-[11px]">
                    <span className="text-[#A5ADB5]">ACTIVE CORRIDOR TELEMETRY • NH-48 / NH-44</span>
                    <span className="text-[#3D8255] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3D8255] animate-pulse"></span> LIVE SIMULATION
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#151B20] rounded-lg border border-[#303940]">
                      <div className="text-[10px] text-[#A5ADB5]">Total Shipments</div>
                      <div className="text-base font-bold text-[#F4F0E7]">14 Active</div>
                    </div>
                    <div className="p-3 bg-[#151B20] rounded-lg border border-[#303940]">
                      <div className="text-[10px] text-[#A5ADB5]">Delayed Freight</div>
                      <div className="text-base font-bold text-[#C6A85E]">4 Corridors</div>
                    </div>
                    <div className="p-3 bg-[#151B20] rounded-lg border border-[#303940]">
                      <div className="text-[10px] text-[#A5ADB5]">Inventory DOI Risk</div>
                      <div className="text-base font-bold text-[#B83A3A]">3 SKUs Critical</div>
                    </div>
                  </div>
                  <div className="p-3 bg-[#151B20] rounded-lg border border-[#303940] text-[11px] text-[#A5ADB5] space-y-1">
                    <div className="text-[#F4F0E7] font-semibold">Incident Telemetry: SHP-101 (NH-48 Ghats Bypass)</div>
                    <div>Carrier: VRL Critical Logistics • Origin: MIDC Bhosari &rarr; Hosur Unit 2</div>
                    <div className="text-[#C6A85E]">Delay: +14h due to Heavy Monsoonal Road Slips • Alternate Route: Kolhapur-Belgaum Bypass</div>
                  </div>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F0E7]">
                    <Truck className="w-4 h-4 text-[#C6A85E]" />
                    <span>Real-Time Corridor Visibility</span>
                  </div>
                  <p className="text-[#A5ADB5] leading-relaxed">
                    Track shipments across Pune-Chakan, Hosur-SIPCOT, Sriperumbudur, Sanand, and NCR automotive corridors. Calculate operational Days-of-Inventory (DOI) and trigger automated alternate supplier playbooks before assembly lines halt.
                  </p>
                  <button
                    onClick={onEnterWorkspace}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C6A85E] font-semibold hover:underline"
                  >
                    Open Live Control Tower &rarr;
                  </button>
                </div>
              </div>
            )}

            {interactiveTab === 'database_sec' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 bg-[#101418] border border-[#303940] rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#303940] pb-2 text-[11px]">
                    <span className="text-[#A5ADB5]">ENTERPRISE DATABASE VAULT TELEMETRY</span>
                    <span className="text-[#3D8255]">AES-256-GCM ENCRYPTED</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-[#151B20] rounded-lg border border-[#303940] flex items-center justify-between">
                      <div>
                        <div className="text-[#F4F0E7] font-semibold">db-apex-erp-primary (PostgreSQL 16)</div>
                        <div className="text-[10px] text-[#A5ADB5]">Chakan IDC Private VPC • Port 5432 • TLS 1.3 Strict</div>
                      </div>
                      <span className="text-[10px] font-bold text-[#3D8255] px-2 py-0.5 rounded bg-[#3D8255]/20">NORMAL</span>
                    </div>
                    <div className="p-2.5 bg-[#151B20] rounded-lg border border-[#B83A3A]/40 flex items-center justify-between">
                      <div>
                        <div className="text-[#F4F0E7] font-semibold">db-apex-scada-gateway (TimescaleDB)</div>
                        <div className="text-[10px] text-[#B83A3A]">Anomaly: 14 Failed Auth Handshakes from 103.85.12.94</div>
                      </div>
                      <span className="text-[10px] font-bold text-[#B83A3A] px-2 py-0.5 rounded bg-[#B83A3A]/20">ELEVATED</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F0E7]">
                    <Database className="w-4 h-4 text-[#C6A85E]" />
                    <span>Database Armor & Audit Stream</span>
                  </div>
                  <p className="text-[#A5ADB5] leading-relaxed">
                    Monitor mission-critical manufacturing ERP, telemetry, and supplier inventory databases. Detect SQL exfiltration patterns, credential stuffing, and unauthenticated network probes in real-time.
                  </p>
                  <button
                    onClick={onEnterWorkspace}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C6A85E] font-semibold hover:underline"
                  >
                    Inspect Database Security &rarr;
                  </button>
                </div>
              </div>
            )}

            {interactiveTab === 'threat_intel' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 bg-[#101418] border border-[#303940] rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#303940] pb-2 text-[11px]">
                    <span className="text-[#A5ADB5]">CVE VULNERABILITY & SBOM ENGINE</span>
                    <span className="text-[#C6A85E]">NVD & EPSS GROUNDED</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-[#151B20] rounded-lg border border-[#B83A3A]/40 flex items-center justify-between">
                      <div>
                        <div className="text-[#F4F0E7] font-semibold">CVE-2024-21626 (runc Container Escape)</div>
                        <div className="text-[10px] text-[#A5ADB5]">Affects: Hosur Telemetry Micro-Nodes • Severity 8.6 High</div>
                      </div>
                      <span className="text-[10px] font-bold text-[#B83A3A] px-2 py-0.5 rounded bg-[#B83A3A]/20">PATCH READY</span>
                    </div>
                    <div className="p-2.5 bg-[#151B20] rounded-lg border border-[#C6A85E]/40 flex items-center justify-between">
                      <div>
                        <div className="text-[#F4F0E7] font-semibold">CVE-2023-48795 (Terrapin SSH Attack)</div>
                        <div className="text-[10px] text-[#A5ADB5]">Affects: SFTP Gateway for EDI Suppliers • Severity 5.9 Medium</div>
                      </div>
                      <span className="text-[10px] font-bold text-[#C6A85E] px-2 py-0.5 rounded bg-[#C6A85E]/20">IN PROGRESS</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F0E7]">
                    <AlertTriangle className="w-4 h-4 text-[#C6A85E]" />
                    <span>Software Supply Chain Intelligence</span>
                  </div>
                  <p className="text-[#A5ADB5] leading-relaxed">
                    Correlate industrial IoT firmwares, logistics microservices, and database connectors against active CVE catalogs. Prioritize remediation using real exploit probability metrics.
                  </p>
                  <button
                    onClick={onEnterWorkspace}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C6A85E] font-semibold hover:underline"
                  >
                    Review Threat Intelligence &rarr;
                  </button>
                </div>
              </div>
            )}

            {interactiveTab === 'gemini_copilot' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 bg-[#101418] border border-[#303940] rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#303940] pb-2 text-[11px]">
                    <span className="text-[#A5ADB5]">GEMINI ENTERPRISE REASONING • STRUCTURED OUTPUT</span>
                    <span className="text-[#3D8255]">ZERO HALLUCINATION PROTOCOL</span>
                  </div>
                  <div className="p-3 bg-[#151B20] rounded-lg border border-[#303940] text-[11.5px] text-[#F4F0E7] space-y-2">
                    <div className="text-[#C6A85E] font-bold">Query: Correlate NH-48 monsoon delay with SKU-ENG-902 buffer</div>
                    <p className="text-[#A5ADB5] text-[11px] leading-relaxed">
                      &quot;Analyzing Pune-Hosur corridor telemetry. SKU-ENG-902 current safety stock is 120 units (3.4 days). 
                      At 14h delay, buffer will drop to 1.8 days. Recommended action: Route emergency batch of 60 units from 
                      Bharat Forge Talegaon under existing contract BF-2024-C.&quot;
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F0E7]">
                    <Sparkles className="w-4 h-4 text-[#C6A85E]" />
                    <span>Domain-Trained Copilot</span>
                  </div>
                  <p className="text-[#A5ADB5] leading-relaxed">
                    Powered by the latest Gemini model using deterministic system prompts and structured JSON. Delivers actionable operational advice strictly grounded on internal company inventory and supplier records.
                  </p>
                  <button
                    onClick={onEnterWorkspace}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C6A85E] font-semibold hover:underline"
                  >
                    Open AI Assistant &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Security, Tenancy & Compliance Section */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase font-mono tracking-wider text-[#C6A85E]">
            Enterprise Trust Standards
          </div>
          <h2 className="text-2xl font-bold text-[#F4F0E7] mt-1">
            Data Isolation & Cryptographic Architecture
          </h2>
          <p className="text-xs text-[#A5ADB5] mt-2">
            Every layer is engineered to satisfy Indian Digital Personal Data Protection (DPDP) standards, ISO 27001, and CIS Benchmark v8.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#151B20] border border-[#303940] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1A2228] border border-[#303940] flex items-center justify-center text-[#C6A85E]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#F4F0E7]">Immutable Identity UUIDs</h3>
            <p className="text-xs text-[#A5ADB5] leading-relaxed">
              Users (<code className="text-[#C6A85E]">usr_...</code>) and Organizations (<code className="text-[#C6A85E]">org_...</code>) are assigned cryptographically random UUIDs generated on the server. Email addresses are never used as relational foreign keys.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#151B20] border border-[#303940] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1A2228] border border-[#303940] flex items-center justify-center text-[#3D8255]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#F4F0E7]">AES-256-GCM Storage Encryption</h3>
            <p className="text-xs text-[#A5ADB5] leading-relaxed">
              Sensitive database connection URIs, tokens, and custom threshold rules are secured with 256-bit AES in Galois/Counter Mode with dynamic 96-bit initialization vectors and authenticity tags.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#151B20] border border-[#303940] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1A2228] border border-[#303940] flex items-center justify-center text-[#C6A85E]">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#F4F0E7]">Salted PBKDF2 Password Vault</h3>
            <p className="text-xs text-[#A5ADB5] leading-relaxed">
              Passwords undergo 100,000 iterations of HMAC-SHA512 key derivation with cryptographically unique salts. Timing attacks are neutralized with constant-time equality comparisons.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Documentation & Developer API Overview */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 lg:p-8 rounded-2xl bg-[#151B20] border border-[#303940] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs font-mono text-[#C6A85E] uppercase tracking-wider">
              Developer Documentation
            </div>
            <h3 className="text-lg font-semibold text-[#F4F0E7]">
              Integrate with ERP & Sensor Telemetry APIs
            </h3>
            <p className="text-xs text-[#A5ADB5] leading-relaxed">
              Access programmatic endpoints for ingestion of GPS corridor events, SBOM manifests, database query telemetry, and simulated webhook alerts with rate-limited bearer token authentication.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onEnterWorkspace}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Explore In Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
