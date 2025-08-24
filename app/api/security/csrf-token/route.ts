import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFTokenEndpoint } from '@/lib/security/csrf';
import { createSecureAPIHandler, publicAPIMiddleware } from '@/lib/security/api-security';

// GET /api/security/csrf-token - Generate CSRF token
async function handleGetCSRFToken(request: NextRequest) {
  return generateCSRFTokenEndpoint(request).json();
}

export const GET = createSecureAPIHandler(handleGetCSRFToken, publicAPIMiddleware);