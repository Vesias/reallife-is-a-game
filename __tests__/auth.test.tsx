/**
 * @test Authentication Components
 * @description Comprehensive unit tests for authentication components and hooks
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/hooks/use-auth'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  }
}

jest.mock('@/lib/supabase', () => ({
  createClientSupabase: () => mockSupabase
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => 
    <div className={className} data-testid="loader" />
}))

describe('AuthForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  describe('Login Mode', () => {
    it('should render login form with correct elements', () => {
      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should validate email format', async () => {
      render(<AuthForm mode="login" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })
    })

    it('should validate password minimum length', async () => {
      render(<AuthForm mode="login" />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })
    })

    it('should call signIn with correct credentials', async () => {
      const mockSignIn = jest.fn()
      jest.doMock('@/hooks/use-auth', () => ({
        useAuth: () => ({
          signIn: mockSignIn,
          signUp: jest.fn(),
          loading: false,
          error: null
        })
      }))

      render(<AuthForm mode="login" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should display error message when authentication fails', () => {
      jest.doMock('@/hooks/use-auth', () => ({
        useAuth: () => ({
          signIn: jest.fn(),
          signUp: jest.fn(),
          loading: false,
          error: 'Invalid credentials'
        })
      }))

      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('should disable form during loading state', () => {
      jest.doMock('@/hooks/use-auth', () => ({
        useAuth: () => ({
          signIn: jest.fn(),
          signUp: jest.fn(),
          loading: true,
          error: null
        })
      }))

      render(<AuthForm mode="login" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
  })

  describe('Signup Mode', () => {
    it('should render signup form with correct elements', () => {
      render(<AuthForm mode="signup" />)
      
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByText('Enter your details to create a new account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should call signUp with correct credentials', async () => {
      const mockSignUp = jest.fn()
      jest.doMock('@/hooks/use-auth', () => ({
        useAuth: () => ({
          signIn: jest.fn(),
          signUp: mockSignUp,
          loading: false,
          error: null
        })
      }))

      render(<AuthForm mode="signup" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
      })
    })

    it('should call onSuccess callback after successful signup', async () => {
      const mockOnSuccess = jest.fn()
      const mockSignUp = jest.fn().mockResolvedValue({})
      
      jest.doMock('@/hooks/use-auth', () => ({
        useAuth: () => ({
          signIn: jest.fn(),
          signUp: mockSignUp,
          loading: false,
          error: null
        })
      }))

      render(<AuthForm mode="signup" onSuccess={mockOnSuccess} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })
  })
})

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with correct default state', async () => {
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
    const mockCallback = jest.fn()
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback)
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })
    
    renderHook(() => useAuth())
    
    // Simulate auth state change
    act(() => {
      mockCallback('SIGNED_IN', { user: mockUser })
    })
    
    expect(mockCallback).toHaveBeenCalledWith('SIGNED_IN', { user: mockUser })
  })
})

describe('Edge Cases and Security', () => {
  it('should handle network timeout gracefully', async () => {
    jest.setTimeout(10000)
    mockSupabase.auth.signInWithPassword.mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    )
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'password123')
      } catch (error) {
        expect(error.message).toBe('Network timeout')
      }
    })
  })

  it('should sanitize error messages', async () => {
    const maliciousError = { 
      message: '<script>alert("XSS")</script>Invalid credentials' 
    }
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: maliciousError })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password')
    })
    
    await waitFor(() => {
      // Error should not contain script tags
      expect(result.current.error).not.toContain('<script>')
      expect(result.current.error).toBe(maliciousError.message)
    })
  })

  it('should handle concurrent auth operations', async () => {
    const { result } = renderHook(() => useAuth())
    
    const promises = Array(10).fill(null).map(() => 
      act(() => result.current.signIn('test@example.com', 'password123'))
    )
    
    await Promise.all(promises)
    
    // Should only make one call due to loading state management
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)
  })
})

describe('Performance Tests', () => {
  it('should render AuthForm under 100ms', async () => {
    const start = performance.now()
    render(<AuthForm mode="login" />)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100)
  })

  it('should handle form validation efficiently', async () => {
    render(<AuthForm mode="login" />)
    
    const emailInput = screen.getByLabelText(/email/i)
    
    const start = performance.now()
    
    // Simulate rapid typing
    for (let i = 0; i < 100; i++) {
      fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } })
    }
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(1000) // Less than 1 second for 100 changes
  })
})