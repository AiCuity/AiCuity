import { useAuth } from '@/context/AuthContext';
import { useSubscriptionQuery, useUsageQuery } from '@/hooks/useSubscriptionQuery';
import { pricingTiers, getCurrentTier } from '@/lib/stripe';

interface UsageLimitResult {
  currentUsage: number;
  usageLimit: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
  canUseFeature: boolean;
  remainingUsage: number;
  isLoading: boolean;
  tierName: string;
  isSubscribed: boolean;
}

export const useUsageLimit = (): UsageLimitResult => {
  const { user } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionQuery();
  const { usage, isLoading: usageLoading } = useUsageQuery();

  // Helper function to get current tier info from subscription
  const getCurrentTierFromSubscription = () => {
    if (!subscription) {
      return pricingTiers.find(tier => tier.price === 0) || pricingTiers[0];
    }

    const rawTier = subscription.tier as any;
    const tierName = String(rawTier?.toLowerCase() || 'free');
    
    if (['usage_based', 'unlimited', 'basic', 'advanced', 'starter', 'professional', 'premium', 'enterprise'].includes(tierName)) {
      if (tierName === 'unlimited') {
        return pricingTiers.find(tier => tier.name === 'Unlimited') || pricingTiers[pricingTiers.length - 1];
      }
      if (tierName === 'basic') {
        return pricingTiers.find(tier => tier.name === 'Basic') || pricingTiers[1];
      }
      if (tierName === 'advanced') {
        return pricingTiers.find(tier => tier.name === 'Advanced') || pricingTiers[3];
      }
      if (tierName === 'starter') {
        return pricingTiers.find(tier => tier.name === 'Starter') || pricingTiers[0];
      }
      if (tierName === 'professional') {
        return pricingTiers.find(tier => tier.name === 'Professional') || pricingTiers[2];
      }
      if (tierName === 'premium') {
        return pricingTiers.find(tier => tier.name === 'Premium') || pricingTiers[4];
      }
      if (tierName === 'enterprise') {
        return pricingTiers.find(tier => tier.name === 'Enterprise') || pricingTiers[5];
      }
      if (tierName === 'usage_based') {
        return getCurrentTier(usage?.count || 0);
      }
    }

    const matchingTier = pricingTiers.find(tier => 
      tier.name.toLowerCase() === tierName || 
      (tierName === 'free' && tier.price === 0)
    );

    return matchingTier || pricingTiers.find(tier => tier.price === 0) || pricingTiers[0];
  };

  // Calculate values based on cached data
  const currentTier = getCurrentTierFromSubscription();
  const currentUsage = usage?.count || 0;
  const usageLimit = subscription?.books_limit || currentTier.max;
  const effectiveLimit = usageLimit === 999999 ? 999999 : usageLimit;
  
  const isSubscribed = Boolean(subscription?.status === 'active' && 
                      subscription?.stripe_customer_id && 
                      subscription?.stripe_subscription_id);

  const isAtLimit = currentUsage >= effectiveLimit;
  const isNearLimit = currentUsage >= effectiveLimit * 0.8; // 80% threshold
  const canUseFeature = !isAtLimit;
  const remainingUsage = Math.max(0, effectiveLimit - currentUsage);

  return {
    currentUsage,
    usageLimit: effectiveLimit,
    isAtLimit,
    isNearLimit,
    canUseFeature,
    remainingUsage,
    isLoading: subscriptionLoading || usageLoading,
    tierName: currentTier.name,
    isSubscribed
  };
}; 