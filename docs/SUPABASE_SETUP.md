# Supabase Integration Setup Guide

This document provides a comprehensive guide for setting up Supabase with Next.js authentication and database integration.

## Prerequisites

- Node.js 18+ installed
- Next.js 14+ project
- Supabase account and project

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

Install the required dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Database Setup

1. **Run the Schema**
   ```bash
   # Copy the contents of supabase/schema.sql to your Supabase SQL editor
   # Or use the Supabase CLI:
   supabase db reset
   ```

2. **Configure Authentication**
   - Go to Supabase Dashboard → Authentication → Settings
   - Add your site URL: `http://localhost:3000`
   - Add redirect URLs: `http://localhost:3000/auth/callback`

3. **Enable Row Level Security (RLS)**
   - RLS is automatically enabled by the schema
   - Policies are pre-configured for secure access

## File Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts      # Auth callback handler
│   │   └── user/
│   │       └── route.ts          # User profile API
├── lib/
│   ├── supabase-server.ts        # Server-side Supabase client
│   └── auth-helpers.ts           # Authentication utilities
├── middleware.ts                 # Next.js middleware for auth
├── supabase/
│   └── schema.sql               # Database schema
└── docs/
    └── SUPABASE_SETUP.md        # This file
```

## Key Components

### 1. Middleware (`middleware.ts`)
- Handles route protection
- Manages authentication state
- Redirects unauthenticated users

### 2. Server-side Client (`lib/supabase-server.ts`)
- Creates Supabase client for server components
- Handles server-side authentication
- Provides utility functions for user management

### 3. Auth Helpers (`lib/auth-helpers.ts`)
- Authentication utilities and guards
- Role-based access control
- Session management helpers

### 4. API Routes
- `/api/auth/callback` - Handles OAuth callbacks
- `/api/user` - User profile management (GET, PUT, DELETE)

### 5. Database Schema (`supabase/schema.sql`)
- User profiles with roles
- Content management (posts, comments)
- Social features (likes, follows)
- Notification system
- Session management

## Authentication Flow

1. **Sign Up/Login**
   ```typescript
   import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
   
   const supabase = createClientComponentClient()
   
   // Sign up
   const { error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       emailRedirectTo: `${origin}/auth/callback`,
     },
   })
   
   // Sign in
   const { error } = await supabase.auth.signInWithPassword({
     email,
     password,
   })
   ```

2. **Protected Pages**
   ```typescript
   import { requireAuth } from '@/lib/auth-helpers'
   
   export default async function ProtectedPage() {
     const user = await requireAuth()
     
     return <div>Hello {user.email}!</div>
   }
   ```

3. **Role-based Access**
   ```typescript
   import { requireRole } from '@/lib/auth-helpers'
   
   export default async function AdminPage() {
     const user = await requireRole('admin')
     
     return <div>Admin Panel</div>
   }
   ```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies ensure users can only access their own data
- Public content is accessible to everyone
- Admin override capabilities

### Session Management
- Automatic session refresh
- Session expiry tracking
- Multi-device session management
- Secure session cleanup

### Input Validation
- Username validation (3-20 characters, alphanumeric)
- Content length constraints
- SQL injection protection via Supabase

## API Endpoints

### User Profile API (`/api/user`)

**GET** - Retrieve current user profile
```bash
curl -X GET /api/user \
  -H "Authorization: Bearer {session_token}"
```

**PUT** - Update user profile
```bash
curl -X PUT /api/user \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "username": "johndoe",
    "website": "https://johndoe.com"
  }'
```

**DELETE** - Delete user account
```bash
curl -X DELETE /api/user
```

## Database Schema Overview

### Core Tables

1. **profiles** - User profile information
   - Extended user data beyond auth.users
   - Role-based access control
   - Social profile features

2. **posts** - Content management
   - Blog posts or articles
   - Status and visibility controls
   - User-generated content

3. **comments** - Comment system
   - Threaded comments support
   - Moderation capabilities

4. **likes** - Engagement tracking
   - Post likes/reactions
   - User interaction metrics

5. **follows** - Social features
   - User following system
   - Social network capabilities

6. **notifications** - User notifications
   - Real-time notification system
   - Read/unread tracking

7. **user_sessions** - Session management
   - Active session tracking
   - Device and IP logging

### Database Functions

- `handle_new_user()` - Auto-create profile on signup
- `cleanup_expired_sessions()` - Remove old sessions
- `get_user_stats()` - User activity statistics
- `is_valid_username()` - Username validation

## Development Workflow

1. **Local Development**
   ```bash
   # Start development server
   npm run dev
   
   # Run Supabase locally (optional)
   supabase start
   ```

2. **Database Migrations**
   ```bash
   # Create new migration
   supabase migration new your_migration_name
   
   # Apply migrations
   supabase db push
   ```

3. **Testing Authentication**
   - Test signup/login flow
   - Verify protected routes
   - Test role-based access
   - Validate session management

## Troubleshooting

### Common Issues

1. **Auth Callback Errors**
   - Verify callback URL in Supabase settings
   - Check environment variables
   - Ensure middleware is properly configured

2. **RLS Policy Issues**
   - Review policy definitions
   - Check user roles and permissions
   - Verify auth.uid() access

3. **Session Problems**
   - Clear browser cookies
   - Check session expiry
   - Verify middleware configuration

### Debug Tips

1. **Enable Logging**
   ```typescript
   // Add to your Supabase client
   const supabase = createClient(url, key, {
     auth: {
       debug: process.env.NODE_ENV === 'development'
     }
   })
   ```

2. **Check Network Tab**
   - Monitor auth requests
   - Verify cookie setting
   - Check API responses

3. **Database Logs**
   - Review Supabase logs
   - Check SQL query performance
   - Monitor RLS policy execution

## Production Considerations

1. **Environment Variables**
   - Use secure environment variable storage
   - Rotate keys regularly
   - Separate staging/production keys

2. **Performance Optimization**
   - Enable database indexing
   - Implement query caching
   - Monitor query performance

3. **Security Hardening**
   - Review RLS policies
   - Implement rate limiting
   - Monitor auth attempts

4. **Monitoring**
   - Set up error tracking
   - Monitor database performance
   - Track authentication metrics

## Next Steps

1. Implement social authentication (Google, GitHub)
2. Add real-time subscriptions for notifications
3. Implement file upload with Supabase Storage
4. Add email templates for auth emails
5. Set up database backups and monitoring

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Auth Guide](https://nextjs.org/docs/authentication)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://github.com/supabase/auth-helpers)