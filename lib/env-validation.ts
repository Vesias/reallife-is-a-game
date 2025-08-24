import { z } from 'zod';

// Environment validation schema
export const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL').optional(),

  // Security
  SECURITY_SECRET: z.string().min(32, 'Security secret must be at least 32 characters'),
  CSRF_SECRET: z.string().min(32, 'CSRF secret must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),

  // Redis/Rate Limiting
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  REDIS_PASSWORD: z.string().optional(),

  // API Configuration
  API_VERSION: z.string().default('v1'),
  API_BASE_URL: z.string().url('Invalid API base URL').optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().transform(str => str.split(',').map(s => s.trim())).optional(),

  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_SECURITY_LOGGING: z.string().transform(str => str.toLowerCase() === 'true').default(true),

  // E2B
  E2B_API_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_RATE_LIMITING: z.string().transform(str => str.toLowerCase() === 'true').default(true),
  ENABLE_CSRF_PROTECTION: z.string().transform(str => str.toLowerCase() === 'true').default(true),
  ENABLE_SECURITY_HEADERS: z.string().transform(str => str.toLowerCase() === 'true').default(true),
  STRICT_CSP: z.string().transform(str => str.toLowerCase() === 'true').default(false),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// Get validated environment variables
export const env = validateEnv();

// Export specific configurations for easy access
export const securityConfig = {
  jwtSecret: env.JWT_SECRET,
  securitySecret: env.SECURITY_SECRET,
  csrfSecret: env.CSRF_SECRET,
  sessionSecret: env.SESSION_SECRET,
  enableLogging: env.ENABLE_SECURITY_LOGGING,
  logLevel: env.LOG_LEVEL,
  nodeEnv: env.NODE_ENV,
  allowedOrigins: env.ALLOWED_ORIGINS || ['http://localhost:3000'],
  enableRateLimit: env.ENABLE_RATE_LIMITING,
  enableCsrf: env.ENABLE_CSRF_PROTECTION,
  enableSecurityHeaders: env.ENABLE_SECURITY_HEADERS,
  strictCSP: env.STRICT_CSP,
};

export const dbConfig = {
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
};

export const redisConfig = {
  url: env.REDIS_URL,
  password: env.REDIS_PASSWORD,
};

// Runtime environment validation for development
if (env.NODE_ENV === 'development') {
  console.log('✅ Environment variables validated successfully');
  console.log(`🔧 Running in ${env.NODE_ENV} mode`);
  console.log(`🔐 Security features: Rate Limiting: ${env.ENABLE_RATE_LIMITING}, CSRF: ${env.ENABLE_CSRF_PROTECTION}, Headers: ${env.ENABLE_SECURITY_HEADERS}`);
}