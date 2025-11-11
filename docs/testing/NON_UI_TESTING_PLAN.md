# Penumbra Non-UI Testing Plan

**Version:** 1.0
**Date:** November 10, 2025
**Author:** Claude (QA Analysis)
**Project:** Penumbra - Personal Library Management System

---

## Executive Summary

This document provides a comprehensive testing plan for all non-UI elements of the Penumbra application, including server actions, API routes, database operations, scripts, and external integrations. The plan focuses on achieving >80% code coverage with emphasis on critical paths, security, and performance.

**Current State:**
- **Test Framework:** None installed
- **Test Coverage:** 0%
- **Testing Tools:** Not configured

**Target State:**
- **Test Framework:** Jest + Testing Library
- **Test Coverage:** >80% overall, 100% critical paths
- **Automation:** >70% of regression tests
- **CI/CD Integration:** GitHub Actions with automated testing

---

## Table of Contents

1. [Testing Strategy](#1-testing-strategy)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Server Actions Testing](#3-server-actions-testing)
4. [API Routes Testing](#4-api-routes-testing)
5. [Database Testing](#5-database-testing)
6. [Scripts Testing](#6-scripts-testing)
7. [External Integration Testing](#7-external-integration-testing)
8. [Performance Testing](#8-performance-testing)
9. [Security Testing](#9-security-testing)
10. [Test File Structure](#10-test-file-structure)
11. [CI/CD Integration](#11-cicd-integration)
12. [Quality Metrics](#12-quality-metrics)
13. [Implementation Roadmap](#13-implementation-roadmap)

---

## 1. Testing Strategy

### 1.1 Testing Pyramid

```
       /\
      /  \     E2E (10%)
     /____\
    /      \   Integration (30%)
   /________\
  /          \ Unit (60%)
 /____________\
```

**Distribution:**
- **Unit Tests (60%):** Individual functions, utilities, business logic
- **Integration Tests (30%):** API endpoints, database operations, server actions
- **E2E Tests (10%):** Critical user workflows (out of scope for this plan)

### 1.2 Risk-Based Testing Priorities

| Priority | Component | Risk Level | Coverage Target |
|----------|-----------|------------|-----------------|
| **P0 (Critical)** | User data isolation | High | 100% |
| **P0 (Critical)** | Authentication/Authorization | High | 100% |
| **P0 (Critical)** | Data sync scripts | High | 100% |
| **P1 (High)** | Book CRUD operations | Medium | 90% |
| **P1 (High)** | Search functionality | Medium | 90% |
| **P2 (Medium)** | ISBNdb integration | Medium | 80% |
| **P3 (Low)** | Filter operations | Low | 75% |

### 1.3 Testing Types

- **Unit Testing:** Isolated function testing with mocks
- **Integration Testing:** Component interaction testing
- **Contract Testing:** API endpoint validation
- **Database Testing:** Query validation and data integrity
- **Performance Testing:** Load, stress, and response time
- **Security Testing:** Auth, authorization, input validation

---

## 2. Test Environment Setup

### 2.1 Required Dependencies

```bash
npm install --save-dev \
  jest \
  @jest/globals \
  ts-jest \
  @types/jest \
  jest-environment-node \
  @testing-library/jest-dom \
  supertest \
  @types/supertest \
  msw \
  @faker-js/faker \
  dotenv-cli
```

### 2.2 Jest Configuration

**File:** `jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    'scripts/**/*.ts',
    '!scripts/check-users.ts', // Utility script, low priority
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/utils/actions/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)
```

### 2.3 Test Database Setup

**Option 1: Separate Test Database (Recommended)**

```env
# .env.test
DEWEY_DB_DATABASE_URL="postgresql://user:password@localhost:5432/penumbra_test"
CLERK_SECRET_KEY="test_clerk_secret"
NEXT_PUBLIC_ISBN_DB_API_KEY="test_isbn_api_key"
```

**Option 2: Docker Test Container**

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:16
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: penumbra_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data
```

### 2.4 Test Utilities

**File:** `src/__tests__/utils/setup.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})

// Mock Clerk auth
export const mockClerkUser = {
  id: 'test-clerk-id',
  userId: 'test-user-id',
  sessionId: 'test-session-id',
}

export const mockCurrentUser = (userId: number = 1) => ({
  id: userId,
  clerkId: 'test-clerk-id',
  email: 'test@example.com',
  name: 'Test User',
})
```

### 2.5 Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:db": "dotenv -e .env.test -- jest --testPathPattern=database"
  }
}
```

---

## 3. Server Actions Testing

### 3.1 Overview

**Location:** `src/utils/actions/`
**Files to Test:**
- `books.ts` (Priority: P0)
- `filters.ts` (Priority: P2)
- `isbndb/fetchMetadata.ts` (Priority: P2)

### 3.2 books.ts Testing

**File:** `src/utils/actions/__tests__/books.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| BK-001 | Import books successfully for authenticated user | P0 | Unit |
| BK-002 | Import books fails without authentication | P0 | Unit |
| BK-003 | Import books associates correct user ID | P0 | Security |
| BK-004 | Import handles duplicate ISBN errors | P1 | Error |
| BK-005 | Import returns correct count on success | P1 | Unit |
| BK-006 | Import handles database errors gracefully | P1 | Error |
| BK-007 | checkRecordExists returns true for existing book | P1 | Unit |
| BK-008 | checkRecordExists returns false for non-existent book | P1 | Unit |
| BK-009 | checkRecordExists filters by user ID | P0 | Security |
| BK-010 | fetchBooks returns only user's books | P0 | Security |
| BK-011 | fetchBooks returns empty array for user with no books | P1 | Unit |
| BK-012 | fetchBooksPaginated returns correct page | P1 | Integration |
| BK-013 | fetchBooksPaginated filters by title (case-insensitive) | P1 | Integration |
| BK-014 | fetchBooksPaginated filters by authors | P1 | Integration |
| BK-015 | fetchBooksPaginated filters by subjects | P1 | Integration |
| BK-016 | fetchBooksPaginated returns correct totalCount | P1 | Integration |
| BK-017 | fetchBooksPaginated returns correct pageCount | P1 | Integration |
| BK-018 | fetchBooksPaginated handles empty results | P1 | Edge Case |

#### Example Implementation

```typescript
// src/utils/actions/__tests__/books.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { importBooks, checkRecordExists, fetchBooks, fetchBooksPaginated } from '../books'
import { prismaMock, mockCurrentUser } from '@/__tests__/utils/setup'
import { getCurrentUser } from '@/utils/permissions'

// Mock permissions module
jest.mock('@/utils/permissions', () => ({
  getCurrentUser: jest.fn(),
  getViewableBookFilter: jest.fn(),
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}))

describe('Server Actions: books.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser())
  })

  describe('importBooks', () => {
    it('BK-001: should import books successfully for authenticated user', async () => {
      const mockBooks = [
        {
          isbn10: '1234567890',
          isbn13: '1234567890123',
          title: 'Test Book',
          titleLong: 'Test Book Long Title',
          language: 'en',
          synopsis: 'Test synopsis',
          image: 'http://example.com/image.jpg',
          imageOriginal: 'http://example.com/image-original.jpg',
          publisher: 'Test Publisher',
          edition: '1st',
          pageCount: 300,
          datePublished: '2024-01-01',
          subjects: ['Fiction'],
          authors: ['Test Author'],
          binding: 'Paperback',
        },
      ]

      prismaMock.book.createMany.mockResolvedValue({ count: 1 })

      const result = await importBooks(mockBooks)

      expect(result).toEqual({
        success: true,
        count: 1,
        message: 'Successfully imported 1 books',
      })
      expect(prismaMock.book.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockBooks[0],
            ownerId: 1,
          },
        ],
      })
    })

    it('BK-003: should associate books with correct user ID', async () => {
      const mockBooks = [
        {
          isbn10: '1234567890',
          isbn13: '1234567890123',
          title: 'Test Book',
          // ... other fields
        },
      ]

      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser(42))
      prismaMock.book.createMany.mockResolvedValue({ count: 1 })

      await importBooks(mockBooks)

      expect(prismaMock.book.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              ownerId: 42,
            }),
          ]),
        })
      )
    })

    it('BK-006: should handle database errors gracefully', async () => {
      const mockBooks = [{ /* mock book data */ }]

      prismaMock.book.createMany.mockRejectedValue(
        new Error('Database connection failed')
      )

      const result = await importBooks(mockBooks)

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
        count: 0,
      })
    })
  })

  describe('checkRecordExists', () => {
    it('BK-007: should return true for existing book', async () => {
      prismaMock.book.count.mockResolvedValue(1)

      const result = await checkRecordExists('1234567890123')

      expect(result).toBe(true)
    })

    it('BK-009: should filter by user ID for security', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser(5))
      prismaMock.book.count.mockResolvedValue(0)

      await checkRecordExists('1234567890123')

      expect(prismaMock.book.count).toHaveBeenCalledWith({
        where: {
          isbn13: '1234567890123',
          ownerId: 5,
        },
      })
    })
  })

  describe('fetchBooksPaginated', () => {
    it('BK-012: should return correct page of results', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1' /* other fields */ },
        { id: 2, title: 'Book 2' /* other fields */ },
      ]

      prismaMock.$transaction.mockResolvedValue([mockBooks, 10])

      const result = await fetchBooksPaginated({
        page: 2,
        pageSize: 2,
      })

      expect(result.books).toEqual(mockBooks)
      expect(result.totalCount).toBe(10)
      expect(result.pageCount).toBe(5)
    })

    it('BK-013: should filter by title case-insensitively', async () => {
      prismaMock.$transaction.mockResolvedValue([[], 0])

      await fetchBooksPaginated({
        title: 'TEST',
        page: 1,
        pageSize: 10,
      })

      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            where: expect.objectContaining({
              title: {
                contains: 'TEST',
                mode: 'insensitive',
              },
            }),
          }),
        ])
      )
    })
  })
})
```

**Estimated Effort:** 12-16 hours
**Tools:** Jest, jest-mock-extended, @faker-js/faker

---

### 3.3 filters.ts Testing

**File:** `src/utils/actions/__tests__/filters.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| FL-001 | Fetch filters returns all authors and subjects | P2 | Unit |
| FL-002 | Fetch filters respects visibility rules | P1 | Security |
| FL-003 | Fetch filters returns empty for user with no books | P2 | Edge Case |
| FL-004 | Fetch filters handles database errors | P2 | Error |

