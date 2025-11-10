#!/usr/bin/env tsx

/**
 * Production to Development Data Sync Script
 *
 * This script exports book data from production, transforms user IDs to match
 * the development environment, and imports the data into the local database.
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

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipConfirmation = args.includes('--yes') || args.includes('-y');
const userIdArg = args.find(arg => arg.startsWith('--user-id='));
const targetUserId = userIdArg ? parseInt(userIdArg.split('=')[1]) : null;

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

  console.log(`✅ Production DB: ${prodEnv.DEWEY_DB_DATABASE_URL.substring(0, 50)}...`);
  console.log(`✅ Development DB: ${devEnv.DEWEY_DB_DATABASE_URL}\n`);

  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: prodEnv.DEWEY_DB_DATABASE_URL
      }
    }
  });

  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url: devEnv.DEWEY_DB_DATABASE_URL
      }
    }
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

// Main sync function
async function syncProductionData() {
  console.log('🚀 Production to Development Data Sync\n');
  console.log('=' .repeat(60) + '\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  let prodPrisma: PrismaClient | null = null;
  let devPrisma: PrismaClient | null = null;

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

    const transformedBooks = prodBooks.map(book => ({
      ...book,
      ownerId: devUserId
    }));
    console.log(`✅ Transformed ${transformedBooks.length} books\n`);

    if (isDryRun) {
      console.log('✨ DRY RUN COMPLETE - No changes were made');
      console.log(`\nWould have imported ${transformedBooks.length} books for user ID ${devUserId}`);
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

    // Step 6: Delete existing dev books and import transformed books
    console.log('💾 Importing data to development database...');

    const result = await devPrisma.$transaction(async (tx) => {
      // Delete existing books
      if (existingDevBooks > 0) {
        const deleted = await tx.book.deleteMany({});
        console.log(`   🗑️  Deleted ${deleted.count} existing books`);
      }

      // Import transformed books
      let imported = 0;
      let skipped = 0;
      const errors: Array<{ book: string; error: string }> = [];

      for (const book of transformedBooks) {
        try {
          await tx.book.create({
            data: book
          });
          imported++;

          if (imported % 10 === 0 || imported === transformedBooks.length) {
            process.stdout.write(`\r   📚 Imported ${imported}/${transformedBooks.length} books...`);
          }
        } catch (error) {
          // Handle duplicate ISBN errors gracefully
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique constraint')) {
            skipped++;
            // Don't show this in the progress, just count it
          } else {
            errors.push({
              book: `${book.title} (ISBN: ${book.isbn13})`,
              error: errorMessage
            });
          }
        }
      }

      console.log(); // New line after progress

      return { imported, skipped, errors };
    });

    console.log(`✅ Successfully imported ${result.imported} books`);

    if (result.skipped > 0) {
      console.log(`⚠️  Skipped ${result.skipped} duplicate books`);
    }

    if (result.errors.length > 0) {
      console.log(`\n❌ Encountered ${result.errors.length} errors:`);
      result.errors.forEach(({ book, error }) => {
        console.log(`   - ${book}: ${error}`);
      });
    }

    // Step 7: Verify import
    console.log('\n🔍 Verifying import...');
    const finalCount = await devPrisma.book.count({ where: { ownerId: devUserId } });
    console.log(`✅ Development database now has ${finalCount} books for user ID ${devUserId}`);

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
    // Cleanup connections
    if (prodPrisma) {
      await prodPrisma.$disconnect();
    }
    if (devPrisma) {
      await devPrisma.$disconnect();
    }
  }
}

// Run the sync
syncProductionData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
