import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiService, queryKeys, SubscriptionWithUsage } from '@/lib/api';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export const useSubscriptionQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for subscription data
  const subscriptionQuery = useQuery({
    queryKey: queryKeys.subscription(user?.id || ''),
    queryFn: () => apiService.fetchSubscription(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds - subscription data is important and changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for updating subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ updates }: { updates: Partial<Subscription> }) =>
      apiService.updateSubscription(user!.id, updates),
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(queryKeys.subscription(user!.id), data);
    },
    onError: (error) => {
      console.error('Failed to update subscription:', error);
    },
  });

  // Set up real-time subscription updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            // Update the query cache with real-time data
            queryClient.setQueryData(
              queryKeys.subscription(user.id), 
              payload.new as Subscription
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, queryClient]);

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    error: subscriptionQuery.error,
    isError: subscriptionQuery.isError,
    updateSubscription: updateSubscriptionMutation.mutate,
    isUpdating: updateSubscriptionMutation.isPending,
    refetch: subscriptionQuery.refetch,
  };
};

export const useUsageQuery = () => {
  const { user } = useAuth();

  const usageQuery = useQuery({
    queryKey: queryKeys.usage(user?.id || ''),
    queryFn: () => apiService.fetchUsage(user!.id),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute - usage updates are important
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    usage: usageQuery.data,
    isLoading: usageQuery.isLoading,
    error: usageQuery.error,
    isError: usageQuery.isError,
    refetch: usageQuery.refetch,
  };
};

export const useSubscriptionWithUsageQuery = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.subscriptionWithUsage(user?.id || ''),
    queryFn: () => apiService.fetchSubscriptionWithUsage(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: query.data,
    subscription: query.data,
    usage: query.data?.usage,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  };
}; 