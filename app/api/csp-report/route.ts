import { NextRequest } from 'next/server';
import { handleCSPReport } from '@/lib/security/headers';

// POST /api/csp-report - Handle CSP violation reports
export async function POST(request: NextRequest) {
  return handleCSPReport(request);
}