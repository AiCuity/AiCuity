import { useAuth } from "@/context/AuthContext";
import { useSubscriptionQuery, useUsageQuery } from "@/hooks/useSubscriptionQuery";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { getCurrentTier, calculateExpectedCost, pricingTiers } from "@/lib/stripe";

export default function UsageDisplay() {
  const { user } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionQuery();
  const { usage, isLoading: usageLoading } = useUsageQuery();

  // Helper function to get tier info from database subscription (same as Account page)
  const getCurrentTierFromSubscription = () => {
    if (!subscription) {
      // Default to free tier if no subscription
      return pricingTiers.find(tier => tier.price === 0) || pricingTiers[0];
    }

    // Cast to any to handle backend tier values that aren't in the strict enum type
    const rawTier = subscription.tier as any;
    const tierName = String(rawTier?.toLowerCase() || 'free');
    
    // Handle special cases for backend tier values not in the enum
    if (['usage_based', 'unlimited', 'basic', 'advanced', 'starter', 'professional', 'premium', 'enterprise'].includes(tierName)) {
      // For these special tiers, find tier based on name mapping or fallback
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
      // For usage_based, find tier based on actual usage
      return getCurrentTier(usage?.count || 0);
    }

    // Find matching tier by name
    const matchingTier = pricingTiers.find(tier => 
      tier.name.toLowerCase() === tierName || 
      (tierName === 'free' && tier.price === 0)
    );

    // Fallback to free tier if no match found
    return matchingTier || pricingTiers.find(tier => tier.price === 0) || pricingTiers[0];
  };

  if (!user) return null;

  const isLoading = subscriptionLoading || usageLoading;
  const usageCount = usage?.count ?? 0;
  
  // Get current tier from subscription database, not from usage calculation
  const currentTier = getCurrentTierFromSubscription();
  
  // Calculate cost based on actual subscription tier and usage
  const currentCost = (subscription?.tier as any) === 'usage_based' 
    ? calculateExpectedCost(usageCount)
    : currentTier.price;
  
  // A user is truly subscribed only if they have both subscription status active AND Stripe IDs
  const isSubscribed = subscription?.status === 'active' && 
                      subscription?.stripe_customer_id && 
                      subscription?.stripe_subscription_id;
  
  // Use the actual books limit from subscription or tier
  const booksLimit = subscription?.books_limit || currentTier.max;
  const displayLimit = booksLimit === 999999 ? (currentTier.min + 50) : booksLimit;
  const usagePercentage = Math.min((usageCount / displayLimit) * 100, 100);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-purple-700">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-muted-foreground">Loading usage data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-purple-700">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Usage & Subscription
            </h3>
            <div className="mt-1">
              <span className="text-lg font-bold text-purple-600">
                {usageCount} books
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Current tier: <span className="font-medium">{currentTier.name}</span>
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">
              ${currentCost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {isSubscribed ? 'Monthly cost' : 'Free tier'}
            </div>
          </div>
        </div>

        {/* Progress bar for current subscription tier */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentTier.name} tier</span>
            <span>
              {booksLimit === 999999 
                ? 'Unlimited books' 
                : `${usageCount}/${booksLimit} books`}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          
          {/* Show limit warning */}
          {booksLimit !== 999999 && usageCount > booksLimit * 0.8 && (
            <p className="text-xs text-orange-600">
              ⚠️ You're approaching your {booksLimit} book limit
            </p>
          )}
        </div>

        {/* Subscription status indicator */}
        <div className="space-y-3">
          {isSubscribed ? (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <span className="font-medium">Active Subscription:</span> {currentTier.name} tier
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    {booksLimit === 999999 
                      ? 'Unlimited books per month'
                      : `Up to ${booksLimit} books per month`
                    } • ${currentCost.toFixed(2)}/month
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Free Tier:</span> {currentTier.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {booksLimit === 999999 
                      ? 'Basic features available'
                      : `Up to ${booksLimit} books per month`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
