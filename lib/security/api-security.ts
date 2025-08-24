import { NextRequest, NextResponse } from 'next/server';
import { validateRequestBody, validateQueryParams, apiSchemas, querySchemas } from './validation';
import { authenticate, requireAuth, requirePermission, UserRole } from './auth-middleware';
import { apiRateLimit, authRateLimit, codeExecutionRateLimit } from './rate-limiter';
import { csrfProtection } from './csrf';
import { securityHeadersMiddleware, validateContentType, isAllowedOrigin } from './headers';
import { logSecurityEvent, SecurityEventType, SecurityEventSeverity, securityMonitoringMiddleware } from './monitoring';
import { securityConfig } from '../env-validation';

// API versioning configuration
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type APIVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

// Request context interface
export interface RequestContext {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
  };
  apiVersion: APIVersion;
  endpoint: string;
  startTime: number;
  requestId: string;
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract API version from request
function extractAPIVersion(request: NextRequest): APIVersion {
  // Check header first
  const headerVersion = request.headers.get('api-version') || request.headers.get('x-api-version');
  if (headerVersion && Object.values(API_VERSIONS).includes(headerVersion as APIVersion)) {
    return headerVersion as APIVersion;
  }
  
  // Check URL path
  const pathname = new URL(request.url).pathname;
  const versionMatch = pathname.match(/\/api\/(v\d+)\//);
  if (versionMatch && Object.values(API_VERSIONS).includes(versionMatch[1] as APIVersion)) {
    return versionMatch[1] as APIVersion;
  }
  
  // Default to v1
  return API_VERSIONS.V1;
}

// Create request context
function createRequestContext(request: NextRequest): RequestContext {
  return {
    apiVersion: extractAPIVersion(request),
    endpoint: new URL(request.url).pathname,
    startTime: Date.now(),
    requestId: generateRequestId(),
  };
}

// API error response
export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Standardized error response
function createErrorResponse(error: APIError | Error, requestId: string): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
        timestamp: new Date().toISOString(),
      }
    }, { status: error.status });
  }
  
  // Generic error (don't expose internal details in production)
  const message = securityConfig.nodeEnv === 'development' ? error.message : 'Internal server error';
  return NextResponse.json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
      requestId,
      timestamp: new Date().toISOString(),
    }
  }, { status: 500 });
}

// Request logging middleware
export function requestLoggingMiddleware() {
  return async function loggingMiddleware(request: NextRequest, context: RequestContext): Promise<void> {
    if (!securityConfig.enableLogging) return;
    
    const { method } = request;
    const { endpoint, requestId, apiVersion } = context;
    
    console.log(`[API] ${method} ${endpoint} (${apiVersion}) - ${requestId}`);
    
    // Log request details for debugging
    if (securityConfig.nodeEnv === 'development') {
      console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    }
  };
}

// Response logging middleware
export function responseLoggingMiddleware() {
  return function loggingMiddleware(
    response: NextResponse,
    request: NextRequest,
    context: RequestContext
  ): void {
    if (!securityConfig.enableLogging) return;
    
    const duration = Date.now() - context.startTime;
    const { method } = request;
    const { endpoint, requestId, apiVersion } = context;
    
    console.log(`[API] ${method} ${endpoint} (${apiVersion}) - ${response.status} - ${duration}ms - ${requestId}`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`[API] Slow request: ${method} ${endpoint} took ${duration}ms`);
    }
    
    // Add performance headers
    response.headers.set('X-Response-Time', `${duration}ms`);
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-API-Version', apiVersion);
  };
}

