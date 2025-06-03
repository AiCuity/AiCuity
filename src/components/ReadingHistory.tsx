import { useState, useEffect, useMemo } from "react";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import ReadingHistoryTable from "./ReadingHistory/ReadingHistoryTable";
import DeleteConfirmationDialog from "./ReadingHistory/DeleteConfirmationDialog";
import EmptyState from "./ReadingHistory/EmptyState";
import LoadingState from "./ReadingHistory/LoadingState";
import CleanupButton from "./ReadingHistory/CleanupButton";
import { calculateProgress } from "@/hooks/readingHistory/utils/progressUtils";
import { Button } from "./ui/button";

const ITEMS_PER_PAGE = 10;

const ReadingHistory = () => {
  const { history, isLoading, deleteHistoryEntry, refreshHistory } = useReadingHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  // Use memo for local history to prevent unnecessary re-renders
  const localHistory = useMemo(() => history, [history]);
  
  // Calculate total pages based on history length
  const totalPages = Math.max(1, Math.ceil(localHistory.length / ITEMS_PER_PAGE));
  
  // Get paginated history items
  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return localHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [localHistory, page]);
  
  // Reset to first page when history changes
  useEffect(() => {
    setPage(1);
  }, [history.length]);

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteHistoryEntry(deletingId);
      setDeletingId(null);
      // Refresh the history list after successful deletion
      await refreshHistory();
    }
  };

  const handleCleanupComplete = async () => {
    // Refresh the history list after cleanup
    await refreshHistory();
  };

  // Precompute progress for displayed items only using the new progress calculation
  const progressValues = useMemo(() => {
    const values: Record<string, number> = {};
    paginatedHistory.forEach(entry => {
      values[entry.id] = calculateProgress(entry);
    });
    return values;
  }, [paginatedHistory]);

  if (isLoading) {
    return <LoadingState />;
  }

  // Check if there are any entries in the history
  if (localHistory.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Reading History</h2>
        <CleanupButton onCleanupComplete={handleCleanupComplete} />
      </div>

      <ReadingHistoryTable 
        history={paginatedHistory}
        onDeleteClick={setDeletingId}
        progressValues={progressValues}
      />
      
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center mt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="min-w-[80px]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="min-w-[80px]"
            >
              Next
            </Button>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      <DeleteConfirmationDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ReadingHistory;
