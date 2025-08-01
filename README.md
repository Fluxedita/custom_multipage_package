# Premium Portfolio Website

A modern, full-featured editable wensite platform built with Next.js, Supabase, and Cloudinary.  
Instantly create, edit, update your website, live in the browser with robust security and admin controls.

## Overview

This editable website is designed for creators and professionals who want to:
- Manage content and media with a user-friendly admin dashboard
- Offer a seamless, responsive experience across all devices
- Leverage modern authentication, analytics, and security best practices

**Key Features:**
- Products Page with preview content for all visitors
- About page with rich personal information
- Responsive design for mobile, tablet, and desktop
- Powerful admin controls for content, media, and media management
- Real-time updates and analytics
- Legal docs: Cookies, Terms, Privacy pages


---

## Features & Architecture

### Dynamic Content Management
- Create, edit, and organize pages and sections (public, premium, and custom)
- Rich text and media support
- Real-time updates for content and media
- Customizable pages and sections with rich text editing
- Intuitive media management with Cloudinary optimization
- Create premium member-exclusive content areas

### Media Optimization
- Seamless Cloudinary integration for images and videos
- Responsive, optimized media delivery
- Automatic format conversion and lazy loading
- Efficient bandwidth usage

### Public & Admin Access Control
- Public, member, and admin content areas (can be extended to premium routes, fully scalable database)
- Secure authentication and authorization with Supabase
- Robust Row Level Security (RLS) for all sensitive data
- Admin-only features and regular security reviews

### Admin Dashboard
- Manage content, media, and site settings
- Analytics and activity tracking

### Comments System (optional Integration)
- Public and member comments with moderation tools
- Real-time updates and notifications

### Analytics & Tracking
- Page view and user interaction analytics
- Media engagement and premium content access tracking
- Performance metrics

### Security
- Comprehensive RLS policies (see `supabase/combined_rls_policies.sql`)
- Password validation and audit trails
- Admin-only features and regular security reviews

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Hooks & Context
- **Media Storage & Optimization:** Cloudinary
- **Authentication & Database:** Supabase (with RLS)
- **Animations:** Framer Motion
- **Icons:** Lucide Icons
- **Notifications:** Sonner
- **Testing:** (add your testing framework if used)
- **CI/CD:** (add your CI/CD tool if used)

---

## Application Architecture & Patterns

### Page Structure Pattern

The application follows a consistent architecture pattern for all major pages:

```
app/
├── page.tsx                    # Server component (page definition)
└── PageClient.tsx              # Client component (complex logic)
```

**Benefits:**
- **Separation of Concerns**: Page definitions vs. complex logic
- **Performance**: Server-side rendering with client-side interactivity
- **Maintainability**: Easier to work with and modify components
- **Consistency**: All pages follow the same pattern

**Example Structure:**
```tsx
// app/page.tsx (Server Component)
import { Suspense } from 'react';
import HomePageClient from './HomePageClient';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageClient />
    </Suspense>
  );
}
```

```tsx
// app/HomePageClient.tsx (Client Component)
'use client'
import { useState, useEffect } from 'react'
// ... complex logic, state management, handlers

export default function HomePageClient() {
  // All the complex logic here
  return (
    <main>
      {/* Page content */}
    </main>
  )
}
```

### Authentication Flow

The application uses Supabase Auth with a robust authentication system:

We are using Supabase for authentication and have a 
getAdminSession
 function that checks for admin status.

#### 1. **Authentication Provider**
- Manages user session state
- Provides authentication context
- Handles login/logout flows
- Integrates with Supabase Auth

#### 2. **Protected Routes**
- **Public Routes**: Home, Products, About, Contact, Terms, Privacy, cookies
- **Admin Routes**: Admin dashboard, Media management

#### 3. **Authentication Hooks**
- `useAuth()`: Provides user state and auth methods via context
- Automatic session management
- Redirect handling for protected routes

#### 4. **Row Level Security (RLS)**
- Database-level security policies
- User-specific data access
- Premium content protection (scalable process, pr-built into your Supabase table structure)
- Admin-only operations

### Supabase Client Usage (**Important**)

All client-side code must use the shared Supabase client instance:

```js
import supabase from '@/lib/supabase/client'
```

**Do not** use `createBrowserSupabaseClient`, `createClientComponentClient`, or any custom client creation in the browser.  
This ensures correct session handling and avoids issues with authentication and RLS.

If you see a warning about "Multiple GoTrueClient instances," check your imports and ensure only the shared client is used.

---

## API Routes Organization

API routes are organized by feature under `app/api/` (auth, gallery, media, pages, etc.).

---

## State Management

