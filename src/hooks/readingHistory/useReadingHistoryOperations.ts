
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ReadingHistoryEntry } from './types';
import { findExistingEntry, findExistingEntryBySource } from './operations/findOperations';
import { saveHistoryEntry } from './operations/saveOperations';
import { deleteHistoryEntry } from './operations/deleteOperations';

export function useReadingHistoryOperations(
  history: ReadingHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<ReadingHistoryEntry[]>>,
  refreshHistory: () => Promise<void>
) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Find existing entry for the same content
  const findEntry = (contentId: string): ReadingHistoryEntry | undefined => {
    return findExistingEntry(history, contentId);
  };

  // Find existing entry by source URL
  const findEntryBySource = (source: string | null): ReadingHistoryEntry | undefined => {
    return findExistingEntryBySource(history, source);
  };

  // Save reading history entry
  const saveEntry = async (entry: Omit<ReadingHistoryEntry, 'id' | 'created_at' | 'updated_at'>) => {
    return saveHistoryEntry(entry, history, setHistory, user, toast);
  };

  // Delete reading history entry
  const deleteEntry = async (id: string) => {
    return deleteHistoryEntry(id, user, setHistory, refreshHistory, toast);
  };

  return {
    saveHistoryEntry: saveEntry,
    deleteHistoryEntry: deleteEntry,
    findExistingEntry: findEntry,
    findExistingEntryBySource: findEntryBySource
  };
}
