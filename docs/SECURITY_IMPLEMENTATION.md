# Security Implementation Guide

## Overview

This document outlines the comprehensive security implementation for the LifeQuest application, including all middleware, validation, and protection mechanisms.

## Security Features Implemented

### ✅ 1. Environment Variable Security

**File:** `/lib/env-validation.ts`

- **Zod Schema Validation**: All environment variables are validated at startup
- **Type Safety**: Full TypeScript support for environment configuration
- **Runtime Validation**: Fails fast on invalid configuration
- **Security Secrets**: Minimum 32-character requirement for secrets

**Key Features:**
- JWT secret validation (min 32 chars)
- Database URL validation
- CORS origins configuration
- Feature flag management
- Development vs production settings

### ✅ 2. Rate Limiting & DDoS Protection

**File:** `/lib/security/rate-limiter.ts`

- **Multiple Tier Limiting**: Different limits for different endpoint types
- **Distributed Support**: Redis-backed for production scalability
- **Adaptive Limiting**: Behavioral-based rate adjustments
- **IP & User-based**: Separate limits for authenticated users

**Rate Limit Tiers:**
- **API General**: 100 requests/minute
- **Authentication**: 5 attempts/5 minutes (blocked 30 min)
- **Authenticated Users**: 300 requests/minute
- **Code Execution**: 10 requests/minute
- **File Uploads**: 20 requests/10 minutes

### ✅ 3. Security Headers & CSP

**File:** `/lib/security/headers.ts`

- **Content Security Policy**: Strict CSP with development flexibility
- **HSTS**: HTTP Strict Transport Security for production
- **XSS Protection**: Multiple layers of XSS prevention
- **Clickjacking Protection**: X-Frame-Options and frame-ancestors
- **MIME Sniffing Prevention**: X-Content-Type-Options

**Headers Applied:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
X-Frame-Options: SAMEORIGIN
```

### ✅ 4. Input Validation & Sanitization

**File:** `/lib/security/validation.ts`

- **Zod Schemas**: Comprehensive validation for all API endpoints
- **HTML Sanitization**: DOMPurify integration for user content
- **SQL Injection Prevention**: Input sanitization and query parameterization
- **File Upload Validation**: Size, type, and filename validation

**Validation Schemas Available:**
- User authentication (login, signup)
- Quest management (create, update)
- Crew management
- Code execution
- Profile updates
- Search and filtering

### ✅ 5. Authentication & Authorization

**File:** `/lib/security/auth-middleware.ts`

- **Multi-Provider Support**: Supabase and JWT authentication
- **Role-Based Access Control**: User, Moderator, Admin, System roles
- **Permission System**: Resource and action-based permissions
- **Session Management**: Configurable session timeouts
- **API Key Support**: External integration authentication

**User Roles:**
- **USER**: Basic application access
- **MODERATOR**: Content moderation capabilities
- **ADMIN**: Full system management
- **SYSTEM**: Automated system operations

### ✅ 6. CSRF & XSS Protection

**File:** `/lib/security/csrf.ts`

- **Double Submit Cookie Pattern**: Client-server token validation
- **Synchronizer Token Pattern**: Server-side token storage
- **Origin Validation**: Request source verification
- **Token Expiration**: 1-hour token lifecycle
- **Metadata Validation**: User-Agent and IP consistency checks

**CSRF Protection Methods:**
1. Token-based validation for state-changing operations
2. Origin header verification
3. SameSite cookie configuration
4. Custom header requirements

### ✅ 7. Security Monitoring & Logging

**File:** `/lib/security/monitoring.ts`

- **Security Event Tracking**: Comprehensive event logging
- **Threat Detection**: Suspicious activity identification
- **Real-time Alerting**: Critical event notifications
- **Audit Trail**: Complete security event history
- **Dashboard Analytics**: Security metrics and reporting

**Monitored Events:**
- Authentication attempts (success/failure)
- Authorization violations
- Rate limit exceeded
- CSRF/XSS attempts
- Input validation failures
- Privilege escalation attempts

### ✅ 8. API Security Framework

**File:** `/lib/security/api-security.ts`

- **Comprehensive Middleware Stack**: Layered security approach
- **API Versioning**: Version-aware security policies
- **Request Context**: Full request lifecycle tracking
- **Error Handling**: Secure error responses without data leakage
- **Performance Monitoring**: Request timing and optimization

**Middleware Stack Order:**
1. Request logging
2. Security monitoring
3. Method validation
4. Origin validation
5. Content-Type validation
6. Rate limiting
7. CSRF protection
8. Authentication
9. Authorization
10. Input validation

## Security Configuration

### Environment Variables Required

Create a `.env` file based on `.env.example`:

```bash
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SECURITY_SECRET=your-32-character-security-secret-key
CSRF_SECRET=your-csrf-protection-secret-key-32-plus
SESSION_SECRET=your-session-secret-key-32-characters-plus

