import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { stripePromise, stripeProduct, getPriceIdForTier } from "@/lib/stripe";

interface SubscribeButtonProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  tier?: string;
}

export default function SubscribeButton({ 
  className = "", 
  children = "Subscribe",
  disabled = false,
  tier = ""
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    // Get the appropriate price ID for the tier
    const priceId = tier ? getPriceIdForTier(tier) : stripeProduct.priceId;

    if (!priceId) {
      toast({
        title: "Configuration error",
        description: "Subscription not configured properly",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session for the tiered product
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.id,
          productId: stripeProduct.productId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({
        title: "Subscription failed",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      disabled={isLoading || !user || disabled}
      className={className}
      onClick={handleSubscribe}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting checkout...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
