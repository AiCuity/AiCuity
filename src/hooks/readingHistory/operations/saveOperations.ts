
import { ReadingHistoryEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { debounceSave } from './debounceUtils';

/**
 * Save a reading history entry to Supabase or localStorage
 * This function is the main entry point for saving reading history
 */
export const saveHistoryEntry = async (
  entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>,
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  user: any | null,
  toast: ReturnType<typeof useToast>['toast']
) => {
  // Use debounced save to reduce database writes
  return debounceSave(entry, history, setHistory, user, toast);
};
