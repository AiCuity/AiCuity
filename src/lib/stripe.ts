import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Tiered pricing structure based on usage volume
export const pricingTiers = [
  { min: 0, max: 5, price: 0, name: 'Free', description: 'Free tier with basic features' },
  { min: 6, max: 50, price: 5.00, name: 'Starter', description: 'Perfect for light readers' },
  // { min: 51, max: 100, price: 9.50, name: 'Basic', description: 'Great for regular readers' },
  { min: 51, max: 150, price: 13.50, name: 'Professional', description: 'For avid readers' },
  // { min: 151, max: 200, price: 17.50, name: 'Advanced', description: 'Heavy reading workload' },
  // { min: 201, max: 250, price: 20.00, name: 'Premium', description: 'Professional use' },
  { min: 251, max: 300, price: 22.00, name: 'Enterprise', description: 'Maximum capacity' },
  // { min: 301, max: Infinity, price: 30.00, name: 'Unlimited', description: 'No limits' }
];

// Your Stripe product configuration with multiple price IDs for different tiers
export const stripeProduct = {
  productId: import.meta.env.VITE_STRIPE_PRODUCT_ID || '',
  // Default price ID for the main subscription
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
  // Individual tier price IDs (if you have separate prices for each tier)
  tierPrices: {
    starter: import.meta.env.VITE_STRIPE_PRICE_ID_STARTER || import.meta.env.VITE_STRIPE_PRICE_ID || '',
    basic: import.meta.env.VITE_STRIPE_PRICE_ID_BASIC || import.meta.env.VITE_STRIPE_PRICE_ID || '',
    // professional: import.meta.env.VITE_STRIPE_PRICE_ID_PROFESSIONAL || import.meta.env.VITE_STRIPE_PRICE_ID || '',
    // advanced: import.meta.env.VITE_STRIPE_PRICE_ID_ADVANCED || import.meta.env.VITE_STRIPE_PRICE_ID || '',
    // premium: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM || import.meta.env.VITE_STRIPE_PRICE_ID || '',
    enterprise: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || import.meta.env.VITE_STRIPE_PRICE_ID || '',
    // unlimited: import.meta.env.VITE_STRIPE_PRICE_ID_UNLIMITED || import.meta.env.VITE_STRIPE_PRICE_ID || '',
  }
};

// Helper functions
export const getCurrentTier = (usage: number) => {
  return pricingTiers.find(tier => usage >= tier.min && usage <= tier.max) || pricingTiers[0];
};

export const getNextTier = (usage: number) => {
  const currentTierIndex = pricingTiers.findIndex(tier => usage >= tier.min && usage <= tier.max);
  return currentTierIndex < pricingTiers.length - 1 ? pricingTiers[currentTierIndex + 1] : null;
};

export const getMonthlyLimit = (tier: string) => {
  const tierMap: { [key: string]: number } = {
    'free': 5,
    'starter': 50,
    // 'basic': 100,
    'professional': 150,
    // 'advanced': 200,
    // 'premium': 250,
    'enterprise': 300,
    'unlimited': Infinity
  };
  return tierMap[tier.toLowerCase()] || 5;
};

export const calculateExpectedCost = (expectedUsage: number) => {
  const tier = getCurrentTier(expectedUsage);
  return tier.price;
};

export const getPriceIdForTier = (tierName: string): string => {
  const tierKey = tierName.toLowerCase() as keyof typeof stripeProduct.tierPrices;
  return stripeProduct.tierPrices[tierKey] || stripeProduct.priceId;
};

// Helper function to get tier level for comparison
export const getTierLevel = (tierName: string): number => {
  const tierLevels: { [key: string]: number } = {
    'free': 0,
    'starter': 1,
    'basic': 2,
    'professional': 3,
    'advanced': 4,
    'premium': 5,
    'enterprise': 6,
    'unlimited': 7,
    'usage_based': 1 // Treat as starter level for comparison
  };
  return tierLevels[tierName.toLowerCase()] || 0;
};

// Helper function to determine if tier change is upgrade or downgrade
export const isUpgrade = (currentTier: string, newTier: string): boolean => {
  return getTierLevel(newTier) > getTierLevel(currentTier);
};

// Helper function to get available tier changes
export const getAvailableTierChanges = (currentTier: string) => {
  const currentLevel = getTierLevel(currentTier);
  
  return pricingTiers
    .filter(tier => tier.price > 0) // Exclude free tier
    .map(tier => ({
      ...tier,
      level: getTierLevel(tier.name),
      isUpgrade: getTierLevel(tier.name) > currentLevel,
      isDowngrade: getTierLevel(tier.name) < currentLevel,
      isCurrent: getTierLevel(tier.name) === currentLevel
    }));
};

export type PricingTier = typeof pricingTiers[0]; 