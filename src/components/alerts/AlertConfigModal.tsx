import React, { useState } from 'react';
import { X, Plus, CheckCircle2, Sliders, Mail, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { AlertRule, AlertMetricType, SeverityLevel } from '../../types';

interface AlertConfigModalProps {
  onClose: () => void;
  onSaveRule: (newRule: AlertRule) => void;
  onTestTriggerRule: (rule: AlertRule) => void;
}

const METRIC_OPTIONS: { value: AlertMetricType; label: string; unit: string; category: AlertRule['category'] }[] = [
  { value: 'shipment_delay_hours', label: 'Shipment Delay Duration', unit: 'Hours', category: 'shipment_delay' },
  { value: 'supplier_risk_score', label: 'Supplier Reliability Score', unit: 'Score (0-100)', category: 'supplier_risk' },
  { value: 'inventory_days_cover', label: 'Inventory Buffer Cover (DOI)', unit: 'Days of Cover', category: 'inventory_stockout' },
  { value: 'db_failed_logins_24h', label: 'Database Failed Logins (24h)', unit: 'Failed Attempts', category: 'database_threat' },
  { value: 'cve_cvss_threshold', label: 'CVE Vulnerability CVSS Score', unit: 'CVSS Score (0-10)', category: 'cve_vulnerability' },
];

export const AlertConfigModal: React.FC<AlertConfigModalProps> = ({
  onClose,
  onSaveRule,
  onTestTriggerRule,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metric, setMetric] = useState<AlertMetricType>('shipment_delay_hours');
  const [operator, setOperator] = useState<'>' | '<' | '>=' | '<=' | '=='>('>');
  const [threshold, setThreshold] = useState<number>(24);
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(true);
  const [emailRecipients, setEmailRecipients] = useState('secops-alerts@apex.co.in, plant-lead@apex.co.in');

  const selectedMetricObj = METRIC_OPTIONS.find(m => m.value === metric) || METRIC_OPTIONS[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name,
      category: selectedMetricObj.category,
      description: description || `Triggers alert when ${selectedMetricObj.label} is ${operator} ${threshold} ${selectedMetricObj.unit}.`,
      metric,
      operator,
      threshold: Number(threshold),
      severity,
      channels: {
        inApp,
        email,
        emailRecipients: emailRecipients.split(',').map(s => s.trim()).filter(Boolean)
      },
      isEnabled: true,
      triggerCount: 0
    };

    onSaveRule(newRule);
    onClose();
  };

  const handleTestTrigger = () => {
    const testRule: AlertRule = {
      id: `rule-test-${Date.now()}`,
      name: name || `Test Rule: ${selectedMetricObj.label}`,
      category: selectedMetricObj.category,
      description: description || `Test rule evaluation for ${selectedMetricObj.label}`,
      metric,
      operator,
      threshold: Number(threshold),
      severity,
      channels: {
        inApp,
        email,
        emailRecipients: emailRecipients.split(',').map(s => s.trim()).filter(Boolean)
      },
      isEnabled: true,
      triggerCount: 1
    };

    onTestTriggerRule(testRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#151B20] border border-[#303940] rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C6A85E]" />
            <h3 className="text-sm font-semibold text-[#F4F0E7]">
              Configure Custom Alert Rule
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Rule Name */}
          <div>
            <label className="block text-[#A5ADB5] font-medium mb-1">
              Rule Name <span className="text-[#C6A85E]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Critical Highway Delay Alert"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#A5ADB5] font-medium mb-1">
              Description & Purpose
            </label>
            <input
              type="text"
              placeholder="Optional summary for SecOps and procurement on-call..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
            />
          </div>

          {/* Condition Builder */}
          <div className="p-3.5 bg-[#101418] rounded-xl border border-[#303940] space-y-3">
            <div className="text-[11px] font-semibold text-[#C6A85E] uppercase tracking-wider">
              Trigger Condition
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <label className="block text-[11px] text-[#A5ADB5] mb-1">Target Metric</label>
                <select
                  value={metric}
                  onChange={(e) => {
                    const m = e.target.value as AlertMetricType;
                    setMetric(m);
                    if (m === 'supplier_risk_score' || m === 'inventory_days_cover') {
                      setOperator('<');
                      setThreshold(m === 'supplier_risk_score' ? 70 : 3);
                    } else if (m === 'cve_cvss_threshold') {
                      setOperator('>=');
                      setThreshold(8.5);
                    } else if (m === 'db_failed_logins_24h') {
                      setOperator('>=');
                      setThreshold(20);
                    } else {
                      setOperator('>');
                      setThreshold(24);
                    }
                  }}
                  className="w-full bg-[#1A2228] border border-[#303940] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0E7] focus:outline-none"
                >
                  {METRIC_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#A5ADB5] mb-1">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as any)}
                  className="w-full bg-[#1A2228] border border-[#303940] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0E7] focus:outline-none"
                >
                  <option value=">">Greater than (&gt;)</option>
                  <option value=">=">Greater than or equal (&gt;=)</option>
                  <option value="<">Less than (&lt;)</option>
                  <option value="<=">Less than or equal (&lt;=)</option>
                  <option value="==">Equals (==)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#A5ADB5] mb-1">
                  Threshold ({selectedMetricObj.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full bg-[#1A2228] border border-[#303940] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0E7] focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[11px] text-[#A5ADB5] font-mono pt-1">
              Rule Logic: <code className="text-[#C6A85E]">{metric} {operator} {threshold}</code>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[#A5ADB5] font-medium mb-1">
              Alert Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map(sev => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                    severity === sev
                      ? sev === 'critical'
                        ? 'bg-[#B83A3A]/20 text-[#B83A3A] border-[#B83A3A]'
                        : sev === 'high'
                        ? 'bg-[#C98A2C]/20 text-[#C98A2C] border-[#C98A2C]'
                        : sev === 'medium'
                        ? 'bg-[#C6A85E]/20 text-[#C6A85E] border-[#C6A85E]'
                        : 'bg-[#3D8255]/20 text-[#3D8255] border-[#3D8255]'
                      : 'bg-[#101418] text-[#A5ADB5] border-[#303940]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-2 pt-1 border-t border-[#303940]">
            <label className="block text-[#A5ADB5] font-medium">
              Dispatch Channels
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F4F0E7]">
                <input
                  type="checkbox"
                  checked={inApp}
                  onChange={(e) => setInApp(e.target.checked)}
                  className="rounded border-[#303940] text-[#C6A85E] focus:ring-0"
                />
                <Bell className="w-3.5 h-3.5 text-[#C6A85E]" />
                <span>In-App Notification Center & Real-Time Alert Stream</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F4F0E7]">
                <input
                  type="checkbox"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                  className="rounded border-[#303940] text-[#C6A85E] focus:ring-0"
                />
                <Mail className="w-3.5 h-3.5 text-[#C6A85E]" />
                <span>Simulated Email Notification Dispatch</span>
              </label>
            </div>

            {email && (
              <div className="pl-6 pt-1">
                <label className="block text-[11px] text-[#A5ADB5] mb-1">
                  Recipient Email Addresses (comma-separated)
                </label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0E7] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#303940] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestTrigger}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-[#C6A85E]/40 text-[#C6A85E] hover:bg-[#C6A85E]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Trigger Now</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#1A2228] text-[#A5ADB5] hover:text-[#F4F0E7] border border-[#303940] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer"
              >
                Save Alert Rule
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
