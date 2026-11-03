import React from 'react';
import { 
  Shield, 
  Database, 
  Bug, 
  Building2, 
  Truck, 
  Key, 
  Flame, 
  Sparkles, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export type MainNavTab = 
  | 'overview'
  | 'database_security'
  | 'threat_intelligence'
  | 'supplier_security'
  | 'supply_chain'
  | 'access_management'
  | 'incident_center'
  | 'ai_assistant'
  | 'audit_logs'
  | 'settings';

interface AppSidebarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  isCompact: boolean;
  onToggleCompact: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  criticalIncidentCount: number;
  openAlertCount: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  isCompact,
  onToggleCompact,
  isMobileOpen,
  onCloseMobile,
  criticalIncidentCount,
  openAlertCount,
}) => {
  const navItems = [
    { id: 'overview' as MainNavTab, label: 'Overview', icon: Shield },
    { id: 'database_security' as MainNavTab, label: 'Database Security', icon: Database, badge: '4 DBs' },
    { id: 'threat_intelligence' as MainNavTab, label: 'Threat Intelligence', icon: Bug, badge: 'CVEs' },
    { id: 'supplier_security' as MainNavTab, label: 'Supplier Security', icon: Building2 },
    { id: 'supply_chain' as MainNavTab, label: 'Supply Chain', icon: Truck, badge: 'Corridors' },
    { id: 'access_management' as MainNavTab, label: 'Access Management', icon: Key },
    { 
      id: 'incident_center' as MainNavTab, 
      label: 'Incident Center', 
      icon: Flame, 
      badge: criticalIncidentCount > 0 ? `${criticalIncidentCount} Open` : undefined,
      badgeColor: 'text-[#B83A3A] bg-[#B83A3A]/15 border-[#B83A3A]/40'
    },
    { id: 'ai_assistant' as MainNavTab, label: 'AI Security Assistant', icon: Sparkles, highlight: true },
    { id: 'audit_logs' as MainNavTab, label: 'Audit Logs', icon: FileText },
    { 
      id: 'settings' as MainNavTab, 
      label: 'Settings & Alerts', 
      icon: Settings,
      badge: openAlertCount > 0 ? `${openAlertCount} Rules` : undefined
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#101418] text-[#F4F0E7]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#303940] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1A2228] border border-[#C6A85E]/50 flex items-center justify-center text-[#C6A85E] shrink-0">
            <Shield className="w-4 h-4 text-[#C6A85E]" />
          </div>
          {!isCompact && (
            <div className="min-w-0">
              <div className="font-bold tracking-tight text-sm text-[#F4F0E7] flex items-center gap-1.5">
                <span>TRUST<strong className="text-[#C6A85E]">GUARD</strong></span>
              </div>
              <div className="text-[10px] text-[#A5ADB5] truncate">
                SecOps & SCM Platform
              </div>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              title={isCompact ? item.label : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group cursor-pointer ${
                isActive
                  ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940] font-medium'
                  : 'text-[#A5ADB5] hover:text-[#F4F0E7] hover:bg-[#151B20]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C6A85E]' : 'text-[#A5ADB5] group-hover:text-[#F4F0E7]'}`} />
                {!isCompact && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {!isCompact && item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  item.badgeColor || 'text-[#A5ADB5] bg-[#151B20] border-[#303940]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Compact Collapse Toggle */}
      <div className="p-2 border-t border-[#303940] hidden lg:flex items-center justify-between text-xs text-[#A5ADB5]">
        {!isCompact && (
          <div className="px-2 text-[10px] text-[#A5ADB5]">
            v2.4 Enterprise SEC-OPS
          </div>
        )}
        <button
          onClick={onToggleCompact}
          className="p-1.5 rounded-lg border border-[#303940] hover:bg-[#1A2228] text-[#A5ADB5] hover:text-[#F4F0E7] transition-colors ml-auto cursor-pointer"
          title={isCompact ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCompact ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 border-r border-[#303940] transition-all duration-200 ${
          isCompact ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 border-r border-[#303940]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
