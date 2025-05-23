
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
  
  // Only match against URL sources
  if (source.startsWith('http')) {
    return history.find(entry => entry.source === source);
  }
  return undefined;
};
