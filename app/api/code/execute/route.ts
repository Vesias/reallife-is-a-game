import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { 
  CodeExecutionRequest, 
  CodeExecutionResponse, 
  CodeExecutionErrorResponse,
  RateLimitInfo 
} from '@/types/api'

export const runtime = 'nodejs' // Force Node.js runtime for Supabase and E2B compatibility

// Rate limiting store (in production, use Redis or a database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting constants
const RATE_LIMIT_REQUESTS = 10 // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_CODE_LENGTH = 10000 // Maximum code length in characters
const MAX_EXECUTION_TIME = 30 // Maximum execution time in seconds

// Cleanup old rate limit entries
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Check rate limit for user
function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupRateLimit()
  const now = Date.now()
  const key = `rate_limit_${userId}`
  const userLimit = rateLimitStore.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetTime }
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime }
  }

  // Increment count
  userLimit.count++
  rateLimitStore.set(key, userLimit)
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - userLimit.count, resetTime: userLimit.resetTime }
}

// Sanitize code input
function sanitizeCode(code: string): string {
  // Remove potentially dangerous imports and system calls
  const dangerousPatterns = [
    /import\s+os/gi,
    /import\s+subprocess/gi,
    /import\s+sys/gi,
    /from\s+os\s+import/gi,
    /from\s+subprocess\s+import/gi,
    /from\s+sys\s+import/gi,
    /__import__/gi,
    /exec\s*\(/gi,
    /eval\s*\(/gi,
  ]

  let sanitized = code
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '# BLOCKED: Potentially dangerous operation')
  })

  return sanitized
}

// Enhanced E2B execution function with security
async function executeCode(code: string, sessionID: string) {
  try {
    // Import E2B Sandbox dynamically
    const { Sandbox } = await import('@e2b/code-interpreter')
    
    const E2B_API_KEY = process.env.E2B_API_KEY
    if (!E2B_API_KEY) {
      throw new Error('E2B_API_KEY environment variable not found')
    }

    // Session timeout: 10 minutes
    const sandboxTimeout = 10 * 60 * 1000

    // Create new sandbox for each execution (simplified approach)
    console.log('Creating new sandbox for session:', sessionID)
    const sandbox = await Sandbox.create({
      apiKey: E2B_API_KEY,
      metadata: { sessionID },
      timeoutMs: sandboxTimeout
    })

    console.log('Code Interpreter session ready:', sandbox.sandboxId)

    // Execute the code
    const execution = await sandbox.runCode(code, {
      onStderr: (output: any) => console.error('Execution stderr:', output),
      onStdout: (output: any) => console.log('Execution stdout:', output),
    })
    
    // Format the results
    const results = {
      results: execution.results || [],
      stdout: Array.isArray(execution.logs?.stdout) ? execution.logs.stdout : [execution.logs?.stdout || ''],
      stderr: Array.isArray(execution.logs?.stderr) ? execution.logs.stderr : [execution.logs?.stderr || ''],
      error: execution.error || null,
      sessionId: sandbox.sandboxId,
    }

    return results

  } catch (error) {
    console.error('Code execution error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error(`Code execution timed out after ${MAX_EXECUTION_TIME} seconds`)
    }
    
    throw error
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CodeExecutionResponse | CodeExecutionErrorResponse>> {
  try {
    // Get client IP for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Check authentication with Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
          }
        }
      )
    }

    // Get request body
    const { code, sessionId }: CodeExecutionRequest = await request.json()

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      )
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (sessionId && (typeof sessionId !== 'string' || sessionId.length > 100)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Sanitize the code
    const sanitizedCode = sanitizeCode(code.trim())

    // Generate session ID if not provided
    const effectiveSessionId = sessionId || `session_${user.id}_${Date.now()}`

    // Execute code with timeout protection
    const startTime = Date.now()
    
    try {
      const result = await executeCode(sanitizedCode, effectiveSessionId)
      const executionTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          executionTime,
          user: {
            id: user.id,
            email: user.email
          }
        }
      }, {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
        }
      })
    } catch (executionError) {
      if (executionError instanceof Error && executionError.message.includes('timed out')) {
        return NextResponse.json(
          { error: executionError.message },
          { status: 408 }
        )
      }
      throw executionError
    }

  } catch (error) {
    console.error('API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Code execution failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