# Rate Limiting
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Feature Flags
ENABLE_RATE_LIMITING=true
ENABLE_CSRF_PROTECTION=true
ENABLE_SECURITY_HEADERS=true
STRICT_CSP=false

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Middleware Integration

The main middleware (`/middleware.ts`) automatically applies security measures:

```typescript
// Automatic security features:
✅ Security headers on all responses
✅ Rate limiting by endpoint type
✅ CSRF protection for state-changing operations
✅ Authentication for protected routes
✅ Security event logging
✅ Role-based access control
```

## API Security Usage

### Public Endpoints
```typescript
export const GET = createSecureAPIHandler(handler, publicAPIMiddleware);
```

### Authenticated Endpoints
```typescript
export const POST = createSecureAPIHandler(handler, authenticatedAPIMiddleware);
```

### Admin Endpoints
```typescript
export const PUT = createSecureAPIHandler(handler, adminAPIMiddleware);
```

### Custom Security
```typescript
const customMiddleware = createAPISecurityMiddleware({
  requireAuth: true,
  requiredRole: UserRole.MODERATOR,
  rateLimit: 'codeExecution',
  validationSchema: apiSchemas.executeCode,
});

export const POST = createSecureAPIHandler(handler, customMiddleware);
```

## Security Endpoints

### CSRF Token Generation
```
GET /api/security/csrf-token
```

### Security Dashboard (Admin Only)
```
GET /api/security/dashboard
```

### CSP Violation Reporting
```
POST /api/csp-report
```

## Security Best Practices

### 1. Input Validation
- Always use Zod schemas for input validation
- Sanitize user content with DOMPurify
- Validate file uploads before processing

### 2. Authentication
- Use secure session management
- Implement proper logout procedures
- Monitor authentication failures

### 3. Authorization
- Follow principle of least privilege
- Use role-based access control
- Audit permission changes

### 4. Rate Limiting
- Configure appropriate limits per endpoint
- Monitor rate limit violations
- Use adaptive limiting for suspicious behavior

### 5. Security Headers
- Enable all security headers in production
- Use strict CSP policies
- Monitor CSP violations

### 6. Monitoring
- Log all security events
- Set up alerting for critical events
- Regular security audits

## Deployment Security Checklist

### ✅ Environment Configuration
- [ ] All secrets are 32+ characters
- [ ] Production CORS origins configured
- [ ] HTTPS enabled with HSTS
- [ ] Security headers enabled
- [ ] Rate limiting enabled with Redis

### ✅ Authentication & Authorization
- [ ] Default admin account secured
- [ ] Role assignments reviewed
- [ ] API keys rotated
- [ ] Session timeouts configured

### ✅ Monitoring & Logging
- [ ] Security event logging enabled
- [ ] Alert systems configured
- [ ] Log retention policies set
- [ ] Security dashboard accessible

### ✅ Testing
- [ ] Security scan completed
- [ ] Penetration testing performed
- [ ] Rate limiting tested
- [ ] CSRF protection verified

## Security Incident Response

### 1. Detection
- Monitor security dashboard
- Review alert notifications
- Analyze unusual patterns

### 2. Analysis
- Export security events
- Identify attack vectors
- Assess impact scope

### 3. Containment
- Block malicious IPs
- Disable compromised accounts
- Increase security monitoring

### 4. Recovery
- Patch vulnerabilities
- Update security rules
- Restore affected data

### 5. Lessons Learned
- Document incident details
- Update security procedures
- Improve monitoring systems

## Support & Maintenance

### Regular Security Tasks
- Weekly security log review
- Monthly security updates
- Quarterly security audits
- Annual penetration testing

### Emergency Contacts
- Security team notifications
- Incident response procedures
- Vendor security contacts
- Legal/compliance teams

## Additional Security Considerations

### Future Enhancements
- [ ] Web Application Firewall (WAF) integration
- [ ] Advanced threat detection with ML
- [ ] Biometric authentication options
- [ ] Zero-trust architecture implementation
- [ ] Container security scanning
- [ ] Database encryption at rest
- [ ] Network segmentation
- [ ] Compliance certifications (SOC2, ISO27001)

### Known Limitations
- Rate limiting falls back to memory if Redis unavailable
- Development mode has relaxed CSP policies
- Some legacy endpoints may need security updates
- Mobile app security policies may differ

This security implementation provides enterprise-grade protection while maintaining developer productivity and user experience.