**Estimated Effort:** 4-6 hours

---

### 3.4 isbndb/fetchMetadata.ts Testing

**File:** `src/utils/actions/isbndb/__tests__/fetchMetadata.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| ISBN-001 | Fetch metadata returns book data for valid ISBN | P2 | Integration |
| ISBN-002 | Fetch metadata throws error for invalid ISBN | P2 | Error |
| ISBN-003 | Fetch metadata handles API timeout | P2 | Error |
| ISBN-004 | Fetch metadata handles rate limiting | P2 | Error |
| ISBN-005 | Fetch metadata logs request details | P3 | Unit |
| ISBN-006 | Fetch metadata includes authorization header | P1 | Security |
| ISBN-007 | Fetch metadata handles network errors | P2 | Error |

#### Example Implementation

```typescript
// src/utils/actions/isbndb/__tests__/fetchMetadata.test.ts
import { describe, it, expect, jest } from '@jest/globals'
import { fetchMetadata } from '../fetchMetadata'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ISBNdb API: fetchMetadata', () => {
  it('ISBN-001: should fetch metadata for valid ISBN', async () => {
    const mockResponse = {
      book: {
        isbn13: '9781234567890',
        title: 'Test Book',
        authors: ['Test Author'],
      },
    }

    server.use(
      rest.get('https://api2.isbndb.com/book/:isbn', (req, res, ctx) => {
        return res(ctx.json(mockResponse))
      })
    )

    const result = await fetchMetadata('9781234567890')

    expect(result).toEqual(mockResponse)
  })

  it('ISBN-004: should handle rate limiting', async () => {
    server.use(
      rest.get('https://api2.isbndb.com/book/:isbn', (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({ error: 'Rate limit exceeded' })
        )
      })
    )

    await expect(fetchMetadata('9781234567890')).rejects.toThrow(
      'ISBN API returned 429'
    )
  })
})
```

**Estimated Effort:** 8-10 hours
**Tools:** Jest, MSW (Mock Service Worker)

---

## 4. API Routes Testing

### 4.1 Overview

**Location:** `src/app/api/`
**Files to Test:**
- `library/search-suggestions/route.ts` (Priority: P1)
- `webhooks/clerk/route.ts` (Priority: P0)

### 4.2 search-suggestions/route.ts Testing

**File:** `src/app/api/library/search-suggestions/__tests__/route.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| SS-001 | Returns empty results for empty query | P1 | Unit |
| SS-002 | Returns empty results for query < 2 characters | P1 | Unit |
| SS-003 | Returns matching titles, authors, subjects | P1 | Integration |
| SS-004 | Ranks exact matches higher than partial | P1 | Integration |
| SS-005 | Ranks prefix matches higher than contains | P1 | Integration |
| SS-006 | Returns max 5 items per category | P1 | Unit |
| SS-007 | Search is case-insensitive | P1 | Integration |
| SS-008 | Respects user visibility filters | P0 | Security |
| SS-009 | Handles database errors gracefully | P1 | Error |
| SS-010 | Returns 500 on server error | P1 | Error |

