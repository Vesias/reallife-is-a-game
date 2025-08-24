import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../env-validation';
import { adaptiveRateLimiter } from './rate-limiter';

// User roles and permissions
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export interface Permission {
  resource: string;
  action: string;
}

const basePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    { resource: 'quest', action: 'create' },
    { resource: 'quest', action: 'read' },
    { resource: 'quest', action: 'update_own' },
    { resource: 'quest', action: 'delete_own' },
    { resource: 'crew', action: 'create' },
    { resource: 'crew', action: 'join' },
    { resource: 'crew', action: 'leave' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'agent', action: 'create_own' },
    { resource: 'agent', action: 'manage_own' },
  ],
  [UserRole.MODERATOR]: [],
  [UserRole.ADMIN]: [],
  [UserRole.SYSTEM]: [
    { resource: '*', action: '*' },
  ],
};

// Build role permissions with inheritance
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: basePermissions[UserRole.USER],
  [UserRole.MODERATOR]: [
    ...basePermissions[UserRole.USER],
    { resource: 'quest', action: 'moderate' },
    { resource: 'crew', action: 'moderate' },
    { resource: 'user', action: 'moderate' },
    { resource: 'report', action: 'handle' },
  ],
  [UserRole.ADMIN]: [
    ...basePermissions[UserRole.USER],
    { resource: 'user', action: 'manage' },
    { resource: 'system', action: 'configure' },
    { resource: 'analytics', action: 'view' },
    { resource: 'security', action: 'monitor' },
  ],
  [UserRole.SYSTEM]: basePermissions[UserRole.SYSTEM],
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  permissions: Permission[];
  sessionId: string;
  lastActivity: Date;
  isVerified: boolean;
}

// Extract user from Supabase session
async function getUserFromSupabase(request: NextRequest): Promise<AuthenticatedUser | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user profile and role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role, is_verified')
      .eq('id', user.id)
      .single();

    const role = (profile?.role as UserRole) || UserRole.USER;
    
    return {
      id: user.id,
      email: user.email!,
      username: profile?.username,
      role,
      permissions: rolePermissions[role],
      sessionId: `supabase_${user.id}_${Date.now()}`,
      lastActivity: new Date(),
      isVerified: profile?.is_verified || false,
    };
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return null;
  }
}

// Extract user from JWT token
async function getUserFromJWT(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, securityConfig.jwtSecret) as any;
    
    // Validate token structure
    if (!decoded.userId || !decoded.email) {
      return null;
    }

    // Check token expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    const role = (decoded.role as UserRole) || UserRole.USER;
    
    return {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role,
      permissions: rolePermissions[role],
      sessionId: decoded.sessionId || `jwt_${decoded.userId}_${Date.now()}`,
      lastActivity: new Date(),
      isVerified: decoded.isVerified || false,
    };
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}

// Main authentication function
export async function authenticate(request: NextRequest): Promise<AuthenticatedUser | null> {
  // Try Supabase authentication first
  let user = await getUserFromSupabase(request);
  
  // Fallback to JWT authentication
  if (!user) {
    user = await getUserFromJWT(request);
  }

  // Update last activity
  if (user) {
    user.lastActivity = new Date();
    
    // Mark user as trusted in adaptive rate limiter
    adaptiveRateLimiter.markTrusted(user.id);
  }

  return user;
}

// Check if user has specific permission
export function hasPermission(user: AuthenticatedUser, resource: string, action: string): boolean {
  // System role has all permissions
  if (user.role === UserRole.SYSTEM) {
    return true;
  }

  return user.permissions.some(permission => 
    (permission.resource === resource || permission.resource === '*') &&
    (permission.action === action || permission.action === '*')
  );
}

// Check resource ownership
export function isResourceOwner(user: AuthenticatedUser, resourceUserId: string): boolean {
  return user.id === resourceUserId;
}

// Authorization middleware
export function requireAuth(requiredRole?: UserRole) {
  return async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Check if user is verified for sensitive operations
    if (requiredRole && requiredRole !== UserRole.USER && !user.isVerified) {
      return NextResponse.json(
        { error: 'Email verification required', code: 'VERIFICATION_REQUIRED' },
        { status: 403 }
      );
    }

    // Check role requirement
    if (requiredRole) {
      const roleHierarchy = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SYSTEM];
      const userRoleIndex = roleHierarchy.indexOf(user.role);
      const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
      
      if (userRoleIndex < requiredRoleIndex) {
        return NextResponse.json(
          { error: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' },
          { status: 403 }
        );
      }
    }

    // Add user to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('X-User-ID', user.id);
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-Session-ID', user.sessionId);
    
    return null; // Continue processing
  };
}

// Permission-based authorization
export function requirePermission(resource: string, action: string) {
  return async function permissionMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, resource, action)) {
      return NextResponse.json(
        { error: `Permission denied for ${action} on ${resource}`, code: 'PERMISSION_DENIED' },
        { status: 403 }
      );
    }

    return null; // Continue processing
  };
}

// Resource ownership authorization
export function requireOwnership(getUserIdFromRequest: (request: NextRequest) => string | Promise<string>) {
  return async function ownershipMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const resourceUserId = await getUserIdFromRequest(request);
    
    if (!isResourceOwner(user, resourceUserId) && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Resource access denied', code: 'RESOURCE_ACCESS_DENIED' },
        { status: 403 }
      );
    }

    return null; // Continue processing
  };
}

// Session validation middleware
export function validateSession() {
  return async function sessionMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const user = await authenticate(request);
    
    if (!user) {
      return null; // No user, skip session validation
    }

    // Check session expiry (24 hours for regular users, 1 hour for admins)
    const maxSessionAge = user.role === UserRole.ADMIN ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const sessionAge = Date.now() - user.lastActivity.getTime();
    
    if (sessionAge > maxSessionAge) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    return null; // Continue processing
  };
}

// API key authentication (for external integrations)
export function requireAPIKey() {
  return async function apiKeyMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required', code: 'API_KEY_REQUIRED' },
        { status: 401 }
      );
    }

    // In a real application, validate API key against database
    // For now, we'll use environment variable for simplicity
    const validAPIKey = process.env.API_KEY;
    
    if (!validAPIKey || apiKey !== validAPIKey) {
      return NextResponse.json(
        { error: 'Invalid API key', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }

    return null; // Continue processing
  };
}

// Generate JWT token
export function generateJWT(user: Partial<AuthenticatedUser>, expiresIn: string = '24h'): string {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    sessionId: user.sessionId,
    isVerified: user.isVerified,
  };
  
  return jwt.sign(payload, securityConfig.jwtSecret, { expiresIn });
}

// Middleware composition helper
export function composeMiddleware(...middlewares: Array<(request: NextRequest) => Promise<NextResponse | null>>) {
  return async function composedMiddleware(request: NextRequest): Promise<NextResponse | null> {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        return result; // Stop if middleware returns a response
      }
    }
    return null; // Continue processing
  };
}

export default {
  authenticate,
  hasPermission,
  isResourceOwner,
  requireAuth,
  requirePermission,
  requireOwnership,
  validateSession,
  requireAPIKey,
  generateJWT,
  composeMiddleware,
  UserRole,
  rolePermissions,
};