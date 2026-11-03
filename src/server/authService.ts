import crypto from 'node:crypto';

export interface UserAccount {
  id: string; // Immutable UUID (e.g. usr_...)
  organizationId: string; // Immutable UUID (e.g. org_...)
  email: string;
  passwordHash: string;
  passwordSalt: string;
  firstName: string;
  lastName: string;
  role: 'Owner' | 'Admin' | 'Security Analyst' | 'Auditor';
  title: string;
  phone: string;
  avatarUrl?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: number;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string; // Immutable UUID (e.g. org_...)
  name: string;
  industryCluster: string;
  tier: 'Enterprise' | 'Mid-Market Dedicated';
  domainWhitelist: string[];
  createdAt: string;
}

export interface UserSession {
  id: string; // Immutable UUID
  userId: string;
  organizationId: string;
  token: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

export interface AuthAuditEntry {
  id: string;
  timestamp: string;
  userId?: string;
  organizationId?: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  ipAddress: string;
  details: string;
}

// -------------------------------------------------------------
// In-Memory Database for Prototype with Real Cryptographic Logic
// -------------------------------------------------------------
const MASTER_ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_SECRET || 'trustguard-master-encryption-key-2026', 'trustguard-salt', 32);

const organizations: Map<string, Organization> = new Map();
const users: Map<string, UserAccount> = new Map();
const sessions: Map<string, UserSession> = new Map();
const authAuditLogs: AuthAuditEntry[] = [];

// Seed default organization & initial user
const DEFAULT_ORG_ID = 'org_' + crypto.randomUUID();
const DEFAULT_USER_ID = 'usr_' + crypto.randomUUID();

const initialSalt = crypto.randomBytes(16).toString('hex');
const initialHash = hashPassword('TrustGuard@2026', initialSalt);

organizations.set(DEFAULT_ORG_ID, {
  id: DEFAULT_ORG_ID,
  name: 'Apex Precision Engineering India Ltd.',
  industryCluster: 'Chakan Industrial Zone, Phase II, Pune',
  tier: 'Enterprise',
  domainWhitelist: ['apex.co.in'],
  createdAt: '2026-01-15T09:00:00Z',
});

users.set(DEFAULT_USER_ID, {
  id: DEFAULT_USER_ID,
  organizationId: DEFAULT_ORG_ID,
  email: 'r.deshmukh@apex.co.in',
  passwordHash: initialHash,
  passwordSalt: initialSalt,
  firstName: 'Rajesh',
  lastName: 'Deshmukh',
  role: 'Owner',
  title: 'Chief Information Security Officer & VP Supply Chain',
  phone: '+91 98230 44102',
  avatarUrl: '',
  emailVerified: true,
  mfaEnabled: true,
  createdAt: '2026-01-15T09:05:00Z',
  updatedAt: '2026-11-02T16:30:00Z',
});

// Seed default active session
const DEFAULT_SESSION_TOKEN = 'tgs_' + crypto.randomBytes(32).toString('hex');
sessions.set(DEFAULT_SESSION_TOKEN, {
  id: 'ses_' + crypto.randomUUID(),
  userId: DEFAULT_USER_ID,
  organizationId: DEFAULT_ORG_ID,
  token: DEFAULT_SESSION_TOKEN,
  device: 'MacBook Pro 16" (macOS Sequoia)',
  browser: 'Chrome 131.0 Enterprise',
  ipAddress: '103.24.120.18',
  location: 'Pune, Maharashtra (HQ Bastion)',
  createdAt: '2026-11-02T08:30:00Z',
  lastActiveAt: '2026-11-02T18:45:00Z',
  current: true,
});

// -------------------------------------------------------------
// Cryptographic Utility Functions
// -------------------------------------------------------------
export function hashPassword(password: string, salt: string): string {
  // Uses PBKDF2 with HMAC-SHA512 and 100,000 iterations
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
}

export function encryptAesGcm(plainText: string): { cipherText: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12); // 96-bit IV standard for AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    cipherText: encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

export function decryptAesGcm(cipherText: string, ivHex: string, tagHex: string): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function logAuthAudit(entry: Omit<AuthAuditEntry, 'id' | 'timestamp'>) {
  authAuditLogs.unshift({
    id: 'aud_' + crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  });
}

