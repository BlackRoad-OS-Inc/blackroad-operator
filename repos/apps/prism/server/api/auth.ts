import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

/**
 * BlackRoad Prism - Google OAuth Integration
 * Implements OAuth 2.0 authentication flow with Google
 */

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

interface OAuthState {
  state: string;
  timestamp: number;
  redirectUri?: string;
}

// In-memory state store (use Redis/database in production)
const stateStore = new Map<string, OAuthState>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      stateStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export default async function authRoutes(fastify: FastifyInstance) {
  // Validate environment configuration
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/auth/callback';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!clientId || clientId === 'TODO' || clientId.includes('your_google')) {
    fastify.log.warn('Google OAuth not configured: GOOGLE_CLIENT_ID missing or placeholder');
  }

  if (!clientSecret || clientSecret === 'TODO' || clientSecret.includes('your_google')) {
    fastify.log.warn('Google OAuth not configured: GOOGLE_CLIENT_SECRET missing or placeholder');
  }

  /**
   * Initiate Google OAuth flow
   * GET /auth/login
   */
  fastify.get('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    // Check if OAuth is configured
    if (!clientId || !clientSecret ||
        clientId === 'TODO' || clientSecret === 'TODO' ||
        clientId.includes('your_google') || clientSecret.includes('your_google')) {
      return reply.status(503).send({
        error: 'oauth_not_configured',
        message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      });
    }

    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    const stateData: OAuthState = {
      state,
      timestamp: Date.now(),
      redirectUri: (request.query as any)?.redirect_uri
    };

    stateStore.set(state, stateData);

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Redirect to Google
    return reply.redirect(authUrl);
  });

  /**
   * OAuth callback handler
   * GET /auth/callback
   */
  fastify.get('/auth/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, state, error } = request.query as any;

    // Handle OAuth errors
    if (error) {
      fastify.log.error(`OAuth error: ${error}`);
      return reply.redirect(`${appUrl}/login?error=oauth_failed`);
    }

    // Validate state (CSRF protection)
    if (!state || !stateStore.has(state)) {
      return reply.status(400).send({
        error: 'invalid_state',
        message: 'Invalid or expired state parameter'
      });
    }

    const stateData = stateStore.get(state)!;
    stateStore.delete(state); // Use once

    // Exchange code for tokens
    try {
      const tokens = await exchangeCodeForTokens(code, clientId!, clientSecret!, callbackUrl);

      // Get user info from Google
      const userInfo = await fetchGoogleUserInfo(tokens.access_token);

      // Create session
      const sessionToken = await createUserSession(fastify, userInfo);

      // Redirect to app with session token
      const redirectUri = stateData.redirectUri || '/';
      return reply
        .setCookie('session_token', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: Number(process.env.SESSION_MAX_AGE) || 86400000 // 24 hours
        })
        .redirect(`${appUrl}${redirectUri}`);

    } catch (err) {
      fastify.log.error('OAuth token exchange failed:', err);
      return reply.redirect(`${appUrl}/login?error=auth_failed`);
    }
  });

  /**
   * Logout endpoint
   * POST /auth/logout
   */
  fastify.post('/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies.session_token;

    if (sessionToken) {
      await destroyUserSession(fastify, sessionToken);
    }

    return reply
      .clearCookie('session_token')
      .send({ ok: true, message: 'Logged out successfully' });
  });

  /**
   * Get current user
   * GET /auth/me
   */
  fastify.get('/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies.session_token;

    if (!sessionToken) {
      return reply.status(401).send({ error: 'not_authenticated' });
    }

    const user = await getUserFromSession(fastify, sessionToken);

    if (!user) {
      return reply.status(401).send({ error: 'invalid_session' });
    }

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    });
  });
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch user info from Google
 */
async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
  const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

  const response = await fetch(userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch user info (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Create user session
 * In production, store in database or Redis
 */
const sessionStore = new Map<string, { user: GoogleUser; createdAt: number }>();

async function createUserSession(fastify: FastifyInstance, user: GoogleUser): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');

  sessionStore.set(sessionToken, {
    user,
    createdAt: Date.now()
  });

  fastify.log.info(`Session created for user ${user.email}`);

  return sessionToken;
}

/**
 * Get user from session token
 */
async function getUserFromSession(fastify: FastifyInstance, sessionToken: string): Promise<GoogleUser | null> {
  const session = sessionStore.get(sessionToken);

  if (!session) {
    return null;
  }

  // Check session expiry
  const maxAge = Number(process.env.SESSION_MAX_AGE) || 86400000; // 24 hours
  if (Date.now() - session.createdAt > maxAge) {
    sessionStore.delete(sessionToken);
    return null;
  }

  return session.user;
}

/**
 * Destroy user session
 */
async function destroyUserSession(fastify: FastifyInstance, sessionToken: string): Promise<void> {
  sessionStore.delete(sessionToken);
  fastify.log.info(`Session destroyed: ${sessionToken.substring(0, 8)}...`);
}
