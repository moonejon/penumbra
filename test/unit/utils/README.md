# Unit Tests for Validation and Permissions Utilities

## Overview

This directory contains comprehensive unit tests for the validation and permission utilities in the Penumbra project. These tests follow the Testing Trophy approach outlined in the project's testing strategy, focusing on testing pure functions and business logic.

## Test Files

### 1. validation.test.ts
**File:** `/Users/jonathan/github/penumbra/.conductor/brisbane/test/unit/utils/validation.test.ts`
**Lines:** 661
**Test Cases:** 137

Tests all validation functions from `src/utils/validation.ts`:

#### Functions Tested:
- `validateISBN13()` - ISBN-13 format and checksum validation
- `validateISBN10()` - ISBN-10 format and checksum validation (including 'X' check digit)
- `isValidUrl()` - URL format validation
- `validateDate()` - Date format validation (YYYY, YYYY-MM, YYYY-MM-DD)
- `sanitizeString()` - Input sanitization and XSS prevention
- `validateRequired()` - Required field validation (strings, arrays, numbers)
- `validateLength()` - String length validation (min/max)
- `validateNumberRange()` - Number range validation (min/max)

#### Test Coverage Areas:
- Valid input cases
- Invalid input cases
- Edge cases (empty strings, null values, boundary conditions)
- Real-world examples (actual ISBN numbers from well-known books)
- XSS prevention and security
- Type handling and defaults
- Error message generation

### 2. permissions.test.ts
**File:** `/Users/jonathan/github/penumbra/.conductor/brisbane/test/unit/utils/permissions.test.ts`
**Lines:** 703
**Test Cases:** 37

Tests permission logic patterns from `src/utils/permissions.ts`:

#### Functions/Logic Tested:
- `checkBookViewPermission()` - Book viewing permission logic
- Book ownership verification
- Viewable book filter logic (for database queries)
- Permission edge cases
- Authorization error conditions
- Visibility state transitions
- `getCurrentUser()` error handling
- `getCurrentUserId()` optional auth logic
- `requireAuth()` authentication enforcement

#### Test Coverage Areas:
- Owner vs non-owner access patterns
- PUBLIC vs PRIVATE vs UNLISTED visibility rules
- Authenticated vs unauthenticated user scenarios
- Permission context building (canView, canEdit, canDelete)
- Null/undefined handling for userId
- Case sensitivity in user ID comparisons
- Complex multi-user scenarios
- Type safety and defensive programming

## Key Testing Patterns

### ISBN Validation Tests
- Comprehensive checksum validation for both ISBN-10 and ISBN-13
- Tests with real-world ISBN numbers (The Great Gatsby, 1984, Harry Potter)
- Hyphen and space handling
- Special 'X' check digit for ISBN-10
- Prefix validation (978/979 for ISBN-13)

### Permission Logic Tests
These tests verify the permission decision logic that would be implemented in the actual server-side functions. Since the actual functions depend on Clerk authentication and Prisma database, these unit tests focus on the core logic patterns:

```typescript
// Permission decision pattern tested:
isOwner = userId === book.owner.clerkId
canView = isOwner || book.visibility === 'PUBLIC' || book.visibility === 'UNLISTED'
canEdit = isOwner
canDelete = isOwner
```

### Security-Focused Tests
- XSS prevention through angle bracket removal
- Input sanitization and length enforcement
- URL validation to prevent malicious links
- Authentication state validation

## Test Statistics

| Metric | Value |
|--------|-------|
| Total Test Files | 2 |
| Total Test Cases | 174 |
| Total Lines of Test Code | 1,364 |
| Functions Under Test | 16 |
| Average Tests per Function | ~11 |

## Running the Tests

These tests are designed to run with Vitest as specified in the project's testing strategy:

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run test/unit/utils/validation.test.ts
npx vitest run test/unit/utils/permissions.test.ts
```

## Testing Philosophy

These tests follow Kent C. Dodds' Testing Trophy principles:

1. **Test Behavior, Not Implementation** - Tests verify what functions do, not how they do it
2. **Comprehensive Edge Cases** - Tests cover boundary conditions, null values, and error states
3. **Real-World Examples** - Tests use actual data (real ISBN numbers, realistic scenarios)
4. **Clear Test Names** - Each test clearly states what it's testing and the expected behavior
5. **Independent Tests** - Each test can run independently without relying on other tests

## Recommendations for Additional Testing

While these unit tests provide comprehensive coverage of the pure functions, the following areas would benefit from integration testing:

### Missing/Recommended Tests:

1. **Server Action Validation Integration**
   - Test validation functions being called from actual server actions
   - Test error handling and user feedback flow
   - Test validation in form submission flows

2. **Permission Integration Tests** (test/integration/utils/permissions.test.ts)
   - Mock Clerk `auth()` function
   - Mock Prisma database queries
   - Test actual async function execution
   - Test error throwing and handling
   - Test database user lookup edge cases

3. **Input Validation in Context**
   - Test ISBN validation in the book import flow
   - Test date validation in book metadata updates
   - Test string sanitization in user-generated content

4. **Permission Enforcement in Components**
   - Test that UI correctly hides/shows edit buttons based on permissions
   - Test that server actions enforce permissions before database operations
   - Test unauthorized access attempts

5. **Cross-Cutting Concerns**
   - Test validation error messages are properly displayed to users
   - Test permission denial errors result in proper HTTP status codes
   - Test logging of authorization failures

## Notes for QA Team

### Validation Testing Notes:
- ISBN validation includes checksum verification - invalid checksums are caught
- Date validation accepts multiple formats to accommodate book publication dates
- String sanitization is defensive but not meant to replace proper content security policies
- URL validation uses native `URL` constructor for robustness

### Permission Testing Notes:
- Permission logic tests demonstrate the decision-making patterns
- Full integration tests with mocked Clerk/Prisma should be in `test/integration/`
- UNLISTED visibility allows "anyone with the link" access (like Google Docs unlisted)
- Null userId is explicitly handled for unauthenticated users
- Owner permissions are always granted regardless of visibility setting

## Test Maintenance

When updating validation or permission logic:

1. Update corresponding tests to match new behavior
2. Add tests for new edge cases discovered in production
3. Keep real-world examples up to date
4. Ensure error messages in tests match actual implementation
5. Add regression tests for any bugs found

## Code Quality Metrics

All tests follow these quality standards:
- Clear, descriptive test names using "should" pattern
- Organized into logical describe blocks
- Each test focuses on a single behavior
- Tests are readable without needing to look at implementation
- Edge cases and error conditions are explicitly tested