- **Local State:** React hooks (`useState`, `useEffect`)
- **Global State:** Context API for auth state, custom hooks for shared logic
- **Server State:** Server actions for mutations, API routes for data fetching, Supabase client for database operations

---

## Media Management

- **Cloudinary Integration:** Automatic image optimization, responsive delivery, video processing
- **Media Workflow:**
  1. **Upload:** Client → Cloudinary → Supabase
  2. **Storage:** Cloudinary CDN + Supabase metadata
  3. **Delivery:** Optimized images via Cloudinary
  4. **Management:** Admin interface for organization

---

## Database Schema & Security

- **Core Tables:** users, profiles, pages, media, subscriptions, analytics
- **Security Policies:** RLS enabled on all tables, user-specific data access, premium content protection, admin-only operations

---

## Error Handling & User Experience

- **Client-Side:** Toast notifications (Sonner), error boundaries, graceful fallbacks
- **Server-Side:** API route error handling, database error management, authentication error handling
- **UX:** Loading states, error messages, retry mechanisms

---

## Getting Started

### 1. **Clone the Repository**
```bash
git clone [repository-url]
cd fluxedita_custom_website_package
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Setup**
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env.local
```
Edit `.env.local` and set the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# (Add any other required variables for your setup, please see the default env.example file. Rename this to env.local and add your personal details. Please see the fluxedita installation video if you run into dificulties.
```

### 4. **Start the Development Server**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Supabase Database Setup

For full details, see [`supabase/SETUP_README.md`](./supabase/SETUP_README.md).

**Quick Start (Local Development):**
```bash
# 1. Start Supabase locally
supabase start

# 2. Run main initialization script
supabase db reset

# 3. Apply RLS policies
psql -h localhost -U postgres -d your_database -f supabase/combined_rls_policies.sql

# 4. Create first user and promote to admin
#    (See supabase/FIRST_USER_SETUP.md)
```

- The first user should be created via the Supabase Auth Dashboard or your app's sign-up flow.
- After user creation, promote to admin using the SQL in FIRST_USER_SETUP.md or promote_to_admin.sql.

**Production setup:**  
Follow the same steps, but connect to your production database.

---

## Seeding Initial Data

If you need to seed the database with homepage and essential pages, use the provided script:

```bash
node scripts/init-homepage-data.js
```
- This script creates the homepage and other essential pages with default content.
- You can re-run this script after a fresh database setup or when adding new core pages.

## Available Scripts

The project includes several utility scripts for common tasks.  
**Note:** For core database setup and security, always use the SQL scripts in `supabase/` as described above.

```bash
# Seed the database with homepage and essential pages
node scripts/init-homepage-data.js

# Create a new admin user (alternative to SQL-based admin creation)
node scripts/create-admin-user.js

# Check gallery setup
node scripts/check-gallery-setup.js

# Create a backup of the database
./scripts/backup.sh
```

**Other scripts:**
- `scripts/setup-gallery-sections.js` — Sets up gallery sections and policies
- `scripts/check-gallery-setup.js` — Verifies gallery setup is correct
- `scripts/clean-uploads.js` — Cleans up unused uploads

> **Tip:** For all critical database structure, RLS, and admin setup, use the SQL scripts in `supabase/` for consistency and security.

---

## Database Migrations

#### What are Migrations?
Migrations are version-controlled scripts that track changes to your database schema.  
They help you:
- Keep development and production databases in sync
- Safely evolve your schema over time
- Share changes with your team

#### Migration Workflow

1. **First Time Setup**
   ```bash
   # This will create your local database and apply all migrations
   npx supabase db reset
   ```

2. **After Pulling New Changes**
   ```bash
   # If you see new migration files, run:
   npx supabase db push
   ```

3. **Creating a New Migration**
   ```bash
   npx supabase migration new your_migration_name
   ```

4. **Testing Your Changes**
   ```bash
   npx supabase db reset
   ```

#### Our Migration Files

- The main schema and RLS are managed in:
  - `supabase/supabase_first_init_script.sql`
  - `supabase/combined_rls_policies.sql`
  - `supabase/FIRST_USER_SETUP.md` (guide for first user and admin creation)
- Additional migrations are in `supabase/migrations/` and should be used for incremental changes.

#### Best Practices

- Test migrations locally before pushing to production
- Keep migration files in version control
- Never modify existing migration files after they've been applied
- Always back up your database before running new migrations

#### Troubleshooting

- **Migration failed?**
  ```bash
  npx supabase migration list
  ```
- **Database out of sync?**
  ```bash
  npx supabase db reset
  ```
- **Check database structure**
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  ```

## Backup & Recovery

### Regular Backups

The project includes an automated backup script for the Supabase database:

