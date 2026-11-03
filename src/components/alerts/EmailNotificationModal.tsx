import React from 'react';
import { Mail, X, CheckCircle2, ShieldAlert, Clock, Send, Copy, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types';

interface EmailNotificationModalProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  notification,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!notification || !notification.emailDetails) return null;

  const { emailDetails } = notification;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailDetails.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#151B20] border border-[#303940] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Email Client Header */}
        <div className="p-4 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#C6A85E]/15 border border-[#C6A85E]/30 text-[#C6A85E]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F4F0E7]">
                  Simulated Email Notification
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101418] text-[#A5ADB5] border border-[#303940]">
                  SMTP Mock Dispatcher
                </span>
              </div>
              <p className="text-[11px] text-[#A5ADB5]">
                Verified simulation dispatched via configured TrustGuard alert rule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7] hover:bg-[#101418] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Metadata Headers */}
        <div className="p-4 bg-[#101418] border-b border-[#303940] text-xs space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#A5ADB5]">From:</span>
            <span className="text-[#F4F0E7]">TrustGuard Alert Daemon &lt;alerts@trustguard.internal&gt;</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A5ADB5]">To:</span>
            <span className="text-[#C6A85E] font-medium">{emailDetails.recipient}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A5ADB5]">Sent At:</span>
            <span className="text-[#A5ADB5]">{emailDetails.sentAt}</span>
          </div>
          <div className="flex items-start justify-between pt-1 border-t border-[#303940]/60">
            <span className="text-[#A5ADB5]">Subject:</span>
            <span className="text-[#F4F0E7] font-semibold text-right truncate max-w-[420px]">
              {emailDetails.subject}
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-[#F4F0E7] whitespace-pre-wrap leading-relaxed bg-[#151B20]">
          {emailDetails.body}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#303940] bg-[#1A2228] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#A5ADB5] text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3D8255]" />
            <span>Simulated TLS 1.3 Transport Delivery Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-[#303940] text-[#A5ADB5] hover:text-[#F4F0E7] hover:bg-[#101418] transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy Plaintext'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#303940] text-[#F4F0E7] hover:bg-[#46535D] transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
