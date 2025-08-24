import { NextRequest } from 'next/server';
import { securityConfig } from '../env-validation';

// Security event types
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKED = 'account_locked',
  
  // Authorization events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  PERMISSION_DENIED = 'permission_denied',
  
  // Rate limiting and abuse
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  
  // CSRF and XSS
  CSRF_TOKEN_MISSING = 'csrf_token_missing',
  CSRF_TOKEN_INVALID = 'csrf_token_invalid',
  XSS_ATTEMPT = 'xss_attempt',
  
  // Input validation
  VALIDATION_FAILED = 'validation_failed',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  
  // System events
  SECURITY_SCAN = 'security_scan',
  CONFIGURATION_CHANGE = 'configuration_change',
  ERROR_THRESHOLD_EXCEEDED = 'error_threshold_exceeded',
  
  // Data events
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  BULK_OPERATION = 'bulk_operation',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  sessionId?: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  details: Record<string, any>;
  additionalMetadata?: Record<string, any>;
}

// Security event store (in production, use a proper logging service)
class SecurityEventStore {
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  
  add(event: SecurityEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Log to console in development
    if (securityConfig.nodeEnv === 'development') {
      console.log(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, {
        userId: event.userId,
        ip: event.ip,
        path: event.path,
        details: event.details,
      });
    }
  }
  
  getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
    if (!filter) return [...this.events];
    
    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        if (value === undefined) return true;
        return event[key as keyof SecurityEvent] === value;
      });
    });
  }
  
  getEventsByTimeRange(start: Date, end: Date): SecurityEvent[] {
    return this.events.filter(event => 
      event.timestamp >= start && event.timestamp <= end
    );
  }
  
  getEventsByUser(userId: string): SecurityEvent[] {
    return this.events.filter(event => event.userId === userId);
  }
  
  getEventsByIP(ip: string): SecurityEvent[] {
    return this.events.filter(event => event.ip === ip);
  }
  
  clear(): void {
    this.events = [];
  }
}

const eventStore = new SecurityEventStore();

// Extract request metadata
function extractRequestMetadata(request: NextRequest): {
  ip: string;
  userAgent: string;
  path: string;
  method: string;
} {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = new URL(request.url).pathname;
  const method = request.method;
  
  return { ip, userAgent, path, method };
}

// Generate unique event ID
function generateEventId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log security event
export function logSecurityEvent(
  type: SecurityEventType,
  severity: SecurityEventSeverity,
  request: NextRequest,
  details: Record<string, any> = {},
  userId?: string,
  sessionId?: string,
  additionalMetadata?: Record<string, any>
): SecurityEvent {
  if (!securityConfig.enableLogging) {
    return {} as SecurityEvent;
  }
  
  const metadata = extractRequestMetadata(request);
  
  const event: SecurityEvent = {
    id: generateEventId(),
    timestamp: new Date(),
    type,
    severity,
    userId,
    sessionId,
    ...metadata,
    details,
    additionalMetadata,
  };
  
  eventStore.add(event);
  
  // Alert on critical events
  if (severity === SecurityEventSeverity.CRITICAL) {
    alertOnCriticalEvent(event);
  }
  
  return event;
}

// Alert handlers for critical events
function alertOnCriticalEvent(event: SecurityEvent): void {
  console.error(`🚨 CRITICAL SECURITY EVENT: ${event.type}`, {
    id: event.id,
    userId: event.userId,
    ip: event.ip,
    path: event.path,
    details: event.details,
  });
  
  // In production, integrate with alerting services:
  // - Send to Slack/Discord
  // - Email security team
  // - Create incident in monitoring system
  // - Trigger automated response
}

// Security monitoring class
export class SecurityMonitor {
  private suspiciousIPs = new Map<string, number>();
  private failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();
  private bruteForceThreshold = 5;
  private suspiciousActivityThreshold = 10;
  
  // Monitor failed login attempts
  trackFailedLogin(ip: string, userId?: string): void {
    const key = userId || ip;
    const current = this.failedAttempts.get(key) || { count: 0, lastAttempt: new Date() };
    
    current.count++;
    current.lastAttempt = new Date();
    this.failedAttempts.set(key, current);
    
    // Check for brute force
    if (current.count >= this.bruteForceThreshold) {
      this.markSuspicious(ip);
    }
  }
  
  // Reset failed attempts on successful login
  resetFailedAttempts(key: string): void {
    this.failedAttempts.delete(key);
  }
  
  // Mark IP as suspicious
  markSuspicious(ip: string): void {
    const currentCount = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, currentCount + 1);
    
