-- Comprehensive Supabase Init Script
-- =====================================================
-- SUPABASE FIRST INIT SCRIPT
-- Complete database setup for the Fluxedita Custom Rootpage Package
-- Run this script ONCE to set up a fresh database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Profiles table (users)
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT,
    bio TEXT,
    age INTEGER,
    city TEXT,
    country TEXT,
    occupation TEXT,
    hobbies TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    video_intro_url TEXT,
    additional_notes TEXT,
    first_name TEXT,
    last_name TEXT,
    bio_message TEXT,
    membership_type TEXT DEFAULT 'basic',
    role TEXT NOT NULL DEFAULT 'user',
    profile_media JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    membership_changed_at TIMESTAMP WITH TIME ZONE,
    membership_changed_by UUID REFERENCES auth.users(id),
    membership_reason TEXT
);

-- Remove legacy 'role' column from profiles if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add 'role' column to profiles table for user/admin roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_slug TEXT,
    is_approved BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add FK for Supabase/PostgREST joins: comments.user_id -> profiles.user_id
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id);

-- Membership history table
CREATE TABLE IF NOT EXISTS public.membership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_membership_type TEXT,
    new_membership_type TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom pages table
CREATE TABLE IF NOT EXISTS public.custom_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    meta_description TEXT,
    meta_keywords TEXT
);

-- Page content table
CREATE TABLE IF NOT EXISTS public.page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.custom_pages(id) ON DELETE CASCADE,
    page_slug TEXT NOT NULL,
    section_type TEXT NOT NULL,
    content JSONB NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    properties JSONB
);

-- Create composite unique constraint for page content
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'page_content_page_slug_section_type_key'
    ) THEN
        ALTER TABLE public.page_content 
        ADD CONSTRAINT page_content_page_slug_section_type_key 
        UNIQUE (page_slug, section_type);
    END IF;
END $$;

-- Root page components table (for system/root pages)
CREATE TABLE IF NOT EXISTS public.root_page_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL, -- 'home', 'about', 'contact', etc.
    component_type TEXT NOT NULL, -- 'hero', 'content', 'sections', etc.
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create composite unique constraint for root page components
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'root_page_components_page_slug_component_type_key'
    ) THEN
        ALTER TABLE public.root_page_components 
        ADD CONSTRAINT root_page_components_page_slug_component_type_key 
        UNIQUE (page_slug, component_type);
    END IF;
END $$;

-- Gallery data table
CREATE TABLE IF NOT EXISTS public.gallery_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    media_items TEXT[],
    category TEXT,
    tags TEXT[],
    featured_image TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Media items table
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[],
    category TEXT,
    is_public BOOLEAN DEFAULT true,
    metadata JSONB,
    -- Additional columns expected by frontend
    slug TEXT UNIQUE,
    cover_image TEXT,
    image_urls TEXT[],
    video_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    gallery_type TEXT DEFAULT 'public',
    background_image TEXT,
    cloudinary_public_id TEXT,
    cloudinary_format TEXT,
    cloudinary_metadata JSONB,
    width INTEGER,
    height INTEGER,
    format TEXT,
    bytes INTEGER
);

-- App settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin email setting
INSERT INTO public.app_settings (key, value)
VALUES ('admin_email', '"jamescroanin@gmail.com"');

-- Contact submissions table (for contact form data)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    page_slug TEXT, -- Which page the submission came from
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    is_responded BOOLEAN DEFAULT false,
    response_notes TEXT
);

-- Membership benefits table (for member benefits display)
CREATE TABLE IF NOT EXISTS public.membership_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Icon identifier or URL
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Subscription tables
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Billing history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'gbp',
  status TEXT NOT NULL, -- paid, pending, failed, etc.
  invoice_url TEXT,
  invoice_pdf TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  currency TEXT DEFAULT 'gbp',
  interval TEXT DEFAULT 'month', -- month, year
  stripe_price_id TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_type ON public.profiles(membership_type);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_page_slug ON public.comments(page_slug);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON public.comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_is_flagged ON public.comments(is_flagged);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Membership history indexes
CREATE INDEX IF NOT EXISTS idx_membership_history_user_id ON public.membership_history(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_history_changed_by ON public.membership_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_membership_history_effective_date ON public.membership_history(effective_date);

-- Custom pages indexes
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON public.custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_is_published ON public.custom_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_custom_pages_created_by ON public.custom_pages(created_by);

-- Page content indexes
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);
CREATE INDEX IF NOT EXISTS idx_page_content_page_slug ON public.page_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_content_section_type ON public.page_content(section_type);
CREATE INDEX IF NOT EXISTS idx_page_content_sort_order ON public.page_content(sort_order);
CREATE INDEX IF NOT EXISTS idx_page_content_is_published ON public.page_content(is_published);