// Comprehensive API security middleware
export function createAPISecurityMiddleware(options: {
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermission?: { resource: string; action: string };
  rateLimit?: 'api' | 'auth' | 'codeExecution';
  validateCSRF?: boolean;
  validateOrigin?: boolean;
  allowedMethods?: string[];
  validationSchema?: any;
  querySchema?: any;
} = {}) {
  
  const {
    requireAuth: needsAuth = false,
    requiredRole,
    requiredPermission,
    rateLimit = 'api',
    validateCSRF = true,
    validateOrigin: shouldValidateOrigin = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    validationSchema,
    querySchema,
  } = options;

  return async function apiSecurityMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const context = createRequestContext(request);
    
    try {
      // 1. Request logging
      await requestLoggingMiddleware()(request, context);
      
      // 2. Security monitoring
      await securityMonitoringMiddleware()(request);
      
      // 3. Method validation
      if (!allowedMethods.includes(request.method)) {
        throw new APIError(
          'METHOD_NOT_ALLOWED',
          `Method ${request.method} not allowed`,
          405
        );
      }
      
      // 4. Origin validation
      if (shouldValidateOrigin && !isAllowedOrigin(request)) {
        logSecurityEvent(
          SecurityEventType.UNAUTHORIZED_ACCESS,
          SecurityEventSeverity.MEDIUM,
          request,
          { reason: 'Invalid origin' }
        );
        
        throw new APIError(
          'INVALID_ORIGIN',
          'Request origin not allowed',
          403
        );
      }
      
      // 5. Content-Type validation
      if (['POST', 'PUT', 'PATCH'].includes(request.method) && 
          !validateContentType(request, ['application/json'])) {
        throw new APIError(
          'INVALID_CONTENT_TYPE',
          'Content-Type must be application/json',
          400
        );
      }
      
      // 6. Rate limiting
      let rateLimitResponse = null;
      if (rateLimit === 'auth') {
        rateLimitResponse = await authRateLimit(request);
      } else if (rateLimit === 'codeExecution') {
        rateLimitResponse = await codeExecutionRateLimit(request);
      } else {
        rateLimitResponse = await apiRateLimit(request);
      }
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      
      // 7. CSRF protection
      if (validateCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfResponse = await csrfProtection()(request);
        if (csrfResponse) {
          return csrfResponse;
        }
      }
      
      // 8. Authentication
      if (needsAuth) {
        const user = await authenticate(request);
        if (!user) {
          logSecurityEvent(
            SecurityEventType.UNAUTHORIZED_ACCESS,
            SecurityEventSeverity.MEDIUM,
            request,
            { endpoint: context.endpoint }
          );
          
          throw new APIError(
            'AUTHENTICATION_REQUIRED',
            'Authentication required',
            401
          );
        }
        
        context.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        };
      }
      
      // 9. Role-based authorization
      if (requiredRole && context.user) {
        const roleHierarchy = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SYSTEM];
        const userRoleIndex = roleHierarchy.indexOf(context.user.role);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
        
        if (userRoleIndex < requiredRoleIndex) {
          logSecurityEvent(
            SecurityEventType.PRIVILEGE_ESCALATION,
            SecurityEventSeverity.HIGH,
            request,
            { 
              userId: context.user.id,
              userRole: context.user.role,
              requiredRole,
              endpoint: context.endpoint 
            },
            context.user.id
          );
          
          throw new APIError(
            'INSUFFICIENT_PERMISSIONS',
            'Insufficient permissions',
            403
          );
        }
      }
      
      // 10. Permission-based authorization
      if (requiredPermission && context.user) {
        // This would integrate with your permission system
        // For now, we'll use a simple role-based check
        const hasPermission = context.user.role === UserRole.ADMIN || 
                             context.user.role === UserRole.SYSTEM;
        
        if (!hasPermission) {
          logSecurityEvent(
            SecurityEventType.PERMISSION_DENIED,
            SecurityEventSeverity.MEDIUM,
            request,
            { 
              userId: context.user.id,
              requiredPermission,
              endpoint: context.endpoint 
            },
            context.user.id
          );
          
          throw new APIError(
            'PERMISSION_DENIED',
            `Permission denied for ${requiredPermission.action} on ${requiredPermission.resource}`,
            403
          );
        }
      }
      
      // 11. Request validation
      if (validationSchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const validationResult = await validateRequestBody(request, validationSchema);
        if (!validationResult.success) {
          logSecurityEvent(
            SecurityEventType.VALIDATION_FAILED,
            SecurityEventSeverity.LOW,
            request,
            { 
              errors: validationResult.errors.errors,
              endpoint: context.endpoint 
            },
            context.user?.id
          );
          
          throw new APIError(
            'VALIDATION_ERROR',
            'Request validation failed',
            400,
            validationResult.errors.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          );
        }
      }
      
      // 12. Query parameter validation
      if (querySchema) {
        const queryValidation = validateQueryParams(request, querySchema);
        if (!queryValidation.success) {
          throw new APIError(
            'QUERY_VALIDATION_ERROR',
            'Query parameter validation failed',
            400,
            queryValidation.errors.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          );
        }
      }
      
      // 13. Security headers
      const response = securityHeadersMiddleware(request);
      
      // Add request context to headers for downstream use
      response.headers.set('X-Request-Context', JSON.stringify({
        requestId: context.requestId,
        apiVersion: context.apiVersion,
        userId: context.user?.id,
      }));
      
      return null; // Continue processing
      
    } catch (error) {
      console.error('API Security Middleware Error:', error);
      
      if (error instanceof APIError) {
        return createErrorResponse(error, context.requestId);
      }
      
      return createErrorResponse(
        new APIError('SECURITY_ERROR', 'Security validation failed', 500),
        context.requestId
      );
    }
  };
}

