import { BlackRoadClient } from './client';

export interface HashResult {
  hash: string;
  algorithm: string;
  input_length: number;
}

export interface TokenResult {
  token: string;
  type: string;
  expires_at?: string;
}

export interface JWTPayload {
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export interface JWTResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

export interface SecretFinding {
  type: string;
  pattern: string;
  location: string;
  line: number;
  masked_value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface VulnerabilityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  location?: string;
  line?: number;
  cwe_id?: string;
  recommendation?: string;
}

export interface PasswordAnalysis {
  score: number;
  strength: 'weak' | 'medium' | 'strong';
  length: number;
  has_lowercase: boolean;
  has_uppercase: boolean;
  has_digit: boolean;
  has_special: boolean;
  entropy: number;
  suggestions: string[];
}

export class SecurityTools {
  constructor(private client: BlackRoadClient) {}

  /**
   * Hash data using various algorithms
   */
  async hash(
    data: string,
    algorithm: 'sha256' | 'sha512' | 'blake2b' | 'md5' = 'sha256'
  ): Promise<HashResult> {
    return this.client.fetch('/tools/security/hash', {
      method: 'POST',
      body: JSON.stringify({ data, algorithm })
    });
  }

  /**
   * Generate a secure random token
   */
  async generateToken(
    options?: {
      length?: number;
      type?: 'hex' | 'base64' | 'alphanumeric' | 'api_key';
      prefix?: string;
    }
  ): Promise<TokenResult> {
    return this.client.fetch('/tools/security/token', {
      method: 'POST',
      body: JSON.stringify({
        length: options?.length || 32,
        type: options?.type || 'hex',
        prefix: options?.prefix
      })
    });
  }

  /**
   * Hash a password securely
   */
  async hashPassword(
    password: string,
    options?: { algorithm?: 'pbkdf2' | 'argon2' | 'bcrypt' }
  ): Promise<{ hash: string; salt: string; algorithm: string }> {
    return this.client.fetch('/tools/security/password/hash', {
      method: 'POST',
      body: JSON.stringify({
        password,
        algorithm: options?.algorithm || 'pbkdf2'
      })
    });
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(
    password: string,
    hash: string,
    salt: string
  ): Promise<{ valid: boolean }> {
    return this.client.fetch('/tools/security/password/verify', {
      method: 'POST',
      body: JSON.stringify({ password, hash, salt })
    });
  }

  /**
   * Analyze password strength
   */
  async analyzePassword(password: string): Promise<PasswordAnalysis> {
    return this.client.fetch('/tools/security/password/analyze', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  /**
   * Create a JWT
   */
  async createJWT(
    payload: JWTPayload,
    options?: {
      secret?: string;
      algorithm?: 'HS256' | 'HS384' | 'HS512';
      expires_in?: number;
    }
  ): Promise<{ token: string; expires_at: string }> {
    return this.client.fetch('/tools/security/jwt/create', {
      method: 'POST',
      body: JSON.stringify({
        payload,
        algorithm: options?.algorithm || 'HS256',
        expires_in: options?.expires_in || 3600
      })
    });
  }

  /**
   * Verify and decode a JWT
   */
  async verifyJWT(
    token: string,
    options?: { secret?: string }
  ): Promise<JWTResult> {
    return this.client.fetch('/tools/security/jwt/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  /**
   * Decode a JWT without verification (for inspection)
   */
  async decodeJWT(token: string): Promise<{ header: any; payload: JWTPayload }> {
    return this.client.fetch('/tools/security/jwt/decode', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  /**
   * Scan content for secrets
   */
  async scanSecrets(
    content: string,
    options?: {
      filename?: string;
      patterns?: string[];
    }
  ): Promise<{ findings: SecretFinding[]; total: number }> {
    return this.client.fetch('/tools/security/scan/secrets', {
      method: 'POST',
      body: JSON.stringify({
        content,
        filename: options?.filename,
        patterns: options?.patterns
      })
    });
  }

  /**
   * Scan code for vulnerabilities
   */
  async scanVulnerabilities(
    code: string,
    options?: {
      language?: string;
      filename?: string;
      severity_threshold?: 'critical' | 'high' | 'medium' | 'low';
    }
  ): Promise<{
    findings: VulnerabilityFinding[];
    summary: { critical: number; high: number; medium: number; low: number };
  }> {
    return this.client.fetch('/tools/security/scan/vulnerabilities', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language: options?.language || 'auto',
        filename: options?.filename,
        severity_threshold: options?.severity_threshold || 'low'
      })
    });
  }

  /**
   * Validate a URL for SSRF risks
   */
  async validateURL(
    url: string,
    options?: {
      allowed_schemes?: string[];
      allow_private?: boolean;
    }
  ): Promise<{
    valid: boolean;
    url: string;
    host: string;
    scheme: string;
    warnings: string[];
  }> {
    return this.client.fetch('/tools/security/validate/url', {
      method: 'POST',
      body: JSON.stringify({
        url,
        allowed_schemes: options?.allowed_schemes || ['https'],
        allow_private: options?.allow_private || false
      })
    });
  }

  /**
   * Sanitize a filename
   */
  async sanitizeFilename(filename: string): Promise<{ sanitized: string; original: string }> {
    return this.client.fetch('/tools/security/sanitize/filename', {
      method: 'POST',
      body: JSON.stringify({ filename })
    });
  }

  /**
   * Encrypt data
   */
  async encrypt(
    data: string,
    options?: { algorithm?: 'aes-256-gcm' | 'chacha20-poly1305' }
  ): Promise<{ ciphertext: string; iv: string; tag: string }> {
    return this.client.fetch('/tools/security/encrypt', {
      method: 'POST',
      body: JSON.stringify({
        data,
        algorithm: options?.algorithm || 'aes-256-gcm'
      })
    });
  }

  /**
   * Decrypt data
   */
  async decrypt(
    ciphertext: string,
    iv: string,
    tag: string
  ): Promise<{ plaintext: string }> {
    return this.client.fetch('/tools/security/decrypt', {
      method: 'POST',
      body: JSON.stringify({ ciphertext, iv, tag })
    });
  }

  /**
   * Validate an email address
   */
  async validateEmail(email: string): Promise<{
    valid: boolean;
    normalized: string;
    domain: string;
    suggestions?: string[];
  }> {
    return this.client.fetch('/tools/security/validate/email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  /**
   * Calculate entropy of data
   */
  async entropy(data: string): Promise<{ entropy: number; bits_per_char: number; length: number }> {
    return this.client.fetch('/tools/security/entropy', {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  /**
   * Generate HMAC signature
   */
  async hmac(
    data: string,
    algorithm: 'sha256' | 'sha512' = 'sha256'
  ): Promise<{ signature: string; algorithm: string }> {
    return this.client.fetch('/tools/security/hmac', {
      method: 'POST',
      body: JSON.stringify({ data, algorithm })
    });
  }
}