#### Example Implementation

```typescript
// src/app/api/library/search-suggestions/__tests__/route.test.ts
import { describe, it, expect } from '@jest/globals'
import { GET } from '../route'
import { NextRequest } from 'next/server'

describe('API Route: search-suggestions', () => {
  it('SS-001: should return empty results for empty query', async () => {
    const request = new NextRequest('http://localhost:3000/api/library/search-suggestions?q=')

    const response = await GET(request)
    const data = await response.json()

    expect(data).toEqual({
      authors: [],
      titles: [],
      subjects: [],
    })
  })

  it('SS-003: should return matching results', async () => {
    // Mock database with test data
    const request = new NextRequest(
      'http://localhost:3000/api/library/search-suggestions?q=test'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(data.titles).toBeDefined()
    expect(data.authors).toBeDefined()
    expect(data.subjects).toBeDefined()
    expect(data.titles.length).toBeLessThanOrEqual(5)
  })

  it('SS-004: should rank exact matches higher', async () => {
    // Test implementation with mock data
    // Verify that exact match "Test" appears before "Testing"
  })
})
```

**Estimated Effort:** 10-12 hours
**Tools:** Jest, Supertest, Prisma test utilities

---

## 5. Database Testing

### 5.1 Overview

**Focus Areas:**
- Prisma query correctness
- Data integrity and constraints
- Transaction management
- Migration testing

