import React, { useState } from 'react';
import { 
  Bug, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  FileCode, 
  Search, 
  Filter, 
  Sparkles,
  Info
} from 'lucide-react';
import { VulnerabilityFinding, SbomPackage, SeverityLevel } from '../../types';

interface ThreatIntelligenceViewProps {
  vulnerabilities: VulnerabilityFinding[];
  sbomPackages: SbomPackage[];
  onTriggerAiAnalysis: (title: string, details: string, asset: string) => void;
}

export const ThreatIntelligenceView: React.FC<ThreatIntelligenceViewProps> = ({
  vulnerabilities,
  sbomPackages,
  onTriggerAiAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'cves' | 'sbom'>('cves');
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [cisaKevOnly, setCisaKevOnly] = useState(false);
  const [selectedCve, setSelectedCve] = useState<VulnerabilityFinding | null>(null);

  const filteredCves = vulnerabilities.filter(v => {
    if (selectedSeverity !== 'all' && v.severity !== selectedSeverity) return false;
    if (cisaKevOnly && !v.cisaKevStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.cveId.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.affectedSoftware.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSbom = sbomPackages.filter(pkg => {
    if (search) {
      const q = search.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(q) ||
        pkg.version.toLowerCase().includes(q) ||
        pkg.license.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40';
      case 'high':
        return 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40';
      case 'medium':
        return 'text-[#C6A85E] bg-[#C6A85E]/15 border-[#C6A85E]/40';
      default:
        return 'text-[#3D8255] bg-[#3D8255]/15 border-[#3D8255]/40';
    }
  };

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Sub-header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Bug className="w-4 h-4 text-[#C6A85E]" />
            <span>Threat Intelligence & Software Supply Chain (SBOM)</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Real vulnerability metrics verified against NIST NVD, CISA Known Exploited Vulnerabilities (KEV), and FIRST EPSS models
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#101418] p-1 rounded-lg border border-[#303940]">
          <button
            onClick={() => setActiveTab('cves')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'cves' ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
            }`}
          >
            Vulnerability Records ({vulnerabilities.length})
          </button>
          <button
            onClick={() => setActiveTab('sbom')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'sbom' ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
            }`}
          >
            SBOM Inventory ({sbomPackages.length})
          </button>
        </div>
      </div>

      {activeTab === 'cves' ? (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#151B20] border border-[#303940]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search CVE ID, software package, title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1.5 text-[#F4F0E7] focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>

              <button
                onClick={() => setCisaKevOnly(!cisaKevOnly)}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  cisaKevOnly
                    ? 'bg-[#B83A3A]/20 text-[#B83A3A] border-[#B83A3A] font-semibold'
                    : 'bg-[#101418] text-[#A5ADB5] border-[#303940] hover:text-[#F4F0E7]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CISA KEV Only</span>
              </button>
            </div>
          </div>

          {/* CVE Table */}
          <div className="overflow-x-auto rounded-xl border border-[#303940] bg-[#1A2228]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#151B20] border-b border-[#303940] text-[10px] font-semibold text-[#A5ADB5] uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-3">CVE Identifier</th>
                  <th className="py-2.5 px-3">Vulnerability Title</th>
                  <th className="py-2.5 px-3">Affected Software / Asset</th>
                  <th className="py-2.5 px-3">CVSS v3.1</th>
                  <th className="py-2.5 px-3">EPSS Exploit Prob.</th>
                  <th className="py-2.5 px-3">CISA KEV</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303940]/60 bg-[#101418]/60">
                {filteredCves.map(cve => (
                  <tr 
                    key={cve.id} 
                    onClick={() => setSelectedCve(cve)}
                    className="hover:bg-[#151B20] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#C6A85E]">
                      {cve.cveId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#F4F0E7]">{cve.title}</div>
                      <div className="text-[10px] text-[#A5ADB5] mt-0.5 line-clamp-1">{cve.remediationSteps}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-[#F4F0E7]">{cve.affectedSoftware} ({cve.packageVersion})</div>
                      <div className="text-[10px] text-[#A5ADB5] mt-0.5">{cve.affectedComponent}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(cve.severity)}`}>
                          {cve.cvssScore.toFixed(1)} {cve.severity.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#F4F0E7]">
                      {(cve.epssScore * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3">
                      {cve.cisaKevStatus ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#B83A3A] bg-[#B83A3A]/10 px-2 py-0.5 rounded border border-[#B83A3A]/30 font-semibold">
                          <ShieldAlert className="w-3 h-3" />
                          KEV Listed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#A5ADB5]">Not Listed</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerAiAnalysis(
                            `${cve.cveId}: ${cve.title}`,
                            cve.remediationSteps,
                            cve.affectedComponent
                          );
                        }}
                        className="px-2.5 py-1 rounded text-[11px] bg-[#C6A85E]/15 text-[#C6A85E] border border-[#C6A85E]/30 hover:bg-[#C6A85E]/25 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Analysis</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SBOM Package Table */
        <div className="overflow-x-auto rounded-xl border border-[#303940] bg-[#1A2228]">
          <div className="p-3 border-b border-[#303940] flex items-center justify-between text-xs">
            <span className="text-[#A5ADB5]">
              Software Bill of Materials (SBOM) for industrial gateway & web microservices
            </span>
            <span className="font-mono text-[#C6A85E]">{filteredSbom.length} Components Tracked</span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#151B20] border-b border-[#303940] text-[10px] font-semibold text-[#A5ADB5] uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Package Name</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Ecosystem</th>
                <th className="py-2.5 px-3">License</th>
                <th className="py-2.5 px-3">Dependency Scope</th>
                <th className="py-2.5 px-3 text-right">Known Vulnerabilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#303940]/60 bg-[#101418]/60">
              {filteredSbom.map(pkg => (
                <tr key={pkg.id} className="hover:bg-[#151B20] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#F4F0E7]">
                    {pkg.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#A5ADB5]">
                    {pkg.version}
                  </td>
                  <td className="py-3 px-3 uppercase font-mono text-[10px] text-[#A5ADB5]">
                    {pkg.ecosystem}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#C6A85E]">
                    {pkg.license}
                  </td>
                  <td className="py-3 px-3 text-[#A5ADB5]">
                    {pkg.directDependency ? 'Direct Production' : 'Transitive / Edge Firmware'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {pkg.vulnerabilityCount > 0 ? (
                      <span className="text-[#B83A3A]">{pkg.vulnerabilityCount} CVE Detected</span>
                    ) : (
                      <span className="text-[#3D8255]">0 Findings (Clean)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CVE Detail Modal */}
      {selectedCve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#151B20] border border-[#303940] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-[#C6A85E]" />
                <h3 className="text-sm font-semibold text-[#F4F0E7]">
                  {selectedCve.cveId} Finding Analysis
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSeverityBadge(selectedCve.severity)}`}>
                  CVSS {selectedCve.cvssScore}
                </span>
              </div>
              <button
                onClick={() => setSelectedCve(null)}
                className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div>
                <h4 className="text-sm font-bold text-[#F4F0E7]">{selectedCve.title}</h4>
                <div className="text-[11px] text-[#A5ADB5] font-mono mt-1">
                  Affected: {selectedCve.affectedSoftware} ({selectedCve.packageVersion}) &rarr; Fixed in: <strong className="text-[#3D8255]">{selectedCve.fixedInVersion || 'Vendor Hotfix'}</strong>
                </div>
              </div>

              {selectedCve.vectorString && (
                <div className="p-2.5 rounded bg-[#101418] border border-[#303940] font-mono text-[10px] text-[#A5ADB5]">
                  Vector: {selectedCve.vectorString}
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#101418] border border-[#303940] space-y-1.5">
                <span className="text-[#C6A85E] font-semibold text-[11px] uppercase tracking-wider">
                  Remediation & Defense Guidance:
                </span>
                <p className="text-[#F4F0E7] leading-relaxed text-[11px]">
                  {selectedCve.remediationSteps}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[#A5ADB5]">
                <div>
                  <span>EPSS Exploit Prediction:</span>
                  <div className="font-mono text-[#F4F0E7] font-semibold mt-0.5">
                    {(selectedCve.epssScore * 100).toFixed(2)}% probability of active exploitation
                  </div>
                </div>
                <div>
                  <span>CISA Known Exploited Status:</span>
                  <div className="font-mono font-semibold mt-0.5">
                    {selectedCve.cisaKevStatus ? (
                      <span className="text-[#B83A3A]">YES - Mandated Remediation Timeline</span>
                    ) : (
                      <span className="text-[#3D8255]">No Active KEV Catalog Entry</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedCve(null)}
                  className="px-4 py-2 rounded-lg bg-[#303940] text-[#F4F0E7] hover:bg-[#46535D] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
