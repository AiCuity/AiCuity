import { useState, useEffect } from 'react';
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

  const fetchHistory = async () => {
    setIsLoading(true);

    if (user) {
      try {
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
        setHistory(uniqueEntries);
      } catch (error) {
        console.error('Error fetching reading history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reading history.',
          variant: 'destructive',
        });
        setHistory([]);
      }
    } else {
      // Fetch from localStorage if user is not logged in
      try {
        const localHistory = localStorage.getItem('readingHistory');
        if (localHistory) {
          const parsedHistory = JSON.parse(localHistory);
          const transformedLocalData = transformHistoryData(parsedHistory, 'local');
          const uniqueEntries = removeDuplicateEntries(transformedLocalData);
          setHistory(uniqueEntries);
        }
      } catch (error) {
        console.error('Error parsing local reading history:', error);
        setHistory([]);
      }
    }

    setIsLoading(false);
  };

  // Load history on component mount or when user changes
  useEffect(() => {
    fetchHistory();
  }, [user]); // Fetch history when user changes

  return {
    history,
    isLoading,
    refreshHistory: fetchHistory,
  };
}
