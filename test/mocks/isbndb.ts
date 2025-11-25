/**
 * ISBNdb API Mock Handlers
 * 
 * This module provides MSW (Mock Service Worker) handlers for the ISBNdb API.
 * It includes handlers for successful responses, 404s, rate limiting, and other error cases.
 * 
 * Usage:
 *   import { setupServer } from 'msw/node'
 *   import { isbndbHandlers } from '@/test/mocks/isbndb'
 *   
 *   const server = setupServer(...isbndbHandlers)
 *   
 *   beforeAll(() => server.listen())
 *   afterEach(() => server.resetHandlers())
 *   afterAll(() => server.close())
 */

import { http, HttpResponse } from 'msw'

// Realistic mock book data
export const mockBooks = {
  gatsby: {
    title: 'The Great Gatsby',
    title_long: 'The Great Gatsby: A Novel',
    isbn: '9780743273565',
    isbn13: '9780743273565',
    isbn10: '0743273567',
    authors: ['F. Scott Fitzgerald'],
    publisher: 'Scribner',
    language: 'en',
    date_published: '2004-09-30',
    edition: 'Reissue',
    pages: 180,
    dimensions: 'Height: 8.0 Inches, Length: 5.2 Inches, Weight: 0.4 Pounds, Width: 0.4 Inches',
    overview: 'The Great Gatsby, F. Scott Fitzgerald\'s third book, stands as the supreme achievement of his career. This exemplary novel of the Jazz Age has been acclaimed by generations of readers.',
    image: 'https://images.isbndb.com/covers/35/65/9780743273565.jpg',
    msrp: '15.00',
    binding: 'Paperback',
    subjects: [
      'Fiction',
      'Classics',
      'Literary',
      'American',
      'Historical'
    ],
  },
  mockery: {
    title: 'Mockery',
    title_long: 'Mockery: A Novel',
    isbn: '9781234567890',
    isbn13: '9781234567890',
    isbn10: '1234567890',
    authors: ['Test Author', 'Co-Author Name'],
    publisher: 'Test Publishing House',
    language: 'en',
    date_published: '2023-01-15',
    edition: '1st Edition',
    pages: 350,
    dimensions: 'Height: 9.0 Inches, Length: 6.0 Inches, Weight: 1.2 Pounds, Width: 1.0 Inches',
    overview: 'A comprehensive guide to mocking in modern software testing. This book covers unit tests, integration tests, and best practices.',
    image: 'https://images.isbndb.com/covers/78/90/9781234567890.jpg',
    msrp: '29.99',
    binding: 'Hardcover',
    subjects: [
      'Technology',
      'Programming',
      'Testing',
      'Software Engineering'
    ],
  },
  'to-kill-a-mockingbird': {
    title: 'To Kill a Mockingbird',
    title_long: 'To Kill a Mockingbird',
    isbn: '9780061120084',
    isbn13: '9780061120084',
    isbn10: '0061120081',
    authors: ['Harper Lee'],
    publisher: 'Harper Perennial Modern Classics',
    language: 'en',
    date_published: '2006-05-23',
    edition: 'Reprint',
    pages: 336,
    dimensions: 'Height: 8.0 Inches, Length: 5.31 Inches, Weight: 0.56 Pounds, Width: 0.76 Inches',
    overview: 'Harper Lee\'s Pulitzer Prize-winning masterwork of honor and injustice in the deep South—and the heroism of one man in the face of blind and violent hatred.',
    image: 'https://images.isbndb.com/covers/00/84/9780061120084.jpg',
    msrp: '17.99',
    binding: 'Paperback',
    subjects: [
      'Fiction',
      'Classics',
      'Literary',
      'Southern',
      'Coming of Age'
    ],
  },
}

/**
 * Default ISBNdb API handlers
 * Covers standard success cases for known ISBNs
 */
export const isbndbHandlers = [
  // Success: Get book by ISBN
  http.get('https://api2.isbndb.com/book/:isbn', ({ params }) => {
    const { isbn } = params
    
    // Return specific mock data for known ISBNs
    if (isbn === '9780743273565') {
      return HttpResponse.json({ book: mockBooks.gatsby })
    }
    
    if (isbn === '9781234567890') {
      return HttpResponse.json({ book: mockBooks.mockery })
    }
    
    if (isbn === '9780061120084') {
      return HttpResponse.json({ book: mockBooks['to-kill-a-mockingbird'] })
    }
    
    // Generic response for other ISBNs
    return HttpResponse.json({
      book: {
        title: 'Generic Book Title',
        title_long: 'Generic Book: A Test Novel',
        isbn: isbn.toString(),
        isbn13: isbn.toString(),
        authors: ['Generic Author'],
        publisher: 'Generic Publisher',
        language: 'en',
        date_published: '2023-01-01',
        pages: 200,
        overview: 'This is a generic book for testing purposes.',
        subjects: ['Fiction'],
      }
    })
  }),

  // Search books by title
  http.get('https://api2.isbndb.com/books/:title', ({ params }) => {
    const { title } = params
    const searchTerm = title.toString().toLowerCase()
    
    const results = Object.values(mockBooks).filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.title_long.toLowerCase().includes(searchTerm)
    )
    
    if (results.length > 0) {
      return HttpResponse.json({
        total: results.length,
        books: results
      })
    }
    
    return HttpResponse.json({
      total: 0,
      books: []
    })
  }),

  // Search books by author
  http.get('https://api2.isbndb.com/author/:author', ({ params }) => {
    const { author } = params
    const searchTerm = author.toString().toLowerCase()
    
    const results = Object.values(mockBooks).filter(book =>
      book.authors.some(a => a.toLowerCase().includes(searchTerm))
    )
    
    if (results.length > 0) {
      return HttpResponse.json({
        total: results.length,
        books: results
      })
    }
    
    return HttpResponse.json({
      total: 0,
      books: []
    })
  }),
]

