import { NextRequest, NextResponse } from 'next/server';
import { securityConfig } from '../env-validation';

// Content Security Policy configuration
export function generateCSP(strict: boolean = false): string {
  const baseDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Next.js requires this for development
      "'unsafe-eval'", // Required for Monaco Editor and code execution
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      strict ? '' : "'unsafe-inline'",
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind CSS requires this
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://images.unsplash.com',
      'https://avatars.githubusercontent.com',
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.github.com',
      'https://e2b.dev',
      'https://*.e2b.dev',
      securityConfig.nodeEnv === 'development' ? 'ws://localhost:*' : '',
      securityConfig.nodeEnv === 'development' ? 'http://localhost:*' : '',
    ].filter(Boolean),
    'frame-src': [
      "'self'",
      'https://*.e2b.dev',
      'https://codesandbox.io',
    ],
    'worker-src': [
      "'self'",
      'blob:',
    ],
    'child-src': [
      "'self'",
      'blob:',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': strict ? ["'none'"] : ["'self'"],
    'upgrade-insecure-requests': strict ? [] : undefined,
  };

  return Object.entries(baseDirectives)
    .filter(([_, value]) => value !== undefined && Array.isArray(value) && value.length > 0)
    .map(([directive, sources]) => `${directive} ${(sources as string[]).join(' ')}`)
    .join('; ');
}

// Security headers configuration
export function getSecurityHeaders(request?: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!securityConfig.enableSecurityHeaders) {
    return headers;
  }

  // Content Security Policy
  const csp = generateCSP(securityConfig.strictCSP);
  headers['Content-Security-Policy'] = csp;

  // Strict Transport Security (HTTPS only)
  if (securityConfig.nodeEnv === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  // Prevent MIME type sniffing
  headers['X-Content-Type-Options'] = 'nosniff';

  // XSS Protection
  headers['X-XSS-Protection'] = '1; mode=block';

  // Prevent clickjacking
  headers['X-Frame-Options'] = 'SAMEORIGIN';

  // Referrer Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // Permissions Policy (Feature Policy)
  headers['Permissions-Policy'] = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
  ].join(', ');

  // Cross-Origin policies
  headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
  headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  headers['Cross-Origin-Resource-Policy'] = 'same-origin';

  // Remove server information
  headers['Server'] = '';
  headers['X-Powered-By'] = '';

  // CSRF Protection header
  if (securityConfig.enableCsrf && request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    if (origin && securityConfig.allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
    
    // SameSite cookie settings are handled in cookie management
  }

  return headers;
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  const headers = getSecurityHeaders(request);
  
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  
  return response;
}

// CORS configuration
export function configureCORS(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  
  // Check if origin is allowed
  if (origin && securityConfig.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (securityConfig.nodeEnv === 'development') {
    // Allow all origins in development
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version',
  ].join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

// Security headers middleware
export function securityHeadersMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  
  // Apply security headers
  applySecurityHeaders(response, request);
  
  // Configure CORS if needed
  if (request.method === 'OPTIONS' || request.nextUrl.pathname.startsWith('/api/')) {
    configureCORS(response, request);
  }
  
  return response;
}

// Check if request is from allowed origin
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin && !referer) {
    // Allow same-origin requests without Origin header
    return true;
  }
  
  if (origin && securityConfig.allowedOrigins?.includes(origin)) {
    return true;
  }
  
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return securityConfig.allowedOrigins?.includes(refererOrigin) || false;
    } catch {
      return false;
    }
  }
  
  return securityConfig.nodeEnv === 'development';
}

// Validate Content-Type for API requests
export function validateContentType(request: NextRequest, expectedTypes: string[] = ['application/json']): boolean {
  if (request.method === 'GET' || request.method === 'DELETE') {
    return true;
  }
  
  const contentType = request.headers.get('content-type');
  if (!contentType) {
    return false;
  }
  
  return expectedTypes.some(type => contentType.toLowerCase().includes(type.toLowerCase()));
}

// Generate nonce for inline scripts (CSP)
export function generateNonce(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

// Report CSP violations endpoint
export function handleCSPReport(request: NextRequest): NextResponse {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  // Log CSP violation for analysis
  request.json().then((report) => {
    if (securityConfig.enableLogging) {
      console.warn('CSP Violation:', {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: 'logged',
        report,
      });
    }
  }).catch(console.error);
  
  return NextResponse.json({ received: true }, { status: 200 });
}

export default {
  generateCSP,
  getSecurityHeaders,
  applySecurityHeaders,
  configureCORS,
  securityHeadersMiddleware,
  isAllowedOrigin,
  validateContentType,
  generateNonce,
  handleCSPReport,
};