### 5.2 Schema Validation Tests

**File:** `prisma/__tests__/schema.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| DB-001 | User model has correct fields and constraints | P1 | Unit |
| DB-002 | Book model has correct fields and constraints | P1 | Unit |
| DB-003 | ISBN fields are unique | P0 | Constraint |
| DB-004 | Book-User relationship is correct | P1 | Constraint |
| DB-005 | BookVisibility enum has correct values | P1 | Unit |
| DB-006 | Cascade delete removes user's books | P0 | Constraint |

### 5.3 Query Performance Tests

**File:** `prisma/__tests__/performance.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| PERF-001 | fetchBooks completes in < 100ms for 1000 books | P1 | Performance |
| PERF-002 | fetchBooksPaginated uses indexes efficiently | P1 | Performance |
| PERF-003 | Search query completes in < 200ms | P1 | Performance |
| PERF-004 | Import 100 books completes in < 1s | P1 | Performance |

#### Example Implementation

```typescript
// prisma/__tests__/performance.test.ts
import { describe, it, expect } from '@jest/globals'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Database Performance Tests', () => {
  it('PERF-001: should fetch books in < 100ms', async () => {
    const start = performance.now()

    await prisma.book.findMany({
      where: { ownerId: 1 },
      take: 100,
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100)
  })

  it('PERF-002: should use indexes for pagination', async () => {
    // Use EXPLAIN ANALYZE to verify index usage
    const query = await prisma.$queryRaw`
      EXPLAIN ANALYZE
      SELECT * FROM "Book"
      WHERE "ownerId" = 1
      ORDER BY id ASC
      LIMIT 10 OFFSET 0
    `

    // Verify that query plan uses indexes
    expect(query).toContain('Index Scan')
  })
})
```

