/**
 * @test Dashboard E2E Tests
 * @description End-to-end tests for dashboard functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
      // Mock user data
      window.mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }
    })
    
    // Mock API responses
    await page.route('**/api/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-123',
            email: 'test@example.com',
            full_name: 'Test User',
            total_xp: 250,
            current_level: 3,
            achievements: ['first_quest']
          }
        })
      })
    })

    await page.route('**/api/quests', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quests: [
            {
              id: 'quest-1',
              title: 'Complete Daily Tasks',
              description: 'Finish all your daily tasks',
              status: 'active',
              priority: 'medium',
              xp_reward: 50,
              created_at: new Date().toISOString()
            },
            {
              id: 'quest-2', 
              title: 'Weekly Review',
              description: 'Review your weekly progress',
              status: 'completed',
              priority: 'high',
              xp_reward: 100,
              created_at: new Date().toISOString()
            }
          ]
        })
      })
    })

    await page.goto('/dashboard')
  })

  test('should display user profile information', async ({ page }) => {
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
  })

  test('should show XP and level information', async ({ page }) => {
    await expect(page.getByText('Level 3')).toBeVisible()
    await expect(page.getByText(/250.*XP/)).toBeVisible()
  })

  test('should display quests list', async ({ page }) => {
    await expect(page.getByText('Complete Daily Tasks')).toBeVisible()
    await expect(page.getByText('Weekly Review')).toBeVisible()
    
    // Check quest status indicators
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Completed')).toBeVisible()
  })

  test('should allow creating new quest', async ({ page }) => {
    // Look for create quest button
    const createButton = page.getByRole('button', { name: /create quest|new quest|\+/i }).first()
    await createButton.click()
    
    // Should navigate to quest creation or open modal
    await expect(page.getByText(/create.*quest/i)).toBeVisible()
    await expect(page.getByLabelText(/title|name/i)).toBeVisible()
  })

  test('should show achievements section', async ({ page }) => {
    await expect(page.getByText(/achievement/i)).toBeVisible()
    await expect(page.getByText('first_quest')).toBeVisible()
  })

  test('should display activity timeline', async ({ page }) => {
    // Look for activity or timeline section
    await expect(page.getByText(/activity|timeline|recent/i)).toBeVisible()
  })

  test('should show stats overview', async ({ page }) => {
    // Look for stats cards or widgets
    await expect(page.getByText(/total.*quests|completed.*quests/i)).toBeVisible()
  })

  test('should have responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Main content should be visible
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('Level 3')).toBeVisible()
    
    // Navigation should be accessible (mobile menu)
    const menuButton = page.getByRole('button', { name: /menu|navigation/i }).first()
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await expect(page.getByRole('navigation')).toBeVisible()
    }
  })

  test('should handle quest interaction', async ({ page }) => {
    // Click on a quest
    await page.getByText('Complete Daily Tasks').click()
    
    // Should show quest details or navigate to quest page
    await expect(page.getByText(/quest.*detail|finish.*all.*daily.*tasks/i)).toBeVisible()
  })

  test('should update XP when quest is completed', async ({ page }) => {
    // Mock quest completion API
    await page.route('**/api/quests/quest-1/complete', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          xp_gained: 50,
          new_total_xp: 300,
          level_up: false
        })
      })
    })
    
    // Find and complete a quest
    const questElement = page.getByText('Complete Daily Tasks').locator('..')
    const completeButton = questElement.getByRole('button', { name: /complete|finish|done/i }).first()
    
    if (await completeButton.isVisible()) {
      await completeButton.click()
      
      // Should show XP gained notification
      await expect(page.getByText(/50.*XP.*gained|\+50.*XP/i)).toBeVisible()
    }
  })

  test('should show level up animation', async ({ page }) => {
    // Mock level up scenario
    await page.route('**/api/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-123',
            total_xp: 500, // Just leveled up
            current_level: 4,
            level_up: true
          }
        })
      })
    })
    
    await page.reload()
    
    // Should show level up celebration
    await expect(page.getByText(/level up|congratulations/i)).toBeVisible()
    await expect(page.getByText('Level 4')).toBeVisible()
  })
})

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })
  })

  test('should navigate to different dashboard sections', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test navigation to quests
    await page.getByRole('link', { name: /quests/i }).click()
    await expect(page).toHaveURL('/quests')
    
    // Test navigation to crew
    await page.getByRole('link', { name: /crew|team/i }).click()
    await expect(page).toHaveURL('/crew')
  })

  test('should maintain authentication across navigation', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to different pages
    await page.goto('/quests')
    await expect(page.getByText(/quest|dashboard/i)).toBeVisible()
    
    await page.goto('/crew')
    await expect(page.getByText(/crew|team/i)).toBeVisible()
    
    // Should not be redirected to login
    await expect(page).not.toHaveURL('/login')
  })

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Don't set auth token
    await page.goto('/dashboard')
    
    // Should redirect to login or show auth required
    await expect(page).toHaveURL('/login')
      .catch(() => expect(page.getByText(/sign in|login required/i)).toBeVisible())
  })

  test('should have working logout functionality', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })
    
    await page.goto('/dashboard')
    
    // Find logout button (might be in dropdown or navigation)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).first()
    await logoutButton.click()
    
    // Should redirect to home and clear auth
    await expect(page).toHaveURL('/')
  })
})

test.describe('Dashboard Performance', () => {
  test('should load dashboard within reasonable time', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })
    
    const startTime = Date.now()
    await page.goto('/dashboard')
    
    // Wait for main content to load
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible()
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Should load under 5 seconds
  })

  test('should handle slow API responses gracefully', async ({ page }) => {
    // Mock slow API responses
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      })
    })
    
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })
    
    await page.goto('/dashboard')
    
    // Should show loading states
    await expect(page.getByText(/loading|loading\.\.\./i)).toBeVisible()
    
    // Eventually load content
    await expect(page.getByText(/dashboard/i)).toBeVisible({ timeout: 10000 })
  })
})