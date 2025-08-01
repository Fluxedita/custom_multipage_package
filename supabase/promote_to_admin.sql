-- Promote a user to admin in the profiles table
-- Usage:
-- 1. Replace <newly_created_user_id> with the actual user ID from the auth.users table.
-- 2. Run this script after creating the user via the Supabase Auth Dashboard or API.

UPDATE public.profiles
SET role = 'admin', membership_type = 'premium'
WHERE user_id = '00000000000000000000000000000000'; 