**Estimated Effort:** 16-20 hours
**Tools:** Jest, Prisma, PostgreSQL EXPLAIN ANALYZE

---

## 6. Scripts Testing

### 6.1 Overview

**Location:** `scripts/`
**Files to Test:**
- `sync-prod-data-enhanced.ts` (Priority: P0 - Critical)
- `sync-prod-data.ts` (Priority: P0 - Critical)
- `check-users.ts` (Priority: P3 - Low)

### 6.2 sync-prod-data-enhanced.ts Testing

**File:** `scripts/__tests__/sync-prod-data-enhanced.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| SYNC-001 | Dry-run mode doesn't modify database | P0 | Integration |
| SYNC-002 | Sync imports books correctly | P0 | Integration |
| SYNC-003 | Sync transforms user IDs correctly | P0 | Security |
| SYNC-004 | Sync handles errors with rollback | P0 | Error |
| SYNC-005 | Batch processing works correctly | P1 | Integration |
| SYNC-006 | Retry logic works on failure | P1 | Error |
| SYNC-007 | Transaction isolation is correct | P0 | Security |
| SYNC-008 | Connection cleanup happens on error | P1 | Error |
| SYNC-009 | Progress reporting is accurate | P2 | Unit |
| SYNC-010 | Sanitizes connection strings in logs | P0 | Security |

#### Example Implementation

```typescript
// scripts/__tests__/sync-prod-data-enhanced.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const testPrisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL,
})

describe('Script: sync-prod-data-enhanced', () => {
  beforeAll(async () => {
    // Setup test database
    await testPrisma.$executeRaw`TRUNCATE "Book", "User" CASCADE`
  })

  afterAll(async () => {
    await testPrisma.$disconnect()
  })

  it('SYNC-001: dry-run should not modify database', async () => {
    const beforeCount = await testPrisma.book.count()

    // Run script in dry-run mode
    execSync('npm run sync-prod-data:dry-run -- --user-id=1', {
      env: {
        ...process.env,
        DEWEY_DB_DATABASE_URL: process.env.TEST_DATABASE_URL,
      },
    })

    const afterCount = await testPrisma.book.count()
    expect(afterCount).toBe(beforeCount)
  })

  it('SYNC-003: should transform user IDs correctly', async () => {
    // Create test user
    await testPrisma.user.create({
      data: {
        clerkId: 'test-clerk-id',
        email: 'test@example.com',
        id: 1,
      },
    })

    // Run sync
    execSync('npm run sync-prod-data -- --user-id=1 --yes', {
      env: {
        ...process.env,
        DEWEY_DB_DATABASE_URL: process.env.TEST_DATABASE_URL,
      },
    })

    // Verify all books have correct owner
    const books = await testPrisma.book.findMany()
    books.forEach(book => {
      expect(book.ownerId).toBe(1)
    })
  })

  it('SYNC-010: should sanitize connection strings in logs', () => {
    const output = execSync('npm run sync-prod-data:dry-run -- --user-id=1', {
      encoding: 'utf-8',
      env: {
        ...process.env,
        DEWEY_DB_DATABASE_URL: 'postgresql://user:secretpass@localhost:5432/db',
      },
    })

    // Verify password is not in logs
    expect(output).not.toContain('secretpass')
    expect(output).toContain('***')
  })
})
```

**Estimated Effort:** 20-24 hours
**Tools:** Jest, child_process, Prisma, Docker test containers

---

## 7. External Integration Testing

### 7.1 ISBNdb API Integration

**Covered in:** [Section 3.4](#34-isbndbfetchmetadatats-testing)

### 7.2 Clerk Authentication Testing

**File:** `src/utils/__tests__/permissions.test.ts`

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| AUTH-001 | getCurrentUser returns user for authenticated request | P0 | Integration |
| AUTH-002 | getCurrentUser throws for unauthenticated request | P0 | Security |
| AUTH-003 | getViewableBookFilter returns correct filter for auth user | P0 | Security |
| AUTH-004 | getViewableBookFilter returns public-only for unauth | P0 | Security |

**Estimated Effort:** 8-10 hours
**Tools:** Jest, Clerk testing utilities

---

## 8. Performance Testing

### 8.1 Load Testing

**Tool:** k6

**File:** `tests/performance/load-test.js`

#### Test Scenarios

| Test ID | Scenario | Target | Duration |
|---------|----------|--------|----------|
| LOAD-001 | API endpoint baseline | 50 RPS | 5 min |
| LOAD-002 | API endpoint stress | 200 RPS | 2 min |
| LOAD-003 | Database queries | 100 queries/s | 5 min |
| LOAD-004 | Search suggestions | 100 RPS | 5 min |

#### Example k6 Script

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 50 },  // Steady load
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% under 100ms
    http_req_failed: ['rate<0.01'],   // < 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/library/search-suggestions?q=test');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
```

