
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ReadingHistoryEntry } from './types';
import { isSignificantSession, removeDuplicateEntries, calculateProgressPercentage } from './readingHistoryUtils';

export function useReadingHistoryOperations(
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  refreshHistory: () => Promise<void>
) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Find existing entry for the same content
  const findExistingEntry = (contentId: string): ReadingHistoryEntry | undefined => {
    return history.find(entry => entry.content_id === contentId);
  };

  // Save reading history entry
  const saveHistoryEntry = async (entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>) => {
    // Check if this is a significant session worth saving
    if (!isSignificantSession(entry)) {
      console.log("Skipping save for short generic reading session");
      return null;
    }
    
    const existingEntry = findExistingEntry(entry.content_id);
    
    // Calculate progress percentage for logging and notifications
    const progressPct = calculateProgressPercentage(entry.current_position, entry.parsed_text);
    console.log(`Saving entry for ${entry.title} at position ${entry.current_position} (${progressPct}%)`);
    
    if (user) {
      try {
        // Save to Supabase if user is logged in
        if (existingEntry) {
          // Update existing entry
          const { data, error } = await supabase
            .from('reading_history')
            .update({
              current_position: entry.current_position,
              wpm: entry.wpm,
              summary: entry.summary || existingEntry.summary,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id)
            .eq('user_id', user.id) // Ensure we only update entries belonging to this user
            .select()
            .single();

          if (error) {
            throw error;
          }
          
          // Update the entry in state
          setHistory(prev => {
            const updatedEntries = prev.map(item => 
              item.id === existingEntry.id 
                ? { 
                    ...item, 
                    current_position: entry.current_position, 
                    wpm: entry.wpm, 
                    summary: entry.summary || item.summary, 
                    updated_at: new Date().toISOString() 
                  }
                : item
            );
            
            return removeDuplicateEntries(updatedEntries);
          });

          return data;
        } else {
          // Create new entry
          const { data, error } = await supabase
            .from('reading_history')
            .insert({
              title: entry.title,
              source: entry.source,
              content_id: entry.content_id,
              wpm: entry.wpm,
              current_position: entry.current_position,
              summary: entry.summary,
              user_id: user.id // Ensure the user_id is set to the current user
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Transform the new entry to match our type
          const newEntry: ReadingHistoryEntry = {
            ...data,
            source_type: entry.source_type || 'unknown',
            source_input: data.source || data.title || '',
            parsed_text: entry.parsed_text || null,
            calibrated: entry.calibrated || false,
          };

          // Add to history state, ensuring no duplicates
          setHistory(prev => {
            const updatedEntries = [newEntry, ...prev];
            return removeDuplicateEntries(updatedEntries);
          });

          return data;
        }
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
        const localHistory: ReadingHistoryEntry[] = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        
        if (existingEntry) {
          // Update existing entry
          const updatedHistory = localHistory.map(item => 
            item.id === existingEntry.id 
              ? { 
                  ...item, 
                  current_position: entry.current_position, 
                  wpm: entry.wpm, 
                  summary: entry.summary || item.summary,
                  updated_at: new Date().toISOString()
                }
              : item
          );
          
          const uniqueHistory = removeDuplicateEntries(updatedHistory);
          localStorage.setItem('readingHistory', JSON.stringify(uniqueHistory));
          
          // Update state
          setHistory(uniqueHistory);
          
          return existingEntry;
        } else {
          // Create new entry
          const newEntry = {
            ...entry,
            id: `local-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const updatedHistory = [newEntry, ...localHistory];
          const uniqueHistory = removeDuplicateEntries(updatedHistory);
          localStorage.setItem('readingHistory', JSON.stringify(uniqueHistory));
          
          // Update state
          setHistory(uniqueHistory);
          
          return newEntry;
        }
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
          .eq('id', id)
          .eq('user_id', user.id); // Ensure we only delete entries belonging to this user

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

  return {
    saveHistoryEntry,
    deleteHistoryEntry,
    findExistingEntry
  };
}
