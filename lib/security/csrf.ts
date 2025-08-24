import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { securityConfig } from '../env-validation';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const CSRF_COOKIE_NAME = '__csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

interface CSRFToken {
  token: string;
  expires: number;
  userAgent: string;
  ip: string;
}

// In-memory token storage (in production, use Redis)
const tokenStore = new Map<string, CSRFToken>();

// Generate cryptographically secure random token
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

// Create CSRF token with metadata
export function createCSRFToken(request: NextRequest): { token: string; expires: Date } {
  const token = generateCSRFToken();
  const expires = Date.now() + CSRF_TOKEN_EXPIRY;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Store token with metadata for validation
  tokenStore.set(token, {
    token,
    expires,
    userAgent,
    ip,
  });

  // Clean up expired tokens
  cleanupExpiredTokens();

  return { token, expires: new Date(expires) };
}

// Validate CSRF token
export function validateCSRFToken(
  token: string,
  request: NextRequest,
  strict: boolean = true
): { valid: boolean; reason?: string } {
  if (!securityConfig.enableCsrf) {
    return { valid: true };
  }

  if (!token) {
    return { valid: false, reason: 'CSRF token missing' };
  }

  const storedToken = tokenStore.get(token);
  if (!storedToken) {
    return { valid: false, reason: 'CSRF token not found or expired' };
  }

  // Check expiration
  if (Date.now() > storedToken.expires) {
    tokenStore.delete(token);
    return { valid: false, reason: 'CSRF token expired' };
  }

  if (strict) {
    // Validate user agent consistency
    const currentUserAgent = request.headers.get('user-agent') || '';
    if (storedToken.userAgent !== currentUserAgent) {
      return { valid: false, reason: 'User agent mismatch' };
    }

    // Validate IP consistency (optional, can be disabled for mobile users)
    const currentIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Allow IP changes for mobile users, but log for security monitoring
    if (storedToken.ip !== currentIP) {
      console.warn('CSRF IP mismatch:', {
        token: token.substring(0, 8) + '***',
        storedIP: storedToken.ip,
        currentIP,
        userAgent: currentUserAgent,
      });
      // Don't fail validation for IP changes, but could be used for suspicious activity detection
    }
  }

  return { valid: true };
}

// Extract CSRF token from request
export function extractCSRFToken(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Check cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Check form data for non-JSON requests
  if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    // Note: extracting from form data requires parsing the body
    // This would be handled at the API route level
  }

  return null;
}

// Clean up expired tokens
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expires) {
      tokenStore.delete(token);
    }
  }
}

// Set CSRF cookie
export function setCSRFCookie(response: NextResponse, token: string, expires: Date): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: securityConfig.nodeEnv === 'production',
    sameSite: 'strict',
    expires,
    path: '/',
  });
}

// CSRF protection middleware
export function csrfProtection(options: {
  methods?: string[];
  skipPaths?: string[];
  strict?: boolean;
} = {}) {
  const {
    methods = ['POST', 'PUT', 'DELETE', 'PATCH'],
    skipPaths = ['/api/auth/callback'],
    strict = true,
  } = options;

  return async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
    if (!securityConfig.enableCsrf) {
      return null;
    }

    const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

    // Skip CSRF protection for safe methods and specified paths
    if (!methods.includes(method) || skipPaths.some(path => pathname.startsWith(path))) {
      return null;
    }

    // For state-changing operations, validate CSRF token
    const token = extractCSRFToken(request);
    if (!token) {
      return NextResponse.json(
        { 
          error: 'CSRF token missing', 
          code: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token is required for this operation'
        },
        { status: 403 }
      );
    }

    const validation = validateCSRFToken(token, request, strict);
    if (!validation.valid) {
      console.warn('CSRF validation failed:', {
        reason: validation.reason,
        pathname,
        method,
        ip: 'logged',
        userAgent: request.headers.get('user-agent'),
      });

      return NextResponse.json(
        { 
          error: 'CSRF token invalid', 
          code: 'CSRF_TOKEN_INVALID',
          message: validation.reason || 'CSRF token validation failed'
        },
        { status: 403 }
      );
    }

    return null; // Continue processing
  };
}

// Generate CSRF token endpoint
export function generateCSRFTokenEndpoint(request: NextRequest): NextResponse {
  const { token, expires } = createCSRFToken(request);
  
  const response = NextResponse.json({ 
    csrfToken: token,
    expires: expires.toISOString(),
  });
  
  setCSRFCookie(response, token, expires);
  
  return response;
}

