# Penumbra

> A personal library showcase built to transform your book collection into a beautiful, shareable portfolio

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

---

## Overview

**Penumbra** is a modern web application that turns your personal book collection into an elegant, curated digital library. Designed for book lovers who want to share their reading journey, Penumbra provides a public portfolio view with rich customization options for authenticated users.

Whether you're showcasing your favorite reads, organizing books into themed reading lists, or simply maintaining a personal catalog, Penumbra offers a beautiful, minimalist interface that puts your books front and center.

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/home-desktop.gif" alt="Home Screen - Desktop" width="600"/></td>
<td><img src="./docs/assets/home-mobile.gif" alt="Home Screen - Mobile" width="280"/></td>
</tr>
</table>

---

## Features

### For Everyone (Public View)

#### Discoverable Library Showcase
Browse beautiful book collections curated by library owners. Each home screen displays:

- **Custom Profile** - Owner's bio, social media links, and personalized branding
- **Favorite Books** - Hand-picked highlights with temporal filtering (by year read)
- **Curated Reading Lists** - Themed collections with custom titles and descriptions
- **Clean, Modern UI** - Dark theme with responsive design for all devices

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/public-library-desktop.png" alt="Public Library - Desktop" width="600"/></td>
<td><img src="./docs/assets/public-library-mobile.png" alt="Public Library - Mobile" width="280"/></td>
</tr>
</table>

### For Authenticated Users

#### Complete Library Management

<details>
<summary><strong>Book Import & Cataloging</strong></summary>

- **ISBN-Based Import** - Search by ISBN-10 or ISBN-13 to auto-populate book metadata
- **Batch Import Queue** - Add multiple books in one session with visual queue management
- **Rich Metadata** - Automatic retrieval of covers, synopses, authors, subjects, and publication details
- **Visibility Controls** - Set books as PUBLIC, PRIVATE, UNLISTED, or FRIENDS-only

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/book-import-desktop.gif" alt="Book Import - Desktop" width="500"/></td>
<td><img src="./docs/assets/book-import-mobile.gif" alt="Book Import - Mobile" width="240"/></td>
</tr>
</table>

</details>

<details>
<summary><strong>Reading Lists & Favorites</strong></summary>

- **Custom Reading Lists** - Create unlimited themed collections with custom titles and descriptions
- **Drag-and-Drop Ordering** - Arrange books within lists with intuitive reordering
- **Per-Book Notes** - Add context or annotations to books within specific lists
- **Favorites System** - Curate up to 5-6 favorite books (all-time or by year)
- **Visibility Management** - Control which lists are public vs. private

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/reading-lists-desktop.png" alt="Reading Lists - Desktop" width="500"/></td>
<td><img src="./docs/assets/reading-lists-mobile.png" alt="Reading Lists - Mobile" width="240"/></td>
</tr>
</table>

</details>

<details>
<summary><strong>Personal Customization</strong></summary>

- **Profile Picture Upload** - Upload custom profile images via Vercel Blob storage
- **Bio & Social Links** - Add personal bio text and links to GitHub, Instagram, LinkedIn, Letterboxd, and Spotify
- **Read Date Tracking** - Track when you read each book for temporal filtering
- **Year-Based Filtering** - View favorites by specific years (e.g., "Favorite Books I Read in 2024")

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/profile-desktop.gif" alt="Profile Customization - Desktop" width="500"/></td>
<td><img src="./docs/assets/profile-mobile.gif" alt="Profile Customization - Mobile" width="240"/></td>
</tr>
</table>

</details>

<details>
<summary><strong>Library Views</strong></summary>

- **Grid View** - Visual browsing with book covers (responsive grid: 2-6 columns)
- **List View** - Detailed table with titles, authors, subjects, and page counts
- **Search & Filter** - Search by title, author, or subject across your entire collection
- **Pagination** - Configurable page sizes (25, 50, 100 items)

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/library-desktop.png" alt="Library View - Desktop" width="500"/></td>
<td><img src="./docs/assets/library-mobile.png" alt="Library View - Mobile" width="240"/></td>
</tr>
</table>

</details>

### For Administrators

<details>
<summary><strong>Admin Settings</strong></summary>

- **Default User Configuration** - Set which user's library appears on the public home page
- **User Management** - View all registered users and their Clerk IDs
- **App Settings** - Configure application-wide defaults stored in the database

