# First User & Admin Setup

## 1. Create Your First User

- Use the **Supabase Auth Dashboard** or your app's sign-up flow to create the first user.
- **Do NOT insert directly into `auth.users` via SQL.**
- This ensures secure password handling and proper user metadata.

## 2. Promote the User to Admin

- After the user is created, run the following SQL (or use `promote_to_admin.sql`):

```sql
UPDATE public.profiles
SET role = 'admin', membership_type = 'premium'
WHERE user_id = '<newly_created_user_id>';
```

- Replace `<newly_created_user_id>` with the actual user ID from the dashboard.
- This grants admin privileges and premium membership to the user.

## 3. (Optional) Insert Default App Settings

- If you need to insert default app settings, use the following SQL:

```sql
INSERT INTO app_settings (key, value) VALUES
  ('admin_email', to_jsonb('your@email.com'::text)),
  ('site_name', to_jsonb('My Portfolio'::text))
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
```

## 4. Security & Best Practices

- All RLS and security policies are managed in `combined_rls_policies.sql`.
- Never create users directly via SQL; always use the Auth system.
- Use the `promote_to_admin.sql` script for admin role elevation.

---

**This is the canonical guide for initial user/admin setup.** 