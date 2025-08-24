/**
 * @test User API Route  
 * @description Integration tests for user profile API endpoints
 */

import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/user/route'

// Mock the createServerClient function
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => global.mockSupabase)
}))

// Mock cookies function
const mockCookies = {
  getAll: jest.fn(() => []),
  get: jest.fn(() => ({ value: 'test-cookie' })),
  set: jest.fn(),
  delete: jest.fn(),
}

jest.mock('next/headers', () => ({
  cookies: () => mockCookies
}))

describe('/api/user route', () => {
  const mockSupabase = global.mockSupabase
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/user', () => {
    it('should return user profile for authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const mockProfile = {
        id: 'user-123',
        full_name: 'Test User',
        username: 'testuser',
        avatar_url: null
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      // Mock the request properly
      const url = 'http://localhost:3000/api/user'
      const request = new Request(url, { method: 'GET' }) as NextRequest
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.id).toBe(mockUser.id)
      expect(data.user.full_name).toBe(mockProfile.full_name)
    })

    it('should return 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const url = 'http://localhost:3000/api/user'
      const request = new Request(url, { method: 'GET' }) as NextRequest
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle profile not found gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Profile not found' }
      })

      const url = 'http://localhost:3000/api/user'
      const request = new Request(url, { method: 'GET' }) as NextRequest
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.id).toBe(mockUser.id)
    })
  })

  describe('PUT /api/user', () => {
    it('should update user profile successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const updateData = {
        full_name: 'Updated Name',
        username: 'updateduser',
        website: 'https://example.com'
      }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.single.mockResolvedValue({
        data: { id: mockUser.id, ...updateData },
        error: null
      })

      const url = 'http://localhost:3000/api/user'
      const request = new Request(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }) as NextRequest
      
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Profile updated successfully')
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData)
    })

    it('should validate required fields', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const url = 'http://localhost:3000/api/user'  
      const request = new Request(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ab' }) // Too short
      }) as NextRequest
      
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('validation')
    })
  })

  describe('DELETE /api/user', () => {
    it('should delete user account successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.auth.admin.deleteUser.mockResolvedValue({
        data: null,
        error: null
      })

      const url = 'http://localhost:3000/api/user'
      const request = new Request(url, { method: 'DELETE' }) as NextRequest
      
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Account deleted successfully')
    })

    it('should handle deletion failures', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.auth.admin.deleteUser.mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' }
      })

      const url = 'http://localhost:3000/api/user'
      const request = new Request(url, { method: 'DELETE' }) as NextRequest
      
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete account')
    })
  })
})

describe('API Security Tests', () => {
  const mockSupabase = global.mockSupabase

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should prevent SQL injection attempts', async () => {
    const mockUser = { id: "'; DROP TABLE users; --", email: 'test@example.com' }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: null
    })

    const url = 'http://localhost:3000/api/user'
    const request = new Request(url, { method: 'GET' }) as NextRequest
    
    const response = await GET(request)

    // Should handle malicious ID safely
    expect(response.status).not.toBe(500)
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockUser.id)
  })

  it('should sanitize input data', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const maliciousData = {
      full_name: '<script>alert("XSS")</script>Test Name',
      username: 'testuser',
      website: 'javascript:alert("XSS")'
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabase.single.mockResolvedValue({
      data: { id: mockUser.id, ...maliciousData },
      error: null
    })

    const url = 'http://localhost:3000/api/user'
    const request = new Request(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousData)
    }) as NextRequest
    
    const response = await PUT(request)

    // API should handle malicious data appropriately
    expect(response.status).toBeLessThan(500)
  })
})

describe('API Performance Tests', () => {
  const mockSupabase = global.mockSupabase

  beforeEach(() => {
    jest.clearAllMocks()
    
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    mockSupabase.single.mockResolvedValue({
      data: mockUser,
      error: null
    })
  })

  it('should respond within reasonable time', async () => {
    const url = 'http://localhost:3000/api/user'
    const request = new Request(url, { method: 'GET' }) as NextRequest
    
    const start = performance.now()
    await GET(request)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(100) // Under 100ms
  })

  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() => {
      const url = 'http://localhost:3000/api/user'
      return new Request(url, { method: 'GET' }) as NextRequest
    })

    const start = performance.now()
    const responses = await Promise.all(requests.map(req => GET(req)))
    const duration = performance.now() - start

    expect(responses).toHaveLength(10)
    expect(responses.every(r => r.status === 200)).toBe(true)
    expect(duration).toBeLessThan(500) // 10 requests under 500ms
  })
})