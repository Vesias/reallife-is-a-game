# Deployment Guide

This comprehensive guide covers deploying your Next.js 15 application with Supabase authentication to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Build Process](#build-process)
4. [Deployment Platforms](#deployment-platforms)
5. [Database Setup](#database-setup)
6. [Performance Optimization](#performance-optimization)
7. [Security Considerations](#security-considerations)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.0 or later
- A Supabase project set up
- Your code in a Git repository
- Environment variables configured
- Tests passing locally

### Pre-deployment Checklist

```bash
# Run the complete test suite
npm run test

# Type check
npm run type-check

# Lint and format
npm run lint
npm run format:check

# Build locally to verify
npm run build

# Test production build locally
npm run start
```

## Environment Variables

### Required Environment Variables

Create a `.env.production` file or configure these in your deployment platform:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Optional: Custom Domain
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Environment Variable Security

- **Never commit** `.env` files to version control
- Use your platform's secure environment variable storage
- Rotate secrets regularly
- Use different keys for different environments

## Build Process

### Next.js Build Configuration

The application uses Next.js 15 with the App Router. Build configuration is in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}

module.exports = nextConfig
```

### Build Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true next build",
    "build:prod": "NODE_ENV=production next build"
  }
}
```

## Deployment Platforms

### 1. Vercel (Recommended)

Vercel provides the best Next.js deployment experience.

#### Automatic Deployment

1. **Connect Repository**
   ```bash
   # Push your code to GitHub/GitLab/Bitbucket
   git push origin main
   ```

2. **Import Project to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your Git repository
   - Configure environment variables

3. **Environment Variables in Vercel**
   ```bash
   # Via Vercel CLI
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "regions": ["iad1"]
}
```

### 2. Netlify

#### Setup with Netlify

1. **Build Configuration (`netlify.toml`)**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   netlify deploy --prod
   ```

### 3. Railway

#### Railway Deployment

1. **Create `railway.json`**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway deploy
   ```

### 4. Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  nextjs-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

### 5. AWS Amplify

#### Amplify Configuration

1. **Build Settings (`amplify.yml`)**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

2. **Deploy**
   ```bash
   # Install Amplify CLI
   npm install -g @aws-amplify/cli

   # Initialize and deploy
   amplify init
   amplify add hosting
   amplify publish
   ```

## Database Setup

### Supabase Configuration

#### 1. Database Schema

Ensure your Supabase database has the required tables:

```sql
-- Enable the "auth" schema
create schema if not exists auth;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user profiles
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### 2. Authentication Settings

Configure authentication in your Supabase dashboard:

```json
{
  "site_url": "https://your-domain.com",
  "redirect_urls": [
    "https://your-domain.com/auth/callback",
    "http://localhost:3000/auth/callback"
  ],
  "jwt_expiry": 3600,
  "disable_signup": false,
  "external_email_enabled": true,
  "external_phone_enabled": false
}
```

#### 3. Security Policies

```sql
-- Additional security policies
create policy "Users can delete own profile." on public.profiles
  for delete using (auth.uid() = id);

-- Prevent username conflicts
create unique index profiles_username_key on public.profiles(lower(username));
```

## Performance Optimization

### 1. Next.js Optimizations

#### Image Optimization

```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
}
```

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Install bundle analyzer
npm install -D @next/bundle-analyzer
```

### 2. Database Performance

#### Indexing

```sql
-- Add indexes for better performance
create index profiles_username_idx on public.profiles(username);
create index profiles_updated_at_idx on public.profiles(updated_at desc);
```

#### Connection Pooling

Use Supabase's built-in connection pooling or configure pgBouncer:

```env
# Use connection pooling
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/[DATABASE]?pgbouncer=true
```

### 3. Caching Strategy

#### API Route Caching

```typescript
// app/api/user/route.ts
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  const response = NextResponse.json(userData);
  
  // Cache for 1 hour
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  
  return response;
}
```

#### Static Generation

```typescript
// app/dashboard/page.tsx
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour
```

## Security Considerations

### 1. Environment Security

- Use different Supabase projects for development, staging, and production
- Implement least-privilege access policies
- Regular security audits

### 2. Content Security Policy (CSP)

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co;",
          },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimit = new Map();

export function checkRateLimit(request: NextRequest, limit = 5, windowMs = 60000) {
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip);
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimit.set(ip, validRequests);
  return true;
}
```

## Monitoring & Logging

### 1. Error Tracking

#### Sentry Integration

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Performance Monitoring

#### Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.message, stack: error?.stack, meta, timestamp: new Date().toISOString() }));
  },
};
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Authentication Issues

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check Supabase connection
npx supabase status
```

#### 3. Database Connection Issues

```sql
-- Check connection limits
SELECT count(*) FROM pg_stat_activity;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### 4. Performance Issues

```bash
# Analyze bundle
npm run build:analyze

# Check lighthouse scores
npx lighthouse http://your-domain.com --view
```

### Debugging Tips

1. **Enable Debug Mode**
   ```env
   DEBUG=true
   NEXT_DEBUG=true
   ```

2. **Check Logs**
   ```bash
   # Vercel logs
   vercel logs

   # Railway logs
   railway logs

   # Docker logs
   docker logs container-name
   ```

3. **Database Debugging**
   ```sql
   -- Enable query logging
   ALTER SYSTEM SET log_statement = 'all';
   SELECT pg_reload_conf();
   ```

### Health Checks

Create health check endpoints:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: () => ({}) }
    );

    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
```

## Post-Deployment

### 1. Smoke Tests

```bash
# Test critical paths
curl https://your-domain.com/api/health
curl -H "Authorization: Bearer token" https://your-domain.com/api/user
```

### 2. Performance Monitoring

Set up alerts for:
- Response time > 2s
- Error rate > 1%
- Database connection failures
- Memory usage > 80%

### 3. Backup Strategy

```bash
# Regular database backups
pg_dump postgresql://connection-string > backup-$(date +%Y%m%d).sql

# Automated backups via cron
0 2 * * * /usr/local/bin/backup-script.sh
```

This deployment guide ensures your Next.js 15 application with Supabase authentication is production-ready, secure, and performant across multiple deployment platforms.