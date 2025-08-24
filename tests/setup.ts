/**
 * Global Test Setup Configuration
 * Configures testing environment with mocks and utilities
 */

import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: jest.fn(),
    refresh: mockRefresh,
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
  }),
  usePathname: () => '/',
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock Next.js headers and cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(() => ({ value: 'mock-cookie' })),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(() => []),
  }),
  headers: () => ({
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
  }),
}))

// Mock Supabase client completely
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
    admin: {
      deleteUser: jest.fn(),
    }
  },
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  neq: jest.fn(() => mockSupabaseClient),
  gt: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  lt: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
  like: jest.fn(() => mockSupabaseClient),
  ilike: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  in: jest.fn(() => mockSupabaseClient),
  contains: jest.fn(() => mockSupabaseClient),
  containedBy: jest.fn(() => mockSupabaseClient),
  rangeLt: jest.fn(() => mockSupabaseClient),
  rangeGt: jest.fn(() => mockSupabaseClient),
  rangeGte: jest.fn(() => mockSupabaseClient),
  rangeLte: jest.fn(() => mockSupabaseClient),
  rangeAdjacent: jest.fn(() => mockSupabaseClient),
  overlaps: jest.fn(() => mockSupabaseClient),
  textSearch: jest.fn(() => mockSupabaseClient),
  match: jest.fn(() => mockSupabaseClient),
  not: jest.fn(() => mockSupabaseClient),
  or: jest.fn(() => mockSupabaseClient),
  filter: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  csv: jest.fn(),
  geojson: jest.fn(),
  explain: jest.fn(),
  rollback: jest.fn(),
  returns: jest.fn(() => mockSupabaseClient),
}

jest.mock('@/lib/supabase', () => ({
  createClientSupabase: () => mockSupabaseClient,
  supabase: mockSupabaseClient,
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient),
  createBrowserClient: jest.fn(() => mockSupabaseClient),
}), { virtual: true })

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      return (props: any) => ({
        type: 'div',
        props: {
          className: props?.className,
          'data-testid': props?.['data-testid'] || `lucide-${prop}`,
          ...props
        }
      })
    }
  })
})

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: (props: any) => ({ type: 'div', props }),
  LineChart: (props: any) => ({ type: 'div', props: { 'data-testid': 'line-chart', ...props } }),
  Line: (props: any) => ({ type: 'div', props: { 'data-testid': 'line', ...props } }),
  XAxis: (props: any) => ({ type: 'div', props: { 'data-testid': 'x-axis', ...props } }),
  YAxis: (props: any) => ({ type: 'div', props: { 'data-testid': 'y-axis', ...props } }),
  CartesianGrid: (props: any) => ({ type: 'div', props: { 'data-testid': 'cartesian-grid', ...props } }),
  Tooltip: (props: any) => ({ type: 'div', props: { 'data-testid': 'tooltip', ...props } }),
  Legend: (props: any) => ({ type: 'div', props: { 'data-testid': 'legend', ...props } }),
  BarChart: (props: any) => ({ type: 'div', props: { 'data-testid': 'bar-chart', ...props } }),
  Bar: (props: any) => ({ type: 'div', props: { 'data-testid': 'bar', ...props } }),
  PieChart: (props: any) => ({ type: 'div', props: { 'data-testid': 'pie-chart', ...props } }),
  Pie: (props: any) => ({ type: 'div', props: { 'data-testid': 'pie', ...props } }),
  Cell: (props: any) => ({ type: 'div', props: { 'data-testid': 'cell', ...props } }),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  Trans: (props: any) => props.children,
}))

// Global test utilities and DOM APIs
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage,
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
})

// Make mock functions available globally for tests
global.mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  refresh: mockRefresh,
}

global.mockSupabase = mockSupabaseClient