// -------------------------------------------------------------
// Authentication & Organization Business Logic
// -------------------------------------------------------------
export function findUserByEmail(email: string): UserAccount | undefined {
  const normalized = email.toLowerCase().trim();
  for (const user of users.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return undefined;
}

export function findUserById(id: string): UserAccount | undefined {
  return users.get(id);
}

export function findOrgById(orgId: string): Organization | undefined {
  return organizations.get(orgId);
}

export function registerUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  role?: UserAccount['role'];
  ipAddress?: string;
}): { user: Omit<UserAccount, 'passwordHash' | 'passwordSalt'>; organization: Organization; sessionToken: string } {
  const existing = findUserByEmail(params.email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  // Create immutable UUIDs
  const organizationId = 'org_' + crypto.randomUUID();
  const userId = 'usr_' + crypto.randomUUID();

  // Create Organization
  const org: Organization = {
    id: organizationId,
    name: params.organizationName || 'New Manufacturing Enterprise',
    industryCluster: 'Primary Industrial Cluster',
    tier: 'Enterprise',
    domainWhitelist: [params.email.split('@')[1] || 'apex.co.in'],
    createdAt: new Date().toISOString(),
  };
  organizations.set(organizationId, org);

  // Hash password
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(params.password, salt);
  const emailVerificationToken = crypto.randomBytes(24).toString('hex');

  const user: UserAccount = {
    id: userId,
    organizationId,
    email: params.email.toLowerCase().trim(),
    passwordHash,
    passwordSalt: salt,
    firstName: params.firstName,
    lastName: params.lastName,
    role: params.role || 'Admin',
    title: 'Operations Director',
    phone: '',
    avatarUrl: '',
    emailVerified: false,
    emailVerificationToken,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.set(userId, user);

  // Generate session token
  const token = 'tgs_' + crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    id: 'ses_' + crypto.randomUUID(),
    userId,
    organizationId,
    token,
    device: 'Desktop Workstation',
    browser: 'Web Browser',
    ipAddress: params.ipAddress || '127.0.0.1',
    location: 'Verified Corporate Network',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    current: true,
  });

  logAuthAudit({
    userId,
    organizationId,
    action: 'REGISTER_ACCOUNT',
    status: 'SUCCESS',
    ipAddress: params.ipAddress || '127.0.0.1',
    details: `User registered with immutable UUID ${userId} under Organization ${organizationId}`,
  });

  const { passwordHash: _, passwordSalt: __, ...safeUser } = user;
  return { user: safeUser, organization: org, sessionToken: token };
}

export function loginUser(params: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): { user: Omit<UserAccount, 'passwordHash' | 'passwordSalt'>; organization: Organization; sessionToken: string } {
  const user = findUserByEmail(params.email);
  if (!user) {
    logAuthAudit({
      action: 'LOGIN_FAILURE',
      status: 'FAILURE',
      ipAddress: params.ipAddress || '127.0.0.1',
      details: `Failed authentication attempt for non-existent email: ${params.email}`,
    });
    throw new Error('Invalid email or password credentials.');
  }

  const isValid = verifyPassword(params.password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    logAuthAudit({
      userId: user.id,
      organizationId: user.organizationId,
      action: 'LOGIN_FAILURE',
      status: 'FAILURE',
      ipAddress: params.ipAddress || '127.0.0.1',
      details: `Invalid password supplied for user ID ${user.id}`,
    });
    throw new Error('Invalid email or password credentials.');
  }

  const org = organizations.get(user.organizationId)!;
  const token = 'tgs_' + crypto.randomBytes(32).toString('hex');

  sessions.set(token, {
    id: 'ses_' + crypto.randomUUID(),
    userId: user.id,
    organizationId: user.organizationId,
    token,
    device: 'Authenticated Client',
    browser: params.userAgent || 'Chrome / Safari',
    ipAddress: params.ipAddress || '127.0.0.1',
    location: 'Corporate Network (Pune / Chakan)',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    current: true,
  });

  logAuthAudit({
    userId: user.id,
    organizationId: user.organizationId,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    ipAddress: params.ipAddress || '127.0.0.1',
    details: `Session established for user ${user.id}`,
  });

  const { passwordHash: _, passwordSalt: __, ...safeUser } = user;
  return { user: safeUser, organization: org, sessionToken: token };
}

export function getSession(token: string): { user: Omit<UserAccount, 'passwordHash' | 'passwordSalt'>; organization: Organization } | null {
  const session = sessions.get(token);
  if (!session) return null;

  const user = users.get(session.userId);
  if (!user) return null;

  const org = organizations.get(user.organizationId);
  if (!org) return null;

  session.lastActiveAt = new Date().toISOString();
  const { passwordHash: _, passwordSalt: __, ...safeUser } = user;
  return { user: safeUser, organization: org };
}

export function getUserSessions(userId: string, currentToken?: string): UserSession[] {
  const userSessions: UserSession[] = [];
  for (const session of sessions.values()) {
    if (session.userId === userId) {
      userSessions.push({
        ...session,
        current: session.token === currentToken,
      });
    }
  }
  return userSessions;
}

