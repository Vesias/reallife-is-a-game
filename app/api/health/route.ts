/**
 * Health Check API Endpoint
 * Provides application health status and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetricsAPI } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check basic application health
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      responseTime: 0 // Will be calculated below
    };

    // Check Supabase connection
    let supabaseStatus = 'unknown';
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
        const response = await fetch(`${supabaseUrl.origin}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
          }
        });
        supabaseStatus = response.ok ? 'healthy' : 'unhealthy';
      }
    } catch (error) {
      supabaseStatus = 'unhealthy';
    }

    // Get performance metrics
    const metrics = MetricsAPI.getHealth();
    const stats = MetricsAPI.getStats(5 * 60 * 1000); // Last 5 minutes

    // Calculate response time
    const responseTime = Date.now() - startTime;
    healthStatus.responseTime = responseTime;

    // Determine overall health status
    let overallStatus = 'healthy';
    if (supabaseStatus === 'unhealthy') {
      overallStatus = 'degraded';
    }
    if (metrics.status === 'critical') {
      overallStatus = 'critical';
    } else if (metrics.status === 'degraded') {
      overallStatus = 'degraded';
    }

    const healthResponse = {
      ...healthStatus,
      status: overallStatus,
      services: {
        supabase: {
          status: supabaseStatus,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not_configured'
        },
        redis: {
          status: process.env.REDIS_URL ? 'configured' : 'not_configured'
        }
      },
      metrics: {
        requestCount: stats.totalApiCalls,
        errorRate: stats.errorRate,
        avgResponseTime: stats.avgResponseTime,
        criticalErrors: stats.criticalErrors,
        pageViews: stats.totalPageViews,
        avgLoadTime: stats.avgLoadTime
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          limit: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: {
          loadAverage: process.platform === 'linux' ? require('os').loadavg() : null
        }
      }
    };

    // Return appropriate HTTP status code based on health
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 503 : 500;

    return NextResponse.json(healthResponse, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// Simple HEAD request for basic health check
export async function HEAD() {
  return new Response(null, { status: 200 });
}
