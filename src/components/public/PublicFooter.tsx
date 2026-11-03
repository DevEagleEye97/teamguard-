import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, Globe, Mail, Phone } from 'lucide-react';

interface PublicFooterProps {
  onSelectPublicSection: (sec: string) => void;
  onOpenSignIn: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onSelectPublicSection,
  onOpenSignIn,
}) => {
  return (
    <footer className="bg-[#101418] border-t border-[#303940] pt-12 pb-8 px-4 lg:px-8 text-xs text-[#A5ADB5]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1A2228] border border-[#C6A85E]/50 flex items-center justify-center text-[#C6A85E]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#F4F0E7]">
              TRUST<strong className="text-[#C6A85E]">GUARD</strong>
            </span>
          </div>
          <p className="text-[#A5ADB5] leading-relaxed max-w-sm text-[11.5px]">
            Intelligent Supply Chain & Data Security Platform engineered for mid-market manufacturing enterprises and industrial distribution corridors.
          </p>
          <div className="pt-2 text-[11px] text-[#A5ADB5] space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#3D8255]" />
              <span>TLS 1.3 Transport • AES-256-GCM Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A85E]" />
              <span>CIS Benchmark v8 & ISO 27001 Aligned Controls</span>
            </div>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="space-y-2">
          <h4 className="font-semibold text-[#F4F0E7] text-xs uppercase tracking-wider mb-2">
            Product Platform
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onSelectPublicSection('hero')} className="hover:text-[#F4F0E7] transition-colors">
                Control Tower & Map
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('features')} className="hover:text-[#F4F0E7] transition-colors">
                Database Security Vault
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('features')} className="hover:text-[#F4F0E7] transition-colors">
                Threat Intelligence & CVEs
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('features')} className="hover:text-[#F4F0E7] transition-colors">
                Supplier Security Scorecards
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('features')} className="hover:text-[#F4F0E7] transition-colors">
                Gemini AI Resilience Copilot
              </button>
            </li>
          </ul>
        </div>

        {/* Security & Compliance */}
        <div className="space-y-2">
          <h4 className="font-semibold text-[#F4F0E7] text-xs uppercase tracking-wider mb-2">
            Security & Trust
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onSelectPublicSection('security')} className="hover:text-[#F4F0E7] transition-colors">
                Security Architecture Spec
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('security')} className="hover:text-[#F4F0E7] transition-colors">
                Organization Data Isolation
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('documentation')} className="hover:text-[#F4F0E7] transition-colors">
                API Rate Limits & Authentication
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('documentation')} className="hover:text-[#F4F0E7] transition-colors">
                Vulnerability Disclosure Policy
              </button>
            </li>
            <li>
              <button onClick={() => onSelectPublicSection('documentation')} className="hover:text-[#F4F0E7] transition-colors">
                Audit Trail & Compliance
              </button>
            </li>
          </ul>
        </div>

        {/* Contact & Legal */}
        <div className="space-y-2">
          <h4 className="font-semibold text-[#F4F0E7] text-xs uppercase tracking-wider mb-2">
            Operations & Contact
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <span className="text-[#F4F0E7] font-medium">Chakan Operations Hub:</span>
              <div className="text-[10px] text-[#A5ADB5]">MIDC Phase II, Pune, MH</div>
            </li>
            <li>
              <span className="text-[#F4F0E7] font-medium">SecOps Hotline:</span>
              <div className="text-[10px] font-mono text-[#A5ADB5]">+91 20 6712 4000</div>
            </li>
            <li>
              <span className="text-[#F4F0E7] font-medium">Email Dispatcher:</span>
              <div className="text-[10px] font-mono text-[#A5ADB5]">secops@trustguard.internal</div>
            </li>
            <li className="pt-2">
              <button onClick={onOpenSignIn} className="text-[#C6A85E] hover:underline font-medium">
                Customer Portal Login &rarr;
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#303940]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A5ADB5]">
        <div>
          &copy; {new Date().getFullYear()} TrustGuard Platform India. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-[#F4F0E7] cursor-pointer">Privacy Policy</span>
          <span className="hover:text-[#F4F0E7] cursor-pointer">Terms of Service</span>
          <span className="hover:text-[#F4F0E7] cursor-pointer">Security Statement</span>
        </div>
      </div>
    </footer>
  );
};
