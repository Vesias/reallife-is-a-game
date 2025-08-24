import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterMemory, IRateLimiterOptions, RateLimiterRes } from 'rate-limiter-flexible';
import { securityConfig, redisConfig } from '../env-validation';

// Redis client for distributed rate limiting
let redis: Redis | null = null;
if (redisConfig.url && securityConfig.enableRateLimit) {
  try {
    redis = new Redis(redisConfig.url, {
      password: redisConfig.password,
      maxRetriesPerRequest: 1,
    });
  } catch (error) {
    console.warn('Redis connection failed, falling back to memory-based rate limiting');
  }
}

// Rate limiter configurations
const rateLimiterConfigs = {
  // Global API rate limiting
  api: {
    keyPrefix: 'api_rl',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60 * 15, // Block for 15 minutes
  },
  
  // Authentication endpoints
  auth: {
    keyPrefix: 'auth_rl',
    points: 5, // 5 attempts
    duration: 60 * 5, // Per 5 minutes
    blockDuration: 60 * 30, // Block for 30 minutes
  },
  
  // Authenticated users
  authenticated: {
    keyPrefix: 'auth_user_rl',
    points: 300, // More generous for authenticated users
    duration: 60, // Per minute
    blockDuration: 60 * 5, // Block for 5 minutes
  },
  
  // Code execution endpoints
  codeExecution: {
    keyPrefix: 'code_rl',
    points: 10, // 10 code executions
    duration: 60, // Per minute
    blockDuration: 60 * 10, // Block for 10 minutes
  },
  
  // File uploads
  upload: {
    keyPrefix: 'upload_rl',
    points: 20, // 20 uploads
    duration: 60 * 10, // Per 10 minutes
    blockDuration: 60 * 20, // Block for 20 minutes
  },
} as const;

type RateLimiterType = keyof typeof rateLimiterConfigs;

// Create rate limiters
const rateLimiters: Record<RateLimiterType, RateLimiterRedis | RateLimiterMemory> = {} as any;

for (const [type, config] of Object.entries(rateLimiterConfigs)) {
  const options: IRateLimiterOptions = {
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
  };

  if (redis) {
    rateLimiters[type as RateLimiterType] = new RateLimiterRedis({
      ...options,
      storeClient: redis,
    });
  } else {
    rateLimiters[type as RateLimiterType] = new RateLimiterMemory(options);
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Create rate limit key
function createRateLimitKey(ip: string, userId?: string, endpoint?: string): string {
  if (userId) {
    return `${userId}:${endpoint || 'default'}`;
  }
  return `${ip}:${endpoint || 'default'}`;
}

// Check rate limit
export async function checkRateLimit(
  type: RateLimiterType,
  request: NextRequest,
  userId?: string,
  endpoint?: string
): Promise<{ success: boolean; reset?: Date; remaining?: number; error?: string }> {
  if (!securityConfig.enableRateLimit) {
    return { success: true };
  }

  const ip = getClientIP(request);
  const key = createRateLimitKey(ip, userId, endpoint);
  const rateLimiter = rateLimiters[type];
  
  if (!rateLimiter) {
    return { success: true }; // Fallback if rate limiter not configured
  }

  try {
    const result = await rateLimiter.consume(key);
    
    return {
      success: true,
      reset: new Date(Date.now() + result.msBeforeNext),
      remaining: result.remainingPoints,
    };
  } catch (rejRes) {
    const result = rejRes as RateLimiterRes;
    
    // Log security event
    if (securityConfig.enableLogging) {
      console.warn(`Rate limit exceeded for ${type}:`, {
        ip,
        userId,
        endpoint,
        key,
        msBeforeNext: result.msBeforeNext,
        remainingPoints: result.remainingPoints,
      });
    }
    
    return {
      success: false,
      reset: new Date(Date.now() + result.msBeforeNext),
      remaining: 0,
      error: `Rate limit exceeded. Try again in ${Math.ceil(result.msBeforeNext / 1000)} seconds.`,
    };
  }
}

// Rate limiting middleware factory
export function createRateLimitMiddleware(
  type: RateLimiterType,
  options: {
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    onRateLimit?: (request: NextRequest) => void;
  } = {}
) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    userId?: string,
    endpoint?: string
  ): Promise<NextResponse | null> {
    const result = await checkRateLimit(type, request, userId, endpoint);
    
    if (!result.success) {
      if (options.onRateLimit) {
        options.onRateLimit(request);
      }
      
      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: result.error,
          retryAfter: Math.ceil((result.reset!.getTime() - Date.now()) / 1000),
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimiterConfigs[type].points.toString());
      response.headers.set('X-RateLimit-Remaining', (result.remaining || 0).toString());
      response.headers.set('X-RateLimit-Reset', result.reset!.getTime().toString());
      response.headers.set('Retry-After', Math.ceil((result.reset!.getTime() - Date.now()) / 1000).toString());
      
      return response;
    }
    
    return null; // Continue processing
  };
}

// Middleware for different endpoint types
export const apiRateLimit = createRateLimitMiddleware('api');
export const authRateLimit = createRateLimitMiddleware('auth', {
  onRateLimit: (request) => {
    console.warn(`Authentication rate limit exceeded for IP: ${getClientIP(request)}`);
  },
});
export const authenticatedRateLimit = createRateLimitMiddleware('authenticated');
export const codeExecutionRateLimit = createRateLimitMiddleware('codeExecution');
export const uploadRateLimit = createRateLimitMiddleware('upload');

// Adaptive rate limiting based on user behavior
export class AdaptiveRateLimiter {
  private suspiciousIPs = new Set<string>();
  private trustedUsers = new Set<string>();
  
  async checkAdaptiveLimit(
    request: NextRequest,
    userId?: string,
    endpoint?: string
  ): Promise<{ success: boolean; reason?: string }> {
    const ip = getClientIP(request);
    
    // Check if IP is flagged as suspicious
    if (this.suspiciousIPs.has(ip)) {
      const result = await checkRateLimit('auth', request, userId, endpoint);
      if (!result.success) {
        return { success: false, reason: 'Suspicious IP rate limited' };
      }
    }
    
    // Trusted users get higher limits
    if (userId && this.trustedUsers.has(userId)) {
      return { success: true };
    }
    
    // Regular rate limiting
    const result = await checkRateLimit('api', request, userId, endpoint);
    return { success: result.success, reason: result.error };
  }
  
  markSuspicious(ip: string): void {
    this.suspiciousIPs.add(ip);
    // Auto-remove after 1 hour
    setTimeout(() => this.suspiciousIPs.delete(ip), 60 * 60 * 1000);
  }
  
  markTrusted(userId: string): void {
    this.trustedUsers.add(userId);
  }
}

export const adaptiveRateLimiter = new AdaptiveRateLimiter();

// Cleanup function
export function cleanup(): void {
  if (redis) {
    redis.disconnect();
  }
}