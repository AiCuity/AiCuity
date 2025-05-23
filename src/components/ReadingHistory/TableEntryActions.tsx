
import { Button } from "@/components/ui/button";
import { TrashIcon, PlayCircle } from "lucide-react";
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
      >
        {loadingContentId === item.content_id ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading
          </span>
        ) : (
          <>
            <PlayCircle className="h-4 w-4 mr-1" />
            Continue
          </>
        )}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteClick(item.id)}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TableEntryActions;
