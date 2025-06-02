-- Fix RLS recursion in admin policies
-- The problem: Admin policies on profiles table are checking profiles table, causing infinite recursion

-- Drop the problematic admin policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a safe function to get user role without triggering RLS
-- This function bypasses RLS by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

-- Now create the corrected admin policies for profiles table
-- These policies only allow users to access their own data, not others
-- Admins will use the admin view or direct service role access for managing other users

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For admin operations on other users' profiles, we'll use the API service
-- with the service role key, bypassing RLS entirely

-- Update the other table policies to use the safe function
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all usage tracking" ON public.usage_tracking;
DROP POLICY IF EXISTS "Admins can update all usage tracking" ON public.usage_tracking;

-- Recreate subscription policies with safe role checking
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Recreate usage tracking policies with safe role checking
CREATE POLICY "Admins can view all usage tracking" ON public.usage_tracking
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update all usage tracking" ON public.usage_tracking
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can insert all usage tracking" ON public.usage_tracking
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Update the is_admin function to use the safe function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role(auth.uid()) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 