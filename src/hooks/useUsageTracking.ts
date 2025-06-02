import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useUsageTracking() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Increment usage for the current user
  const incrementUsage = useCallback(async () => {
    if (!user?.id) {
      console.warn('No user ID available for usage tracking');
      return false;
    }

    try {
      console.log('Incrementing usage for user:', user.id);
      
      // Try API first, fallback to Supabase function
      try {
        await apiService.incrementUsage(user.id);
        console.log('Successfully incremented usage via API');
      } catch (apiError) {
        console.warn('API increment failed, trying Supabase function:', apiError);
        await apiService.incrementUsageViaSupabase(user.id);
        console.log('Successfully incremented usage via Supabase');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to increment usage:', error);
      
      // Show user-friendly error message
      toast({
        title: "Usage tracking error",
        description: "There was an issue tracking your usage. Your content was processed successfully.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, toast]);

  // Get current usage for the user
  const getCurrentUsage = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      console.warn('No user ID available for usage tracking');
      return 0;
    }

    try {
      // Try API first, fallback to Supabase function
      try {
        const usage = await apiService.fetchUsage(user.id);
        return usage.count;
      } catch (apiError) {
        console.warn('API fetch failed, trying Supabase function:', apiError);
        return await apiService.getCurrentUsageViaSupabase(user.id);
      }
    } catch (error) {
      console.error('Failed to get current usage:', error);
      return 0;
    }
  }, [user?.id]);

  // Check if user has reached their limit (requires subscription data)
  const checkUsageLimit = useCallback(async (limit: number): Promise<{ 
    hasReachedLimit: boolean; 
    usage: number; 
    remaining: number 
  }> => {
    const usage = await getCurrentUsage();
    const hasReachedLimit = usage >= limit;
    const remaining = Math.max(0, limit - usage);

    return {
      hasReachedLimit,
      usage,
      remaining
    };
  }, [getCurrentUsage]);

  return {
    incrementUsage,
    getCurrentUsage,
    checkUsageLimit,
    userId: user?.id
  };
} 