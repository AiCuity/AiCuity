
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
  
  // Only consider sessions with more than minimum words read
  const hasSignificantProgress = (entry.current_position || 0) >= minWords;
  
  // If it has a summary, it's worth saving regardless of length
  const hasSummary = !!entry.summary;
  
  // If it has a custom title (not the generic "Reading Session"), it's worth saving
  const hasCustomTitle = entry.title && entry.title !== "Reading Session";
  
  return !isGenericSession && (hasSignificantProgress || hasSummary || hasCustomTitle);
};

/**
 * Determines if enough position change has occurred to warrant saving
 */
export const hasSignificantPositionChange = (
  currentPosition: number,
  lastSavedPosition: number,
  minChange: number = 20
): boolean => {
  return Math.abs(currentPosition - lastSavedPosition) >= minChange;
};

/**
 * Determines if enough time has passed since last save
 */
export const hasEnoughTimePassed = (
  lastSaveTime: number,
  minInterval: number = 30000
): boolean => {
  return Date.now() - lastSaveTime >= minInterval;
};
