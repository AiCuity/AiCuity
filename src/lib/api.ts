import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export interface UsageData {
  count: number;
  month: string;
  year: number;
}

export interface SubscriptionWithUsage extends Subscription {
  usage?: UsageData;
}

// API service functions
export const apiService = {
  // Fetch user usage data
  async fetchUsage(userId: string): Promise<UsageData> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/usage/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch usage: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Fetch subscription from Supabase
  async fetchSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  },

  // Create default subscription if none exists
  async createDefaultSubscription(userId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier: 'free',
        books_limit: 5,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return data;
  },

  // Update subscription
  async updateSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data;
  },

  // Fetch subscription with usage data combined
  async fetchSubscriptionWithUsage(userId: string): Promise<SubscriptionWithUsage | null> {
    try {
      const [subscription, usage] = await Promise.all([
        this.fetchSubscription(userId),
        this.fetchUsage(userId).catch(() => ({ count: 0, month: new Date().toISOString().slice(0, 7), year: new Date().getFullYear() }))
      ]);

      if (!subscription) {
        // Create default subscription if none exists
        const newSubscription = await this.createDefaultSubscription(userId);
        return {
          ...newSubscription,
          usage
        };
      }

      return {
        ...subscription,
        usage
      };
    } catch (error) {
      console.error('Error fetching subscription with usage:', error);
      throw error;
    }
  }
};

// Query keys for React Query
export const queryKeys = {
  subscription: (userId: string) => ['subscription', userId] as const,
  usage: (userId: string) => ['usage', userId] as const,
  subscriptionWithUsage: (userId: string) => ['subscription-with-usage', userId] as const,
}; 