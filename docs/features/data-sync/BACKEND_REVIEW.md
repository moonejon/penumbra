# Backend Review: Production Data Sync Script

## Executive Summary

The existing `scripts/sync-prod-data.ts` provides a functional data sync solution but requires several critical improvements for production-grade robustness, security, and performance.

## Current Architecture Analysis

### Database Connection Strategy
**Current Implementation:**
```typescript
const prodPrisma = new PrismaClient({
  datasources: { db: { url: prodEnv.DEWEY_DB_DATABASE_URL } }
});
```

**Issues:**
1. **No Read-Only Enforcement**: Production connection allows writes despite being intended as read-only
2. **No Connection Pooling Config**: Uses default Prisma settings which may not be optimal
3. **No Timeout Configuration**: Long queries could hang indefinitely
4. **Missing Connection Limits**: Could exhaust database connections

### Transaction Management

**Current Implementation:**
```typescript
await devPrisma.$transaction(async (tx) => {
  const deleted = await tx.book.deleteMany({});
  // Import books one by one
  for (const book of transformedBooks) {
    await tx.book.create({ data: book });
  }
});
```

**Issues:**
1. **Performance**: Individual creates in loop (O(n) roundtrips) vs bulk insert
2. **Long Transaction**: Large datasets could exceed default transaction timeout (5s)
3. **No Batching**: All books processed in single transaction - memory intensive
4. **Error Context**: Errors don't identify which specific book failed

### Error Handling

**Current Strengths:**
- Graceful handling of duplicate ISBN constraints
- Error collection during import
- Stack trace logging on fatal errors

**Gaps:**
1. **No Retry Logic**: Network blips cause complete failure
2. **No Partial Success**: Transaction rollback loses all progress on any error
3. **Generic Error Messages**: Doesn't distinguish connection vs validation vs constraint errors
4. **No Dead Letter Queue**: Failed records are lost after retry exhaustion

### Data Integrity

**Current Verification:**
```typescript
const finalCount = await devPrisma.book.count({ where: { ownerId: devUserId } });
```

**Gaps:**
1. **Surface-Level**: Only counts records, doesn't validate data integrity
2. **No Checksum**: Doesn't verify data content matches source
3. **No Relationship Validation**: Doesn't verify foreign key integrity
4. **No Rollback on Mismatch**: Count mismatch doesn't trigger rollback

### Security Concerns

**Critical Issues:**
1. **Database URL Exposure**: Production connection string printed to console (line 83)
2. **No SSL/TLS Verification**: Connection security not enforced
3. **No Audit Trail**: No logging of who ran sync, when, or what changed
4. **Secrets in .env Files**: Production credentials in version-controllable files

## Recommended Improvements

### 1. Read-Only Database Access

**Implementation:**
```typescript
// Production client with read-only enforcement
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: addReadOnlyParam(prodEnv.DEWEY_DB_DATABASE_URL)
    }
  }
});

function addReadOnlyParam(url: string): string {
  const parsed = new URL(url);
  // For PostgreSQL
  parsed.searchParams.set('options', '-c default_transaction_read_only=on');
  return parsed.toString();
}
```

**Benefits:**
- Database-level write protection
- Prevents accidental mutations
- Compliance with read-only intent

### 2. Connection Pooling Configuration

**Implementation:**
```typescript
const prodPrisma = new PrismaClient({
  datasources: {
    db: { url: prodEnv.DEWEY_DB_DATABASE_URL }
  },
  log: ['warn', 'error'],
  connection: {
    pool: {
      timeout: 30000,        // 30s connection timeout
      maxIdleTime: 300000,   // 5m max idle
      maxSize: 5,            // Limit concurrent connections
    }
  }
});
```

**Benefits:**
- Prevents connection exhaustion
- Graceful timeout handling
- Resource cleanup

### 3. Batched Transaction Processing

**Current Problem:**
```typescript
// Single large transaction - memory intensive, timeout prone
await devPrisma.$transaction(async (tx) => {
  for (const book of transformedBooks) { // O(n) operations
    await tx.book.create({ data: book });
  }
});
```

**Improved Solution:**
```typescript
const BATCH_SIZE = 100;

for (let i = 0; i < transformedBooks.length; i += BATCH_SIZE) {
  const batch = transformedBooks.slice(i, i + BATCH_SIZE);

  await devPrisma.$transaction(async (tx) => {
    await tx.book.createMany({
      data: batch,
      skipDuplicates: true
    });
  }, {
    maxWait: 10000,    // 10s max wait for transaction slot
    timeout: 30000,    // 30s max transaction time
  });

  console.log(`Imported batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(transformedBooks.length/BATCH_SIZE)}`);
}
```

