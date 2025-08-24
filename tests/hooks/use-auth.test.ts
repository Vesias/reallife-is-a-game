/**
 * @test useAuth Hook
 * @description Unit tests for authentication hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'

// Use global mock
const mockSupabase = global.mockSupabase

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('should initialize with default state', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should set user when authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle authentication error', async () => {
    const mockError = { message: 'Authentication failed' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: mockError })
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.error).toBe('Authentication failed')
      expect(result.current.loading).toBe(false)
    })
  })

  it('should sign in user successfully', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid credentials' }
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: mockError })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'wrongpassword')
    })
    
    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials')
    })
  })

  it('should sign up user successfully', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ error: null })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signUp('newuser@example.com', 'password123')
    })
    
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123'
    })
  })

  it('should sign out user successfully', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signOut()
    })
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('should handle auth state changes', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    let authCallback: any

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })
    
    renderHook(() => useAuth())
    
    // Simulate auth state change
    await act(async () => {
      authCallback('SIGNED_IN', { user: mockUser })
    })
    
    expect(authCallback).toHaveBeenCalledWith('SIGNED_IN', { user: mockUser })
  })

  it('should prevent concurrent sign in attempts', async () => {
    mockSupabase.auth.signInWithPassword.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    const { result } = renderHook(() => useAuth())
    
    // Start multiple sign in attempts
    const promises = [
      result.current.signIn('test@example.com', 'password123'),
      result.current.signIn('test@example.com', 'password123'),
      result.current.signIn('test@example.com', 'password123')
    ]
    
    await Promise.all(promises)
    
    // Should only call once due to loading state protection
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)
  })

  it('should clear error on successful operations', async () => {
    // First cause an error
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ 
      error: { message: 'Invalid credentials' } 
    })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong')
    })
    
    expect(result.current.error).toBe('Invalid credentials')
    
    // Then succeed
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null })
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'correct')
    })
    
    expect(result.current.error).toBeNull()
  })
})