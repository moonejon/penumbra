# Production Data Sync Script

This directory contains scripts for managing data synchronization between production and development environments.

## sync-prod-data.ts

A comprehensive script that exports book data from production, transforms user IDs to match development users, and imports the data into your local database.

### Features

- **Read-only production access**: Production database is never modified
- **User ID transformation**: Automatically remaps production owner IDs to development user IDs
- **Safety features**: Confirmation prompts and dry-run mode
- **Error handling**: Graceful handling of duplicates and other errors
- **Progress tracking**: Real-time import progress display
- **Interactive mode**: Select target user from available development users

### Prerequisites

1. **Environment files must be configured:**
   - `.env.production` - Must contain `DEWEY_DB_DATABASE_URL` for production database
   - `.env` - Must contain `DEWEY_DB_DATABASE_URL` for development database

2. **Development database must have at least one user**

3. **Dependencies installed:**
   ```bash
   npm install
   ```

### Usage

#### Basic Usage (Interactive Mode)

Run the script and follow the prompts:

```bash
npm run sync-prod-data
```

This will:
1. Export all books from production
2. Show available development users
3. Ask you to select which user should own the imported books
4. Ask for confirmation before deleting existing books
5. Import the data

#### Dry Run Mode (Recommended First)

Preview what will happen without making any changes:

```bash
npm run sync-prod-data -- --dry-run
```

Use this to:
- Verify the production database connection
- See how many books will be imported
- Confirm the target user ID
- Test the script before running it for real

#### Specify Target User

Skip the user selection prompt by providing a user ID:

```bash
npm run sync-prod-data -- --user-id=1
```

#### Skip Confirmation Prompts

Use the `--yes` flag to skip all confirmation prompts (useful for automation):

```bash
npm run sync-prod-data -- --yes --user-id=1
```

#### Combine Options

You can combine multiple flags:

```bash
# Dry run with specific user
npm run sync-prod-data -- --dry-run --user-id=1

# Auto-confirm with specific user
npm run sync-prod-data -- --yes --user-id=1
```

### What the Script Does

1. **Load Environment Variables**
   - Reads production database URL from `.env.production`
   - Reads development database URL from `.env`

2. **Export from Production**
   - Connects to production database (read-only)
   - Exports all books with their metadata
   - Displays sample of exported books

3. **Identify Development User**
   - Lists available users in development database
   - Prompts for user selection (or uses `--user-id` if provided)

4. **Transform Data**
   - Remaps all `ownerId` fields to the selected development user ID
   - Preserves all other book metadata

5. **Import to Development** (skipped in `--dry-run` mode)
   - Warns about existing books that will be deleted
   - Requests confirmation (unless `--yes` flag is used)
   - Deletes existing books in a transaction
   - Imports transformed books one by one
   - Handles duplicate ISBN errors gracefully
   - Displays progress and final statistics

### Safety Features

- **Production is read-only**: The script only reads from production, never writes
- **Confirmation required**: Asks "yes" before deleting development data
- **Dry run mode**: Preview changes without making them
- **Transaction safety**: Uses database transactions to ensure consistency
- **Error handling**: Gracefully handles duplicates and other errors
- **Progress tracking**: Shows real-time import progress

### Output Example

```
🚀 Production to Development Data Sync

============================================================

📦 Loading environment configurations...

✅ Production DB: prisma+postgres://accelerate.prisma-data.net/?api_...
✅ Development DB: postgresql://postgres:postgres@localhost:5433/penumbra_local

📥 Exporting books from production...
✅ Exported 357 books from production

📚 Sample of exported books:
   1. "Axiom's End" by Lindsay Ellis
   2. "Thirst" by Marina Yuszczuk
   3. "Recursion" by Blake Crouch
   ... and 354 more

👤 Identifying development user...
✅ Using specified user: moonejon+test1@gmail.com (ID: 1)

🔄 Transforming data...
   Remapping 1 production owner ID(s) to dev user ID 1
✅ Transformed 357 books

⚠️  WARNING: Development database currently has 42 books
   These will be DELETED and replaced with production data

Type "yes" to continue: yes

💾 Importing data to development database...
   🗑️  Deleted 42 existing books
   📚 Imported 357/357 books...
✅ Successfully imported 357 books

🔍 Verifying import...
✅ Development database now has 357 books for user ID 1

============================================================
✨ SYNC COMPLETE!
```

### Error Handling

The script handles several types of errors:

1. **Missing environment files**: Clear error message if `.env` or `.env.production` is missing
2. **Database connection errors**: Helpful error messages for connection issues
3. **No users in development**: Error if no users exist (you must create a user first)
4. **Duplicate ISBNs**: Gracefully skips duplicates and counts them
5. **Other errors**: Displays error details and continues with remaining books

### Troubleshooting

#### "Environment file not found"
- Ensure `.env.production` exists with `DEWEY_DB_DATABASE_URL`
- Ensure `.env` exists with `DEWEY_DB_DATABASE_URL`

#### "No users found in development database"
- Create a user in your development database first
- You can do this by signing up through the application

#### "User ID X not found in development database"
- Check available user IDs by running without `--user-id` flag
- Or run `npx prisma studio` to view users

#### Database connection errors
- Verify your database connection strings are correct
- Check that your local PostgreSQL is running (for development)
- For production, verify the Prisma Accelerate API key is valid

#### Script hangs or freezes
- Press Ctrl+C to cancel
- Use `--dry-run` to test without making changes
- Check database connectivity

### Development

To modify the script:

1. Edit `/Users/jonathan/github/penumbra/scripts/sync-prod-data.ts`
2. Test your changes with `--dry-run`:
   ```bash
   npm run sync-prod-data -- --dry-run --user-id=1
   ```
3. Run for real when satisfied:
   ```bash
   npm run sync-prod-data -- --user-id=1
   ```

### Best Practices

1. **Always run with `--dry-run` first** to verify what will happen
2. **Backup your development database** if you have important test data
3. **Use `--user-id`** to make the script non-interactive
4. **Check the output** to ensure the correct number of books were imported
5. **Run periodically** to keep development data fresh with production updates

### Advanced Usage

#### Running from a different directory

```bash
npm run sync-prod-data -- --dry-run
```

The script automatically uses the correct working directory.

#### Automating the sync

Create a shell script or add to your development setup scripts:

```bash
#!/bin/bash
# sync-dev-data.sh
npm run sync-prod-data -- --yes --user-id=1
```

#### CI/CD Integration

You can use this script in CI/CD to populate test databases:

```bash
npm run sync-prod-data -- --yes --user-id=${TEST_USER_ID}
```

### Security Notes

- **Never commit `.env` files** - They contain sensitive credentials
- **Production credentials are read-only** - The script only reads from production
- **Use Prisma Accelerate** for production connections (as configured)
- **Local PostgreSQL** for development is recommended

### Future Enhancements

Potential improvements for the future:

- Export to JSON file for offline sync
- Import from JSON file
- Selective sync (filter by date, author, etc.)
- Incremental sync (only new/updated books)
- Backup before sync
- Rollback capability
