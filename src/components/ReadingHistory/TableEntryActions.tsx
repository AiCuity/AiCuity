import { Button } from "@/components/ui/button";
import { TrashIcon, PlayCircle, Loader2 } from "lucide-react";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";

interface TableEntryActionsProps {
  item: ReadingHistoryEntry;
  onDeleteClick: (id: string) => void;
  onContinueReading: (item: ReadingHistoryEntry) => void;
  loadingContentId: string | null;
}

const TableEntryActions = ({ 
  item, 
  onDeleteClick, 
  onContinueReading,
  loadingContentId 
}: TableEntryActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onContinueReading(item)}
        disabled={loadingContentId === item.content_id}
        className="min-w-[80px] h-8 text-xs sm:text-sm"
      >
        {loadingContentId === item.content_id ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Loading</span>
            <span className="sm:hidden">...</span>
          </span>
        ) : (
          <>
            <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Continue</span>
            <span className="sm:hidden">Read</span>
          </>
        )}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteClick(item.id)}
        className="h-8 w-8 p-0 sm:w-auto sm:px-3"
        title="Delete entry"
      >
        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
};

export default TableEntryActions;
