# Testing Infrastructure - LifeQuest

## Overview

This document describes the comprehensive testing infrastructure implemented for the LifeQuest application, including unit tests, integration tests, and end-to-end tests.

## Testing Stack

### Core Testing Tools
- **Jest**: Unit and integration test runner
- **React Testing Library**: React component testing
- **Playwright**: End-to-end browser testing
- **MSW**: API mocking for testing
- **@testing-library/jest-dom**: Custom Jest matchers

### Coverage and Quality
- **Minimum Coverage Thresholds**: 80% statements, 80% functions, 75% branches, 80% lines
- **Performance Testing**: Response time validation
- **Security Testing**: Input sanitization and XSS prevention
- **Accessibility Testing**: Screen reader and keyboard navigation support

## Test Organization

```
tests/
├── setup.ts                 # Global test configuration
├── polyfills.ts             # Browser API polyfills
├── utils/                   # Utility function tests
├── hooks/                   # Custom React hooks tests
├── components/              # UI component tests
├── api/                     # API route integration tests
└── e2e/                     # End-to-end tests
```

## Test Categories

### 1. Unit Tests
Tests individual functions, utilities, and isolated components.

**Location**: `tests/utils/`, `tests/hooks/`, `tests/components/`
**Run with**: `npm run test:unit`

Examples:
- XP calculation functions
- Quest formatting utilities  
- React hooks (useAuth, useGamification)
- UI components (XPBar, QuestCard)

### 2. Integration Tests
Tests API routes, database interactions, and component integration.

**Location**: `tests/api/`, `tests/hooks/`
**Run with**: `npm run test:integration`

Examples:
- User profile API endpoints
- Authentication flows
- Supabase database operations
- Hook integration with external services

### 3. End-to-End Tests
Tests complete user workflows in real browsers.

**Location**: `tests/e2e/`
**Run with**: `npm run test:e2e`

Examples:
- User registration and login
- Quest creation and completion
- Dashboard navigation
- Crew management

## Running Tests

### Local Development

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test categories
npm run test:unit
npm run test:integration  
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with browser UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

### CI/CD Pipeline

```bash
# Full CI test suite
npm run test:ci
```

This runs:
1. ESLint code quality checks
2. TypeScript type checking  
3. Jest unit/integration tests with coverage
4. Playwright E2E tests across multiple browsers

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  setupFiles: ['<rootDir>/tests/polyfills.ts'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80, 
      lines: 80,
      statements: 80
    }
  }
}
```

### Playwright Configuration (`playwright.config.ts`)

```javascript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' }, 
    { name: 'webkit' }
  ]
})
```

## Test Patterns and Best Practices

### Unit Test Pattern

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should describe expected behavior', () => {
    // Arrange
    const input = 'test input'
    
    // Act  
    const result = functionUnderTest(input)
    
    // Assert
    expect(result).toBe('expected output')
  })

  it('should handle edge cases', () => {
    expect(functionUnderTest(null)).toBe(defaultValue)
    expect(functionUnderTest('')).toBe(defaultValue)
  })
})
```

### Component Test Pattern

```typescript
describe('ComponentName', () => {
  it('should render with required props', () => {
    render(<ComponentName prop="value" />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeEnabled()
  })

  it('should handle user interactions', async () => {
    const mockFn = jest.fn()
    render(<ComponentName onAction={mockFn} />)
    
    await user.click(screen.getByRole('button'))
    
    expect(mockFn).toHaveBeenCalledWith('expected-value')
  })
})
```