export function revokeSession(tokenToRevoke: string, requestingUserId: string): boolean {
  const session = sessions.get(tokenToRevoke);
  if (!session) return false;
  if (session.userId !== requestingUserId) return false;

  sessions.delete(tokenToRevoke);
  logAuthAudit({
    userId: requestingUserId,
    organizationId: session.organizationId,
    action: 'REVOKE_SESSION',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    details: `Session ${session.id} revoked by user`,
  });
  return true;
}

export function updateUserProfile(userId: string, updates: Partial<Pick<UserAccount, 'firstName' | 'lastName' | 'title' | 'phone' | 'avatarUrl'>>): Omit<UserAccount, 'passwordHash' | 'passwordSalt'> {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  if (updates.firstName !== undefined) user.firstName = updates.firstName;
  if (updates.lastName !== undefined) user.lastName = updates.lastName;
  if (updates.title !== undefined) user.title = updates.title;
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
  user.updatedAt = new Date().toISOString();

  logAuthAudit({
    userId,
    organizationId: user.organizationId,
    action: 'PROFILE_UPDATE',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    details: `Profile fields updated for user ${userId}`,
  });

  const { passwordHash: _, passwordSalt: __, ...safeUser } = user;
  return safeUser;
}

export function changeUserPassword(userId: string, currentPassword: string, newPassword: string): boolean {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const isValid = verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    logAuthAudit({
      userId,
      organizationId: user.organizationId,
      action: 'PASSWORD_CHANGE_FAILURE',
      status: 'FAILURE',
      ipAddress: '127.0.0.1',
      details: 'Current password verification failed during change attempt',
    });
    throw new Error('Incorrect current password.');
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.passwordSalt = newSalt;
  user.passwordHash = hashPassword(newPassword, newSalt);
  user.updatedAt = new Date().toISOString();

  logAuthAudit({
    userId,
    organizationId: user.organizationId,
    action: 'PASSWORD_CHANGE_SUCCESS',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    details: `Password changed and re-salted for user ${userId}`,
  });

  return true;
}

export function deleteUserAccount(userId: string): boolean {
  const user = users.get(userId);
  if (!user) return false;

  // Revoke all sessions
  for (const [token, sess] of sessions.entries()) {
    if (sess.userId === userId) {
      sessions.delete(token);
    }
  }

  users.delete(userId);

  logAuthAudit({
    userId,
    organizationId: user.organizationId,
    action: 'ACCOUNT_DELETION',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    details: `Account ${userId} permanently purged from database`,
  });

  return true;
}

export function requestPasswordReset(email: string): string {
  const user = findUserByEmail(email);
  if (!user) {
    // Return mock token to avoid email enumeration
    return crypto.randomBytes(20).toString('hex');
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour

  logAuthAudit({
    userId: user.id,
    organizationId: user.organizationId,
    action: 'PASSWORD_RESET_REQUESTED',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    details: `Password reset token generated for ${user.id}`,
  });

  return resetToken;
}

export function completePasswordReset(token: string, newPassword: string): boolean {
  for (const user of users.values()) {
    if (user.passwordResetToken === token && user.passwordResetExpires && user.passwordResetExpires > Date.now()) {
      const newSalt = crypto.randomBytes(16).toString('hex');
      user.passwordSalt = newSalt;
      user.passwordHash = hashPassword(newPassword, newSalt);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.updatedAt = new Date().toISOString();

      logAuthAudit({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'PASSWORD_RESET_COMPLETED',
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        details: `Password reset completed using token for user ${user.id}`,
      });

      return true;
    }
  }
  throw new Error('Password reset token is invalid or has expired.');
}

export function verifyUserEmail(userId: string, token: string): boolean {
  const user = users.get(userId);
  if (!user) return false;

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.updatedAt = new Date().toISOString();

  logAuthAudit({
    userId,
    organizationId: user.organizationId,
    action: 'EMAIL_VERIFIED',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    details: `Email address verified for user ${userId}`,
  });

  return true;
}

export function getSecurityAuditSummary() {
  return {
    totalAccounts: users.size,
    totalOrganizations: organizations.size,
    activeSessionsCount: sessions.size,
    recentAuthEvents: authAuditLogs.slice(0, 10),
    encryptionStandard: 'AES-256-GCM (Authenticated Encryption with 96-bit IV)',
    hashingStandard: 'PBKDF2-HMAC-SHA512 (100,000 iterations + 128-bit unique salt)',
    dataIsolationStandard: 'Organization-Level UUID Scoped Tenancy',
  };
}

export const SEEDED_INITIAL_USER_ID = DEFAULT_USER_ID;
export const SEEDED_INITIAL_ORG_ID = DEFAULT_ORG_ID;
export const SEEDED_INITIAL_TOKEN = DEFAULT_SESSION_TOKEN;
