import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, TrendingUp, AlertCircle } from "lucide-react";
import SubscribeButton from "./SubscribeButton";
import { getCurrentTier, getNextTier, calculateExpectedCost } from "@/lib/stripe";

export default function UsageDisplay() {
  const [usage, setUsage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { subscription } = useSubscription();

  useEffect(() => {
    if (!user) return;

    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/subscription/usage/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch usage');
        }

        const data = await response.json();
        setUsage(data.count || 0);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  if (!user) return null;

  const usageCount = usage ?? 0;
  const currentTier = getCurrentTier(usageCount);
  const nextTier = getNextTier(usageCount);
  const currentCost = calculateExpectedCost(usageCount);
  const isSubscribed = subscription?.status === 'active';
  
  // For free tier, show limit as the free tier max
  const displayLimit = currentTier.max === Infinity ? currentTier.min + 50 : currentTier.max;
  const usagePercentage = Math.min((usageCount / displayLimit) * 100, 100);

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-purple-700">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Usage & Pricing
            </h3>
            <div className="mt-1">
              <span className="text-lg font-bold text-purple-600">
                {isLoading ? "..." : usageCount} books
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
              {isSubscribed ? 'Current month' : 'Estimated cost'}
            </div>
          </div>
        </div>

        {/* Progress bar for current tier */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentTier.name} tier</span>
            <span>
              {currentTier.max === Infinity 
                ? `${currentTier.min}+ books` 
                : `${currentTier.min}-${currentTier.max} books`}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        {/* Subscription status and actions */}
        <div className="space-y-3">
          {!isSubscribed && usageCount > 5 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    You're using the pay-as-you-go pricing. 
                    Subscribe now to activate usage-based billing.
                  </p>
                  <div className="mt-2">
                    <SubscribeButton 
                      className="text-xs px-3 py-1 h-7 bg-purple-600 hover:bg-purple-700"
                    >
                      <Crown className="mr-1 h-3 w-3" />
                      Subscribe Now
                    </SubscribeButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {nextTier && usageCount > currentTier.max * 0.8 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Next tier: {nextTier.name}</p>
                <p>
                  {nextTier.max === Infinity 
                    ? `${nextTier.min}+ books for $${nextTier.price}/month`
                    : `${nextTier.min}-${nextTier.max} books for $${nextTier.price}/month`
                  }
                </p>
              </div>
            </div>
          )}

          {usageCount <= 5 && !isSubscribed && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  You're on the free tier! Enjoying up to 5 books per month.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
