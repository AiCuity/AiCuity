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
    // Prevent saving of meaningless generic sessions
    if (entry.title === "Reading Session" && !entry.summary && (!entry.parsed_text || entry.parsed_text.length < 100)) {
      console.log("Skipping creation of generic reading session with insufficient content");
      return null;
    }

    // Make sure wpm is a valid number
    if (!entry.wpm || typeof entry.wpm !== 'number') {
      entry.wpm = 300; // Default to 300 WPM if missing or invalid
    }

    // First check for existing entry with the same content_id
    let existingEntry = findExistingEntry(history, entry.content_id);
    
    // If no entry with matching content_id was found and we have a source URL,
    // check for an entry with the same source URL (for web content)
    if (!existingEntry && entry.source && entry.source.startsWith('http')) {
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
          total_words: entry.total_words,
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
                total_words: entry.total_words || item.total_words,
                summary: entry.summary || item.summary, 
                updated_at: new Date().toISOString() 
              }
            : item
        );
        
        return removeDuplicateEntries(updatedEntries);
      });

      return data;
    } else {
      // Don't create new entries without meaningful content
      if (entry.title === "Reading Session" && !entry.summary && (!entry.parsed_text || entry.parsed_text.length < 200)) {
        console.log("Skipping creation of generic reading session with no summary and insufficient content");
        console.log("DEBUG: title =", entry.title, "summary =", entry.summary, "parsed_text length =", entry.parsed_text?.length);
        return null;
      }

      // Additional check: Don't create entries for very short content without titles
      if (!entry.title || entry.title.trim() === "" || (entry.title === "Reading Session" && (!entry.parsed_text || entry.parsed_text.length < 500))) {
        console.log("Skipping creation of entry with insufficient title or content");
        console.log("DEBUG: title =", `"${entry.title}"`, "title trimmed =", `"${entry.title?.trim()}"`, "parsed_text length =", entry.parsed_text?.length);
        return null;
      }

      console.log('Creating new entry in Supabase for content_id:', entry.content_id);
      
      console.log('Creating new entry in Supabase for total_words:', entry.total_words);
      console.log('Entry object being saved:', {
        title: entry.title,
        content_id: entry.content_id,
        total_words: entry.total_words,
        wpm: entry.wpm,
        current_position: entry.current_position,
        source: entry.source,
        source_type: entry.source_type,
        parsed_text_length: entry.parsed_text?.length
      });
      
      // Create new entry
      const { data, error } = await supabase
        .from('reading_history')
        .insert({
          title: entry.title,
          source: entry.source,
          content_id: entry.content_id,
          wpm: entry.wpm,
          current_position: entry.current_position,
          total_words: entry.total_words,
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
    // Removed toast notification
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
    
    // Prevent saving of meaningless generic sessions
    if (entry.title === "Reading Session" && !entry.summary && (!entry.parsed_text || entry.parsed_text.length < 100)) {
      console.log("Skipping local creation of generic reading session with insufficient content");
      return null;
    }

    // Make sure wpm is a valid number
    if (!entry.wpm || typeof entry.wpm !== 'number') {
      entry.wpm = 300; // Default to 300 WPM if missing or invalid
    }
    
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
              total_words: entry.total_words || item.total_words, // Preserve existing total_words if not provided
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
      // Don't create new entries without meaningful content
      if (entry.title === "Reading Session" && !entry.summary && (!entry.parsed_text || entry.parsed_text.length < 200)) {
        console.log("Skipping local creation of generic reading session with no summary and insufficient content");
        return null;
      }

      // Additional check: Don't create entries for very short content without titles
      if (!entry.title || entry.title.trim() === "" || (entry.title === "Reading Session" && (!entry.parsed_text || entry.parsed_text.length < 500))) {
        console.log("Skipping local creation of entry with insufficient title or content");
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
    // Removed toast notification
    return null;
  }
};
