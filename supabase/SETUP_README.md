# 🚀 Supabase Database Setup Guide

This guide explains how to set up your Supabase database for the portfolio application using the latest, modular workflow.

## 📁 File Structure

```
supabase/
├── supabase_first_init_script.sql   # Main database setup (tables, functions, default data)
├── combined_rls_policies.sql        # All RLS policies (linter-compliant, idempotent)
├── FIRST_USER_SETUP.md              # Guide for first user and admin creation
└── SETUP_README.md                  # This documentation
```

## 🎯 Setup Process (3 Steps)

### Step 1: Run Main Initialization Script

First, run the main initialization script to set up all database tables, functions, triggers, and default data:

```bash
# Using Supabase CLI (recommended for local dev)
supabase db reset

# Or using psql directly
psql -h localhost -U postgres -d your_database -f supabase/supabase_first_init_script.sql
```

This script creates:
- All database tables (profiles, comments, media, subscriptions, etc.)
- Indexes for performance
- Functions and triggers
- Default subscription plans
- Default root page components

**Note:** This script does NOT include RLS policies. Policies are managed separately for easier updates and linter compliance.

### Step 2: Run RLS Policy Script

After the main initialization, run the RLS policy script to apply all Row Level Security (RLS) policies:

```bash
# Using psql
dbname=your_database
psql -h localhost -U postgres -d $dbname -f supabase/combined_rls_policies.sql
```

- This script is the source of truth for all RLS policies.
- It is fully idempotent and linter-compliant (one permissive policy per action/role/table).
- Update this file whenever you change security policies.

### Step 3: Create First User and Promote to Admin

Follow the instructions in `supabase/FIRST_USER_SETUP.md` to:
- Create your first user via the Supabase Auth Dashboard or API
- Promote the user to admin using the provided SQL or `promote_to_admin.sql`

**Note:** Do NOT create users directly via SQL. Always use the Auth system for secure user creation.

## 🔧 Environment-Specific Setup

### Local Development

```bash
# 1. Start Supabase locally
supabase start

# 2. Run initialization
supabase db reset

# 3. Apply RLS policies
psql -h localhost -U postgres -d your_database -f supabase/combined_rls_policies.sql

# 4. Create first user and promote to admin
#    (See supabase/FIRST_USER_SETUP.md)
```

### Production

```bash
# 1. Run initialization
psql -h localhost -U postgres -d your_database -f supabase/supabase_first_init_script.sql

# 2. Apply RLS policies
psql -h localhost -U postgres -d your_database -f supabase/combined_rls_policies.sql

# 3. Create first user and promote to admin
#    (See supabase/FIRST_USER_SETUP.md)
```

## 📊 Database Schema Overview

### Core Tables:

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User profiles | Membership types, bio, avatar, profile media |
| `comments` | User comments | Moderation, flagging, page-specific |
| `membership_history` | Audit trail | Track membership changes |
| `custom_pages` | Dynamic pages | JSONB content, SEO fields |
| `page_content` | Page sections | Modular content blocks |
| `root_page_components` | System pages | Home, about, contact, gallery, members |
| `gallery_data` | Gallery items | Media sets, categories |
| `media_items` | Media files | Images, videos, metadata |
| `subscriptions` | User subscriptions | Stripe integration ready |
| `billing_history` | Payment history | Invoice tracking |
| `subscription_plans` | Available plans | Free, premium, VIP tiers |
| `app_settings` | Site config | Key-value settings |

### Security Features:
- ✅ **Row Level Security (RLS)** enabled on all tables (applied via combined_rls_policies.sql)
- ✅ **Comprehensive, linter-compliant policies** for users and admins
- ✅ **Password validation** function
- ✅ **Audit trails** for membership changes
- ✅ **Function security** with proper search paths
- ✅ **Comment moderation** with approval and flagging

### Functions:
- `handle_new_user()` - Auto-create profiles
- `handle_updated_at()` - Auto-update timestamps
- `update_membership()` - Secure membership changes
- `validate_password_strength()` - Password requirements
- `log_password_change_attempt()` - Security monitoring
- `create_admin_user()` - Secure admin creation (auto-verifies email)
- `get_root_page_components()` - System page data
- `update_root_page_component()` - Admin page management

## 🔗 API Access & Role-Based Control

All API endpoints in this project are protected by robust Role-Based Access Control (RBAC) and Supabase Row Level Security (RLS) policies. The API routes are grouped by feature and mapped to user roles as follows:

| Route Example                          | Access Level   | Notes                                  |
|----------------------------------------|---------------|----------------------------------------|
| `/api/gallery`, `/api/gallery/[id]`    | Public        | Public gallery data                     |
| `/api/pages/[slug]/content`            | Public/Auth   | Public or member page content           |
| `/api/media/list`, `/api/media/upload` | Auth          | Requires user to be logged in           |
| `/api/admin/*`                         | Admin         | Requires admin role (see RLS policies)  |
| `/api/exclusive/*`, `/api/behind-scenes/*` | Premium   | Requires premium membership             |
| `/api/webhooks/stripe`                 | Stripe Only   | Requires Stripe secret, returns 501 if not configured |

