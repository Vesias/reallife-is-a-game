import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/hooks/use-auth'

// Mock the useAuth hook
jest.mock('@/hooks/use-auth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>,
}))

describe('AuthForm', () => {
  const mockSignIn = jest.fn()
  const mockSignUp = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn(),
    })
    jest.clearAllMocks()
  })

  describe('Login mode', () => {
    it('renders login form correctly', () => {
      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('calls signIn when form is submitted', async () => {
      render(<AuthForm mode="login" />)
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })
  })

  describe('Signup mode', () => {
    it('renders signup form correctly', () => {
      render(<AuthForm mode="signup" />)
      
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByText('Enter your details to create a new account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('calls signUp when form is submitted', async () => {
      render(<AuthForm mode="signup" />)
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })
  })

  describe('Form validation', () => {
    it('shows validation errors for invalid email', async () => {
      render(<AuthForm mode="login" />)
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid-email' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })
    })

    it('shows validation errors for short password', async () => {
      render(<AuthForm mode="login" />)
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })
    })
  })

  describe('Loading and error states', () => {
    it('shows loading state when loading is true', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        error: null,
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: jest.fn(),
      })

      render(<AuthForm mode="login" />)
      
      expect(screen.getByTestId('loader')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })

    it('shows error message when error exists', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: 'Invalid credentials',
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: jest.fn(),
      })

      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('calls onSuccess when provided', async () => {
    const mockOnSuccess = jest.fn()
    render(<AuthForm mode="login" onSuccess={mockOnSuccess} />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})