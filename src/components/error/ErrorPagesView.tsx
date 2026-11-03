import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  AlertTriangle, 
  FileQuestion, 
  Clock, 
  Gauge, 
  ServerCrash, 
  Network, 
  WifiOff, 
  RotateCcw, 
  Home, 
  HelpCircle,
  Copy,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export type ErrorCode = 
  | '400' 
  | '401' 
  | '403' 
  | '404' 
  | '408' 
  | '429' 
  | '500' 
  | '502' 
  | '503' 
  | 'offline';

interface ErrorInfo {
  code: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  technicalDetails: string;
  suggestedAction: string;
  icon: React.ElementType;
  severityColor: string;
}

const ERROR_DEFINITIONS: Record<ErrorCode, ErrorInfo> = {
  '400': {
    code: '400',
    badge: 'BAD REQUEST',
    title: 'Invalid Request Payload',
    subtitle: 'Malformed parameters or invalid payload format rejected by API gateway.',
    description: 'The server could not understand the request due to invalid syntax or an unsupported filter schema in your telemetry query.',
    technicalDetails: 'Headers validation failed: Missing or malformed tenant boundary parameter in JSON payload. No stack trace is exposed per security policy.',
    suggestedAction: 'Verify query parameters against API v2 spec or reset filter parameters to defaults.',
    icon: AlertTriangle,
    severityColor: '#C6A85E',
  },
  '401': {
    code: '401',
    badge: 'UNAUTHORIZED',
    title: 'Authentication Required',
    subtitle: 'Session token expired, missing, or invalidated by security policy.',
    description: 'Access to this manufacturing security cluster requires valid cryptographic credentials. Your session may have timed out or been revoked.',
    technicalDetails: 'Authorization header: Bearer token is invalid or expired. Session token must be renewed via login flow.',
    suggestedAction: 'Sign in again with your corporate credentials and hardware security key.',
    icon: Lock,
    severityColor: '#C6A85E',
  },
  '403': {
    code: '403',
    badge: 'FORBIDDEN',
    title: 'Access Prohibited (RBAC Boundary)',
    subtitle: 'User account lacks required administrative privileges for this resource.',
    description: 'You are authenticated, but your designated role does not have authorization to inspect or alter this database encryption vault.',
    technicalDetails: 'Permission check failed: User role does not contain secops:admin or db:crypto_vault grant for target subsystem.',
    suggestedAction: 'Request an elevated role grant from your organization administrator or CISO.',
    icon: ShieldAlert,
    severityColor: '#B83A3A',
  },
  '404': {
    code: '404',
    badge: 'NOT FOUND',
    title: 'Resource Not Found',
    subtitle: 'The requested asset, corridor route, or security report does not exist.',
    description: 'The shipment tracking code, database identifier, or telemetry view URL you requested could not be located in this organization scope.',
    technicalDetails: 'Resource URI resolution returned null. Asset may have been archived or reassigned to a different regional cluster.',
    suggestedAction: 'Return to the Control Tower dashboard or use the global search to locate the active asset.',
    icon: FileQuestion,
    severityColor: '#A5ADB5',
  },
  '408': {
    code: '408',
    badge: 'REQUEST TIMEOUT',
    title: 'Upstream Request Timeout',
    subtitle: 'The corridor telemetry engine did not respond within the allocated window.',
    description: 'The server timed out waiting for the remote sensor telemetry feed or database cluster heartbeat response.',
    technicalDetails: 'Socket idle timeout threshold (15,000ms) exceeded waiting for telemetry gateway response. Connection cleanly closed.',
    suggestedAction: 'Check your network connection and retry the query, or inspect edge node latency.',
    icon: Clock,
    severityColor: '#C6A85E',
  },
  '429': {
    code: '429',
    badge: 'RATE LIMIT EXCEEDED',
    title: 'Too Many Requests',
    subtitle: 'API throttle threshold reached to protect cluster resilience.',
    description: 'You have sent too many requests in a short period. TrustGuard enforces token-bucket rate limiting to prevent denial of service and API quota exhaustion.',
    technicalDetails: 'HTTP 429: Exceeded rate limit of 120 req/min for current API client. Retry-After: 35s. Rate limiting enforced per tenant.',
    suggestedAction: 'Wait 30 seconds before retrying or batch your telemetry requests using bulk endpoints.',
    icon: Gauge,
    severityColor: '#C6A85E',
  },
  '500': {
    code: '500',
    badge: 'INTERNAL SERVER ERROR',
    title: 'Unexpected Server Condition',
    subtitle: 'An unexpected exception occurred while processing telemetry.',
    description: 'An internal error occurred on our security servers. Our SecOps engineering on-call has been automatically notified with an encrypted incident trace.',
    technicalDetails: 'Trace ID: trc_e89a4f21-7b91-4c28-98e0-9943fa110d18. Server error sanitized per zero-leakage security policy.',
    suggestedAction: 'Reload the dashboard. If the issue persists, contact the internal emergency response desk.',
    icon: ServerCrash,
    severityColor: '#B83A3A',
  },
  '502': {
    code: '502',
    badge: 'BAD GATEWAY',
    title: 'Invalid Upstream Response',
    subtitle: 'Edge proxy received an invalid response from an upstream microservice.',
    description: 'The TrustGuard API reverse proxy received an invalid or empty response from an internal logistics gateway or database shard.',
    technicalDetails: 'Proxy status: upstream connect failure or protocol violation while routing to backend telemetry service.',
    suggestedAction: 'Wait a few seconds for automatic failover to the secondary replica and retry.',
    icon: Network,
    severityColor: '#B83A3A',
  },
  '503': {
    code: '503',
    badge: 'SERVICE UNAVAILABLE',
    title: 'Service Temporarily Offline',
    subtitle: 'Scheduled maintenance or automated failover is actively in progress.',
    description: 'The security operations cluster is temporarily unable to handle the request due to rolling zero-downtime database upgrades or traffic failover.',
    technicalDetails: 'Cluster status: Maintenance mode active on primary zone. Automatic failover to secondary replica in progress.',
    suggestedAction: 'Please check back in 1 to 2 minutes or monitor cluster status on our status page.',
    icon: ServerCrash,
    severityColor: '#C6A85E',
  },
  'offline': {
    code: 'OFFLINE',
    badge: 'NETWORK DISCONNECTED',
    title: 'No Internet / Network Connection',
    subtitle: 'Your device cannot establish communication with TrustGuard servers.',
    description: 'It appears you are currently disconnected from the local network or the internet. Live telemetry streaming has been paused to conserve local state.',
    technicalDetails: 'Client network state: Navigator online is false. Local storage buffer is preserving unsaved telemetry preferences.',
    suggestedAction: 'Check your Wi-Fi, Ethernet, or mobile data connection. Telemetry streaming will resume automatically when reconnected.',
    icon: WifiOff,
    severityColor: '#B83A3A',
  },
};

