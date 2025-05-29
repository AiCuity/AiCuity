import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, TrendingUp, TrendingDown, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPriceIdForTier, isUpgrade } from "@/lib/stripe";

interface SubscriptionUpgradeProps {
  currentTier: string;
  targetTier: string;
  targetTierPrice: number;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export default function SubscriptionUpgrade({ 
  currentTier,
  targetTier,
  targetTierPrice,
  className = "",
  children,
  onSuccess
}: SubscriptionUpgradeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const isUpgradeAction = isUpgrade(currentTier, targetTier);
  const priceId = getPriceIdForTier(targetTier.toLowerCase());

  const handleSubscriptionChange = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to change your subscription",
        variant: "destructive"
      });
      return;
    }

    if (!priceId) {
      toast({
        title: "Configuration error",
        description: "Tier configuration not found",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isUpgradeAction ? 'upgrade-subscription' : 'downgrade-subscription';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/subscription/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPriceId: priceId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change subscription');
      }

      const result = await response.json();

      if (isUpgradeAction) {
        // For upgrades, show payment confirmation
        toast({
          title: "Subscription Upgraded & Paid!",
          description: result.paymentProcessed 
            ? `Upgraded to ${result.newTier}! Payment of $${result.amountCharged?.toFixed(2) || '0.00'} processed successfully.`
            : `Upgraded to ${result.newTier} successfully.`,
        });
      } else {
        // For downgrades, show scheduling confirmation
        toast({
          title: "Downgrade Scheduled!",
          description: `Your subscription will be downgraded to ${result.newTier} on ${result.effectiveDate}.`,
        });
      }

      if (onSuccess) {
        onSuccess();
      }

      // Refresh the page to show updated subscription info
      if (result.effectiveImmediately) {
        setTimeout(() => window.location.reload(), 2000); // Slightly longer delay to show toast
      }

    } catch (error) {
      console.error('Error changing subscription:', error);
      
      // Handle specific payment errors
      if (error instanceof Error && error.message.includes('Payment failed')) {
        toast({
          title: "Payment Failed",
          description: "Please check your payment method and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Subscription change failed",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonIcon = isUpgradeAction ? TrendingUp : TrendingDown;
  const IconComponent = buttonIcon;

  return (
    <Button 
      disabled={isLoading}
      className={className}
      onClick={handleSubscriptionChange}
      variant={isUpgradeAction ? "default" : "outline"}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isUpgradeAction ? 'Upgrading...' : 'Scheduling...'}
        </>
      ) : (
        children || (
          <>
            <IconComponent className="mr-2 h-4 w-4" />
            {isUpgradeAction ? 'Upgrade' : 'Downgrade'} to {targetTier}
          </>
        )
      )}
    </Button>
  );
} 