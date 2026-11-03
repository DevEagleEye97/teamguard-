import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, Organization, UserSession } from '../types';

interface SafeUser {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Owner' | 'Admin' | 'Security Analyst' | 'Auditor';
  title: string;
  phone: string;
  avatarUrl?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: SafeUser | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  sessionToken: string | null;
  sessions: UserSession[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: { email: string; password: string; firstName: string; lastName: string; organizationName: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<SafeUser, 'firstName' | 'lastName' | 'title' | 'phone' | 'avatarUrl'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ simulatedResetToken: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (userId: string, token: string) => Promise<void>;
  deleteAccount: (phrase: string) => Promise<void>;
  revokeSession: (token: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('trustguard_token') || 'seeded_default_session';
    } catch {
      return 'seeded_default_session';
    }
  });
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial profile & org on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setOrganization(data.organization);
          fetchSessions(sessionToken || '');
        } else {
          // If token expired, clear
          setUser(null);
          setOrganization(null);
        }
      } catch (err) {
        console.warn('Initial session lookup fallback to offline mode', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [sessionToken]);

  const fetchSessions = async (token: string) => {
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.warn('Failed to load active sessions', e);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }

    const data = await res.json();
    setUser(data.user);
    setOrganization(data.organization);
    setSessionToken(data.sessionToken);
    try {
      localStorage.setItem('trustguard_token', data.sessionToken);
    } catch {}
    fetchSessions(data.sessionToken);
  };

  const register = async (params: { email: string; password: string; firstName: string; lastName: string; organizationName: string }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }

    const data = await res.json();
    setUser(data.user);
    setOrganization(data.organization);
    setSessionToken(data.sessionToken);
    try {
      localStorage.setItem('trustguard_token', data.sessionToken);
    } catch {}
    fetchSessions(data.sessionToken);
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    setSessionToken(null);
    setSessions([]);
    try {
      localStorage.removeItem('trustguard_token');
    } catch {}
  };

  const updateProfile = async (updates: Partial<Pick<SafeUser, 'firstName' | 'lastName' | 'title' | 'phone' | 'avatarUrl'>>) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }

    const data = await res.json();
    setUser(data.user);
    if (data.organization) setOrganization(data.organization);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to change password');
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request reset');
    }

    const data = await res.json();
    return { simulatedResetToken: data.simulatedResetToken };
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reset password');
    }
  };

  const verifyEmail = async (userId: string, token: string) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to verify email');
    }

    if (user && user.id === userId) {
      setUser({ ...user, emailVerified: true });
    }
  };

  const deleteAccount = async (phrase: string) => {
    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ confirmationPhrase: phrase }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete account');
    }

    logout();
  };

  const revokeSession = async (tokenToRevoke: string) => {
    const res = await fetch(`/api/auth/sessions/${tokenToRevoke}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to revoke session');
    }

    if (sessionToken) {
      fetchSessions(sessionToken);
    }
  };

  const refreshSessions = async () => {
    if (sessionToken) {
      await fetchSessions(sessionToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: Boolean(user),
        sessionToken,
        sessions,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        deleteAccount,
        revokeSession,
        refreshSessions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