<table>
<tr>
<td align="center"><strong>Desktop</strong></td>
<td align="center"><strong>Mobile</strong></td>
</tr>
<tr>
<td><img src="./docs/assets/admin-desktop.png" alt="Admin Settings - Desktop" width="500"/></td>
<td><img src="./docs/assets/admin-mobile.png" alt="Admin Settings - Mobile" width="240"/></td>
</tr>
</table>

</details>

---

## Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router, Server Components, and Server Actions
- **[React 19](https://react.dev/)** - Latest React with enhanced server components
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Strict mode enabled for type safety
- **[Tailwind CSS 4.1](https://tailwindcss.com/)** - Utility-first CSS with custom dark theme
- **[Lucide React](https://lucide.dev/)** - Icon library for consistent iconography
- **[Motion](https://motion.dev/)** - Animation library for smooth interactions
- **[React Hook Form](https://react-hook-form.com/)** - Forms with validation

### Backend
- **[Prisma 6.8](https://www.prisma.io/)** - Type-safe ORM with PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database for data persistence
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** - File storage for profile images and custom uploads

### Infrastructure
- **[Vercel](https://vercel.com/)** - Deployment platform with edge functions
- **[Prisma Accelerate](https://www.prisma.io/accelerate)** - Database connection pooling and caching
- **[Svix](https://www.svix.com/)** - Webhook management for Clerk integrations

### Developer Experience
- **[ESLint](https://eslint.org/)** - Linting with Next.js and TypeScript rules
- **[Turbopack](https://turbo.build/)** - Fast development builds
- **[TypeScript ESLint](https://typescript-eslint.io/)** - Enhanced TypeScript linting

---

## Getting Started

### Prerequisites

- **Node.js 20+** (check `.node-version` for exact version)
- **PostgreSQL database** (local or hosted)
- **Clerk account** for authentication
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd penumbra/.conductor/lome
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file with the following variables:
   ```env
   # Database
   DEWEY_DB_DATABASE_URL="postgresql://user:password@localhost:5432/penumbra"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

   # Vercel Blob (optional, for file uploads)
   BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"

   # Default User (optional, for public home page)
   DEFAULT_USER_ID="1"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed with sample data
   npm run sync-prod-data -- --user-id=1
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Sync production data to development (with dry-run)
npm run sync-prod-data:dry-run -- --user-id=1

# Sync production data to development
npm run sync-prod-data -- --user-id=1
```

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Syncing Production Data

Penumbra includes a powerful data sync script for populating your local development database with production book data:

```bash
# Preview what will be synced (recommended first)
npm run sync-prod-data -- --dry-run --user-id=1

# Sync production data to development
npm run sync-prod-data -- --user-id=1
```

This script will:
- Export all books from the production database
- Transform owner IDs to match your development user
- Replace all books in your local database with production data

See [scripts/README.md](scripts/README.md) for detailed documentation and all available options.

---

## Project Structure

```
penumbra/.conductor/lome/
├── prisma/
│   └── schema.prisma          # Database schema with Prisma ORM
├── public/
│   └── assets/                # Static assets (images, fonts)
├── scripts/
│   └── sync-prod-data.ts      # Production data sync utility
├── src/
│   ├── app/
│   │   ├── admin/             # Admin pages (settings)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── home/          # Home screen components
│   │   │   ├── library/       # Library view components
│   │   │   └── reading-list-detail/
│   │   ├── dashboard/         # Dashboard page
│   │   ├── import/            # Book import interface
│   │   ├── library/           # Library browsing
│   │   ├── reading-lists/     # Reading list details
│   │   ├── sign-in/           # Authentication pages
│   │   ├── sign-up/
│   │   ├── layout.tsx         # Root layout with navigation
│   │   └── page.tsx           # Home page
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   ├── utils/
│   │   ├── actions/           # Server Actions for data fetching
│   │   │   ├── admin-settings.ts
│   │   │   ├── books.ts
│   │   │   ├── home-page.ts
│   │   │   ├── profile.ts
│   │   │   └── reading-lists.ts
│   │   └── permissions.ts     # Authorization utilities
│   └── shared.types.ts        # Shared TypeScript types
├── docs/                      # Documentation
├── .claude/                   # Claude AI agent configurations
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Key Concepts

### Authentication & Authorization

Penumbra uses **Clerk** for authentication with role-based access:

- **Public Users**: Can view public libraries, reading lists, and favorite books
- **Authenticated Users**: Can manage their own library, create reading lists, and customize their profile
- **Admin Users**: Can access admin settings to configure the default public user

### Dual-Mode Home Page

The home page (`/`) adapts based on authentication:

- **Unauthenticated**: Shows the default user's public library (configured in admin settings)
- **Authenticated**: Shows the current user's library with full editing capabilities
- **Owner View**: Users see empty placeholders, "Add Favorite" buttons, and edit controls
- **Visitor View**: Users see only filled content with a clean, read-only interface

### Reading Lists & Favorites

Penumbra distinguishes between:

- **Reading Lists**: Unlimited custom collections with titles, descriptions, and ordering
- **Favorites (All Time)**: Special list type limited to 5-6 books
- **Favorites (By Year)**: Year-specific favorites based on `readDate` field

### Book Visibility

Each book has a visibility setting:
- `PUBLIC`: Visible to everyone
- `PRIVATE`: Only visible to owner
- `FRIENDS`: Future feature for friend-based sharing
- `UNLISTED`: Future feature for direct-link access only

---

## Database Schema

Penumbra uses PostgreSQL with Prisma ORM. Key models:

### Core Models
- **User**: Profile, social links, authentication (Clerk ID)
- **Book**: Full metadata, ISBN, cover images, visibility, read date
- **ReadingList**: Custom collections with type, visibility, and year filtering
- **BookInReadingList**: Junction table for many-to-many with ordering and notes
- **AppSettings**: Singleton for app-wide configuration (default user, etc.)

### Enums
- **BookVisibility**: `PRIVATE | PUBLIC | FRIENDS | UNLISTED`
- **ReadingListVisibility**: `PRIVATE | PUBLIC | FRIENDS | UNLISTED`
- **ReadingListType**: `STANDARD | FAVORITES_YEAR | FAVORITES_ALL`

For detailed schema documentation, see [docs/features/reading-lists/DATABASE_SCHEMA.md](docs/features/reading-lists/DATABASE_SCHEMA.md)

---

## API Documentation

Penumbra uses **Next.js Server Actions** for type-safe API calls. Key action files:

- **`books.ts`**: Book CRUD operations, search, filtering, pagination
- **`reading-lists.ts`**: Reading list management, favorites operations
- **`profile.ts`**: Profile updates, social links, image uploads
- **`home-page.ts`**: Unified home page data fetching
- **`admin-settings.ts`**: Admin-only operations

For detailed API documentation, see [docs/features/reading-lists/API_ENDPOINTS.md](docs/features/reading-lists/API_ENDPOINTS.md)

---

## Deployment

### Deploying to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Import your repository
   - Set root directory to `.conductor/lome`

3. **Configure Environment Variables**

   Add all variables from `.env.local` in Vercel dashboard:
   - Database connection strings
   - Clerk authentication keys
   - Vercel Blob token
   - Default user ID

4. **Deploy**

   Vercel will automatically deploy on push to main branch

### Database Migrations in Production

```bash
# Set production database URL
export DATABASE_URL="postgresql://..."

# Apply migrations
npx prisma migrate deploy

# Verify deployment
npx prisma migrate status
```

---

## Roadmap

Future enhancements planned for Penumbra:

- [ ] **Reading Progress Tracking** - Track current page and completion status
- [ ] **List Collaboration** - Share and co-manage reading lists
- [ ] **Social Features** - Follow users, like books, comment on lists
- [ ] **Advanced Search** - Full-text search with filters for genre, publication date, etc.
- [ ] **Reading Statistics** - Visualizations of reading habits, velocity, genre distribution
- [ ] **Mobile Apps** - Native iOS/Android apps for on-the-go library access
- [ ] **Import/Export** - Import from Goodreads, export to various formats
- [ ] **Book Recommendations** - AI-powered suggestions based on your library

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Use TypeScript strict mode (no `any` types)
- Write meaningful commit messages (conventional commits format)
- Test locally before submitting PR
- Update documentation for new features

---

## License

This project is private and proprietary. All rights reserved.

---

## Acknowledgments

- **Next.js Team** - For an incredible React framework
- **Prisma** - For making database work enjoyable
- **Clerk** - For seamless authentication
- **Vercel** - For world-class deployment infrastructure
- **OpenLibrary API** - For book metadata

---

## Support

For questions, issues, or feature requests:

- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review design specifications in `/design-specs`

---

**Built with care for book lovers everywhere.**
