#!/usr/bin/env tsx

/**
 * Quick script to check users in development database
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  });

  return env;
}

async function checkUsers() {
  const devEnv = loadEnv('.env');

  if (!devEnv.DEWEY_DB_DATABASE_URL) {
    throw new Error('DEWEY_DB_DATABASE_URL not found in .env');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: devEnv.DEWEY_DB_DATABASE_URL
      }
    }
  });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        clerkId: true,
        _count: {
          select: {
            books: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log('\n📋 Users in Development Database:\n');
    console.log('=' .repeat(80));

    if (users.length === 0) {
      console.log('⚠️  No users found in development database');
    } else {
      users.forEach(user => {
        console.log(`\n👤 User ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name || '(not set)'}`);
        console.log(`   Clerk ID: ${user.clerkId}`);
        console.log(`   Books: ${user._count.books}`);
      });
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
