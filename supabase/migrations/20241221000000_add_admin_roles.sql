-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index for better performance on role queries
CREATE INDEX profiles_role_idx ON public.profiles(role);

-- Create admin-specific RLS policies
-- Admin policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Admin policy: Admins can update all profiles  
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Admin policy: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Admin policy: Admins can update all subscriptions
CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Admin policy: Admins can view all usage tracking
CREATE POLICY "Admins can view all usage tracking" ON public.usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Admin policy: Admins can update all usage tracking
CREATE POLICY "Admins can update all usage tracking" ON public.usage_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to promote user to admin (only super_admin can do this)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can promote users to admin';
  END IF;
  
  -- Promote the target user
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin user management view for easier querying
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT 
  p.id,
  p.role,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at,
  u.email,
  u.created_at as auth_created_at,
  u.email_confirmed_at,
  u.last_sign_in_at,
  s.tier,
  s.status as subscription_status,
  s.books_limit,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  ut.count as current_month_usage,
  ut.month_year as usage_month
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
LEFT JOIN public.subscriptions s ON p.id = s.user_id
LEFT JOIN public.usage_tracking ut ON p.id = ut.user_id 
  AND ut.month_year = to_char(now(), 'YYYY-MM');

-- Grant access to admin view for admins only
ALTER VIEW public.admin_user_overview OWNER TO postgres;
GRANT SELECT ON public.admin_user_overview TO authenticated;

-- RLS policy for admin view
CREATE POLICY "Only admins can view admin overview" ON public.admin_user_overview
  FOR SELECT USING (public.is_admin()); 