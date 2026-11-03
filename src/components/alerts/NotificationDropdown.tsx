import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  Settings, 
  X,
  Trash2,
  Clock
} from 'lucide-react';
import { NotificationItem, SeverityLevel } from '../../types';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  onOpenEmailPreview: (notif: NotificationItem) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  onOpenEmailPreview,
  onOpenSettings,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'email'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'email') return n.emailSimulated;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/30';
      case 'high':
        return 'text-[#C98A2C] bg-[#C98A2C]/15 border-[#C98A2C]/30';
      case 'medium':
        return 'text-[#C6A85E] bg-[#C6A85E]/15 border-[#C6A85E]/30';
      default:
        return 'text-[#A5ADB5] bg-[#303940]/30 border-[#303940]';
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 sm:w-[440px] bg-[#151B20] border border-[#303940] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[540px] animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-3.5 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#C6A85E]" />
          <h3 className="text-xs font-semibold text-[#F4F0E7]">
            Notification Center
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#B83A3A] text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-[#A5ADB5] hover:text-[#C6A85E] transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-[#101418] border-b border-[#303940] text-xs">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'email', label: 'Simulated Emails' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]'
                : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-[#303940]/60">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#A5ADB5]">
            No notifications in this view
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectNotification(item)}
              className={`p-3 hover:bg-[#1A2228] transition-colors cursor-pointer text-xs ${
                !item.read ? 'bg-[#1A2228]/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                  <span className="text-[10px] text-[#A5ADB5] bg-[#101418] px-1.5 py-0.2 rounded border border-[#303940]">
                    {item.category}
                  </span>
                  {!item.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6A85E]"></span>
                  )}
                </div>

                <span className="text-[10px] text-[#A5ADB5] font-mono shrink-0">
                  {item.timestamp}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-[#F4F0E7] mt-1 leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-[#A5ADB5] mt-1 leading-relaxed line-clamp-2">
                {item.message}
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#303940]/40">
                <span className="text-[10px] text-[#A5ADB5] font-mono">
                  Target: {item.entityType} ({item.entityId})
                </span>

                <div className="flex items-center gap-2">
                  {item.emailSimulated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmailPreview(item);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#C6A85E]/15 text-[#C6A85E] border border-[#C6A85E]/30 hover:bg-[#C6A85E]/25 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>View Email</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNotification(item);
                    }}
                    className="text-[11px] text-[#A5ADB5] hover:text-[#F4F0E7] transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#1A2228] border-t border-[#303940] flex items-center justify-between text-xs">
        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="text-[11px] text-[#C6A85E] hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configure Custom Alert Rules</span>
        </button>

        <span className="text-[10px] text-[#A5ADB5]">
          TrustGuard Alerting v2.4
        </span>
      </div>
    </div>
  );
};
