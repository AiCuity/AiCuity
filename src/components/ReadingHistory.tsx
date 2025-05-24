
import { useState, useEffect, useMemo } from "react";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import ReadingHistoryTable from "./ReadingHistory/ReadingHistoryTable";
import DeleteConfirmationDialog from "./ReadingHistory/DeleteConfirmationDialog";
import EmptyState from "./ReadingHistory/EmptyState";
import LoadingState from "./ReadingHistory/LoadingState";
import CleanupButton from "./ReadingHistory/CleanupButton";
import { calculateProgress } from "./ReadingHistory/utils";
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

  // Precompute progress for displayed items only
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reading History</h2>
        <CleanupButton onCleanupComplete={handleCleanupComplete} />
      </div>

      <ReadingHistoryTable 
        history={paginatedHistory}
        onDeleteClick={setDeletingId}
        progressValues={progressValues}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-2 py-1">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
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
