/**
 * @test End-to-End Authentication Tests
 * @description Complete user authentication flow testing with Cypress
 */

describe('Authentication End-to-End Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    newPassword: 'NewPassword123!'
  }

  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Visit the home page
    cy.visit('/')
    
    // Wait for the app to load
    cy.get('[data-testid="app-loading"]').should('not.exist')
  })

  describe('User Registration Flow', () => {
    it('should complete full user registration process', () => {
      // Navigate to signup page
      cy.get('[data-testid="signup-link"]').click()
      cy.url().should('include', '/signup')

      // Fill registration form
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      
      // Submit registration form
      cy.get('[data-testid="signup-button"]').click()

      // Should show success message or redirect to dashboard
      cy.url().should('include', '/dashboard', { timeout: 10000 })
      cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome!')
    })

    it('should validate email format during registration', () => {
      cy.visit('/signup')
      
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="signup-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email address')
    })

    it('should validate password strength during registration', () => {
      cy.visit('/signup')
      
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type('123')
      cy.get('[data-testid="signup-button"]').click()
      
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 6 characters')
    })

    it('should handle registration errors gracefully', () => {
      // Intercept signup API call to simulate error
      cy.intercept('POST', '**/auth/v1/signup', {
        statusCode: 400,
        body: { error: { message: 'Email already registered' } }
      }).as('signupError')

      cy.visit('/signup')
      
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="signup-button"]').click()
      
      cy.wait('@signupError')
      cy.get('[data-testid="auth-error"]').should('contain', 'Email already registered')
    })

    it('should prevent duplicate registrations', () => {
      // First registration
      cy.visit('/signup')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="signup-button"]').click()
      
      // Sign out
      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="signout-button"]').click()
      
      // Attempt second registration with same email
      cy.visit('/signup')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="signup-button"]').click()
      
      cy.get('[data-testid="auth-error"]').should('exist')
    })
  })

  describe('User Login Flow', () => {
    beforeEach(() => {
      // Ensure test user exists by registering first
      cy.request({
        method: 'POST',
        url: `${Cypress.env('SUPABASE_URL')}/auth/v1/signup`,
        headers: {
          apikey: Cypress.env('SUPABASE_ANON_KEY'),
          'Content-Type': 'application/json'
        },
        body: {
          email: testUser.email,
          password: testUser.password
        },
        failOnStatusCode: false
      })
    })

    it('should login with valid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard', { timeout: 10000 })
      cy.get('[data-testid="user-menu"]').should('exist')
    })

    it('should reject invalid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="auth-error"]').should('contain', 'Invalid')
    })

    it('should show loading state during authentication', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      
      // Intercept auth request to delay response
      cy.intercept('POST', '**/auth/v1/token*', (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res), 2000)
          })
        })
      }).as('slowAuth')
      
      cy.get('[data-testid="login-button"]').click()
      
      // Should show loading spinner
      cy.get('[data-testid="login-loading"]').should('be.visible')
      cy.get('[data-testid="email-input"]').should('be.disabled')
      cy.get('[data-testid="password-input"]').should('be.disabled')
      cy.get('[data-testid="login-button"]').should('be.disabled')
      
      cy.wait('@slowAuth')
    })

    it('should remember user session after page reload', () => {
      // Login first
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard')
      
      // Reload the page
      cy.reload()
      
      // Should still be logged in
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-menu"]').should('exist')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard')
      
      cy.url().should('include', '/login')
      cy.get('[data-testid="auth-redirect-message"]').should('exist')
    })

    it('should allow authenticated users to access protected pages', () => {
      // Login first
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Navigate to protected route
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('exist')
    })

    it('should maintain redirect path after login', () => {
      // Try to access protected page while unauthenticated
      cy.visit('/dashboard/settings')
      cy.url().should('include', '/login')
      
      // Login
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Should redirect to originally requested page
      cy.url().should('include', '/dashboard/settings')
    })
  })

  describe('User Logout Flow', () => {
    beforeEach(() => {
      // Login before each logout test
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/dashboard')
    })

    it('should logout user and clear session', () => {
      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="signout-button"]').click()
      
      cy.url().should('include', '/login')
      
      // Verify session is cleared by trying to access protected page
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should handle logout errors gracefully', () => {
      // Intercept logout API to simulate error
      cy.intercept('POST', '**/auth/callback', {
        statusCode: 500,
        body: { error: 'Logout failed' }
      }).as('logoutError')
      
      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="signout-button"]').click()
      
      cy.wait('@logoutError')
      
      // Should show error message but still attempt logout
      cy.get('[data-testid="logout-error"]').should('exist')
    })
  })

  describe('Session Management', () => {
    it('should handle expired sessions', () => {
      // Login first
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Simulate expired session by clearing auth cookies
      cy.clearCookies()
      
      // Try to access protected page
      cy.visit('/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/login')
      cy.get('[data-testid="session-expired-message"]').should('exist')
    })

    it('should refresh tokens automatically', () => {
      // This test would require intercepting token refresh calls
      // and verifying the app handles them properly
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Wait for a period that would trigger token refresh
      cy.wait(60000) // 1 minute
      
      // Verify user is still authenticated
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('should work in different viewports', () => {
      // Test mobile viewport
      cy.viewport('iphone-x')
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="login-button"]').should('be.visible')
      
      // Test tablet viewport
      cy.viewport('ipad-2')
      cy.get('[data-testid="login-form"]').should('be.visible')
      
      // Test desktop viewport
      cy.viewport(1200, 800)
      cy.get('[data-testid="login-form"]').should('be.visible')
    })

    it('should handle keyboard navigation', () => {
      cy.visit('/login')
      
      // Tab through form fields
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'email-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'password-input')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'data-testid', 'login-button')
      
      // Submit form with Enter key
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="password-input"]').type('{enter}')
      
      cy.url().should('include', '/dashboard', { timeout: 10000 })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]')
        .should('have.attr', 'aria-label')
        .should('have.attr', 'aria-required', 'true')
      
      cy.get('[data-testid="password-input"]')
        .should('have.attr', 'aria-label')
        .should('have.attr', 'aria-required', 'true')
      
      cy.get('[data-testid="login-button"]')
        .should('have.attr', 'aria-label')
    })

    it('should announce errors to screen readers', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('123')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="email-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('have.attr', 'role', 'alert')
      
      cy.get('[data-testid="password-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('have.attr', 'role', 'alert')
    })
  })

  describe('Performance', () => {
    it('should load login page quickly', () => {
      cy.visit('/login', {
        onBeforeLoad: (win) => {
          win.performance.mark('start')
        },
        onLoad: (win) => {
          win.performance.mark('end')
          win.performance.measure('pageLoad', 'start', 'end')
        }
      })
      
      cy.window().then((win) => {
        const measure = win.performance.getEntriesByName('pageLoad')[0]
        expect(measure.duration).to.be.lessThan(3000) // Less than 3 seconds
      })
    })

    it('should authenticate within reasonable time', () => {
      cy.visit('/login')
      
      const start = Date.now()
      
      cy.get('[data-testid="email-input"]').type(testUser.email)
      cy.get('[data-testid="password-input"]').type(testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard').then(() => {
        const duration = Date.now() - start
        expect(duration).to.be.lessThan(5000) // Less than 5 seconds
      })
    })
  })
})

describe('Error Recovery', () => {
  it('should recover from network failures', () => {
    cy.visit('/login')
    
    // Simulate network failure
    cy.intercept('POST', '**/auth/v1/token*', { forceNetworkError: true }).as('networkError')
    
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="login-button"]').click()
    
    cy.wait('@networkError')
    cy.get('[data-testid="network-error"]').should('exist')
    
    // Restore network and retry
    cy.intercept('POST', '**/auth/v1/token*').as('authRequest')
    cy.get('[data-testid="retry-button"]').click()
    
    cy.wait('@authRequest')
    cy.url().should('include', '/dashboard')
  })
})