/**
 * Error handlers for testing error cases
 * Import these alongside or instead of default handlers when testing error scenarios
 */
export const isbndbErrorHandlers = {
  // 404 Not Found - Book doesn't exist
  notFound: http.get('https://api2.isbndb.com/book/:isbn', () => {
    return HttpResponse.json(
      {
        errorMessage: 'Book not found'
      },
      { status: 404 }
    )
  }),

  // 401 Unauthorized - Invalid API key
  unauthorized: http.get('https://api2.isbndb.com/book/:isbn', () => {
    return HttpResponse.json(
      {
        errorMessage: 'Invalid API key'
      },
      { status: 401 }
    )
  }),

  // 429 Rate Limit Exceeded
  rateLimitExceeded: http.get('https://api2.isbndb.com/book/:isbn', () => {
    return HttpResponse.json(
      {
        errorMessage: 'Rate limit exceeded. Please try again later.'
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 3600000), // 1 hour from now
        }
      }
    )
  }),

  // 500 Internal Server Error
  serverError: http.get('https://api2.isbndb.com/book/:isbn', () => {
    return HttpResponse.json(
      {
        errorMessage: 'Internal server error'
      },
      { status: 500 }
    )
  }),

  // Network timeout
  timeout: http.get('https://api2.isbndb.com/book/:isbn', async () => {
    await new Promise(resolve => setTimeout(resolve, 60000)) // Simulate timeout
    return HttpResponse.json({ book: mockBooks.gatsby })
  }),

  // Malformed response
  malformedResponse: http.get('https://api2.isbndb.com/book/:isbn', () => {
    return HttpResponse.json({
      // Missing required 'book' field
      error: 'This response is malformed'
    })
  }),

  // Empty response
  emptyResponse: http.get('https://api2.isbndb.com/book/:isbn', () => {
    return HttpResponse.json({
      book: null
    })
  }),
}

/**
 * Helper function to create a custom book mock
 * Useful for creating specific test scenarios
 * 
 * @example
 * const customBook = createMockBook({
 *   isbn13: '9999999999999',
 *   title: 'Custom Test Book',
 *   authors: ['Test Author']
 * })
 * 
 * server.use(
 *   http.get('https://api2.isbndb.com/book/9999999999999', () => {
 *     return HttpResponse.json({ book: customBook })
 *   })
 * )
 */
export function createMockBook(overrides: Partial<typeof mockBooks.gatsby>) {
  return {
    title: 'Default Mock Book',
    title_long: 'Default Mock Book: A Test Novel',
    isbn: '9780000000000',
    isbn13: '9780000000000',
    isbn10: '0000000000',
    authors: ['Mock Author'],
    publisher: 'Mock Publisher',
    language: 'en',
    date_published: '2023-01-01',
    edition: '1st Edition',
    pages: 200,
    dimensions: 'Height: 8.0 Inches, Length: 5.0 Inches, Weight: 0.5 Pounds, Width: 0.5 Inches',
    overview: 'A mock book for testing purposes.',
    image: 'https://images.isbndb.com/covers/00/00/9780000000000.jpg',
    msrp: '19.99',
    binding: 'Paperback',
    subjects: ['Fiction'],
    ...overrides,
  }
}

/**
 * Helper to simulate slow API responses
 * Useful for testing loading states
 * 
 * @example
 * server.use(
 *   createSlowResponseHandler('9780743273565', 2000) // 2 second delay
 * )
 */
export function createSlowResponseHandler(isbn: string, delayMs: number) {
  return http.get(`https://api2.isbndb.com/book/${isbn}`, async () => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return HttpResponse.json({ book: mockBooks.gatsby })
  })
}

/**
 * Helper to create a handler that fails N times before succeeding
 * Useful for testing retry logic
 * 
 * @example
 * let attempt = 0
 * server.use(
 *   createFlakeyHandler('9780743273565', 2) // Fails twice, then succeeds
 * )
 */
export function createFlakeyHandler(isbn: string, failCount: number) {
  let attempts = 0
  
  return http.get(`https://api2.isbndb.com/book/${isbn}`, () => {
    attempts++
    
    if (attempts <= failCount) {
      return HttpResponse.json(
        { errorMessage: 'Temporary failure' },
        { status: 503 }
      )
    }
    
    return HttpResponse.json({ book: mockBooks.gatsby })
  })
}
