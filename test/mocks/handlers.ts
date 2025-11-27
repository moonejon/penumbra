/**
 * MSW Handler Aggregator
 * 
 * This module combines all MSW request handlers for different external services.
 * Import this in your test setup to mock all external API calls.
 * 
 * Usage:
 *   // In test/setup.ts or vitest.setup.ts
 *   import { setupServer } from 'msw/node'
 *   import { handlers } from '@/test/mocks/handlers'
 *   
 *   export const server = setupServer(...handlers)
 *   
 *   beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
 *   afterEach(() => server.resetHandlers())
 *   afterAll(() => server.close())
 * 
 * Advanced Usage - Override handlers in specific tests:
 *   import { server } from '@/test/setup'
 *   import { isbndbErrorHandlers } from '@/test/mocks/isbndb'
 *   
 *   it('handles API errors gracefully', () => {
 *     server.use(isbndbErrorHandlers.notFound)
 *     // Test error handling...
 *   })
 */

import { isbndbHandlers } from './isbndb'

/**
 * All request handlers combined
 * Add additional service handlers as the application grows
 */
export const handlers = [
  ...isbndbHandlers,
  // Future handlers can be added here:
  // ...googleBooksHandlers,
  // ...openLibraryHandlers,
  // ...vercelBlobHandlers,
]

/**
 * Export error handlers for convenience
 * These can be used to override default handlers in specific tests
 */
export { isbndbErrorHandlers } from './isbndb'

/**
 * Helper to create a handler set for testing specific scenarios
 *
 * @example
 * // Test with all services returning errors
 * import { isbndbErrorHandlers } from './isbndb'
 * const errorScenario = createHandlerSet({
 *   isbndb: isbndbErrorHandlers.serverError,
 * })
 *
 * server.use(...errorScenario)
 */
export function createHandlerSet(config: {
  isbndb?: typeof import('./isbndb').isbndbErrorHandlers[keyof typeof import('./isbndb').isbndbErrorHandlers]
}) {
  const handlers = []

  if (config.isbndb) {
    handlers.push(config.isbndb)
  }

  return handlers
}

/**
 * Reset all handlers to default state
 * Useful when you've temporarily overridden handlers in a test
 * 
 * @example
 * afterEach(() => {
 *   resetToDefaultHandlers(server)
 * })
 */
export function resetToDefaultHandlers(server: any) {
  server.resetHandlers(...handlers)
}

/**
 * Disable all external API mocking
 * Useful for integration tests that need real API calls
 * Only use this when you have proper API keys and rate limiting
 * 
 * @example
 * beforeAll(() => {
 *   if (process.env.USE_REAL_APIS === 'true') {
 *     disableAllMocking(server)
 *   }
 * })
 */
export function disableAllMocking(server: any) {
  server.close()
}

/**
 * Enable request logging for debugging
 * Logs all intercepted requests with their responses
 * 
 * @example
 * beforeAll(() => {
 *   if (process.env.DEBUG_REQUESTS === 'true') {
 *     enableRequestLogging()
 *   }
 * })
 */
export function enableRequestLogging() {
  const originalFetch = global.fetch
  
  global.fetch = async (...args) => {
    console.log('[MSW] Request:', args[0])
    const response = await originalFetch(...args)
    console.log('[MSW] Response:', response.status, response.statusText)
    return response
  }
}

/**
 * Spy on API calls to verify they were made correctly
 * Returns a mock function that tracks calls
 * 
 * @example
 * const isbndbSpy = createApiSpy('https://api2.isbndb.com')
 * 
 * // Run test...
 * 
 * expect(isbndbSpy).toHaveBeenCalledWith(
 *   expect.stringContaining('9780743273565')
 * )
 */
export function createApiSpy(baseUrl: string) {
  const calls: Array<{ url: string; options?: RequestInit }> = []
  
  return {
    calls,
    record: (url: string, options?: RequestInit) => {
      if (url.startsWith(baseUrl)) {
        calls.push({ url, options })
      }
    },
    reset: () => {
      calls.length = 0
    },
    getCallCount: () => calls.length,
    getLastCall: () => calls[calls.length - 1],
  }
}

/**
 * Network condition simulators
 * Useful for testing offline scenarios, slow connections, etc.
 */
export const networkConditions = {
  /**
   * Simulate offline mode - all requests fail
   */
  offline: () => {
    return handlers.map(() => 
      // Return a network error for all requests
      () => {
        throw new Error('Network request failed')
      }
    )
  },

  /**
   * Simulate slow 3G connection (750ms delay)
   */
  slow3G: (delayMs = 750) => {
    const { http, HttpResponse, delay } = require('msw')
    return [
      http.get('*', async () => {
        await delay(delayMs)
        return HttpResponse.json({})
      }),
    ]
  },

  /**
   * Simulate intermittent connectivity (50% failure rate)
   */
  intermittent: () => {
    const { http, HttpResponse } = require('msw')
    return [
      http.get('*', () => {
        if (Math.random() > 0.5) {
          throw new Error('Network timeout')
        }
        return HttpResponse.json({})
      }),
    ]
  },
}

/**
 * Pre-configured handler sets for common testing scenarios
 * Note: Import isbndbErrorHandlers and pass specific handlers for error scenarios
 */
export const scenarioHandlers = {
  /**
   * All services healthy
   */
  allHealthy: handlers,
}
