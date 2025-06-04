import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Crown, 
  CheckCircle, 
  Settings, 
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ExternalLink,
  DollarSign,
  User,
  Heart,
  Key,
  Plus,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionQuery, useUsageQuery } from "@/hooks/useSubscriptionQuery";
import { getCurrentTier, getNextTier, calculateExpectedCost, pricingTiers, getAvailableTierChanges, isUpgrade, getPriceIdForTier } from "@/lib/stripe";
import SubscribeButton from "@/components/SubscribeButton";
import SubscriptionUpgrade from "@/components/SubscriptionUpgrade";
import { supabase } from "@/integrations/supabase/client";

const Account = () => {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Content preferences state
  const [interests, setInterests] = useState<string[]>([
    'Technology', 'Science', 'Business' // Default interests - will load from DB later
  ]);
  const [newInterest, setNewInterest] = useState('');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { user, signOut } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionQuery();
  const { usage, isLoading: usageLoading } = useUsageQuery();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to get tier info from database subscription
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

  const handleManageSubscription = async () => {
    if (!user || !subscription?.stripe_customer_id) {
      toast({
        title: "No subscription found",
        description: "You need an active subscription to manage billing",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingPortal(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Failed to open billing portal",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleResetSubscription = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'inactive',
          tier: 'free',
          books_limit: 5,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: null,
          current_period_start: null,
          current_period_end: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Subscription reset",
        description: "Your subscription has been reset to free tier",
      });

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error resetting subscription:', error);
      toast({
        title: "Reset failed",
        description: "Failed to reset subscription",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Content Preferences Functions
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
      toast({
        title: "Interest added",
        description: `Added "${newInterest.trim()}" to your interests`,
      });
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
    toast({
      title: "Interest removed",
      description: `Removed "${interest}" from your interests`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addInterest();
    }
  };

  // Password Change Functions
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed",
      });

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Failed to change password",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="p-6 sm:p-8 text-center max-w-md w-full">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">You need to be signed in to view your account</p>
          <Button asChild className="w-full">
            <a href="/login">Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  const usageCount = usage?.count ?? 0;
  const isLoading = subscriptionLoading || usageLoading;
  
  // Get current tier from subscription database, not from usage calculation
  const currentTier = getCurrentTierFromSubscription();
  const nextTier = getNextTier(usageCount);
  
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Professional Header */}
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Navigation and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <div className="hidden sm:block h-6 w-px bg-border"></div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">Your Account</span>
                    <span className="sm:hidden">Account</span>
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Subscription & Settings
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()}
                className="px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="subscription" className="flex items-center gap-2 text-xs sm:text-sm">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Subscription</span>
              <span className="sm:hidden">Plans</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm">
              <Key className="h-3 w-3 sm:h-4 sm:w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Current Subscription */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <h2 className="text-lg sm:text-xl font-semibold">Subscription Status</h2>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Loading subscription data...</span>
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-medium">
                          {isSubscribed ? currentTier.name : 'Free Plan'}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {isSubscribed 
                            ? `${currentTier.name} tier - ${booksLimit === 999999 ? 'Unlimited' : booksLimit} books/month`
                            : 'Free tier with basic features'}
                        </p>
                      </div>
                      <div>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                      </div>
                    </div>

                    {subscription.current_period_end && isSubscribed && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>
                          <span className="hidden sm:inline">Next billing: </span>
                          <span className="sm:hidden">Billing: </span>
                          {formatDate(subscription.current_period_end)}
                        </span>
                      </div>
                    )}

                    {/* Show different buttons based on subscription status */}
                    {!isSubscribed ? (
                      <div className="space-y-3">
                        <SubscribeButton 
                          className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                          tier="starter"
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Subscribe to Usage-Based Billing</span>
                          <span className="sm:hidden">Subscribe Now</span>
                        </SubscribeButton>
                        
                        {/* Show reset button if there's an invalid subscription state */}
                        {subscription?.status === 'active' && !subscription?.stripe_customer_id && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                            <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 mb-2">
                              ⚠️ Invalid subscription state detected. This subscription is marked as active but not connected to Stripe.
                            </p>
                            <Button 
                              onClick={handleResetSubscription}
                              variant="outline"
                              size="sm"
                              className="w-full border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Reset to Free Tier
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={isLoadingPortal}
                        className="w-full text-sm sm:text-base"
                        variant="outline"
                      >
                        {isLoadingPortal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Manage Billing</span>
                            <span className="sm:hidden">Manage</span>
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">No subscription found</p>
                )}
              </Card>

              {/* Usage and Pricing */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-semibold">
                    <span className="hidden sm:inline">Current Usage & Cost</span>
                    <span className="sm:hidden">Usage & Cost</span>
                  </h2>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Loading usage data...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {usageCount}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          <span className="hidden sm:inline">Books This Month</span>
                          <span className="sm:hidden">Books</span>
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                          ${currentCost.toFixed(2)}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {isSubscribed ? 'Monthly Cost' : 'Would Cost'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Current tier: {currentTier.name}</span>
                        <span>
                          {booksLimit === 999999 
                            ? 'Unlimited books' 
                            : `${usageCount}/${booksLimit} books`}
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                      
                      {/* Show limit warning */}
                      {booksLimit !== 999999 && usageCount > booksLimit * 0.8 && (
                        <p className="text-xs sm:text-sm text-orange-600">
                          ⚠️ You're approaching your {booksLimit} book limit for this tier
                        </p>
                      )}
                    </div>

                    {/* Show tier upgrade suggestion based on current subscription */}
                    {isSubscribed && currentTier.name !== 'Unlimited' && usageCount > booksLimit * 0.8 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                        <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200">
                          📈 Consider upgrading for more books or unlimited access!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Subscription Management for Active Subscribers */}
            {isSubscribed && !isLoading && (
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <h2 className="text-lg sm:text-xl font-semibold">Subscription Management</h2>
                </div>
                
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm sm:text-base">Current Billing Information</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-center">
                        <span>Status:</span>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Subscription Tier:</span>
                        <span className="font-medium">{currentTier.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Books Limit:</span>
                        <span className="font-medium">
                          {booksLimit === 999999 ? 'Unlimited' : `${booksLimit} books`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Usage:</span>
                        <span className="font-medium">{usageCount} books</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span className="font-medium text-green-600">${currentCost.toFixed(2)}</span>
                      </div>
                      {subscription.current_period_end && (
                        <div className="flex justify-between">
                          <span>Next Billing:</span>
                          <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm sm:text-base">Manage Your Subscription</h3>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={isLoadingPortal || !subscription.stripe_customer_id}
                        className="w-full text-xs sm:text-sm"
                        variant="outline"
                      >
                        {isLoadingPortal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Update Payment Method</span>
                            <span className="sm:hidden">Update Payment</span>
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={isLoadingPortal || !subscription.stripe_customer_id}
                        variant="outline"
                        className="w-full text-xs sm:text-sm"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">View Billing History</span>
                        <span className="sm:hidden">Billing History</span>
                      </Button>
                      
                      <div className="pt-2 text-xs text-muted-foreground">
                        💡 Use the billing portal to update payment methods, view invoices, or cancel your subscription.
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Pricing Information */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h2 className="text-lg sm:text-xl font-semibold">Pricing Tiers</h2>
              </div>
              
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pricingTiers.map((tier, index) => {
                  // Check if this is the user's current subscription tier
                  const isSubscribedToThisTier = isSubscribed && currentTier.name === tier.name;
                  const canChangeToThisTier = isSubscribed && !isSubscribedToThisTier && tier.price > 0;
                  
                  return (
                    <Card key={index} className={`p-3 sm:p-4 transition-colors ${
                      isSubscribedToThisTier ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border hover:border-gray-300'
                    }`}>
                      <div className="space-y-3">
                        <div className="text-center">
                          <h3 className="font-semibold text-sm sm:text-base">{tier.name}</h3>
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            ${tier.price.toFixed(2)}
                            <span className="text-xs sm:text-sm text-muted-foreground">/mo</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {tier.max === Infinity 
                              ? `${tier.min}+ books` 
                              : `${tier.min}-${tier.max} books`}
                          </p>
                        </div>
                        
                        <div className="text-center space-y-2">
                          {/* Show badges */}
                              
                          {isSubscribedToThisTier && (
                            <Badge className="bg-purple-500 text-xs">Your Current Tier</Badge>
                          )}
                          
                          {tier.price === 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              Free Tier
                            </Badge>
                          )}

                          {/* Action buttons */}
                          <div className="pt-2">
                            {tier.price === 0 ? (
                              <div className="text-xs text-muted-foreground">
                                No subscription needed
                              </div>
                            ) : !isSubscribed ? (
                              <SubscribeButton 
                                className="w-full text-xs px-2 sm:px-3 py-2 bg-purple-600 hover:bg-purple-700"
                                tier={tier.name.toLowerCase()}
                              >
                                <Crown className="mr-1 h-3 w-3" />
                                <span className="hidden sm:inline">Subscribe Now</span>
                                <span className="sm:hidden">Subscribe</span>
                              </SubscribeButton>
                            ) : isSubscribedToThisTier ? (
                              <div className="text-xs text-green-600 font-medium">
                                ✓ Current Plan
                              </div>
                            ) : canChangeToThisTier ? (
                              <SubscriptionUpgrade
                                currentTier={subscription.tier}
                                targetTier={tier.name.toLowerCase()}
                                targetTierPrice={tier.price}
                                className="w-full text-xs px-2 sm:px-3 py-2"
                              >
                                {isUpgrade(subscription.tier, tier.name.toLowerCase()) ? (
                                  <>
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    Upgrade
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown className="mr-1 h-3 w-3" />
                                    Downgrade
                                  </>
                                )}
                              </SubscriptionUpgrade>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Already subscribed
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-center space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">💡 How Subscription Changes Work</h4>
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Upgrades:</strong> Take effect immediately with prorated billing - you'll be charged the difference right away.
                    </p>
                    <p>
                      <strong>Downgrades:</strong> Take effect at the end of your current billing period - you'll continue with current benefits until then.
                    </p>
                    <p className="hidden sm:block">
                      Each tier has a fixed monthly price and book limit. Choose the tier that best fits your reading habits.
                    </p>
                  </div>
                  
                  {isSubscribed ? (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                      <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                        🎉 <strong>You're subscribed!</strong> Current tier: <strong>{currentTier.name}</strong>.
                        You're paying <strong>${currentCost.toFixed(2)}</strong>/month for up to <strong>{booksLimit === 999999 ? 'unlimited' : booksLimit}</strong> books.
                        You've used <strong>{usageCount}</strong> books this month.
                        {subscription?.current_period_end && (
                          <span> Next billing: {formatDate(subscription.current_period_end)}.</span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        📚 <strong>Ready to read more?</strong> Subscribe to unlock more books with our tiered pricing plans.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!isSubscribed && (
                <div className="mt-4 text-center">
                  <SubscribeButton 
                    className="bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                    tier="starter"
                  >
                    <Crown className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    Subscribe to Get Started
                  </SubscribeButton>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <h2 className="text-lg sm:text-xl font-semibold">Security Settings</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">Change Password</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure. Make sure to use a strong password.
                  </p>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password" className="text-xs sm:text-sm">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          placeholder="Enter your current password"
                          className="pr-10 text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password" className="text-xs sm:text-sm">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          placeholder="Enter your new password (min. 6 characters)"
                          className="pr-10 text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password" className="text-xs sm:text-sm">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="Confirm your new password"
                          className="pr-10 text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="w-full text-sm sm:text-base"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-medium mb-2 text-red-600">Danger Zone</h3>
                  <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 mb-3">
                      ⚠️ <strong>Account Deletion:</strong> This action cannot be undone. All your data, reading history, and subscription will be permanently deleted.
                    </p>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => toast({
                        title: "Feature Coming Soon",
                        description: "Account deletion will be available in a future update.",
                      })}
                      className="w-full sm:w-auto"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account; 