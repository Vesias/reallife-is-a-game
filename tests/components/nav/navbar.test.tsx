import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from '@/components/nav/navbar'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

// Mock the dependencies
jest.mock('@/hooks/use-auth')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="logout-icon">Logout</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()

describe('Navbar', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any)
    jest.clearAllMocks()
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })
    })

    it('renders sign in and sign up buttons', () => {
      render(<Navbar />)
      
      expect(screen.getByText('MyApp')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('does not render dashboard link or user menu', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument()
    })
  })

  describe('when user is authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      email_confirmed_at: '2023-01-01T00:00:01Z',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
    }

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })
    })

    it('renders dashboard link and user avatar', () => {
      render(<Navbar />)
      
      expect(screen.getByText('MyApp')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('TE')).toBeInTheDocument() // User initials
    })

    it('does not render sign in/up buttons', () => {
      render(<Navbar />)
      
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
    })

    it('shows user email in dropdown menu', () => {
      render(<Navbar />)
      
      // Click on avatar to open dropdown
      const avatar = screen.getByText('TE')
      fireEvent.click(avatar)
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Log out')).toBeInTheDocument()
    })

    it('calls signOut and redirects when logout is clicked', () => {
      const mockSignOut = jest.fn()
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: mockSignOut,
      })

      render(<Navbar />)
      
      // Click on avatar to open dropdown
      const avatar = screen.getByText('TE')
      fireEvent.click(avatar)
      
      // Click logout
      const logoutButton = screen.getByText('Log out')
      fireEvent.click(logoutButton)
      
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('when loading', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })
    })

    it('shows loading placeholder', () => {
      render(<Navbar />)
      
      const loadingElement = screen.getByTestId('loading-placeholder') || 
                           document.querySelector('.animate-pulse')
      
      expect(loadingElement).toBeInTheDocument()
    })
  })
})