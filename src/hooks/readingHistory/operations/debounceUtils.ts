
import { ReadingHistoryEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToSupabase, saveToLocalStorage } from './saveStrategies';
import { isSignificantSession } from '../utils/sessionUtils';

/**
 * Batch interval for saving operations in milliseconds
 */
export const BATCH_SAVE_INTERVAL = 3000; // 3 seconds
const batchSaveTimers = new Map<string, NodeJS.Timeout>();
const pendingSaves = new Map<string, Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>>();

/**
 * The actual save implementation that gets called after debouncing
 */
export const actualSaveHistoryEntry = async (
  entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>,
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  user: any | null,
  toast: ReturnType<typeof useToast>['toast']
) => {
  // Calculate progress percentage for logging and notifications
  const progressPct = calculateProgressPercentage(entry.current_position, entry.parsed_text);
  console.log(`Saving entry for ${entry.title} at position ${entry.current_position} (${progressPct}%)`);
  
  if (user) {
    return saveToSupabase(entry, history, setHistory, user, toast);
  } else {
    return saveToLocalStorage(entry, history, setHistory, toast);
  }
};

/**
 * Calculate progress percentage
 */
const calculateProgressPercentage = (currentPosition: number, text: string | null): number => {
  if (!text) return 0;
  
  const totalWords = typeof text === 'string' 
    ? text.split(/\s+/).filter(word => word.length > 0).length 
    : 0;
    
  if (totalWords === 0) return 0;
  return Math.min(Math.round((currentPosition / totalWords) * 100), 100);
};

/**
 * Debounced save - collects multiple save operations within a time window 
 * and only performs the latest one
 */
export const debounceSave = (
  entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>,
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  user: any | null,
  toast: ReturnType<typeof useToast>['toast']
) => {
  // Check if this is a significant session worth saving
  if (!isSignificantSession(entry)) {
    console.log("Skipping save for short generic reading session");
    return null;
  }
  
  // Use content_id as the key for batching saves
  const key = entry.content_id;
  
  // Clear any existing timer for this content_id
  if (batchSaveTimers.has(key)) {
    clearTimeout(batchSaveTimers.get(key));
  }
  
  // Store the latest entry data
  pendingSaves.set(key, entry);
  
  // Set up a new timer
  const timerId = setTimeout(() => {
    // Get the latest entry data
    const latestEntry = pendingSaves.get(key);
    if (latestEntry) {
      // Perform the actual save
      actualSaveHistoryEntry(latestEntry, history, setHistory, user, toast);
      // Clear the pending save
      pendingSaves.delete(key);
    }
    // Clear the timer reference
    batchSaveTimers.delete(key);
  }, BATCH_SAVE_INTERVAL);
  
  // Store the timer reference
  batchSaveTimers.set(key, timerId);
};