### E2E Test Pattern

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication or navigation
    await page.goto('/feature')
  })

  test('should complete user workflow', async ({ page }) => {
    // Navigate and interact
    await page.fill('[data-testid="input"]', 'test value')
    await page.click('[data-testid="submit"]')
    
    // Verify outcome
    await expect(page.getByText('Success')).toBeVisible()
    await expect(page).toHaveURL('/success-page')
  })
})
```

## Mocking Strategy

### Global Mocks (tests/setup.ts)
- Supabase client and authentication
- Next.js router and navigation
- External UI libraries (Lucide React, Recharts)
- Browser APIs (localStorage, fetch, ResizeObserver)

### Test-Specific Mocks
- API responses for integration tests
- User authentication state
- Database query results

Example:
```typescript
// Mock API response
mockSupabase.from.mockReturnValue(mockSupabase)
mockSupabase.select.mockReturnValue(mockSupabase)
mockSupabase.single.mockResolvedValue({
  data: { id: '123', name: 'Test' },
  error: null
})
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- **HTML Report**: Open `coverage/lcov-report/index.html` in browser
- **LCOV Format**: `coverage/lcov.info` for CI integration
- **JSON Format**: `coverage/coverage-final.json` for programmatic access

### Coverage Thresholds
- **Statements**: 80% minimum
- **Branches**: 75% minimum  
- **Functions**: 80% minimum
- **Lines**: 80% minimum

Tests will fail if coverage falls below these thresholds.

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            coverage/
            playwright-report/
```

## Performance Testing

### Response Time Validation
```typescript
it('should respond within 100ms', async () => {
  const start = performance.now()
  await apiCall()
  const duration = performance.now() - start
  
  expect(duration).toBeLessThan(100)
})
```

### Load Testing
```typescript
it('should handle concurrent requests', async () => {
  const requests = Array(50).fill(null).map(() => apiCall())
  const responses = await Promise.all(requests)
  
  expect(responses.every(r => r.success)).toBe(true)
})
```

## Security Testing

### Input Sanitization
```typescript
it('should prevent XSS attacks', () => {
  const maliciousInput = '<script>alert("XSS")</script>'
  const sanitized = sanitizeInput(maliciousInput)
  
  expect(sanitized).not.toContain('<script>')
})
```

### SQL Injection Prevention  
```typescript
it('should handle malicious SQL in user ID', async () => {
  const maliciousId = "'; DROP TABLE users; --"
  const response = await getUserProfile(maliciousId)
  
  expect(response.status).not.toBe(500)
})
```

## Accessibility Testing

### Keyboard Navigation
```typescript
it('should support keyboard navigation', async ({ page }) => {
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button')).toBeFocused()
})
```

### Screen Reader Support
```typescript
it('should have proper ARIA labels', () => {
  render(<Component />)
  
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label')
})
```

## Debugging Tests

### Debug Single Test
```bash
npm run test:debug -- --testNamePattern="test name"
```

### Debug E2E Tests  
```bash
npm run test:e2e:headed -- --debug
```

### View Test Reports
```bash
# Jest coverage report
open coverage/lcov-report/index.html

# Playwright test report  
npx playwright show-report
```

## Test Data Management

### Factories and Builders
```typescript
const buildUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  ...overrides
})

const buildQuest = (overrides = {}) => ({
  id: 'quest-123', 
  title: 'Test Quest',
  status: 'active',
  ...overrides
})
```

### Cleanup
```typescript
afterEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})
```

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase Jest timeout or mock slow operations
2. **Mock not working**: Check mock order and placement
3. **Component not rendering**: Verify all required providers are wrapped
4. **E2E test flaky**: Add proper waits and increase timeouts

### Environment Variables
```bash
# Required for tests
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
```

## Metrics and Reporting

### Current Test Coverage
- **Total Test Files**: 12+ test files
- **Test Cases**: 100+ individual test cases
- **Coverage**: >80% across all metrics
- **E2E Tests**: Critical user journeys covered

### Test Execution Times
- **Unit Tests**: ~10 seconds
- **Integration Tests**: ~20 seconds  
- **E2E Tests**: ~2 minutes
- **Full Test Suite**: ~3 minutes

## Future Improvements

1. **Visual Regression Testing**: Add screenshot comparison tests
2. **Load Testing**: Implement stress testing with Artillery
3. **Mobile Testing**: Add device-specific E2E tests
4. **A11y Testing**: Integrate axe-core for automated accessibility testing
5. **Mutation Testing**: Add Stryker for test quality validation

---

For questions about testing, see the [Contributing Guide](CONTRIBUTING.md) or create an issue.