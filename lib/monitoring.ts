/**
 * Performance Monitoring System
 * Real-time metrics collection and analysis
 */

import { NextRequest } from 'next/server';

// Performance metric types
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface PageViewMetric {
  route: string;
  loadTime: number;
  renderTime: number;
  timestamp: number;
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

interface ApiMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userId?: string;
}

interface ErrorMetric {
  type: 'client' | 'server' | 'api';
  message: string;
  stack?: string;
  route: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory metrics store (use Redis in production)
class MetricsStore {
  private metrics: PerformanceMetric[] = [];
  private pageViews: PageViewMetric[] = [];
  private apiMetrics: ApiMetric[] = [];
  private errors: ErrorMetric[] = [];
  private maxSize = 10000; // Maximum number of metrics to store

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.cleanup(this.metrics);
  }

  addPageView(pageView: PageViewMetric) {
    this.pageViews.push(pageView);
    this.cleanup(this.pageViews);
  }

  addApiMetric(apiMetric: ApiMetric) {
    this.apiMetrics.push(apiMetric);
    this.cleanup(this.apiMetrics);
  }

  addError(error: ErrorMetric) {
    this.errors.push(error);
    this.cleanup(this.errors);
  }

  private cleanup(array: any[]) {
    if (array.length > this.maxSize) {
      array.splice(0, array.length - this.maxSize);
    }
  }

  getMetrics(timeRange?: number): PerformanceMetric[] {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  getPageViews(timeRange?: number): PageViewMetric[] {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    return this.pageViews.filter(pv => pv.timestamp > cutoff);
  }

  getApiMetrics(timeRange?: number): ApiMetric[] {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    return this.apiMetrics.filter(am => am.timestamp > cutoff);
  }

  getErrors(timeRange?: number): ErrorMetric[] {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    return this.errors.filter(e => e.timestamp > cutoff);
  }

  getHealthStatus() {
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => e.timestamp > last5Minutes);
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical');
    const highErrors = recentErrors.filter(e => e.severity === 'high');
    
    const recentApiMetrics = this.apiMetrics.filter(am => am.timestamp > last5Minutes);
    const errorRate = recentApiMetrics.length > 0 
      ? recentApiMetrics.filter(am => am.statusCode >= 400).length / recentApiMetrics.length 
      : 0;
    
    const avgResponseTime = recentApiMetrics.length > 0
      ? recentApiMetrics.reduce((sum, am) => sum + am.responseTime, 0) / recentApiMetrics.length
      : 0;

    return {
      status: criticalErrors.length > 0 ? 'critical' : 
             highErrors.length > 5 ? 'degraded' : 
             errorRate > 0.1 ? 'warning' : 'healthy',
      errorCount: recentErrors.length,
      criticalErrorCount: criticalErrors.length,
      errorRate: Math.round(errorRate * 100),
      avgResponseTime: Math.round(avgResponseTime),
      totalRequests: recentApiMetrics.length
    };
  }
}

// Global metrics store
const metricsStore = new MetricsStore();

// Performance monitoring class
export class PerformanceMonitor {
  private startTime: number;
  private route: string;

  constructor(route: string) {
    this.startTime = Date.now();
    this.route = route;
  }

  // Track page load performance
  static trackPageLoad(route: string, loadTime: number, renderTime: number, userAgent?: string) {
    const deviceType = this.getDeviceType(userAgent);
    
    const pageView: PageViewMetric = {
      route,
      loadTime,
      renderTime,
      timestamp: Date.now(),
      userAgent,
      deviceType
    };

    metricsStore.addPageView(pageView);
    
    // Track performance metrics
    metricsStore.addMetric({
      name: 'page_load_time',
      value: loadTime,
      timestamp: Date.now(),
      labels: { route, deviceType }
    });

    metricsStore.addMetric({
      name: 'page_render_time',
      value: renderTime,
      timestamp: Date.now(),
      labels: { route, deviceType }
    });
  }

  // Track API performance
  static trackApiCall(endpoint: string, method: string, statusCode: number, responseTime: number, userId?: string) {
    const apiMetric: ApiMetric = {
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: Date.now(),
      userId
    };

    metricsStore.addApiMetric(apiMetric);
    
    // Track response time metric
    metricsStore.addMetric({
      name: 'api_response_time',
      value: responseTime,
      timestamp: Date.now(),
      labels: { endpoint, method, status: statusCode.toString() }
    });

    // Track request count
    metricsStore.addMetric({
      name: 'api_requests_total',
      value: 1,
      timestamp: Date.now(),
      labels: { endpoint, method, status: statusCode.toString() }
    });
  }

  // Track errors
  static trackError(type: ErrorMetric['type'], message: string, route: string, stack?: string, severity: ErrorMetric['severity'] = 'medium') {
    const error: ErrorMetric = {
      type,
      message,
      stack,
      route,
      timestamp: Date.now(),
      severity
    };

    metricsStore.addError(error);
    
    // Track error count metric
    metricsStore.addMetric({
      name: 'errors_total',
      value: 1,
      timestamp: Date.now(),
      labels: { type, severity, route }
    });

    // Log critical errors
    if (severity === 'critical') {
      console.error('[CRITICAL ERROR]', { message, route, stack });
    }
  }

  // Track custom metrics
  static trackCustomMetric(name: string, value: number, labels?: Record<string, string>) {
    metricsStore.addMetric({
      name,
      value,
      timestamp: Date.now(),
      labels
    });
  }

