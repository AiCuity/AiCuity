import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService, queryKeys, AdminUserOverview } from '@/lib/api';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function useAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin status with React Query
  const adminStatusQuery = useQuery({
    queryKey: queryKeys.adminStatus(user?.id || ''),
    queryFn: () => apiService.checkAdminStatus(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const isAdmin = adminStatusQuery.data?.isAdmin || false;
  const isCheckingAdmin = adminStatusQuery.isLoading;

  // Fetch all users (admin only)
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: apiService.fetchAllUsers,
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30 seconds - admin data should be fresh
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Set up real-time subscriptions for admin data
  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to profile changes (role updates)
    const profileSubscription = supabase
      .channel('admin-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile changed:', payload);
          // Invalidate users query to refetch data
          queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
        }
      )
      .subscribe();

    // Subscribe to subscription changes
    const subscriptionSubscription = supabase
      .channel('admin-subscriptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          // Invalidate users query to refetch data
          queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
        }
      )
      .subscribe();

    // Subscribe to usage tracking changes
    const usageSubscription = supabase
      .channel('admin-usage')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_tracking'
        },
        (payload) => {
          console.log('Usage changed:', payload);
          // Invalidate users query to refetch data
          queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
      subscriptionSubscription.unsubscribe();
      usageSubscription.unsubscribe();
    };
  }, [isAdmin, queryClient]);

  // Mutation for updating user subscription
  const updateUserSubscriptionMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<Subscription> }) =>
      apiService.updateUserSubscription(userId, updates),
    onSuccess: (_, { userId }) => {
      toast({
        title: 'Success',
        description: 'User subscription updated successfully.',
      });
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user subscription.',
        variant: 'destructive'
      });
    },
  });

  // Mutation for updating user role
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' | 'super_admin' }) => {
      // Check if trying to promote to admin and if current user is super_admin
      if ((role === 'admin' || role === 'super_admin') && adminStatusQuery.data?.role !== 'super_admin') {
        throw new Error('Only super admins can promote users to admin roles.');
      }
      return apiService.updateUserRole(userId, role);
    },
    onSuccess: (_, { role }) => {
      toast({
        title: 'Success',
        description: `User role updated to ${role} successfully.`,
      });
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role.',
        variant: 'destructive'
      });
    },
  });

  // Mutation for adjusting user usage
  const adjustUserUsageMutation = useMutation({
    mutationFn: ({ userId, newCount }: { userId: string; newCount: number }) =>
      apiService.adjustUserUsage(userId, newCount),
    onMutate: async ({ userId, newCount }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.adminUsers() });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<AdminUserOverview[]>(queryKeys.adminUsers());

      // Optimistically update the cache
      if (previousUsers) {
        const updatedUsers = previousUsers.map(user => 
          user.id === userId 
            ? { ...user, current_month_usage: newCount }
            : user
        );
        queryClient.setQueryData(queryKeys.adminUsers(), updatedUsers);
      }

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User usage updated successfully.',
      });
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.adminUsers(), context.previousUsers);
      }
      console.error('Error adjusting user usage:', error);
      toast({
        title: 'Error',
        description: 'Failed to adjust user usage.',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have accurate data
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
    },
  });

  // Mutation for inviting admin
  const inviteAdminMutation = useMutation({
    mutationFn: (email: string) => {
      // Check if current user is super_admin
      if (adminStatusQuery.data?.role !== 'super_admin') {
        throw new Error('Only super admins can invite new admins.');
      }
      return apiService.inviteAdmin(email);
    },
    onSuccess: (_, email) => {
      toast({
        title: 'Success',
        description: `Admin invitation sent to ${email}.`,
      });
    },
    onError: (error) => {
      console.error('Error inviting admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send admin invitation.',
        variant: 'destructive'
      });
    },
  });

  // Convenience functions that use the mutations
  const updateUserSubscription = (userId: string, updates: Partial<Subscription>) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin permissions.',
        variant: 'destructive'
      });
      return;
    }
    updateUserSubscriptionMutation.mutate({ userId, updates });
  };

  const updateUserRole = (userId: string, role: 'user' | 'admin' | 'super_admin') => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin permissions.',
        variant: 'destructive'
      });
      return;
    }
    updateUserRoleMutation.mutate({ userId, role });
  };

  const adjustUserUsage = (userId: string, newCount: number) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin permissions.',
        variant: 'destructive'
      });
      return;
    }
    adjustUserUsageMutation.mutate({ userId, newCount });
  };

  const inviteAdmin = (email: string) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin permissions.',
        variant: 'destructive'
      });
      return;
    }
    inviteAdminMutation.mutate(email);
  };

  return {
    // Data
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isAdmin,
    isCheckingAdmin,
    userRole: adminStatusQuery.data?.role || 'user',
    
    // Actions
    updateUserSubscription,
    updateUserRole,
    adjustUserUsage,
    inviteAdmin,
    
    // Mutation states
    isUpdatingSubscription: updateUserSubscriptionMutation.isPending,
    isUpdatingRole: updateUserRoleMutation.isPending,
    isAdjustingUsage: adjustUserUsageMutation.isPending,
    isInviting: inviteAdminMutation.isPending,
    
    // Manual refetch (if needed)
    refetchUsers: usersQuery.refetch,
    refetchAdminStatus: adminStatusQuery.refetch,
  };
} 