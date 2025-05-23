
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ReadingHistoryEntry } from './types';
import { transformHistoryData, removeDuplicateEntries } from './utils';

export function useFetchReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMounted = useRef(true);

  // Use useCallback to prevent recreation on each render
  const fetchHistory = useCallback(async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    console.log("Fetching reading history...");

    if (user) {
      try {
        console.log("Fetching from Supabase for user:", user.id);
        // Fetch from Supabase if user is logged in
        const { data, error } = await supabase
          .from('reading_history')
          .select('*')
          .eq('user_id', user.id) // Only fetch history for current user
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }
        
        // Transform and remove duplicates and entries without summaries
        const transformedData = transformHistoryData(data || []);
        const uniqueEntries = removeDuplicateEntries(transformedData);
        
        if (isMounted.current) {
          setHistory(uniqueEntries);
        }
      } catch (error) {
        console.error('Error fetching reading history:', error);
        if (isMounted.current) {
          toast({
            title: 'Error',
            description: 'Failed to load reading history.',
            variant: 'destructive',
          });
          setHistory([]);
        }
      }
    } else {
      // Fetch from localStorage if user is not logged in
      try {
        console.log("Fetching from localStorage");
        const localHistory = localStorage.getItem('readingHistory');
        if (localHistory) {
          const parsedHistory = JSON.parse(localHistory);
          const transformedLocalData = transformHistoryData(parsedHistory, 'local');
          const uniqueEntries = removeDuplicateEntries(transformedLocalData);
          
          if (isMounted.current) {
            setHistory(uniqueEntries);
          }
        }
      } catch (error) {
        console.error('Error parsing local reading history:', error);
        if (isMounted.current) {
          setHistory([]);
        }
      }
    }

    if (isMounted.current) {
      setIsLoading(false);
    }
    console.log("Reading history fetch complete");
  }, [user, toast]);

  // Load history on component mount or when user changes
  useEffect(() => {
    isMounted.current = true;
    fetchHistory();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchHistory]); // Only depend on the fetchHistory function

  return {
    history,
    isLoading,
    refreshHistory: fetchHistory,
  };
}
