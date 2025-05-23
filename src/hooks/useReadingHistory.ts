
import { useState, useEffect } from 'react';
import { ReadingHistoryEntry } from './readingHistory/types';
import { useFetchReadingHistory } from './readingHistory/useFetchReadingHistory';
import { useReadingHistoryOperations } from './readingHistory/useReadingHistoryOperations';

// Re-export the type for backward compatibility
export type { ReadingHistoryEntry };

export function useReadingHistory() {
  // Fetch history using the dedicated hook
  const { history: fetchedHistory, isLoading, refreshHistory } = useFetchReadingHistory();
  
  // Set up local state to manage history updates
  const [history, setHistory] = useState<ReadingHistoryEntry[]>(fetchedHistory);
  
  // Update local state when fetched history changes
  useEffect(() => {
    if (JSON.stringify(history) !== JSON.stringify(fetchedHistory)) {
      setHistory(fetchedHistory);
    }
  }, [fetchedHistory]);
  
  // Get history operations
  const { saveHistoryEntry, deleteHistoryEntry, findExistingEntry, findExistingEntryBySource } = useReadingHistoryOperations(
    history,
    setHistory,
    refreshHistory
  );

  // Return all the necessary data and functions
  return {
    history,
    isLoading,
    saveHistoryEntry,
    deleteHistoryEntry,
    findExistingEntry,
    findExistingEntryBySource,
    refreshHistory,
    fetchHistory: refreshHistory,
  };
}
