/**
 * Polyfills for Jest testing environment
 * Provides Node.js and browser API compatibility
 */

// Polyfill for fetch, Request, Response, Headers
import 'whatwg-fetch'

// Polyfill Node.js globals for browser environment
if (typeof global.Request === 'undefined') {
  global.Request = Request
}

if (typeof global.Response === 'undefined') {
  global.Response = Response
}

if (typeof global.Headers === 'undefined') {
  global.Headers = Headers
}

// Mock performance API if not available
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    clearMarks: () => {},
    clearMeasures: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
  } as any
}

// Mock URL constructor for Node.js compatibility
if (typeof global.URL === 'undefined') {
  global.URL = URL
}

if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = URLSearchParams
}