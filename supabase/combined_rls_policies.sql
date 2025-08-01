-- Combined RLS Policies for All Tables (Linter-Compliant: Only One Permissive Policy per Action/Role)
-- For each table/action/role, only one permissive policy is allowed. All legacy, duplicate, or overlapping policies are removed.
-- This ensures compliance with Supabase/Postgres linter and optimal performance.

-- FINAL Linter-Silencing RLS Policies (Fully Idempotent, One Policy per Action/Role/Table)

-- USER SIDEBAR SETTINGS RLS
ALTER TABLE public.user_sidebar_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Combined: user can manage own sidebar settings" ON public.user_sidebar_settings;
CREATE POLICY "Combined: user can manage own sidebar settings"
  ON public.user_sidebar_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- For every CREATE POLICY, there is a matching DROP POLICY IF EXISTS with the exact same name and table immediately before it.
-- This ensures the script is fully idempotent and prevents 'policy already exists' errors.
-- Only one permissive policy per action/role/table remains, with admin access split as needed.

-- PROFILES
DROP POLICY IF EXISTS "Combined: admin or self can select" ON public.profiles;
CREATE POLICY "Combined: admin or self can select"
  ON public.profiles
  FOR SELECT
  USING (
    public.is_admin()
    OR
    (select auth.uid()) = user_id
  );
DROP POLICY IF EXISTS "Combined: admin or self can update" ON public.profiles;
DROP POLICY IF EXISTS "Admin or self can update" ON public.profiles;
CREATE POLICY "Combined: admin or self can update"
  ON public.profiles
  FOR UPDATE
  USING (
    public.is_admin()
    OR
    (select auth.uid()) = user_id
  );

-- COMMENTS
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
DROP POLICY IF EXISTS "Enable all for admins" ON public.comments;
DROP POLICY IF EXISTS "Enable read access for approved comments" ON public.comments;
DROP POLICY IF EXISTS "Select: approved or admin" ON public.comments;
DROP POLICY IF EXISTS "Enable update for comment owners" ON public.comments;
DROP POLICY IF EXISTS "Update: owner or admin" ON public.comments;
DROP POLICY IF EXISTS "Combined: admin or approved can select" ON public.comments;
CREATE POLICY "Combined: admin or approved can select"
  ON public.comments
  FOR SELECT
  USING (
    public.is_admin()
    OR
    is_approved = true
  );
DROP POLICY IF EXISTS "Combined: admin or self can update" ON public.comments;
CREATE POLICY "Combined: admin or self can update"
  ON public.comments
  FOR UPDATE
  USING (
    public.is_admin()
    OR
    (select auth.uid()) = user_id
  );
DROP POLICY IF EXISTS "Combined: self can insert" ON public.comments;
CREATE POLICY "Combined: self can insert"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
  );
DROP POLICY IF EXISTS "Combined: admin can delete" ON public.comments;
CREATE POLICY "Combined: admin can delete"
  ON public.comments
  FOR DELETE
  USING (
    public.is_admin()
  );

-- MEMBERSHIP_HISTORY
DROP POLICY IF EXISTS "Users can view their own membership history" ON public.membership_history;
DROP POLICY IF EXISTS "Admins can view all membership history" ON public.membership_history;
DROP POLICY IF EXISTS "Combined: admin or self can select" ON public.membership_history;
CREATE POLICY "Combined: admin or self can select"
  ON public.membership_history
  FOR SELECT
  USING (
    public.is_admin()
    OR
    (select auth.uid()) = user_id
  );
DROP POLICY IF EXISTS "Combined: admin can insert" ON public.membership_history;
CREATE POLICY "Combined: admin can insert"
  ON public.membership_history
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- CUSTOM_PAGES
DROP POLICY IF EXISTS "Combined: admin can all" ON public.custom_pages;
DROP POLICY IF EXISTS "Combined: admin or published can select" ON public.custom_pages;
CREATE POLICY "Combined: admin or published can select"
  ON public.custom_pages
  FOR SELECT
  USING (
    public.is_admin()
    OR
    is_published = true
  );
