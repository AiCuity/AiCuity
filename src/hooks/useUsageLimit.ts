import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
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
  const [usage, setUsage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { subscription } = useSubscription();

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
        return getCurrentTier(usage);
      }
    }

    const matchingTier = pricingTiers.find(tier => 
      tier.name.toLowerCase() === tierName || 
      (tierName === 'free' && tier.price === 0)
    );

    return matchingTier || pricingTiers.find(tier => tier.price === 0) || pricingTiers[0];
  };

  useEffect(() => {
    if (!user) {
      setUsage(0);
      return;
    }

    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/usage/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch usage');
        }

        const data = await response.json();
        setUsage(data.count || 0);
      } catch (error) {
        console.error('Error fetching usage:', error);
        setUsage(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  const currentTier = getCurrentTierFromSubscription();
  const usageLimit = subscription?.books_limit || currentTier.max;
  const effectiveLimit = usageLimit === 999999 ? 999999 : usageLimit;
  
  const isSubscribed = Boolean(subscription?.status === 'active' && 
                      subscription?.stripe_customer_id && 
                      subscription?.stripe_subscription_id);

  const isAtLimit = usage >= effectiveLimit;
  const isNearLimit = usage >= effectiveLimit * 0.8; // 80% threshold
  const canUseFeature = !isAtLimit;
  const remainingUsage = Math.max(0, effectiveLimit - usage);

  return {
    currentUsage: usage,
    usageLimit: effectiveLimit,
    isAtLimit,
    isNearLimit,
    canUseFeature,
    remainingUsage,
    isLoading,
    tierName: currentTier.name,
    isSubscribed
  };
}; 