// Pre-configured middleware for common use cases
export const publicAPIMiddleware = createAPISecurityMiddleware({
  requireAuth: false,
  rateLimit: 'api',
  validateCSRF: false,
});

export const authenticatedAPIMiddleware = createAPISecurityMiddleware({
  requireAuth: true,
  rateLimit: 'api',
  validateCSRF: true,
});

export const adminAPIMiddleware = createAPISecurityMiddleware({
  requireAuth: true,
  requiredRole: UserRole.ADMIN,
  rateLimit: 'api',
  validateCSRF: true,
});

export const authAPIMiddleware = createAPISecurityMiddleware({
  requireAuth: false,
  rateLimit: 'auth',
  validateCSRF: true,
});

export const codeExecutionAPIMiddleware = createAPISecurityMiddleware({
  requireAuth: true,
  rateLimit: 'codeExecution',
  validateCSRF: true,
  validationSchema: apiSchemas.executeCode,
});

// API endpoint wrapper with automatic security
export function createSecureAPIHandler<T = any>(
  handler: (request: NextRequest, context: RequestContext) => Promise<T>,
  middleware = authenticatedAPIMiddleware
) {
  return async function secureHandler(request: NextRequest): Promise<NextResponse> {
    const context = createRequestContext(request);
    
    try {
      // Apply middleware
      const middlewareResponse = await middleware(request);
      if (middlewareResponse) {
        return middlewareResponse;
      }
      
      // Parse user from headers (set by middleware)
      const userContextHeader = request.headers.get('X-Request-Context');
      if (userContextHeader) {
        const parsedContext = JSON.parse(userContextHeader);
        context.user = parsedContext.userId ? {
          id: parsedContext.userId,
          email: '', // Would be populated by auth middleware
          role: UserRole.USER, // Would be populated by auth middleware
          isVerified: true,
        } : undefined;
      }
      
      // Execute handler
      const result = await handler(request, context);
      
      // Create response
      const response = NextResponse.json(result);
      
      // Apply response logging
      responseLoggingMiddleware()(response, request, context);
      
      return response;
      
    } catch (error) {
      console.error('API Handler Error:', error);
      
      // Log error event
      logSecurityEvent(
        SecurityEventType.ERROR_THRESHOLD_EXCEEDED,
        SecurityEventSeverity.MEDIUM,
        request,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: context.endpoint 
        },
        context.user?.id
      );
      
      return createErrorResponse(
        error instanceof APIError ? error : new Error(String(error)),
        context.requestId
      );
    }
  };
}

export default {
  APIError,
  createAPISecurityMiddleware,
  createSecureAPIHandler,
  publicAPIMiddleware,
  authenticatedAPIMiddleware,
  adminAPIMiddleware,
  authAPIMiddleware,
  codeExecutionAPIMiddleware,
  API_VERSIONS,
};