```bash
./scripts/backup.sh
```

- Backups are stored in the `./backups` directory with timestamps for easy tracking.
- It is recommended to run this script before applying new migrations or making major changes.

### Disaster Recovery

A comprehensive disaster recovery plan is available in [`docs/disaster_recovery_plan.md`](./docs/disaster_recovery_plan.md), covering:
- Backup procedures and schedules
- Step-by-step recovery process
- Testing and verification steps
- Documentation requirements
- Emergency contact procedures

---

## Project Structure

The project is organized for clarity and maintainability:

```
premium_portfolio/
├── app/                    # Next.js 14 App Router pages and features
│   ├── about/              # About page
│   ├── actions/            # Server actions
│   ├── admin/              # Admin dashboard & member management
│   ├── api/                # API routes (grouped by feature)
│   ├── auth/               # Authentication pages
│   ├── contact/            # Contact page
│   ├── cookies/            # Cookie policy page
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   ├── media/              # Media management
│   ├── members/            # Member area
│   ├── privacy/            # Privacy policy page
│   ├── product/            # Default products page
│   ├── subscription/       # Subscription management
│   └── terms/              # Terms of service
├── components/             # React reusable components
├── lib/                    # Utility functions & service clients
├── public/                 # Static assets
├── scripts/                # Utility scripts (seeding, backup, admin, etc.)
├── supabase/               # Supabase configuration, SQL scripts, migrations
│   └── migrations/         # Database migrations
├── docs/                   # Documentation (disaster recovery, guides, etc.)
```

**Notes:**
- Root Pages (like `/home`, `/products`, `/about`) use `root_page_components`.
- Custom Pages (user-created pages) use the `custom_pages` table.
- The `/api/pages/list` route only shows custom pages from the `custom_pages` table, not root pages. Root pages show in the standard nav menu links.

## Environment Variables

Required environment variables for development:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Security & Best Practices

