
import { useState } from "react";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import ReadingHistoryTable from "./ReadingHistory/ReadingHistoryTable";
import DeleteConfirmationDialog from "./ReadingHistory/DeleteConfirmationDialog";
import EmptyState from "./ReadingHistory/EmptyState";
import LoadingState from "./ReadingHistory/LoadingState";
import { calculateProgress } from "./ReadingHistory/utils";

const ReadingHistory = () => {
  const { history, isLoading, deleteHistoryEntry } = useReadingHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteHistoryEntry(deletingId);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (history.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reading History</h2>
      </div>

      <ReadingHistoryTable 
        history={history}
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
