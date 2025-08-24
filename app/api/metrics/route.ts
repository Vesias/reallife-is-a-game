/**
 * Prometheus Metrics Endpoint
 * Provides application metrics in Prometheus format
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetricsAPI } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Get Prometheus formatted metrics
    const prometheusMetrics = MetricsAPI.getPrometheusMetrics();
    
    // Add basic system metrics
    const systemMetrics = [
      `# HELP nodejs_version Node.js version`,
      `# TYPE nodejs_version gauge`,
      `nodejs_version{version="${process.version}"} 1`,
      '',
      `# HELP process_uptime_seconds Process uptime in seconds`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${process.uptime()}`,
      '',
      `# HELP process_memory_usage_bytes Process memory usage in bytes`,
      `# TYPE process_memory_usage_bytes gauge`,
      `process_memory_usage_bytes{type="heap_used"} ${process.memoryUsage().heapUsed}`,
      `process_memory_usage_bytes{type="heap_total"} ${process.memoryUsage().heapTotal}`,
      `process_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}`,
      `process_memory_usage_bytes{type="external"} ${process.memoryUsage().external}`,
      '',
    ];
    
    const allMetrics = [...systemMetrics, prometheusMetrics].join('\n');
    
    return new Response(allMetrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'
      }
    });
    
  } catch (error) {
    console.error('Failed to generate metrics:', error);
    
    return NextResponse.json({
      error: 'Failed to generate metrics'
    }, { status: 500 });
  }
}