**Benefits:**
- **Performance**: `createMany()` uses bulk insert (single roundtrip per batch)
- **Memory**: Processes in chunks, not all at once
- **Timeout Safety**: Smaller transactions less likely to timeout
- **Progress Visibility**: Batch-level progress reporting
- **Partial Success**: Each batch commits independently

### 4. Enhanced Error Handling

**Implementation:**
```typescript
interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{
    batch: number;
    error: string;
    retryable: boolean;
  }>;
}

async function importWithRetry(
  tx: any,
  batch: any[],
  batchNum: number,
  maxRetries = 3
): Promise<number> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const result = await tx.book.createMany({
        data: batch,
        skipDuplicates: true
      });
      return result.count;
    } catch (error) {
      const isRetryable = isTransientError(error);

      if (!isRetryable || retries >= maxRetries - 1) {
        throw error;
      }

      retries++;
      const backoff = Math.pow(2, retries) * 1000; // Exponential backoff
      console.log(`Batch ${batchNum} failed, retrying in ${backoff}ms... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }

  return 0;
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const transientPatterns = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'lock timeout',
    'deadlock detected'
  ];

  return transientPatterns.some(pattern =>
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}
```

**Benefits:**
- Distinguishes transient vs permanent errors
- Exponential backoff prevents thundering herd
- Detailed error context for debugging
- Graceful degradation

### 5. Data Integrity Verification

**Implementation:**
```typescript
async function verifyImport(
  prodBooks: any[],
  devUserId: number
): Promise<{ success: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Count verification
  const devCount = await devPrisma.book.count({
    where: { ownerId: devUserId }
  });

  if (devCount !== prodBooks.length) {
    issues.push(
      `Count mismatch: Expected ${prodBooks.length}, got ${devCount}`
    );
  }

  // Sample verification (check 10 random records)
  const sampleSize = Math.min(10, prodBooks.length);
  const samples = prodBooks
    .sort(() => 0.5 - Math.random())
    .slice(0, sampleSize);

  for (const prodBook of samples) {
    const devBook = await devPrisma.book.findUnique({
      where: { isbn13: prodBook.isbn13 }
    });

    if (!devBook) {
      issues.push(`Missing book: ${prodBook.title} (${prodBook.isbn13})`);
      continue;
    }

    // Verify key fields
    const fieldsToCheck = ['title', 'authors', 'publisher'];
    for (const field of fieldsToCheck) {
      if (JSON.stringify(devBook[field]) !== JSON.stringify(prodBook[field])) {
        issues.push(
          `Data mismatch in ${prodBook.isbn13}.${field}: ` +
          `${JSON.stringify(prodBook[field])} vs ${JSON.stringify(devBook[field])}`
        );
      }
    }
  }

  return {
    success: issues.length === 0,
    issues
  };
}
```

**Benefits:**
- Detects count mismatches
- Validates data integrity via sampling
- Identifies corruption early
- Provides actionable error messages

### 6. Security Improvements

**Connection String Sanitization:**
```typescript
function sanitizeConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    // Hide password and API keys
    if (parsed.password) parsed.password = '***';
    if (parsed.searchParams.has('api_key')) {
      parsed.searchParams.set('api_key', '***');
    }
    return parsed.toString();
  } catch {
    return url.substring(0, 30) + '...';
  }
}

console.log(`Production DB: ${sanitizeConnectionString(prodEnv.DEWEY_DB_DATABASE_URL)}`);
```

**Audit Trail:**
```typescript
interface AuditLog {
  timestamp: Date;
  operation: 'sync-prod-data';
  user: string;
  source: string;
  target: string;
  recordsProcessed: number;
  status: 'success' | 'failure' | 'partial';
  errors?: string[];
}