**Estimated Effort:** 12-16 hours
**Tools:** k6, Grafana (visualization)

---

## 9. Security Testing

### 9.1 Authentication & Authorization

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| SEC-001 | Unauthenticated requests are rejected | P0 | Security |
| SEC-002 | Users can only access their own books | P0 | Security |
| SEC-003 | SQL injection attempts are blocked | P0 | Security |
| SEC-004 | XSS attempts are sanitized | P0 | Security |
| SEC-005 | API keys are not exposed in logs | P0 | Security |
| SEC-006 | Rate limiting prevents abuse | P1 | Security |

### 9.2 Input Validation

#### Test Cases

| Test ID | Test Case | Priority | Type |
|---------|-----------|----------|------|
| VAL-001 | Invalid ISBN format is rejected | P1 | Validation |
| VAL-002 | Oversized input is rejected | P1 | Validation |
| VAL-003 | Special characters are handled | P1 | Validation |
| VAL-004 | Null/undefined values are handled | P1 | Validation |

**Estimated Effort:** 16-20 hours
**Tools:** Jest, OWASP ZAP (automated scanning)

---

## 10. Test File Structure

```
penumbra/
├── src/
│   ├── utils/
│   │   └── actions/
│   │       ├── __tests__/
│   │       │   ├── books.test.ts
│   │       │   └── filters.test.ts
│   │       └── isbndb/
│   │           └── __tests__/
│   │               └── fetchMetadata.test.ts
│   ├── app/
│   │   └── api/
│   │       └── library/
│   │           └── search-suggestions/
│   │               └── __tests__/
│   │                   └── route.test.ts
│   └── __tests__/
│       └── utils/
│           ├── setup.ts
│           ├── fixtures.ts
│           └── mocks.ts
├── scripts/
│   └── __tests__/
│       ├── sync-prod-data-enhanced.test.ts
│       └── sync-prod-data.test.ts
├── prisma/
│   └── __tests__/
│       ├── schema.test.ts
│       └── performance.test.ts
├── tests/
│   ├── integration/
│   │   ├── api-routes.test.ts
│   │   └── database.test.ts
│   ├── performance/
│   │   ├── load-test.js
│   │   └── stress-test.js
│   └── security/
│       ├── auth.test.ts
│       └── input-validation.test.ts
├── jest.config.js
├── jest.setup.js
└── .env.test
```

---

## 11. CI/CD Integration

### 11.1 GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: penumbra_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DEWEY_DB_DATABASE_URL: postgresql://testuser:testpass@localhost:5432/penumbra_test

      - name: Run unit tests
        run: npm run test:unit
        env:
          DEWEY_DB_DATABASE_URL: postgresql://testuser:testpass@localhost:5432/penumbra_test
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_SECRET }}

      - name: Run integration tests
        run: npm run test:integration
        env:
          DEWEY_DB_DATABASE_URL: postgresql://testuser:testpass@localhost:5432/penumbra_test
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_SECRET }}

      - name: Generate coverage report
        run: npm run test:coverage
        env:
          DEWEY_DB_DATABASE_URL: postgresql://testuser:testpass@localhost:5432/penumbra_test
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_SECRET }}

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: true

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info

  performance:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Run k6 load test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/performance/load-test.js
          cloud: false
