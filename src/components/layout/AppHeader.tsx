import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  ChevronRight, 
  User, 
  Building, 
  Layers, 
  Sparkles,
  Info,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  LogOut,
  Settings,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { NotificationDropdown } from '../alerts/NotificationDropdown';
import { NotificationItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  currentTab: string;
  tabLabel: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  onOpenEmailPreview: (notif: NotificationItem) => void;
  onOpenSettings: (section?: string) => void;
  onOpenErrorSimulator: () => void;
  onOpenPublicSite: () => void;
  selectedWorkspace: string;
  onSelectWorkspace: (ws: string) => void;
  onToggleSidebarMobile: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  tabLabel,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  onOpenEmailPreview,
  onOpenSettings,
  onOpenErrorSimulator,
  onOpenPublicSite,
  selectedWorkspace,
  onSelectWorkspace,
  onToggleSidebarMobile,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const { theme, setTheme } = useTheme();
  const { user, organization, logout } = useAuth();

  const profileRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#151B20] border-b border-[#303940] px-4 lg:px-6 py-2.5 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-1.5 rounded-lg border border-[#303940] text-[#A5ADB5] hover:text-[#F4F0E7] cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#A5ADB5]">
            <span 
              onClick={onOpenPublicSite}
              className="text-[#F4F0E7] font-semibold hover:text-[#C6A85E] cursor-pointer transition-colors"
            >
              TrustGuard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#303940]" />
            <span>Operations</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#303940]" />
            <span className="text-[#C6A85E] font-medium">{tabLabel}</span>
          </nav>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-sm mx-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets, CVEs, databases, e-Way bills..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#101418] border border-[#303940] focus:border-[#C6A85E]/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F0E7] placeholder-[#A5ADB5]/70 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right workspace, theme selector, notifications, help, profile */}
        <div className="flex items-center gap-2">
          {/* Workspace selector */}
          <div className="hidden xl:flex items-center gap-1.5 bg-[#101418] border border-[#303940] rounded-lg px-2.5 py-1 text-xs">
            <Building className="w-3.5 h-3.5 text-[#C6A85E]" />
            <select
              value={selectedWorkspace}
              onChange={(e) => onSelectWorkspace(e.target.value)}
              className="bg-transparent text-[#F4F0E7] text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="Apex-Chakan" className="bg-[#151B20]">Apex Chakan Hub & Cloud DBs</option>
              <option value="Apex-Hosur" className="bg-[#151B20]">Hosur SIPCOT Assembly Plant</option>
              <option value="Apex-All" className="bg-[#151B20]">All Manufacturing Units</option>
            </select>
          </div>

          {/* Theme Selection Toggle */}
          <div className="flex items-center bg-[#101418] border border-[#303940] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                theme === 'light' ? 'bg-[#1A2228] text-[#C6A85E]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-[#1A2228] text-[#C6A85E]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="Dark theme (Default)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                theme === 'system' ? 'bg-[#1A2228] text-[#C6A85E]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="System theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Help & Error Diagnostics Dropdown */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => setShowHelpMenu(!showHelpMenu)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                showHelpMenu
                  ? 'bg-[#1A2228] border-[#C6A85E] text-[#C6A85E]'
                  : 'bg-[#101418] border-[#303940] text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="Help, Docs & Error Fallback Views"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showHelpMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#151B20] border border-[#303940] rounded-xl shadow-2xl p-2 z-50 text-xs text-[#F4F0E7] space-y-1">
                <div className="px-3 py-2 border-b border-[#303940]">
                  <div className="font-semibold text-xs text-[#F4F0E7]">Help & Diagnostics</div>
                  <div className="text-[10px] text-[#A5ADB5]">TrustGuard Platform Docs</div>
                </div>

                <button
                  onClick={() => {
                    onOpenErrorSimulator();
                    setShowHelpMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1A2228] text-[#C6A85E] flex items-center justify-between cursor-pointer font-medium"
                >
                  <span>Error & Fallback Pages</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C6A85E]/20 text-[#C6A85E]">
                    10 Views
                  </span>
                </button>

                <button
                  onClick={() => {
                    onOpenPublicSite();
                    setShowHelpMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1A2228] text-[#F4F0E7] flex items-center justify-between cursor-pointer"
                >
                  <span>Public Landing & Features</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#A5ADB5]" />
                </button>

                <div className="pt-1 border-t border-[#303940] px-3 py-1.5 text-[10px] text-[#A5ADB5]">
                  SecOps Response Desk: +91 20 6712 4000
                </div>
              </div>
            )}
          </div>

          {/* Notification Center Bell & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg border transition-colors relative cursor-pointer ${
                showNotifications
                  ? 'bg-[#1A2228] border-[#C6A85E] text-[#C6A85E]'
                  : 'bg-[#101418] border-[#303940] text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="Notifications & Simulated Email Dispatches"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B83A3A] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationDropdown
                notifications={notifications}
                onMarkAllAsRead={onMarkAllAsRead}
                onSelectNotification={(n) => {
                  onSelectNotification(n);
                  setShowNotifications(false);
                }}
                onOpenEmailPreview={(n) => {
                  onOpenEmailPreview(n);
                  setShowNotifications(false);
                }}
                onOpenSettings={() => {
                  onOpenSettings('notifications');
                  setShowNotifications(false);
                }}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* User Profile & Account Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 border-l border-[#303940] hover:opacity-90 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1A2228] border border-[#303940] flex items-center justify-center text-[#C6A85E] text-xs font-semibold overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  `${user?.firstName?.[0] || 'R'}${user?.lastName?.[0] || 'D'}`
                )}
              </div>
              <div className="text-left text-xs hidden lg:block">
                <div className="font-medium text-[#F4F0E7] leading-tight flex items-center gap-1">
                  <span>{user?.firstName ? `${user.firstName} ${user.lastName}` : 'R. Deshmukh'}</span>
                  <ChevronDown className="w-3 h-3 text-[#A5ADB5]" />
                </div>
                <div className="text-[10px] text-[#A5ADB5] truncate max-w-[110px]">{user?.title || 'CISO & SecOps Lead'}</div>
              </div>
            </button>

            {/* Profile Menu Popup */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#151B20] border border-[#303940] rounded-xl shadow-2xl p-2.5 z-50 text-xs text-[#F4F0E7] space-y-1.5">
                {/* User Header */}
                <div className="p-3 bg-[#101418] rounded-lg border border-[#303940] space-y-1">
                  <div className="font-semibold text-xs text-[#F4F0E7]">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'R. Deshmukh'}
                  </div>
                  <div className="text-[11px] text-[#A5ADB5] font-mono truncate">{user?.email || 'r.deshmukh@apex.co.in'}</div>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-[#A5ADB5]">Role:</span>
                    <span className="font-mono text-[#C6A85E] font-bold">{user?.role?.toUpperCase() || 'ADMIN'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#A5ADB5]">User UUID:</span>
                    <span className="text-[#A5ADB5] truncate max-w-[120px]">{user?.id?.slice(0, 14)}...</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#A5ADB5]">Org UUID:</span>
                    <span className="text-[#A5ADB5] truncate max-w-[120px]">{organization?.id?.slice(0, 14)}...</span>
                  </div>
                </div>

                {/* Navigation links */}
                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => {
                      onOpenSettings('personal');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1A2228] text-[#F4F0E7] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#C6A85E]" />
                    <span>Account Settings & Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSettings('sessions');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1A2228] text-[#F4F0E7] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5 text-[#C6A85E]" />
                    <span>Active Sessions & Devices</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenPublicSite();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1A2228] text-[#A5ADB5] hover:text-[#F4F0E7] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Public Website</span>
                  </button>
                </div>

                {/* Sign Out Action */}
                <div className="pt-1.5 border-t border-[#303940]">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#B83A3A]/15 text-[#B83A3A] flex items-center gap-2 cursor-pointer transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
