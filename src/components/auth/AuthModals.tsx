import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Shield,
  Key,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AuthModalType = 'signin' | 'register' | 'forgot_password' | 'reset_password' | 'verify_email' | null;

interface AuthModalsProps {
  modalType: AuthModalType;
  onClose: () => void;
  onSwitchModal: (type: AuthModalType) => void;
  onSuccessAuthenticated?: () => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  modalType,
  onClose,
  onSwitchModal,
  onSuccessAuthenticated,
}) => {
  const { login, register, forgotPassword, resetPassword, verifyEmail, user } = useAuth();

  // Form states
  const [email, setEmail] = useState('r.deshmukh@apex.co.in');
  const [password, setPassword] = useState('TrustGuard@2026');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatedTokenNotice, setGeneratedTokenNotice] = useState<string | null>(null);

  if (!modalType) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      onClose();
      if (onSuccessAuthenticated) onSuccessAuthenticated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        organizationName: orgName || 'Apex Industrial Enterprise',
      });
      onClose();
      if (onSuccessAuthenticated) onSuccessAuthenticated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await forgotPassword(email);
      setGeneratedTokenNotice(res.simulatedResetToken);
      setResetToken(res.simulatedResetToken);
      setSuccessMsg('Reset token generated. You can now set your new password.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request reset token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await resetPassword(resetToken, newPassword);
      setSuccessMsg('Password has been updated. Please sign in with your new password.');
      setTimeout(() => {
        onSwitchModal('signin');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#151B20] border border-[#303940] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-xs text-[#F4F0E7]">
        {/* Header */}
        <div className="p-4 border-b border-[#303940] bg-[#1A2228] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#101418] border border-[#C6A85E]/50 flex items-center justify-center text-[#C6A85E]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-sm text-[#F4F0E7]">
              {modalType === 'signin' && 'Sign in to TrustGuard'}
              {modalType === 'register' && 'Create Enterprise Account'}
              {modalType === 'forgot_password' && 'Password Recovery'}
              {modalType === 'reset_password' && 'Set New Password'}
              {modalType === 'verify_email' && 'Verify Work Email'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#A5ADB5] hover:text-[#F4F0E7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form area */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#B83A3A]/20 border border-[#B83A3A]/40 text-[#F4F0E7] text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B83A3A] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#3D8255]/20 border border-[#3D8255]/40 text-[#F4F0E7] text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3D8255] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          {modalType === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#A5ADB5] font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => onSwitchModal('forgot_password')}
                    className="text-[11px] text-[#C6A85E] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#101418] border border-[#303940]/60 text-[10.5px] text-[#A5ADB5]">
                Default demo credentials pre-filled for <code className="text-[#C6A85E]">r.deshmukh@apex.co.in</code>. Password hashes are salted with 100k iteration PBKDF2 on backend.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center text-[11px] text-[#A5ADB5] pt-1">
                Don't have an enterprise account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchModal('register')}
                  className="text-[#C6A85E] hover:underline font-medium"
                >
                  Register organization
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {modalType === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A5ADB5] mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram"
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
                    placeholder="e.g. Patel"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">Organization Name</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat Die & Engineering Works"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
                <div className="text-[10px] text-[#A5ADB5] mt-0.5">
                  An isolated immutable organization UUID (<code className="text-[#C6A85E]">org_...</code>) will be provisioned.
                </div>
              </div>

              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">Password (min 8 characters)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Creating Organization...' : 'Register & Launch Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center text-[11px] text-[#A5ADB5] pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchModal('signin')}
                  className="text-[#C6A85E] hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {modalType === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-[11px] text-[#A5ADB5] leading-relaxed">
                Enter your registered corporate email address to receive an authenticated password reset token.
              </p>

              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#A5ADB5] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101418] border border-[#303940] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                  />
                </div>
              </div>

              {generatedTokenNotice && (
                <div className="p-3 rounded-lg bg-[#101418] border border-[#C6A85E]/50 space-y-2">
                  <div className="text-[11px] text-[#C6A85E] font-semibold">
                    Simulated Email Dispatch: Reset Token Received
                  </div>
                  <code className="block p-1.5 rounded bg-[#151B20] text-[10px] text-[#F4F0E7] break-all border border-[#303940]">
                    {generatedTokenNotice}
                  </code>
                  <button
                    type="button"
                    onClick={() => onSwitchModal('reset_password')}
                    className="w-full py-1.5 rounded bg-[#C6A85E] text-[#101418] font-bold text-xs"
                  >
                    Proceed to Set New Password &rarr;
                  </button>
                </div>
              )}

              {!generatedTokenNotice && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer"
                >
                  {loading ? 'Dispatching...' : 'Request Password Reset Token'}
                </button>
              )}

              <div className="text-center text-[11px] text-[#A5ADB5]">
                <button
                  type="button"
                  onClick={() => onSwitchModal('signin')}
                  className="text-[#C6A85E] hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Form */}
          {modalType === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste or enter reset token..."
                  className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs font-mono text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                />
              </div>

              <div>
                <label className="block text-[#A5ADB5] mb-1 font-medium">New Password</label>
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
                <label className="block text-[#A5ADB5] mb-1 font-medium">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#101418] border border-[#303940] rounded-lg px-3 py-2 text-xs text-[#F4F0E7] focus:outline-none focus:border-[#C6A85E]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
