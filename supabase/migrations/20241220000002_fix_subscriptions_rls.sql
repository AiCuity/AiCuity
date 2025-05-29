-- Fix RLS policies for subscriptions table
-- Add missing INSERT policy for users to insert their own subscription

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id); 