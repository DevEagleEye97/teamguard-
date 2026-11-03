import React from 'react';
import { 
  Radar, 
  Building2, 
  Boxes, 
  AlertTriangle, 
  Sparkles, 
  Network,
  ChevronRight,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';

export type ActiveTab = 
  | 'control_tower' 
  | 'suppliers' 
  | 'inventory' 
  | 'disruptions' 
  | 'ai_copilot' 
  | 'simulated_connectors';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  delayedShipmentCount: number;
  criticalStockoutCount: number;
  activeDisruptionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  delayedShipmentCount,
  criticalStockoutCount,
  activeDisruptionCount,
}) => {
  const navItems = [
    {
      id: 'control_tower' as ActiveTab,
      label: 'Control Tower',
      sublabel: 'Executive Cockpit',
      icon: Radar,
      badge: delayedShipmentCount > 0 ? `${delayedShipmentCount}` : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'disruptions' as ActiveTab,
      label: 'Disruption Intel',
      sublabel: 'Impact & Mitigation',
      icon: AlertTriangle,
      badge: activeDisruptionCount > 0 ? `${activeDisruptionCount} Active` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Inventory Intelligence',
      sublabel: 'DOI & Buffer Cover',
      icon: Boxes,
      badge: criticalStockoutCount > 0 ? `${criticalStockoutCount} At Risk` : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
    {
      id: 'suppliers' as ActiveTab,
      label: 'Supplier Management',
      sublabel: 'Reliability & Lead Times',
      icon: Building2,
      badge: '8 Vendors',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'ai_copilot' as ActiveTab,
      label: 'Gemini AI Copilot',
      sublabel: 'Scenario Shock Simulator',
      icon: Sparkles,
      badge: 'v3.8 Flash',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      highlight: true,
    },
    {
      id: 'simulated_connectors' as ActiveTab,
      label: 'ERP & ULIP Connectors',
      sublabel: 'Simulated Gateways',
      icon: Network,
      badge: 'Demo Feeds',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#0A0E17] border-r border-slate-800/80 flex flex-col shrink-0">
      {/* Platform Sub-banner */}
      <div className="p-4 border-b border-slate-800/60 hidden lg:block">
        <div className="bg-[#101624] rounded-xl p-3 border border-amber-500/20 gold-border-glow">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-300">Resilience Index</span>
            <span className="text-amber-400 font-mono font-semibold">72.4 / 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: '72.4%' }}></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Tier-1 Ready
            </span>
            <span className="text-slate-500">Auto Hub</span>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.08)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${isActive ? 'text-amber-200' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/60 hidden lg:block text-slate-400">
        <div className="bg-[#0D121D] rounded-lg p-2.5 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Primary Assembly</span>
            <span className="text-amber-400 font-mono">Chakan (Pune)</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>Active SKUs</span>
            <span>8 Monitored</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>Active Shipments</span>
            <span>6 Tracked</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