- **Row Level Security (RLS):** All sensitive tables are protected by RLS, with policies managed in `supabase/combined_rls_policies.sql`.
- **Admin User Management:** Admin users are created and verified via the SQL scripts in `supabase/` or via secure admin scripts. Always use strong, unique passwords and change them after first login.
- **Environment Variables:** Never commit secrets or credentials to version control. Use `.env.local` for local development and environment variables for production.
- **Backups:** Run `./scripts/backup.sh` before major changes or migrations. Store backups securely.
- **Disaster Recovery:** Follow the plan in `docs/disaster_recovery_plan.md` for backup and restore procedures.
- **Code Reviews:** All changes should be reviewed via Pull Requests. Use the security checklist in `supabase/SETUP_README.md` after major updates.
- **Regular Audits:** Periodically review RLS policies, admin access, and database logs for unusual activity.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Best Practices:**
- Write clear, descriptive commit messages
- Add or update documentation as needed
- Test your changes locally before submitting
- Reference related issues or discussions in your PR

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support and assistance:
- Open an issue in the GitHub repository
- Contact the development team at support@your-domain.com
- Check our [documentation](https://your-docs-url) for detailed guides

**Note:** This project is actively maintained. For the latest updates and features, please check the [releases page](https://github.com/your-username/premium-portfolio/releases).

## Admin User Management

### Creating a New Admin User

If you need to create a new admin user for the application, you can use the following script. This script will:
1. Create a new user in Supabase Auth
2. Set that user as the application administrator

**Step 1: Create the script file**

Create a new file at `scripts/create-new-admin.js` with the following content:

```javascript
const { createClient } = require('@supabase/supabase-js');

// --- Configuration ---
const newAdminEmail = 'your-new-admin@example.com';  // Change this to your desired email
const newAdminPassword = 'your-secure-password';     // Change this to your desired password

// --- Supabase Credentials ---
const supabaseUrl = 'https://kohpccphgpdzcawxmviu.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvaHBjY3BoZ3BkemNhd3htdml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY3OTQwNSwiZXhwIjoyMDY0MjU1NDA1fQ.WH6SZjzGp14dgveicznlN6YR6zd_0yRXtNamkoWQkS0';

// --- Script Logic ---
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createNewAdmin() {
  console.log(`--- Step 1: Creating user for ${newAdminEmail}... ---`);

  // Step 1: Create the user in Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: newAdminEmail,
    password: newAdminPassword,
    email_confirm: true, // Auto-confirm the email so they can log in immediately
  });

  if (userError) {
    // Check if the error is because the user already exists
    if (userError.message.includes('User already registered')) {
      console.log(`User ${newAdminEmail} already exists. Skipping creation.`);
    } else {
      console.error('Error creating user:', userError.message);
      console.error('Aborting script.');
      return;
    }
  } else {
    console.log(`✅ User ${userData.user.email} created successfully.`);
  }

  console.log(`--- Step 2: Setting ${newAdminEmail} as the application admin... ---`);

  // Step 2: Set this new user as the admin in the app_settings table
  const { error: settingsError } = await supabase
    .from('app_settings')
    .upsert({ key: 'admin_email', value: newAdminEmail }, { onConflict: 'key' });

  if (settingsError) {
    console.error('Error updating admin email setting:', settingsError.message);
  } else {
    console.log('✅ Admin email setting updated successfully.');
  }

  console.log('---');
  console.log('🚀 All done! You can now log in with the new admin account.');
  console.log(`   Email: ${newAdminEmail}`);
  console.log(`   Password: ${newAdminPassword}`);
  console.log('---');
  console.log('SECURITY WARNING: Please delete this script file now.');
  console.log('---');
}

createNewAdmin();
```

**Step 2: Update the configuration**

Before running the script, make sure to update these variables at the top of the script:
- `newAdminEmail`: Set to the email address you want to use for the admin account
- `newAdminPassword`: Set to a secure password for the admin account

**Step 3: Run the script**

```bash
node scripts/create-new-admin.js
```

**Step 4: Clean up (IMPORTANT)**

After the script runs successfully, **delete the script file** to remove the hardcoded credentials:

```bash
rm scripts/create-new-admin.js
```

### Verify User by user ID

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = '178a0c11-d11e-462a-8c64-441534e5b774';

### Important Security Notes

- **Use strong passwords**: The admin account has full access to the application
- **Delete the script**: Always remove the script file after use to prevent credential exposure
- **Change passwords**: Consider changing the admin password after first login
- **Limit access**: Only create admin accounts for trusted users who need administrative access

### Troubleshooting

- **User already exists**: The script will skip creation if the email is already registered
- **Database errors**: Ensure your Supabase credentials are correct and the service has proper permissions
- **Login issues**: Make sure the `app_settings` table exists and has the correct structure

## Key Component Guide

To help future developers, here's a guide to some of the most important components and their roles in the application.

### Members Management Components

There are several components for managing and displaying members, each with a specific purpose and location:

#### 1. `MembersManager.tsx`
- **Purpose:** Main, feature-rich component for managing members (table, search, filters, add member, etc.)
- **Location:** Displayed on the main `/members` page for administrators.
- **Data Source:** Fetches live user data from Supabase via the `getMembers` server action.
- **File Path:** `components/admin/MembersManager.tsx`

#### 2. `NewMembersTable.tsx`
- **Purpose:** Displays the members table in the admin dashboard, with search and update features.
- **Location:** `/admin/members` page for administrators.
- **Data Source:** Fetches live user data from Supabase via the `getMembers` server action.
- **File Path:** `components/admin/NewMembersTable.tsx`

#### 3. `PublicMembersList.tsx`
- **Purpose:** Displays the members table for users (public/member view).
- **Location:** `/members` page for users.
- **Data Source:** Fetches member data using the `getMembers` function from `@/app/actions/members`.
- **File Path:** `components/members/PublicMembersList.tsx`

#### 4. `MembersPageClient.tsx`
- **Purpose:** Renders the testimonials carousel on the `/members` page (not the main members data table).
- **Data Source:** Uses a hardcoded array of testimonial objects.
- **File Path:** `app/members/MembersPageClient.tsx`

---

### Comments System

#### Overview
- **Database:** Comments table with relationships to profiles, RLS policies, indexes, and triggers for timestamps.
- **Admin Management:** `/admin/comments` page with full CRUD, moderation tools, and summary dashboard.
- **Public Component:** `CommentsSection` component for any page, with authentication required for posting.
- **API Endpoints:** `/api/comments` for fetching and creating comments, with proper authentication and validation.

#### Key Features
- **For Members:**
  - Post comments (authenticated users only)
  - View approved comments with user avatars
  - Click avatars to visit user profiles
  - Real-time character counter and validation
- **For Admins:**
  - View all comments (approved, flagged, pending)
  - Approve/flag/edit/delete comments
  - Summary statistics dashboard
  - User profile links for easy navigation
- **Security & Performance:**
  - Row-Level Security (RLS) policies
  - Proper database indexes
  - Input validation and sanitization
  - Rate limiting considerations
  - Optimized queries with joins#   c u s t o m _ m u l t i p a g e _ p a c k a g e  
 #   c u s t o m _ m u l t i p a g e _ p a c k a g e  
 #   c u s t o m _ m u l t i p a g e _ p a c k a g e  
 #   c u s t o m _ m u l t i p a g e _ p a c k a g e  
 