- **RBAC is enforced both at the API route level (via server-side role checks) and at the database level (via RLS policies).**
- For a full, up-to-date API route table, see the main `README.md` in the project root.

### How Roles Map to API Access
- **Public:** No authentication required (e.g., gallery, about, contact)
- **Auth:** Any logged-in user (e.g., media upload, profile)
- **Premium:** Users with a premium membership (e.g., exclusive content)
- **Admin:** Users with the admin role (e.g., admin dashboard, content management)

### Troubleshooting RBAC/API Issues
- If you receive `{"error":"Unauthorized"}` from an API route, ensure your user has the correct role and is logged in.
- Use `/api/auth/me` to check your current user and role.
- Check the `profiles` table in Supabase to verify your `membership_type` or `role`.
- All sensitive actions are double-protected by RLS and server-side role checks.
- If you update RLS policies, re-run `combined_rls_policies.sql` and test access.

## 🔐 Security Considerations

### Admin User Security
- Use a strong, unique password
- Change the password immediately after first login
- Keep admin credentials secure
- Consider using environment variables for production

### Database Security
- All tables have Row Level Security (RLS) enabled (see combined_rls_policies.sql)
- Admin functions require service role access
- User data is properly isolated
- Audit trails are maintained for membership changes

## 🧹 Cleanup & Best Practices

### Files to Keep:
- ✅ `supabase_first_init_script.sql` - Main database setup
- ✅ `combined_rls_policies.sql` - All RLS policies
- ✅ `FIRST_USER_SETUP.md` - First user and admin creation guide
- ✅ `SETUP_README.md` - This documentation
- ✅ `scripts/backup.sh` - Important for backups

### Files Removed:
- ❌ Old migration files (archived)
- ❌ One-time fix scripts (no longer needed)
- ❌ Temporary workarounds (superseded)

### Best Practices for Full DB Reset
- For a full reset, run all three steps in order: main init, RLS policies, then follow FIRST_USER_SETUP.md for user/admin setup.
- Keep `combined_rls_policies.sql` as the source of truth for policies. Update it whenever you change security logic.
- You do **not** need to combine scripts, but you can concatenate them for a one-step reset if desired.
- All scripts are idempotent and safe to re-run.

## 🔐 Security Checklist

After setup, verify these security features:

- [ ] RLS enabled on all tables (run combined_rls_policies.sql)
- [ ] Policies created for users and admins
- [ ] Password validation function active
- [ ] Function search paths secured
- [ ] MFA enabled (in Supabase dashboard)
- [ ] Strong passwords enforced
- [ ] Comment moderation working
- [ ] Profile media support enabled
- [ ] Admin user created successfully (auto-verified)
- [ ] Admin can access admin panel

## 🚀 Next Steps

1. **Test Admin Access:**
   - Log in with admin credentials
   - Access admin panel at `/admin`
   - Change admin password immediately

2. **Configure Settings:**
   - Update app_settings in admin panel
   - Set your site name, contact email, etc.

3. **Add Content:**
   - Create your first custom pages
   - Upload media to gallery
   - Configure page sections

4. **Test Features:**
   - User registration/login
   - Comment system with moderation
   - Admin dashboard
   - Media uploads
   - Profile media

## 🆘 Troubleshooting

### Common Issues:

**"Permission denied" errors:**
- Check RLS policies are correct (run combined_rls_policies.sql)
- Verify user has proper membership type
- Ensure you're using service role for admin creation

**"Function not found" errors:**
- Ensure all functions were created (run main init script)
- Check function search paths
- Verify admin setup script ran successfully

**"Table doesn't exist" errors:**
- Verify all tables were created (run main init script)
- Check for typos in table names
- Ensure main init script completed successfully

### Verification Steps

After setup, verify everything is working:

```sql
-- Check if admin user was created
SELECT * FROM public.profiles WHERE membership_type = 'admin';

-- Check if subscription plans exist
SELECT * FROM subscription_plans;

-- Check if root page components exist
SELECT * FROM public.root_page_components;

-- Check if admin function exists
SELECT * FROM pg_proc WHERE proname = 'create_admin_user';
```

### Getting Help:
1. Check the setup scripts for complete schema
2. Review RLS policies in combined_rls_policies.sql
3. Verify all functions and triggers exist
4. Check Supabase logs for detailed errors

## 📝 Notes

- The setup scripts are **idempotent** - safe to run multiple times
- All tables use `IF NOT EXISTS` to prevent conflicts
- Initial data is inserted with `ON CONFLICT DO NOTHING`
- The scripts include comprehensive error handling
- All features from previous migrations are now included
- Admin creation is separate for security and flexibility
- RLS policies are managed in `combined_rls_policies.sql` for easy updates and linter compliance

### Admin User Creation

- The first user and admin should be created by following the instructions in `FIRST_USER_SETUP.md`.
- Ensure the `role` column exists in the `profiles` table before promoting a user to admin (it is created by the main init script).

### RLS Policies

- All admin RLS checks use the `is_admin()` function, which checks for `role = 'admin'` in the `profiles` table.

---

**🎉 Your database is now ready for production!** 