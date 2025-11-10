#!/usr/bin/env tsx

/**
 * Production to Development Data Sync Script (Enhanced)
 *
 * This script exports book data from production, transforms user IDs to match
 * the development environment, and imports the data into the local database.
 *
 * ENHANCEMENTS:
 *   - Batched transaction processing for better performance and reliability
 *   - Retry logic with exponential backoff for transient errors
 *   - Enhanced error handling and reporting
 *   - Connection string sanitization for security
 *   - Data integrity verification
 *   - Graceful shutdown handling
 *
 * USAGE:
 *   npm run sync-prod-data                    # Interactive mode
 *   npm run sync-prod-data -- --dry-run       # Preview changes without importing
 *   npm run sync-prod-data -- --user-id=123   # Specify dev user ID
 *   npm run sync-prod-data -- --yes           # Skip confirmation prompts
 *
 * SAFETY:
 *   - Production database is accessed read-only
 *   - Requires confirmation before deleting dev data
 *   - Use --dry-run to preview changes first
 *   - Batched transactions prevent timeout issues
 *
 * REQUIREMENTS:
 *   - .env.production must contain production DEWEY_DB_DATABASE_URL
 *   - .env must contain development DEWEY_DB_DATABASE_URL
 *   - Development database must have at least one user
 */

import { PrismaClient, BookVisibility } from '@prisma/client';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Configuration constants
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const TRANSACTION_TIMEOUT = 30000; // 30 seconds
const MAX_TRANSACTION_WAIT = 10000; // 10 seconds

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipConfirmation = args.includes('--yes') || args.includes('-y');
const userIdArg = args.find(arg => arg.startsWith('--user-id='));
const targetUserId = userIdArg ? parseInt(userIdArg.split('=')[1]) : null;

// Types
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

interface BookData {
  isbn10: string;
  isbn13: string;
  title: string;
  titleLong: string;
  language: string;
  synopsis: string;
  image: string;
  imageOriginal: string;
  publisher: string;
  edition: string | null;
  pageCount: number;
  datePublished: string;
  subjects: string[];
  authors: string[];
  binding: string;
  visibility: BookVisibility;
  ownerId: number;
}

// Load environment variables
function loadEnv(envFile: string): Record<string, string> {
  const envPath = path.resolve(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) {
    throw new Error(`Environment file not found: ${envFile}`);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  });

  return env;
}

// Sanitize connection string for logging
function sanitizeConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    // Hide password
    if (parsed.password) {
      parsed.password = '***';
    }
    // Hide API keys in query params
    if (parsed.searchParams.has('api_key')) {
      parsed.searchParams.set('api_key', '***');
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, just truncate
    return url.substring(0, 30) + '...';
  }
}

// Check if error is transient and retryable
function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const transientPatterns = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'lock timeout',
    'deadlock detected',
    'connection',
    'timeout'
  ];

  const errorMessage = error.message.toLowerCase();
  return transientPatterns.some(pattern =>
    errorMessage.includes(pattern.toLowerCase())
  );
}

// Create Prisma clients for production and development
function createPrismaClients() {
  console.log('📦 Loading environment configurations...\n');

  const prodEnv = loadEnv('.env.production');
  const devEnv = loadEnv('.env');

  if (!prodEnv.DEWEY_DB_DATABASE_URL) {
    throw new Error('DEWEY_DB_DATABASE_URL not found in .env.production');
  }

  if (!devEnv.DEWEY_DB_DATABASE_URL) {
    throw new Error('DEWEY_DB_DATABASE_URL not found in .env');
  }

  // Sanitize connection strings for logging
  const prodUrlSanitized = sanitizeConnectionString(prodEnv.DEWEY_DB_DATABASE_URL);
  const devUrlSanitized = sanitizeConnectionString(devEnv.DEWEY_DB_DATABASE_URL);

  console.log(`✅ Production DB: ${prodUrlSanitized}`);
  console.log(`✅ Development DB: ${devUrlSanitized}\n`);

  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: prodEnv.DEWEY_DB_DATABASE_URL
      }
    },
    log: ['warn', 'error']
  });

  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url: devEnv.DEWEY_DB_DATABASE_URL
      }
    },
    log: ['warn', 'error']
  });

  return { prodPrisma, devPrisma };
}

