import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export interface UsageData {
  count: number;
  month_year: string;
  period: {
    start: string;
    end: string;
  };
}

export interface SubscriptionWithUsage extends Subscription {
  usage?: UsageData;
}

// Add admin types
export type AdminUserOverview = Database['public']['Views']['admin_user_overview']['Row'];

// API service functions
export const apiService = {
  // Fetch user usage data from the new usage tracking system
  async fetchUsage(userId: string): Promise<UsageData> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/usage/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch usage: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Increment usage for a user (called when they upload/read content)
  async incrementUsage(userId: string): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/increment-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to increment usage: ${response.status} ${response.statusText}`);
    }
  },

  // Alternative method using Supabase function (if API is not available)
  async incrementUsageViaSupabase(userId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_user_usage', {
      p_user_id: userId
    });

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  },

  // Get current usage using Supabase function (fallback method)
  async getCurrentUsageViaSupabase(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_current_usage', {
      p_user_id: userId
    });

    if (error) {
      throw new Error(`Failed to get current usage: ${error.message}`);
    }

    return data || 0;
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
        this.fetchUsage(userId).catch(() => ({ 
          count: 0, 
          month_year: new Date().toISOString().slice(0, 7),
          period: {
            start: new Date().toISOString(),
            end: new Date().toISOString()
          }
        }))
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
  },

  // Admin-specific functions
  async fetchAllUsers(): Promise<AdminUserOverview[]> {
    const { data, error } = await supabase
      .from('admin_user_overview')
      .select('*')
      .order('profile_created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  },

  async updateUserSubscription(userId: string, updates: Partial<Subscription>): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update user subscription: ${error.message}`);
    }
  },

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  },

  async adjustUserUsage(userId: string, newCount: number): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        count: newCount
      }, {
        onConflict: 'user_id,month_year'
      });

    if (error) {
      throw new Error(`Failed to adjust user usage: ${error.message}`);
    }
  },

  async inviteAdmin(email: string): Promise<void> {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: 'admin'
      }
    });

    if (error) {
      throw new Error(`Failed to send admin invitation: ${error.message}`);
    }
  },

  async checkAdminStatus(userId: string): Promise<{ isAdmin: boolean; role: string }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to check admin status: ${error.message}`);
    }

    const isAdmin = data?.role === 'admin' || data?.role === 'super_admin';
    return { isAdmin, role: data?.role || 'user' };
  }
};

// Query keys for React Query
export const queryKeys = {
  subscription: (userId: string) => ['subscription', userId] as const,
  usage: (userId: string) => ['usage', userId] as const,
  subscriptionWithUsage: (userId: string) => ['subscription-with-usage', userId] as const,
  // Admin query keys
  adminUsers: () => ['admin', 'users'] as const,
  adminStatus: (userId: string) => ['admin', 'status', userId] as const,
}; 