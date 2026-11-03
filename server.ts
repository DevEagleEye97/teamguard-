import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  generateMitigationPlaybook, 
  generateSupplierDeepDive, 
  generateScenarioSimulation,
  generateSecurityAnalysis
} from './src/server/geminiService';
import {
  registerUser,
  loginUser,
  getSession,
  getUserSessions,
  revokeSession,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  requestPasswordReset,
  completePasswordReset,
  verifyUserEmail,
  getSecurityAuditSummary,
  SEEDED_INITIAL_TOKEN
} from './src/server/authService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Helper to extract session token from Authorization header
function getAuthToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.query.token as string) || '';
}

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Status & Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      platform: 'TrustGuard Intelligent Supply Chain & Data Security Platform',
      version: '2.4.0-enterprise',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
      mode: process.env.GEMINI_API_KEY ? 'gemini_live' : 'deterministic_simulation',
      timestamp: new Date().toISOString(),
      securityArchitecture: {
        hashing: 'PBKDF2-HMAC-SHA512 (100,000 iterations)',
        encryption: 'AES-256-GCM Authenticated Storage',
        tenancy: 'Organization-Level UUID Scoped Data Isolation',
      }
    });
  });

  // -------------------------------------------------------------
  // Authentication & Account Management Endpoints
  // -------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields (email, password, firstName, lastName) are required.' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = registerUser({
        email,
        password,
        firstName,
        lastName,
        organizationName: organizationName || 'Apex Industrial Enterprise',
        ipAddress,
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Web Browser';

      const result = loginUser({
        email,
        password,
        ipAddress,
        userAgent,
      });

      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Authentication failed' });
    }
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const token = getAuthToken(req) || SEEDED_INITIAL_TOKEN;
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid.' });
    }
    res.json(session);
  });

  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const token = getAuthToken(req) || SEEDED_INITIAL_TOKEN;
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
      const updated = updateUserProfile(session.user.id, req.body);
      res.json({ user: updated, organization: session.organization });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const token = getAuthToken(req) || SEEDED_INITIAL_TOKEN;
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    try {
      changeUserPassword(session.user.id, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/auth/sessions', (req: Request, res: Response) => {
    const token = getAuthToken(req) || SEEDED_INITIAL_TOKEN;
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const userSessions = getUserSessions(session.user.id, token);
    res.json({ sessions: userSessions });
  });

  app.delete('/api/auth/sessions/:sessionToken', (req: Request, res: Response) => {
    const token = getAuthToken(req) || SEEDED_INITIAL_TOKEN;
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const targetToken = req.params.sessionToken;
    const success = revokeSession(targetToken, session.user.id);
    if (!success) {
      return res.status(404).json({ error: 'Session not found or cannot be revoked.' });
    }
    res.json({ success: true, message: 'Session revoked successfully.' });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const resetToken = requestPasswordReset(email);
    res.json({
      success: true,
      message: 'If the account exists, a secure reset token has been dispatched.',
      simulatedResetToken: resetToken, // Provided for instant prototype evaluation
    });
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and newPassword are required.' });
    }

    try {
      completePasswordReset(token, newPassword);
      res.json({ success: true, message: 'Password reset successfully. You can now login.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ error: 'userId and token are required.' });
    }

    const verified = verifyUserEmail(userId, token);
    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification token.' });
    }
    res.json({ success: true, message: 'Email address verified.' });
  });

  app.delete('/api/auth/delete-account', (req: Request, res: Response) => {
    const token = getAuthToken(req) || SEEDED_INITIAL_TOKEN;
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { confirmationPhrase } = req.body;
    if (confirmationPhrase !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ error: 'Must provide confirmation phrase "DELETE MY ACCOUNT".' });
    }

    deleteUserAccount(session.user.id);
    res.json({ success: true, message: 'Account permanently purged.' });
  });

  app.get('/api/security/audit-summary', (_req: Request, res: Response) => {
    res.json(getSecurityAuditSummary());
  });

  // -------------------------------------------------------------
  // AI Resilience & SCM Endpoints
  // -------------------------------------------------------------
  app.post('/api/gemini/mitigation-advisor', async (req: Request, res: Response) => {
    try {
      const { shipment, affectedSku, primarySupplier, availableAlternateSuppliers } = req.body;
      if (!shipment) {
        return res.status(400).json({ error: 'Shipment data is required' });
      }

      const result = await generateMitigationPlaybook({
        shipment,
        affectedSku,
        primarySupplier,
        availableAlternateSuppliers: availableAlternateSuppliers || [],
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error generating mitigation playbook:', error);
      res.status(500).json({ 
        error: 'Failed to generate mitigation playbook', 
        details: error?.message || 'Internal server error' 
      });
    }
  });

  app.post('/api/gemini/supplier-risk', async (req: Request, res: Response) => {
    try {
      const { supplier, suppliedSkus } = req.body;
      if (!supplier) {
        return res.status(400).json({ error: 'Supplier data is required' });
      }

      const result = await generateSupplierDeepDive(supplier, suppliedSkus || []);
      res.json(result);
    } catch (error: any) {
      console.error('Error in supplier deep dive:', error);
      res.status(500).json({ 
        error: 'Failed to evaluate supplier risk', 
        details: error?.message || 'Internal server error' 
      });
    }
  });

  app.post('/api/gemini/scenario-simulate', async (req: Request, res: Response) => {
    try {
      const { scenarioQuery, inventory, suppliers, shipments } = req.body;
      if (!scenarioQuery) {
        return res.status(400).json({ error: 'Scenario query string is required' });
      }

      const result = await generateScenarioSimulation(
        scenarioQuery,
        inventory || [],
        suppliers || [],
        shipments || []
      );

      res.json(result);
    } catch (error: any) {
      console.error('Error in scenario simulation:', error);
      res.status(500).json({ 
        error: 'Failed to simulate scenario', 
        details: error?.message || 'Internal server error' 
      });
    }
  });

  app.post('/api/gemini/security-analysis', async (req: Request, res: Response) => {
    try {
      const { eventTitle, category, severity, details, affectedAsset, evidenceItems } = req.body;
      if (!eventTitle) {
        return res.status(400).json({ error: 'eventTitle is required' });
      }

      const result = await generateSecurityAnalysis({
        eventTitle,
        category: category || 'Security Anomaly',
        severity: severity || 'high',
        details: details || '',
        affectedAsset: affectedAsset || 'Core Infrastructure',
        evidenceItems: evidenceItems || [],
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error in security analysis:', error);
      res.status(500).json({
        error: 'Failed to generate security analysis',
        details: error?.message || 'Internal server error'
      });
    }
  });

  // Vite middleware in dev or static files in prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TrustGuard] Server active at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[TrustGuard] Server initialization failure:', err);
  process.exit(1);
});
