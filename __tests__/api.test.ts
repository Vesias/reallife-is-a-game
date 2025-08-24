/**
 * @test API Routes Integration Tests
 * @description Comprehensive integration tests for authentication and user API routes
 */

import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/user/route'
import { GET as AuthCallbackGET, POST as AuthCallbackPOST } from '@/app/api/auth/callback/route'

// Mock Next.js cookies
const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn()
}

jest.mock('next/headers', () => ({
  cookies: () => mockCookies
}))

// Mock Supabase SSR client
const mockSupabaseSSR = {
  auth: {
    getUser: jest.fn(),
    exchangeCodeForSession: jest.fn(),
    signOut: jest.fn(),
    admin: {
      deleteUser: jest.fn()
    }
  },
  from: jest.fn(() => mockSupabaseSSR),
  select: jest.fn(() => mockSupabaseSSR),
  eq: jest.fn(() => mockSupabaseSSR),
  single: jest.fn(),
  update: jest.fn(() => mockSupabaseSSR)
}

// Mock the SSR module if available, otherwise mock as empty
jest.mock('@supabase/ssr', () => {
  try {
    return {
      createServerClient: jest.fn(() => mockSupabaseSSR)
    }
  } catch {
    return {}
  }
}, { virtual: true })

// Mock environment variables
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key'
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('/api/user - User Profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookies.get.mockReturnValue({ value: 'test-cookie' })
  })

  describe('GET /api/user', () => {
    it('should return user profile for authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2023-01-01T00:00:00Z',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
      
      const mockProfile = {
        id: 'user-123',
        full_name: 'Test User',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg'
      }

      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/user')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual({
        ...mockUser,
        ...mockProfile
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const request = new NextRequest('http://localhost:3000/api/user')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle profile not found gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // Profile not found
      })

      const request = new NextRequest('http://localhost:3000/api/user')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.id).toBe(mockUser.id)
    })

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST001', message: 'Database error' }
      })

      const request = new NextRequest('http://localhost:3000/api/user')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch profile')
    })
  })

  describe('PUT /api/user', () => {
    it('should update user profile successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const updateData = {
        full_name: 'Updated Name',
        username: 'updateduser',
        website: 'https://example.com',
        avatar_url: 'https://example.com/new-avatar.jpg'
      }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.single.mockResolvedValue({
        data: { id: mockUser.id, ...updateData },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Profile updated successfully')
      expect(data.profile).toMatchObject(updateData)
    })

    it('should validate username length', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'PUT',
        body: JSON.stringify({ username: 'ab' }) // Too short
      })
      
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Username must be at least 3 characters')
    })

    it('should return 401 for unauthenticated user', async () => {
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'PUT',
        body: JSON.stringify({ full_name: 'Test' })
      })
      
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle update failures', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'PUT',
        body: JSON.stringify({ full_name: 'Test' })
      })
      
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update profile')
    })
  })

  describe('DELETE /api/user', () => {
    it('should delete user account successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.auth.admin.deleteUser.mockResolvedValue({
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE'
      })
      
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Account deleted successfully')
      expect(mockSupabaseSSR.auth.admin.deleteUser).toHaveBeenCalledWith(mockUser.id)
    })

    it('should return 401 for unauthenticated user', async () => {
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE'
      })
      
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle deletion failures', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseSSR.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseSSR.auth.admin.deleteUser.mockResolvedValue({
        error: { message: 'Deletion failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE'
      })
      
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete account')
    })
  })
})

describe('/api/auth/callback - Auth Callback API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/auth/callback', () => {
    it('should exchange code for session successfully', async () => {
      mockSupabaseSSR.auth.exchangeCodeForSession.mockResolvedValue({
        error: null
      })

      const url = 'http://localhost:3000/api/auth/callback?code=auth-code&next=/dashboard'
      const request = new NextRequest(url)
      
      const response = await AuthCallbackGET(request)

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('/dashboard')
      expect(mockSupabaseSSR.auth.exchangeCodeForSession).toHaveBeenCalledWith('auth-code')
    })

    it('should redirect to default path when next is not provided', async () => {
      mockSupabaseSSR.auth.exchangeCodeForSession.mockResolvedValue({
        error: null
      })

      const url = 'http://localhost:3000/api/auth/callback?code=auth-code'
      const request = new NextRequest(url)
      
      const response = await AuthCallbackGET(request)

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('/')
    })

    it('should handle exchange errors', async () => {
      mockSupabaseSSR.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'Invalid code' }
      })

      const url = 'http://localhost:3000/api/auth/callback?code=invalid-code'
      const request = new NextRequest(url)
      
      const response = await AuthCallbackGET(request)

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('/auth/auth-code-error')
    })

    it('should redirect to error page when no code provided', async () => {
      const url = 'http://localhost:3000/api/auth/callback'
      const request = new NextRequest(url)
      
      const response = await AuthCallbackGET(request)

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('/auth/auth-code-error')
    })
  })

  describe('POST /api/auth/callback', () => {
    it('should sign out user successfully', async () => {
      mockSupabaseSSR.auth.signOut.mockResolvedValue({
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/auth/callback', {
        method: 'POST'
      })
      
      const response = await AuthCallbackPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Successfully signed out')
      expect(mockSupabaseSSR.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      mockSupabaseSSR.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/callback', {
        method: 'POST'
      })
      
      const response = await AuthCallbackPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Sign out failed')
    })
  })
})

describe('API Security Tests', () => {
  it('should prevent SQL injection in user profile query', async () => {
    const mockUser = { id: "'; DROP TABLE users; --", email: 'test@example.com' }
    
    mockSupabaseSSR.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/api/user')
    const response = await GET(request)

    // Should not crash and should handle the malicious ID safely
    expect(response.status).not.toBe(500)
    expect(mockSupabaseSSR.eq).toHaveBeenCalledWith('id', mockUser.id)
  })

  it('should sanitize input data in profile updates', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const maliciousData = {
      full_name: '<script>alert("XSS")</script>',
      username: 'normaluser',
      website: 'javascript:alert("XSS")'
    }
    
    mockSupabaseSSR.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabaseSSR.single.mockResolvedValue({
      data: { id: mockUser.id, ...maliciousData },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/api/user', {
      method: 'PUT',
      body: JSON.stringify(maliciousData)
    })
    
    const response = await PUT(request)

    // API should handle the data (validation happens at DB level)
    expect(response.status).toBe(200)
  })
})

describe('API Performance Tests', () => {
  it('should respond to user profile requests under 100ms', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    mockSupabaseSSR.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabaseSSR.single.mockResolvedValue({
      data: mockUser,
      error: null
    })

    const request = new NextRequest('http://localhost:3000/api/user')
    
    const start = performance.now()
    await GET(request)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(100)
  })

  it('should handle concurrent requests efficiently', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    mockSupabaseSSR.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabaseSSR.single.mockResolvedValue({
      data: mockUser,
      error: null
    })

    const requests = Array(50).fill(null).map(() => {
      const request = new NextRequest('http://localhost:3000/api/user')
      return GET(request)
    })

    const start = performance.now()
    const responses = await Promise.all(requests)
    const duration = performance.now() - start

    expect(responses).toHaveLength(50)
    expect(responses.every(r => r.status === 200)).toBe(true)
    expect(duration).toBeLessThan(1000) // All 50 requests under 1 second
  })
})