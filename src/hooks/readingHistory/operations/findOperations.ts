
import { ReadingHistoryEntry } from '../types';

/**
 * Operations for finding existing reading history entries
 */
export const findExistingEntry = (history: ReadingHistoryEntry[], contentId: string): ReadingHistoryEntry | undefined => {
  return history.find(entry => entry.content_id === contentId);
};

/**
 * Find existing entry by source URL
 */
export const findExistingEntryBySource = (history: ReadingHistoryEntry[], source: string | null): ReadingHistoryEntry | undefined => {
  if (!source) return undefined;
  
  // Match against URL sources, ensuring proper comparison by normalizing URLs
  if (source.startsWith('http')) {
    return history.find(entry => {
      if (!entry.source) return false;
      
      // Simple matching, considering trailing slashes and protocols
      const normalizedEntrySource = entry.source.toLowerCase().replace(/\/$/, '').replace(/^https?:\/\//, '');
      const normalizedSource = source.toLowerCase().replace(/\/$/, '').replace(/^https?:\/\//, '');
      
      return normalizedEntrySource === normalizedSource;
    });
  }
  
  // For file sources, match by filename
  if (source.includes('file-')) {
    return history.find(entry => entry.source === source);
  }
  
  return undefined;
};