DROP POLICY IF EXISTS "Admin can insert" ON public.custom_pages;
CREATE POLICY "Admin can insert"
  ON public.custom_pages
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can update" ON public.custom_pages;
CREATE POLICY "Admin can update"
  ON public.custom_pages
  FOR UPDATE
  USING (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can delete" ON public.custom_pages;
CREATE POLICY "Admin can delete"
  ON public.custom_pages
  FOR DELETE
  USING (
    public.is_admin()
  );

-- PAGE_CONTENT
DROP POLICY IF EXISTS "Combined: admin can all" ON public.page_content;
DROP POLICY IF EXISTS "Combined: admin or published can select" ON public.page_content;
CREATE POLICY "Combined: admin or published can select"
  ON public.page_content
  FOR SELECT
  USING (
    public.is_admin()
    OR
    is_published = true
  );
DROP POLICY IF EXISTS "Admin can insert" ON public.page_content;
CREATE POLICY "Admin can insert"
  ON public.page_content
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can update" ON public.page_content;
CREATE POLICY "Admin can update"
  ON public.page_content
  FOR UPDATE
  USING (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can delete" ON public.page_content;
CREATE POLICY "Admin can delete"
  ON public.page_content
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ROOT_PAGE_COMPONENTS (CLEANED)
DROP POLICY IF EXISTS "Admin can delete" ON public.root_page_components;
DROP POLICY IF EXISTS "Admin can insert" ON public.root_page_components;
DROP POLICY IF EXISTS "Admin can update" ON public.root_page_components;
DROP POLICY IF EXISTS "Allow admins to manage root page components" ON public.root_page_components;
DROP POLICY IF EXISTS "Allow authenticated users to read root page components" ON public.root_page_components;
DROP POLICY IF EXISTS "Combined: admin or public can select" ON public.root_page_components;

CREATE POLICY "Admin can insert"
  ON public.root_page_components
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

CREATE POLICY "Admin can update"
  ON public.root_page_components
  FOR UPDATE
  USING (
    public.is_admin()
  );

CREATE POLICY "Admin can delete"
  ON public.root_page_components
  FOR DELETE
  USING (
    public.is_admin()
  );

CREATE POLICY "Combined: admin or public can select"
  ON public.root_page_components
  FOR SELECT
  USING (
    public.is_admin()
    OR
    true  -- allow all users, including unauthenticated
  );

-- GALLERY_DATA
DROP POLICY IF EXISTS "Combined: admin can all" ON public.gallery_data;
DROP POLICY IF EXISTS "Combined: admin or authenticated+published can select" ON public.gallery_data;
DROP POLICY IF EXISTS "Combined: admin or published can select" ON public.gallery_data;
CREATE POLICY "Combined: admin or published can select"
  ON public.gallery_data
  FOR SELECT
  USING (
    public.is_admin()
    OR
    is_published = true
  );
DROP POLICY IF EXISTS "Admin can insert" ON public.gallery_data;
CREATE POLICY "Admin can insert"
  ON public.gallery_data
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can update" ON public.gallery_data;
CREATE POLICY "Admin can update"
  ON public.gallery_data
  FOR UPDATE
  USING (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can delete" ON public.gallery_data;
CREATE POLICY "Admin can delete"
  ON public.gallery_data
  FOR DELETE
  USING (
    public.is_admin()
  );

-- FINAL Linter-Silencing RLS Policies for media_items and media_sets (One Policy per Action/Role/Table)
-- For each action/role flagged by the linter, only the most descriptive/combined permissive policy remains.
-- All legacy, duplicate, or overlapping policies are removed for these tables/actions/roles.
-- Each CREATE POLICY is immediately preceded by a matching DROP POLICY IF EXISTS.
-- This version is designed to silence all 'multiple permissive policies' warnings for good.

-- MEDIA_ITEMS
DROP POLICY IF EXISTS "Admin can delete" ON public.media_items;
DROP POLICY IF EXISTS "Self can delete" ON public.media_items;
DROP POLICY IF EXISTS "Combined: self can delete" ON public.media_items;
DROP POLICY IF EXISTS "Combined: admin or self can delete" ON public.media_items;
CREATE POLICY "Combined: admin or self can delete" ON public.media_items FOR DELETE USING (is_admin() OR ((SELECT auth.uid()) = created_by));

DROP POLICY IF EXISTS "Admin can insert" ON public.media_items;
DROP POLICY IF EXISTS "Self can insert" ON public.media_items;
DROP POLICY IF EXISTS "Combined: self can insert" ON public.media_items;
DROP POLICY IF EXISTS "Combined: admin or self can insert" ON public.media_items;
CREATE POLICY "Combined: admin or self can insert" ON public.media_items FOR INSERT WITH CHECK (is_admin() OR ((SELECT auth.uid()) = created_by));

DROP POLICY IF EXISTS "Admin can update" ON public.media_items;
DROP POLICY IF EXISTS "Self can update" ON public.media_items;
DROP POLICY IF EXISTS "Combined: self can update" ON public.media_items;
DROP POLICY IF EXISTS "Combined: admin or self can update" ON public.media_items;
CREATE POLICY "Combined: admin or self can update" ON public.media_items FOR UPDATE USING (is_admin() OR ((SELECT auth.uid()) = created_by));

-- The media_sets table is not used in the current implementation. All RLS policies for this table are commented out for clarity.
-- DROP POLICY IF EXISTS "Combined: admin, published, or self can select" ON public.media_sets;
-- DROP POLICY IF EXISTS "Published or self can select" ON public.media_sets;
-- DROP POLICY IF EXISTS "Published, self, or admin can select" ON public.media_sets;
-- CREATE POLICY "Combined: admin, published, or self can select" ON public.media_sets FOR SELECT USING (is_admin() OR (is_published = true) OR ((SELECT auth.uid()) = user_id));

-- APP_SETTINGS
DROP POLICY IF EXISTS "Combined: admin can all" ON public.app_settings;
DROP POLICY IF EXISTS "Combined: admin or authenticated can select" ON public.app_settings;
CREATE POLICY "Combined: admin or authenticated can select"
  ON public.app_settings
  FOR SELECT
  USING (
    public.is_admin()
    OR
    (select auth.role()) = 'authenticated'
  );
DROP POLICY IF EXISTS "Admin can insert" ON public.app_settings;
CREATE POLICY "Admin can insert"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can update" ON public.app_settings;
CREATE POLICY "Admin can update"
  ON public.app_settings
  FOR UPDATE
  USING (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can delete" ON public.app_settings;
CREATE POLICY "Admin can delete"
  ON public.app_settings
  FOR DELETE
  USING (
    public.is_admin()
  );

-- CONTACT_SUBMISSIONS
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Combined: admin can select" ON public.contact_submissions;
CREATE POLICY "Combined: admin can select"
  ON public.contact_submissions
  FOR SELECT
  USING (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Combined: anyone can insert" ON public.contact_submissions;
CREATE POLICY "Combined: anyone can insert"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- MEMBERSHIP_BENEFITS
DROP POLICY IF EXISTS "Combined: admin can all" ON public.membership_benefits;
DROP POLICY IF EXISTS "Combined: admin or active can select" ON public.membership_benefits;
CREATE POLICY "Combined: admin or active can select"
  ON public.membership_benefits
  FOR SELECT
  USING (
    public.is_admin()
    OR
    is_active = true
  );
DROP POLICY IF EXISTS "Admin can insert" ON public.membership_benefits;
CREATE POLICY "Admin can insert"
  ON public.membership_benefits
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can update" ON public.membership_benefits;
CREATE POLICY "Admin can update"
  ON public.membership_benefits
  FOR UPDATE
  USING (
    public.is_admin()
  );
DROP POLICY IF EXISTS "Admin can delete" ON public.membership_benefits;
CREATE POLICY "Admin can delete"
  ON public.membership_benefits
  FOR DELETE
  USING (
    public.is_admin()
  );

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Combined: self can select" ON public.subscriptions;
CREATE POLICY "Combined: self can select"
  ON public.subscriptions
  FOR SELECT
  USING (
    (select auth.uid()) = user_id
  );
DROP POLICY IF EXISTS "Combined: self can update" ON public.subscriptions;
CREATE POLICY "Combined: self can update"
  ON public.subscriptions
  FOR UPDATE
  USING (
    (select auth.uid()) = user_id
  );

-- BILLING_HISTORY
DROP POLICY IF EXISTS "Users can view their own billing history" ON public.billing_history;
DROP POLICY IF EXISTS "Combined: self can select" ON public.billing_history;
CREATE POLICY "Combined: self can select"
  ON public.billing_history
  FOR SELECT
  USING (
    (select auth.uid()) = user_id
  );

-- SUBSCRIPTION_PLANS
DROP POLICY IF EXISTS "Combined: anyone can select active" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone can select active" ON subscription_plans;
CREATE POLICY "Combined: anyone can select active"
  ON subscription_plans
  FOR SELECT
  USING (
    is_active = true
  ); 