// Prompt user for confirmation
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Import a single batch with retry logic
async function importBatchWithRetry(
  devPrisma: PrismaClient,
  batch: BookData[],
  batchNum: number,
  totalBatches: number
): Promise<{ imported: number; error?: string }> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const result = await devPrisma.$transaction(async (tx) => {
        const createResult = await tx.book.createMany({
          data: batch,
          skipDuplicates: true
        });
        return createResult.count;
      }, {
        maxWait: MAX_TRANSACTION_WAIT,
        timeout: TRANSACTION_TIMEOUT
      });

      return { imported: result };
    } catch (error) {
      const isRetryable = isTransientError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (!isRetryable || retries >= MAX_RETRIES - 1) {
        // Not retryable or max retries reached
        return {
          imported: 0,
          error: `Batch ${batchNum}/${totalBatches} failed: ${errorMessage}`
        };
      }

      retries++;
      const backoff = Math.pow(2, retries) * 1000; // Exponential backoff
      console.log(`   ⚠️  Batch ${batchNum}/${totalBatches} failed (transient error), retrying in ${backoff}ms... (${retries}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }

  return { imported: 0, error: 'Max retries exceeded' };
}

// Verify import integrity
async function verifyImport(
  devPrisma: PrismaClient,
  expectedCount: number,
  devUserId: number,
  sampleBooks: BookData[]
): Promise<{ success: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Count verification
  const actualCount = await devPrisma.book.count({
    where: { ownerId: devUserId }
  });

  if (actualCount !== expectedCount) {
    issues.push(
      `Count mismatch: Expected ${expectedCount}, got ${actualCount}`
    );
  }

  // Sample verification (check a few random records)
  const sampleSize = Math.min(5, sampleBooks.length);
  const samples = sampleBooks
    .sort(() => 0.5 - Math.random())
    .slice(0, sampleSize);

  for (const sample of samples) {
    const devBook = await devPrisma.book.findUnique({
      where: { isbn13: sample.isbn13 }
    });

    if (!devBook) {
      issues.push(`Missing book: ${sample.title} (${sample.isbn13})`);
      continue;
    }

    // Verify key fields
    if (devBook.title !== sample.title) {
      issues.push(`Title mismatch for ${sample.isbn13}`);
    }
    if (JSON.stringify(devBook.authors) !== JSON.stringify(sample.authors)) {
      issues.push(`Authors mismatch for ${sample.isbn13}`);
    }
  }

  return {
    success: issues.length === 0,
    issues
  };
}

// Main sync function
async function syncProductionData() {
  console.log('🚀 Production to Development Data Sync (Enhanced)\n');
  console.log('='.repeat(60) + '\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  let prodPrisma: PrismaClient | null = null;
  let devPrisma: PrismaClient | null = null;

  // Graceful shutdown handler
  const cleanup = async () => {
    console.log('\n🧹 Cleaning up connections...');
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
    console.log('\n⚠️  Received SIGINT, cleaning up...');
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received SIGTERM, cleaning up...');
    await cleanup();
    process.exit(0);
  });

  try {
    // Step 1: Create database connections
    const clients = createPrismaClients();
    prodPrisma = clients.prodPrisma;
    devPrisma = clients.devPrisma;

    // Step 2: Export books from production
    console.log('📥 Exporting books from production...');
    const prodBooks = await prodPrisma.book.findMany({
      select: {
        isbn10: true,
        isbn13: true,
        title: true,
        titleLong: true,
        language: true,
        synopsis: true,
        image: true,
        imageOriginal: true,
        publisher: true,
        edition: true,
        pageCount: true,
        datePublished: true,
        subjects: true,
        authors: true,
        binding: true,
        visibility: true,
        ownerId: true
      }
    });

    console.log(`✅ Exported ${prodBooks.length} books from production\n`);

    if (prodBooks.length === 0) {
      console.log('⚠️  No books found in production database');
      return;
    }

    // Display sample of exported data
    console.log('📚 Sample of exported books:');
    prodBooks.slice(0, 3).forEach((book, idx) => {
      console.log(`   ${idx + 1}. "${book.title}" by ${book.authors.join(', ')}`);
    });
    if (prodBooks.length > 3) {
      console.log(`   ... and ${prodBooks.length - 3} more\n`);
    } else {
      console.log();
    }

    // Step 3: Get development user ID
    console.log('👤 Identifying development user...');
    const devUsers = await devPrisma.user.findMany({
      select: { id: true, email: true, name: true }
    });

    if (devUsers.length === 0) {
      throw new Error('No users found in development database. Please create a user first.');
    }

    let devUserId: number;

    if (targetUserId) {
      // User specified via command line
      const user = devUsers.find(u => u.id === targetUserId);
      if (!user) {
        throw new Error(`User ID ${targetUserId} not found in development database`);
      }
      devUserId = targetUserId;
      console.log(`✅ Using specified user: ${user.email} (ID: ${devUserId})\n`);
    } else if (devUsers.length === 1) {
      // Only one user, use that
      devUserId = devUsers[0].id;
      console.log(`✅ Using only available user: ${devUsers[0].email} (ID: ${devUserId})\n`);
    } else {
      // Multiple users, ask which one to use
      console.log('\n📋 Available users:');
      devUsers.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email} (${user.name || 'No name'}) - ID: ${user.id}`);
      });

      const answer = await prompt('\nEnter user number or ID to use: ');
      const selectedIdx = parseInt(answer) - 1;

      if (selectedIdx >= 0 && selectedIdx < devUsers.length) {
        devUserId = devUsers[selectedIdx].id;
      } else {
        const directId = parseInt(answer);
        const user = devUsers.find(u => u.id === directId);
        if (user) {
          devUserId = directId;
        } else {
          throw new Error('Invalid user selection');
        }
      }

      const selectedUser = devUsers.find(u => u.id === devUserId);
      console.log(`✅ Selected user: ${selectedUser?.email} (ID: ${devUserId})\n`);
    }

    // Step 4: Transform data (remap ownerId)
    console.log('🔄 Transforming data...');
    const uniqueOwnerIds = new Set(prodBooks.map(b => b.ownerId));
    console.log(`   Remapping ${uniqueOwnerIds.size} production owner ID(s) to dev user ID ${devUserId}`);

    const transformedBooks: BookData[] = prodBooks.map(book => ({
      ...book,
      ownerId: devUserId
    }));
    console.log(`✅ Transformed ${transformedBooks.length} books\n`);

    const totalBatches = Math.ceil(transformedBooks.length / BATCH_SIZE);
    console.log(`📦 Will process in ${totalBatches} batches of ${BATCH_SIZE} books each\n`);

    if (isDryRun) {
      console.log('✨ DRY RUN COMPLETE - No changes were made');
      console.log(`\nWould have imported ${transformedBooks.length} books for user ID ${devUserId} in ${totalBatches} batches`);
      return;
    }

    // Step 5: Confirm deletion of existing dev books
    const existingDevBooks = await devPrisma.book.count();

    if (existingDevBooks > 0) {
      console.log(`⚠️  WARNING: Development database currently has ${existingDevBooks} books`);
      console.log('   These will be DELETED and replaced with production data\n');

      if (!skipConfirmation) {
        const confirmation = await prompt('Type "yes" to continue: ');

        if (confirmation.toLowerCase() !== 'yes') {
          console.log('\n❌ Operation cancelled by user');
          return;
        }
      } else {
        console.log('ℹ️  Skipping confirmation (--yes flag provided)\n');
      }
      console.log();
    }

    // Step 6: Delete existing dev books
    console.log('🗑️  Deleting existing books...');
    if (existingDevBooks > 0) {
      const deleted = await devPrisma.book.deleteMany({});
      console.log(`✅ Deleted ${deleted.count} existing books\n`);
    }

    // Step 7: Import transformed books in batches
    console.log('💾 Importing data to development database...');
    console.log(`   Using batched transactions (${BATCH_SIZE} books per batch)\n`);

    let totalImported = 0;
    const errors: string[] = [];
    const startTime = Date.now();

    for (let i = 0; i < transformedBooks.length; i += BATCH_SIZE) {
      const batch = transformedBooks.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      const result = await importBatchWithRetry(
        devPrisma,
        batch,
        batchNum,
        totalBatches
      );

      if (result.error) {
        errors.push(result.error);
      } else {
        totalImported += result.imported;
      }

      // Progress reporting
      const progress = Math.round((i + batch.length) / transformedBooks.length * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   📚 Batch ${batchNum}/${totalBatches} complete (${progress}% done, ${elapsed}s elapsed)`);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const booksPerSecond = (totalImported / parseFloat(totalTime)).toFixed(1);

    console.log(`\n✅ Successfully imported ${totalImported} books in ${totalTime}s (${booksPerSecond} books/sec)`);

    if (errors.length > 0) {
      console.log(`\n❌ Encountered ${errors.length} batch errors:`);
      errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    // Step 8: Verify import
    console.log('\n🔍 Verifying import...');
    const verification = await verifyImport(
      devPrisma,
      transformedBooks.length,
      devUserId,
      transformedBooks
    );

    if (verification.success) {
      console.log('✅ Data integrity verification passed');
    } else {
      console.log('⚠️  Data integrity issues found:');
      verification.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    }

    const finalCount = await devPrisma.book.count({ where: { ownerId: devUserId } });
    console.log(`\n📊 Development database now has ${finalCount} books for user ID ${devUserId}`);

    console.log('\n' + '='.repeat(60));
    console.log('✨ SYNC COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Run the sync
syncProductionData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
