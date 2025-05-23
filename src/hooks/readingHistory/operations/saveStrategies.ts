
import { supabase } from '@/integrations/supabase/client';
import { ReadingHistoryEntry } from '../types';
import { removeDuplicateEntries } from '../utils/duplicateUtils';
import { useToast } from '@/hooks/use-toast';
import { findExistingEntry, findExistingEntryBySource } from './findOperations';

/**
 * Save entry to Supabase
 */
export const saveToSupabase = async (
  entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>,
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  user: any,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    // First check for existing entry with the same content_id
    let existingEntry = findExistingEntry(history, entry.content_id);
    
    // If no entry with matching content_id was found and we have a source URL,
    // check for an entry with the same source URL
    if (!existingEntry && entry.source) {
      const sourceMatch = findExistingEntryBySource(history, entry.source);
      if (sourceMatch) {
        console.log(`Found existing entry with matching source URL: ${entry.source}`);
        existingEntry = sourceMatch;
        // Update the content_id to match the existing entry to ensure consistency
        entry.content_id = sourceMatch.content_id;
      }
    }
    
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
          item.id === existingEntry?.id 
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
      // Don't create new entries without summaries and with generic titles
      if (entry.title === "Reading Session" && !entry.summary) {
        console.log("Skipping creation of generic reading session with no summary");
        return null;
      }
      
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
};

/**
 * Save entry to localStorage
 */
export const saveToLocalStorage = (
  entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>,
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    const localHistory: ReadingHistoryEntry[] = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    // Check for existing entry with the same content_id
    const existingEntry = findExistingEntry(localHistory, entry.content_id);
    
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
      // Don't create new entries without summaries and with generic titles
      if (entry.title === "Reading Session" && !entry.summary) {
        console.log("Skipping local creation of generic reading session with no summary");
        return null;
      }
      
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
};
