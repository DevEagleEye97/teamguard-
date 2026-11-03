import React from 'react';
import { Shield, Lock, Server, CheckCircle2, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WorkspaceFooterProps {
  onOpenHelpOrError?: () => void;
  onOpenPrivacySpec?: () => void;
}

export const WorkspaceFooter: React.FC<WorkspaceFooterProps> = ({
  onOpenHelpOrError,
  onOpenPrivacySpec,
}) => {
  const { organization, user } = useAuth();

  return (
    <footer className="bg-[#151B20] border-t border-[#303940] px-4 lg:px-6 py-2.5 text-[11px] text-[#A5ADB5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
      {/* Left Organization Tenancy info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-[#F4F0E7]">
          <Shield className="w-3.5 h-3.5 text-[#C6A85E]" />
          <span>TrustGuard Enterprise Workspace</span>
        </div>
        <span className="text-[#303940] hidden sm:inline">•</span>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
          <span>Tenant:</span>
          <span className="text-[#C6A85E] truncate max-w-[150px]">{organization?.name || 'Apex Auto Corp'}</span>
          <code className="text-[#A5ADB5] hidden md:inline">({organization?.id?.slice(0, 16)}...)</code>
        </div>
      </div>

      {/* Right compliance & links */}
      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5 text-[#3D8255]">
          <Lock className="w-3 h-3" />
          <span className="font-mono">TLS 1.3 / AES-256-GCM Active</span>
        </div>

        <span className="text-[#303940] hidden sm:inline">•</span>

        <div className="flex items-center gap-1 text-[#A5ADB5]">
          <Server className="w-3 h-3 text-[#C6A85E]" />
          <span>SLA: 99.95%</span>
        </div>

        {onOpenHelpOrError && (
          <button
            onClick={onOpenHelpOrError}
            className="text-[#A5ADB5] hover:text-[#C6A85E] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Diagnostics & Error Previews</span>
          </button>
        )}
      </div>
    </footer>
  );
};
