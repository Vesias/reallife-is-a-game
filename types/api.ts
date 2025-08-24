import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface ApiErrorResponse {
  success: false
  error: string
  statusCode: number
  details?: string
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// User API types
export interface UserApiResponse {
  user: {
    id: string
    email: string | undefined
    email_confirmed_at: string | undefined
    created_at: string
    updated_at: string
    full_name?: string | null
    username?: string | null
    website?: string | null
    avatar_url?: string | null
    bio?: string | null
    role?: 'admin' | 'moderator' | 'user'
  }
}

export interface UpdateUserProfileRequest {
  full_name?: string | null
  username?: string | null  
  website?: string | null
  avatar_url?: string | null
  bio?: string | null
}

export interface UpdateUserProfileResponse {
  message: string
  profile: {
    id: string
    full_name?: string | null
    username?: string | null
    website?: string | null
    avatar_url?: string | null
    bio?: string | null
    updated_at: string
  }
}

// Code Execution API types
export interface CodeExecutionRequest {
  code: string
  sessionId?: string
}

export interface CodeExecutionResult {
  results: any[]
  stdout: string[]
  stderr: string[]
  error: any
  sessionId: string
}

export interface CodeExecutionResponse {
  success: true
  data: CodeExecutionResult & {
    executionTime: number
    user: {
      id: string
      email: string | undefined
    }
  }
}

export interface CodeExecutionErrorResponse {
  error: string
  details?: string
  retryAfter?: number
}

// Rate limiting types
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
}

export interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetTime: number
}

// Auth types
export interface AuthCallbackRequest {
  code: string
  next?: string
}

export interface AuthUser {
  id: string
  email?: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
}

// Metrics API types
export interface SystemMetrics {
  timestamp: string
  cpu: {
    usage: number
    loadAverage: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  system: {
    uptime: number
    platform: string
    version: string
  }
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  services: {
    database: 'healthy' | 'unhealthy'
    auth: 'healthy' | 'unhealthy'
    storage: 'healthy' | 'unhealthy'
  }
  version: string
}

// Generic API handler types
export type ApiHandler = (request: NextRequest) => Promise<NextResponse>

export interface ApiRouteConfig {
  runtime?: 'nodejs' | 'edge'
  regions?: string[]
  maxDuration?: number
}

// Validation types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
    hasPrevious: boolean
  }
}

// Search and filter types
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
}

// Error types for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationApiError extends ApiError {
  constructor(message: string, public errors: ValidationError[]) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationApiError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter: number
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

// Type guards
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isValidationError(error: unknown): error is ValidationApiError {
  return error instanceof ValidationApiError
}

// Response helpers
export function createApiResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  )
}

export function createApiError(
  error: string,
  statusCode: number = 500,
  details?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status: statusCode }
  )
}

export function createRateLimitResponse(
  retryAfter: number,
  rateLimitInfo: RateLimitInfo
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime / 1000).toString(),
      },
    }
  )
}

// Type-safe environment variable helpers
export interface EnvironmentConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  E2B_API_KEY?: string
  NODE_ENV: 'development' | 'production' | 'test'
  NEXTAUTH_SECRET?: string
  NEXTAUTH_URL?: string
}

export function getEnvVar(key: keyof EnvironmentConfig): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export function getOptionalEnvVar(key: keyof EnvironmentConfig): string | undefined {
  return process.env[key]
}