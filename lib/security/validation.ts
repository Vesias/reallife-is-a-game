import { z } from 'zod';
import { NextRequest } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
export const commonSchemas = {
  // User identification
  userId: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email address').max(254),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  // Text content
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim(),
  content: z.string().max(50000).trim(),
  
  // IDs and references
  questId: z.string().uuid('Invalid quest ID'),
  crewId: z.string().uuid('Invalid crew ID'),
  agentId: z.string().uuid('Invalid agent ID'),
  
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  
  // Sorting
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // File upload
  filename: z.string().max(255).regex(/^[^<>:"/\\|?*]+$/, 'Invalid filename'),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
  mimeType: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/),
};

// API endpoint validation schemas
export const apiSchemas = {
  // Authentication
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(8).max(128),
    rememberMe: z.boolean().optional(),
  }),
  
  signup: z.object({
    email: commonSchemas.email,
    password: z.string().min(8).max(128).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
    username: commonSchemas.username,
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
  }),
  
  // Quest management
  createQuest: z.object({
    title: commonSchemas.title,
    description: commonSchemas.description,
    category: z.enum(['health', 'career', 'learning', 'social', 'creative', 'fitness', 'other']),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    estimatedTime: z.number().min(1).max(10080), // Max 1 week in minutes
    xpReward: z.number().int().min(10).max(10000),
    tags: z.array(z.string().max(50)).max(10),
    isPublic: z.boolean().default(false),
    dueDate: z.string().datetime().optional(),
  }),
  
  updateQuest: z.object({
    title: commonSchemas.title.optional(),
    description: commonSchemas.description.optional(),
    status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
    progress: z.number().min(0).max(100).optional(),
  }),
  
  // Crew management
  createCrew: z.object({
    name: z.string().min(1).max(100).trim(),
    description: commonSchemas.description,
    isPrivate: z.boolean().default(false),
    maxMembers: z.number().int().min(2).max(50).default(10),
    tags: z.array(z.string().max(50)).max(10),
  }),
  
  inviteToCrew: z.object({
    crewId: commonSchemas.crewId,
    inviteeEmail: commonSchemas.email.optional(),
    inviteeUserId: commonSchemas.userId.optional(),
    message: z.string().max(500).trim().optional(),
  }).refine(data => data.inviteeEmail || data.inviteeUserId, {
    message: "Either email or user ID must be provided"
  }),
  
  // Code execution
  executeCode: z.object({
    code: z.string().max(100000).trim(),
    language: z.enum(['javascript', 'python', 'typescript', 'bash']),
    timeout: z.number().int().min(1).max(30).default(10),
    environment: z.string().max(100).optional(),
  }),
  
  // Agent configuration
  createAgent: z.object({
    name: z.string().min(1).max(100).trim(),
    type: z.enum(['personal', 'crew', 'system']),
    capabilities: z.array(z.string().max(100)).max(20),
    configuration: z.record(z.any()).optional(),
    isActive: z.boolean().default(true),
  }),
  
  // User profile
  updateProfile: z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(1000).trim().optional(),
    location: z.string().max(100).trim().optional(),
    website: z.string().url().optional(),
    preferences: z.record(z.any()).optional(),
  }),
  
  // Search and filtering
  search: z.object({
    query: z.string().min(1).max(200).trim(),
    type: z.enum(['quests', 'crews', 'users', 'all']).default('all'),
    filters: z.record(z.any()).optional(),
    page: commonSchemas.page,
    limit: commonSchemas.limit,
  }),
};

// Query parameter schemas
export const querySchemas = {
  pagination: z.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    sortBy: commonSchemas.sortBy,
    sortOrder: commonSchemas.sortOrder,
  }),
  
  questFilters: z.object({
    category: z.string().optional(),
    difficulty: z.string().optional(),
    status: z.string().optional(),
    tags: z.string().transform(str => str.split(',').map(s => s.trim())).optional(),
    userId: commonSchemas.userId.optional(),
  }),
  
  crewFilters: z.object({
    isPrivate: z.string().transform(str => str.toLowerCase() === 'true').optional(),
    hasOpenSlots: z.string().transform(str => str.toLowerCase() === 'true').optional(),
    tags: z.string().transform(str => str.split(',').map(s => s.trim())).optional(),
  }),
};

// Input sanitization
export function sanitizeInput<T>(input: T): T {
  if (typeof input === 'string') {
    // Remove HTML tags and prevent XSS
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    }) as T;
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)) as T;
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized as T;
  }
  
  return input;
}

// HTML content sanitization (for rich text content)
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  const defaultAllowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
    'a', 'code', 'pre'
  ];
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...defaultAllowedTags, ...allowedTags],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

// SQL injection prevention for dynamic queries
export function sanitizeForSQL(input: string): string {
  // Remove potentially dangerous SQL characters and keywords
  return input
    .replace(/[';\\]/g, '') // Remove semicolons and backslashes
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE|UNION|SELECT|FROM|WHERE|ORDER|GROUP|HAVING)\b/gi, '')
    .trim();
}

// Validate and sanitize request body
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const validatedData = schema.parse(sanitizedBody);
    
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Validate query parameters
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const sanitizedParams = sanitizeInput(params);
    const validatedData = schema.parse(sanitizedParams);
    
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// File upload validation
export function validateFileUpload(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // Check filename
  const filenameResult = commonSchemas.filename.safeParse(file.name);
  if (!filenameResult.success) {
    errors.push('Invalid filename');
  }
  
  // Check MIME type
  const mimeTypeResult = commonSchemas.mimeType.safeParse(file.type);
  if (!mimeTypeResult.success) {
    errors.push('Invalid file type');
  }
  
  // Check for potentially dangerous file types
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (dangerousExtensions.includes(fileExtension)) {
    errors.push('File type not allowed for security reasons');
  }
  
  return { valid: errors.length === 0, errors };
}

// Create validation middleware
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    const result = await validateRequestBody(request, schema);
    if (!result.success) {
      return Response.json(
        { 
          error: 'Validation failed',
          details: result.errors.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }
    
    return null; // Continue processing
  };
}

export default {
  commonSchemas,
  apiSchemas,
  querySchemas,
  sanitizeInput,
  sanitizeHTML,
  sanitizeForSQL,
  validateRequestBody,
  validateQueryParams,
  validateFileUpload,
  createValidationMiddleware,
};