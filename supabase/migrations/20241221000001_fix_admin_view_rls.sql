-- Fix RLS policy for admin view
-- Views can't have RLS policies directly - they inherit security from underlying tables
-- Since we already have admin policies on profiles, subscriptions, and usage_tracking tables,
-- the view will work correctly for admins

-- Remove the incorrect RLS policy if it exists
DROP POLICY IF EXISTS "Only admins can view admin overview" ON public.admin_user_overview;

-- The view will work because:
-- 1. Admins can see all profiles (due to "Admins can view all profiles" policy)
-- 2. Admins can see all subscriptions (due to "Admins can view all subscriptions" policy)  
-- 3. Admins can see all usage_tracking (due to "Admins can view all usage tracking" policy)
-- 4. auth.users table is accessible to authenticated users by default

-- Ensure the view has proper grants
GRANT SELECT ON public.admin_user_overview TO authenticated; 