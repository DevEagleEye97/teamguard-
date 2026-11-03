import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Sliders, 
  Trash2, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Server,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AlertRule, NotificationItem } from '../../types';
import { AlertConfigModal } from '../alerts/AlertConfigModal';

interface SettingsAlertsViewProps {
  alertRules: AlertRule[];
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onAddNewRule: (newRule: AlertRule) => void;
  onTestTriggerRule: (rule: AlertRule) => void;
  notifications: NotificationItem[];
  onOpenEmailPreview: (notif: NotificationItem) => void;
}

export const SettingsAlertsView: React.FC<SettingsAlertsViewProps> = ({
  alertRules,
  onToggleRule,
  onDeleteRule,
  onAddNewRule,
  onTestTriggerRule,
  notifications,
  onOpenEmailPreview,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'dispatcher'>('rules');

  const simulatedEmailNotifications = notifications.filter(n => n.emailSimulated);

  return (
    <div className="space-y-5 text-[#F4F0E7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A2228] border border-[#303940]">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F0E7] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C6A85E]" />
            <span>Alerting & Notification Configuration Engine</span>
          </h2>
          <p className="text-[11px] text-[#A5ADB5] mt-0.5">
            Configure custom threshold criteria across shipment delays, supplier risk degradation, inventory buffer cover, and database threat anomalies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Alert Rule</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-[#303940] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]'
              : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Configured Threshold Rules ({alertRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatcher')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dispatcher'
              ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]'
              : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Simulated Email Dispatch Log ({simulatedEmailNotifications.length})</span>
        </button>
      </div>

      {activeTab === 'rules' ? (
        /* Rules Table & Cards */
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {alertRules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rule.isEnabled
                    ? 'bg-[#1A2228] border-[#303940]'
                    : 'bg-[#151B20] border-[#303940]/40 opacity-60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#F4F0E7]">
                      {rule.name}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                      rule.severity === 'critical' ? 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40' : 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/40'
                    }`}>
                      {rule.severity}
                    </span>
                    <span className="text-[10px] font-mono text-[#C6A85E] bg-[#101418] px-2 py-0.5 rounded border border-[#303940]">
                      Condition: {rule.metric} {rule.operator} {rule.threshold}
                    </span>
                  </div>

                  <p className="text-xs text-[#A5ADB5] mt-1.5 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-[#A5ADB5]">
                    <span className="flex items-center gap-1 text-[#F4F0E7]">
                      <Bell className="w-3.5 h-3.5 text-[#C6A85E]" />
                      <span>In-App: {rule.channels.inApp ? 'Enabled' : 'Disabled'}</span>
                    </span>

                    <span className="flex items-center gap-1 text-[#F4F0E7]">
                      <Mail className="w-3.5 h-3.5 text-[#C6A85E]" />
                      <span>Email Simulation: {rule.channels.email ? rule.channels.emailRecipients.join(', ') : 'Off'}</span>
                    </span>

                    <span className="text-[#A5ADB5] font-mono">
                      Triggered: {rule.triggerCount} times
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[#303940] pt-2 md:pt-0 md:pl-4">
                  <button
                    onClick={() => onTestTriggerRule(rule)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#C6A85E]/40 text-[#C6A85E] hover:bg-[#C6A85E]/10 transition-colors cursor-pointer flex items-center gap-1"
                    title="Simulate immediate threshold breach and dispatch notifications"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Trigger</span>
                  </button>

                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                      rule.isEnabled
                        ? 'bg-[#3D8255]/20 text-[#3D8255] border-[#3D8255]/40'
                        : 'bg-[#303940]/30 text-[#A5ADB5] border-[#303940]'
                    }`}
                  >
                    {rule.isEnabled ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-[#A5ADB5] hover:text-[#B83A3A] transition-colors cursor-pointer"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Simulated Email Dispatch Log */
        <div className="space-y-3">
          <div className="p-3 bg-[#151B20] rounded-lg border border-[#303940] text-xs text-[#A5ADB5] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#C6A85E]" />
              <span>Simulated SMTP Mock Server active at <code className="text-[#F4F0E7]">smtp.trustguard.internal:587</code></span>
            </span>
            <span className="text-[10px] font-mono text-[#3D8255]">TLS 1.3 Synthetic Gateway</span>
          </div>

          <div className="space-y-2">
            {simulatedEmailNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => onOpenEmailPreview(notif)}
                className="p-3.5 rounded-xl bg-[#1A2228] border border-[#303940] hover:border-[#C6A85E]/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#C6A85E] bg-[#101418] px-2 py-0.5 rounded border border-[#303940]">
                      To: {notif.emailDetails?.recipient || 'security-lead@apex.co.in'}
                    </span>
                    <span className="font-mono text-[10px] text-[#A5ADB5]">
                      {notif.emailDetails?.sentAt || notif.timestamp}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#F4F0E7] mt-1.5">
                    {notif.emailDetails?.subject || notif.title}
                  </h4>
                  <p className="text-[11px] text-[#A5ADB5] mt-0.5 line-clamp-1 font-mono">
                    {notif.emailDetails?.body.split('\n')[2] || notif.message}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEmailPreview(notif);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#C6A85E] bg-[#C6A85E]/15 border border-[#C6A85E]/30 hover:bg-[#C6A85E]/25 transition-colors shrink-0 cursor-pointer"
                >
                  View Dispatched Email &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <AlertConfigModal
          onClose={() => setShowConfigModal(false)}
          onSaveRule={onAddNewRule}
          onTestTriggerRule={onTestTriggerRule}
        />
      )}
    </div>
  );
};
