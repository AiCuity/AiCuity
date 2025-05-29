-- Update subscription tiers to include all pricing tiers
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check 
CHECK (tier IN (
  'free', 
  'starter', 
  'basic', 
  'professional', 
  'advanced', 
  'premium', 
  'enterprise', 
  'unlimited',
  'usage_based'
)); 