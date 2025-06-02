import { ReadingHistoryEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToSupabase, saveToLocalStorage } from './saveStrategies';
import { isSignificantSession } from '../utils/sessionUtils';
import { calculateTotalWords } from '../utils/progressUtils';

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
  // Ensure total_words is available - calculate if missing
  if (!entry.total_words && entry.parsed_text) {
    entry.total_words = calculateTotalWords(entry.parsed_text);
    console.log(`Calculated missing total_words: ${entry.total_words} for entry: ${entry.title}`);
  }

  // Calculate progress percentage for logging and notifications
  const progressPct = calculateProgressPercentage(entry.current_position, entry.total_words || entry.parsed_text);
  console.log(`Saving entry for ${entry.title} at position ${entry.current_position} (${progressPct}%) with total_words: ${entry.total_words}`);
  
  if (user) {
    return saveToSupabase(entry, history, setHistory, user, toast);
  } else {
    return saveToLocalStorage(entry, history, setHistory, toast);
  }
};

/**
 * Calculate progress percentage
 */
const calculateProgressPercentage = (currentPosition: number, totalWordsOrText: number | string | null): number => {
  if (!totalWordsOrText) return 0;
  
  let totalWords: number;
  
  if (typeof totalWordsOrText === 'number') {
    totalWords = totalWordsOrText;
  } else if (typeof totalWordsOrText === 'string') {
    totalWords = totalWordsOrText.split(/\s+/).filter(word => word.length > 0).length;
  } else {
    return 0;
  }
    
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
  // Check if this is from a "continue reading" scenario
  const isExistingContent = sessionStorage.getItem('isExistingContent') === 'true';
  if (isExistingContent) {
    console.log("Skipping debounced save for existing content (continue reading)");
    return null;
  }

  // Check if this is a significant session worth saving
  if (!isSignificantSession(entry)) {
    console.log("Skipping save for short or generic reading session");
    return null;
  }
  
  // Additional check for very short content without meaningful titles
  if (entry.title === "Reading Session" && (!entry.parsed_text || entry.parsed_text.length < 500)) {
    console.log("Skipping save for generic session with insufficient content");
    return null;
  }
  
  // Use content_id as the key for batching saves
  const key = entry.content_id;
  
  // Check if we already have a pending save for this content_id
  const existingPendingSave = pendingSaves.get(key);
  if (existingPendingSave) {
    console.log(`Updating existing pending save for content_id: ${key}`);
    // Preserve total_words from the existing save if the new entry doesn't have it
    if (!entry.total_words && existingPendingSave.total_words) {
      entry.total_words = existingPendingSave.total_words;
      console.log(`Preserved total_words: ${entry.total_words} from existing pending save`);
    }
  }
  
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