-- Root page components indexes
CREATE INDEX IF NOT EXISTS idx_root_page_components_page_slug ON public.root_page_components(page_slug);
CREATE INDEX IF NOT EXISTS idx_root_page_components_component_type ON public.root_page_components(component_type);
CREATE INDEX IF NOT EXISTS idx_root_page_components_is_active ON public.root_page_components(is_active);

-- Gallery data indexes
CREATE INDEX IF NOT EXISTS idx_gallery_data_slug ON public.gallery_data(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_data_is_published ON public.gallery_data(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_data_category ON public.gallery_data(category);
CREATE INDEX IF NOT EXISTS idx_gallery_data_sort_order ON public.gallery_data(sort_order);

-- Media items indexes
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_category ON public.media_items(category);
CREATE INDEX IF NOT EXISTS idx_media_items_is_public ON public.media_items(is_public);
CREATE INDEX IF NOT EXISTS idx_media_items_created_by ON public.media_items(created_by);
CREATE INDEX IF NOT EXISTS idx_media_items_slug ON public.media_items(slug);
CREATE INDEX IF NOT EXISTS idx_media_items_gallery_type ON public.media_items(gallery_type);
CREATE INDEX IF NOT EXISTS idx_media_items_is_premium ON public.media_items(is_premium);
CREATE INDEX IF NOT EXISTS idx_media_items_featured ON public.media_items(featured);
CREATE INDEX IF NOT EXISTS idx_media_items_order ON public.media_items("order");

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_page_slug ON public.contact_submissions(page_slug);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_read ON public.contact_submissions(is_read);

-- Membership benefits indexes
CREATE INDEX IF NOT EXISTS idx_membership_benefits_sort_order ON public.membership_benefits(sort_order);
CREATE INDEX IF NOT EXISTS idx_membership_benefits_is_active ON public.membership_benefits(is_active);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON billing_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, sort_order);

-- Foreign key indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_custom_pages_updated_by ON public.custom_pages(updated_by);
CREATE INDEX IF NOT EXISTS idx_gallery_data_created_by ON public.gallery_data(created_by);
CREATE INDEX IF NOT EXISTS idx_membership_benefits_created_by ON public.membership_benefits(created_by);
CREATE INDEX IF NOT EXISTS idx_page_content_created_by ON public.page_content(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_changed_by ON public.profiles(membership_changed_by);
CREATE INDEX IF NOT EXISTS idx_root_page_components_created_by ON public.root_page_components(created_by);
CREATE INDEX IF NOT EXISTS idx_root_page_components_updated_by ON public.root_page_components(updated_by);

-- =====================================================
-- 3. CREATE FUNCTIONS
-- =====================================================

-- Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle root page components updated_at
CREATE OR REPLACE FUNCTION public.handle_root_page_components_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update membership function
CREATE OR REPLACE FUNCTION public.update_membership(
    user_uuid UUID,
    new_membership TEXT,
    admin_uuid UUID,
    reason TEXT DEFAULT NULL
) RETURNS VOID
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_membership TEXT;
BEGIN
    -- Get current membership
    SELECT membership_type INTO old_membership
    FROM public.profiles
    WHERE user_id = user_uuid;
    
    -- Update profile
    UPDATE public.profiles
    SET 
        membership_type = new_membership,
        membership_changed_at = NOW(),
        membership_changed_by = admin_uuid,
        membership_reason = reason
    WHERE user_id = user_uuid;
    
    -- Log the change
    INSERT INTO public.membership_history (
        user_id,
        old_membership_type,
        new_membership_type,
        changed_by,
        reason
    ) VALUES (
        user_uuid,
        old_membership,
        new_membership,
        admin_uuid,
        reason
    );
END;
$$;

-- Password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
SET search_path = ''
AS $$
BEGIN
    -- Check minimum length
    IF LENGTH(password) < 8 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one uppercase letter
    IF password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one lowercase letter
    IF password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one digit
    IF password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one special character
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Log password change attempts
CREATE OR REPLACE FUNCTION public.log_password_change_attempt(
    user_id UUID,
    success BOOLEAN,
    reason TEXT DEFAULT NULL
)
RETURNS VOID
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    -- This function can be used to log password change attempts
    -- You can create a separate table for this if needed
    -- For now, we'll just return without doing anything
    RETURN;
END;
$$;

-- Get root page components function
CREATE OR REPLACE FUNCTION public.get_root_page_components(page_slug TEXT)
RETURNS JSONB
SET search_path = ''
AS $$
DECLARE
    result JSONB := '{}';
    component_record RECORD;
BEGIN
    FOR component_record IN 
        SELECT component_type, content 
        FROM public.root_page_components 
        WHERE page_slug = $1 AND is_active = true
    LOOP
        result := result || jsonb_build_object(component_record.component_type, component_record.content);
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update root page component function
CREATE OR REPLACE FUNCTION public.update_root_page_component(
    p_page_slug TEXT,
    p_component_type TEXT,
    p_content JSONB
)
RETURNS BOOLEAN
SET search_path = ''
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update the component
    INSERT INTO public.root_page_components (page_slug, component_type, content, updated_by)
    VALUES (p_page_slug, p_component_type, p_content, auth.uid())
    ON CONFLICT (page_slug, component_type) 
    DO UPDATE SET 
        content = p_content,
        updated_by = auth.uid(),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update subscription tables updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Auth user creation trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.custom_pages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.page_content
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.gallery_data
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.media_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.membership_benefits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Root page components updated_at trigger
CREATE TRIGGER handle_root_page_components_updated_at
    BEFORE UPDATE ON public.root_page_components
    FOR EACH ROW EXECUTE FUNCTION public.handle_root_page_components_updated_at();

-- Subscription tables updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.root_page_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create admin check function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND (role = 'admin' OR membership_type = 'premium')
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES (Fully Idempotent, Linter-Compliant)
-- =====================================================
-- This section is kept in sync with supabase/combined_rls_policies.sql
-- For every CREATE POLICY, there is a matching DROP POLICY IF EXISTS with the exact same name and table immediately before it.
-- Only one permissive policy per action/role/table remains, with admin access split as needed.

-- (BEGIN COPY)

-- Combined RLS Policies for All Tables (Linter-Compliant: Only One Permissive Policy per Action/Role)
-- For each table/action/role, only one permissive policy is allowed. All legacy, duplicate, or overlapping policies are removed.
-- This ensures compliance with Supabase/Postgres linter and optimal performance.

-- FINAL Linter-Silencing RLS Policies (Fully Idempotent, One Policy per Action/Role/Table)
-- For every CREATE POLICY, there is a matching DROP POLICY IF EXISTS with the exact same name and table immediately before it.
-- This ensures the script is fully idempotent and prevents 'policy already exists' errors.
-- Only one permissive policy per action/role/table remains, with admin access split as needed.

-- (CONTENTS FROM combined_rls_policies.sql GO HERE)

-- (END COPY)

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_root_page_components(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_root_page_component(TEXT, TEXT, JSONB) TO authenticated;

-- =====================================================
-- 8. INSERT DEFAULT DATA
-- =====================================================

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/mov']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for media bucket
CREATE POLICY "Anyone can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own media files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all media files" ON storage.objects
  FOR ALL USING (bucket_id = 'media' AND public.is_admin());

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price, features, sort_order) VALUES
  ('free', 'Free', 'Basic access to public content', 0, '["Access to free gallery", "Basic profile features"]', 0),
  ('premium', 'Premium', 'Access to premium content and features', 999, '["Access to premium gallery", "Priority support", "Exclusive content"]', 1),
  ('vip', 'VIP', 'Full access to all content and VIP features', 1999, '["Access to VIP gallery", "Priority support", "Exclusive content", "Personal messages", "Behind the scenes content"]', 2)
ON CONFLICT (id) DO NOTHING;

-- Insert default custom pages
INSERT INTO public.custom_pages (slug, title, content, is_published) VALUES
('contact', 'Contact', '{"profileImage": "/placeholder.svg?height=1000&width=800", "contactMethods": []}', true),
('about', 'About', '{"hero": {"title": "About Me", "description": "Get to know the person behind the content"}}', true),
('gallery', 'Gallery', '{"title": "Gallery", "description": "Explore our content"}', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default root page components
INSERT INTO public.root_page_components (page_slug, component_type, content) VALUES
('home', 'hero', '{
    "id": "homepage-hero",
    "type": "hero",
    "visible": true,
    "title": "Hi, I''m admin",
    "description": "27-year-old content creator based in London, sharing my journey and exclusive content with my community.",
    "backgroundMedia": "/placeholder.svg?height=1080&width=1920",
    "mediaType": "image",
    "width": "100%",
    "height": "60vh",
    "enableSpeech": false,
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
}'),
('home', 'sections', '[
  {
    "id": "hero",
    "type": "hero",
    "title": "Welcome to Our Amazing Editable Web Application",
    "width": "w-full",
    "height": "h-[40vh] min-h-[300px] max-h-[400px]",
    "visible": true,
    "maxHeight": 400,
    "mediaType": "image",
    "objectFit": "cover",
    "description": "Our Editable Web Application is a Revolution in Website Creation.",
    "enableSpeech": false,
    "objectPosition": "center",
    "backgroundImage": "",
    "backgroundMedia": "https://res.cloudinary.com/dv9g1csum/image/upload/v1751704726/ycwho3yjknox5eptnj62.jpg",
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
  },
  {
    "id": "cta",
    "type": "cta",
    "title": "Ready to see more?",
    "visible": true,
    "buttonUrl": "/about",
    "textColor": "#000000",
    "buttonText": "See Fluxedita in Action",
    "description": "Fluxedita allows you to create and edit your website, live in your browser, and much more.",
    "enableSpeech": true,
    "backgroundColor": "#ffffff",
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
  },
  {
    "id": "feature-card-grid",
    "type": "feature-card-grid",
    "cards": [
      {
        "id": "card-1",
        "title": "Example Custom Page",
        "ctaUrl": "/",
        "ctaText": "View Custom Page",
        "mediaUrl": "",
        "mediaType": "image",
        "description": "An example of a new custom page. Here you can add ''Editable New Section Components''. Allowing you to create any type of page you require.",
        "ctaOpenInNewTab": false
      },
      {
        "id": "card-2",
        "title": "Example of Editable Section Components",
        "ctaUrl": "/",
        "ctaText": "View Editable Components Page",
        "mediaUrl": "",
        "mediaType": "image",
        "description": "See a selection of the available section components, the admin user can edit live in the browser. Instantly making changes live.",
        "ctaOpenInNewTab": false
      },
      {
        "id": "card-3",
        "title": "View our Demonstration Videos",
        "ctaUrl": "/",
        "ctaText": "View Demo Videos",
        "mediaUrl": "",
        "mediaType": "image",
        "description": "See our demonstration videos page. Showing how easy it is to get your own, privately managed website up in less than one hour.",
        "ctaOpenInNewTab": false
      }
    ],
    "visible": true,
    "numCards": 3,
    "enableSpeech": false
  }
]'),
('about', 'hero', '{
    "id": "about-hero",
    "type": "hero",
    "visible": true,
    "title": "About Me",
    "description": "Learn more about what Fluxedita can do.",
    "backgroundMedia": "/placeholder.svg?height=1080&width=1920",
    "mediaType": "image",
    "width": "100%",
    "height": "50vh",
    "enableSpeech": false,
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
}'),
('contact', 'hero', '{
    "id": "contact-hero",
    "type": "hero",
    "visible": true,
    "title": "Get in Touch",
    "description": "Let us know any questions you may have!",
    "backgroundMedia": "/placeholder.svg?height=1080&width=1920",
    "mediaType": "image",
    "width": "100%",
    "height": "50vh",
    "enableSpeech": false,
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
}'),
('gallery', 'hero', '{
    "id": "gallery-hero",
    "type": "hero",
    "visible": true,
    "title": "Gallery",
    "description": "Explore The Fluxedita Features.",
    "backgroundMedia": "/placeholder.svg?height=1080&width=1920",
    "mediaType": "image",
    "width": "100%",
    "height": "50vh",
    "enableSpeech": false,
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
}'),
('members', 'hero', '{
    "id": "members-hero",
    "type": "hero",
    "visible": true,
    "title": "Members",
    "description": "You can enable the members section if you wish.",
    "backgroundMedia": "/placeholder.svg?height=1080&width=1920",
    "mediaType": "image",
    "width": "100%",
    "height": "50vh",
    "enableSpeech": false,
    "enableTitleSpeech": false,
    "enableDescriptionSpeech": false
}')
ON CONFLICT (page_slug, component_type) DO NOTHING;

-- Insert default page content for custom pages
INSERT INTO public.page_content (page_slug, section_type, content, sort_order, is_published) VALUES
('contact', 'contact', '{"profileImage": "/placeholder.svg?height=1000&width=800", "contactMethods": [], "featureSection": {"id": "contact-feature", "type": "feature", "title": "Get in Touch", "description": "We are always excited to connect! Whether you have questions, want to collaborate, or just want to say hi, feel free to reach out.", "features": [{"icon": "star", "title": "Email", "description": "Reach us at jamescroanin@gmail.com"}, {"icon": "heart", "title": "Phone", "description": "+1 (555) 123-4567"}, {"icon": "sparkles", "title": "Location", "description": "London, United Kingdom"}], "layout": "grid", "enableTitleSpeech": false, "enableDescriptionSpeech": false, "enableFeatureSpeech": false, "enableSpeech": false, "visible": true}}', 0, true)
ON CONFLICT (page_slug, section_type) DO NOTHING;

-- =====================================================
-- PUBLIC ACCESS POLICIES (see combined_rls_policies.sql for details)
-- =====================================================
-- root_page_components: All users (including unauthenticated) can SELECT (public read)
-- gallery_data: All users can SELECT rows where is_published = true

-- =====================================================
-- SCRIPT COMPLETE
-- ===================================================== 

-- Sidebar settings persistence for PageControls
create table if not exists user_sidebar_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled_sections jsonb not null default '[]'
); 
