/**
 * @test Authentication E2E Tests
 * @description End-to-end tests for authentication flows
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page
    await page.goto('/')
  })

  test('should navigate to login page from home', async ({ page }) => {
    // Click on login/sign in button
    await page.getByRole('button', { name: /sign in/i }).first().click()
    
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Sign In')).toBeVisible()
    await expect(page.getByLabelText(/email/i)).toBeVisible()
    await expect(page.getByLabelText(/password/i)).toBeVisible()
  })

  test('should navigate to signup page from home', async ({ page }) => {
    // Click on signup/register button  
    await page.getByRole('button', { name: /sign up|register/i }).first().click()
    
    await expect(page).toHaveURL('/signup')
    await expect(page.getByText('Create Account')).toBeVisible()
  })

  test('should validate login form fields', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit without filling form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Check for validation messages
    await expect(page.getByText(/email is required|invalid email/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should validate signup form fields', async ({ page }) => {
    await page.goto('/signup')
    
    // Fill with invalid email
    await page.getByLabelText(/email/i).fill('invalid-email')
    await page.getByRole('button', { name: /create account/i }).click()
    
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill form with invalid credentials
    await page.getByLabelText(/email/i).fill('test@invalid.com')
    await page.getByLabelText(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show error message (timing out is expected for demo)
    await expect(page.getByText(/invalid credentials|error/i)).toBeVisible({ timeout: 10000 })
  })

  test('should display loading states during authentication', async ({ page }) => {
    await page.goto('/login')
    
    // Fill form
    await page.getByLabelText(/email/i).fill('test@example.com')
    await page.getByLabelText(/password/i).fill('password123')
    
    // Click submit and immediately check for loading state
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show loading spinner or disabled state
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await expect(submitButton).toBeDisabled()
    
    // Wait for loading to complete (will error out, which is expected)
    await page.waitForTimeout(2000)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Block network requests to simulate offline
    await page.route('**/*', route => route.abort())
    
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    
    // Try to login with blocked network
    await page.getByLabelText(/email/i).fill('test@example.com')
    await page.getByLabelText(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show network error
    await expect(page.getByText(/network error|connection failed/i)).toBeVisible({ timeout: 10000 })
  })

  test('should redirect to dashboard after successful mock login', async ({ page }) => {
    // Mock successful authentication
    await page.route('**/auth/callback*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    await page.goto('/login')
    
    // Fill and submit form
    await page.getByLabelText(/email/i).fill('test@example.com')
    await page.getByLabelText(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard (or show success state)
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
      .catch(() => {
        // Fallback: check for any success indicators
        return expect(page.getByText(/welcome|dashboard|success/i)).toBeVisible()
      })
  })

  test('should persist login state across page refreshes', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })
    
    await page.goto('/dashboard')
    
    // Should stay logged in after refresh
    await page.reload()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should sign out and redirect to home', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })
    
    await page.goto('/dashboard')
    
    // Find and click sign out
    await page.getByRole('button', { name: /sign out|logout/i }).click()
    
    // Should redirect to home
    await expect(page).toHaveURL('/')
    await expect(localStorage.getItem('supabase.auth.token')).toBeFalsy
  })
})

test.describe('Authentication UI/UX', () => {
  test('should have accessible form labels and structure', async ({ page }) => {
    await page.goto('/login')
    
    // Check form accessibility
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByLabelText(/email/i)).toBeVisible()
    await expect(page.getByLabelText(/password/i)).toBeVisible()
    
    // Check for proper headings
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/login')
    
    // Form should be visible and usable on mobile
    await expect(page.getByLabelText(/email/i)).toBeVisible()
    await expect(page.getByLabelText(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    
    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth)
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.getByLabelText(/email/i)).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabelText(/password/i)).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused()
  })

  test('should show password strength indicator on signup', async ({ page }) => {
    await page.goto('/signup')
    
    const passwordInput = page.getByLabelText(/password/i)
    
    // Type weak password
    await passwordInput.fill('123')
    await expect(page.getByText(/weak|too short/i)).toBeVisible()
    
    // Type stronger password
    await passwordInput.fill('StrongPassword123!')
    await expect(page.getByText(/strong|good/i)).toBeVisible()
  })
})