async function createAuditLog(log: AuditLog): Promise<void> {
  const logEntry = JSON.stringify(log, null, 2);
  const logFile = path.join(
    process.cwd(),
    'logs',
    `sync-${Date.now()}.json`
  );

  await fs.promises.mkdir(path.dirname(logFile), { recursive: true });
  await fs.promises.writeFile(logFile, logEntry);

  console.log(`Audit log written to: ${logFile}`);
}
```

### 7. Performance Optimization

**Current Performance Characteristics:**
- Individual `book.create()` calls: ~50-100ms each
- 1000 books: 50-100 seconds
- Memory: O(n) - all books loaded at once

**Optimized Performance:**
```typescript
// Use createMany with batching
const BATCH_SIZE = 100;
const result = await tx.book.createMany({
  data: batch,
  skipDuplicates: true
});
```

**Expected Improvements:**
- Bulk insert: ~500-1000ms per 100 books
- 1000 books: 5-10 seconds (10x faster)
- Memory: O(BATCH_SIZE) - constant memory usage

### 8. Connection Cleanup

**Current Implementation:**
```typescript
finally {
  if (prodPrisma) await prodPrisma.$disconnect();
  if (devPrisma) await devPrisma.$disconnect();
}
```

**Enhanced Version:**
```typescript
const cleanup = async () => {
  const disconnectPromises = [];

  if (prodPrisma) {
    disconnectPromises.push(
      prodPrisma.$disconnect()
        .catch(err => console.error('Error disconnecting from prod:', err))
    );
  }

  if (devPrisma) {
    disconnectPromises.push(
      devPrisma.$disconnect()
        .catch(err => console.error('Error disconnecting from dev:', err))
    );
  }

  await Promise.all(disconnectPromises);
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  await cleanup();
  process.exit(0);
});
```

**Benefits:**
- Graceful shutdown on Ctrl+C
- Prevents connection leaks
- Parallel disconnect for speed

## Implementation Priority

### Critical (Implement Immediately):
1. ✅ Read-only database access for production
2. ✅ Batched transaction processing
3. ✅ Enhanced error handling with retry logic
4. ✅ Connection string sanitization

### High Priority:
5. ✅ Data integrity verification
6. ✅ Connection pooling configuration
7. ✅ Graceful shutdown handling

### Medium Priority:
8. Audit trail logging
9. Performance monitoring
10. Progress persistence (resume capability)

## Testing Strategy

### Unit Tests
```typescript
describe('sync-prod-data', () => {
  test('sanitizes connection strings', () => {
    const url = 'postgres://user:pass@host/db';
    expect(sanitizeConnectionString(url)).toContain('***');
  });

  test('identifies transient errors', () => {
    const error = new Error('ECONNRESET');
    expect(isTransientError(error)).toBe(true);
  });
});
```

### Integration Tests
1. Test with small dataset (10 books)
2. Test with duplicate ISBNs
3. Test with network interruption simulation
4. Test dry-run mode
5. Test rollback on error

### Load Tests
1. 1,000 books
2. 10,000 books
3. Concurrent execution safety
4. Memory usage profiling

## Configuration Recommendations

### Environment Variables
```bash
# .env.production (read-only)
DEWEY_DB_DATABASE_URL_READONLY="postgres://readonly_user:***@host/db?options=-c%20default_transaction_read_only=on"

# .env (development)
DEWEY_DB_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/penumbra_local"

# Sync configuration
SYNC_BATCH_SIZE=100
SYNC_MAX_RETRIES=3
SYNC_TIMEOUT_MS=30000
```

### NPM Scripts
```json
{
  "scripts": {
    "sync-prod-data": "tsx scripts/sync-prod-data.ts",
    "sync-prod-data:dry-run": "tsx scripts/sync-prod-data.ts --dry-run",
    "sync-prod-data:user": "tsx scripts/sync-prod-data.ts --user-id"
  }
}
```

## Monitoring & Observability

### Metrics to Track
1. Import duration
2. Records processed per second
3. Error rate by error type
4. Transaction success/failure ratio
5. Connection pool utilization

### Logging Requirements
1. Start/end timestamps
2. User who initiated sync
3. Record counts (source, target, imported, skipped, failed)
4. Error details with stack traces
5. Performance metrics

## Risk Assessment

### Current Risks
| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Accidental production write | Critical | Low | Read-only connection |
| Transaction timeout | High | Medium | Batching + timeout config |
| Connection exhaustion | High | Medium | Connection pooling |
| Data corruption | High | Low | Integrity verification |
| Credential exposure | Medium | Medium | Sanitization + audit |
| Memory exhaustion | Medium | Low | Streaming/batching |

### Post-Mitigation Risks
All risks reduced to Low severity with proposed improvements.

## Conclusion

The existing script provides a solid foundation but requires critical improvements for production use. The recommended enhancements focus on:

1. **Safety**: Read-only access, transaction management
2. **Performance**: Batching, bulk operations
3. **Reliability**: Retry logic, error handling
4. **Security**: Credential protection, audit trail
5. **Observability**: Progress reporting, verification

Implementing these improvements will create a production-grade data sync solution that is robust, performant, and secure.
