
import { ReadingHistoryEntry } from '../types';

/**
 * Determines if a reading session is significant enough to save
 */
export const isSignificantSession = (
  entry: Partial<ReadingHistoryEntry>, 
  minWords: number = 20
): boolean => {
  // Don't save if this is a short reading session with no summary and a generic title
  const isGenericSession = entry.title === "Reading Session" && !entry.summary && entry.current_position < minWords;
  return !isGenericSession;
};
