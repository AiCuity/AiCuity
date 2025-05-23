
import { useState, useEffect } from "react";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import ReadingHistoryTable from "./ReadingHistory/ReadingHistoryTable";
import DeleteConfirmationDialog from "./ReadingHistory/DeleteConfirmationDialog";
import EmptyState from "./ReadingHistory/EmptyState";
import LoadingState from "./ReadingHistory/LoadingState";
import { calculateProgress } from "./ReadingHistory/utils";

const ReadingHistory = () => {
  const { history, isLoading, deleteHistoryEntry, refreshHistory } = useReadingHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState(history);

  // Update local history when the fetched history changes
  useEffect(() => {
    setLocalHistory(history);
  }, [history]);

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      const success = await deleteHistoryEntry(deletingId);
      if (success) {
        // Update local state immediately to avoid UI flicker
        setLocalHistory(prev => prev.filter(item => item.id !== deletingId));
        // Refresh the history list after successful deletion
        await refreshHistory();
      }
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // Check if there are any entries in the local history
  if (localHistory.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reading History</h2>
      </div>

      <ReadingHistoryTable 
        history={localHistory}
        onDeleteClick={setDeletingId}
        calculateProgress={calculateProgress}
      />

      <DeleteConfirmationDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ReadingHistory;
