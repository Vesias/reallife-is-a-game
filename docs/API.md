# API Documentation

This document provides comprehensive documentation for all API endpoints in the Next.js 15 application with Supabase authentication.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Management API](#user-management-api)
4. [Authentication Callback API](#authentication-callback-api)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)
8. [Testing](#testing)

## Overview

The API is built with Next.js 15 App Router and uses Supabase for authentication and data persistence. All endpoints follow REST conventions and return JSON responses.

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### Content Type
All requests should include:
```
Content-Type: application/json
```

### Response Format
All responses follow this structure:
```json
{
  "data": {},
  "error": null,
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

The API uses Supabase Auth with JWT tokens. Authentication is handled via HTTP-only cookies for security.

### Authentication Flow

1. User signs in via `/auth/signin`
2. Supabase returns a session with JWT
3. JWT is stored in HTTP-only cookies
4. Subsequent requests include the cookie automatically
5. Server validates the JWT on protected routes

### Protected Endpoints
All user-specific endpoints require authentication:
- `/api/user/*`

## User Management API

### Get Current User Profile

Retrieves the current authenticated user's profile information.

```http
GET /api/user
```

#### Headers
```
Cookie: supabase-auth-token=<jwt_token>
```

#### Success Response (200)
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "full_name": "John Doe",
    "username": "johndoe",
    "avatar_url": "https://example.com/avatar.jpg",
    "website": "https://johndoe.com"
  }
}
```

#### Error Responses
```json
// Unauthorized (401)
{
  "error": "Unauthorized",
  "message": "Authentication required"
}

// Server Error (500)
{
  "error": "Failed to fetch profile",
  "message": "Internal server error occurred"
}
```

#### Example Usage
```javascript
// Fetch user profile
const response = await fetch('/api/user', {
  method: 'GET',
  credentials: 'include', // Include cookies
});

if (response.ok) {
  const { user } = await response.json();
  console.log('User profile:', user);
} else {
  const { error } = await response.json();
  console.error('Error:', error);
}
```

### Update User Profile

Updates the current authenticated user's profile information.

```http
PUT /api/user
```

#### Headers
```
Content-Type: application/json
Cookie: supabase-auth-token=<jwt_token>
```

#### Request Body
```json
{
  "full_name": "John Doe",
  "username": "johndoe",
  "website": "https://johndoe.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### Validation Rules
- `username`: Minimum 3 characters, unique across all users
- `website`: Must be a valid URL if provided
- `avatar_url`: Must be a valid URL if provided
- `full_name`: Maximum 255 characters

#### Success Response (200)
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "John Doe",
    "username": "johndoe",
    "website": "https://johndoe.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses
```json
// Validation Error (400)
{
  "error": "Username must be at least 3 characters",
  "field": "username"
}

// Unauthorized (401)
{
  "error": "Unauthorized",
  "message": "Authentication required"
}

// Conflict (409)
{
  "error": "Username already exists",
  "field": "username"
}

// Server Error (500)
{
  "error": "Failed to update profile",
  "message": "Internal server error occurred"
}
```

#### Example Usage
```javascript
// Update user profile
const updateData = {
  full_name: 'John Smith',
  username: 'johnsmith',
  website: 'https://johnsmith.com'
};

const response = await fetch('/api/user', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(updateData)
});

if (response.ok) {
  const { profile } = await response.json();
  console.log('Profile updated:', profile);
} else {
  const { error } = await response.json();
  console.error('Update failed:', error);
}
```

### Delete User Account

Permanently deletes the current authenticated user's account and all associated data.

```http
DELETE /api/user
```

#### Headers
```
Cookie: supabase-auth-token=<jwt_token>
```

#### Success Response (200)
```json
{
  "message": "Account deleted successfully"
}
```

#### Error Responses
```json
// Unauthorized (401)
{
  "error": "Unauthorized",
  "message": "Authentication required"
}

// Server Error (500)
{
  "error": "Failed to delete account",
  "message": "Internal server error occurred"
}
```

#### Example Usage
```javascript
// Delete user account
const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');

if (confirmDelete) {
  const response = await fetch('/api/user', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (response.ok) {
    const { message } = await response.json();
    console.log(message);
    // Redirect to home page
    window.location.href = '/';
  } else {
    const { error } = await response.json();
    console.error('Delete failed:', error);
  }
}
```

## Authentication Callback API

### Handle OAuth Callback

Handles the OAuth callback from Supabase authentication providers.

```http
GET /api/auth/callback?code=<auth_code>&next=<redirect_path>
```

#### Query Parameters
- `code` (required): Authorization code from Supabase
- `next` (optional): Path to redirect to after successful authentication (default: `/`)

#### Success Response (302)
Redirects to the specified `next` parameter or `/` by default.

#### Error Response (302)
Redirects to `/auth/auth-code-error` with error information.

#### Example URLs
```
# Successful callback
GET /api/auth/callback?code=abc123&next=/dashboard

# Error callback
GET /api/auth/callback?error=access_denied&error_description=User+denied+access
```

### Sign Out User

Signs out the current authenticated user and clears their session.

```http
POST /api/auth/callback
```

#### Query Parameters
- `redirect_to` (optional): Path to redirect to after sign out (default: `/`)

#### Success Response (200)
```json
{
  "message": "Successfully signed out"
}
```

#### Error Responses
```json
// Sign Out Error (400)
{
  "error": "Failed to sign out",
  "message": "Could not complete sign out process"
}

// Server Error (500)
{
  "error": "An unexpected error occurred",
  "message": "Internal server error"
}
```

#### Example Usage
```javascript
// Sign out user
const signOut = async () => {
  const response = await fetch('/api/auth/callback', {
    method: 'POST',
    credentials: 'include',
  });

  if (response.ok) {
    const { message } = await response.json();
    console.log(message);
    // Redirect to login page
    window.location.href = '/login';
  } else {
    const { error } = await response.json();
    console.error('Sign out failed:', error);
  }
};
```

## Error Handling

### Standard Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate data (e.g., username already exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors, database issues |

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message",
  "message": "Detailed description",
  "field": "field_name", // For validation errors
  "code": "ERROR_CODE", // For specific error types
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Client-Side Error Handling

```javascript
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    
    switch (response.status) {
      case 400:
        console.error('Validation error:', errorData.error);
        // Show field-specific error to user
        break;
      case 401:
        console.error('Authentication required');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access denied');
        // Show permission error to user
        break;
      case 429:
        console.error('Too many requests');
        // Show rate limit message
        break;
      case 500:
        console.error('Server error:', errorData.error);
        // Show generic error message
        break;
      default:
        console.error('Unexpected error:', errorData.error);
    }
    
    throw new Error(errorData.error);
  }
  
  return response.json();
};

// Usage
try {
  const data = await handleApiError(response);
  // Process successful response
} catch (error) {
  // Handle error appropriately
}
```

## Rate Limiting

### Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/user` (GET) | 60 requests | 1 minute |
| `/api/user` (PUT) | 10 requests | 1 minute |
| `/api/user` (DELETE) | 1 request | 5 minutes |
| `/api/auth/callback` | 30 requests | 1 minute |

### Rate Limit Headers

When rate limits are enforced, responses include these headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again later.",
  "retry_after": 60
}
```

## Examples

### Complete Authentication Flow

```javascript
class AuthService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // Sign in with email and password
  async signIn(email, password) {
    const { signInWithPassword } = useSupabaseAuth();
    
    try {
      const { data, error } = await signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile() {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const { user } = await response.json();
    return user;
  }

  // Update user profile
  async updateProfile(profileData) {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    const { profile } = await response.json();
    return profile;
  }

  // Sign out
  async signOut() {
    const response = await fetch(`${this.baseUrl}/auth/callback`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to sign out');
    }

    return response.json();
  }

  // Delete account
  async deleteAccount() {
    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    return response.json();
  }
}

// Usage example
const authService = new AuthService();

// Sign in
try {
  await authService.signIn('user@example.com', 'password123');
  console.log('Signed in successfully');
} catch (error) {
  console.error('Sign in failed:', error.message);
}

// Get profile
try {
  const profile = await authService.getProfile();
  console.log('Profile:', profile);
} catch (error) {
  console.error('Failed to fetch profile:', error.message);
}

// Update profile
try {
  const updatedProfile = await authService.updateProfile({
    full_name: 'John Doe',
    username: 'johndoe'
  });
  console.log('Profile updated:', updatedProfile);
} catch (error) {
  console.error('Update failed:', error.message);
}
```

### React Hook for API Integration

```typescript
// hooks/use-api.ts
import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Usage in component
function ProfileComponent() {
  const { data: profile, loading, error, execute } = useApi();

  useEffect(() => {
    execute('/api/user');
  }, [execute]);

  const updateProfile = async (profileData) => {
    try {
      await execute('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      // Profile updated successfully
    } catch (error) {
      // Handle error
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      {/* Profile form */}
    </div>
  );
}
```

## Testing

### Unit Tests for API Integration

```javascript
// __tests__/api-integration.test.js
import { AuthService } from '../lib/auth-service';

// Mock fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
    fetch.mockClear();
  });

  test('should fetch user profile successfully', async () => {
    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      full_name: 'Test User'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockProfile }),
    });

    const profile = await authService.getProfile();

    expect(fetch).toHaveBeenCalledWith('/api/user', {
      method: 'GET',
      credentials: 'include',
    });
    expect(profile).toEqual(mockProfile);
  });

  test('should handle API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(authService.getProfile()).rejects.toThrow('Unauthorized');
  });
});
```

### Integration Tests with Supertest

```javascript
// __tests__/api-routes.test.js
import request from 'supertest';
import { createMocks } from 'node-mocks-http';
import handler from '../app/api/user/route';

describe('/api/user', () => {
  test('GET should return user profile', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      cookies: {
        'supabase-auth-token': 'valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('user');
  });

  test('PUT should update user profile', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {
        full_name: 'Updated Name'
      },
      cookies: {
        'supabase-auth-token': 'valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Profile updated successfully');
  });
});
```

This API documentation provides comprehensive information for integrating with the authentication and user management endpoints in your Next.js 15 application.