interface ErrorPagesViewProps {
  initialCode?: ErrorCode;
  onNavigateHome: () => void;
  onRetry?: () => void;
}

export const ErrorPagesView: React.FC<ErrorPagesViewProps> = ({
  initialCode = '404',
  onNavigateHome,
  onRetry,
}) => {
  const [selectedCode, setSelectedCode] = useState<ErrorCode>(initialCode);
  const [copiedTrace, setCopiedTrace] = useState(false);

  const error = ERROR_DEFINITIONS[selectedCode] || ERROR_DEFINITIONS['404'];
  const Icon = error.icon;

  const handleCopyTrace = () => {
    navigator.clipboard.writeText(`Trace ID: trc_e89a4f21-7b91-4c28-98e0-9943fa110d18 | Error: ${error.code} ${error.badge}`);
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Error Code Switcher Bar */}
      <div className="p-3.5 bg-[#151B20] border border-[#303940] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#C6A85E]" />
          <span className="font-semibold text-[#F4F0E7]">Error View Simulator:</span>
          <span className="text-[11px] text-[#A5ADB5]">
            Inspect all 10 standard production error pages and fallback handling
          </span>
        </div>

        {/* Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {(Object.keys(ERROR_DEFINITIONS) as ErrorCode[]).map((codeKey) => {
            const isSelected = selectedCode === codeKey;
            return (
              <button
                key={codeKey}
                onClick={() => setSelectedCode(codeKey)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#C6A85E] text-[#101418]'
                    : 'bg-[#101418] text-[#A5ADB5] border border-[#303940] hover:text-[#F4F0E7]'
                }`}
              >
                {codeKey.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Error Presentation Card */}
      <div className="p-8 sm:p-12 rounded-2xl bg-[#151B20] border border-[#303940] max-w-4xl mx-auto shadow-2xl space-y-8">
        {/* Error Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-[#303940] pb-8">
          <div 
            className="w-16 h-16 rounded-2xl bg-[#1A2228] border border-[#303940] flex items-center justify-center shrink-0 shadow-inner"
            style={{ borderColor: `${error.severityColor}40` }}
          >
            <Icon className="w-8 h-8" style={{ color: error.severityColor }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F0E7]">
                {error.code}
              </span>
              <span 
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{ 
                  color: error.severityColor, 
                  backgroundColor: `${error.severityColor}15`,
                  borderColor: `${error.severityColor}40`
                }}
              >
                {error.badge}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F4F0E7]">
              {error.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#A5ADB5]">
              {error.subtitle}
            </p>
          </div>
        </div>

        {/* Error Context & Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#101418] border border-[#303940] space-y-2">
            <div className="font-semibold text-[#F4F0E7] flex items-center gap-1.5">
              <span>Operational Impact</span>
            </div>
            <p className="text-[#A5ADB5] leading-relaxed text-[11.5px]">
              {error.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101418] border border-[#303940] space-y-2">
            <div className="font-semibold text-[#C6A85E] flex items-center gap-1.5">
              <span>Recommended Operator Action</span>
            </div>
            <p className="text-[#A5ADB5] leading-relaxed text-[11.5px]">
              {error.suggestedAction}
            </p>
          </div>
        </div>

        {/* Technical Diagnostics (Sanitized - Zero Leakage) */}
        <div className="p-4 rounded-xl bg-[#101418] border border-[#303940] space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#A5ADB5]">
            <span className="font-semibold text-xs text-[#F4F0E7]">Sanitized Telemetry Trace</span>
            <button
              onClick={handleCopyTrace}
              className="flex items-center gap-1 text-[10px] text-[#A5ADB5] hover:text-[#F4F0E7] cursor-pointer"
            >
              {copiedTrace ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#3D8255]" />
                  <span className="text-[#3D8255]">Copied Trace</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Incident Reference</span>
                </>
              )}
            </button>
          </div>

          <div className="p-2.5 bg-[#151B20] rounded border border-[#303940] text-[#A5ADB5] space-y-1">
            <div><span className="text-[#C6A85E]">Incident Ref:</span> trc_e89a4f21-7b91-4c28-98e0-9943fa110d18</div>
            <div><span className="text-[#C6A85E]">Diagnostic:</span> {error.technicalDetails}</div>
            <div className="text-[10px] text-[#A5ADB5]/70 pt-1 border-t border-[#303940]/50">
              Zero-leakage policy active: stack traces, DB credentials, and private keys omitted from user responses.
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Operations Console</span>
            </button>

            <button
              onClick={() => {
                if (onRetry) onRetry();
                else window.location.reload();
              }}
              className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#1A2228] border border-[#303940] text-[#F4F0E7] hover:border-[#C6A85E]/50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          </div>

          <div className="text-[11px] text-[#A5ADB5] flex items-center gap-2">
            <span>SecOps On-Call:</span>
            <code className="text-[#C6A85E]">secops@trustguard.internal</code>
          </div>
        </div>
      </div>
    </div>
  );
};