  // Get device type from user agent
  private static getDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' {
    if (!userAgent) return 'desktop';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  // End timing and track
  end(labels?: Record<string, string>) {
    const duration = Date.now() - this.startTime;
    metricsStore.addMetric({
      name: 'operation_duration',
      value: duration,
      timestamp: Date.now(),
      labels: { route: this.route, ...labels }
    });
    return duration;
  }
}

// Middleware wrapper for automatic API tracking
export function withPerformanceTracking<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let statusCode = 200;
    
    try {
      const result = await handler(...args);
      const responseTime = Date.now() - startTime;
      
      // Extract method from request if available
      const method = (args[0] as any)?.method || 'GET';
      
      PerformanceMonitor.trackApiCall(endpoint, method, statusCode, responseTime);
      
      return result;
    } catch (error) {
      statusCode = 500;
      const responseTime = Date.now() - startTime;
      const method = (args[0] as any)?.method || 'GET';
      
      PerformanceMonitor.trackApiCall(endpoint, method, statusCode, responseTime);
      PerformanceMonitor.trackError('api', (error as Error).message, endpoint, (error as Error).stack, 'high');
      
      throw error;
    }
  };
}

// React hook for client-side performance tracking
export function usePerformanceTracking(route: string) {
  if (typeof window === 'undefined') return { trackPageLoad: () => {}, trackError: () => {}, trackCustomEvent: () => {} };
  
  const trackPageLoad = () => {
    // Track page navigation performance
    if (typeof window !== 'undefined' && typeof window.performance !== 'undefined') {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigation = navigationEntries[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        PerformanceMonitor.trackPageLoad(route, loadTime, renderTime, navigator.userAgent);
      }
    }
  };

  const trackError = (error: Error) => {
    PerformanceMonitor.trackError('client', error.message, route, error.stack, 'medium');
  };

  const trackCustomEvent = (name: string, value: number, labels?: Record<string, string>) => {
    PerformanceMonitor.trackCustomMetric(name, value, { route, ...labels });
  };

  return { trackPageLoad, trackError, trackCustomEvent };
}

// Metrics API endpoints
export const MetricsAPI = {
  // Get all metrics
  getMetrics(timeRange?: number) {
    return {
      performance: metricsStore.getMetrics(timeRange),
      pageViews: metricsStore.getPageViews(timeRange),
      apiMetrics: metricsStore.getApiMetrics(timeRange),
      errors: metricsStore.getErrors(timeRange)
    };
  },

  // Get aggregated statistics
  getStats(timeRange?: number) {
    const metrics = metricsStore.getMetrics(timeRange);
    const pageViews = metricsStore.getPageViews(timeRange);
    const apiMetrics = metricsStore.getApiMetrics(timeRange);
    const errors = metricsStore.getErrors(timeRange);

    return {
      totalPageViews: pageViews.length,
      avgLoadTime: pageViews.length > 0 ? Math.round(pageViews.reduce((sum, pv) => sum + pv.loadTime, 0) / pageViews.length) : 0,
      totalApiCalls: apiMetrics.length,
      avgResponseTime: apiMetrics.length > 0 ? Math.round(apiMetrics.reduce((sum, am) => sum + am.responseTime, 0) / apiMetrics.length) : 0,
      errorRate: apiMetrics.length > 0 ? Math.round((apiMetrics.filter(am => am.statusCode >= 400).length / apiMetrics.length) * 100) : 0,
      totalErrors: errors.length,
      criticalErrors: errors.filter(e => e.severity === 'critical').length
    };
  },

  // Get health status
  getHealth() {
    return metricsStore.getHealthStatus();
  },

  // Get Prometheus format metrics
  getPrometheusMetrics() {
    const metrics = metricsStore.getMetrics();
    const lines: string[] = [];

    // Group metrics by name
    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // Convert to Prometheus format
    Object.entries(groupedMetrics).forEach(([name, metricList]) => {
      lines.push(`# HELP ${name} Performance metric`);
      lines.push(`# TYPE ${name} gauge`);
      
      metricList.forEach(metric => {
        const labels = metric.labels ? 
          Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',') : '';
        const labelStr = labels ? `{${labels}}` : '';
        lines.push(`${name}${labelStr} ${metric.value} ${metric.timestamp}`);
      });
    });

    return lines.join('\n');
  }
};

// Error boundary integration
export class PerformanceErrorBoundary {
  static captureException(error: Error, route: string) {
    PerformanceMonitor.trackError('client', error.message, route, error.stack, 'high');
  }
}

// Performance budget checker
export const PerformanceBudget = {
  // Define performance budgets
  budgets: {
    pageLoadTime: 3000, // 3 seconds
    apiResponseTime: 500, // 500ms
    errorRate: 5, // 5%
    renderTime: 1000 // 1 second
  },

  // Check if metrics are within budget
  checkBudget(timeRange = 5 * 60 * 1000) { // Last 5 minutes
    const stats = MetricsAPI.getStats(timeRange);
    
    return {
      pageLoadTime: {
        actual: stats.avgLoadTime,
        budget: this.budgets.pageLoadTime,
        withinBudget: stats.avgLoadTime <= this.budgets.pageLoadTime
      },
      apiResponseTime: {
        actual: stats.avgResponseTime,
        budget: this.budgets.apiResponseTime,
        withinBudget: stats.avgResponseTime <= this.budgets.apiResponseTime
      },
      errorRate: {
        actual: stats.errorRate,
        budget: this.budgets.errorRate,
        withinBudget: stats.errorRate <= this.budgets.errorRate
      }
    };
  }
};

export default PerformanceMonitor;
