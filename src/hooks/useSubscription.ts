import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        // If no subscription exists, create a default free one
        console.log('No subscription found, creating default free subscription');
        const { data: newSubscription, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            tier: 'free',
            books_limit: 5,
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }
        console.log('Created new subscription:', newSubscription);
        setSubscription(newSubscription);
      } else {
        console.log('Found existing subscription:', data);
        setSubscription(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      console.error('Error fetching subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (updates: Partial<Subscription>) => {
    if (!user || !subscription) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSubscription(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      throw err;
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Set up real-time subscription to subscription changes
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
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    subscription,
    isLoading,
    error,
    fetchSubscription,
    updateSubscription
  };
}; 