```

### 11.2 Pre-commit Hooks

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests on changed files
npm run test -- --findRelatedTests --bail
```

**Estimated Effort:** 8-10 hours

---

## 12. Quality Metrics

### 12.1 Coverage Targets

| Component | Target | Critical Paths |
|-----------|--------|----------------|
| Server Actions | 90% | 100% |
| API Routes | 85% | 100% |
| Database Queries | 80% | 100% |
| Scripts | 90% | 100% |
| Utilities | 75% | 90% |

### 12.2 Success Criteria

**Definition of Done for Testing:**
- [ ] All P0 and P1 test cases implemented
- [ ] Code coverage > 80% overall
- [ ] Critical paths covered 100%
- [ ] All tests passing in CI/CD
- [ ] Performance benchmarks met (p95 < 100ms)
- [ ] Security tests passing
- [ ] Documentation updated

### 12.3 Monitoring Dashboard

**Recommended Tools:**
- **Coverage:** Codecov or Coveralls
- **Performance:** k6 Cloud or Grafana
- **Security:** Snyk or Dependabot

---

## 13. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Effort:** 40-50 hours

1. **Setup test infrastructure** (8-10h)
   - Install Jest and dependencies
   - Configure jest.config.js
   - Setup test database
   - Create test utilities

2. **Server Actions - Critical Path** (16-20h)
   - books.ts tests (P0 cases)
   - User isolation tests
   - Authentication tests

3. **CI/CD Integration** (8-10h)
   - GitHub Actions workflow
   - Coverage reporting
   - Pre-commit hooks

4. **Documentation** (8-10h)
   - Test writing guidelines
   - Mock strategies
   - Common patterns

### Phase 2: Core Coverage (Week 3-4)
**Effort:** 50-60 hours

1. **Complete Server Actions** (12-16h)
   - books.ts remaining tests
   - filters.ts tests
   - fetchMetadata.ts tests

2. **API Routes Testing** (16-20h)
   - search-suggestions tests
   - webhook tests
   - Error handling tests

3. **Database Testing** (16-20h)
   - Schema validation
   - Query performance
   - Transaction tests

4. **Scripts Testing** (16-20h)
   - sync-prod-data-enhanced.ts
   - sync-prod-data.ts
   - Error scenarios

### Phase 3: Security & Performance (Week 5)
**Effort:** 30-40 hours

1. **Security Testing** (16-20h)
   - Authentication tests
   - Authorization tests
   - Input validation
   - SQL injection prevention

2. **Performance Testing** (12-16h)
   - k6 load tests
   - Stress tests
   - Query optimization
   - Benchmarking

3. **Integration Testing** (12-16h)
   - End-to-end workflows
   - External API mocking
   - Clerk integration

### Phase 4: Polish & Documentation (Week 6)
**Effort:** 20-30 hours

1. **Achieve Coverage Targets** (12-16h)
   - Fill coverage gaps
   - Edge cases
   - Error scenarios

2. **Performance Optimization** (8-10h)
   - Optimize slow tests
   - Parallel execution
   - Test data optimization

3. **Documentation & Training** (8-10h)
   - Testing guidelines
   - Best practices
   - Team training

**Total Estimated Effort:** 140-180 hours (4-6 weeks for 1 developer)

---

## 14. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Test database setup complexity | High | Medium | Use Docker containers for isolation |
| Clerk auth mocking challenges | High | High | Use Clerk test utilities and documentation |
| Slow test execution | Medium | High | Implement test parallelization and optimize fixtures |
| Flaky tests | Medium | Medium | Use proper cleanup, avoid race conditions |
| Low developer adoption | High | Medium | Provide training, documentation, and CI enforcement |
| ISBNdb API rate limiting in tests | Low | High | Mock all external API calls |

---

## 15. Maintenance Plan

### 15.1 Ongoing Activities

- **Weekly:** Review test failures and fix flaky tests
- **Monthly:** Review coverage metrics and add tests for gaps
- **Quarterly:** Update dependencies and test frameworks
- **Per PR:** Require tests for new features, enforce coverage thresholds

