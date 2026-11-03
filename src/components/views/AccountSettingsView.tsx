import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Lock, 
  Shield, 
  Monitor, 
  Bell, 
  Key, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Upload, 
  Laptop, 
  Globe, 
  Clock, 
  LogOut,
  Sliders,
  Mail,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AlertRule, NotificationItem } from '../../types';
import { SettingsAlertsView } from './SettingsAlertsView';

interface AccountSettingsViewProps {
  alertRules: AlertRule[];
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onAddNewRule: (rule: AlertRule) => void;
  onTestTriggerRule: (rule: AlertRule) => void;
  notifications: NotificationItem[];
  onOpenEmailPreview: (notif: NotificationItem) => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  alertRules,
  onToggleRule,
  onDeleteRule,
  onAddNewRule,
  onTestTriggerRule,
  notifications,
  onOpenEmailPreview,
}) => {
  const { user, organization, updateProfile, changePassword, deleteAccount, sessions, revokeSession, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'personal' | 'organization' | 'password' | 'sessions' | 'theme' | 'notifications' | 'privacy' | 'delete'
  >('personal');

  // Personal Info form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [title, setTitle] = useState(user?.title || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Account deletion phrase
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Copy helper
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    try {
      await updateProfile({
        firstName,
        lastName,
        title,
        phone,
        avatarUrl: avatarPreview,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Avatar image file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwLoading(true);
    setPwError('');
    setPwSuccess(false);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePhrase !== 'DELETE MY ACCOUNT') {
      setDeleteError('Confirmation phrase must be exactly "DELETE MY ACCOUNT"');
      return;
    }
    try {
      await deleteAccount(deletePhrase);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
    }
  };

  const tabs = [
    { id: 'personal' as const, label: 'Personal Information', icon: User },
    { id: 'organization' as const, label: 'Organization & Tenancy', icon: Building2 },
    { id: 'password' as const, label: 'Password & Authentication', icon: Lock },
    { id: 'sessions' as const, label: 'Active Sessions', icon: Laptop, badge: `${sessions.length}` },
    { id: 'theme' as const, label: 'Theme & Appearance', icon: Monitor },
    { id: 'notifications' as const, label: 'Notifications & Alerts', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy & Security Spec', icon: ShieldCheck },
    { id: 'delete' as const, label: 'Account Deletion', icon: Trash2, danger: true },
  ];

  return (
    <div className="space-y-6 text-[#F4F0E7]">
      {/* Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Tab Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <div className="p-3 mb-2 rounded-xl bg-[#1A2228] border border-[#303940]">
            <div className="text-xs font-semibold text-[#F4F0E7]">Account & Workspace</div>
            <div className="text-[11px] text-[#A5ADB5] truncate mt-0.5">{organization?.name}</div>
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1A2228] text-[#C6A85E] border border-[#303940]'
                    : tab.danger
                    ? 'text-[#B83A3A] hover:bg-[#B83A3A]/10'
                    : 'text-[#A5ADB5] hover:text-[#F4F0E7] hover:bg-[#151B20]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C6A85E]' : tab.danger ? 'text-[#B83A3A]' : 'text-[#A5ADB5]'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101418] text-[#A5ADB5] border border-[#303940]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* 1. Personal Information */}
          {activeTab === 'personal' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-5">
              <div className="border-b border-[#303940] pb-3">
                <h3 className="text-sm font-semibold text-[#F4F0E7]">Personal Profile</h3>
                <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Update your contact details, designation, and enterprise identity
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3 rounded-lg bg-[#3D8255]/20 border border-[#3D8255]/40 text-[#F4F0E7] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3D8255]" />
                  <span>Profile updated successfully.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {/* Avatar section */}
                <div className="flex items-center gap-4 p-3 bg-[#101418] rounded-xl border border-[#303940]">
                  <div className="w-14 h-14 rounded-xl bg-[#1A2228] border border-[#303940] flex items-center justify-center text-lg font-bold text-[#C6A85E] overflow-hidden shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      `${firstName.charAt(0)}${lastName.charAt(0)}`
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A5ADB5] mb-1 font-medium">Profile Avatar</label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg border border-[#303940] bg-[#1A2228] text-[#F4F0E7] hover:border-[#C6A85E] transition-colors cursor-pointer text-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#C6A85E]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFileChange}
                        />
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => setAvatarPreview('')}
                          className="text-[11px] text-[#A5ADB5] hover:text-[#B83A3A]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A5ADB5] mb-1 font-medium">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A5ADB5] mb-1 font-medium">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A5ADB5] mb-1 font-medium">Corporate Email (Immutable)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-[#101418]/60 border border-[#303940]/50 rounded-lg px-3 py-2 text-xs font-mono text-[#A5ADB5] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A5ADB5] mb-1 font-medium">Title / Designation</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#A5ADB5] mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>

                <div className="p-3 bg-[#101418] rounded-xl border border-[#303940] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#A5ADB5]">Immutable User UUID:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-[#C6A85E]">{user?.id}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(user?.id || '', 'user_uuid')}
                      className="text-[#A5ADB5] hover:text-[#F4F0E7]"
                    >
                      {copiedText === 'user_uuid' ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer"
                  >
                    {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Organization & Tenancy */}
          {activeTab === 'organization' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-5 text-xs">
              <div className="border-b border-[#303940] pb-3">
                <h3 className="text-sm font-semibold text-[#F4F0E7]">Organization & Data Isolation Scope</h3>
                <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Tenant details, immutable organization identifier, and domain whitelisting
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#101418] p-4 rounded-xl border border-[#303940]">
                <div>
                  <span className="text-[#A5ADB5]">Organization Name:</span>
                  <div className="text-sm font-semibold text-[#F4F0E7] mt-0.5">{organization?.name}</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Tier & Service Level:</span>
                  <div className="font-mono text-[#3D8255] font-bold mt-0.5">{organization?.tier} (99.95% SLA)</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Manufacturing Cluster Hub:</span>
                  <div className="text-[#F4F0E7] mt-0.5">{organization?.industryCluster}</div>
                </div>
                <div>
                  <span className="text-[#A5ADB5]">Whitelisted Domains:</span>
                  <div className="font-mono text-[#C6A85E] mt-0.5">@{organization?.domainWhitelist.join(', @')}</div>
                </div>
              </div>

              <div className="p-3.5 bg-[#101418] rounded-xl border border-[#303940] space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#A5ADB5]">Immutable Organization UUID:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-[#C6A85E]">{organization?.id}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(organization?.id || '', 'org_uuid')}
                      className="text-[#A5ADB5] hover:text-[#F4F0E7]"
                    >
                      {copiedText === 'org_uuid' ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-[#A5ADB5] pt-1">
                  Enforces strict row-level and tenancy isolation on backend database routes. Cross-organization access attempts trigger automatic security audit events.
                </p>
              </div>
            </div>
          )}

          {/* 3. Password & Authentication */}
          {activeTab === 'password' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-5 text-xs">
              <div className="border-b border-[#303940] pb-3">
                <h3 className="text-sm font-semibold text-[#F4F0E7]">Password & Security Credentials</h3>
                <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Change your password and manage Multi-Factor Authentication (MFA)
                </p>
              </div>

              {pwSuccess && (
                <div className="p-3 rounded-lg bg-[#3D8255]/20 border border-[#3D8255]/40 text-[#F4F0E7] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3D8255]" />
                  <span>Password changed successfully. Re-salted with PBKDF2.</span>
                </div>
              )}

              {pwError && (
                <div className="p-3 rounded-lg bg-[#B83A3A]/20 border border-[#B83A3A]/40 text-[#F4F0E7] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B83A3A]" />
                  <span>{pwError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
                <div>
                  <label className="block text-[#A5ADB5] mb-1 font-medium">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>

                <div>
                  <label className="block text-[#A5ADB5] mb-1 font-medium">New Password (min 8 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>

                <div>
                  <label className="block text-[#A5ADB5] mb-1 font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer"
                  >
                    {pwLoading ? 'Verifying & Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* MFA Status */}
              <div className="p-4 bg-[#101418] rounded-xl border border-[#303940] flex items-center justify-between pt-4">
                <div>
                  <div className="font-semibold text-[#F4F0E7]">Hardware Security Key / MFA (FIDO2)</div>
                  <div className="text-[11px] text-[#A5ADB5] mt-0.5">Enforced on all administrative role sessions</div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#3D8255]/20 text-[#3D8255] border border-[#3D8255]/40 font-bold">
                  ENFORCED
                </span>
              </div>
            </div>
          )}

          {/* 4. Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-4 text-xs">
              <div className="border-b border-[#303940] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F0E7]">Active Authenticated Sessions</h3>
                  <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                    Authorized devices and IP addresses accessing your organization
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#C6A85E]">
                  {sessions.length} Active Sessions
                </span>
              </div>

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-xl bg-[#101418] border border-[#303940] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F4F0E7]">{sess.device}</span>
                        {sess.current && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#3D8255]/20 text-[#3D8255] border border-[#3D8255]/40">
                            CURRENT SESSION
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A5ADB5] font-mono">
                        {sess.browser} • IP: {sess.ipAddress} ({sess.location})
                      </div>
                      <div className="text-[10px] text-[#A5ADB5]">
                        Last Active: {sess.lastActiveAt.split('T')[0]} • Created: {sess.createdAt.split('T')[0]}
                      </div>
                    </div>

                    {!sess.current && (
                      <button
                        onClick={() => revokeSession(sess.token)}
                        className="px-3 py-1.5 rounded-lg border border-[#303940] text-[#B83A3A] hover:bg-[#B83A3A]/10 transition-colors text-xs cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Theme & Appearance */}
          {activeTab === 'theme' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-4 text-xs">
              <div className="border-b border-[#303940] pb-3">
                <h3 className="text-sm font-semibold text-[#F4F0E7]">Theme & Appearance</h3>
                <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Select your interface theme preference. Applies immediately across every dashboard and route.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dark Theme Option */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#101418] border-[#C6A85E] text-[#F4F0E7] shadow-md'
                      : 'bg-[#101418]/60 border-[#303940] text-[#A5ADB5] hover:border-[#46535D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Moon className="w-5 h-5 text-[#C6A85E]" />
                    {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#C6A85E]" />}
                  </div>
                  <div className="font-semibold text-sm text-[#F4F0E7]">Dark Theme (Default)</div>
                  <div className="text-[11px] text-[#A5ADB5] mt-1">
                    Charcoal #101418 with muted gold accents and high contrast.
                  </div>
                </div>

                {/* Light Theme Option */}
                <div
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#FFFFFF] border-[#C6A85E] text-[#0F172A] shadow-md'
                      : 'bg-[#101418]/60 border-[#303940] text-[#A5ADB5] hover:border-[#46535D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sun className="w-5 h-5 text-[#B88E38]" />
                    {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#B88E38]" />}
                  </div>
                  <div className="font-semibold text-sm text-[#0F172A] dark:text-[#F4F0E7]">Light Theme</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#A5ADB5] mt-1">
                    Clean high-readability daylight workspace.
                  </div>
                </div>

                {/* System Theme Option */}
                <div
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-[#101418] border-[#C6A85E] text-[#F4F0E7] shadow-md'
                      : 'bg-[#101418]/60 border-[#303940] text-[#A5ADB5] hover:border-[#46535D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Monitor className="w-5 h-5 text-[#C6A85E]" />
                    {theme === 'system' && <CheckCircle2 className="w-4 h-4 text-[#C6A85E]" />}
                  </div>
                  <div className="font-semibold text-sm text-[#F4F0E7]">System Sync</div>
                  <div className="text-[11px] text-[#A5ADB5] mt-1">
                    Synchronizes with your operating system preference.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. Notifications & Alert Rules */}
          {activeTab === 'notifications' && (
            <SettingsAlertsView
              alertRules={alertRules}
              onToggleRule={onToggleRule}
              onDeleteRule={onDeleteRule}
              onAddNewRule={onAddNewRule}
              onTestTriggerRule={onTestTriggerRule}
              notifications={notifications}
              onOpenEmailPreview={onOpenEmailPreview}
            />
          )}

          {/* 7. Privacy & Security Architecture Spec */}
          {activeTab === 'privacy' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#303940] space-y-4 text-xs">
              <div className="border-b border-[#303940] pb-3">
                <h3 className="text-sm font-semibold text-[#F4F0E7]">Security Architecture & Compliance Disclosure</h3>
                <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Factual disclosure of implemented controls vs. cloud-managed infrastructure
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#101418] rounded-xl border border-[#303940] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3D8255]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Implemented: Authenticated Symmetric Encryption (AES-256-GCM)</span>
                  </div>
                  <p className="text-[11px] text-[#A5ADB5] leading-relaxed">
                    Sensitive database secrets and API proxy keys are encrypted using Node.js authenticated 256-bit AES-GCM with unique 96-bit random IVs and integrity authentication tags on the server.
                  </p>
                </div>

                <div className="p-3.5 bg-[#101418] rounded-xl border border-[#303940] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3D8255]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Implemented: PBKDF2 Password Hashing (100,000 Iterations)</span>
                  </div>
                  <p className="text-[11px] text-[#A5ADB5] leading-relaxed">
                    User credentials hashed with individual 128-bit cryptographic salts and timing-safe equality verification on the backend to prevent timing attacks.
                  </p>
                </div>

                <div className="p-3.5 bg-[#101418] rounded-xl border border-[#303940] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3D8255]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Implemented: Tenant Data Isolation via Immutable UUIDs</span>
                  </div>
                  <p className="text-[11px] text-[#A5ADB5] leading-relaxed">
                    User UUIDs (<code className="text-[#C6A85E]">usr_...</code>) and Organization UUIDs (<code className="text-[#C6A85E]">org_...</code>) are strictly generated server-side. Email is never used as a database foreign key.
                  </p>
                </div>

                <div className="p-3.5 bg-[#101418] rounded-xl border border-[#303940] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#C6A85E]">
                    <Shield className="w-4 h-4" />
                    <span>External Cloud Perimeter: TLS 1.3 & Cloud KMS</span>
                  </div>
                  <p className="text-[11px] text-[#A5ADB5] leading-relaxed">
                    HTTPS edge termination and master key rotation policies are managed via Cloud Run & Google Cloud KMS infrastructure layers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 8. Account Deletion (Danger Zone) */}
          {activeTab === 'delete' && (
            <div className="p-5 rounded-xl bg-[#1A2228] border border-[#B83A3A]/40 space-y-4 text-xs">
              <div className="border-b border-[#303940] pb-3">
                <h3 className="text-sm font-semibold text-[#B83A3A]">Danger Zone: Account Deletion</h3>
                <p className="text-[11px] text-[#A5ADB5] mt-0.5">
                  Permanently purge your account, revoke all active sessions, and remove organization ownership
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-lg bg-[#B83A3A]/20 border border-[#B83A3A]/40 text-[#F4F0E7]">
                  {deleteError}
                </div>
              )}

              <p className="text-[11.5px] text-[#A5ADB5] leading-relaxed">
                This action is irreversible. All data keys, configured alert rules, and audit logs associated with your user UUID (<code className="text-[#F4F0E7] font-mono">{user?.id}</code>) will be permanently deleted from the active authentication vault.
              </p>

              <form onSubmit={handleDeleteAccount} className="space-y-3 max-w-md pt-2">
                <div>
                  <label className="block text-[#A5ADB5] mb-1 font-medium">
                    Type <code className="text-[#B83A3A] font-bold">DELETE MY ACCOUNT</code> to confirm
                  </label>
                  <input
                    type="text"
                    required
                    value={deletePhrase}
                    onChange={(e) => setDeletePhrase(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="w-full bg-[#101418] border border-[#B83A3A]/50 rounded-lg px-3 py-2 text-xs font-mono text-[#F4F0E7] focus:outline-none focus:border-[#B83A3A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={deletePhrase !== 'DELETE MY ACCOUNT'}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#B83A3A] text-white hover:bg-[#D32F2F] disabled:opacity-30 transition-colors cursor-pointer"
                >
                  Permanently Purge My Account
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
