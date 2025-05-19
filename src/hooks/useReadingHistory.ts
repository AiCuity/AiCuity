
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ReadingHistoryItem } from '@/utils/types';

export type ReadingHistoryEntry = {
  id: string;
  title: string;
  source: string | null;
  source_type: string;
  source_input: string;
  parsed_text?: string | null;
  wpm: number;
  current_position: number | null;
  calibrated: boolean | null;
  created_at: string;
  updated_at: string;
  summary: string | null;
  content_id: string;
};

export function useReadingHistory() {
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
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform data to ensure it matches the ReadingHistoryEntry interface
        const transformedData: ReadingHistoryEntry[] = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          source: item.source,
          // Add default values for fields that might not exist in the database
          source_type: 'unknown',  // Default value since it doesn't exist in the DB schema
          source_input: item.source || item.title || '',
          parsed_text: null,  // Default value since it doesn't exist in the DB schema
          wpm: item.wpm,
          current_position: item.current_position,
          calibrated: false,  // Default value since it doesn't exist in the DB schema
          created_at: item.created_at,
          updated_at: item.updated_at,
          summary: item.summary,
          content_id: item.content_id
        }));

        setHistory(transformedData);
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
          // Transform local data to ensure it matches ReadingHistoryEntry
          const parsedHistory = JSON.parse(localHistory);
          const transformedLocalData: ReadingHistoryEntry[] = parsedHistory.map((item: any) => ({
            id: item.id,
            title: item.title,
            source: item.source,
            // Add default values for potentially missing fields in localStorage
            source_type: item.source_type || 'unknown',
            source_input: item.source_input || item.source || item.title || '',
            parsed_text: item.parsed_text || null,
            wpm: item.wpm,
            current_position: item.current_position,
            calibrated: item.calibrated !== null ? item.calibrated : false,
            created_at: item.created_at,
            updated_at: item.updated_at,
            summary: item.summary,
            content_id: item.content_id
          }));
          
          setHistory(transformedLocalData);
        }
      } catch (error) {
        console.error('Error parsing local reading history:', error);
        setHistory([]);
      }
    }

    setIsLoading(false);
  };

  // Save reading history entry
  const saveHistoryEntry = async (entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (user) {
      try {
        // Save to Supabase if user is logged in
        const { data, error } = await supabase
          .from('reading_history')
          .insert({
            title: entry.title,
            source: entry.source,
            content_id: entry.content_id,
            wpm: entry.wpm,
            current_position: entry.current_position,
            summary: entry.summary,
            user_id: user.id
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: 'Reading session saved',
          description: 'Your reading session has been saved to your history.',
        });

        return data;
      } catch (error) {
        console.error('Error saving reading history:', error);
        toast({
          title: 'Error',
          description: 'Failed to save reading session.',
          variant: 'destructive',
        });
        return null;
      }
    } else {
      // Save to localStorage if user is not logged in
      try {
        const localHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        const newEntry = {
          ...entry,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        localStorage.setItem('readingHistory', JSON.stringify([newEntry, ...localHistory]));
        
        toast({
          title: 'Reading session saved',
          description: 'Your reading session has been saved locally.',
        });
        
        return newEntry;
      } catch (error) {
        console.error('Error saving local reading history:', error);
        toast({
          title: 'Error',
          description: 'Failed to save reading session locally.',
          variant: 'destructive',
        });
        return null;
      }
    }
  };

  // Delete reading history entry
  const deleteHistoryEntry = async (id: string) => {
    if (user) {
      try {
        // Delete from Supabase if user is logged in
        const { error } = await supabase
          .from('reading_history')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        setHistory(history.filter(entry => entry.id !== id));
        
        toast({
          title: 'Entry deleted',
          description: 'Reading history entry has been deleted.',
        });
        
        return true;
      } catch (error) {
        console.error('Error deleting reading history:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete reading history entry.',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      // Delete from localStorage if user is not logged in
      try {
        const localHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        const updatedHistory = localHistory.filter((entry: ReadingHistoryEntry) => entry.id !== id);
        
        localStorage.setItem('readingHistory', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
        
        toast({
          title: 'Entry deleted',
          description: 'Reading history entry has been deleted.',
        });
        
        return true;
      } catch (error) {
        console.error('Error deleting local reading history:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete reading history entry.',
          variant: 'destructive',
        });
        return false;
      }
    }
  };

  // Load history on component mount or when user changes
  useEffect(() => {
    fetchHistory();
  }, [user]);

  return {
    history,
    isLoading,
    saveHistoryEntry,
    deleteHistoryEntry,
    refreshHistory: fetchHistory,
  };
}