    // Auto-remove after 24 hours
    setTimeout(() => {
      const count = this.suspiciousIPs.get(ip) || 0;
      if (count > 1) {
        this.suspiciousIPs.set(ip, count - 1);
      } else {
        this.suspiciousIPs.delete(ip);
      }
    }, 24 * 60 * 60 * 1000);
  }
  
  // Check if IP is suspicious
  isSuspicious(ip: string): boolean {
    return (this.suspiciousIPs.get(ip) || 0) >= this.suspiciousActivityThreshold;
  }
  
  // Get suspicious activity report
  getSuspiciousActivityReport(): {
    suspiciousIPs: Array<{ ip: string; count: number }>;
    recentFailedAttempts: Array<{ key: string; count: number; lastAttempt: Date }>;
  } {
    const suspiciousIPs = Array.from(this.suspiciousIPs.entries()).map(([ip, count]) => ({
      ip,
      count,
    }));
    
    const recentFailedAttempts = Array.from(this.failedAttempts.entries())
      .filter(([_, data]) => Date.now() - data.lastAttempt.getTime() < 60 * 60 * 1000) // Last hour
      .map(([key, data]) => ({
        key,
        count: data.count,
        lastAttempt: data.lastAttempt,
      }));
    
    return { suspiciousIPs, recentFailedAttempts };
  }
  
  // Cleanup old data
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [key, data] of this.failedAttempts.entries()) {
      if (data.lastAttempt < oneHourAgo) {
        this.failedAttempts.delete(key);
      }
    }
  }
}

export const securityMonitor = new SecurityMonitor();

// Middleware for automatic security monitoring
export function securityMonitoringMiddleware() {
  return async function monitoringMiddleware(request: NextRequest): Promise<void> {
    const { path, method } = extractRequestMetadata(request);
    
    // Monitor sensitive endpoints
    if (path.includes('auth') || path.includes('admin')) {
      logSecurityEvent(
        SecurityEventType.SENSITIVE_DATA_ACCESS,
        SecurityEventSeverity.LOW,
        request,
        { endpoint: path, method }
      );
    }
    
    // Monitor for potential SQL injection
    const urlParams = new URL(request.url).searchParams;
    const suspiciousSQLPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /update\s+set/i,
      /delete\s+from/i,
      /or\s+1\s*=\s*1/i,
      /'\s*or\s*'/i,
    ];
    
    for (const [key, value] of urlParams.entries()) {
      if (suspiciousSQLPatterns.some(pattern => pattern.test(value))) {
        logSecurityEvent(
          SecurityEventType.SQL_INJECTION_ATTEMPT,
          SecurityEventSeverity.HIGH,
          request,
          { parameter: key, value, endpoint: path }
        );
        break;
      }
    }
    
    // Monitor for XSS attempts
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>.*?<\/iframe>/i,
    ];
    
    for (const [key, value] of urlParams.entries()) {
      if (xssPatterns.some(pattern => pattern.test(value))) {
        logSecurityEvent(
          SecurityEventType.XSS_ATTEMPT,
          SecurityEventSeverity.HIGH,
          request,
          { parameter: key, value, endpoint: path }
        );
        break;
      }
    }
  };
}

// Get security dashboard data
export function getSecurityDashboard(): {
  recentEvents: SecurityEvent[];
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  suspiciousActivity: ReturnType<SecurityMonitor['getSuspiciousActivityReport']>;
  stats: {
    totalEvents: number;
    eventsToday: number;
    criticalEventsToday: number;
    uniqueIPs: number;
  };
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const recentEvents = eventStore.getEventsByTimeRange(
    new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    now
  ).slice(-50); // Last 50 events
  
  const allEvents = eventStore.getEvents();
  
  // Count events by type
  const eventsByType: Record<string, number> = {};
  allEvents.forEach(event => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  });
  
  // Count events by severity
  const eventsBySeverity: Record<string, number> = {};
  allEvents.forEach(event => {
    eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
  });
  
  const todayEvents = eventStore.getEventsByTimeRange(today, now);
  const criticalEventsToday = todayEvents.filter(
    event => event.severity === SecurityEventSeverity.CRITICAL
  );
  
  const uniqueIPs = new Set(allEvents.map(event => event.ip)).size;
  
  return {
    recentEvents,
    eventsByType,
    eventsBySeverity,
    suspiciousActivity: securityMonitor.getSuspiciousActivityReport(),
    stats: {
      totalEvents: allEvents.length,
      eventsToday: todayEvents.length,
      criticalEventsToday: criticalEventsToday.length,
      uniqueIPs,
    },
  };
}

// Export events for analysis
export function exportSecurityEvents(format: 'json' | 'csv' = 'json'): string {
  const events = eventStore.getEvents();
  
  if (format === 'csv') {
    const headers = ['id', 'timestamp', 'type', 'severity', 'userId', 'ip', 'path', 'method'];
    const csvRows = [
      headers.join(','),
      ...events.map(event => 
        headers.map(header => {
          const value = event[header as keyof SecurityEvent];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      ),
    ];
    return csvRows.join('\n');
  }
  
  return JSON.stringify(events, null, 2);
}

// Periodic cleanup task
setInterval(() => {
  securityMonitor.cleanup();
}, 60 * 60 * 1000); // Run every hour

export default {
  SecurityEventType,
  SecurityEventSeverity,
  logSecurityEvent,
  securityMonitor,
  securityMonitoringMiddleware,
  getSecurityDashboard,
  exportSecurityEvents,
};