### 15.2 Quality Gates

**PR Checklist:**
- [ ] All new code has unit tests
- [ ] Integration tests added for new features
- [ ] Coverage thresholds maintained
- [ ] All tests pass in CI
- [ ] Performance benchmarks met
- [ ] Security tests updated if needed

---

## Appendix A: Testing Tools Comparison

| Tool | Purpose | Pros | Cons | Recommendation |
|------|---------|------|------|----------------|
| **Jest** | Unit/Integration | Fast, popular, great mocking | Some Next.js quirks | ✅ Recommended |
| **Vitest** | Unit/Integration | Very fast, Vite native | Newer, smaller ecosystem | Alternative |
| **Supertest** | API Testing | Simple, express-compatible | Limited features | ✅ Recommended |
| **Playwright** | E2E | Multi-browser, reliable | Heavy, out of scope | Not for this plan |
| **k6** | Performance | Powerful, scriptable | Learning curve | ✅ Recommended |
| **MSW** | API Mocking | Realistic, network-level | Setup complexity | ✅ Recommended |

---

## Appendix B: Example Test Data Fixtures

```typescript
// src/__tests__/utils/fixtures.ts
import { faker } from '@faker-js/faker'

export const mockBook = (overrides = {}) => ({
  id: faker.number.int(),
  isbn10: faker.string.numeric(10),
  isbn13: faker.string.numeric(13),
  title: faker.lorem.words(3),
  titleLong: faker.lorem.sentence(),
  language: 'en',
  synopsis: faker.lorem.paragraphs(2),
  image: faker.image.url(),
  imageOriginal: faker.image.url(),
  publisher: faker.company.name(),
  edition: '1st',
  pageCount: faker.number.int({ min: 100, max: 1000 }),
  datePublished: faker.date.past().toISOString(),
  subjects: [faker.lorem.word(), faker.lorem.word()],
  authors: [faker.person.fullName()],
  binding: 'Paperback',
  visibility: 'PUBLIC',
  ownerId: 1,
  ...overrides,
})

export const mockUser = (overrides = {}) => ({
  id: faker.number.int(),
  clerkId: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  ...overrides,
})

export const mockBooksArray = (count: number) =>
  Array.from({ length: count }, () => mockBook())
```

---

## Appendix C: Common Test Patterns

### Pattern 1: Testing Server Actions with Auth

```typescript
import { getCurrentUser } from '@/utils/permissions'

jest.mock('@/utils/permissions')

test('should require authentication', async () => {
  (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

  await expect(someServerAction()).rejects.toThrow('Unauthorized')
})
```

### Pattern 2: Testing Database Transactions

```typescript
test('should rollback on error', async () => {
  const initialCount = await prisma.book.count()

  await expect(someTransactionalOperation()).rejects.toThrow()

  const finalCount = await prisma.book.count()
  expect(finalCount).toBe(initialCount)
})
```

### Pattern 3: Testing API Routes

```typescript
import { GET } from '../route'
import { NextRequest } from 'next/server'

test('should return 400 for invalid input', async () => {
  const req = new NextRequest('http://localhost/api/test?invalid=true')
  const response = await GET(req)

  expect(response.status).toBe(400)
})
```

---

## Conclusion

This comprehensive testing plan provides a roadmap for achieving >80% test coverage of all non-UI elements in the Penumbra application. By following this plan, you will:

1. **Ensure Quality:** Catch bugs before production
2. **Enable Refactoring:** Safely improve code with confidence
3. **Document Behavior:** Tests serve as executable documentation
4. **Improve Security:** Verify auth, authorization, and input validation
5. **Maintain Performance:** Benchmark and prevent regressions

**Next Steps:**
1. Review and approve this plan
2. Setup test infrastructure (Phase 1)
3. Begin implementing critical path tests (P0)
4. Establish CI/CD pipeline
5. Gradually increase coverage to targets

**Questions or modifications needed?** This plan can be adapted based on team priorities, timelines, and resource availability.

---

**Document Version:** 1.0
**Last Updated:** November 10, 2025
**Maintained By:** Development Team
**Review Cycle:** Quarterly