// Double Submit Cookie pattern implementation
export class DoubleSubmitCSRF {
  private static readonly COOKIE_NAME = '__csrf-cookie';
  private static readonly HEADER_NAME = 'x-csrf-token';
  
  static generate(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  static setCookie(response: NextResponse, token: string): void {
    response.cookies.set(this.COOKIE_NAME, token, {
      httpOnly: false, // Needs to be readable by JavaScript for double submit
      secure: securityConfig.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });
  }
  
  static validate(request: NextRequest): { valid: boolean; reason?: string } {
    const cookieToken = request.cookies.get(this.COOKIE_NAME)?.value;
    const headerToken = request.headers.get(this.HEADER_NAME);
    
    if (!cookieToken || !headerToken) {
      return { valid: false, reason: 'CSRF tokens missing' };
    }
    
    if (cookieToken !== headerToken) {
      return { valid: false, reason: 'CSRF tokens do not match' };
    }
    
    return { valid: true };
  }
}

// Synchronizer Token Pattern (more secure, but requires server-side storage)
export class SynchronizerTokenCSRF {
  private static readonly tokens = new Map<string, { token: string; expires: number; sessionId: string }>();
  
  static generate(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(token, { token, expires, sessionId });
    
    // Cleanup expired tokens
    this.cleanup();
    
    return token;
  }
  
  static validate(token: string, sessionId: string): { valid: boolean; reason?: string } {
    const stored = this.tokens.get(token);
    
    if (!stored) {
      return { valid: false, reason: 'CSRF token not found' };
    }
    
    if (Date.now() > stored.expires) {
      this.tokens.delete(token);
      return { valid: false, reason: 'CSRF token expired' };
    }
    
    if (stored.sessionId !== sessionId) {
      return { valid: false, reason: 'Session mismatch' };
    }
    
    return { valid: true };
  }
  
  static cleanup(): void {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(token);
      }
    }
  }
  
  static revoke(sessionId: string): void {
    for (const [token, data] of this.tokens.entries()) {
      if (data.sessionId === sessionId) {
        this.tokens.delete(token);
      }
    }
  }
}

// Origin validation for additional CSRF protection
export function validateOrigin(request: NextRequest): { valid: boolean; reason?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // For same-origin requests, origin might not be present
  if (!origin && !referer) {
    return { valid: true }; // Assume same-origin
  }
  
  if (origin && securityConfig.allowedOrigins.includes(origin)) {
    return { valid: true };
  }
  
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (securityConfig.allowedOrigins.includes(refererOrigin)) {
        return { valid: true };
      }
    } catch {
      return { valid: false, reason: 'Invalid referer header' };
    }
  }
  
  return { valid: false, reason: 'Origin not allowed' };
}

// Enhanced CSRF protection with origin validation
export function enhancedCSRFProtection(options: {
  methods?: string[];
  skipPaths?: string[];
  strict?: boolean;
  validateOrigin?: boolean;
} = {}) {
  const {
    methods = ['POST', 'PUT', 'DELETE', 'PATCH'],
    skipPaths = ['/api/auth/callback'],
    strict = true,
    validateOrigin: shouldValidateOrigin = true,
  } = options;

  return async function enhancedCSRFMiddleware(request: NextRequest): Promise<NextResponse | null> {
    if (!securityConfig.enableCsrf) {
      return null;
    }

    const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

    // Skip CSRF protection for safe methods and specified paths
    if (!methods.includes(method) || skipPaths.some(path => pathname.startsWith(path))) {
      return null;
    }

    // Validate origin first
    if (shouldValidateOrigin) {
      const originValidation = validateOrigin(request);
      if (!originValidation.valid) {
        return NextResponse.json(
          { 
            error: 'Origin validation failed', 
            code: 'INVALID_ORIGIN',
            message: originValidation.reason || 'Request origin not allowed'
          },
          { status: 403 }
        );
      }
    }

    // Then validate CSRF token
    return csrfProtection({ methods, skipPaths, strict })(request);
  };
}

export default {
  generateCSRFToken,
  createCSRFToken,
  validateCSRFToken,
  extractCSRFToken,
  setCSRFCookie,
  csrfProtection,
  generateCSRFTokenEndpoint,
  DoubleSubmitCSRF,
  SynchronizerTokenCSRF,
  validateOrigin,
  enhancedCSRFProtection,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
};